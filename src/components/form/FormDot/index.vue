<template>
  <Badge class="form-dot" :status="c_row?.type || 'default'" :text="c_row?.[labelKey] || modelValue" />
</template>

<script setup>
import {toArray} from '@/utils/dataInfo.js'
import { computed, defineProps, getCurrentInstance, ref } from 'vue'
const { proxy } = getCurrentInstance()
const props = defineProps({
  modelValue: {
    type: [String, Number, null],
    default: null,
  },
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

<style scoped>
.form-dot {
  display: inline-flex;
  white-space: nowrap;
}

.form-dot :deep(.ivu-badge-status-text) {
  white-space: nowrap;
}
</style>
