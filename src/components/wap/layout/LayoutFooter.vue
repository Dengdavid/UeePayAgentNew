<template>
  <div class="app-phone-footer">
    <div class="footer-phone" >
      <div class="footer-phone-item" :class="{
        'card-active':index==2,
        'on':((item?.nameArr || [item.name]).includes(route.name) && !ucenterShow) || (index===2 && ucenterShow)
      }" @click="typeof item.click ==='function'?item.click():toRouteFn(item)" v-for="(item,index) in menus" :key="item.name">
        <i class="iconfont" :class="item.meta.menuIcon"></i>
        <p
          v-if="index!==2"
          :title="item.meta.titleKey ? $t(item.meta.titleKey) : item.meta.title"
        >{{ item.meta.titleKey ? $t(item.meta.titleKey) : item.meta.title }}</p>
      </div>
    </div>
    <div class="cardBg"></div>
    <div class="ucenterPup" @click="ucenterShow=false" v-if="ucenterShow">
      <div class="ucenterPup-tbody" @click.stop="">
        <template v-for="item in ucenterMune">
          <div class="ucenterItem" :class="{
            on:(item?.children?.map(item=>item.name) || [item.name]).includes(route.name)
          }"  @click="toRouteFn(item)" v-if="showMune(item)" :key="item.name">
            <div class="icon-wrap" :style="item.meta.menuIconStyle">
              <span class="tag" v-if="item.meta.menuTagKey">{{ $t(item.meta.menuTagKey) }}</span>
              <Icon :type="item.meta.menuIcon" />
            </div>
            <span class="title">{{ item.meta.menuTitleKey ? $t(item.meta.menuTitleKey) : (item.meta.titleKey ? $t(item.meta.titleKey) : item.meta.title) }}</span>
          </div>
        </template>
        <div class="ucenterItem" @click="handlGoCustomer">
          <div class="icon-wrap">
            <i class="iconfont icon-kefu"></i>
          </div>
          <span class="title">{{ $t('help.onlineSupport') }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref,computed } from 'vue'
import { whiteRoutes,ucenterRoutes } from '@/router/router.js'
import { toRoute,useRoute } from '@/utils/route.js'
import { useUserStoreRefs,useAppStoreRefs } from '@/utils/store'
const { isLogin,user,menuPermissions } = useUserStoreRefs()
const { customerUrl } = useAppStoreRefs()
const route = useRoute()
const ucenterShow=ref(false)
const emit = defineEmits(['onBtnClick'])
const toRouteFn=(item)=>{
  ucenterShow.value=false
  toRoute(item.name)
  emit('onBtnClick')
}
const handlGoCustomer = function () {
  if (customerUrl.value) {
    window.open(customerUrl.value, '_blank')
  }
}
const helpRoute = whiteRoutes.find(item => item.name === 'help')
const ucenterMune=computed(()=>{
  const arr=ucenterRoutes.children.filter(item=>!item.meta?.hidden)
  return helpRoute ? [...arr, helpRoute] : arr
})
const showMune=(item)=>{
  if(item?.meta?.need_auth){
    if(user?.value?.[item?.meta?.need_auth]){
      return true
    }else{
      return menuPermissions?.value?.[item?.meta?.need_auth]
    }
  }
  return true
}
const menus=computed(()=>{
  const ucenterNames=[]
  ucenterRoutes.children.forEach(item=>{
    ucenterNames.push(item.name)
    if(item.children){
      item.children.forEach(subItem=>{
        ucenterNames.push(subItem.name)
      })
    }
  })
  const routeMap = new Map(whiteRoutes.map(item => [item.name, item]))
  return [
    routeMap.get('cooperate'),
    routeMap.get('card'),
    {
      ...ucenterRoutes,
      click:()=>{
        if(!isLogin.value){
          ucenterShow.value=false
          toRoute('login')
          return
        }
        ucenterShow.value=!ucenterShow.value
      },
      nameArr:ucenterNames
    },
    routeMap.get('express'),
    routeMap.get('pricing'),
  ].filter(Boolean)
})
</script>

<style scoped lang="less">
.footer-phone{
  display: flex;
  gap: 6px;
  position: relative;
  z-index: 2;
  background: var(--ui-color-surface);
  --width-card:60px;
  padding: var(--ui-padding-0-6);
  border-top: 1px solid #eee;
  .footer-phone-item{
    overflow: hidden;
    text-align: center;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    height:var(--ui-size-50);
    color: var(--ui-color-text-secondary);
    &:not(.card-active){
      flex: 1;
      &.on{
        color: var(--primary-color);
      }
    }
    p{
      width: 100%;
      font-size:10px;
      margin-top: -4px;
      overflow: hidden;
      flex-shrink: 0;
      white-space: nowrap;
      text-overflow: ellipsis;
    }
    .iconfont{
      width: var(--ui-size-32);
      height: var(--ui-size-32);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      font-size: var(--ui-size-22);
      line-height: 1;
    }
    &.card-active{
      width: var(--width-card);
      height: var(--width-card);
      position: relative;
      margin-top:-14px;
      border:3px solid #fff;
      background: var(--primary-color);
      color: var(--ui-color-text-inverse);
      border-radius: var(--ui-radius-circle);
      z-index: 2;
      .iconfont{
        font-size: var(--ui-size-28);
      }
      p{
        margin-top: -4px;
      }
      &.on{
        background: linear-gradient(180deg, #0a48d1 0, #1183fb 100%);
      }
    }
  }
}
.cardBg{
  --width-card-bg:62px;
  position: absolute;
  width: var(--width-card-bg);
  height: var(--width-card-bg);
  border-radius: var(--ui-radius-circle);
  left: 50%;
  bottom: 3px;
  transform: translateX(-50%);
  background: var(--ui-color-surface-neutral);
  z-index: -1;
}
.ucenterPup{
  position: fixed;
  left: 0;
  right: 0;
  top: 0;
  bottom:50px;
  z-index: -2;
  background: rgba(0, 0, 0, 0.2);
  .ucenterPup-tbody{
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    background: var(--ui-color-surface);
    overflow-x: hidden;
    max-height:70vh;
    padding: 24px 12px;
    border-radius: 20px 20px 0 0;
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    row-gap: 24px;
    column-gap: 8px;
    .ucenterItem{
      height: auto;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: flex-start;
      background: transparent;
      gap: 8px;
      .icon-wrap {
        width: var(--ui-size-48);
        height: var(--ui-size-48);
        flex: 0 0 var(--ui-size-48);
        border-radius: var(--ui-radius-14);
        display: flex;
        align-items: center;
        justify-content: center;
        position: relative;
        font-size: 26px;
        color: var(--ui-color-text-inverse);
        box-shadow: var(--ui-shadow-mobile-nav); /* 类似 iOS 的微量弥散投影 */
        transition: all 0.2s ease;
        background: linear-gradient(135deg, #3290ff 0%, #086bff 100%);
        .ivu-icon,
        .iconfont{
          width: var(--ui-size-26);
          height: var(--ui-size-26);
          display: inline-flex;
          align-items: center;
          justify-content: center;
          font-size: 26px;
          line-height: var(--ui-size-26);
        }
        .tag{
          font-size:10px;
          position: absolute;
          display: flex;
          align-items: center;
          justify-content: center;
          right: -12px;
          top: -4px;
          background: #ff0723;
          padding:var(--ui-padding-1-6);
          border-radius: var(--ui-radius-full);
          line-height:16px;
        }
      }

      .title {
        display: block;
        width: 100%;
        font-size: 12px;
        line-height: var(--ui-line-height-md);
        text-align: center;
        overflow-wrap: anywhere;
        color: var(--ui-color-text);
        margin-top: 2px;
      }

      &.on {
        background: transparent;
        .icon-wrap {
          /* 激活时稍微放大并加深阴影，不再覆盖渐变背景 */
          transform: scale(1.05);
          box-shadow: var(--ui-shadow-mobile-nav-active);
        }
        .title {
          color: var(--primary-color);
          font-weight: 600;
        }
      }
    }
  }
}
</style>
