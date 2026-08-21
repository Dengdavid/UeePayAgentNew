<template>
    <div v-if="isText" class="ui-form-item-text">
      <UiImg :src="row[prop]"  width="28px" v-if="type==='file' && row[prop]"/>
      <p :class="{
        textHidden:!isPhone
      }"  :title="textValue(row,prop,options,item)">{{ textValue(row,prop,options,item) || '' }}</p>
    </div>
   <template v-else-if="type==='select'">
      <FormSelectBox v-model="row[prop]"  :options="options" :placeholder="title ?? `${$t('placeholder.selectPlaceholder')}${label}`" :labelKey="labelKey" :valueKey="valueKey" v-bind="$attrs" @on-change="onChange"/>
    </template>
    <template v-else-if="type==='input'">
      <FormInput v-model="row[prop]"  :placeholder="title ?? `${$t('placeholder.inputPlaceholder')}${label}`" v-bind="$attrs" @on-change="onChange"/>
    </template>
    <template v-else-if="type==='date'">
      <FormDateBox v-model="row[prop]" type="date"  :placeholder="title ?? `${$t('placeholder.selectPlaceholder')}${label}`" v-bind="$attrs" @on-change="onChange"/>
    </template>
    <template v-else-if="type==='monthrange'">
      <FormMonths :data="row" :star="startKey" :end="endKey"  v-bind="$attrs"  @on-change="onChange" />
    </template>
    <template v-else-if="type==='daterange'">
      <FormDateBox :data="row" :type="type"  :placeholder="title ?? `${$t('placeholder.selectPlaceholder')}${label}`" v-bind="$attrs" @on-change="onChange"/>
    </template>
    <template v-else-if="type==='file'">
      <FormUploadInput v-model="row[prop]"  :placeholder="title ?? `${$t('placeholder.uploadPlaceholder')}${label}`" v-bind="$attrs" @on-change="onChange"/>
    </template>
    <template v-else>
      {{ type  }}
    </template>
</template>

<script setup>
import {  computed } from 'vue'
import { isPhone } from '@/utils/device.js'
import { t } from '@/utils/index.js'
const props = defineProps({
  row: {
    type: Object,
    default: ()=>({}),
  },
  item: {
    type: Object,
    default: ()=>({}),
  },
  type:{
    type:String,
    default:'input'
  },
  label:{
    type:String,
    default:''
  },
  title:{
    type:String,
  },
  prop:{
    type:String,
    default:''
  },
  startKey: {
    type: String,
    default: 'startTime',
  },
  endKey: {
    type: String,
    default: 'endTime',
  },
  isText:{
    type:Boolean,
    default:false,
  },
  labelKey:{
    type:String,
    default:'label'
  },
  valueKey:{
    type:String,
    default:'value'
  },
  options: {
    type: [Array,Object,String],
    default: ()=>[],
  },
})
const emit = defineEmits(['on-change'])
const textValue=(row,key,options,item)=>{
  if(!key) return ''
  if(item.value && typeof item.value==='function'){
    return item.value(row)
  }
  const value=row[key] ?? 0
  if(options && typeof options==="object"){
    if(Array.isArray(options)){
      return options.find((item)=>item[props.valueKey]==value)?.[props.labelKey] ?? value
    }
    return options[value]?.[props.labelKey] ?? value
  }
  return value
}
const onChange=(...args)=>{
  emit('on-change',...args)
}
</script>
<style lang="less" scoped>
.ui-form-item-text{
  width: 100%;
  display: flex;
  align-items: center;
  gap: 8px;
  .imgBox{
    border: 1px #f5f5f5 solid;
    overflow: hidden;
    border-radius:var(--ui-radius-xs);
    padding: 1px;
  }
  p{
    flex: 1;
    overflow: hidden;
    line-height:22px;
    //换行
    word-break: break-word;
    &.textHidden{
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }
}
.ui-form-monthrange{
  display: flex;
  align-items: center;
  gap: 6px;
  width: 100%;
  >span{
    flex-shrink: 0;
    color: var(--ui-color-text-secondary);
  }
}
</style>
