<template>
  <Select
    v-model="c_modelValue"
    clearable
    filterable
    style="width:100%"
    size="large"
    v-bind="$attrs"
    @on-change="changeBtn"
  >
    <template #prefix v-if="$slots.icon">
       <slot name="icon" :row="c_row || {}" v-if="$slots.icon"></slot>
    </template>
    <Option
      v-for="(item, index) in c_options"
      :value="item[valueName]"
      :key="item[valueName] ?? index"
      >
      <div class="option-item">
        <img :src="item.img" v-if="item.img" class="icon"/>
         <p> {{ item[labelName]}}</p>
      </div>
    </Option>
  </Select>
</template>

<script setup>
import {  computed } from 'vue'
const props = defineProps({
  modelValue: {
    type: [String,Number],
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
    type: Array,
    default: [],
  },
})
const emits = defineEmits(['update:modelValue', 'change'])
const c_row=computed(()=>{
  const _row=c_options.value.find(el=>el[props.valueName]===props.modelValue)
  return _row
})
const c_modelValue = computed({
  get() {
    return props.modelValue
  },
  set(value) {
     emits('update:modelValue', value)
  },
})
const c_options = computed(()=>{
  let _arr=[]
  if(Array.isArray(props.options)){
    _arr=props.options
  }
  return  _arr
})
const changeBtn = (value, date) => {
  emits('change', value)
}
</script>
<style lang="less" scoped>
  :deep(.ivu-select-selection) {
    .ivu-select-prefix ~ .ivu-select-input{
      padding-left: 0;
    }
    .ivu-select-input{
      top: 0;
    }
  }
  .prefix{
    display: flex;
    align-items: center;
    justify-content: center;
  }
 .icon{
    display: inline-block;
    width:var(--ui-size-20);
    height:var(--ui-size-20);
  }
  .option-item{
    display: flex;
    align-items: center;
    >*{
      &:not(:last-child){
        margin-right:6px;
      }
    }

    p{
      flex: 1;
    }
  }
</style>
