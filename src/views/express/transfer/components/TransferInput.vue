<template>
  <div class="transfer-input" :class="{
    readonly:readonly
  }">
    <Input  v-model="c_modelValue" :placeholder="$t('express.transfer.inputAmount')" type="number" :min="min" :max="max" clearable :readonly="readonly" v-bind="$attrs" @on-change="onChange" @on-keydown="onKeydown" @on-blur="onBlur" @on-enter="onBlur" @wheel="onWheel" @on-clear="onClear">
      <template #prefix>
        <div class="currency-box">
          <StateIcon :name="row?.country_code"/>
          <p>{{ country  || $t('express.transfer.pleaseSelect') }}</p>
        </div>
      </template>
    </Input>
  </div>
</template>

<script setup>
import StateIcon from '@/components/ui/state-icon.vue'
import { computed, ref,onMounted } from 'vue'
const props=defineProps({
  modelValue: {
    type:[Number,String],
  },
  country: {
    type:String,
  },
  row:{
    type:Object,
    default:()=>({}),
  },
  min:{
    type:Number,
    default:0
  },
  max:{
    type:Number,
  },
  readonly:{
    type:Boolean,
    default:false
  }
})
const emits=defineEmits(['update:modelValue','update:country','on-select','on-change','on-blur'])
const c_modelValue=computed({
  get: () => props.modelValue,
  set: (value) => {
    emits('update:modelValue', value)
  }
})
const onKeydown = (e) => {
  if (['e', 'E', '-', '+'].includes(e.key)) {
    e.preventDefault()
  }
}
const onWheel = (e) => {
  if (e.target && e.target.tagName === 'INPUT') {
    e.target.blur()
  }
}
const onClear=()=>{
  emits('on-blur',null)
}
const onBlur = () => {
  if (props.modelValue === null || props.modelValue === undefined || props.modelValue === '') return

  let val = Number(props.modelValue)
  if (isNaN(val)) return

  let newVal = val
  if (props.min !== undefined && val < props.min) {
    newVal = props.min
  }
  if (props.max !== undefined && val > props.max) {
    newVal = props.max
  }

  if (newVal !== val) {
    emits('update:modelValue', newVal)
  }
  emits('on-blur',newVal)
}
//防抖
const onChange=(e)=>{
  emits('on-change',e.target.value)
}
</script>

<style scoped lang="less">
.transfer-input{
  position: relative;
  display: flex;
  align-items: center;
  gap: 16px;
  width: 100%;
  &.readonly{
    pointer-events: none;
  }
  .wAuto{
    width: 100%;
  }
  .currency-box{
    width: 100%;
    display: flex;
    align-items: center;
    text-align: left;
    gap:6px;
    cursor: pointer;
    p{
      flex: 1;
      overflow: hidden;
    }
  }
  :deep(.ivu-input-wrapper){
    .ivu-input-icon-clear{
      top: 50%;
      transform: translate(0, -50%);
    }
  }
  --w: 110px;
  :deep(.ivu-input){
    text-align: right;
    font-size: 22px;
    padding-left: var(--w);
    color: var(--ui-color-text);
    font-weight: bold;
    height:var(--ui-size-60);
    padding-right:28px;
  }
  :deep(.ivu-input-prefix){
    width: var(--w);
    display: flex;
    align-items: center;
    padding:var(--ui-padding-0-8);
    &::after{
      content: '';
      position: absolute;
      right: 0;
      top: 50%;
      transform: translate(0, -50%);
      height:var(--ui-size-18);
      width: var(--ui-size-1);
      background: #ddd;
    }
  }
  .currency{
    padding: var(--ui-padding-0-10);
    font-size: 14px;
    color: var(--primary-color);
  }
}
.selectBox{
  width: var(--ui-size-300);
  >*{
    &:not(:last-child){
      border-bottom: 1px #eee solid;
    }
  }
  .search{
    padding: var(--ui-padding-3);
  }
  .content{
    padding:3px 0;
    max-height: 300px;
    overflow-x: hidden;
  }
  .select-item{
    display: flex;
    align-items: center;
    gap: 6px;
    padding: var(--ui-padding-6);
    cursor: pointer;
    transition: all 0.2s ease;
    &:hover{
      background-color: #f5f7fa;
    }
  }
}
</style>
