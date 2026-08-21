import {
  handleLegalBlock,
  handleLogout,
  handleNetworkError,
  handleRateLimit,
} from './applicationErrorHandler.js'
import {
  cancelAllPendingRequests,
  completeLogicalRequest,
  getCancelReason,
  releaseRequestAttempt,
  setLogicalRequestCancelHandler,
} from './pendingRequestManager.js'
import {
  isTimeoutError,
  retryTimeoutRequest,
  shouldRetryTimeout,
} from './timeoutRetry.js'
import {
  cancelCurrentTwoFactor,
  handleTwoFactorRequest,
} from './twoFactorChallenge.js'

const isCancelledError = error => (
  error?.code === 'ERR_CANCELED' ||
  error?.name === 'CanceledError'
)

const rejectCancelledRequest = (error, requestConfig) => {
  error.msg = requestConfig.silentErrorMessage
  error.cancelled = true
  error.silent = true
  error.reason = getCancelReason(
    error.config,
    requestConfig.cancelReasons,
  )
  return Promise.reject(error)
}

const isCancelledByLogout = (config, requestConfig) => {
  const meta = config?.__requestMeta
  return Boolean(
    meta?.cancelled &&
    meta.cancelReason === requestConfig.cancelReasons.logoutRequired
  )
}

const rejectLogoutCancelledRequest = (config, requestConfig) => (
  rejectCancelledRequest({
    code: 'ERR_CANCELED',
    config,
  }, requestConfig)
)

// 全局副作用处理完成后仍保持失败语义，避免业务层继续执行成功逻辑。
const rejectSilentResponse = (responseData, code, requestConfig) => (
  Promise.reject({
    ...(responseData && typeof responseData === 'object' ? responseData : {}),
    code: responseData?.code ?? code,
    msg: requestConfig.silentErrorMessage,
    silent: true,
  })
)

const handleLegalBlockResponse = (config, responseData, requestConfig) => {
  const { legalBlocked } = requestConfig.responseCodes
  const errorData = responseData && typeof responseData === 'object'
    ? responseData
    : { code: legalBlocked, msg: '' }
  completeLogicalRequest(config)
  cancelCurrentTwoFactor(legalBlocked)
  handleLegalBlock(errorData)
  return rejectSilentResponse(errorData, legalBlocked, requestConfig)
}

const handleRateLimitResponse = (config, responseData, requestConfig) => {
  const { rateLimited } = requestConfig.responseCodes
  const errorData = responseData && typeof responseData === 'object'
    ? responseData
    : { code: rateLimited, msg: '' }
  completeLogicalRequest(config)
  handleRateLimit(errorData)
  return rejectSilentResponse(errorData, rateLimited, requestConfig)
}

const handleLogoutResponse = (config, responseData, requestConfig) => {
  const { logoutRequired } = requestConfig.responseCodes
  completeLogicalRequest(config)
  cancelCurrentTwoFactor(logoutRequired)
  cancelAllPendingRequests(requestConfig.cancelReasons.logoutRequired)
  handleLogout(responseData?.msg)
  return rejectSilentResponse(responseData, logoutRequired, requestConfig)
}

const handleTwoFactorResponse = (
  request,
  config,
  verifyData,
  requestConfig,
) => {
  const { twoFactorRequired } = requestConfig.responseCodes
  const { cancelled } = requestConfig.twoFactor.codes
  const { skipRetryKey } = requestConfig.twoFactor

  releaseRequestAttempt(config)
  setLogicalRequestCancelHandler(config, () => {
    cancelCurrentTwoFactor(cancelled)
  })

  if (config?.[skipRetryKey]) {
    completeLogicalRequest(config)
    return Promise.reject({
      code: twoFactorRequired,
      ...verifyData,
    })
  }

  return handleTwoFactorRequest({
    config,
    verifyData,
    retry: retryConfig => request(retryConfig),
    requestConfig,
  }).finally(() => {
    completeLogicalRequest(config)
  })
}

const handleSuccessResponse = (request, response, requestConfig) => {
  const responseData = response.data
  const config = response.config
  const {
    legalBlocked,
    logoutRequired,
    rateLimited,
    success,
    twoFactorRequired,
  } = requestConfig.responseCodes
  const { skipRetryKey } = requestConfig.twoFactor

  if (isCancelledByLogout(config, requestConfig)) {
    completeLogicalRequest(config)
    return rejectLogoutCancelledRequest(config, requestConfig)
  }

  if (responseData?.code === legalBlocked) {
    return handleLegalBlockResponse(config, responseData, requestConfig)
  }

  if (responseData?.code === twoFactorRequired) {
    if (config?.[skipRetryKey]) {
      completeLogicalRequest(config)
      return Promise.reject(responseData)
    }

    return handleTwoFactorResponse(
      request,
      config,
      responseData.data || {},
      requestConfig,
    )
  }

  if (responseData?.code === rateLimited) {
    return handleRateLimitResponse(config, responseData, requestConfig)
  }

  if (responseData?.code !== success) {
    if (responseData?.code === logoutRequired) {
      return handleLogoutResponse(config, responseData, requestConfig)
    }

    completeLogicalRequest(config)
    return Promise.reject(responseData)
  }

  completeLogicalRequest(config)
  return responseData.data
}

const handleErrorResponse = (request, error, requestConfig) => {
  const config = error.config
  const {
    legalBlocked,
    logoutRequired,
    rateLimited,
    twoFactorRequired,
  } = requestConfig.responseCodes
  const { skipRetryKey } = requestConfig.twoFactor

  if (isCancelledError(error)) {
    completeLogicalRequest(config)
    return rejectCancelledRequest(error, requestConfig)
  }

  if (isCancelledByLogout(config, requestConfig)) {
    completeLogicalRequest(config)
    return rejectLogoutCancelledRequest(config, requestConfig)
  }

  if (isTimeoutError(error, requestConfig)) {
    if (shouldRetryTimeout(error, requestConfig)) {
      return retryTimeoutRequest(request, error, requestConfig)
    }

    completeLogicalRequest(config)
    return Promise.reject(error.response?.data || error)
  }

  if (error.response) {
    const responseData = error.response.data
    const responseCode = responseData?.code
    const responseStatus = error.response.status

    if (
      responseStatus === twoFactorRequired ||
      responseCode === twoFactorRequired
    ) {
      if (config?.[skipRetryKey]) {
        completeLogicalRequest(config)
        return Promise.reject(responseData)
      }

      return handleTwoFactorResponse(
        request,
        config,
        responseData?.data || {},
        requestConfig,
      )
    }

    if (
      responseStatus === legalBlocked ||
      responseCode === legalBlocked
    ) {
      return handleLegalBlockResponse(config, responseData, requestConfig)
    }

    if (
      responseStatus === rateLimited ||
      responseCode === rateLimited
    ) {
      return handleRateLimitResponse(config, responseData, requestConfig)
    }

    if (responseCode === logoutRequired) {
      return handleLogoutResponse(config, responseData, requestConfig)
    }

    if (responseCode !== undefined && responseCode !== null) {
      completeLogicalRequest(config)
      return Promise.reject(responseData)
    }
  }

  completeLogicalRequest(config)

  if (
    error.code === 'ERR_NETWORK' ||
    error.code === 'ERR_NETWORK_CHANGED'
  ) {
    handleNetworkError(error)
  }

  return Promise.reject(error.response?.data || error)
}

export function installResponseInterceptor(request, requestConfig) {
  request.interceptors.response.use(
    response => handleSuccessResponse(request, response, requestConfig),
    error => handleErrorResponse(request, error, requestConfig),
  )
}
