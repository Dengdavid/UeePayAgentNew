import Cookies from 'js-cookie'
import { locale } from '@/locales/set.js'
import { timezone } from '@/utils/preferences.js'
import {
  createRequestMeta,
  registerPendingRequest,
} from './pendingRequestManager.js'

const resolveRequestPolicy = (config, requestConfig) => {
  const method = config.method?.toLowerCase() || 'get'
  const requestPolicy = config.requestPolicy || {}
  const configuredAttempts = Number(requestPolicy.maxAttempts)
  const { maxAttempts, safeMethods } = requestConfig.retry

  return {
    retryOnTimeout: requestPolicy.retryOnTimeout ?? safeMethods.has(method),
    maxAttempts: Math.min(
      Math.max(
        Number.isFinite(configuredAttempts)
          ? Math.floor(configuredAttempts)
          : maxAttempts,
        1,
      ),
      maxAttempts,
    ),
    takeLatestKey: typeof requestPolicy.takeLatestKey === 'string'
      ? requestPolicy.takeLatestKey.trim()
      : '',
  }
}

export function installRequestInterceptor(request, requestConfig) {
  request.interceptors.request.use(config => {
    const token = Cookies.get('token')
    const policy = resolveRequestPolicy(config, requestConfig)
    const meta = createRequestMeta(config, policy)

    meta.retryOnTimeout = policy.retryOnTimeout

    config.headers = config.headers || {}
    config.headers['Accept-Language'] = locale.value
    config.headers['X-Timezone'] = timezone.value

    if (token) {
      config.headers.token = token
    }

    return registerPendingRequest(
      config,
      meta,
      requestConfig.cancelReasons,
    )
  })
}
