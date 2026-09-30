/**
 * Finder-style unified toolbar: view switcher, sort control, search field, and
 * the window's close button. The sort control is a menu, so it owns its own
 * dismissal (outside click and Escape) without reaching into the window.
 */
import { useEffect, useRef, useState } from 'react'
import type { ReactNode, RefObject } from 'react'
import type { WecomPickerKey } from '../locales.ts'
import {
  SORT_OPTIONS, VIEW_OPTIONS,
  type WecomSortDirection, type WecomSortKey, type WecomViewMode,
} from './model.ts'
import {
  IconCheck, IconChevronDown, IconClose, IconSearch, IconSort, IconViewColumns, IconViewGallery, IconViewList,
} from '../assets/UiIcons.tsx'

/** Locale lookup owned by the window. */
type T = (key: WecomPickerKey) => string

/** View mode to its toolbar glyph. */
const VIEW_ICONS: Readonly<Record<WecomViewMode, () => ReactNode>> = {
  list: () => <IconViewList />,
  columns: () => <IconViewColumns />,
  gallery: () => <IconViewGallery />,
}

/** Everything the toolbar reads and writes. */
export interface PickerToolbarProps {
  readonly query: string
  readonly onQuery: (value: string) => void
  readonly view: WecomViewMode
  readonly onView: (view: WecomViewMode) => void
  readonly sortKey: WecomSortKey
  readonly sortDirection: WecomSortDirection
  readonly onSortKey: (key: WecomSortKey) => void
  readonly onSortDirection: (direction: WecomSortDirection) => void
  readonly onClose: () => void
  readonly searchRef: RefObject<HTMLInputElement | null>
  readonly t: T
}

/** Unified toolbar. */
export function PickerToolbar({
  query, onQuery, view, onView, sortKey, sortDirection, onSortKey, onSortDirection, onClose, searchRef, t,
}: PickerToolbarProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const anchor = useRef<HTMLDivElement>(null)
  const sortLabel = SORT_OPTIONS.find(option => option.id === sortKey)

  // A menu is a transient layer: dismiss it on any click outside and on Escape.
  useEffect(() => {
    if (!menuOpen) return
    const onPointerDown = (event: MouseEvent): void => {
      if (anchor.current !== null && !anchor.current.contains(event.target as Node)) setMenuOpen(false)
    }
    const onKeyDown = (event: globalThis.KeyboardEvent): void => {
      if (event.key !== 'Escape') return
      event.stopPropagation()
      setMenuOpen(false)
    }
    document.addEventListener('mousedown', onPointerDown)
    document.addEventListener('keydown', onKeyDown, true)
    return () => {
      document.removeEventListener('mousedown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown, true)
    }
  }, [menuOpen])

  /** Apply one direction and dismiss the menu, matching Finder. */
  const chooseDirection = (direction: WecomSortDirection): void => { onSortDirection(direction) }

  return (
    <div className="wcp-toolbar">
      <span className="wcp-title">{t('panel.title')}</span>
      <div className="wcp-segmented" role="group" aria-label={t('view.label')}>
        {VIEW_OPTIONS.map(option => (
          <button
            key={option.id}
            type="button"
            aria-pressed={view === option.id}
            aria-label={t(option.labelKey)}
            title={t(option.labelKey)}
            onClick={() => { onView(option.id) }}
          >
            {VIEW_ICONS[option.id]()}
          </button>
        ))}
      </div>
      <div className="wcp-menu-anchor" ref={anchor}>
        <button
          type="button"
          className="wcp-iconbtn wcp-iconbtn--wide"
          aria-haspopup="menu"
          aria-expanded={menuOpen}
          aria-label={`${t('sort.label')}：${t(sortLabel?.labelKey ?? 'sort.name')}`}
          onClick={() => { setMenuOpen(open => !open) }}
        >
          <IconSort />
          <span className="wcp-toolbar__label">{t(sortLabel?.labelKey ?? 'sort.name')}</span>
          <IconChevronDown size={12} />
        </button>
        {menuOpen
          ? (
            <div className="wcp-menu" role="menu">
              {SORT_OPTIONS.map(option => (
                <button
                  key={option.id}
                  type="button"
                  role="menuitemradio"
                  className="wcp-menu__item"
                  aria-checked={sortKey === option.id}
                  onClick={() => { onSortKey(option.id); setMenuOpen(false) }}
                >
                  <span className="wcp-menu__check">{sortKey === option.id ? <IconCheck /> : null}</span>
                  {t(option.labelKey)}
                </button>
              ))}
              <div className="wcp-menu__sep" role="separator" />
              {(['asc', 'desc'] as const).map(direction => (
                <button
                  key={direction}
                  type="button"
                  role="menuitemradio"
                  className="wcp-menu__item"
                  aria-checked={sortDirection === direction}
                  onClick={() => { chooseDirection(direction); setMenuOpen(false) }}
                >
                  <span className="wcp-menu__check">{sortDirection === direction ? <IconCheck /> : null}</span>
                  {t(direction === 'asc' ? 'sort.ascending' : 'sort.descending')}
                </button>
              ))}
            </div>
          )
          : null}
      </div>
      <span className="wcp-spacer" />
      <div className="wcp-search">
        <span className="wcp-search__icon"><IconSearch /></span>
        <input
          ref={searchRef}
          type="search"
          value={query}
          aria-label={t('search.label')}
          placeholder={t('search.placeholder')}
          onChange={(event) => { onQuery(event.target.value) }}
        />
        {query === ''
          ? null
          : (
            <button
              type="button"
              className="wcp-search__clear"
              aria-label={t('search.clear')}
              onClick={() => { onQuery(''); searchRef.current?.focus() }}
            >
              <IconClose size={12} />
            </button>
          )}
      </div>
      <button type="button" className="wcp-iconbtn" aria-label={t('panel.close')} title={t('panel.close')} onClick={onClose}>
        <IconClose />
      </button>
    </div>
  )
}
