<template>
  <div class="ucenter-box appAuto">
    <div class="ucenter-box-menu" v-if="!isPhone">
      <template v-for="item in ucenterMune">
        <div class="ucenter-box-menu-item" :class="activeMune(item)" v-if="showMune(item)" @click="toRoute(item.name)">
          <p>{{ item.meta.menuTitleKey ? $t(item.meta.menuTitleKey) : (item.meta.titleKey ? $t(item.meta.titleKey) : item.meta.title) }}</p>
          <span class="dot" v-if="item.name==='ucenter_express'">{{ $t('menu.recommended') }}</span>
        </div>
      </template>
    </div>
    <div class="ucenter-box-center">
      <router-view></router-view>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { ucenterRoutes } from '@/router/router.js'
import { toRoute,useRoute } from '@/utils/route.js'
import { isPhone } from '@/utils/device.js'
const route = useRoute()
import { useUserStoreRefs } from '@/utils/store'
const { user, menuPermissions } = useUserStoreRefs()
const ucenterMune=computed(()=>{
  return ucenterRoutes.children.filter(item=>!item.meta?.hidden)
})
const activeMune=(item)=>{
  if(route.name===item.name || item.name===route.meta?.direct){
    return 'active'
  }
  return ''
}
const showMune=(item)=>{
  if(item?.meta?.need_auth){
    if(user.value?.[item.meta.need_auth]){
      return true
    }else{
      return menuPermissions.value?.[item.meta.need_auth]
    }
  }
  return true
}
</script>

<style scoped lang="less">
.ucenter-box{
  display: flex;
  align-items: start;
  gap: 10px;
  .ucenter-box-menu{
    width: max-content;
    min-width: 160px;
    flex: 0 0 auto;
    background: #fff;
    display: flex;
    flex-direction: column;
    gap:2px;
    .ucenter-box-menu-item{
      display: flex;
      align-items: center;
      padding: var(--ui-padding-0-16);
      height: var(--ui-size-40);
      cursor: pointer;
      position: relative;
      color: var(--ui-color-text-secondary);
      p{
        white-space: nowrap;
      }
      .dot{
        flex-shrink: 0;
        font-size: 12px;
        background: #f00;
        padding:2px 6px;
        border-radius:var(--ui-radius-full);
        margin-left: 10px;
        color: var(--ui-color-text-inverse);
        white-space: nowrap;
        transform:scale(0.8);
      }
      &:hover{
        color: var(--primary-color);
        background: #f3f7ff;
      }
      &.active{
        color: var(--primary-color);
        background: #f3f7ff;
        &::after{
          content: '';
          position: absolute;
          left: 0;
          top: 0;
          bottom:0;
          width: var(--ui-size-3);
          background: var(--primary-color);
          border-radius: 4px 4px 0 0;
        }
      }
    }
  }
  .ucenter-box-center{
    flex: 1;
    overflow: hidden;
  }
}

@media screen and (max-width: 768px) {
  .ucenter-box-menu{
    display: none !important;
  }
}
</style>
