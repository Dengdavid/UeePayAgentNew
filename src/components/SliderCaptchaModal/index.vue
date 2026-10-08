<template>
  <Modal
    v-model="visible"
    :title="t('sliderCaptcha.title')"
    :width="380"
    :z-index="11000"
    :mask-closable="false"
    :closable="!sendingEmail"
    footer-hide
    class-name="slider-captcha-modal vertical-center-modal"
    @on-cancel="close"
  >
    <div class="captcha-panel" @keydown.stop @keyup.stop>
      <div v-if="question" class="captcha-picture" dir="ltr">
        <img
          class="captcha-background"
          :src="'data:image/png;base64,' + question.originalImageBase64"
          alt=""
          draggable="false"
          @error="imageError"
        >
        <img
          class="captcha-piece"
          :src="'data:image/png;base64,' + question.jigsawImageBase64"
          :style="{ width: piecePercent + '%', left: offsetPercent + '%' }"
          alt=""
          draggable="false"
          @error="imageError"
        >
      </div>
      <div v-else class="captcha-placeholder" role="status">
        {{ loading ? t('sliderCaptcha.loading') : t('sliderCaptcha.retry') }}
      </div>

      <div class="captcha-track" dir="ltr" :class="{ 'is-busy': busy }">
        <span class="captcha-track-label" aria-live="polite">
          {{ busy ? t('sliderCaptcha.verifying') : t('sliderCaptcha.drag') }}
        </span>
        <input
          v-model.number="offset"
          class="captcha-range"
          type="range"
          min="0"
          :max="maxOffset"
          step="1"
          :disabled="!ready || busy"
          :aria-label="t('sliderCaptcha.drag')"
          :aria-description="t('sliderCaptcha.keyboardHint')"
          :aria-valuetext="t('sliderCaptcha.drag')"
          @pointerdown="startDrag"
          @pointerup="finishDrag"
          @pointercancel="offset = 0"
          @keydown.enter.prevent="verify"
        >
        <Icon
          type="ios-arrow-forward"
          class="captcha-handle-icon"
          :style="handleStyle"
          aria-hidden="true"
        />
      </div>

      <div class="captcha-actions">
        <Button type="text" :disabled="busy" @click="loadQuestion">
          <Icon type="md-refresh" :class="{ 'icon-load': loading }" /> {{ t('sliderCaptcha.refresh') }}
        </Button>
        <p v-if="errorText" class="captcha-error" role="alert" :title="errorText">{{ errorText }}</p>
        <Button type="text" :disabled="sendingEmail" @click="close">{{ t('button.cancel') }}</Button>
      </div>
    </div>
  </Modal>
</template>

<script setup>
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { Button, Icon, Modal } from 'view-ui-plus'
import { useI18n } from 'vue-i18n'
import userApi from '@/api/user.js'
import { message } from '@/utils/message.js'
import { encryptCaptchaPoint } from '@/utils/captcha.js'

const props = defineProps({
  active: { type: Boolean, default: true },
})
const { t } = useI18n()
const visible = ref(false)
const question = ref(null)
const originalWidth = ref(0)
const pieceWidth = ref(0)
const offset = ref(0)
const loading = ref(false)
const checking = ref(false)
const sendingEmail = ref(false)
const errorText = ref('')
const maxOffset = computed(() => Math.max(0, originalWidth.value - pieceWidth.value))
const ready = computed(() => question.value && originalWidth.value > 0 && pieceWidth.value > 0)
const busy = computed(() => loading.value || checking.value || sendingEmail.value)
const piecePercent = computed(() => originalWidth.value ? pieceWidth.value / originalWidth.value * 100 : 0)
const offsetPercent = computed(() => originalWidth.value ? offset.value / originalWidth.value * 100 : 0)
const handleStyle = computed(() => {
  const progress = maxOffset.value ? offset.value / maxOffset.value * 100 : 0
  return { left: progress + '%', transform: 'translateX(-' + progress + '%)' }
})

let binding = null
let resolveResult = null
let controller = null
let generation = 0
let failures = 0

const clearQuestion = () => {
  question.value = null
  originalWidth.value = 0
  pieceWidth.value = 0
  offset.value = 0
}

const close = () => finish(false)

// 每次打开只保留本次邮箱、用途和题目；关闭及卸载时结束等待并清理凭证。
const finish = (sent) => {
  generation++
  controller?.abort()
  controller = null
  visible.value = false
  clearQuestion()
  binding = null
  loading.value = false
  checking.value = false
  sendingEmail.value = false
  errorText.value = ''
  const resolve = resolveResult
  resolveResult = null
  resolve?.(sent === true)
}

const open = (payload) => {
  finish(false)
  if (!props.active) return Promise.resolve(false)
  binding = { email: (payload.email || '').trim(), event: payload.event || 'login' }
  visible.value = true
  const result = new Promise(resolve => { resolveResult = resolve })
  loadQuestion()
  return result
}

const loadQuestion = async () => {
  if (!visible.value || !binding || checking.value || sendingEmail.value) return
  controller?.abort()
  controller = new AbortController()
  const current = ++generation
  loading.value = true
  errorText.value = ''
  failures = 0
  try {
    const data = await userApi.getCaptcha(binding, { signal: controller.signal })
    if (current !== generation || !visible.value) return
    if (!data?.originalImageBase64 || !data?.jigsawImageBase64 || !data?.token || !data?.secretKey) {
      throw new Error()
    }
    const widths = await Promise.all([data.originalImageBase64, data.jigsawImageBase64].map(async imageBase64 => {
      const image = new Image()
      image.src = 'data:image/png;base64,' + imageBase64
      await image.decode()
      return image.naturalWidth
    }))
    if (current !== generation || !visible.value) return
    originalWidth.value = widths[0]
    pieceWidth.value = widths[1]
    offset.value = 0
    question.value = data
  } catch (error) {
    if (current === generation) {
      if (error?.code === 429) {
        finish(false)
        return
      }
      clearQuestion()
      errorText.value = error?.silent || error?.msg === 'SILENT_ERROR'
        ? t('sliderCaptcha.retry')
        : error?.msg || t('sliderCaptcha.retry')
    }
  } finally {
    if (current === generation) loading.value = false
  }
}

const imageError = () => {
  clearQuestion()
  errorText.value = t('sliderCaptcha.retry')
}

const startDrag = () => {
  if (!ready.value || busy.value) return
  errorText.value = ''
}

const finishDrag = (event) => {
  if (!ready.value || busy.value) return
  offset.value = Number(event.currentTarget.value)
  verify()
}

const verify = async () => {
  if (!ready.value || busy.value || !binding) return
  const current = generation
  const payload = { ...binding }
  checking.value = true
  errorText.value = ''
  try {
    // range 使用原图坐标，图片缩放不会改变提交值；纵向值遵循后端拼图协议。
    const pointJson = await encryptCaptchaPoint({ x: Math.round(offset.value), y: 5 }, question.value.secretKey)
    if (current !== generation || !visible.value) return
    const data = await userApi.checkCaptcha({
      ...payload,
      token: question.value.token,
      pointJson,
    }, { signal: controller.signal })
    if (current !== generation || !visible.value) return
    if (!data?.captchaVerification) throw new Error()

    sendingEmail.value = true
    visible.value = false
    clearQuestion()
    const sent = await userApi.sendEmail({
      ...payload,
      captchaVerification: data.captchaVerification,
    }, { signal: controller.signal })
    if (current !== generation) return
    if (sent !== true) throw new Error()
    finish(true)
  } catch (error) {
    if (current !== generation) return
    if (error?.code === 429) {
      finish(false)
      return
    }
    // 滑块通过后立即关闭；发信失败使用页面的普通错误提示。
    if (sendingEmail.value) {
      finish(false)
      if (!error?.silent && error?.msg !== 'SILENT_ERROR') {
        message(error?.code === 200 ? t('sliderCaptcha.sendFailed') : error?.msg || t('sliderCaptcha.sendFailed'), 'error')
      }
      return
    }
    if (!visible.value) return
    if (error?.code === -990) {
      checking.value = false
      await loadQuestion()
      return
    }
    if (++failures >= 3) {
      finish(false)
      if (!error?.silent && !error?.errorHandled && error?.msg !== 'SILENT_ERROR') {
        message(t('sliderCaptcha.expired'), 'error')
      }
      return
    }
    offset.value = 0
    errorText.value = error?.code === 200 || error?.silent || error?.msg === 'SILENT_ERROR'
      ? t('sliderCaptcha.failed')
      : error?.msg || t('sliderCaptcha.failed')
  } finally {
    if (current === generation) {
      checking.value = false
      sendingEmail.value = false
    }
  }
}

watch(() => props.active, active => {
  if (!active) finish(false)
})
watch(visible, value => {
  if (!value && resolveResult && !sendingEmail.value) finish(false)
})
onBeforeUnmount(() => finish(false))
defineExpose({ open, close })
</script>

<style scoped lang="less">
:global(.slider-captcha-modal:not(.ivu-modal-hidden) + .ivu-modal-mask) {
  // 嵌套 Modal 的 Teleport 可能将同层遮罩插到弹窗之后，需保持遮罩位于验证码弹窗下方。
  z-index: 11000 !important;
}
.captcha-panel {
  min-width: 0;
}
.captcha-picture {
  position: relative;
  overflow: hidden;
  border-radius: var(--ui-radius-md);
  user-select: none;
}
.captcha-background {
  display: block;
  width: 100%;
}
.captcha-piece {
  position: absolute;
  top: 0;
  height: 100%;
  pointer-events: none;
}
.captcha-placeholder {
  display: grid;
  min-height: 160px;
  place-items: center;
  color: var(--ui-color-text-muted);
  background: var(--ui-color-surface-subtle);
  border-radius: var(--ui-radius-md);
}
.captcha-track {
  position: relative;
  margin-top: 16px;
  height: 46px;
  border: var(--ui-border-default);
  border-radius: var(--ui-radius-md);
  background: var(--ui-color-surface-subtle);
  overflow: hidden;
}
.captcha-track-label {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  padding: 0 48px;
  font-size: var(--ui-font-size-xs);
  color: var(--ui-color-text-muted);
  pointer-events: none;
  text-align: center;
}
.captcha-range {
  position: relative;
  display: block;
  width: 100%;
  height: 44px;
  margin: 0;
  appearance: none;
  background: transparent;
  cursor: grab;
  touch-action: none;
  &::-webkit-slider-thumb {
    appearance: none;
    width: 44px;
    height: 44px;
    border: 0;
    border-radius: var(--ui-radius-md);
    background: var(--ui-color-primary);
  }
  &::-moz-range-thumb {
    width: 44px;
    height: 44px;
    border: 0;
    border-radius: var(--ui-radius-md);
    background: var(--ui-color-primary);
  }
  &:focus-visible {
    outline: 2px solid var(--ui-color-primary);
    outline-offset: -2px;
  }
  &:disabled {
    cursor: default;
    opacity: .6;
  }
}
.captcha-handle-icon {
  position: absolute;
  top: 0;
  z-index: 1;
  display: grid;
  width: 44px;
  height: 44px;
  place-items: center;
  color: var(--ui-color-text-inverse);
  pointer-events: none;
}
.captcha-error {
  flex: 1;
  min-width: 0;
  margin: 0;
  color: var(--ui-color-error);
  overflow-wrap: anywhere;
}
.captcha-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 12px;
  gap: 12px;
  > .ivu-btn {
    flex-shrink: 0;
  }
}
</style>
