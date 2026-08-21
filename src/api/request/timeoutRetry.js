import {
  completeLogicalRequest,
  getCancelReason,
  isCurrentLogicalRequest,
  prepareNextAttempt,
  releaseRequestAttempt,
} from './pendingRequestManager.js'

const wait = delay => new Promise(resolve => setTimeout(resolve, delay))

export const isTimeoutError = (error, requestConfig) => (
  requestConfig.retry.timeoutErrorCodes.has(error?.code)
)

export const shouldRetryTimeout = (error, requestConfig) => {
  const meta = error?.config?.__requestMeta
  return Boolean(
    isTimeoutError(error, requestConfig) &&
    meta?.retryOnTimeout &&
    meta.attempt < meta.maxAttempts,
  )
}

const createCancelledError = (config, requestConfig) => ({
  code: 'ERR_CANCELED',
  msg: requestConfig.silentErrorMessage,
  cancelled: true,
  silent: true,
  reason: getCancelReason(config, requestConfig.cancelReasons),
})

export async function retryTimeoutRequest(request, error, requestConfig) {
  const config = error.config
  const meta = config.__requestMeta
  const nextAttempt = meta.attempt + 1
  const { delays } = requestConfig.retry
  const delay = delays[meta.attempt - 1] ?? delays[delays.length - 1]

  releaseRequestAttempt(config)
  await wait(delay)

  if (!isCurrentLogicalRequest(config) || meta.externalSignal?.aborted) {
    const cancelledError = createCancelledError(config, requestConfig)
    completeLogicalRequest(config)
    return Promise.reject(cancelledError)
  }

  return request(prepareNextAttempt(config, nextAttempt))
}
