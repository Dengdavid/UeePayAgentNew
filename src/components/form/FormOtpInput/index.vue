<template>
  <div class="form-otp-input">
    <input
      v-for="(digit, index) in digits"
      :key="index"
      ref="inputs"
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
      class="form-otp-input__item"
      :class="{ 'form-otp-input__item--error': error }"
      :value="digit"
      :aria-label="ariaLabel"
      :disabled="disabled"
      @input="event => handleInput(event, index)"
      @keydown="event => handleKeydown(event, index)"
      @paste="handlePaste"
    />
  </div>
</template>

<script setup>
import { nextTick, ref, watch } from 'vue'

const props = defineProps({
  modelValue: {
    type: String,
    default: '',
  },
  length: {
    type: Number,
    default: 6,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  error: {
    type: Boolean,
    default: false,
  },
  ariaLabel: {
    type: String,
    default: '',
  },
})

const emit = defineEmits(['update:modelValue', 'input', 'complete'])
const inputs = ref([])
const digits = ref([])

const normalizeValue = value => String(value || '').replace(/\D/g, '').slice(0, props.length)

const createDigits = value => {
  const normalizedValue = normalizeValue(value)
  return Array.from({ length: props.length }, (_, index) => normalizedValue[index] || '')
}

const syncValue = () => {
  const value = digits.value.join('')
  emit('update:modelValue', value)
  emit('input', value)
  if (digits.value.every(Boolean)) {
    emit('complete', value)
  }
}

const focus = (index = 0) => {
  nextTick(() => {
    inputs.value[Math.min(Math.max(index, 0), props.length - 1)]?.focus()
  })
}

const blur = () => {
  inputs.value.forEach(input => input?.blur())
}

const clear = () => {
  digits.value = createDigits('')
  syncValue()
}

const handleInput = (event, index) => {
  const value = event.target.value.replace(/\D/g, '').slice(-1)
  event.target.value = value
  digits.value[index] = value
  syncValue()
  if (value && index < props.length - 1) {
    focus(index + 1)
  }
}

const handleKeydown = (event, index) => {
  if (event.key === 'Backspace' && !digits.value[index] && index > 0) {
    digits.value[index - 1] = ''
    syncValue()
    focus(index - 1)
  } else if (event.key === 'ArrowLeft' && index > 0) {
    event.preventDefault()
    focus(index - 1)
  } else if (event.key === 'ArrowRight' && index < props.length - 1) {
    event.preventDefault()
    focus(index + 1)
  }
}

const handlePaste = event => {
  event.preventDefault()
  const value = normalizeValue(event.clipboardData.getData('text'))
  digits.value = createDigits(value)
  syncValue()
  focus(Math.min(value.length, props.length - 1))
}

watch(
  () => [props.modelValue, props.length],
  ([value]) => {
    const normalizedValue = normalizeValue(value)
    if (normalizedValue === digits.value.join('') && digits.value.length === props.length) return
    digits.value = createDigits(normalizedValue)
  },
  { immediate: true },
)

defineExpose({
  blur,
  clear,
  focus,
})
</script>

<style scoped lang="less">
.form-otp-input{
  display: flex;
  justify-content: space-between;
  width: 100%;
  gap:8px;
}
.form-otp-input__item{
  flex: 1;
  min-width: 0;
  max-width: 52px;
  height: var(--ui-size-48);
  border: var(--ui-border-default);
  border-radius: var(--ui-radius-6);
  background-color: #fff;
  color: var(--ui-color-text);
  font-size: 18px;
  font-weight: 600;
  text-align: center;
  transition: border-color 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;
  &:focus{
    border-color: #2d8cf0;
    box-shadow: 0 0 0 2px rgba(45, 140, 240, 0.2);
    outline: none;
  }
  &--error{
    border-color: var(--ui-color-error-strong);
    background-color: #ffedeb;
  }
  &:disabled{
    background-color: var(--ui-color-surface-disabled);
    color: var(--ui-color-control-text-disabled);
    cursor: not-allowed;
  }
}
@media screen and (max-width: 480px){
  .form-otp-input{
    gap:6px;
  }
  .form-otp-input__item{
    height: var(--ui-size-44);
    font-size: 16px;
  }
}
</style>
