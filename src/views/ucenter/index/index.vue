<template>
  <UiPage isNotTitle  ref="pageRef">
    <div class="list-b-32">
      <UiCell :title="$t('dashboard.overview')">
        <UiCounts :data="stats" :list="countsList" :loading="countsLoading" @refresh="getInfo"/>
      </UiCell>
      <UiCell :title="$t('dashboard.trend')" :loading="loading">
        <template #btn>
          <TabsDayBox  @change="handleTabsChange"></TabsDayBox>
        </template>
        <EChartBoxLine :xData="eChartData.xData" :yData="eChartData.yData"/>
      </UiCell>
    </div>
  </UiPage>
</template>

<script setup>
import EChartBoxLine from '@/components/echarts/EChartBoxLine.vue';
import TabsDayBox from '@/components/com/TabsDayBox.vue';
import { computed, ref,onMounted,reactive } from 'vue'
import { getApi,postApi } from '@/utils/api.js'
import { format, subDays } from 'date-fns';
import { message } from '@/utils/message.js'
import { isPhone } from '@/utils/device.js'
import { toRoute } from '@/utils/route'
import { useUserStoreRefs } from '@/utils/store'
import { t } from '@/utils'
const { user } = useUserStoreRefs()
const pageRef=ref(null)
const loading=ref(false)
const countsLoading=ref(false)
const stats = ref({})
const countsList = computed(()=>{
  return [
    {
      label: t('dashboard.availableBalance'),
      prop:"money",
      type:"money",
      countType:"available_balance",
      icon:'',
      style:{
        background:"#f5f7ff",
      },
      btns:[
        {
          label: t('dashboard.recharge'),
          type:"default",
          click:()=>{
            toRoute('ucenter_deposit')
          },
        },
        {
          label: t('dashboard.withdrawal'),
          type:"warning",
          hidden:user.value?.parent_uid,
          click:()=>{
            toRoute('withdraw')
          },
        },
      ]
    },
    {
      label: t('dashboard.invitationCommission'),
      prop:"total_amount",
      type:"money",
      style:{
        background:"#f6faf5",
      },
      btns:[
        {
          label:(data)=>t('dashboard.invitedUsers', { count: data?.deposit_number || 0 }),
        },
        {
          label: t('dashboard.inviteNow'),
          type:"default",
          click:()=>{
            toRoute('ucenter_invite')
          },
        },
      ]
    },
    {
      label: t('dashboard.availableCardSlots'),
      prop:"available_capacity",
      decimals:0,
      style:{
        background:"#fff3f3",
      },
      tips: t('dashboard.unlimitedTip'),
      btns:[
        {
          label:(data)=>t('dashboard.totalCardSlots', { count: data?.total_capacity < 0 ? '∞' : data?.total_capacity || 0 }),
        },
        {
          label: t('dashboard.openCardNow'),
          type:"default",
          click:()=>{
            toRoute('cardAdd')
          },
        },
      ]
    },
    {
      label: t('dashboard.cardBalance'),
      prop:"card_amount",
      type:"money",
      style:{
        background:"#fff8f2",
      },
      btns:[
        {
          label:(data)=>t('dashboard.totalCards', { count: data?.card_number || 0 }),
        },
      ]
    },
  ]
})

const echartRef=ref(null)
const eChartData=reactive({
   search:{
      quick_type:0,
      start_date:format(subDays(new Date(),7), "yyyy-MM-dd"),
      end_date:format(new Date(), "yyyy-MM-dd"),
   },
   show:false,
   xData:[],
   yData:[],
})
const handleTabsChange = (item) => {
   eChartData.search.start_date=item.start
   eChartData.search.end_date=item.end
   getData()
}
const getData = () => {
   eChartData.show=false
   loading.value=true
   getApi("/user/consumptionStatistics",eChartData.search)
      .then((res)=>{
         eChartData.xData=res.detail?.map(item=>format(new Date(item.date), "MM-dd")) || []
         eChartData.yData=res.detail?.map(item=>item.amount) || []
      })
      .catch(err=>{
      })
      .finally(()=>{
         eChartData.show=true
         loading.value=false
      })
};

//获取财务状态
const getInfo =  ()=> {
  countsLoading.value=true
  postApi('/user/userStatistics')
    .then((res) => {
      stats.value = res || {}
    })
    .catch(() => {
    })
    .finally(()=>{
      countsLoading.value=false
    })
}


onMounted(() => {
  getInfo()
  getData()
})
</script>

<style scoped lang="less">

</style>
