const activeRequests = new Map()
const pendingRequests = new Map()
let requestSequence = 0

const createRequestId = () => `request-${Date.now()}-${++requestSequence}`

const getAbortReason = (signal, userReason) => (
  typeof signal?.reason === 'string'
    ? signal.reason
    : userReason
)

const cancelLogicalRequest = (meta, cancelReason) => {
  if (!meta || meta.cancelled) return

  meta.cancelled = true
  meta.cancelReason = cancelReason

  const cancelHandler = meta.cancelHandler
  meta.cancelHandler = null
  cancelHandler?.(cancelReason)
  meta.controller?.abort(cancelReason)
}

export function createRequestMeta(config, policy) {
  const currentMeta = config.__requestMeta
  if (currentMeta?.id) {
    return {
      ...currentMeta,
      maxAttempts: policy.maxAttempts,
      takeLatestKey: policy.takeLatestKey,
      controller: null,
      detachExternalSignal: null,
      cancelReason: '',
    }
  }

  return {
    id: createRequestId(),
    attempt: 1,
    maxAttempts: policy.maxAttempts,
    takeLatestKey: policy.takeLatestKey,
    controller: null,
    detachExternalSignal: null,
    externalSignal: config.signal || null,
    cancelReason: '',
    cancelled: false,
  }
}

export function registerPendingRequest(config, meta, cancelReasons) {
  const { takeLatestKey } = meta
  if (takeLatestKey) {
    const previous = activeRequests.get(takeLatestKey)
    if (previous && previous.meta.id !== meta.id) {
      cancelLogicalRequest(previous.meta, cancelReasons.takeLatest)
    }
  }

  const controller = new AbortController()
  const externalSignal = meta.externalSignal
  let detachExternalSignal = null

  if (externalSignal) {
    const handleExternalAbort = () => {
      meta.cancelReason = getAbortReason(
        externalSignal,
        cancelReasons.user,
      )
      controller.abort(meta.cancelReason)
    }

    if (externalSignal.aborted) {
      handleExternalAbort()
    } else {
      externalSignal.addEventListener('abort', handleExternalAbort, { once: true })
      detachExternalSignal = () => {
        externalSignal.removeEventListener('abort', handleExternalAbort)
      }
    }
  }

  meta.controller = controller
  meta.detachExternalSignal = detachExternalSignal
  config.signal = controller.signal
  config.__requestMeta = meta

  pendingRequests.set(meta.id, meta)

  if (takeLatestKey) {
    activeRequests.set(takeLatestKey, {
      controller,
      meta,
    })
  }

  return config
}

export function releaseRequestAttempt(config) {
  const meta = config?.__requestMeta
  if (!meta) return

  meta.detachExternalSignal?.()
  meta.detachExternalSignal = null
  meta.controller = null
}

export function completeLogicalRequest(config) {
  const meta = config?.__requestMeta
  if (!meta) return

  releaseRequestAttempt(config)
  meta.cancelHandler = null

  if (pendingRequests.get(meta.id) === meta) {
    pendingRequests.delete(meta.id)
  }

  if (!meta.takeLatestKey) return

  const current = activeRequests.get(meta.takeLatestKey)
  if (current?.meta === meta) {
    activeRequests.delete(meta.takeLatestKey)
  }
}

export function isCurrentLogicalRequest(config) {
  const meta = config?.__requestMeta
  if (!meta || meta.cancelled) return false
  if (pendingRequests.get(meta.id) !== meta) return false
  if (!meta.takeLatestKey) return true

  return activeRequests.get(meta.takeLatestKey)?.meta === meta
}

export function prepareNextAttempt(config, attempt) {
  const meta = config.__requestMeta
  const nextConfig = {
    ...config,
    __requestMeta: {
      ...meta,
      attempt,
      controller: null,
      detachExternalSignal: null,
      cancelReason: '',
    },
  }

  if (meta?.externalSignal) {
    nextConfig.signal = meta.externalSignal
  } else {
    delete nextConfig.signal
  }

  return nextConfig
}

export function setLogicalRequestCancelHandler(config, cancelHandler) {
  const meta = config?.__requestMeta
  if (!meta) return
  meta.cancelHandler = cancelHandler
}

export function cancelAllPendingRequests(cancelReason) {
  const requests = Array.from(pendingRequests.values())

  requests.forEach(meta => {
    cancelLogicalRequest(meta, cancelReason)
    meta.detachExternalSignal?.()
    meta.detachExternalSignal = null
    meta.controller = null

    if (pendingRequests.get(meta.id) === meta) {
      pendingRequests.delete(meta.id)
    }

    if (!meta.takeLatestKey) return

    const current = activeRequests.get(meta.takeLatestKey)
    if (current?.meta === meta) {
      activeRequests.delete(meta.takeLatestKey)
    }
  })
}

export function getCancelReason(config, cancelReasons) {
  const meta = config?.__requestMeta
  return meta?.cancelReason || getAbortReason(
    config?.signal,
    cancelReasons.user,
  )
}
