import { Message } from 'view-ui-plus'
import router from '@/router/index.js'
import i18n from '@/locales/index.js'
import { createApp, h } from 'vue'
import { createMemoryHistory, createRouter } from 'vue-router'
import { prepareNextAttempt } from './pendingRequestManager.js'

const t = i18n.global.t

let currentRequest = null
let verificationApp = null
let containerElement = null
let activeContainerClass = ''

function clear2FARequestTimeout(requestState) {
  if (!requestState?.timeoutId) return
  clearTimeout(requestState.timeoutId)
  requestState.timeoutId = null
}

function settleCurrentRequest(requestState, action, payload) {
  if (!requestState || currentRequest !== requestState) return false
  clear2FARequestTimeout(requestState)
  currentRequest = null
  requestState[action](payload)
  return true
}

export function cancelCurrentTwoFactor(code) {
  const requestState = currentRequest
  if (!requestState) return

  settleCurrentRequest(requestState, 'reject', {
    code,
    msg: requestState.requestConfig.silentErrorMessage,
  })
  destroyVerificationComponent()
}

async function createVerificationComponent(verifyData, requestState) {
  destroyVerificationComponent()

  const { default: TwoFactorAuth } = await import(
    '@/views/ucenter/components/TwoFactorAuth.vue'
  )

  if (currentRequest !== requestState) return null

  const { containerClass } = requestState.requestConfig.twoFactor
  activeContainerClass = containerClass
  containerElement = document.createElement('div')
  containerElement.className = containerClass
  document.body.appendChild(containerElement)

  const isLoginPage = router.currentRoute.value.name === 'login'
  const eventType = isLoginPage ? 'login' : 'validate'

  verificationApp = createApp({
    data() {
      return {
        visible: true,
        email: verifyData.email || '',
        googleAuthStatus: verifyData.google_auth_status || 0,
      }
    },
    methods: {
      onVerificationSuccess(data) {
        this.visible = true

        if (!currentRequest) {
          destroyVerificationComponent()
          return
        }

        const activeRequest = currentRequest
        const { twoFactor } = activeRequest.requestConfig
        let config = prepareNextAttempt(activeRequest.config, 1)

        try {
          if (config.method && config.method.toLowerCase() === 'post') {
            if (typeof FormData !== 'undefined' && config.data instanceof FormData) {
              const nextData = new FormData()
              config.data.forEach((value, key) => nextData.append(key, value))
              nextData.set('verifyType', data.verifyType)
              nextData.set('code', data.code)
              config.data = nextData
            } else if (typeof config.data === 'string') {
              const nextData = JSON.parse(config.data)
              config.data = JSON.stringify({
                ...nextData,
                verifyType: data.verifyType,
                code: data.code,
              })
            } else {
              config.data = {
                ...(config.data || {}),
                verifyType: data.verifyType,
                code: data.code,
              }
            }
          } else {
            config.params = {
              ...(config.params || {}),
              verifyType: data.verifyType,
              code: data.code,
            }
          }
        } catch {
          if (settleCurrentRequest(activeRequest, 'reject', {
            code: twoFactor.codes.unavailable,
            msg: t('twoFactorAuth.verificationCollectionFailed'),
          })) {
            destroyVerificationComponent()
          }
          return
        }

        config[twoFactor.skipRetryKey] = true
        clear2FARequestTimeout(activeRequest)

        activeRequest.retry(config).then(responseData => {
          const completedVerificationApp = verificationApp
          if (!settleCurrentRequest(activeRequest, 'resolve', responseData)) return

          setTimeout(() => {
            destroyVerificationComponent(completedVerificationApp)
            if (config.url && config.url === '/user/auth/login') {
              setTimeout(() => {
                window.location.reload()
              }, 100)
            }
          }, 500)
        }).catch(error => {
          const errorData = error?.response?.data || (
            error && typeof error === 'object'
              ? { code: error.code, msg: error.msg || error.message }
              : { msg: error }
          )

          if (settleCurrentRequest(activeRequest, 'reject', errorData)) {
            destroyVerificationComponent()
          }
        })
      },

      onVerificationFailed(message) {
        if (
          this.$refs.twoFactorAuth &&
          typeof this.$refs.twoFactorAuth.handleFailedVerification === 'function'
        ) {
          this.$refs.twoFactorAuth.handleFailedVerification(message)
        }
      },

      onCancel() {
        const activeRequest = currentRequest
        if (activeRequest) {
          settleCurrentRequest(activeRequest, 'reject', {
            code: activeRequest.requestConfig.twoFactor.codes.cancelled,
            msg: activeRequest.requestConfig.silentErrorMessage,
            cancelled: true,
          })
        }

        this.visible = false
        destroyVerificationComponent()
      },

      onEnableGoogle() {
        const activeRequest = currentRequest
        if (activeRequest) {
          settleCurrentRequest(activeRequest, 'reject', {
            code: activeRequest.requestConfig.twoFactor.codes.enableGoogle,
            msg: '用户前往开启谷歌验证器',
          })
        }

        this.visible = false
        destroyVerificationComponent()

        const currentPath = router.currentRoute.value.path
        const targetPath = '/ucenter/security'

        if (currentPath === targetPath || currentPath.startsWith(`${targetPath}/`)) {
          window.location.reload()
        } else {
          router.push(targetPath)
        }
      },

      reset() {
        if (this.$refs.twoFactorAuth) {
          this.$refs.twoFactorAuth.reset()
        }
      },

      showVerificationError(errorData) {
        this.visible = true
        if (
          this.$refs.twoFactorAuth &&
          typeof this.$refs.twoFactorAuth.handleFailedVerification === 'function'
        ) {
          this.$refs.twoFactorAuth.handleFailedVerification(errorData)
        }
      },
    },
    render() {
      const isChangeEmailRequest = currentRequest?.config.url === '/user/auth/changeEmail'

      return h(TwoFactorAuth, {
        ref: 'twoFactorAuth',
        modelValue: this.visible,
        'onUpdate:modelValue': val => this.visible = val,
        showEmail: !isChangeEmailRequest,
        showGoogle: this.googleAuthStatus === 1,
        userEmail: this.email,
        readOnlyEmail: true,
        scene: 'login',
        eventType,
        onVerificationSuccess: this.onVerificationSuccess,
        onVerificationFailed: this.onVerificationFailed,
        onCancel: this.onCancel,
        onEnableGoogle: this.onEnableGoogle,
      })
    },
  })

  const DummyComponent = { template: '<div></div>' }
  const emptyRouter = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/login', name: 'login', component: DummyComponent },
      { path: '/ucenter/security', name: 'security', component: DummyComponent },
      { path: '/:pathMatch(.*)*', component: DummyComponent },
    ],
  })

  emptyRouter.beforeEach((to, from, next) => next(false))

  verificationApp.use(emptyRouter)
  return verificationApp.mount(containerElement)
}

function blurActiveVerificationInput() {
  const activeElement = document.activeElement
  if (
    activeElement?.classList?.contains('e-code-input') ||
    activeElement?.classList?.contains('g-code-input')
  ) {
    activeElement.blur()
  }
}

function destroyVerificationComponent(expectedApp = verificationApp) {
  if (verificationApp !== expectedApp) return

  blurActiveVerificationInput()

  if (verificationApp) {
    try {
      verificationApp.unmount()
    } catch {
    }
  }

  if (containerElement?.parentNode) {
    containerElement.parentNode.removeChild(containerElement)
  }

  if (activeContainerClass) {
    document.querySelectorAll(`.${activeContainerClass}:empty`).forEach(element => {
      element.parentNode?.removeChild(element)
    })
  }

  verificationApp = null
  containerElement = null
  activeContainerClass = ''
}

export function handleTwoFactorRequest({
  config,
  verifyData,
  retry,
  requestConfig,
}) {
  return new Promise((resolve, reject) => {
    if (currentRequest) {
      Message.warning('请先完成当前安全验证')
      reject({
        code: requestConfig.twoFactor.codes.busy,
        msg: '已有安全验证正在进行',
      })
      return
    }

    const requestState = {
      config,
      retry,
      requestConfig,
      resolve,
      reject,
      timeoutId: null,
    }

    currentRequest = requestState
    requestState.timeoutId = setTimeout(() => {
      if (settleCurrentRequest(requestState, 'reject', {
        code: requestConfig.twoFactor.codes.timeout,
        msg: t('twoFactorAuth.verificationFailedRetry'),
      })) {
        destroyVerificationComponent()
      }
    }, requestConfig.twoFactor.requestTimeout)

    createVerificationComponent(verifyData, requestState).catch(() => {
      if (settleCurrentRequest(requestState, 'reject', {
        code: requestConfig.twoFactor.codes.unavailable,
        msg: t('twoFactorAuth.verificationCollectionFailed'),
      })) {
        destroyVerificationComponent()
      }
    })
  })
}
