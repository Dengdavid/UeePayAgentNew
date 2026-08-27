<template>
  <UiPage ref="pageRef" :data="data" row-key="id" isNotTitle>
    <template #number="{ row }">
      <CardNumber
        :value="row.card_no"
        :bin="row.bin || row.card_bin"
        :type="row.network || ''"
        :encrypt="false"
      />
    </template>
  </UiPage>
</template>

<script setup>
import { computed, reactive, ref } from 'vue'
import { format, subMonths } from 'date-fns'
import CardNumber from '@/components/ui/card-number.vue'
import { t } from '@/utils'
import { postApi } from '@/utils/api.js'
import { message } from '@/utils/message.js'
import { toRoute } from '@/utils/route.js'
import { isPhone } from '@/utils/device.js'
import { copyCard, statusKeyMap, statusOptions, transactionStatusValues, transactionTypeValues } from '@/utils/card.js'
defineProps({
  active: {
    type: String,
    default: '',
  },
})

const pageRef = ref(null)
const exportLoading = ref(false)
const getTransactionTypeLabel = (value) => t(`card.index.bills.typeMap.${value}`)
const getStatusOptions = () => Object.fromEntries(
  Object.entries(statusOptions).map(([value, option]) => [
    value,
    {
      ...option,
      label: statusKeyMap[value]
        ? t(`card.index.bills.status.${statusKeyMap[value]}`)
        : option.label,
    },
  ])
)
const search = reactive({
  type: '',
  status: '',
  startTime: format(subMonths(new Date(), 1), 'yyyy-MM-dd'),
  endTime: format(new Date(), 'yyyy-MM-dd'),
  cardNo: '',
})

const handleExport = () => {
  if (exportLoading.value) return
  exportLoading.value = true
  postApi('/vcc/transactionExport', { ...search })
    .then(() => message(t('card.index.bills.exportCreated')))
    .catch((err) => message(err?.msg || t('card.index.bills.exportFailed'), 'error'))
    .finally(() => {
      exportLoading.value = false
    })
}

const data = computed(() => ({
  apiUrl: '/vcc/transaction',
  statusKey: 'type',
  status: [
    { label: t('card.index.common.all'), value: '' },
    ...transactionTypeValues.map((value) => ({
      value,
      label: getTransactionTypeLabel(value),
    })),
  ],
  search,
  searchThead: [
    {
      label: t('card.index.bills.transactionTime'),
      type: 'daterange',
      startKey: 'startTime',
      endKey: 'endTime',
      maxMonths: 3,
      clearable: false,
      width: 230,
    },
    {
      label: t('card.index.bills.transactionStatus'),
      prop: 'status',
      type: 'select',
      options: transactionStatusValues.map((value) => ({
        value,
        label: getStatusOptions()[value].label,
      })),
      width: 160,
    },
    {
      label: t('card.index.common.cardNumber'),
      prop: 'cardNo',
      type: 'input',
      width: 240,
    },
  ],
  btns: [
    {
      label: t('card.index.openCardQuickly'),
      icon: 'md-add',
      hidden:()=>isPhone.value,
      click: () => toRoute('cardAdd'),
    },
    {
      label: t('card.index.bills.export'),
      icon: 'md-download',
      loading: exportLoading.value,
      click: handleExport,
    },
  ],
  labelWidth: 80,
  thead: [
    { label: t('card.index.bills.transactionTime'), prop: 'transaction_time', width: 180 },
    { label: t('card.index.common.cardNumber'), prop: 'number', type: 'slot', width: 210 , wapType: 'title'},
    {
      label: t('card.index.bills.type'),
      prop: 'type',
      options: transactionTypeValues.map((value) => ({
        value,
        label: getTransactionTypeLabel(value),
      })),
      value: (row) => transactionTypeValues.includes(row.type)
        ? getTransactionTypeLabel(row.type)
        : row.type ?? '-',
    },
    {
      label: t('card.index.common.amount'),
      prop: 'amount',
      width: 150,
      value: (row) => `${row.amount ?? '-'} ${row.currency ?? ''}`.trim(),
    },
    { label: t('card.index.common.fee'), prop: 'fee', width: 120 },
    {
      label: t('card.index.common.status'),
      prop: 'status',
      width: 100,
      formType: 'dot',
      wapType: 'status',
      options: getStatusOptions(),
      tips: (row) => row.status === 'Fail' ? row.remark : '',
    },
    { label: t('card.index.common.detail'), prop: 'detail', minWidth: 180 },
  ],
  actions: [
    {
      label: t('card.index.bills.copy'),
      click: (row) => copyCard(row),
    },
  ],
}))
</script>
