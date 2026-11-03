/** Dictionary namespace for the WeCom picker. */
export const NS = 'wecom.picker'

/** Simplified Chinese copy. */
export const zh = {
  'button.label': '企业微信·微盘',
  'menu.label': '企业微信-微盘',
  'menu.description': '从微盘选择文件或文件夹，插入为引用',

  // Window chrome
  'panel.title': '微盘',
  'panel.drag': '拖动窗口位置；方向键微调，点击回到居中',
  'panel.close': '关闭',
  'panel.cancel': '取消',
  'panel.confirm': '插入',
  'panel.more': '加载更多',
  'cli.useIframe': '改用官方选择器',
  'iframe.title': '企业微信微盘选择器',
  'iframe.hint': '官方选择器需要企业微信网页登录态：只有在 DSH 页面与 doc.weixin.qq.com 同站时才能登录（浏览器 + 同站代理），桌面版里通常只能浏览、无法登录。',
  'iframe.loading': '正在加载官方选择器…',
  'iframe.useCli': '改用 CLI 选择器',
  'panel.retry': '重试',

  // Search
  'search.placeholder': '搜索微盘文件',
  'search.label': '搜索微盘文件',
  'search.clear': '清空搜索',

  // View modes
  'view.label': '查看方式',
  'view.list': '列表',
  'view.columns': '分栏',
  'view.gallery': '画廊',

  // Sorting
  'sort.label': '排序',
  'sort.name': '名称',
  'sort.kind': '种类',
  'sort.updatedAt': '修改日期',
  'sort.size': '大小',
  'sort.location': '位置',
  'sort.ascending': '升序',
  'sort.descending': '降序',
  'sort.direction': '排序方向',

  // Column view
  'column.spaces': '位置',
  'column.folders': '文件夹',
  'column.items': '项目',
  'column.preview': '简介',
  'column.root': '未归档',

  // Preview pane
  'preview.emptyTitle': '未选择项目',
  'preview.emptyHint': '选择左侧的项目查看详情。',
  'preview.type': '种类',
  'preview.size': '大小',
  'preview.location': '位置',
  'preview.modified': '修改日期',
  'preview.identifier': '标识',
  'preview.open': '打开链接',

  // Rows
  'row.add': '加入选择',
  'row.remove': '移出选择',

  // States
  'panel.loading': '正在读取微盘…',
  'panel.empty': '还没有最近浏览的文件',
  'panel.emptyHint': '在企业微信里打开过微盘文件后，这里就会出现。',
  'panel.emptySearch': '没有匹配的文件',
  'panel.emptySearchHint': '换个关键词，或清空搜索查看最近浏览。',
  'panel.recent': '最近浏览',
  'panel.results': '搜索结果',
  'state.missing': '未找到 wecom-cli',
  'state.missingHint': '请先安装企业微信 CLI（版本 ≥ 1.2.0），再重试。',
  'state.unauthorized': '企业微信授权已失效',
  'state.unauthorizedHint': '重新扫码授权后即可继续选择文件。',
  'state.error': '读取微盘失败',
  'state.errorHint': '检查网络或 CLI 状态后重试。',

  // Authorization
  'auth.action': '重新授权',
  'auth.restart': '重新获取二维码',
  'auth.waiting': '用企业微信扫码授权',
  'auth.link': '或在浏览器中打开授权页',
  'auth.failed': '授权失败',

  // Status bar
  'status.count': '个项目',
  'status.selected': '已选',
  'status.max': '最多 10 项',
  'status.searching': '搜索中…',

  // Item kinds
  'type.file': '文件',
  'type.folder': '文件夹',
  'type.space': '空间',
  'type.sheet': '在线表格',
  'type.word': '在线文档',
  'type.ppt': '在线幻灯片',
  'type.smartsheet': '智能表格',
  'type.smartpage': '智能文档',
  'type.collect': '收集表',
  'type.journal': '汇报',
  'type.flow': '流程图',
  'type.mind': '思维导图',
} as const

/** English copy, same keys as the Chinese source. */
export const en: Record<WecomPickerKey, string> = {
  'button.label': 'WeCom WeDrive',
  'menu.label': 'WeCom WeDrive',
  'menu.description': 'Pick a WeDrive file or folder and insert it as a reference',

  'panel.title': 'WeDrive',
  'panel.drag': 'Drag to move this window; arrow keys nudge, click to re-center',
  'panel.close': 'Close',
  'panel.cancel': 'Cancel',
  'panel.confirm': 'Insert',
  'panel.more': 'Load more',
  'cli.useIframe': 'Use the official selector',
  'iframe.title': 'WeCom WeDrive file selector',
  'iframe.hint': 'The official selector needs a WeCom web session: it can only sign in when the DSH page shares a site with doc.weixin.qq.com (a browser plus a same-site proxy). Inside the desktop app it is browse-only.',
  'iframe.loading': 'Loading the official selector…',
  'iframe.useCli': 'Use the CLI picker',
  'panel.retry': 'Retry',

  'search.placeholder': 'Search WeDrive',
  'search.label': 'Search WeDrive files',
  'search.clear': 'Clear search',

  'view.label': 'View as',
  'view.list': 'List',
  'view.columns': 'Columns',
  'view.gallery': 'Gallery',

  'sort.label': 'Sort',
  'sort.name': 'Name',
  'sort.kind': 'Kind',
  'sort.updatedAt': 'Date modified',
  'sort.size': 'Size',
  'sort.location': 'Location',
  'sort.ascending': 'Ascending',
  'sort.descending': 'Descending',
  'sort.direction': 'Sort direction',

  'column.spaces': 'Locations',
  'column.folders': 'Folders',
  'column.items': 'Items',
  'column.preview': 'Info',
  'column.root': 'Unfiled',

  'preview.emptyTitle': 'Nothing selected',
  'preview.emptyHint': 'Pick an item on the left to see its details.',
  'preview.type': 'Kind',
  'preview.size': 'Size',
  'preview.location': 'Location',
  'preview.modified': 'Modified',
  'preview.identifier': 'Identifier',
  'preview.open': 'Open link',

  'row.add': 'Add to selection',
  'row.remove': 'Remove from selection',

  'panel.loading': 'Reading WeDrive…',
  'panel.empty': 'No recently viewed files',
  'panel.emptyHint': 'Files you open in WeCom show up here.',
  'panel.emptySearch': 'No matching files',
  'panel.emptySearchHint': 'Try another keyword, or clear the search to browse recent files.',
  'panel.recent': 'Recently viewed',
  'panel.results': 'Search results',
  'state.missing': 'wecom-cli was not found',
  'state.missingHint': 'Install the WeCom CLI (version ≥ 1.2.0), then retry.',
  'state.unauthorized': 'WeCom authorization expired',
  'state.unauthorizedHint': 'Scan the QR code again to keep picking files.',
  'state.error': 'Reading WeDrive failed',
  'state.errorHint': 'Check the network or the CLI, then retry.',

  'auth.action': 'Re-authorize',
  'auth.restart': 'Get a new QR code',
  'auth.waiting': 'Scan this QR code in WeCom',
  'auth.link': 'Or open the authorization page',
  'auth.failed': 'Authorization failed',

  'status.count': 'items',
  'status.selected': 'Selected',
  'status.max': 'up to 10',
  'status.searching': 'Searching…',

  'type.file': 'File',
  'type.folder': 'Folder',
  'type.space': 'Space',
  'type.sheet': 'Online sheet',
  'type.word': 'Online doc',
  'type.ppt': 'Online slides',
  'type.smartsheet': 'Smart sheet',
  'type.smartpage': 'Smart doc',
  'type.collect': 'Form',
  'type.journal': 'Report',
  'type.flow': 'Flowchart',
  'type.mind': 'Mind map',
}

/** Keys owned by this picker. */
export type WecomPickerKey = keyof typeof zh
