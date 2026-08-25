<template>
   <div class="manage-page">
      <div class="manage-thead">
         <router-link class="manage-thead-item" :class="{active: route.name === item.name}" :to="{name:item.name}" v-for="item in manageRoutes" :key="item.name">
            {{ item.meta.titleKey ? $t(item.meta.titleKey) : item.meta.title }}
         </router-link>
      </div>
      <div class="manage-main">
         <router-view></router-view>
      </div>
   </div>
</template>

<script setup>
import { isPhone } from '@/utils/device.js'
import { ref } from 'vue'
import {manageRoutes} from '@/router/router'
import { useRoute, useRouter } from 'vue-router'
const route = useRoute()
const props = defineProps({
})

</script>

<style lang="less" scoped>
.manage-page{
   position: absolute;
   top: 0;
   left: 0;
   right: 0;
   bottom: 0;
   display: flex;
   flex-direction: column;
   >*{
      &:not(:last-child){
         border-bottom: 1px solid #e5e5e5;
      }
   }
   .manage-thead{
      display: flex;
      align-items: center;
      overflow-y: hidden;
      background: #fff;
      .manage-thead-item{
      flex-shrink: 0;
         padding: 0 16px;
         line-height:50px;
         cursor: pointer;
         color: #333;
         position: relative;
         &:hover{
            color: var(--primary-color);
         }
         &.active{
            font-weight: bold;
            color: var(--primary-color);
            &::after{
               content: '';
               position: absolute;
               bottom: 0;
               left: 0;
               width: 100%;
               height: 2px;
               background-color: var(--primary-color);
            }
         }
      }
   }
   .manage-main{
      flex: 1;
      overflow: hidden;
      position: relative;
   }
}
</style>
