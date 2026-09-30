/**
 * Content views: list, columns, and gallery, plus the preview pane and the
 * shared row pieces they compose.
 *
 * Rows follow the ARIA listbox pattern rather than the `button`-in-`button`
 * nesting the selection circle would otherwise force: the container is a
 * `listbox`, each row is a focusable `option` with a roving tab stop, and the
 * circle is the row's own button. Arrow/Home/End move focus; Enter and Space
 * toggle the row.
 */
import { useRef } from 'react'
import type { KeyboardEvent, ReactNode } from 'react'
import type { PickerItem } from '../../shared/protocol.ts'
import { useEndReached } from './scroll.ts'
import type { WecomPickerKey } from '../locales.ts'
import {
  fileIconKey, formatBytes, formatDate, itemKey, itemSize, locationLabel, sameItem, typeLabel,
  type WecomColumns, type WecomSortKey, type WecomViewPreferences,
} from './model.ts'
import { IconCheck, IconChevronRight, IconSortArrow } from '../assets/UiIcons.tsx'
import { WedocsFileIcon } from '../assets/WedocsFileIcons.tsx'

/** Locale lookup owned by the window. */
type T = (key: WecomPickerKey) => string

/** Props every content view shares. */
interface ViewProps {
  readonly selected: readonly PickerItem[]
  readonly focused: PickerItem | undefined
  readonly onFocus: (item: PickerItem) => void
  readonly onToggle: (item: PickerItem) => void
  readonly t: T
}

/** Paging state one scrollable view renders at its end. */
interface PagingProps {
  /** Another page exists. */
  readonly hasMore: boolean
  /** The next page is in flight. */
  readonly loadingMore: boolean
  /** Request the next page. */
  readonly onEndReached: () => void
}

/** Sentinel that triggers paging and shows a pulse while the page is loading. */
function EndSentinel({ hasMore, loadingMore, onEndReached }: PagingProps) {
  const sentinel = useRef<HTMLDivElement>(null)
  useEndReached(sentinel, hasMore && !loadingMore, onEndReached)
  if (!hasMore) return null
  return (
    <div className="wcp-sentinel" ref={sentinel} aria-hidden="true">
      {loadingMore ? <span className="wcp-sentinel__pulse" /> : null}
    </div>
  )
}

/** The entry's WeDocs file-type glyph, at the requested square size. */
export function Glyph({ item, size = 18 }: { readonly item: PickerItem; readonly size?: number }) {
  return (
    <span className="wcp-glyph">
      <WedocsFileIcon iconKey={fileIconKey(item)} size={size} />
    </span>
  )
}

/** Row-leading selection circle; the row itself toggles too. */
function SelectionToggle({ item, checked, onToggle, t }: {
  readonly item: PickerItem
  readonly checked: boolean
  readonly onToggle: (item: PickerItem) => void
  readonly t: T
}) {
  return (
    <button
      type="button"
      className="wcp-toggle"
      aria-pressed={checked}
      aria-label={`${checked ? t('row.remove') : t('row.add')}：${item.name}`}
      onClick={(event) => { event.stopPropagation(); onToggle(item) }}
    >
      {checked ? <IconCheck /> : null}
    </button>
  )
}

/** Enter/Space activation for a row that is not a `<button>`. */
function rowKeyDown(event: KeyboardEvent<HTMLElement>, item: PickerItem, onToggle: (item: PickerItem) => void): void {
  if (event.key !== 'Enter' && event.key !== ' ') return
  // The dialog treats Enter as "insert"; a row owns its own activation.
  event.preventDefault()
  event.stopPropagation()
  onToggle(item)
}

/** Roving focus across one list's rows. */
function listKeyDown(event: KeyboardEvent<HTMLElement>): void {
  const step = event.key === 'ArrowDown' ? 1 : event.key === 'ArrowUp' ? -1 : 0
  const edge = event.key === 'Home' ? 0 : event.key === 'End' ? -1 : undefined
  if (step === 0 && edge === undefined) return
  const rows = [...event.currentTarget.querySelectorAll<HTMLElement>('[data-wcp-row]')]
  if (rows.length === 0) return
  const current = (event.target as HTMLElement).closest<HTMLElement>('[data-wcp-row]')
  const at = current === null ? -1 : rows.indexOf(current)
  const next = edge === undefined ? rows[at + step] : edge === 0 ? rows[0] : rows[rows.length - 1]
  if (next === undefined) return
  event.preventDefault()
  next.focus()
}

/** Column view: locations → folders → items → preview. */
export function ColumnsView({
  columns, spaceId, folderId, onSpace, onFolder, selected, focused, onFocus, onToggle,
  hasMore, loadingMore, onEndReached, t,
}: ViewProps & PagingProps & {
  readonly columns: WecomColumns
  readonly spaceId: string | undefined
  readonly folderId: string | undefined
  readonly onSpace: (id: string) => void
  readonly onFolder: (id: string) => void
}) {
  const focusedKey = focused === undefined ? undefined : itemKey(focused)
  // A level earns its pane only when it actually branches; a lone folder under
  // the selected location would otherwise take width away from the items.
  const showFolders = columns.folders.length > 1
  return (
    <div className="wcp-columns">
      {columns.spaces.length > 1
        ? (
          <Pane title={t('column.spaces')} label={t('column.spaces')} onKeyDown={listKeyDown}>
            {columns.spaces.map(entry => (
              <PaneEntry
                key={entry.id}
                label={entry.label}
                count={entry.count}
                active={entry.id === spaceId}
                onSelect={() => { onSpace(entry.id) }}
              />
            ))}
          </Pane>
        )
        : null}
      {showFolders
        ? (
          <Pane title={t('column.folders')} label={t('column.folders')} onKeyDown={listKeyDown}>
            {columns.folders.map(entry => (
              <PaneEntry
                key={entry.id}
                label={entry.label}
                count={entry.count}
                active={entry.id === folderId}
                onSelect={() => { onFolder(entry.id) }}
              />
            ))}
          </Pane>
        )
        : null}
      <Pane title={t('column.items')} label={t('column.items')} onKeyDown={listKeyDown}>
        {columns.items.map(item => {
          const checked = selected.some(entry => sameItem(entry, item))
          return (
            <div
              key={itemKey(item)}
              className="wcp-pane__item"
              role="option"
              data-wcp-row
              aria-selected={checked}
              tabIndex={itemKey(item) === focusedKey ? 0 : -1}
              onFocus={() => { onFocus(item) }}
              onClick={() => { onToggle(item) }}
              onKeyDown={event => { rowKeyDown(event, item, onToggle) }}
            >
              <SelectionToggle item={item} checked={checked} onToggle={onToggle} t={t} />
              <Glyph item={item} />
              <span className="wcp-pane__label">{item.name}</span>
            </div>
          )
        })}
        <EndSentinel hasMore={hasMore} loadingMore={loadingMore} onEndReached={onEndReached} />
      </Pane>
      <PreviewPane item={focused} t={t} />
    </div>
  )
}

/** One column-view pane with its caption. */
function Pane({ title, label, onKeyDown, children }: {
  readonly title: string
  readonly label: string
  readonly onKeyDown: (event: KeyboardEvent<HTMLElement>) => void
  readonly children: ReactNode
}) {
  return (
    <div className="wcp-pane">
      <div className="wcp-pane__head">{title}</div>
      <div
        className="wcp-pane__list"
        role="listbox"
        aria-label={label}
        onKeyDown={onKeyDown}
      >
        {children}
      </div>
    </div>
  )
}

/** One navigating entry in the location/folder panes. */
function PaneEntry({ label, count, active, onSelect }: {
  readonly label: string
  readonly count: number
  readonly active: boolean
  readonly onSelect: () => void
}) {
  return (
    <div
      className="wcp-pane__item"
      role="option"
      data-wcp-row
      aria-selected={active}
      aria-current={active}
      tabIndex={-1}
      onClick={onSelect}
      onKeyDown={(event) => {
        if (event.key !== 'Enter' && event.key !== ' ') return
        event.preventDefault()
        event.stopPropagation()
        onSelect()
      }}
    >
      <IconChevronRight />
      <span className="wcp-pane__label wcp-ellipsis">{label}</span>
      <span className="wcp-pane__count wcp-num">{count}</span>
    </div>
  )
}

/** List view with a sortable header row. */
export function ListView({
  items, selected, focused, onFocus, onToggle, preferences, onSort, hasMore, loadingMore, onEndReached, t,
}: ViewProps & PagingProps & {
  readonly items: readonly PickerItem[]
  readonly preferences: WecomViewPreferences
  readonly onSort: (key: WecomSortKey) => void
}) {
  const focusedKey = focused === undefined ? undefined : itemKey(focused)
  const direction = preferences.sortDirection === 'asc' ? 'sort.ascending' : 'sort.descending'
  const headers: readonly { key: WecomSortKey; className: string; labelKey: WecomPickerKey }[] = [
    { key: 'name', className: 'wcp-col--name', labelKey: 'sort.name' },
    { key: 'kind', className: 'wcp-col--kind', labelKey: 'sort.kind' },
    { key: 'updatedAt', className: 'wcp-col--modified', labelKey: 'sort.updatedAt' },
    { key: 'size', className: 'wcp-col--size', labelKey: 'sort.size' },
    { key: 'location', className: 'wcp-col--place', labelKey: 'sort.location' },
  ]
  return (
    <div className="wcp-list">
      <div className="wcp-list__head">
        <span className="wcp-col wcp-col--toggle" />
        {headers.map(({ key, className, labelKey }) => {
          const active = preferences.sortKey === key
          return (
            <button
              key={key}
              type="button"
              className={`wcp-col ${className}`}
              aria-label={active ? `${t(labelKey)}：${t(direction)}` : t(labelKey)}
              onClick={() => { onSort(key) }}
            >
              <span className="wcp-ellipsis">{t(labelKey)}</span>
              {active ? <IconSortArrow direction={preferences.sortDirection} size={12} /> : null}
            </button>
          )
        })}
      </div>
      <div
        className="wcp-scroll"
        role="listbox"
        aria-multiselectable="true"
        aria-label={t('panel.title')}
        onKeyDown={listKeyDown}
      >
        {items.map(item => {
          const checked = selected.some(entry => sameItem(entry, item))
          return (
            <div
              key={itemKey(item)}
              className="wcp-row"
              role="option"
              data-wcp-row
              aria-selected={checked}
              tabIndex={itemKey(item) === focusedKey ? 0 : -1}
              onFocus={() => { onFocus(item) }}
              onClick={() => { onToggle(item) }}
              onKeyDown={event => { rowKeyDown(event, item, onToggle) }}
            >
              <span className="wcp-row__cell wcp-col--toggle">
                <SelectionToggle item={item} checked={checked} onToggle={onToggle} t={t} />
              </span>
              <span className="wcp-row__cell wcp-col wcp-col--name">
                <Glyph item={item} />
                <span className="wcp-ellipsis wcp-row__name">{item.name}</span>
              </span>
              <span className="wcp-row__cell wcp-col wcp-col--kind wcp-row__sub wcp-ellipsis">{typeLabel(item, t)}</span>
              <span className="wcp-row__cell wcp-col wcp-col--modified wcp-row__sub wcp-num">{formatDate(item.updatedAt)}</span>
              <span className="wcp-row__cell wcp-col wcp-col--size wcp-row__sub wcp-num">{formatBytes(itemSize(item))}</span>
              <span className="wcp-row__cell wcp-col wcp-col--place wcp-row__sub wcp-ellipsis">{locationLabel(item)}</span>
            </div>
          )
        })}
        <EndSentinel hasMore={hasMore} loadingMore={loadingMore} onEndReached={onEndReached} />
      </div>
    </div>
  )
}

/** Gallery view: one large stage over a horizontal filmstrip. */
export function GalleryView({
  items, selected, focused, onFocus, onToggle, hasMore, loadingMore, onEndReached, t,
}: ViewProps & PagingProps & {
  readonly items: readonly PickerItem[]
}) {
  const stage = focused ?? items[0]
  const focusedKey = stage === undefined ? undefined : itemKey(stage)
  const stageChecked = stage !== undefined && selected.some(entry => sameItem(entry, stage))
  return (
    <div className="wcp-gallery">
      <div className="wcp-gallery__stage">
        {stage === undefined
          ? null
          : (
            <>
              <div className="wcp-gallery__glyph"><Glyph item={stage} size={64} /></div>
              <div className="wcp-gallery__name">{stage.name}</div>
              <div className="wcp-gallery__meta">
                {[typeLabel(stage, t), locationLabel(stage), formatDate(stage.updatedAt), formatBytes(itemSize(stage))]
                  .filter(part => part !== '' && part !== '—')
                  .join(' · ')}
              </div>
              <button
                type="button"
                className={stageChecked ? 'wcp-btn' : 'wcp-btn wcp-btn--primary'}
                aria-pressed={stageChecked}
                onClick={() => { onToggle(stage) }}
              >
                {stageChecked ? t('row.remove') : t('row.add')}
              </button>
            </>
          )}
      </div>
      <div
        className="wcp-filmstrip"
        role="listbox"
        aria-multiselectable="true"
        aria-orientation="horizontal"
        aria-label={t('column.items')}
        onKeyDown={listKeyDown}
      >
        {items.map(item => {
          const checked = selected.some(entry => sameItem(entry, item))
          const key = itemKey(item)
          return (
            <div
              key={key}
              className="wcp-thumb"
              role="option"
              data-wcp-row
              aria-selected={checked}
              aria-current={key === focusedKey}
              tabIndex={key === focusedKey ? 0 : -1}
              onFocus={() => { onFocus(item) }}
              onClick={() => { onFocus(item); onToggle(item) }}
              onKeyDown={event => { rowKeyDown(event, item, onToggle) }}
            >
              <Glyph item={item} size={24} />
              <span className="wcp-thumb__label">{item.name}</span>
              {checked ? <span className="wcp-thumb__badge"><IconCheck size={10} /></span> : null}
            </div>
          )
        })}
        <EndSentinel hasMore={hasMore} loadingMore={loadingMore} onEndReached={onEndReached} />
      </div>
    </div>
  )
}

/** Column view's trailing pane: everything known about the focused entry. */
export function PreviewPane({ item, t }: { readonly item: PickerItem | undefined; readonly t: T }) {
  return (
    <div className="wcp-pane wcp-pane--preview">
      <div className="wcp-pane__head">{t('column.preview')}</div>
      <div className="wcp-scroll">
        {item === undefined
          ? (
            <div className="wcp-state">
              <div className="wcp-state__title">{t('preview.emptyTitle')}</div>
              <p className="wcp-state__hint">{t('preview.emptyHint')}</p>
            </div>
          )
          : (
            <div className="wcp-preview">
              <div className="wcp-preview__stage"><Glyph item={item} size={40} /></div>
              <div className="wcp-preview__name">{item.name}</div>
              <div className="wcp-preview__kind">{typeLabel(item, t)}</div>
              <dl className="wcp-preview__rows">
                <PreviewRow label={t('preview.size')} value={formatBytes(itemSize(item))} />
                <PreviewRow label={t('preview.modified')} value={formatDate(item.updatedAt)} />
                <PreviewRow label={t('preview.location')} value={locationLabel(item) === '' ? '—' : locationLabel(item)} />
                <PreviewRow label={t('preview.identifier')} value={item.id} />
              </dl>
              {item.url === undefined
                ? null
                : <a className="wcp-link" href={item.url} target="_blank" rel="noreferrer">{t('preview.open')}</a>}
            </div>
          )}
      </div>
    </div>
  )
}

/** One definition row in the preview pane. */
function PreviewRow({ label, value }: { readonly label: string; readonly value: string }) {
  return (
    <div className="wcp-def">
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  )
}
