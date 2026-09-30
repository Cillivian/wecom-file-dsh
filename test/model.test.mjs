/**
 * Pure picker-model tests. No dependencies, no DOM: `node --test test/` runs
 * this against the TypeScript sources directly through Node's type stripping.
 */
import { test } from 'node:test'
import assert from 'node:assert/strict'

import {
  DEFAULT_PREFERENCES, fileIconKey, formatBytes, formatDate, groupColumns, itemSize,
  locationLabel, sameItem, sortItems, typeLabel,
} from '../src/client/cli/model.ts'
import { zh } from '../src/client/locales.ts'

const t = key => zh[key] ?? `MISSING:${key}`

/** One entry with the given overrides. */
const item = (over = {}) => ({
  id: 'd3_a', idKind: 'doc', name: '季度复盘', kind: 'file', type: 'word', ...over,
})

test('typeLabel maps CLI types and falls back to the file/folder split', () => {
  assert.equal(typeLabel(item({ type: 'word' }), t), '在线文档')
  assert.equal(typeLabel(item({ type: 'smartpage' }), t), '智能文档')
  assert.equal(typeLabel(item({ type: 'offline_excel' }), t), '文件')
  assert.equal(typeLabel(item({ type: 'folder', kind: 'folder' }), t), '文件夹')
  assert.equal(typeLabel(item({ type: undefined, kind: 'folder' }), t), '文件夹')
})

test('fileIconKey maps every CLI type to its own glyph', () => {
  const matrix = [
    ['word', 'tdoc'], ['sheet', 'tsheet'], ['ppt', 'tslide'], ['smartsheet', 'tsmartsheet'],
    ['smartpage', 'smartdoc'], ['mind', 'tmindmap'], ['flow', 'tflowchart'],
    ['collect', 'tform'], ['journal', 'treport'], ['pdf', 'tpdf'],
    ['folder', 'folder'], ['space', 'space'],
    ['offline_word', 'localWord'], ['offline_excel', 'localExcel'], ['offline_ppt', 'localPpt'],
    ['offline_pdf', 'localPdf'], ['image', 'localImage'], ['videoaudio', 'localVideo'],
    ['design', 'localSketch'],
  ]
  for (const [type, expected] of matrix) {
    assert.equal(fileIconKey(item({ type, kind: type === 'folder' || type === 'space' ? 'folder' : 'file' })), expected, type)
  }
})

test('fileIconKey falls back to the name extension, then to the generic glyph', () => {
  const byName = [
    ['素材包.zip', 'localZip'], ['截图.png', 'localImage'], ['预告.mp4', 'localVideo'],
    ['无损.flac', 'localAudio'], ['纪要.docx', 'localWord'], ['预算.xlsx', 'localExcel'],
    ['提案.pptx', 'localPpt'], ['白皮书.pdf', 'localPdf'], ['说明.txt', 'localText'],
    ['设计稿.sketch', 'localSketch'],
  ]
  for (const [name, expected] of byName) {
    assert.equal(fileIconKey(item({ type: 'file', idKind: 'file', name })), expected, name)
  }
  assert.equal(fileIconKey(item({ type: 'file', idKind: 'file', name: '未知二进制' })), 'localOther')
  assert.equal(fileIconKey(item({ type: undefined, name: '没有扩展名', kind: 'folder' })), 'folder')
})

test('itemSize withholds sizes that are not file sizes', () => {
  assert.equal(itemSize(item({ type: 'file', size: 2_411_724 })), 2_411_724)
  assert.equal(itemSize(item({ type: 'offline_pdf', size: 1024 })), 1024)
  // Online documents report payload sizes (a smart page claims gigabytes).
  assert.equal(itemSize(item({ type: 'smartpage', size: 6_999_714_082 })), undefined)
  assert.equal(itemSize(item({ type: 'smartsheet', size: 499 })), undefined)
  assert.equal(itemSize(item({ type: 'file', size: undefined })), undefined)
})

test('locationLabel hides the CLI placeholder path', () => {
  assert.equal(locationLabel(item({ spaceName: '产品空间', folderName: '复盘' })), '产品空间 / 复盘')
  assert.equal(locationLabel(item({ path: '无权限查看文件所在路径' })), '')
  assert.equal(locationLabel(item({ path: '空间/真路径' })), '空间/真路径')
})

test('formatBytes and formatDate stay readable', () => {
  assert.equal(formatBytes(undefined), '—')
  assert.equal(formatBytes(-1), '—')
  assert.equal(formatBytes(512), '512 B')
  assert.equal(formatBytes(1024), '1.0 KB')
  assert.equal(formatBytes(2_411_724), '2.3 MB')
  assert.equal(formatDate(undefined), '—')
  assert.equal(formatDate('2026-09-30 15:46:21'), '09-30 15:46')
  assert.equal(formatDate('2025-12-24 08:30:00'), '2025-12-24')
})

test('sortItems orders by facet, ties by name, and never mutates', () => {
  const items = [
    item({ id: 'b', name: 'b', size: 10, type: 'file', idKind: 'file', updatedAt: '2026-01-02 00:00:00' }),
    item({ id: 'a', name: 'a', size: 30, type: 'file', idKind: 'file', updatedAt: '2026-01-03 00:00:00' }),
    item({ id: 'c', name: 'c', size: 20, type: 'file', idKind: 'file', updatedAt: '2026-01-01 00:00:00' }),
  ]
  const frozen = [...items]
  assert.deepEqual(sortItems(items, 'name', 'asc', t).map(entry => entry.name), ['a', 'b', 'c'])
  assert.deepEqual(sortItems(items, 'name', 'desc', t).map(entry => entry.name), ['c', 'b', 'a'])
  assert.deepEqual(sortItems(items, 'size', 'desc', t).map(entry => entry.name), ['a', 'c', 'b'])
  assert.deepEqual(sortItems(items, 'updatedAt', 'asc', t).map(entry => entry.name), ['c', 'b', 'a'])
  assert.deepEqual(items, frozen)
})

test('sortItems ranks undated and unsized entries last', () => {
  const items = [
    item({ id: 'x', name: 'x', type: 'file', idKind: 'file', updatedAt: undefined, size: undefined }),
    item({ id: 'y', name: 'y', type: 'file', idKind: 'file', updatedAt: '2026-01-01 00:00:00', size: 1 }),
  ]
  assert.deepEqual(sortItems(items, 'size', 'desc', t).map(entry => entry.name), ['y', 'x'])
})

test('groupColumns resolves levels and falls back to the first bucket', () => {
  const items = [
    // Explicit timestamps keep the folder order intentional (default sort is
    // newest first), not incidental.
    item({ id: '1', idKind: 'file', name: 'one', spaceId: 'sp1', spaceName: '产品空间', folderId: 'fd1', folderName: '复盘', updatedAt: '2026-09-30 10:00:00' }),
    item({ id: '2', idKind: 'file', name: 'two', spaceId: 'sp1', spaceName: '产品空间', folderId: 'fd2', folderName: '数据', updatedAt: '2026-08-01 10:00:00' }),
    item({ id: '3', idKind: 'file', name: 'three', spaceId: 'sp2', spaceName: '共享空间', folderId: 'fd1', folderName: '复盘' }),
    item({ id: '4', idKind: 'file', name: 'four', path: '无权限查看文件所在路径' }),
  ]
  const columns = groupColumns(items, DEFAULT_PREFERENCES, t, undefined, undefined)
  assert.deepEqual(columns.spaces.map(entry => entry.label), ['产品空间', '共享空间', '未归档'])
  assert.equal(columns.spaceId, 'sp1')
  assert.deepEqual(columns.folders.map(entry => entry.label), ['复盘', '数据'])
  assert.deepEqual(columns.items.map(entry => entry.name), ['one'])

  // A stale selection resolves to an available level instead of an empty pane.
  const stale = groupColumns(items, DEFAULT_PREFERENCES, t, 'nope', 'nope')
  assert.equal(stale.spaceId, 'sp1')
  assert.equal(stale.folderId, 'fd1')
  assert.equal(stale.items.length, 1)
})

test('sameItem keys on kind plus id', () => {
  assert.equal(sameItem(item({ id: 'same' }), item({ id: 'same' })), true)
  assert.equal(sameItem(item({ id: 'same', idKind: 'doc' }), item({ id: 'same', idKind: 'file' })), false)
})
