export const PREFERENCES_STORAGE_KEY = 'APP_USER_PREFERENCES'
const PREFERENCES_PENDING_SYNC_KEY = 'APP_USER_PREFERENCES_PENDING_SYNC'

const deprecatedStorageKeys = [
  'APP_USER_COUNTRY',
  'APP_USER_TZ',
  'locale',
]

const getStorage = () => {
  if (typeof window === 'undefined') return null
  try {
    return window.localStorage
  } catch {
    return null
  }
}

const removeDeprecatedStorage = (storage) => {
  deprecatedStorageKeys.forEach((key) => {
    try {
      storage.removeItem(key)
    } catch {
      // 浏览器禁用本地存储时忽略旧键清理失败。
    }
  })
}

export const getStoredPreferences = () => {
  const storage = getStorage()
  if (!storage) return {}

  try {
    const storedValue = storage.getItem(PREFERENCES_STORAGE_KEY)
    if (!storedValue) return {}

    const parsedValue = JSON.parse(storedValue)
    return parsedValue && typeof parsedValue === 'object' && !Array.isArray(parsedValue)
      ? parsedValue
      : {}
  } catch {
    return {}
  } finally {
    removeDeprecatedStorage(storage)
  }
}

export const hasStoredPreferences = () => {
  const storage = getStorage()
  if (!storage) return false

  try {
    return storage.getItem(PREFERENCES_STORAGE_KEY) !== null
  } catch {
    return false
  }
}

export const setStoredPreferences = (values = {}) => {
  const storage = getStorage()
  if (!storage) return

  try {
    storage.setItem(PREFERENCES_STORAGE_KEY, JSON.stringify(values))
  } catch {
    // 浏览器禁用本地存储时，偏好设置仍在当前会话内生效。
  } finally {
    removeDeprecatedStorage(storage)
  }
}

export const updateStoredPreference = (field, value) => {
  setStoredPreferences({
    ...getStoredPreferences(),
    [field]: value,
  })
}

export const hasPendingPreferencesSync = () => {
  const storage = getStorage()
  if (!storage) return false

  try {
    return storage.getItem(PREFERENCES_PENDING_SYNC_KEY) === '1'
  } catch {
    return false
  }
}

export const markPreferencesPendingSync = () => {
  const storage = getStorage()
  if (!storage) return

  try {
    storage.setItem(PREFERENCES_PENDING_SYNC_KEY, '1')
  } catch {
    // 浏览器禁用本地存储时，无法跨页面记录待同步状态。
  }
}

export const clearPreferencesPendingSync = () => {
  const storage = getStorage()
  if (!storage) return

  try {
    storage.removeItem(PREFERENCES_PENDING_SYNC_KEY)
  } catch {
    // 浏览器禁用本地存储时无需额外处理。
  }
}

export const clearStoragePreservingPreferences = (values) => {
  const storage = getStorage()
  if (!storage) return

  try {
    const cachedCardholder = storage.getItem('CARDHOLDER')
    const cachedNoticeConfirmed = storage.getItem('notice_confirmed')
    storage.clear()
    storage.setItem(PREFERENCES_STORAGE_KEY, JSON.stringify(values))
    if (cachedCardholder !== null) {
      storage.setItem('CARDHOLDER', cachedCardholder)
    }
    if (cachedNoticeConfirmed !== null) {
      storage.setItem('notice_confirmed', cachedNoticeConfirmed)
    }
  } catch {
    // 清理失败不应阻断退出登录流程。
  }
}
