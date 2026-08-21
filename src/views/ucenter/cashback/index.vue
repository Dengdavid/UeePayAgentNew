<template>
  <UiPage ref="pageRef" :data="data" row-key="date">
    <template #counts>
      <UiCounts :data="stats" :list="countsList" :loading="statsLoading"/>
    </template>
  </UiPage>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { getApi } from '@/utils/api.js'
import { message } from '@/utils/message.js'
import { toRoute } from '@/utils/route.js'
import { isPhone } from '@/utils/device.js'
import { status, formatCashbackDate } from './data.js'
import myMoment from '@/utils/myMoment.js'
import { t } from '@/utils'

const pageRef = ref(null)
const stats = ref({})
const statsLoading = ref(false)



const countsList = computed(() => [
  {
    label: t('cashback.list.refundedAmount'),
    prop: 'amount',
    type: 'money',
    decimals: 4,
    style: {
      background: '#f5f7ff',
    },
  },
  {
    label: t('cashback.list.refundedCount'),
    prop: 'count',
    decimals: 0,
    unit: t('cashback.list.times'),
    style: {
      background: '#f6faf5',
    },
  },
  {
    label: t('cashback.list.pendingAmount'),
    prop: 'waiting_amount',
    type: 'money',
    decimals: 4,
    style: {
      background: '#fff8f2',
    },
  },
  {
    label: t('cashback.list.appealingAmount'),
    prop: 'appeal_amount',
    type: 'money',
    decimals: 4,
    style: {
      background: '#fff3f3',
    },
  },
])

const data = computed(() => ({
  apiUrl: '/vcc/Cashback',
  search: {
    startTime: '2025-10',
    endTime: myMoment().format('YYYY-MM'),
  },
  searchThead: [
    {
      label: t('cashback.list.rewardMonth'),
      type: 'monthrange',
      startKey: 'startTime',
      endKey: 'endTime',
      width: 300,
    },
  ],
  btns: [
    {
      label: t('cashback.viewRate'),
      type: 'primary',
      icon: 'ios-pricetag',
      click: handleRate,
    },
  ],
  thead: [
    {
      label: t('cashback.list.cashbackMonth'),
      prop: 'date',
      minWidth: 130,
      wapType: 'title',
      value: (row) => formatCashbackDate(row.date),
    },
    {
      label: t('cashback.list.consumptionAmount'),
      prop: 'clean_consumption_amount',
      unit:'$',
      minWidth: 130,
      style: () => ({
        color: '#1f2937',
        fontWeight: 600,
      }),
    },
    {
      label: t('cashback.list.cashbackAmount'),
      prop: 'amount',
      unit:'$',
      minWidth: 130,
      style: () => ({
        color: 'var(--primary-color)',
        fontWeight: 700,
      }),
    },
    {
      label: t('cashback.list.status'),
      prop: 'status',
      width: 110,
      formType: 'dot',
      wapType: 'status',
      options: status,
    },
  ],
  actions: [
    {
      label: t('cashback.list.detail'),
      click: (row) => {
        toRoute('ucenter_cashback_detail', {
          date: formatCashbackDate(row.date),
        })
      },
    },
  ],
}))

const handleRate = () => {
  toRoute('ucenterCashbackRate')
}

const getStats = () => {
  statsLoading.value = true
  getApi('/vcc/Cashback/statistics')
    .then((res) => {
      stats.value = res || {}
    })
    .catch((err) => {
      message(err?.msg, 'error')
    })
    .finally(() => {
      statsLoading.value = false
    })
}

onMounted(() => {
  getStats()
})
</script>
