/**
 * The picker window: data loading, selection, browsing preferences, keyboard
 * behavior, and the Finder-style chrome around one of the three views.
 *
 * App concerns stay outside: the window reports the confirmed selection and the
 * close request; the slot component owns chip insertion.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { KeyboardEvent as ReactKeyboardEvent } from 'react'
import { PICKER_MAX_SELECTION, type PickerAuthState, type PickerBlockCode, type PickerItem } from '../../shared/protocol.ts'
import type { WecomPickerKey } from '../locales.ts'
import { PICKER_STYLE } from '../glass.ts'
import {
  groupColumns, itemKey, loadPreferences, sameItem, savePreferences, sortItems,
  type WecomSortDirection, type WecomSortKey, type WecomViewMode, type WecomViewPreferences,
} from './model.ts'
import { fetchPickerFiles, fetchPickerStatus, startPickerAuth } from './api.ts'
import { pollsAuth } from './auth.ts'
import { BlockedView, EmptyState, LoadingRows } from './States.tsx'
import { PickerToolbar } from './Toolbar.tsx'
import { ColumnsView, GalleryView, ListView } from './Views.tsx'
import { useWindowDrag } from '../window-drag.ts'

/** Locale lookup owned by the slot component. */
type T = (key: WecomPickerKey) => string

/** One refusal, as the host reported it. */
interface Block {
  readonly code: PickerBlockCode
  readonly message: string
}

/** Poll cadence while the CLI waits for a scan. */
const AUTH_POLL_MS = 2_500

/** QR refresh cadence; an expired code must not stay on screen, and a restarted
 * login may not have written its image yet when the URL is first requested. */
const QR_REFRESH_MS = 5_000

/** Search debounce, so typing does not spawn one CLI call per keystroke. */
const SEARCH_DEBOUNCE_MS = 250

/** Default direction per facet: names read up, dates and sizes read down. */
const DEFAULT_DIRECTION: Readonly<Record<WecomSortKey, WecomSortDirection>> = {
  name: 'asc',
  kind: 'asc',
  location: 'asc',
  updatedAt: 'desc',
  size: 'desc',
}

/** Everything the window needs from its host. */
export interface PickerWindowProps {
  readonly onConfirm: (files: readonly PickerItem[]) => void
  readonly onClose: () => void
  /**
   * Leave for the official selector. `missing` reports that no CLI exists at
   * all, which is the one case the launcher must not offer a way back from.
   */
  readonly onUseIframe: (missing: boolean) => void
  readonly t: T
}

/** Finder-style WeDrive picker window. */
export function PickerWindow({ onConfirm, onClose, onUseIframe, t }: PickerWindowProps) {
  const dialog = useRef<HTMLDivElement>(null)
  const search = useRef<HTMLInputElement>(null)
  // The window opens centered but is not pinned there: its chrome drags it.
  const drag = useWindowDrag(dialog)
  const [preferences, setPreferences] = useState<WecomViewPreferences>(loadPreferences)
  const [query, setQuery] = useState('')
  const [items, setItems] = useState<readonly PickerItem[]>([])
  const [cursor, setCursor] = useState<string | undefined>(undefined)
  const [hasMore, setHasMore] = useState(false)
  const [busy, setBusy] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [block, setBlock] = useState<Block | undefined>(undefined)
  const [auth, setAuth] = useState<PickerAuthState>({ phase: 'idle' })
  const [qrStamp, setQrStamp] = useState(0)
  const [selected, setSelected] = useState<readonly PickerItem[]>([])
  const [focused, setFocused] = useState<PickerItem | undefined>(undefined)
  const [space, setSpace] = useState<string | undefined>(undefined)
  const [folder, setFolder] = useState<string | undefined>(undefined)
  const [notice, setNotice] = useState('')

  useEffect(() => { savePreferences(preferences) }, [preferences])

  useEffect(() => { dialog.current?.focus() }, [])

  /** One page request at a time: the sentinel can fire twice within a tick. */
  const paging = useRef(false)

  /** Replace the result set, keeping focus on a still-present entry. */
  const applyItems = useCallback((next: readonly PickerItem[]) => {
    setItems(next)
    setFocused(previous => previous !== undefined && next.some(item => sameItem(item, previous)) ? previous : next[0])
  }, [])

  /** First page for the current query; the window's one refresh path. */
  const refresh = useCallback(async (signal: AbortSignal) => {
    setBusy(true)
    try {
      const response = await fetchPickerFiles({ query, signal })
      if (signal.aborted) return
      if (response.ok) {
        applyItems(response.items)
        setCursor(response.nextCursor)
        setHasMore(response.hasMore)
        setBlock(undefined)
        setLoadingMore(false)
        return
      }
      applyItems([])
      setCursor(undefined)
      setHasMore(false)
      // No CLI on this machine: the official selector is the only option left,
      // so hand over instead of showing a dead end.
      if (response.state === 'missing') {
        onUseIframe(true)
        return
      }
      setBlock({ code: response.state, message: response.message })
      if (response.state === 'unauthorized') {
        const status = await fetchPickerStatus(signal).catch(() => undefined)
        if (status !== undefined && !signal.aborted) setAuth(status.auth)
      }
    } catch (error) {
      if (!signal.aborted) {
        setBlock({ code: 'error', message: error instanceof Error ? error.message : String(error) })
      }
    } finally {
      if (!signal.aborted) setBusy(false)
    }
  }, [applyItems, onUseIframe, query])

  useEffect(() => {
    const controller = new AbortController()
    const timer = setTimeout(() => { void refresh(controller.signal) }, query.trim() === '' ? 0 : SEARCH_DEBOUNCE_MS)
    return () => { clearTimeout(timer); controller.abort() }
  }, [query, refresh])

  // While the CLI waits for a scan, poll for the authorization it produces.
  const polling = pollsAuth(block?.code, auth)
  useEffect(() => {
    if (!polling) return
    const controller = new AbortController()
    const timer = setInterval(() => {
      void fetchPickerStatus(controller.signal).then((status) => {
        if (controller.signal.aborted) return
        if (status.state === 'authorized') {
          setAuth({ phase: 'idle' })
          setBlock(undefined)
          // Detached: this effect's cleanup runs on the phase change above and
          // must not cancel the refresh the authorization just earned.
          void refresh(new AbortController().signal)
          return
        }
        setAuth(status.auth)
      }).catch(() => undefined)
    }, AUTH_POLL_MS)
    return () => { clearInterval(timer); controller.abort() }
  }, [polling, refresh])

  useEffect(() => {
    if (auth.phase !== 'waiting') return
    const timer = setInterval(() => { setQrStamp(stamp => stamp + 1) }, QR_REFRESH_MS)
    return () => { clearInterval(timer) }
  }, [auth.phase])

  const sorted = useMemo(
    () => sortItems(items, preferences.sortKey, preferences.sortDirection, t),
    [items, preferences.sortKey, preferences.sortDirection, t],
  )
  const columns = useMemo(
    () => groupColumns(items, preferences, t, space, folder),
    [items, preferences, t, space, folder],
  )
  // A stale or missing level resolves to the first available one; mirror the
  // resolved ids back so the panes and their highlight never disagree.
  useEffect(() => { setSpace(columns.spaceId); setFolder(columns.folderId) }, [columns.spaceId, columns.folderId])

  const toggle = useCallback((item: PickerItem) => {
    setFocused(item)
    if (selected.some(entry => sameItem(entry, item))) {
      setSelected(selected.filter(entry => !sameItem(entry, item)))
      setNotice('')
      return
    }
    if (selected.length >= PICKER_MAX_SELECTION) {
      setNotice(t('status.max'))
      return
    }
    setSelected([...selected, item])
    setNotice('')
  }, [selected, t])

  /**
    * Append the next page. A cursor that repeats a page, or a page whose entries
    * are all known already, ends paging instead of spinning on the sentinel.
    */
  const loadMore = useCallback(async () => {
    if (paging.current || cursor === undefined) return
    paging.current = true
    setLoadingMore(true)
    try {
      const response = await fetchPickerFiles({ query, cursor })
      if (!response.ok) {
        setBlock({ code: response.state, message: response.message })
        return
      }
      const known = new Set(items.map(itemKey))
      const added = response.items.filter(item => !known.has(itemKey(item)))
      if (added.length === 0) {
        setHasMore(false)
        return
      }
      applyItems([...items, ...added])
      setCursor(response.nextCursor)
      setHasMore(response.hasMore)
    } catch (error) {
      setNotice(error instanceof Error ? error.message : String(error))
    } finally {
      paging.current = false
      setLoadingMore(false)
    }
  }, [applyItems, cursor, items, query])

  /** Stable callback handed to the views' paging sentinels. */
  const requestMore = useCallback(() => { void loadMore() }, [loadMore])

  /**
   * Start a QR login. `restart` retires the attempt whose QR is on screen, so
   * an expired code or a failed scan is recoverable with the same click.
   */
  const beginAuth = useCallback(async (restart = false) => {
    setAuth({ phase: 'waiting' })
    // Always bump: a new attempt rewrites (or removes) the QR image.
    setQrStamp(stamp => stamp + 1)
    try {
      setAuth(await startPickerAuth(undefined, { restart }))
    } catch (error) {
      setAuth({ phase: 'failed', message: error instanceof Error ? error.message : String(error) })
    }
  }, [])

  /** Re-clicking the active facet flips direction; a new facet takes its default. */
  const chooseSortKey = useCallback((key: WecomSortKey) => {
    setPreferences((previous) => previous.sortKey === key
      ? { ...previous, sortDirection: previous.sortDirection === 'asc' ? 'desc' : 'asc' }
      : { ...previous, sortKey: key, sortDirection: DEFAULT_DIRECTION[key] })
  }, [])

  const chooseView = useCallback((view: WecomViewMode) => {
    setPreferences(previous => ({ ...previous, view }))
  }, [])

  const confirm = useCallback(() => {
    if (selected.length === 0) return
    onConfirm(selected)
  }, [onConfirm, selected])

  /** Dialog-level shortcuts, plus the focus trap a modal owes its user. */
  const onKeyDown = useCallback((event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Escape') {
      event.preventDefault()
      onClose()
      return
    }
    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'f') {
      event.preventDefault()
      search.current?.focus()
      return
    }
    // Enter means "insert" wherever focus sits; searching is live, so it has no
    // other meaning here. It stays a no-op while nothing is selected.
    if (event.key === 'Enter' && selected.length > 0) {
      event.preventDefault()
      confirm()
      return
    }
    if (event.key !== 'Tab') return
    const node = dialog.current
    if (node === null) return
    const focusable = [...node.querySelectorAll<HTMLElement>(
      'button:not([disabled]),input:not([disabled]),a[href],[tabindex]:not([tabindex="-1"])',
    )]
    const first = focusable[0]
    const last = focusable[focusable.length - 1]
    if (first === undefined || last === undefined) return
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault()
      last.focus()
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault()
      first.focus()
    }
  }, [confirm, onClose, selected.length])

  const view = preferences.view
  const content = block !== undefined
    ? (
      <BlockedView
        block={block}
        auth={auth}
        qrStamp={qrStamp}
        t={t}
        onRetry={() => { setBlock(undefined); void refresh(new AbortController().signal) }}
        onAuthorize={(restart) => { void beginAuth(restart) }}
        onUseIframe={() => { onUseIframe(false) }}
      />
    )
    : busy && items.length === 0
      ? <LoadingRows t={t} />
      : sorted.length === 0
        ? <EmptyState query={query} t={t} />
        : view === 'list'
          ? (
            <ListView
              items={sorted}
              selected={selected}
              focused={focused}
              onFocus={setFocused}
              onToggle={toggle}
              preferences={preferences}
              onSort={chooseSortKey}
              hasMore={hasMore}
              loadingMore={loadingMore}
              onEndReached={requestMore}
              t={t}
            />
          )
          : view === 'columns'
            ? (
              <ColumnsView
                columns={columns}
                spaceId={space}
                folderId={folder}
                onSpace={setSpace}
                onFolder={setFolder}
                selected={selected}
                focused={focused}
                onFocus={setFocused}
                onToggle={toggle}
                hasMore={hasMore}
                loadingMore={loadingMore}
                onEndReached={requestMore}
                t={t}
              />
            )
            : (
              <GalleryView
                items={sorted}
                selected={selected}
                focused={focused}
                onFocus={setFocused}
                onToggle={toggle}
                hasMore={hasMore}
                loadingMore={loadingMore}
                onEndReached={requestMore}
                t={t}
              />
            )

  return (
    <>
      <style>{PICKER_STYLE}</style>
      <div className="wcp-overlay" role="presentation">
        <div className="wcp-scrim" aria-hidden="true" onClick={onClose} />
        <div
          className={drag.dragging ? 'wcp-window wcp-window--dragging' : 'wcp-window'}
          role="dialog"
          aria-modal="true"
          aria-label={t('panel.title')}
          tabIndex={-1}
          ref={dialog}
          style={drag.style}
          onKeyDown={onKeyDown}
        >
          <PickerToolbar
            query={query}
            onQuery={setQuery}
            view={view}
            onView={chooseView}
            sortKey={preferences.sortKey}
            sortDirection={preferences.sortDirection}
            onSortKey={chooseSortKey}
            onSortDirection={(direction) => { setPreferences(previous => ({ ...previous, sortDirection: direction })) }}
            onClose={onClose}
            searchRef={search}
            chromeProps={drag.chromeProps}
            handleProps={drag.handleProps}
            t={t}
          />
          <div className="wcp-content">{content}</div>
          <div className="wcp-status">
            <span>
              <span className="wcp-status__strong">{sorted.length}</span>
              {` ${t('status.count')}`}
            </span>
            <span aria-live="polite">
              {`${t('status.selected')} `}
              <span className="wcp-status__strong">{selected.length}</span>
              {`/${String(PICKER_MAX_SELECTION)}`}
            </span>
            {notice === '' ? null : <span className="wcp-status__warn">{notice}</span>}
            {busy ? <span>{t('status.searching')}</span> : null}
            <span className="wcp-spacer" />
            {hasMore && block === undefined
              ? <button type="button" className="wcp-btn wcp-btn--quiet" disabled={busy || loadingMore} onClick={requestMore}>{t('panel.more')}</button>
              : null}
            <button type="button" className="wcp-btn" onClick={onClose}>{t('panel.cancel')}</button>
            <button type="button" className="wcp-btn wcp-btn--primary" disabled={selected.length === 0} onClick={confirm}>
              {t('panel.confirm')}
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
