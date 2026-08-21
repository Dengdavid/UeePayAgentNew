<template>
  <CheckboxGroup
    v-model="c_modelValue"
    :style="{
      width: typeof width === 'number' ? width + 'px' : width,
    }"
    v-bind="$attrs"
    @on-change="handleChange">
    <Checkbox v-for="(item, index) in c_options" :label="item[valueName]" :key="item[valueName]" :disabled="item.disabled">
      <slot :row="item" v-if="$slots.default"></slot>
      <template v-else>{{ item[labelName] }}</template>
    </Checkbox>
  </CheckboxGroup>
</template>

<script setup>
import { computed, defineEmits, defineProps, getCurrentInstance } from 'vue'
const { proxy } = getCurrentInstance()
const props = defineProps({
  modelValue: {
    type: [Array, String, null, undefined],
    default: () => [],
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
  return arr
})
const emits = defineEmits(['update:modelValue', 'on-change'])
const c_modelValue = computed({
  get() {
    if(Array.isArray(props.modelValue)){
      return props.modelValue || []
    } else {
      return props.modelValue?props.modelValue.split(','):[]
    }
  },
  set(val) {
    if (Array.isArray(props.modelValue)) {
      emits('update:modelValue', val)
    } else {
      emits('update:modelValue', val.length > 0 ? val.join(',') : '')
    }
  },
})
const handleChange = (value) => {
  emits('on-change', value)
}
</script>
