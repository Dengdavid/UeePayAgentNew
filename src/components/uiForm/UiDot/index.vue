<template>
  <Tag type="dot" :color="c_options[modelValue]?.type || 'default'">{{ c_options?.[modelValue]?.label ?? c_options?.[modelValue] ?? valueText }}</Tag>
</template>

<script setup>
import { computed, ref } from 'vue'
import {toArray} from '@/utils/dataInfo.js'
const props = defineProps({
  modelValue: {
    type: [String,Number,Boolean],
  },
  options: {
    type: [Object,Array],
    default: ()=>{

    }
  },
  valueText: {
    type: [String,Number,Boolean],
    default:""
  },
})
const c_options=computed(()=>{
  let option={}
  if(Array.isArray(props.options)){
    option=props.options.reduce((acc,item)=>{
      acc[item.value]=item
      return acc
    },{})
  }else{
    option=props.options
  }
  return option
})
</script>
<style lang="less">
.ivu-tag{
  &.ivu-tag-dot{
    border: none !important;
    padding: 0 !important;
    background: none !important;
    display: inline-flex;
    align-items: center;
    max-width: 100%;
    white-space: nowrap;
    .ivu-tag-dot-inner{
      flex: 0 0 auto;
      width:var(--ui-size-6);
      height: var(--ui-size-6);
      top: 0;
    }
  }
}
</style>
