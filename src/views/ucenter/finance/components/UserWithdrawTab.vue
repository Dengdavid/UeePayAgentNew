<template>
  <UiPage ref="pageRef" :data="data" row-key="id" isNotTitle @init="init"></UiPage>
</template>

<script setup>
import { computed, ref } from 'vue'
import { t } from '@/utils'

defineProps({
  active: {
    type: String,
    default: '',
  },
})

const pageRef = ref(null)
const emit = defineEmits(['init'])
const init = () => {
  emit('init')
}

const statusList = [
  { label: t('finance.status.all'), value: '' },
  { label: t('finance.status.pendingReview'), value: 'audit' },
  { label: t('finance.status.processing'), value: 'pending' },
  { label: t('finance.status.waiting'), value: 'waiting' },
  { label: t('finance.status.completed'), value: 'completed' },
  { label: t('finance.status.failed'), value: 'failed' },
  { label: t('finance.status.rejected'), value: 'rejected' },
]

const statusOptions = {
  completed: {
    label: t('finance.status.completed'),
    type: 'success',
  },
  pending: {
    label: t('finance.status.processing'),
    type: 'primary',
  },
  waiting: {
    label: t('finance.status.waiting'),
    type: 'primary',
  },
  audit: {
    label: t('finance.status.pendingReview'),
    type: 'primary',
  },
  failed: {
    label: t('finance.status.failed'),
    type: 'error',
  },
  rejected: {
    label: t('finance.status.rejected'),
    type: 'error',
  },
}

const openTxid = (row) => {
  if(!row.txid){
    return
  }
  window.open(`https://tronscan.org/#/transaction/${row.txid}`, '_blank')
}

const getWithdrawAmount = (row) => {
  const amount = Number(row.amount || 0)
  const fee = Number(row.fee || 0)
  return (amount + fee).toFixed(3)
}

const data = computed(()=>{
  return {
    apiUrl: '/user/withdrawList',
    statusKey: 'status',
    status: statusList,
    labelWidth: 76,
    search:{

    },
    searchThead: [
      {
        label: t('finance.fields.withdrawalTime'),
        type: 'daterange',
        startKey: 'startTime',
        endKey: 'endTime',
        maxMonths: 1,
        width: 230,
      },
    ],
    thead: [
      {
        label: t('finance.fields.withdrawalTime'),
        prop: 'create_time',
        width: 174,
        wapType: 'title',
      },
      {
        label: t('finance.fields.status'),
        prop: 'status',
        width: 100,
        formType: 'dot',
        wapType: 'status',
        options: statusOptions,
      },
      {
        label: t('finance.fields.withdrawalAmountUsd'),
        prop: 'withdrawAmountUsd',
        width: 120,
        value: getWithdrawAmount,
      },
      {
        label: t('finance.fields.creditedAmountUsd'),
        prop: 'amount',
        width: 120,
      },
      {
        label: t('finance.fields.feeUsd'),
        prop: 'fee',
        width: 120,
      },
      {
        label: t('finance.fields.creditedAt'),
        prop: 'finish_time',
        width: 174,
        value: (row) => row.finish_time || '--',
      },
      {
        label: t('finance.fields.remark'),
        prop: 'remark',
        minWidth: 220,
      },
    ],
    actions: [
      {
        label: t('finance.fields.blockInfo'),
        disabled: (row) => !row.txid,
        click: openTxid,
      },
    ],
  }
})
</script>
