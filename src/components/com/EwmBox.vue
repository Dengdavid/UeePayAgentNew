<template>
  <div class="ewmBox" :style="{
    width:size+'px',
  }" v-if="url">
     <img :src="imgUrl" />
     <p class="title" v-if="title">{{ title }}</p>
  </div>
</template>

<script setup>
import { ref,watch } from 'vue'
import QRCode from 'qrcode'
const props = defineProps({
  url:{
    type:String,
  },
  size:{
    type:Number,
    default:18
  },
  title:{
    type:String,
  }
})
const imgUrl=ref('')

const handleQrcode=async()=>{
    imgUrl.value = await QRCode.toDataURL(props.url, {
      errorCorrectionLevel: 'H',
      type: 'image/jpeg',
      quality: 0.8,
      margin: 2
    })
}
watch(()=>props.url,(newVal)=>{
   if(newVal){
      handleQrcode()
   }
},{immediate:true})
</script>
<style lang="less" scoped>
.ewmBox{
  background-color: var(--ui-color-surface);
  padding:var(--ui-padding-4);
  border-radius: var(--ui-radius-sm);
  border: var(--ui-border-subtle);
  box-shadow: var(--ui-shadow-media);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  img{
    width: 100%;
    height: 100%;
    display: block;
  }
  .title{
   text-align: center;
   font-size: 12px;
   color: var(--ui-color-text-secondary);
  }
}
</style>
