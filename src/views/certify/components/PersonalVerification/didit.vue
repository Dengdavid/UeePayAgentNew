<template>
   <div class="page" v-if="url">
      <div class="page—back" @click="backBtn">
         <Icon type="ios-arrow-back"/>
         <span>{{ $t('button.back') }}</span>
      </div>
      <div class="iframeBox">
        <iframe
         :src="url"
         width="100%"
         height="100%"
         frameborder="0"
         @load="handleLoad"
      ></iframe>
      </div>
      <EwmBox class="ewm" v-if="!isPhone" :url="url" :size="100" :title="$t('certify.scanAuth')"/>
   </div>
</template>

<script setup>
import { onMounted, onUnmounted,nextTick } from 'vue'
import EwmBox from '@/components/com/EwmBox.vue'
import {isPhone} from '@/utils/device'
import {message} from '@/utils/message'
import { t } from '@/utils'
const props = defineProps({
   url:{
      type:String,
      default:''
   },
   data:{
    type:Object,
    default:()=>({})
   }
})
// 监听iframe加载完成
const handleLoad=()=>{
}
const emits=defineEmits(['update:url','getPersonalVerification','backBtn'])
//监听iframe的按钮事件
const handleMessage = (event) => {
  // 在这里处理具体的按钮事件逻辑
  // console.log(event.data);
  switch (event.data.type) {
   //提交订单
   case 'didit:status_updated':
      close()
      break;
   case 'didit:completed':
      if(event.data.data.status==='Approved'){
        message(t('certify.verificationApproved'))
         close()
      }
      break;
   default:
      break;
  }
}
const backBtn=()=>{
  emits('backBtn')
  emits('update:url',null)
  props.data.session_id=''
}
//关闭iframe
const close=async ()=>{
   nextTick(()=>{
      emits('getPersonalVerification')
      emits('update:url',null)
   })
   //记录会话id
   localStorage.setItem("SESSIONID",props.data.session_id)
   props.data.session_id=''
}
onMounted(() => {
  window.addEventListener('message', handleMessage)
})

onUnmounted(() => {
  window.removeEventListener('message', handleMessage)
})
onMounted(() => {
})
</script>

<style scoped lang="less">
.page{
   position: absolute;
   left:50%;
   transform: translateX(-50%);
   top:0;
   right:0;
   bottom: 0;
   width: 100%;
   max-width: 1220px;
   .iframeBox{
      max-width: 1100px;
      width: 100%;
      height: 100%;
      margin: 0 auto;
   }
   .page—back{
      position: absolute;
      top:10px;
      left:10px;
      z-index: 999;
      cursor: pointer;
      &:hover{
         color:var(--primary-color);
      }
   }
   .ewm{
      position: absolute;
      top:10px;
      right:10px;
   }
}
</style>
