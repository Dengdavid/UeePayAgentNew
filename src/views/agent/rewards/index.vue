<template>
  <UiPage ref="pageRef" :data="data" row-key="id" :counts-title="$t('agent.rewards.statsTitle')">
    <template #counts>
      <UiCounts :data="stats" :list="countsList" :loading="statsLoading" />
    </template>
    <template #tip>
      <Alert  type="warning" class="m-b-0">
        {{ $t('agent.rewards.settlementTip') }}
      </Alert>
    </template>
  </UiPage>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { getApi } from '@/utils/api.js'
import { message } from '@/utils/message.js'
import { toRoute } from '@/utils/route.js'
import { status } from './data.js'
import { t } from '@/utils'

const pageRef = ref(null)
const stats = ref({})
const statsLoading = ref(false)
const countsList = computed(() => [
  {
    label: t('agent.rewards.estimatedThisMonth'),
    prop: 'month_income',
    type: 'money',
    decimals: 2,
    style: {
      background: '#f5f7ff',
    },
  },
  {
    label: t('agent.rewards.pendingLastMonth'),
    prop: 'pending_amount',
    type: 'money',
    decimals: 2,
    style: {
      background: '#fff8f2',
    },
  },
  {
    label: t('agent.rewards.totalHistorical'),
    prop: 'total_reward',
    type: 'money',
    decimals: 2,
    style: {
      background: '#f6faf5',
    },
  },
])

const data = computed(() => ({
  apiUrl: '/vcc/InviteCommissionSummary',
  search: {
    startTime: '',
    endTime: '',
  },
  searchThead: [
    {
      label: t('agent.rewards.month'),
      type: 'monthrange',
      startKey: 'startTime',
      endKey: 'endTime',
      width: 300,
    },
  ],
  labelWidth:80,
  thead: [
    {
      label: t('agent.rewards.month'),
      prop: 'date',
      minWidth: 120,
      wapType: 'title',
    },
    {
      label: t('agent.rewards.status'),
      prop: 'status',
      width: 110,
      formType: 'dot',
      wapType: 'status',
      options: status,
    },
    {
      label: t('agent.rewards.total'),
      prop: 'amount',
      unit: '$',
      width: 140,
    },
    {
      label: t('agent.rewards.accountRechargeFee'),
      prop: 'account_depost_amount',
      unit: '$',
      width: 140,
    },
    {
      label: t('agent.rewards.cardActivationFee'),
      prop: 'create_amount',
      unit: '$',
      width: 140,
    },
    {
      label: t('agent.rewards.cardTransferInFee'),
      prop: 'card_depost_amount',
      unit: '$',
      width: 140,
    },
    {
      label: t('agent.rewards.transactionFee'),
      prop: 'auth_amount',
      unit: '$',
      width: 140,
    },
    {
      label: t('agent.rewards.crossBorderFee'),
      prop: 'foreign_amount',
      unit: '$',
      width: 140,
    },
    {
      label: t('agent.rewards.membershipFee'),
      prop: 'buy_group_amount',
      unit: '$',
      width: 140,
    },
    {
      label: t('agent.rewards.remark'),
      prop: 'remark',
      minWidth: 180,
    },
  ],
  actions: [
    {
      label: t('agent.rewards.detail'),
      click: (row) => {
        toRoute('ucenter_agent_detail', {
          id: row.id,
        }, 'params')
      },
    },
  ],
}))

const getStats = () => {
  statsLoading.value = true
  getApi('/vcc/InviteCommissionSummary/statistics')
    .then((res) => {
      stats.value = res || {}
    })
    .catch((err) => {
      message(err?.msg || err, 'error')
    })
    .finally(() => {
      statsLoading.value = false
    })
}

onMounted(() => {
  getStats()
})
</script>
<style lang="less" scoped>
.m-b-0{
  margin-bottom: 0;
}
</style>
