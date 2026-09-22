/** Dictionary namespace for the scratch WeCom picker. */
export const NS = 'wecom.picker'

/** Simplified Chinese copy. */
export const zh = {
  'button.label': '企业微信·微盘',
  'iframe.title': '企业微信微盘选择器',
} as const

/** English copy, same keys as the Chinese source. */
export const en: Record<WecomPickerKey, string> = {
  'button.label': 'WeCom WeDrive',
  'iframe.title': 'WeCom WeDrive file selector',
}

/** Keys owned by this scratch picker. */
export type WecomPickerKey = keyof typeof zh
