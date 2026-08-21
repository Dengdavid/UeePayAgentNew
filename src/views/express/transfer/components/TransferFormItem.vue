<template>
  <template v-if="data.length>0">
    <template v-for="item in data">
      <FormItemBox :label="item.fieldTitle" :prop="chilchKey?`${chilchKey}.${item.fieldName}`:item.fieldName" :desc="isText?'':item.fieldDescription"  :rules="rulesArr(item)" :isRequired="isText?false:item.required" v-if="!notKeys.includes(item.fieldName)">
        <UiFormItem :label='item.fieldTitle' :prop="item.fieldName" :row="form" :item="item" :isText="isText" :defaultDate="['date'].includes(item.fieldType)?'2000-1-1':null" :type="item.fieldType" :options="setOptions(item)" :disabled="disabled || ['senderCorporateId'].includes(item.fieldName)"  labelKey="value" valueKey="valueId" @onChange="onChange"/>
      </FormItemBox>
    </template>
  </template>
</template>

<script setup>
import { computed, ref, onMounted } from 'vue'
import { t } from '@/utils/index.js'
const props=defineProps({
  data:{
    type:Array,
    default:()=>[],
  },
  form:{
    type:Object,
    default:()=>({}),
  },
  payoutCurrency:{
    type:String,
  },
  notKeys:{
    type:Array,
    default:()=>[],
  },
  chilchKey:{
    type:String,
  },
  disabled:{
    type:Boolean,
    default:false,
  },
  isText:{
    type:Boolean,
    default:false,
  }
})
//根据fieldRules返回数组
const rulesArr=(item)=>{
  const rules=[]
  //需要新增验证规则
  if(item.regex){
    rules.push({
      pattern: item.regex,
      message: item.regexMessage || t('express.transfer.formatError', { field: item.fieldTitle }),
      trigger: 'blur',
    })
  }
  if(item.min || item.min === 0){
    rules.push({
      min: Number(item.min),
      message: t('express.transfer.minLength', { field: item.fieldTitle, min: item.min }),
      trigger: 'blur',
    })
  }
  if(item.max || item.max === 0){
    rules.push({
      max: Number(item.max),
      message: t('express.transfer.maxLength', { field: item.fieldTitle, max: item.max }),
      trigger: 'blur',
    })
  }
  return rules
}
const setOptions=(item)=>{
  if(props.payoutCurrency==='CNY' && ['senderIdType'].includes(item.fieldName)){
    return item.selectValues.map(el=>{
      return {
        ...el,
        disabled:["2"].includes(el.valueId),
      }
    })
  }
  return item.selectValues || []
}
const emit=defineEmits(['on-change'])
const onChange=(...args)=>{
  emit('on-change',...args)
}
</script>

<style scoped lang="less">

</style>
