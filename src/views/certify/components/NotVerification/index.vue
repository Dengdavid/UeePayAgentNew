<template>
   <div class="page-center certificationBox">
      <PageTitle :title="`${$t('certify.selectTypeTitle')}`">
        <template #subtitle>
          <div class="header-subtitle">
            <p>{{ $t('certify.enterpriseTip') }}</p>
          </div>
        </template>
      </PageTitle>
      <div class="list">
         <div class="list-item" :class="{ 'disabled': authRemainingTimes()<=0 }" v-for="item in certificationList" @click="startVerification(item.type)">
            <dl>
               <dt>
                  <Icon :type="item.icon" size="22" />
               </dt>
               <dd class="list-b-6">
                  <h2>{{ item.name }}{{ $t('certify.typeCertify', { type: '' }) }}</h2>
                  <p class="desc" v-html="`${item.desc}`"></p>
               </dd>
            </dl>
         </div>
      </div>
      <div class="authRemainingTimesBox">
         <span class="iconfont icon-shenjizhuizong"></span>
         <p v-html="$t('certify.remainingTimes', { times: authRemainingTimes() })"></p>
      </div>
   </div>
</template>

<script setup>
import {ref, computed} from 'vue'
import { authRemainingTimes } from '@/utils/level.js'
import { t } from '@/utils'
const emit=defineEmits(['startVerification'])
const startVerification=(type)=>{
   if(authRemainingTimes()<=0){
      return
   }
   emit('startVerification',type)
}
const certificationList = computed(() => [
   {
      type:0,
      name: t('certify.personal'),
      icon:'md-person',
      desc: t('certify.personalDescList'),
   },
   {
      type:1,
      name: t('certify.enterprise'),
      icon:'ios-people',
      desc: t('certify.enterpriseDescList'),
   }
])
</script>

<style scoped lang="less">
.authRemainingTimesBox{
   margin-top: 16px;
   display: flex;
   align-items: center;
   justify-content: center;
   gap:8px;
   padding:var(--ui-padding-4-16);
   border: var(--ui-border-subtle);
   border-radius:var(--ui-radius-full);
   background: #fafafa;
}
.certificationBox{
   display: flex;
   flex-direction: column;
   justify-content: center;
   align-items: center;
   gap:16px;
   .title{
      text-align: center;
   }
   .list{
      display: flex;
      flex-direction: column;
      gap:16px;
      width: 100%;
      max-width:500px;
   }
   .list-item{
      flex: 1;
      background: #fff;
      border: var(--ui-border-subtle);
      border-radius: var(--ui-radius-lg);
      padding: var(--ui-padding-16);
      cursor: pointer;
      transition: all 0.3s ease;
      dl{
         flex: 1;
         display: flex;
         align-items: center;
         gap:16px;
         dt{
            width:var(--ui-size-44);
            height:var(--ui-size-44);
            border-radius: var(--ui-radius-circle);
            background-color: var(--primary-color);
            display: flex;
            align-items: center;
            justify-content: center;
            color: var(--ui-color-text-inverse);
         }
         dd{
            flex: 1;
            overflow: hidden;
            line-height: 1.2;
         }
      }
      .desc{
         font-size: 12px;
         color: var(--ui-color-text-secondary);
      }
      &:hover{
         color:var(--ui-color-text-inverse);
         border-color: var(--primary-color);
         background-color: var(--primary-color);
         dl{
            dt{
               background-color: #fff;
               color: var(--primary-color);
            }
         }
         .desc{
            color:var(--ui-color-text-inverse);
         }
         :deep(.text-smg){
            color: var(--ui-color-text-inverse) !important;
         }
      }
      &.disabled{
         cursor: not-allowed;
         background: #f7f7f7;
         color:var(--ui-color-text-secondary);
         dl{
            dt{
               background-color: #ddd;
               color: var(--ui-color-text-secondary);
            }
         }
         .desc{
            color:var(--ui-color-text-secondary);
         }
         :deep(.text-smg){
            color: var(--ui-color-text-secondary) !important;
         }
      }
   }
}
</style>
