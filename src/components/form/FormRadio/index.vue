<template>
  <RadioGroup
    v-model="c_modelValue"
    v-bind="$attrs"
    @on-change="handleChange">
    <Radio v-for="(item, index) in c_options" :label="item[valueName]" :key="item[valueName]" :border="border" :disabled="item.disabled">
      <slot :row="item" v-if="$slots.default"></slot>
      <template v-else>{{ item[labelName] }}</template>
    </Radio>
  </RadioGroup>
</template>

<script setup>
import { computed, defineEmits, defineProps, getCurrentInstance } from 'vue'
const { proxy } = getCurrentInstance()
const props = defineProps({
  modelValue: {
    type: [Number, String, null, undefined],
    default:null,
  },
  width: {
    type: [String, Number],
    default: '100%',
  },
  labelName: {
    type: String,
    default: 'label',
  },
  valueName: {
    type: String,
    default: 'value',
  },
  options: {
    type: [Array, Object, String],
    default: [],
  },
  border: {
    type: Boolean,
    default: false,
  },
})

const c_options = computed(() => {
  let arr = []
  if (Array.isArray(props.options)) {
    arr = props.options.map(item => {
      if (typeof item === 'object' && item !== null) {
        return item
      } else {
        return {
          [props.labelName]: item,
          [props.valueName]: item,
        }
      }
    })
  } else if (typeof props.options === 'object' && props.options !== null) {
    for (const key in props.options) {
      if (Object.prototype.hasOwnProperty.call(props.options, key)) {
        const value = /^\d+$/.test(key) && (typeof props.modelValue === 'number' || props.modelValue === null) ? Number(key) : key
        arr.push({
          [props.labelName]: props.options[key],
          [props.valueName]: value,
        })
      }
    }
  } else if (typeof props.options === 'string') {
    const _strArr = props.options.split(',').map(s => s.trim())
    arr = _strArr.map(item => ({
      [props.labelName]: item,
      [props.valueName]: item,
    }))
  }
  if (!props.modelValue && arr.length > 0) {
    emits('update:modelValue', arr[0][props.valueName])
  }
  return arr
})
const emits = defineEmits(['update:modelValue', 'on-change'])
const c_modelValue = computed({
  get() {
    return props.modelValue
  },
  set(val) {
    emits('update:modelValue', val)
  },
})
const handleChange = (value) => {
  emits('on-change', value)
}
</script>
