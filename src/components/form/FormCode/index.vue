<template>
  <div class="formCode" :class="{
    'has-value': c_modelValue
  }">
    <FormInput
      v-model="c_modelValue"
      :clearable="false"
      :maxlength="6"
      :show-word-limit="false"
      v-bind="$attrs"
      :disabled="!hasSentCode || props.disabled"
      @on-change="handleInputChange"
      @on-enter="handleInputEnter"
    >
      <template v-for="(_, name) in $slots" #[name]="{ row }">
        <slot :name="name" :row="row" />
      </template>
    </FormInput>
    <div class="send" @click.stop="">
      <Button type="text" :disabled="!canSendCode" @click="handleSend">{{ sendText }}</Button>
    </div>
    <SliderCaptchaModal ref="emailCaptchaRef" />
  </div>
</template>

<script>
const countdownDeadlines = new Map()
</script>

<script setup>
import SliderCaptchaModal from '@/components/SliderCaptchaModal/index.vue'
import { message } from '@/utils/message.js'
import { t } from '@/utils/index.js'
import { computed, defineProps, onMounted, onUnmounted, ref, watch } from 'vue'

const emailCaptchaRef = ref(null)

const COUNTDOWN_SECONDS = 60
const EMAIL_REG = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const props = defineProps({
  modelValue: {
    type: [String, null],
    default: null,
  },
  event:{
    type:String,
    default:'forgot'//指定事件类型为忘记密码
  },
  email:{
    type:String,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
})
const emits = defineEmits(['update:modelValue', 'on-change','on-enter'])
const c_modelValue = computed({
  get() {
    return props.modelValue
  },
  set(value) {
    emits('update:modelValue', value)
  },
})
const normalizedEmail = computed(() => (props.email || '').trim())
const isValidEmail = computed(() => EMAIL_REG.test(normalizedEmail.value))
const countdownKey = computed(() => {
  if (!normalizedEmail.value) return ''
  return JSON.stringify([props.event, normalizedEmail.value])
})
const countdown = ref(0)
const sendingCode = ref(false)
const hasSentCode = ref(false)
const canSendCode = computed(() => !props.disabled && isValidEmail.value && !sendingCode.value && countdown.value <= 0)
const sendText = computed(() => countdown.value > 0
  ? t('formCode.resendIn', { seconds: countdown.value })
  : t('formCode.send'))
let countdownTimer = null

const clearCountdownTimer = () => {
  if (countdownTimer) {
    clearInterval(countdownTimer)
    countdownTimer = null
  }
}

const resetCountdown = (key = countdownKey.value) => {
  clearCountdownTimer()
  countdown.value = 0
  if (key) countdownDeadlines.delete(key)
}

const updateCountdown = (key = countdownKey.value) => {
  const expiresAt = countdownDeadlines.get(key) || 0
  const remaining = Math.ceil((expiresAt - Date.now()) / 1000)

  if (!expiresAt || remaining <= 0) {
    resetCountdown(key)
    return
  }

  countdown.value = remaining
}

const startCountdown = (key = countdownKey.value) => {
  if (!key) return

  for (const [cachedKey, expiresAt] of countdownDeadlines) {
    if (expiresAt <= Date.now()) countdownDeadlines.delete(cachedKey)
  }
  countdownDeadlines.set(key, Date.now() + COUNTDOWN_SECONDS * 1000)
  clearCountdownTimer()
  updateCountdown(key)
  countdownTimer = setInterval(() => updateCountdown(key), 1000)
}

const restoreCountdown = () => {
  clearCountdownTimer()
  hasSentCode.value = false
  const key = countdownKey.value
  if (!key) {
    countdown.value = 0
    return
  }

  updateCountdown(key)
  if (countdown.value > 0) {
    hasSentCode.value = true
    countdownTimer = setInterval(() => updateCountdown(key), 1000)
  }
}

const handleSend = async () => {
  if (!isValidEmail.value) {
    message(t('formCode.invalidEmail'), 'error')
    return
  }
  if (!canSendCode.value) return

  const targetEmail = normalizedEmail.value
  const targetKey = countdownKey.value
  sendingCode.value = true
  try {
    const sent = await emailCaptchaRef.value.open({ email: targetEmail, event: props.event })
    if (sent !== true || targetKey !== countdownKey.value) return
    hasSentCode.value = true
    message(t('formCode.sent'))
    startCountdown(targetKey)
  } finally {
    sendingCode.value = false
  }
}

const handleInputChange = (value) => {
  emits('on-change', value)
}

const handleInputEnter = (value) => {
  emits('on-enter', value)
}

watch(countdownKey, () => {
  emailCaptchaRef.value?.close()
  c_modelValue.value = ''
  restoreCountdown()
})

onMounted(()=>{
  // 清除旧版本保存在邮箱键中的倒计时，后续只使用当前页面内存。
  try {
    for (let index = localStorage.length - 1; index >= 0; index--) {
      const key = localStorage.key(index)
      if (key?.startsWith('form_code_countdown:')) localStorage.removeItem(key)
    }
  } catch {}
  restoreCountdown()
})

onUnmounted(()=>{
  emailCaptchaRef.value?.close()
  clearCountdownTimer()
})
</script>
<style scoped lang="less">
.formCode{
  position: relative;
  .send{
    position: absolute;
    top: 50%;
    right: 10px;
    transform: translateY(-50%);
    z-index: 2;
  }
}
</style>
