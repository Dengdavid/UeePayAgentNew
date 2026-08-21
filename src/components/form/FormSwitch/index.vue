<template>
  <Switch
    v-model="c_modelValue"
    v-bind="$attrs"
    @on-change="handleChange"
    :true-value="trueValue ?? c_value(true)"
    :false-value="falseValue ?? c_value(false)"
  >
  </Switch>
</template>

<script setup>
import { computed, defineProps, getCurrentInstance } from 'vue'
const { proxy } = getCurrentInstance()
const props = defineProps({
  modelValue: {
    type: [String,Boolean,Number],
    default: 0,
  },
  type: {
    type: String,
    default: 'number',
  },
  trueText: {
    type: String,
  },
  falseText: {
    type: String,
  },
  trueValue: {
    type: [String,Boolean,Number],
    default: 1,
  },
  falseValue: {
    type: [String,Boolean,Number],
    default: 0,
  }
})
const emits = defineEmits(['update:modelValue', 'on-change'])
const c_modelValue = computed({
  get() {
    return props.modelValue
  },
  set(value) {
    emits('update:modelValue', value)
  },
})
const c_value = (isBoolean) => {
  if (props.type === 'string') {
    return isBoolean ? 'Y' : "N"
  } else if (props.type === 'number') {
    return isBoolean?1:0
  }else {
    return isBoolean
  }
}

const handleChange = (value) => {
  emits('on-change', value)
}
</script>
