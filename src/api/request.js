import { createRequestClient } from './request/client.js'

// 请求层的可调参数统一在此维护，内部模块只通过参数注入读取配置。
export const REQUEST_CONFIG = {
  // Axios 实例基础配置。
  axios: {
    // 所有业务接口的统一请求前缀。
    baseURL: '/api',
    // 单次请求超时时间，单位为毫秒。
    timeout: 60000,
  },
  // 服务端业务状态码。
  responseCodes: {
    // 请求处理成功。
    success: 1,
    // 当前请求需要完成 2FA 验证后重放。
    twoFactorRequired: 410,
    // 请求过于频繁。
    rateLimited: 429,
    // 因法律或地区限制不可用。
    legalBlocked: 451,
    // 登录状态失效，需要清理 Token 并退出。
    logoutRequired: -100,
  },
  // 超时重试仅默认应用于幂等请求；maxAttempts 包含首次请求。
  retry: {
    // 单个逻辑请求允许的最大总请求次数。
    maxAttempts: 3,
    // 第一次、第二次重试前的等待时间，单位为毫秒。
    delays: [300, 800],
    // 默认允许自动重试的幂等请求方法。
    safeMethods: new Set(['get', 'head', 'options']),
    // Axios 中判定为请求超时的错误码。
    timeoutErrorCodes: new Set(['ECONNABORTED', 'ETIMEDOUT']),
  },
  // 全局 2FA 挑战的等待时间、挂载节点和内部状态码。
  twoFactor: {
    // 2FA 验证流程的最长等待时间，单位为毫秒。
    requestTimeout: 5 * 60 * 1000,
    // 2FA 弹窗动态挂载节点的 class。
    containerClass: 'global-two-factor-auth-host',
    // 标记 2FA 验证接口，避免其自身再次进入 2FA 重放流程。
    skipRetryKey: '__skip2FARetry',
    // 2FA 流程内部使用的前端错误码。
    codes: {
      // 用户主动取消 2FA。
      cancelled: -991,
      // 当前账号需要先启用 Google Authenticator。
      enableGoogle: -992,
      // 已有其他 2FA 挑战正在处理中。
      busy: -993,
      // 2FA 验证等待超时。
      timeout: -994,
      // 2FA 组件加载或挂载失败。
      unavailable: -995,
    },
  },
  // 取消原因用于区分同组替换、登录失效和业务主动取消。
  cancelReasons: {
    // 同组新请求发起时，自动取消前一个请求。
    takeLatest: 'take-latest',
    // 登录状态失效时，取消当前会话内的其他未完成请求。
    logoutRequired: 'logout-required',
    // 业务代码或用户操作主动取消请求。
    user: 'user',
  },
  // 静默错误不会触发全局错误提示。
  silentErrorMessage: 'SILENT_ERROR',
}

export default createRequestClient(REQUEST_CONFIG)
