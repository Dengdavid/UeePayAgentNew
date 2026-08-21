<template>
  <Modal
    v-model="drawerVisible"
    :title="drawerTitle"
    footer-hide
    width="420"
    class-name="two-factor-auth-modal vertical-center-modal"
    :mask-closable="false"
    @on-cancel="handleCancel"
  >
    <template #header>
      <h3 class="title">{{ t('twoFactorAuth.title') }}</h3>
    </template>
    <div class="two-factor-auth-container">
      <template v-if="hasAvailableMethod">
        <div v-if="showAuthTabs" class="auth-tabs" role="tablist">
          <button
            v-if="showEmail"
            type="button"
            class="auth-tab"
            :class="{ active: currentStep === 'email' }"
            role="tab"
            :aria-selected="currentStep === 'email'"
            @click="selectVerificationMethod('email')"
          >
            <img class="auth-tab-icon" src="@/assets/images/two_email.png" alt="" />
            <span
              class="auth-tab-label"
              :title="t('twoFactorAuth.emailVerification')"
            >
              {{ t('twoFactorAuth.emailVerification') }}
            </span>
          </button>
          <button
            v-if="showGoogle"
            type="button"
            class="auth-tab"
            :class="{ active: currentStep === 'google' }"
            role="tab"
            :aria-selected="currentStep === 'google'"
            @click="selectVerificationMethod('google')"
          >
            <img class="auth-tab-icon" src="@/assets/images/two_google.png" alt="" />
            <span
              class="auth-tab-label"
              :title="t('twoFactorAuth.googleAuthenticator')"
            >
              {{ t('twoFactorAuth.googleAuthenticator') }}
            </span>
            <span class="method-recommend">{{ t('twoFactorAuth.recommended') }}</span>
          </button>
          <button
            v-if="showGoogleEnableEntry"
            type="button"
            class="auth-tab auth-tab-disabled"
            @click="goToEnableGoogle"
          >
            <img class="auth-tab-icon" src="@/assets/images/two_google.png" alt="" />
            <span
              class="auth-tab-label"
              :title="t('twoFactorAuth.googleAuthenticator')"
            >
              {{ t('twoFactorAuth.googleAuthenticator') }}
            </span>
            <span class="method-status">{{ t('twoFactorAuth.notEnabled') }}</span>
          </button>
        </div>
        <!-- 邮箱验证 -->
        <div  class="auth-step-verify list-b-16">
          <template v-if="currentStep === 'email'">
            <div class="auth-method-panel">
              <div class="auth-method-copy">
                <div class="auth-method-desc">
                  {{ codeSent ? t('twoFactorAuth.codeSentTo') : t('twoFactorAuth.requestCodeTo') }}
                  <span>{{ maskEmail(userEmail || emailInput) }}</span>
                </div>
                <div class="auth-method-tip">{{ t('twoFactorAuth.checkSpam') }}</div>
              </div>
            </div>
            <div class="verification-code-area">
              <div class="code-label">{{ t('twoFactorAuth.emailCodeLabel') }}</div>
              <div class="email-code-inputs">
                <input
                  v-for="(code, index) in emailCodeArray"
                  :key="index"
                  ref="emailCodeInputs"
                  type="text"
                  inputmode="numeric"
                  pattern="[0-9]*"
                  maxlength="1"
                  autocomplete="off"
                  autocapitalize="off"
                  spellcheck="false"
                  data-1p-ignore="true"
                  data-lpignore="true"
                  data-bwignore="true"
                  class="e-code-input"
                  :class="{ 'error': verifyError }"
                  :value="code"
                  @input="(e) => handleCodeInput('email', e, index)"
                  @keydown="(e) => handleCodeKeyDown('email', e, index)"
                  @paste="(e) => handleCodePaste('email', e)"
                  :disabled="submiting"
                />
              </div>
              <div class="send-code-action">
                <Button
                  type="primary"
                  size="large"
                  long
                  :loading="sendingEmailCode"
                  :disabled="isCodeCoolingDown || submiting"
                  @click="sendEmailCode"
                >
                  {{ isCodeCoolingDown ? t('twoFactorAuth.resendCountdown', { seconds: countdown }) : (codeSent ? t('twoFactorAuth.resendCode') : t('twoFactorAuth.getCode')) }}
                </Button>
              </div>
            </div>
          </template>
          <template v-else-if="currentStep === 'google'">
            <div class="auth-method-panel">
              <div class="auth-method-copy">
                <div class="auth-method-desc">{{ t('twoFactorAuth.googleCodeDescription') }}</div>
                <div class="auth-method-tip">{{ t('twoFactorAuth.googleCodeTip') }}</div>
              </div>
            </div>
            <div class="google-code-area">
              <div class="code-label">{{ t('twoFactorAuth.googleCodeLabel') }}</div>
              <div class="google-code-inputs">
                <input
                  v-for="(code, index) in googleCodeArray"
                  :key="index"
                  ref="googleCodeInputs"
                  type="text"
                  inputmode="numeric"
                  pattern="[0-9]*"
                  maxlength="1"
                  autocomplete="off"
                  autocapitalize="off"
                  spellcheck="false"
                  data-1p-ignore="true"
                  data-lpignore="true"
                  data-bwignore="true"
                  class="g-code-input"
                  :class="{ 'error': verifyError }"
                  :value="code"
                  @input="(e) => handleCodeInput('google', e, index)"
                  @keydown="(e) => handleCodeKeyDown('google', e, index)"
                  @paste="(e) => handleCodePaste('google', e)"
                  :disabled="submiting"
                />
              </div>
              <div class="send-code-action send-code-placeholder" aria-hidden="true"></div>
            </div>
          </template>
          <!-- 提交状态提示 -->
          <div v-if="submiting" class="submitting-tip">
            {{ t('twoFactorAuth.verifying') }}
          </div>
          <!-- 错误提示 -->
          <div v-else-if="verifyError" class="verify-error">
            {{ errorMessage || t('twoFactorAuth.verificationFailedReenter') }}
          </div>
        </div>
        <div class="security-note">
          <span class="iconfont icon-shujuanquan" aria-hidden="true"></span>
          <span>{{ t('twoFactorAuth.securityNotice') }}</span>
        </div>
      </template>
      <!-- 无可用验证方式时显示提示 -->
      <div v-else class="auth-no-method">
        <Icon type="ios-alert" />
        <p>{{ t('twoFactorAuth.noAvailableMethod') }}</p>
        <Button
          v-if="showGoogleEnableEntry"
          type="primary"
          size="large"
          @click="goToEnableGoogle"
        >
          {{ t('twoFactorAuth.enableGoogle') }}
        </Button>
      </div>
    </div>
  </Modal>
</template>

<script setup>
import { ref, computed, nextTick, onBeforeUnmount, watch } from 'vue'
import { Modal, Button, Icon } from 'view-ui-plus'
import { message } from '@/utils/message.js'
import { t } from '@/utils'
import userApi from '@/api/user.js'
import { useUserStore } from '@/store/user'

const CODE_LENGTH = 6
const COUNTDOWN_SECONDS = 60
const VERIFY_CODE_ERROR = -990
const VERIFY_ERROR_KEYWORDS = ['验证码错误', '邮箱验证码错误']
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const createCodeArray = () => Array(CODE_LENGTH).fill('')
const isCodeComplete = (codeArray) => codeArray.every(Boolean) && codeArray.length === CODE_LENGTH

const userStore = useUserStore();

// 判断用户是否已登录
const isUserLoggedIn = computed(() => {
  return userStore.user && userStore.user.id;
});

const props = defineProps({
  // 控制Drawer显示
  modelValue: {
    type: Boolean,
    default: false
  },
  // 是否显示邮箱验证选项
  showEmail: {
    type: Boolean,
    default: true
  },
  // 是否显示Google验证器选项
  showGoogle: {
    type: Boolean,
    default: true
  },
  // 用户邮箱(如果已有)
  userEmail: {
    type: String,
    default: ''
  },
  // 邮箱是否只读(不可修改)
  readOnlyEmail: {
    type: Boolean,
    default: true
  },
  // 验证事件类型
  eventType: {
    type: String,
    default: 'validate'
  },
  // 使用场景，login=登录场景，其他=普通场景
  scene: {
    type: String,
    default: 'default'
  }
})

const emit = defineEmits([
  'update:modelValue',
  'verification-success',
  'verification-failed',
  'cancel',
  'enable-google'
])

// Drawer显示状态
const drawerVisible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const drawerTitle = computed(() => {
  return t('twoFactorAuth.title')
})

const defaultAuthMethod = computed(() => {
  if (props.showGoogle) return 'google'
  if (props.showEmail) return 'email'
  return ''
})

const availableAuthMethods = computed(() => {
  const methods = []
  if (props.showGoogle) methods.push('google')
  if (props.showEmail) methods.push('email')
  return methods
})

const showGoogleEnableEntry = computed(() => !props.showGoogle && isUserLoggedIn.value)
const showAuthTabs = computed(() => {
  return availableAuthMethods.value.length > 1 || (props.showEmail && showGoogleEnableEntry.value)
})

// 当前验证方式：email邮箱验证, google谷歌验证器
const currentStep = ref(defaultAuthMethod.value)

// 邮箱验证相关状态
const emailInput = ref(props.userEmail || '')
const emailCode = computed(() => emailCodeArray.value.join(''))
const emailCodeArray = ref(createCodeArray())
const emailCodeInputs = ref([])
const isValidEmail = computed(() => {
  return EMAIL_REGEX.test(emailInput.value || props.userEmail)
})
const isEmailCodeComplete = computed(() => {
  return isCodeComplete(emailCodeArray.value)
})
const sendingEmailCode = ref(false)
const codeSent = ref(false)
const countdown = ref(0)
const isCodeCoolingDown = computed(() => countdown.value > 0)
let countdownTimer = null

// 遮蔽邮箱显示，保护隐私
const maskEmail = (email) => {
  if (!email) return '';

  // 查找@符号位置
  const atIndex = email.indexOf('@');
  if (atIndex <= 1) return email; // 如果@符号之前只有一个或没有字符，直接返回

  // 处理用户名部分
  const username = email.slice(0, atIndex);
  const domain = email.slice(atIndex);

  // 如果用户名长度大于3，则保留首尾字符，中间用***替代
  let maskedUsername;
  if (username.length > 3) {
    maskedUsername = username.charAt(0) + '***' + username.charAt(username.length - 1);
  } else if (username.length > 1) {
    // 如果用户名只有2-3个字符，则只保留第一个字符
    maskedUsername = username.charAt(0) + '***';
  } else {
    maskedUsername = username;
  }

  return maskedUsername + domain;
}

// 谷歌验证器相关状态
const googleCodeArray = ref(createCodeArray())
const googleCodeInputs = ref([])
const isGoogleCodeComplete = computed(() => {
  return isCodeComplete(googleCodeArray.value)
})

// 提交状态
const submiting = ref(false)
// 添加错误状态
const verifyError = ref(false)
const errorMessage = ref('')

// 计算属性：是否至少有一个可用选项
const hasAvailableMethod = computed(() => {
  return availableAuthMethods.value.length > 0;
})

// 选择验证方式
const selectVerificationMethod = (method) => {
  // 如果选择了google但没有开启，则提示用户去开启
  if (method === 'google' && !props.showGoogle) {
    goToEnableGoogle();
    return;
  }

  // 在登录场景下，如果选择了google但没有开启，则强制使用email
  if (props.scene === 'login' && method === 'google' && !props.showGoogle) {
    method = 'email'
  }

  currentStep.value = method
  resetError()

  // 如果选择了谷歌验证器，自动聚焦到第一个输入框
  if (method === 'google') {
    focusCodeInput(googleCodeInputs, 0)
  } else if (method === 'email') {
    focusCodeInput(emailCodeInputs, 0)
  }
}

// 重置错误状态
const resetError = () => {
  verifyError.value = false
  errorMessage.value = ''
}

const resetCurrentCode = () => {
  const authConfig = verificationMap[currentStep.value]
  if (!authConfig) return

  authConfig.codeArray.value = createCodeArray()
  focusCodeInput(authConfig.inputs, 0)
}

const resetForRetry = () => {
  resetError()
  resetCurrentCode()
}

const verificationMap = {
  email: {
    codeArray: emailCodeArray,
    inputs: emailCodeInputs,
    submit: () => submitEmailVerification()
  },
  google: {
    codeArray: googleCodeArray,
    inputs: googleCodeInputs,
    submit: () => submitGoogleVerification()
  }
}

const focusCodeInput = (inputs, index) => {
  nextTick(() => {
    inputs.value[index]?.focus()
  })
}

const blurActiveCodeInput = () => {
  const activeElement = document.activeElement
  if (activeElement?.classList?.contains('e-code-input') || activeElement?.classList?.contains('g-code-input')) {
    activeElement.blur()
  }
}

const handleCodeInput = (type, e, index) => {
  resetError()

  const { codeArray, inputs, submit } = verificationMap[type]
  const value = e.target.value.replace(/\D/g, '').slice(-1)
  codeArray.value[index] = value

  if (!value) return

  if (index < CODE_LENGTH - 1) {
    focusCodeInput(inputs, index + 1)
  } else if (isCodeComplete(codeArray.value)) {
    submit()
  }
}

const handleCodeKeyDown = (type, e, index) => {
  const { codeArray, inputs } = verificationMap[type]

  if (e.key === 'Backspace') {
    if (!codeArray.value[index] && index > 0) {
      codeArray.value[index - 1] = ''
      focusCodeInput(inputs, index - 1)
    }
  } else if (e.key === 'ArrowLeft' && index > 0) {
    e.preventDefault()
    focusCodeInput(inputs, index - 1)
  } else if (e.key === 'ArrowRight' && index < CODE_LENGTH - 1) {
    e.preventDefault()
    focusCodeInput(inputs, index + 1)
  }
}

const handleCodePaste = (type, e) => {
  e.preventDefault()

  const { codeArray, inputs, submit } = verificationMap[type]
  const digits = e.clipboardData.getData('text').replace(/\D/g, '').substring(0, CODE_LENGTH)

  digits.split('').forEach((digit, index) => {
    codeArray.value[index] = digit
  })

  nextTick(() => {
    const focusIndex = Math.min(digits.length, CODE_LENGTH - 1)
    inputs.value[focusIndex]?.focus()

    if (isCodeComplete(codeArray.value)) {
      submit()
    }
  })
}

// 发送邮箱验证码
const sendEmailCode = async () => {
  const targetEmail = props.userEmail || emailInput.value

  if (!targetEmail) {
    message(t('twoFactorAuth.emailUnavailable'), 'error')
    return
  }

  // 在登录场景下，即使email_status为0也允许发送验证码
  if (props.scene !== 'login' && !isValidEmail.value) {
    message(t('twoFactorAuth.invalidEmail'), 'error')
    return
  }

  if (sendingEmailCode.value || isCodeCoolingDown.value) return

  try {
    sendingEmailCode.value = true
    const response = await userApi.sendEmail({
      email: targetEmail,
      event: props.eventType
    })

    if (response === true || response?.code === 1 || response?.data === true || response?.code === undefined) {
      message(t('twoFactorAuth.codeSentSuccess'))
      codeSent.value = true
      startCountdown()
      focusCodeInput(emailCodeInputs, 0)
    } else {
      message(response.msg || t('twoFactorAuth.sendCodeFailed'), 'error')
    }
  } catch (error) {
    message(error?.msg || t('twoFactorAuth.sendCodeRetry'), 'error')
  } finally {
    sendingEmailCode.value = false
  }
}

// 开始倒计时
const startCountdown = () => {
  countdown.value = COUNTDOWN_SECONDS

  clearInterval(countdownTimer)
  countdownTimer = setInterval(() => {
    countdown.value--
    if (countdown.value <= 0) {
      clearInterval(countdownTimer)
      countdownTimer = null
    }
  }, 1000)
}

// 提交邮箱验证
const submitEmailVerification = () => {
  if (submiting.value) return

  submiting.value = true
  resetError()

  try {
    if (!isEmailCodeComplete.value) {
      message(t('twoFactorAuth.emailCodeLabel'), 'error')
      submiting.value = false
      return
    }

    // 返回邮箱验证信息给父组件
    blurActiveCodeInput()
    emit('verification-success', {
      type: 'email',
      verifyType: 1,
      email: props.userEmail || emailInput.value,
      code: emailCode.value
    })
    drawerVisible.value = false

  } catch (error) {
    errorMessage.value = t('twoFactorAuth.verificationFailedRetry')
    verifyError.value = true
    emit('verification-failed', t('twoFactorAuth.verificationCollectionFailed'))
    submiting.value = false
  }
}

// 提交谷歌验证
const submitGoogleVerification = () => {
  if (submiting.value) return

  submiting.value = true
  resetError()

  try {
    const code = googleCodeArray.value.join('')
    if (!isGoogleCodeComplete.value) {
      message(t('twoFactorAuth.googleCodeLabel'), 'error')
      submiting.value = false
      return
    }

    // 返回谷歌验证信息给父组件
    blurActiveCodeInput()
    emit('verification-success', {
      type: 'google',
      verifyType: 2,
      code: code
    })
    drawerVisible.value = false

  } catch (error) {
    errorMessage.value = t('twoFactorAuth.verificationFailedRetry')
    verifyError.value = true
    emit('verification-failed', t('twoFactorAuth.verificationCollectionFailed'))
    submiting.value = false
  }
}

// 处理验证失败事件
const handleFailedVerification = (error) => {
  const errorCode = typeof error === 'object' && error !== null ? error.code : undefined
  const messageText = typeof error === 'object' && error !== null ? error.msg : error
  const isVerifyCodeError = errorCode === VERIFY_CODE_ERROR ||
    VERIFY_ERROR_KEYWORDS.some((keyword) => String(messageText || '').includes(keyword))

  if (!isVerifyCodeError) {
    drawerVisible.value = false
    reset()
    return
  }

  errorMessage.value = messageText || t('twoFactorAuth.invalidCodeReenter')
  verifyError.value = true
  submiting.value = false
  drawerVisible.value = true
  resetCurrentCode()
}

// 取消操作
const handleCancel = () => {
  blurActiveCodeInput()
  emit('cancel')
  reset()
}

// 重置状态
const reset = () => {
  currentStep.value = defaultAuthMethod.value
  emailInput.value = props.userEmail || emailInput.value
  emailCodeArray.value = createCodeArray()
  googleCodeArray.value = createCodeArray()
  codeSent.value = false
  clearInterval(countdownTimer)
  countdownTimer = null
  countdown.value = 0
  submiting.value = false
  resetError()
}

// 当抽屉显示状态改变时
watch(() => drawerVisible.value, (newVal) => {
  if (newVal) {
    reset()
  } else {
    blurActiveCodeInput()
  }
})

watch(availableAuthMethods, (methods) => {
  if (!methods.includes(currentStep.value)) {
    currentStep.value = defaultAuthMethod.value
  }
})

// 在组件卸载前清除计时器
onBeforeUnmount(() => {
  blurActiveCodeInput()
  if (countdownTimer) {
    clearInterval(countdownTimer)
  }
})

// 向父组件暴露的方法
defineExpose({
  reset,
  handleFailedVerification
})

// 添加goToEnableGoogle函数
const goToEnableGoogle = () => {
  // 关闭抽屉
  blurActiveCodeInput()
  drawerVisible.value = false;

  // 统一使用事件通知父组件处理跳转
  emit('enable-google');
};
</script>

<style lang="less" scoped>
.title{
  font-size: 16px;
}
.two-factor-auth-container {
  position: relative;
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* 验证步骤 */
.auth-step-verify {
  display: flex;
  flex-direction: column;
  padding-top: 0;
  min-height:248px;
}
.auth-tabs {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: var(--ui-padding-4);
  border: var(--ui-border-muted);
  border-radius: var(--ui-radius-lg);
  background: #f7f8fa;
}

.auth-tab {
  position: relative;
  flex: 1;
  min-width: 0;
  padding: var(--ui-padding-0-6);
  white-space: nowrap;
  height: var(--ui-size-38);
  border: 0;
  border-radius: var(--ui-radius-6);
  background: transparent;
  color: var(--ui-color-control-text);
  font-size: 14px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  transition: color 0.2s ease, background 0.2s ease, box-shadow 0.2s ease;
}

.auth-tab:hover {
  color: var(--ui-color-info);
}

.auth-tab.active {
  background: #fff;
  color: var(--ui-color-info);
  font-weight: 500;
  box-shadow: 0 2px 8px rgba(45, 140, 240, 0.12);
}

.auth-tab-icon {
  flex-shrink: 0;
  width: var(--ui-size-18);
  height: var(--ui-size-18);
  object-fit: contain;
}

.auth-tab-label {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.auth-tab-disabled {
  color: var(--ui-color-control-text-muted);
}

.auth-method-panel {
  display: flex;
  align-items: flex-start;
  gap: 14px;
  width: 100%;
  padding:var(--ui-padding-12);
  border: var(--ui-border-subtle);
  border-radius: var(--ui-radius-lg);
  background: #fbfcfe;
}

.auth-method-copy {
  flex: 1;
  min-width: 0;
}

.auth-method-title {
  display: flex;
  align-items: center;
  gap: 6px;
  min-height: 21px;
  margin-bottom: 5px;
  color: var(--ui-color-text);
  font-size: 16px;
  font-weight: 600;
  line-height:22px;
}

.auth-method-desc {
  color: var(--ui-color-control-text);
  font-size: 14px;
  line-height:20px;
}

.auth-method-desc span {
  color: var(--ui-color-text);
  font-weight: 500;
}

.auth-method-tip {
  margin-top: 4px;
  color: #9ea7b4;
  font-size: 12px;
  line-height:18px;
}

.method-recommend {
  flex-shrink: 0;
  font-size: 12px;
  color: var(--ui-color-info);
  padding: var(--ui-padding-1-6);
  background-color: rgba(45, 140, 240, 0.1);
  border-radius: var(--ui-radius-sm);
}

.method-status {
  flex-shrink: 0;
  font-size: 12px;
  color: var(--ui-color-error-strong);
  margin-left: 8px;
  padding: var(--ui-padding-1-6);
  background-color: #ffedeb;
  border-radius: var(--ui-radius-sm);
}

/* 邮箱验证样式 */
.email-verification-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex-grow: 1;
}

.verification-code-area {
  width: 100%;
  margin-top:16px;
}

.code-label {
  margin-bottom: 9px;
  color: var(--ui-color-control-text);
  font-size: 13px;
  line-height: 19px;
}

/* 邮箱验证码输入框 */
.email-code-inputs {
  display: flex;
  gap: 8px;
  justify-content: space-between;
  margin-bottom: 0;
}

.e-code-input {
  flex: 1;
  min-width: 0;
  max-width: 52px;
  height: var(--ui-size-48);
  border: var(--ui-border-default);
  border-radius: var(--ui-radius-6);
  text-align: center;
  font-size: 18px;
  font-weight: 600;
  color: var(--ui-color-text);
  background-color: #fff;
  transition: border-color 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;
}

.e-code-input:focus {
  border-color: #2d8cf0;
  box-shadow: 0 0 0 2px rgba(45, 140, 240, 0.2);
  outline: none;
  background-color: #fff;
}

.send-code-action {
  margin-top:16px;
  width: 100%;
}

.send-code-placeholder {
  visibility: hidden;
  pointer-events: none;
}

/* 谷歌验证器样式 */
.google-verification-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex-grow: 1;
}

.google-code-area {
  width: 100%;
  margin-top: 14px;
}

.google-code-inputs {
  display: flex;
  gap: 8px;
  justify-content: space-between;
  margin-bottom: 0;
}

.g-code-input {
  flex: 1;
  min-width: 0;
  max-width: 52px;
  height: var(--ui-size-48);
  border: var(--ui-border-default);
  border-radius: var(--ui-radius-6);
  text-align: center;
  font-size: 18px;
  font-weight: 600;
  color: var(--ui-color-text);
  background-color: #fff;
  transition: border-color 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;
}

.g-code-input:focus {
  border-color: #2d8cf0;
  box-shadow: 0 0 0 2px rgba(45, 140, 240, 0.2);
  outline: none;
  background-color: #fff;
}

.submitting-tip {
  text-align: center;
  color: var(--ui-color-info);
}

.verify-error {
  text-align: center;
  color: var(--ui-color-error-strong);
  line-height: 18px;
}
.e-code-input.error, .g-code-input.error {
  border-color: #ed4014;
  background-color: #ffedeb;
}

.retry-action {
  margin-top: 20px;
  width: 100%;
}

.security-note {
  display: flex;
  align-items: center;
  justify-content: center;
  margin: auto 0 0;
  padding:var(--ui-padding-0-12);
  width: 100%;
  border-radius: var(--ui-radius-6);
  color: var(--ui-color-neutral-550);
  font-size: 13px;
  text-align: center;
}

.security-note .iconfont {
  margin-right: 5px;
}

/* 添加无可用验证方式时的样式 */
.auth-no-method {
  text-align: center;
  padding: var(--ui-padding-30-0);
  color: var(--ui-color-error-strong);
}

.auth-no-method i {
  font-size: 32px;
  margin-bottom: 10px;
}

.auth-no-method p {
  font-size: 16px;
}

:deep(.two-factor-auth-modal .ivu-modal-body) {
  padding: 18px 24px 24px;
}

:deep(.two-factor-auth-modal .send-code-action .ivu-btn) {
  height: var(--ui-size-32);
}

:deep(.two-factor-auth-modal .ivu-modal-header) {
  padding: var(--ui-padding-16-24);
  border-bottom-color: #edf0f5;
}

:deep(.two-factor-auth-modal .ivu-modal-header-inner) {
  color: var(--ui-color-text);
  font-size: 16px;
  font-weight: 600;
}

@media screen and (max-width: 480px) {
  .auth-tabs {
    gap: 3px;
  }

  .auth-tab {
    height: var(--ui-size-36);
    font-size: 13px;
  }

  .auth-method-panel {
    padding: var(--ui-padding-14);
  }

  .email-code-inputs,
  .google-code-inputs {
    gap: 6px;
  }

  .e-code-input,
  .g-code-input {
    height: var(--ui-size-44);
    font-size: 16px;
  }
}
</style>
<style lang="less">
.two-factor-auth-modal.ivu-modal-wrap {
  z-index: 10001 !important;
}
</style>
