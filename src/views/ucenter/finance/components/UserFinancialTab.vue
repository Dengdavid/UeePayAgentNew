<template>
  <UiPage ref="pageRef" :data="data" row-key="id" isNotTitle @init="init"></UiPage>
</template>

<script setup>
import { computed, ref } from 'vue'
import { format, subMonths } from 'date-fns'
import { financeTypes, financeStatusList } from '@/config/data.js'
import { t } from '@/utils'
defineProps({
  active: {
    type: String,
    default: '',
  },
})
const pageRef = ref(null)
const emit = defineEmits(['init'])
const init = () =>{
  emit('init')
}
const financeTypeLabelKeys = {
  AssetsDeposit: 'recharge',
  AssetsWithdrawal: 'withdrawal',
  transferIn: 'transferIn',
  transferOut: 'transferOut',
  purchase: 'purchase',
  refund: 'refund',
  settlement: 'settlement',
  adjustment: 'adjustment',
}
const financeStatusLabelKeys = {
  pending: 'processing',
  completed: 'completed',
  failed: 'failed',
  cancelled: 'cancelled',
}
const localizedFinanceTypes = computed(() => financeTypes.map(item => ({
  ...item,
  label: financeTypeLabelKeys[item.value]
    ? t(`finance.types.${financeTypeLabelKeys[item.value]}`)
    : item.label,
})))
const localizedFinanceTypeMaps = computed(() => Object.fromEntries(
  localizedFinanceTypes.value.map(item => [item.value, item.label])
))
const localizedFinanceStatusList = computed(() => financeStatusList.map(item => ({
  ...item,
  label: financeStatusLabelKeys[item.value]
    ? t(`finance.status.${financeStatusLabelKeys[item.value]}`)
    : item.label,
})))
const statusOptions = {
  completed: {
    label: t('finance.status.completed'),
    type: 'success',
  },
  pending: {
    label: t('finance.status.processing'),
    type: 'primary',
  },
  cancelled: {
    label: t('finance.status.cancelled'),
    type: 'default',
  },
  failed: {
    label: t('finance.status.failed'),
    type: 'error',
  },
}
const data = computed(()=>{
  return {
    apiUrl: '/user/financial',
    statusKey: 'type',
    status: [
      {
        label: t('finance.status.all'),
        value: '',
      },
      ...localizedFinanceTypes.value,
    ],
    search:{
      status: '',
      startTime: format(subMonths(new Date(), 1), 'yyyy-MM-dd'),
      endTime: format(new Date(), 'yyyy-MM-dd'),
    },
    searchThead: [
      {
        label: t('finance.fields.transactionTime'),
        type: 'daterange',
        startKey: 'startTime',
        endKey: 'endTime',
        maxMonths: 6,
        clearable: false,
        width: 230,
      },
      {
        label: t('finance.fields.transactionStatus'),
        prop: 'status',
        type: 'select',
        options: localizedFinanceStatusList.value,
        width: 150,
      },
    ],
    labelWidth:80,
    thead: [
      {
        label: t('finance.fields.transactionTime'),
        prop: 'transaction_time',
        width: 174,
        wapType: 'title',
      },
      {
        label: t('finance.fields.type'),
        prop: 'type',
        width: 90,
        options: localizedFinanceTypes.value,
        value: (row) => localizedFinanceTypeMaps.value[row.type] ?? row.type ?? '-',
      },
      {
        label: t('finance.fields.status'),
        prop: 'status',
        width: 90,
        formType: 'dot',
        wapType: 'status',
        options: statusOptions,
        tips: (row) => row.status === 'failed' && row.description ? row.description : '',
      },
      {
        label: t('finance.fields.amountUsd'),
        prop: 'amount',
        width: 120,
      },
      {
        label: t('finance.fields.beforeUsd'),
        prop: 'before',
        width: 120,
      },
      {
        label: t('finance.fields.afterUsd'),
        prop: 'after',
        width: 120,
      },
      {
        label: t('finance.fields.description'),
        prop: 'description',
        minWidth: 260,
      },
    ],
  }
})
</script>
