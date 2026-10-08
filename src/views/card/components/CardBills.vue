<template>
  <UiPage v-if="hasCardPermission('transaction', props.shared)" ref="pageRef" :data="data" :return-state="returnState" row-key="id" isNotTitle>
    <template #shared_wallet_name="{ row }">
      <span v-if="!hasPermission('shared_wallet.view')">{{ row.shared_wallet_name || '--' }}</span>
      <Button v-else type="text" :disabled="!row.shared_wallet_id" @click="row.shared_wallet_id && hasPermission('shared_wallet.view') && toRoute('cardSharedWalletDetail', { id: String(row.shared_wallet_id) }, 'params')">{{ row.shared_wallet_name || '--' }}</Button>
    </template>
    <template #number="{ row }">
      <CardNumber
        :value="maskCardNumber(row.card_no)"
        :bin="row.bin || row.card_bin"
        :card-id="row.card_id"
        :type="props.shared ? 'share' : 'prepaid'"
        :network="row.network || ''"
        :encrypt="false"
      />
    </template>
  </UiPage>
</template>

<script setup>
import { computed, reactive, ref } from 'vue'
import { format, subMonths } from 'date-fns'
import CardNumber from '@/components/ui/card-number.vue'
import { hasCardPermission, hasPermission } from '@/utils/permission'
import { t } from '@/utils'
import { toRoute } from '@/utils/route.js'
import { postApi } from '@/utils/api.js'
import { message, showRequestError } from '@/utils/message.js'
import { isPhone } from '@/utils/device.js'
import { copyCard, maskCardNumber, statusKeyMap, statusOptions, transactionStatusValues, transactionTypeValues } from '@/utils/card.js'
const props = defineProps({
  returnState: Object,
  tabBtns: { type: Array, default: () => [] },
  apiUrl: { type: String, required: true },
  shared: { type: Boolean, default: false },
  exportApiUrl: { type: String, required: true },
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
  ...(props.shared ? { shared_wallet_id: '' } : {}),
  type: '',
  status: '',
  startTime: format(subMonths(new Date(), 1), 'yyyy-MM-dd'),
  endTime: format(new Date(), 'yyyy-MM-dd'),
  cardNo: '',
})

const handleExport = () => {
  if (!hasCardPermission('export', props.shared) || !hasCardPermission('transaction', props.shared) || exportLoading.value) return
  exportLoading.value = true
  postApi(props.exportApiUrl, pageRef.value.getSearchParams())
    .then(() => message(t('card.index.bills.exportCreated')))
    .catch(showRequestError)
    .finally(() => {
      exportLoading.value = false
    })
}

const data = computed(() => ({
  apiUrl: props.apiUrl,
  statusKey: 'type',
  status: [
    { label: t('card.index.common.all'), value: '' },
    ...transactionTypeValues.filter((value) => !props.shared || !['TransferIn', 'TransferOut'].includes(value)).map((value) => ({
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
    ...(props.shared ? [{
      label: t('card.index.sharedManagement.title'),
      prop: 'shared_wallet_id',
      type: 'remote-select',
      apiUrl: '/vcc/SharedWallet/dataList',
      labelKey: 'name',
      valueKey: 'id',
      multiple: false,
      width: 200,
    }] : []),
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
    ...(isPhone.value ? props.tabBtns : []),
    ...(!props.shared || hasCardPermission('export', props.shared) ? [{
      label: t('card.index.bills.export'), permission: props.shared ? undefined : 'card.export',
      icon: 'md-download',
      loading: exportLoading.value,
      click: handleExport,
    }] : []),
  ],
  labelWidth: 80,
  thead: [
    { label: t('card.index.bills.transactionTime'), prop: 'transaction_time', width: 180 },
    { label: t('card.index.common.cardNumber'), prop: 'number', type: 'slot', width: 210 , wapType: 'title'},
    ...(props.shared ? [{ label: t('card.index.sharedManagement.title'), prop: 'shared_wallet_name', type: 'slot', minWidth: 160 }] : []),
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
      label: `${t('card.index.common.amount')} ($)`,
      prop: 'amount',
      width: 150,
      value: (row) => row.amount ?? '-',
    },
    { label: `${t('card.index.common.fee')} ($)`, prop: 'fee', width: 120 },
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
