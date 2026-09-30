/**
 * Pickers model: the view/sort vocabulary, ordering, column grouping, and the
 * formatting the views render. Pure functions only, so the views stay
 * presentational and every rule here is testable without a DOM.
 */
import type { PickerItem } from '../../shared/protocol.ts'
import type { WecomPickerKey } from '../locales.ts'

/** Finder-style browsing modes offered by the toolbar. */
export type WecomViewMode = 'list' | 'columns' | 'gallery'

/** Sortable facets, matching the list view's header cells. */
export type WecomSortKey = 'name' | 'kind' | 'updatedAt' | 'size' | 'location'

/** Sort direction for the active facet. */
export type WecomSortDirection = 'asc' | 'desc'

/** Persisted browsing preferences. */
export interface WecomViewPreferences {
  readonly view: WecomViewMode
  readonly sortKey: WecomSortKey
  readonly sortDirection: WecomSortDirection
}

/** One segmented-control entry. */
export interface WecomViewOption {
  readonly id: WecomViewMode
  readonly labelKey: WecomPickerKey
}

/** One sort-menu entry. */
export interface WecomSortOption {
  readonly id: WecomSortKey
  readonly labelKey: WecomPickerKey
}

/** One selectable level in the column view. */
export interface WecomColumnEntry {
  /** Stable identity of the level (empty string is the unfiled bucket). */
  readonly id: string
  /** Display label. */
  readonly label: string
  /** How many items sit under this level. */
  readonly count: number
}

/** Column view state after resolution against the current result set. */
export interface WecomColumns {
  readonly spaces: readonly WecomColumnEntry[]
  readonly folders: readonly WecomColumnEntry[]
  readonly items: readonly PickerItem[]
  /** Space actually shown, even when the caller's selection went stale. */
  readonly spaceId: string | undefined
  /** Folder actually shown, even when the caller's selection went stale. */
  readonly folderId: string | undefined
}

/** Toolbar view options, in toolbar order. */
export const VIEW_OPTIONS: readonly WecomViewOption[] = [
  { id: 'list', labelKey: 'view.list' },
  { id: 'columns', labelKey: 'view.columns' },
  { id: 'gallery', labelKey: 'view.gallery' },
]

/** Sort-menu options, in Finder's order. */
export const SORT_OPTIONS: readonly WecomSortOption[] = [
  { id: 'name', labelKey: 'sort.name' },
  { id: 'kind', labelKey: 'sort.kind' },
  { id: 'updatedAt', labelKey: 'sort.updatedAt' },
  { id: 'size', labelKey: 'sort.size' },
  { id: 'location', labelKey: 'sort.location' },
]

/** WeDocs file-type glyphs the picker can render (see `assets/WedocsFileIcons.tsx`). */
export type WedocsIconKey =
  | 'tdoc' | 'tsheet' | 'tslide' | 'tsmartsheet' | 'smartdoc' | 'tmindmap' | 'tflowchart'
  | 'tform' | 'treport' | 'tpdf' | 'folder' | 'space'
  | 'localPdf' | 'localWord' | 'localExcel' | 'localPpt' | 'localImage' | 'localVideo'
  | 'localAudio' | 'localZip' | 'localText' | 'localSketch' | 'localOther'

/** CLI type to glyph. Online document types get the 20px document glyphs. */
const TYPE_ICONS: Readonly<Record<string, WedocsIconKey>> = {
  word: 'tdoc',
  sheet: 'tsheet',
  ppt: 'tslide',
  smartsheet: 'tsmartsheet',
  smartpage: 'smartdoc',
  mind: 'tmindmap',
  flow: 'tflowchart',
  collect: 'tform',
  journal: 'treport',
  pdf: 'tpdf',
  folder: 'folder',
  space: 'space',
  offline_word: 'localWord',
  offline_excel: 'localExcel',
  offline_ppt: 'localPpt',
  offline_pdf: 'localPdf',
  image: 'localImage',
  videoaudio: 'localVideo',
  design: 'localSketch',
}

/**
 * Extension fallback for entries the CLI types only as `file`. Ordered most
 * specific first; the first match wins.
 */
const EXTENSION_ICONS: readonly (readonly [RegExp, WedocsIconKey])[] = [
  [/\.(zip|rar|7z|tar|gz|bz2)$/iu, 'localZip'],
  [/\.(png|jpe?g|gif|webp|bmp|heic|heif|tiff?|svg)$/iu, 'localImage'],
  [/\.(mp4|mov|mkv|avi|wmv|flv|webm|m4v)$/iu, 'localVideo'],
  [/\.(mp3|flac|wav|aac|m4a|ape|dsf|dff|ogg|wma)$/iu, 'localAudio'],
  [/\.(docx?|rtf|odt)$/iu, 'localWord'],
  [/\.(xlsx?|csv|ods|numbers)$/iu, 'localExcel'],
  [/\.(pptx?|key|odp)$/iu, 'localPpt'],
  [/\.pdf$/iu, 'localPdf'],
  [/\.(txt|md|markdown|json|ya?ml|log|xml|html?)$/iu, 'localText'],
  [/\.(psd|psb|ai|sketch|fig|xd|afdesign)$/iu, 'localSketch'],
]

/**
 * Glyph for one entry: the CLI's document type first, then the name's
 * extension, then the generic file or folder glyph.
 * @param item - the entry to decorate.
 */
export function fileIconKey(item: Pick<PickerItem, 'type' | 'name' | 'kind'>): WedocsIconKey {
  const byType = item.type === undefined ? undefined : TYPE_ICONS[item.type]
  if (byType !== undefined) return byType
  for (const [pattern, key] of EXTENSION_ICONS) {
    if (pattern.test(item.name)) return key
  }
  return item.kind === 'folder' ? 'folder' : 'localOther'
}

/** Raw CLI type to locale key for a row's kind label. */
const TYPE_KEYS: Readonly<Record<string, WecomPickerKey>> = {
  file: 'type.file',
  folder: 'type.folder',
  space: 'type.space',
  sheet: 'type.sheet',
  word: 'type.word',
  ppt: 'type.ppt',
  smartsheet: 'type.smartsheet',
  smartpage: 'type.smartpage',
  collect: 'type.collect',
  journal: 'type.journal',
  flow: 'type.flow',
  mind: 'type.mind',
}

/** Default browsing mode; column view is the signature, list is the fallback. */
export const DEFAULT_PREFERENCES: WecomViewPreferences = {
  view: 'columns',
  sortKey: 'updatedAt',
  sortDirection: 'desc',
}

/** Storage key for {@link loadPreferences}. */
const STORAGE_KEY = 'wecom-picker/preferences/v1'

/** Locale-aware, numeric-aware name ordering shared by every sort facet. */
const collator = new Intl.Collator(undefined, { numeric: true, sensitivity: 'base' })

/** Kind label for one entry, falling back to the file/folder split. */
export function typeLabel(item: PickerItem, t: (key: WecomPickerKey) => string): string {
  const key = item.type === undefined ? undefined : TYPE_KEYS[item.type]
  if (key !== undefined) return t(key)
  return item.kind === 'folder' ? t('type.folder') : t('type.file')
}

/** Chip identity: a doc id and an entry id may collide across kinds. */
export function itemKey(item: PickerItem): string {
  return `${item.idKind}:${item.id}`
}

/** Whether two entries are the same chip target. */
export function sameItem(left: PickerItem, right: PickerItem): boolean {
  return itemKey(left) === itemKey(right)
}

/** Space bucket of one entry; empty when the CLI withheld the location. */
export function spaceKey(item: PickerItem): string {
  return item.spaceId ?? item.spaceName ?? ''
}

/** Folder bucket of one entry; empty when the CLI withheld the location. */
export function folderKey(item: PickerItem): string {
  return item.folderId ?? item.folderName ?? ''
}

/**
 * Path values the CLI uses when the bot may not read a location. They are
 * sentinel text, not data: showing them would put "no permission to view the
 * path" in every row.
 */
const OPAQUE_PATH = /无权限|not\s+allowed|no\s+permission|permission\s+denied/iu

/** Localized location text: `空间 / 文件夹`, else a usable CLI path. */
export function locationLabel(item: PickerItem): string {
  const parts = [item.spaceName, item.folderName].filter((part): part is string => part !== undefined && part !== '')
  if (parts.length > 0) return parts.join(' / ')
  const path = item.path ?? ''
  return OPAQUE_PATH.test(path) ? '' : path
}

/**
 * Types whose reported byte size is meaningful. Online documents report a
 * payload size that is not a file size (a smart page can claim gigabytes), so
 * their size is withheld rather than shown wrong.
 */
const SIZED_TYPES: ReadonlySet<string> = new Set([
  'file', 'pdf', 'offline_word', 'offline_excel', 'offline_ppt', 'offline_pdf',
  'image', 'videoaudio', 'design',
])

/** Byte size worth showing or sorting on, or `undefined` when unknown/meaningless. */
export function itemSize(item: PickerItem): number | undefined {
  if (item.size === undefined) return undefined
  if (SIZED_TYPES.has(item.type ?? '')) return item.size
  // A plain entry id with no type is an ordinary file the CLI did not classify.
  return item.type === undefined && item.idKind === 'file' && item.kind === 'file' ? item.size : undefined
}

/** Epoch milliseconds of a CLI timestamp (`YYYY-MM-DD HH:mm:ss`), 0 when absent. */
export function timeValue(updatedAt: string | undefined): number {
  if (updatedAt === undefined) return 0
  const parsed = Date.parse(updatedAt.replace(' ', 'T'))
  return Number.isNaN(parsed) ? 0 : parsed
}

/** Human-readable size; dashes stand in for folders and unknown sizes. */
export function formatBytes(size: number | undefined): string {
  if (size === undefined || size < 0) return '—'
  if (size < 1024) return `${String(size)} B`
  const units = ['KB', 'MB', 'GB', 'TB']
  let value = size / 1024
  let unit = 0
  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024
    unit += 1
  }
  return `${value >= 10 ? value.toFixed(0) : value.toFixed(1)} ${units[unit] ?? 'KB'}`
}

/** Compact modified-date text: time when recent, date when older. */
export function formatDate(updatedAt: string | undefined): string {
  if (updatedAt === undefined) return '—'
  const match = /^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2})/u.exec(updatedAt)
  if (match === null) return updatedAt
  const [, year, month, day, hour, minute] = match
  const now = new Date()
  return Number(year) === now.getFullYear()
    ? `${month}-${day} ${hour}:${minute}`
    : `${year}-${month}-${day}`
}

/** Compare two entries on one facet, excluding direction. */
function compareOn(
  left: PickerItem,
  right: PickerItem,
  key: WecomSortKey,
  t: (key: WecomPickerKey) => string,
): number {
  switch (key) {
    case 'kind': {
      const byKind = collator.compare(typeLabel(left, t), typeLabel(right, t))
      return byKind !== 0 ? byKind : collator.compare(left.name, right.name)
    }
    case 'updatedAt':
      return timeValue(left.updatedAt) - timeValue(right.updatedAt)
    case 'size':
      return (itemSize(left) ?? -1) - (itemSize(right) ?? -1)
    case 'location': {
      const byPlace = collator.compare(locationLabel(left), locationLabel(right))
      return byPlace !== 0 ? byPlace : collator.compare(left.name, right.name)
    }
    case 'name':
      return collator.compare(left.name, right.name)
  }
}

/**
 * Order one result set for display.
 * @param items - entries as returned by the host.
 * @param key - active facet.
 * @param direction - active direction.
 * @param t - locale lookup for the kind facet.
 * @returns a new, ordered array; the input is never mutated.
 */
export function sortItems(
  items: readonly PickerItem[],
  key: WecomSortKey,
  direction: WecomSortDirection,
  t: (key: WecomPickerKey) => string,
): PickerItem[] {
  const sign = direction === 'asc' ? 1 : -1
  return [...items].sort((left, right) => {
    const byFacet = compareOn(left, right, key, t)
    // Names break every tie, so equal facets never reorder between renders.
    if (byFacet !== 0) return sign * byFacet
    return sign * collator.compare(left.name, right.name)
  })
}

/** Bucket entries by an identity function, preserving first-seen order. */
function bucket(items: readonly PickerItem[], of: (item: PickerItem) => string): Map<string, PickerItem[]> {
  const groups = new Map<string, PickerItem[]>()
  for (const item of items) {
    const key = of(item)
    const group = groups.get(key)
    if (group === undefined) groups.set(key, [item])
    else group.push(item)
  }
  return groups
}

/**
 * Resolve the column view against one result set.
 *
 * The CLI exposes locations but no folder listing, so the levels are derived
 * from the entries themselves: space, then folder inside that space, then the
 * entries of that folder. A stale space/folder selection falls back to the
 * first available level instead of rendering an empty pane.
 * @param items - the current result set.
 * @param preferences - active sort.
 * @param t - locale lookup for labels.
 * @param space - requested space bucket, if any.
 * @param folder - requested folder bucket, if any.
 * @returns levels and entries for the column view.
 */
export function groupColumns(
  items: readonly PickerItem[],
  preferences: WecomViewPreferences,
  t: (key: WecomPickerKey) => string,
  space: string | undefined,
  folder: string | undefined,
): WecomColumns {
  const order = sortItems(items, preferences.sortKey, preferences.sortDirection, t)
  const spaceGroups = bucket(order, spaceKey)
  const spaces = [...spaceGroups].map(([id, group]) => ({
    id,
    label: id === '' ? t('column.root') : group[0]?.spaceName ?? id,
    count: group.length,
  }))
  const spaceId = space !== undefined && spaceGroups.has(space) ? space : spaces[0]?.id
  const inSpace = spaceId === undefined ? [] : spaceGroups.get(spaceId) ?? []
  const folderGroups = bucket(inSpace, folderKey)
  const folders = [...folderGroups].map(([id, group]) => ({
    id,
    label: id === '' ? t('column.root') : group[0]?.folderName ?? id,
    count: group.length,
  }))
  const folderId = folder !== undefined && folderGroups.has(folder) ? folder : folders[0]?.id
  return {
    spaces,
    folders,
    items: folderId === undefined ? inSpace : folderGroups.get(folderId) ?? [],
    spaceId,
    folderId,
  }
}

/** Read persisted preferences, falling back per field on any invalid value. */
export function loadPreferences(): WecomViewPreferences {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (raw === null) return DEFAULT_PREFERENCES
    const parsed = JSON.parse(raw) as Partial<WecomViewPreferences>
    const view = VIEW_OPTIONS.some(option => option.id === parsed.view) ? parsed.view : undefined
    const sortKey = SORT_OPTIONS.some(option => option.id === parsed.sortKey) ? parsed.sortKey : undefined
    const sortDirection = parsed.sortDirection === 'asc' || parsed.sortDirection === 'desc' ? parsed.sortDirection : undefined
    return {
      view: view ?? DEFAULT_PREFERENCES.view,
      sortKey: sortKey ?? DEFAULT_PREFERENCES.sortKey,
      sortDirection: sortDirection ?? DEFAULT_PREFERENCES.sortDirection,
    }
  } catch {
    // Storage can be unavailable or hold junk; defaults are always safe.
    return DEFAULT_PREFERENCES
  }
}

/** Persist preferences, ignoring a blocked or full storage. */
export function savePreferences(preferences: WecomViewPreferences): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences))
  } catch {
    // A read-only profile still gets a working picker for this session.
  }
}
