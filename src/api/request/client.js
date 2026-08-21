import axios from 'axios'
import { installRequestInterceptor } from './requestInterceptor.js'
import { installResponseInterceptor } from './responseInterceptor.js'

// 配置错误应在应用启动时暴露，避免运行中静默关闭超时或重试保护。
const assertFiniteNumber = (value, name, { minimum = 0 } = {}) => {
  if (!Number.isFinite(value) || value < minimum) {
    throw new TypeError(`${name} must be a finite number greater than or equal to ${minimum}`)
  }
}

const validateRequestConfig = (requestConfig) => {
  const { axios: axiosConfig, retry, twoFactor } = requestConfig

  assertFiniteNumber(axiosConfig.timeout, 'REQUEST_CONFIG.axios.timeout')
  assertFiniteNumber(retry.maxAttempts, 'REQUEST_CONFIG.retry.maxAttempts', {
    minimum: 1,
  })
  assertFiniteNumber(
    twoFactor.requestTimeout,
    'REQUEST_CONFIG.twoFactor.requestTimeout',
    { minimum: 1 },
  )

  if (!Number.isInteger(retry.maxAttempts)) {
    throw new TypeError('REQUEST_CONFIG.retry.maxAttempts must be an integer')
  }
  if (
    !Array.isArray(retry.delays) ||
    retry.delays.length < retry.maxAttempts - 1
  ) {
    throw new TypeError(
      'REQUEST_CONFIG.retry.delays must cover every retry attempt',
    )
  }

  retry.delays.forEach((delay, index) => {
    assertFiniteNumber(delay, `REQUEST_CONFIG.retry.delays[${index}]`)
  })
}

export function createRequestClient(requestConfig) {
  validateRequestConfig(requestConfig)
  const request = axios.create(requestConfig.axios)

  installRequestInterceptor(request, requestConfig)
  installResponseInterceptor(request, requestConfig)

  return request
}
