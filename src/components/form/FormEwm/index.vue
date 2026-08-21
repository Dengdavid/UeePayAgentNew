<template>
  <div class="form-ewm" :class="{'notShadow':notShadow}"  :style="{
    width:size(width),
    height:size(height || width),
    padding:size(padding),
    borderRadius:size(radius),
    background:background
  }" v-if="imgUrl">
    <div class="logo"  v-if="logo">
      <img :src="logo" />
    </div>
    <img class="ewm" :src="imgUrl" />
  </div>
</template>

<script setup>
import { ref,watch } from 'vue'
import QRCode from 'qrcode'
const props = defineProps({
  url: {
    type: String,
  },
  logo:{
    type: String,
    default:''
  },
  width:{
    type:[Number,String],
    default:120
  },
  height:{
    type:[Number,String],
    default:0
  },
  padding:{
    type:[Number,String],
    default:8
  },
  radius:{
    type:[Number,String],
    default:8
  },
  background:{
    type:String,
    default:'#fff'
  },
  notShadow:{
    type:Boolean,
    default:false
  }
})
const imgUrl=ref('')
const size=(num)=>{
  if(typeof num==='number') return num+'px'
  return num
}
const setUrl=async(url)=>{
  if(!url) return
  imgUrl.value = await QRCode.toDataURL(url, {
    errorCorrectionLevel: 'H',
    type: 'image/jpeg',
    quality: 0.8,
    margin: 0
  })
}
watch(()=>props.url,(val)=>{
  setUrl(val)
},{
  immediate:true
})
</script>
<style lang="less" scoped>
.form-ewm{
  box-shadow: var(--ui-shadow-media);
  position: relative;
  &.notShadow{
    width: 100% !important;
    height: 100% !important;
    box-shadow: none;
    padding: 0 !important;
    background: none !important;
    border-radius: 0 !important;
  }
  .logo{
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width:var(--ui-size-32);
    height:var(--ui-size-32);
    background: var(--ui-color-surface);
    border-radius: var(--ui-radius-sm);
    overflow: hidden;
    box-shadow: var(--ui-shadow-media-strong);
    padding:var(--ui-padding-4);
    display: flex;
    align-items: center;
    justify-content: center;
    pointer-events:none;
    img{
      max-width: 100%;
      max-height: 100%;
    }
  }
  .ewm{
    width: 100%;
    height: 100%;
  }
}
</style>
