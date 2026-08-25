import Cookies from 'js-cookie'
import { locale } from '@/locales/set.js'
import { timezone } from '@/utils/preferences.js'
import { domainURL,tokenName } from "@systemConfig";
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
/**
 * 判断给定的 hostname 是否为本地地址
 * @param {string} hostname - 主机名 (例如: window.location.hostname)
 * @returns {boolean}
 */
function isLocalHost(hostname) {
  if (!hostname) return false;

  // 1. 直接匹配 localhost 和 IPv6 回环
  if (hostname === 'localhost' || hostname === '::1') {
    return true;
  }

  // 2. 匹配 IPv4 回环 (127.x.x.x)
  if (/^127\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(hostname)) {
    return true;
  }

  // 3. 匹配私有 IPv4 地址段 (局域网)
  // 10.0.0.0 - 10.255.255.255
  // 172.16.0.0 - 172.31.255.255
  // 192.168.0.0 - 192.168.255.255
  // 169.254.0.0 - 169.254.255.255 (Link-local)
  const parts = hostname.split('.');
  if (parts.length === 4) {
    const [a, b, c, d] = parts.map(Number);
    
    // 检查是否为有效数字
    if (parts.some(p => isNaN(p))) return false;

    if (a === 10) return true;
    if (a === 172 && b >= 16 && b <= 31) return true;
    if (a === 192 && b === 168) return true;
    if (a === 169 && b === 254) return true;
  }

  // 4. (可选) 匹配常见的开发专用顶级域
  // 注意：这取决于你的开发环境配置，生产环境也可能误判
  if (hostname.endsWith('.local') || 
      hostname.endsWith('.test') || 
      hostname.endsWith('.localhost')) {
    return true;
  }

  return false;
}
export function installRequestInterceptor(request, requestConfig) {
  request.interceptors.request.use(config => {    
    const token = Cookies.get(tokenName)
    const policy = resolveRequestPolicy(config, requestConfig)
    const meta = createRequestMeta(config, policy)

    meta.retryOnTimeout = policy.retryOnTimeout

    config.headers = config.headers || {}
    config.headers['Accept-Language'] = locale.value
    config.headers['X-Timezone'] = timezone.value
    //代理商
    const hostname = window.location.hostname;
    if(hostname){
        config.headers.Domain =isLocalHost(hostname)?domainURL:hostname;
    }
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
