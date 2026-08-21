<template>
  <div class="formDot">
    {{ c_row?.[labelKey] || modelValue }}
  </div>
</template>

<script setup>
import {toArray} from '@/utils/dataInfo.js'
import { computed, defineProps, getCurrentInstance, ref } from 'vue'
const { proxy } = getCurrentInstance()
const props = defineProps({
  modelValue: {},
  options: {},
  labelKey: {
    type: String,
    default: 'label',
  },
  valueKey: {
    type: String,
    default: 'value',
  },
})
const c_row = computed(()=>{
  const c_options=toArray(props.options)
  const row=c_options.find((item)=>item[props.valueKey]==props.modelValue)
  return row
})
</script>
