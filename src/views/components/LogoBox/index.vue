<template>
  <div class="logoBox"  @click="handleGoHome" v-if="configDatas?.site_logo || configDatas?.site_name">
    <div class="logoImg" v-if="configDatas?.site_logo">
      <img :src="configDatas.site_logo"/>
    </div>
    <h3 v-if="configDatas?.site_name && !collapsed" class="logoText">{{ configDatas?.site_name}}</h3>
  </div>
</template>

<script setup>
import { toRoute } from '@/utils/route.js'
import { useAppStoreRefs,useUserStoreRefs } from '@/utils/store.js'
const {isLogin } = useUserStoreRefs()
const {configDatas} = useAppStoreRefs()
defineProps({ collapsed: Boolean })
const handleGoHome = ()=>{
  const {source_url} = configDatas.value || {}
  if(source_url){
    window.location.href = source_url
    return
  }
  //判断是否登录
  if(isLogin.value){
    toRoute('home')
  }else{
    toRoute('login')
  }
}
</script>

<style scoped lang="less">
.logoBox {
  width: fit-content;
  position: relative;
  padding: 0;
  overflow: hidden;
  border: 0;
  background: transparent;
  cursor: pointer;
  isolation: isolate;
  display: flex;
  align-items: center;
  gap:8px;
  .logoImg{
    max-width: 32px;
    max-height: 32px;
    img {
      display: block;
      max-width: 100%;
      max-height: 100%;
    }
  }
}
</style>
