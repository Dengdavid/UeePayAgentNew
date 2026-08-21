import { ref } from 'vue'
import countries from '@/config/countries.json'
import {
  DEFAULT_LOCALE,
  getStoredLocale,
  locale,
  normalizeLocale,
  setLocale,
} from '@/locales/set.js'
import {
  clearStoragePreservingPreferences,
  getStoredPreferences,
  setStoredPreferences,
  updateStoredPreference,
} from '@/utils/preferences-storage.js'

export const DEFAULT_TIMEZONE = 'Asia/Taipei'
export const DEFAULT_COUNTRY = 'TW'

export const normalizeTimezone = (value) => {
  if (typeof value !== 'string' || !value.trim()) return null

  const normalizedValue = value.trim()
  try {
    new Intl.DateTimeFormat('en-US', { timeZone: normalizedValue }).format()
    return normalizedValue
  } catch {
    return null
  }
}

const countryMap = new Map(countries.map(item => [item.code, item]))

export const normalizeCountry = (value) => {
  if (typeof value !== 'string') return null
  const countryCode = value.trim().toUpperCase()
  return countryMap.has(countryCode) ? countryCode : null
}

export const getCountryConfig = (value) => (
  countryMap.get(normalizeCountry(value)) ||
  countryMap.get(DEFAULT_COUNTRY)
)

export const getCachedLocale = () => normalizeLocale(getStoredLocale())
export const getCachedTimezone = () => normalizeTimezone(getStoredPreferences().timezone)
export const getCachedCountry = () => normalizeCountry(getStoredPreferences().country)

export const timezone = ref(getCachedTimezone() || DEFAULT_TIMEZONE)
export const country = ref(getCachedCountry() || DEFAULT_COUNTRY)

/**
 * 获取指定时区中的日历日期，并以本地中午的 Date 表示。
 * 该值用于只关心年月日的控件，避免浏览器时区改变“今天”的边界。
 */
export const getCalendarDateInTimezone = (
  value = new Date(),
  timezoneValue = timezone.value
) => {
  const sourceDate = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(sourceDate.getTime())) return new Date(NaN)

  const resolvedTimezone = normalizeTimezone(timezoneValue) || DEFAULT_TIMEZONE
  const parts = new Intl.DateTimeFormat('en-US-u-ca-gregory', {
    timeZone: resolvedTimezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(sourceDate)
  const dateParts = Object.fromEntries(
    parts
      .filter((part) => ['year', 'month', 'day'].includes(part.type))
      .map((part) => [part.type, Number(part.value)])
  )

  return new Date(dateParts.year, dateParts.month - 1, dateParts.day, 12)
}

export const setTimezone = (value, options = {}) => {
  const nextTimezone = normalizeTimezone(value)
  if (!nextTimezone) return false

  const { persist = true } = options
  timezone.value = nextTimezone
  if (persist) updateStoredPreference('timezone', nextTimezone)
  return true
}

export const setCountry = (value, options = {}) => {
  const nextCountry = normalizeCountry(value)
  if (!nextCountry) return false

  const { persist = true } = options
  country.value = nextCountry
  if (persist) updateStoredPreference('country', nextCountry)
  return true
}

export const applyPreferences = (values = {}, options = {}) => {
  const { persist = true } = options
  const language = normalizeLocale(values.language) || DEFAULT_LOCALE
  const nextTimezone = normalizeTimezone(values.timezone) || DEFAULT_TIMEZONE
  const nextCountry = normalizeCountry(values.country)
    || getCachedCountry()
    || DEFAULT_COUNTRY

  setLocale(language, { persist: false })
  setTimezone(nextTimezone, { persist: false })
  setCountry(nextCountry, { persist: false })
  if (persist) {
    setStoredPreferences({
      country: nextCountry,
      timezone: nextTimezone,
      language,
    })
  }

  return {
    language: locale.value,
    timezone: timezone.value,
    country: country.value,
  }
}

export const getCurrentPreferences = () => ({
  country: normalizeCountry(country.value) || DEFAULT_COUNTRY,
  timezone: normalizeTimezone(timezone.value) || DEFAULT_TIMEZONE,
  language: normalizeLocale(locale.value) || DEFAULT_LOCALE,
})

export const clearBrowserCache = async () => {
  clearStoragePreservingPreferences(getCurrentPreferences())

  try {
    window.sessionStorage.clear()
  } catch {
    // 浏览器禁用会话存储时不阻断退出登录。
  }

  if ('caches' in window) {
    try {
      const cacheNames = await window.caches.keys()
      await Promise.all(cacheNames.map(cacheName => window.caches.delete(cacheName)))
    } catch {
      // Cache Storage 清理失败不阻断退出登录。
    }
  }
}
