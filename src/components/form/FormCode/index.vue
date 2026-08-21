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
  </div>
</template>

<script setup>
import { postApi } from '@/utils/api.js'
import { message } from '@/utils/message.js'
import { t } from '@/utils/index.js'
import { computed, defineProps, onMounted, onUnmounted, ref, watch } from 'vue'

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
const storageKey = computed(() => {
  if (!normalizedEmail.value) return ''
  return `form_code_countdown:${props.event}:${encodeURIComponent(normalizedEmail.value)}`
})
const countdown = ref(0)
const sendingCode = ref(false)
const canSendCode = computed(() => isValidEmail.value && !sendingCode.value && countdown.value <= 0)
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

const resetCountdown = (key = storageKey.value) => {
  clearCountdownTimer()
  countdown.value = 0
  if (key) {
    localStorage.removeItem(key)
  }
}

const updateCountdown = (key = storageKey.value) => {
  const expiresAt = Number(localStorage.getItem(key) || 0)
  const remaining = Math.ceil((expiresAt - Date.now()) / 1000)

  if (!expiresAt || remaining <= 0) {
    resetCountdown(key)
    return
  }

  countdown.value = remaining
}

const startCountdown = (key = storageKey.value) => {
  if (!key) return

  const expiresAt = Date.now() + COUNTDOWN_SECONDS * 1000
  localStorage.setItem(key, String(expiresAt))
  clearCountdownTimer()
  updateCountdown(key)
  countdownTimer = setInterval(() => updateCountdown(key), 1000)
}

const restoreCountdown = () => {
  clearCountdownTimer()
  const key = storageKey.value
  if (!key) {
    countdown.value = 0
    return
  }

  updateCountdown(key)
  if (countdown.value > 0) {
    countdownTimer = setInterval(() => updateCountdown(key), 1000)
  }
}

const handleSend=()=>{
  if (!isValidEmail.value) {
    message(t('formCode.invalidEmail'), 'error')
    return
  }
  if(!canSendCode.value) return

  const targetEmail = normalizedEmail.value
  const targetStorageKey = storageKey.value
  sendingCode.value=true
  postApi('/user/auth/sendEmail',{
    email:targetEmail,
    event:props.event
  }).then((res)=>{
    message(t('formCode.sent'))
    startCountdown(targetStorageKey)
  }).catch((err)=>{
    message(err?.msg || t('formCode.failed'),'error')
  }).finally(()=>{
    sendingCode.value=false
  })
}

const handleInputChange = (value) => {
  emits('on-change', value)
}

const handleInputEnter = (value) => {
  emits('on-enter', value)
}

watch(storageKey, restoreCountdown)

onMounted(()=>{
  restoreCountdown()
})

onUnmounted(()=>{
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
