<template>
  <UiPage :tabs="tabs" :counts-title="$t('finance.financialStatistics')" @init="getInfo">
    <template #counts>
      <UiCounts :data="stats" :list="countsList" :loading="loading"  @refresh="getInfo"/>
    </template>
  </UiPage>
</template>

<script setup>
import { postApi } from '@/utils/api'
import { toRoute } from '@/utils/route'
import { computed, onMounted, ref, shallowRef } from 'vue'
import { useUserStoreRefs } from '@/utils/store'
import { t } from '@/utils'
const { user } = useUserStoreRefs()
import UserFinancialTab from './components/UserFinancialTab.vue'
import UserRechargeTab from './components/UserRechargeTab.vue'
import UserWithdrawTab from './components/UserWithdrawTab.vue'

const tabs = shallowRef([
  { title: t('finance.tabs.transactions'), name: 'list', component: UserFinancialTab },
  { title: t('finance.tabs.recharge'), name: 'recharge', component: UserRechargeTab },
  { title: t('finance.tabs.withdrawal'), name: 'withdraw', component: UserWithdrawTab },
])
const loading = ref(false)
const stats = ref({})
const countsList = computed(()=>{
  return [
    {
      label: t('finance.availableBalance'),
      prop:"money",
      type:"money",
      countType:"available_balance",
      style:{
        background:"#f5f7ff",
      },
      btns:[
        {
          label: t('finance.recharge'),
          type:"default",
          click:()=>{
            toRoute('ucenter_deposit')
          },
        },
        {
          label: t('finance.withdrawal'),
          type:"warning",
          hidden:user.value?.parent_uid,
          click:()=>{
            toRoute('withdraw')
          },
        },
      ]
    },
    {
      label: t('finance.totalRechargeAmount'),
      prop:"deposit_amount",
      type:"money",
      style:{
        background:"#f6faf5",
      },
      btns:[
        {
          label:(data)=>t('finance.rechargeCount', { count: data?.deposit_number || 0 }),
        },
      ]
    },
    {
      label: t('finance.totalWithdrawalAmount'),
      prop:"withdraw_amount",
      type:"money",
      style:{
        background:"#fff8f2",
      },
      btns:[
        {
          label:(data)=>t('finance.withdrawalCount', { count: data?.withdraw_number ?? 0 }),
        },
      ]
    },
  ]
})


//获取财务状态
const getInfo =  ()=> {
  loading.value=true
  postApi('/user/profitStatistics')
    .then((res) => {
      stats.value = res || {}
    })
    .catch(() => {
    })
    .finally(()=>{
      loading.value=false
    })
}


onMounted(() => {
  getInfo()
})
</script>

<style scoped lang="less">
.stat-cards {
  display: flex;
  grid-gap: 10px;
  .cell{
    flex: 1;
    background: #fafafa;
    padding:var(--ui-padding-16-20);
    .content {
        font-weight: 700;
    }
    .unit {
      margin-right: 3px;
      font-size: 18px;
    }
  }
}
</style>
