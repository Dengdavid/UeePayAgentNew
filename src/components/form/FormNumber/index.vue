<template>
  <InputNumber
    ref="inputNumberRef"
    v-model="c_modelValue"
    :min="min"
    :max="max"
    placeholder="请输入"
    :active-change="resolvedActiveChange"
    :parser="parseNumericInput"
    :formatter="(value) => precisionNum(value)"
    style="width: 100%"
    v-bind="$attrs"
    @on-change="handleChange"
    @on-clear="handleClear"
    @on-blur="handleBlur"
    @keyup.enter="handleEnter"
  >
  </InputNumber>
</template>

<script setup>
import { computed, defineProps, ref } from 'vue'
const props = defineProps({
  modelValue: {
    type: [Number, null],
    default: null,
  },
  precision: {
    type: Number,
    default: undefined, // 不传则不限制
  },
  min: {
    type: [Number, null],
    default: 0,
  },
  max: {
    type: [Number, null],
    default: 999999999,
  },
  activeChange: {
    type: Boolean,
    default: undefined,
  },
})
const emits = defineEmits(['update:modelValue', 'on-change', 'on-blur'])
const inputNumberRef = ref(null)
// 有业务最小值时允许用户先完成多位数输入，再在失焦或回车后应用范围限制。
const resolvedActiveChange = computed(() => (
  props.activeChange ?? (Number(props.min) <= 0)
))
const parseNumericInput = (value) => {
  const normalized = String(value ?? '').replace(/[^\d.]/g, '')
  const [integer, ...decimalParts] = normalized.split('.')
  return decimalParts.length ? `${integer}.${decimalParts.join('')}` : integer
}
const c_modelValue = computed({
  get() {
    return props.modelValue
  },
  set(value) {
    // 处理清空、非数字等情况
    const newValue = precisionNum(value)
    emits('update:modelValue', newValue)
  },
})
const precisionNum = (value) => {
  if (value == null || value === '' || isNaN(value)) {
    emits('update:modelValue', null)
    return null
  }

  let _value = Number(value)
  if (props.precision != null) {
    _value = Number(_value.toFixed(props.precision))
  }
  return _value
}

const handleChange = (value) => {
  value = precisionNum(value)
  emits('on-change', value)
}
const handleBlur = () => {
  const value = precisionNum(c_modelValue.value)
  inputNumberRef.value?.setValue(value)
  emits('on-blur', value)
}
const handleEnter = () => {
  inputNumberRef.value?.$el?.querySelector('input')?.blur()
}
const handleClear = () => {
}
</script>
