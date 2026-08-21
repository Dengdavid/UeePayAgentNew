<template>
  <div class="stepBox list-b-22">
    <div class="stepBox-thead">
       <div class="step-item" :class="{
          active:current===index,
          success:current>index
        }" v-for="(item,index) in data">
            <div class="step-icon">{{ index+1 }}</div>
            <div class="step-label">{{ item.label }}</div>
        </div>
    </div>
    <div class="stepBox-slot">
      <slot :name="'step'+(current+1)"></slot>
    </div>
    <div class="stepBox-footer">
        <Button v-if="current!=0" :disabled="loading" @click="preStep">上一步</Button>
        <Button type="primary" @click="nextStep" :loading="loading">{{ current==data.length-1?lastText:'下一步'}}</Button>
    </div>
  </div>
</template>
<script setup>
import { Button } from 'view-ui-plus';
import { computed, ref } from 'vue'
const props = defineProps({
  data: {
    type:Array,
    default:()=>{
      return []
    }
  },
  lastText:{
    type:String,
    default:'完成'
  },
  loading:{
    type:Boolean,
    default:false
  }
})
const current=ref(0)
const emits=defineEmits(['nextStep','preStep','finish'])
const nextStep=()=>{
  //如果是最后一步
  if(current.value==props.data.length-1){
    emits('finish')
    return
  }
  current.value+=1
  emits('nextStep',current.value)
}
const preStep=()=>{
  current.value-=1
  emits('preStep',current.value)
}
</script>
<style scoped lang="less">
.stepBox{
  .stepBox-thead{
    display: flex;
    justify-content: space-between;
    position: relative;
    z-index: 2;
    &::after{
    content: '';
    position: absolute;
    top:20px;
    left:32px;
    right: 32px;
    z-index: -1;
    height: var(--ui-size-2);
    background-color: #f0f0f0;
  }
  .step-item{
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    gap:4px;
    .step-icon{
      width:var(--ui-size-40);
      height:var(--ui-size-40);
      border-radius: var(--ui-radius-circle);
      background-color: #f0f0f0;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size:16px;
      color: var(--ui-color-text-subtle);
      border:var(--ui-border-on-dark-thick);
    }
      .step-label{
        font-size: 14px;
        color: var(--ui-color-text-secondary);
      }
      &.success{
        .step-icon{
          background-color: var(--ui-color-success);
          color: var(--ui-color-text-inverse);
        }
        .step-label{
          color: var(--ui-color-success);
        }
      }
      &.active{
        .step-icon{
          background-color: var(--primary-color);
          color: var(--ui-color-text-inverse);
        }
        .step-label{
          color: var(--primary-color);
        }
      }
    }
  }
  .stepBox-footer{
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    :deep(.ivu-btn){
      min-width:80px;
    }
  }
}
</style>
