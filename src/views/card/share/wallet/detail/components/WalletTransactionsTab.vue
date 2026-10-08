<template>
  <UiPage v-if="hasPermission('shared_wallet.view') && hasPermission('shared_wallet.transaction')" ref="pageRef" :data="pageData" row-key="id" isNotTitle :padding="isPhone ? 16 : 0">
    <template #card_no="{ row }">
      <CardNumber v-if="row.card_no" :value="maskCardNumber(row.card_no)" :bin="row.bin" :card-id="row.card_id" type="share" :encrypt="false" />
      <span v-else class="card-number-empty">-</span>
    </template>
    <template #change_amount="{ row }">
      <UiMoney class="bill-amount" :value="row.change_amount" currency="" :decimals="null" :min-decimals="2" signed tone="signed" />
    </template>
    <template #after_amount="{ row }">
      <UiMoney :value="row.after_amount" currency="" :decimals="null" :min-decimals="2" />
    </template>
  </UiPage>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { format, max, subDays, subMonths } from 'date-fns'
import CardNumber from '@/components/ui/card-number.vue'
import { hasPermission } from '@/utils/permission'
import { t } from '@/utils'
import { postApi } from '@/utils/api.js'
import { message, showRequestError } from '@/utils/message.js'
import { isPhone } from '@/utils/device.js'
import { maskCardNumber, transactionTypeValues } from '@/utils/card.js'

const props = defineProps({
  walletId: { type: String, required: true },
  refreshKey: { type: Number, default: 0 },
})
const pageRef = ref(null)
const exportLoading = ref(false)
const canExport = computed(() => hasPermission('shared_wallet.view') && hasPermission('shared_wallet.transaction') && hasPermission('shared_wallet.export'))
const handleExport = async () => {
  if (!canExport.value || exportLoading.value) return
  const searchParams = pageRef.value?.getSearchParams()
  if (!searchParams) return
  exportLoading.value = true
  try {
    await postApi('/vcc/SharedWallet/financialExport', {
      shared_wallet_id: props.walletId,
      startTime: searchParams.startTime,
      endTime: searchParams.endTime,
      type: searchParams.type,
      card_no: searchParams.card_no || '',
    })
    message(t('card.index.bills.exportCreated'))
  } catch (error) { showRequestError(error) } finally {
    exportLoading.value = false
  }
}
watch(() => props.refreshKey, () => {
  if (!hasPermission('shared_wallet.view') || !hasPermission('shared_wallet.transaction')) return
  pageRef.value?.search()?.catch(() => {})
})
const endDate = new Date()
// 与日期组件的一个自然月及 30 天上限保持一致。
const startDate = max([subMonths(endDate, 1), subDays(endDate, 30)])
const transactionTypeLabel = value => {
  const walletTypes = {
    Transfer: t('card.index.sharedManagement.transfer'),
    Collect: t('card.index.sharedManagement.collect'),
    Adjustment: t('card.index.sharedManagement.adjustment'),
    Settlement: t('finance.types.settlement'),
  }
  return walletTypes[value] ?? (transactionTypeValues.includes(value) ? t(`card.index.bills.typeMap.${value}`) : value ?? '—')
}
const pageData = computed(() => ({
  apiUrl: '/vcc/SharedWallet/financial',
  statusKey: 'type',
  status: [
    { label: t('card.index.common.all'), value: '' },
    ...['Transfer', 'Create', 'Verification', 'Consumption', 'Reversal', 'Credit', 'Penalty', 'Fee_Consumption', 'Monthly', 'Adjustment', 'Settlement', 'Collect'].map(value => ({ value, label: transactionTypeLabel(value) })),
  ],
  search: { shared_wallet_id: props.walletId, card_no: '', startTime: format(startDate, 'yyyy-MM-dd'), endTime: format(endDate, 'yyyy-MM-dd') },
  searchThead: [
    { label: t('card.index.bills.transactionTime'), type: 'daterange', startKey: 'startTime', endKey: 'endTime', maxMonths: 1, clearable: false, width: 230 },
    { label: t('card.index.common.cardNumber'), prop: 'card_no', type: 'input', width: 300 },
  ],
  btns: [
    { label: t('card.index.bills.export'), icon: 'md-download', loading: exportLoading.value, disabled: !canExport.value, tooltip: !canExport.value ? t('counts.noPermission') : '', click: handleExport },
  ],
  thead: [
    { label: t('card.index.bills.transactionTime'), prop: 'created_at', width: 180, wapType: 'title' },
    { label: t('card.index.bills.type'), prop: 'type', width: 110, value: row => transactionTypeLabel(row.type) },
    { label: t('card.index.common.cardNumber'), prop: 'card_no', type: 'slot', width: 210 },
    { label: t('card.index.common.amount'), prop: 'change_amount', unit: '$', type: 'slot', width: 170 },
    { label: t('card.index.sharedManagement.balanceAfter'), prop: 'after_amount', unit: '$', type: 'slot', width: 180 },
    { label: t('card.index.common.detail'), prop: 'description', minWidth: 240, value: row => row.description || '—' },
  ],
}))
</script>

<style lang="less" scoped>
.card-number-empty {
  color: var(--ui-color-text-muted);
}
.bill-amount {
  font-variant-numeric: tabular-nums;
  font-weight: var(--ui-font-weight-semibold);
}
</style>
