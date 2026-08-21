import { ref } from 'vue'
import {
  getStoredPreferences,
  updateStoredPreference,
} from '@/utils/preferences-storage.js'

// 默认语言用于无法识别用户偏好时；兜底语言用于缺少翻译 key 时。
export const DEFAULT_LOCALE = 'zh-TW'
export const FALLBACK_LOCALE = 'en-US'

// 未提供完整业务语言包的语言会使用英文业务文案兜底。
// 新增语言时仍需同步添加对应的 View UI Plus 语言包。
export const setData = [
  {
    label: '简体中文',
    value: 'zh-CN',
    // 写入 HTML dir，RTL 语言需配置为 rtl。
    dir: 'ltr',
  },
  {
    label: '繁體中文',
    value: 'zh-TW',
    dir: 'ltr',
  },
  {
    label: 'English',
    value: 'en-US',
    dir: 'ltr',
  },
  {
    label: '日本語',
    value: 'ja-JP',
    dir: 'ltr',
  },
  {
    label: '한국어',
    value: 'ko-KR',
    dir: 'ltr',
  },
  {
    label: 'Español',
    value: 'es-ES',
    dir: 'ltr',
  },
  {
    label: 'Português',
    value: 'pt-PT',
    dir: 'ltr',
  },
  {
    label: 'Français',
    value: 'fr-FR',
    dir: 'ltr',
  },
  {
    label: 'Tiếng Việt',
    value: 'vi-VN',
    dir: 'ltr',
  },
  {
    label: 'ไทย',
    value: 'th-TH',
    dir: 'ltr',
  },
  {
    label: 'Bahasa Indonesia',
    value: 'id-ID',
    dir: 'ltr',
  },
  {
    label: 'Türkçe',
    value: 'tr-TR',
    dir: 'ltr',
  },
  {
    label: 'العربية',
    value: 'ar-SA',
    dir: 'ltr',
  },
]

// 语言配置索引，供校验语言值及同步页面书写方向使用。
const localeMap = new Map(setData.map(item => [item.value, item]))

/**
 * 将存储值或浏览器语言规范化为已启用的语言代码。
 * 例如 en-GB、en_US 会匹配当前已启用的 en-US。
 */
export const normalizeLocale = (value) => {
  if (typeof value !== 'string' || !value.trim()) return null

  const normalizedValue = value.trim().replaceAll('_', '-')
  const exactLocale = setData.find(
    item => item.value.toLowerCase() === normalizedValue.toLowerCase()
  )?.value
  if (exactLocale) return exactLocale

  const localeParts = normalizedValue.toLowerCase().split('-')
  const language = localeParts[0]
  if (language === 'zh') {
    const traditionalLocale = (
      localeParts.includes('hant') ||
      ['tw', 'hk', 'mo'].some(region => localeParts.includes(region))
    )
      ? 'zh-TW'
      : 'zh-CN'
    if (localeMap.has(traditionalLocale)) return traditionalLocale
  }

  return setData.find(item => item.value.split('-')[0].toLowerCase() === language)?.value || null
}

// localStorage 在隐私模式或被浏览器禁用时可能抛出异常。
export const getStoredLocale = () => {
  return getStoredPreferences().language || null
}

// 初始化优先级：用户已保存语言 > 项目默认语言。
// 登录用户缺少缓存时，由偏好设置组件继续读取服务端配置。
export const resolveLocale = () => (
  normalizeLocale(getStoredLocale()) ||
  DEFAULT_LOCALE
)

// 同步 HTML 语言与书写方向，便于无障碍工具、浏览器翻译和 RTL 布局识别。
const syncDocumentLocale = (value) => {
  if (typeof document === 'undefined') return

  const localeConfig = localeMap.get(value)
  document.documentElement.lang = value
  document.documentElement.dir = localeConfig?.dir || 'ltr'
}

const persistLocale = (value) => {
  updateStoredPreference('language', value)
}

// 全局响应式语言状态，由 locales/index.js 监听并同步到 vue-i18n。
export const locale = ref(resolveLocale())
syncDocumentLocale(locale.value)

/**
 * 切换并保存语言。
 * @returns {boolean} 是否成功匹配到已启用语言。
 */
export const setLocale = (value, options = {}) => {
  const nextLocale = normalizeLocale(value)
  if (!nextLocale) return false

  const { persist = true } = options
  locale.value = nextLocale
  if (persist) persistLocale(nextLocale)
  syncDocumentLocale(nextLocale)
  return true
}
