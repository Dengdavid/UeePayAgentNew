import { createI18n } from 'vue-i18n'
import { watch } from 'vue'
import { FALLBACK_LOCALE, locale, setLocale } from './set.js'
import { siteConfig } from '@/config/site.js'

const businessLocaleLoaders = import.meta.glob('./lang/*/index.js', {
  import: 'default',
})

const viewUiLocaleLoaders = {
  'zh-CN': () => import('view-ui-plus/dist/locale/zh-CN'),
  'zh-TW': () => import('view-ui-plus/dist/locale/zh-TW'),
  'en-US': () => import('view-ui-plus/dist/locale/en-US'),
  'ja-JP': () => import('view-ui-plus/dist/locale/ja-JP'),
  'ko-KR': () => import('view-ui-plus/dist/locale/ko-KR'),
  'es-ES': () => import('view-ui-plus/dist/locale/es-ES'),
  'pt-PT': () => import('view-ui-plus/dist/locale/pt-PT'),
  'fr-FR': () => import('view-ui-plus/dist/locale/fr-FR'),
  'vi-VN': () => import('view-ui-plus/dist/locale/vi-VN'),
  'th-TH': () => import('view-ui-plus/dist/locale/th-TH'),
  'id-ID': () => import('view-ui-plus/dist/locale/id-ID'),
  'tr-TR': () => import('view-ui-plus/dist/locale/tr-TR'),
  'ar-SA': () => import('view-ui-plus/dist/locale/ar-SA'),
}

const siteVariables = {
  siteName: siteConfig.nameEn,
}

// 递归注入站点变量，避免在各语言包中重复维护固定品牌名称。
const injectSiteVariables = (value) => {
  if (typeof value === 'string') {
    return Object.entries(siteVariables).reduce(
      (text, [key, replacement]) => text.replaceAll(`{${key}}`, replacement),
      value
    )
  }
  if (Array.isArray(value)) return value.map(injectSiteVariables)
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [key, injectSiteVariables(item)])
    )
  }
  return value
}

const resolveViewUiLocale = (code, value) => {
  const uiLocale = value?.default || value || {}

  if (code === 'en-US') {
    return {
      ...uiLocale,
      i: {
        ...uiLocale.i,
        page: {
          ...uiLocale.i?.page,
          goto: 'Go to',
        },
      },
    }
  }

  if (code === 'ja-JP') {
    return {
      ...uiLocale,
      i: {
        ...uiLocale.i,
        page: {
          ...uiLocale.i?.page,
          total: '合計',
        },
      },
    }
  }

  return uiLocale
}

const i18n = createI18n({
  legacy: false, // Vue3 + setup 推荐
  globalInjection: true, // 模板中可直接用 $t
  locale: locale.value,
  fallbackLocale: FALLBACK_LOCALE,
  warnHtmlMessage: false,
  messages: {},
})

const pendingLocaleLoads = new Map()

export const loadLocaleMessages = (code) => {
  if (i18n.global.availableLocales.includes(code)) return Promise.resolve()
  if (pendingLocaleLoads.has(code)) return pendingLocaleLoads.get(code)

  const businessLoader = businessLocaleLoaders[`./lang/${code}/index.js`]
  const viewUiLoader = viewUiLocaleLoaders[code]
  if (!businessLoader || !viewUiLoader) {
    return Promise.reject(new Error(`Unsupported locale: ${code}`))
  }

  const loadPromise = Promise.all([businessLoader(), viewUiLoader()])
    .then(([businessLocale, viewUiLocale]) => {
      i18n.global.setLocaleMessage(code, {
        ...injectSiteVariables(businessLocale),
        ...resolveViewUiLocale(code, viewUiLocale),
      })
    })
    .finally(() => {
      pendingLocaleLoads.delete(code)
    })

  pendingLocaleLoads.set(code, loadPromise)
  return loadPromise
}

export const activateLocaleMessages = async (code) => {
  await loadLocaleMessages(code)
  if (locale.value === code) i18n.global.locale.value = code
}

export const initializeLocaleMessages = async () => {
  await loadLocaleMessages(FALLBACK_LOCALE)
  if (locale.value !== FALLBACK_LOCALE) {
    try {
      await loadLocaleMessages(locale.value)
    } catch {
      setLocale(FALLBACK_LOCALE, { persist: false })
    }
  }
  i18n.global.locale.value = locale.value
}

watch(locale, async (value, previousValue) => {
  try {
    await activateLocaleMessages(value)
  } catch {
    if (locale.value === value) {
      setLocale(previousValue || FALLBACK_LOCALE)
    }
  }
})

export default i18n
