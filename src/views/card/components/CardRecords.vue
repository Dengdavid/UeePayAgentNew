<template>
  <UiPage v-if="hasCardPermission('trade.view', props.shared)" ref="pageRef" :data="data" :return-state="returnState" row-key="id" isNotTitle>
    <template #sharedWallet="{ row }">
      <span v-if="!hasPermission('shared_wallet.view')">{{ row.sharedWallet?.name || '--' }}</span>
      <Button v-else type="text" :disabled="!row.shared_wallet_id" @click="row.shared_wallet_id && hasPermission('shared_wallet.view') && toRoute('cardSharedWalletDetail', { id: String(row.shared_wallet_id) }, 'params')">{{ row.sharedWallet?.name || '--' }}</Button>
    </template>
    <template #number="{ row }">
      <CardNumber :value="row.bin" :bin="row.bin" :card-id="row.card_id" :type="props.shared ? 'share' : 'prepaid'" :network="row?.card_bin?.network" :encrypt="false" />
    </template>
  </UiPage>
</template>

<script setup>
import { showRequestError } from '@/utils/message.js'
import { computed, ref } from 'vue'
import CardNumber from '@/components/ui/card-number.vue'
import { hasCardPermission, hasPermission } from '@/utils/permission'
import { confirm, message, t } from '@/utils'
import { toRoute } from '@/utils/route.js'
import { isPhone } from '@/utils/device.js'

const props = defineProps({
  returnState: Object,
  tabBtns: { type: Array, default: () => [] },
  apiUrl: { type: String, required: true },
  shared: { type: Boolean, default: false },
  cancelRequest: { type: Function, required: true },
  urgeRequest: { type: Function, required: true },
  syncRequest: { type: Function },
  showPreload: { type: Boolean, default: true },
  searchParams: { type: Object, default: () => ({}) },
  active: {
    type: String,
    default: '',
  },
})

const permissionPrefix = computed(() => props.shared ? 'shared_card' : 'card')
const pageRef = ref(null)
const submitting = ref(false)

const statusOptions = [
  { value: '1', label: t('card.index.records.status.pendingReview'), type: 'primary' },
  { value: '2', label: t('card.index.records.status.pendingProduction'), type: 'primary' },
  { value: '3', label: t('card.index.records.status.producing'), type: 'primary' },
  { value: '-1', label: t('card.index.records.status.cancelled'), type: 'default' },
  { value: '-2', label: t('card.index.records.status.failed'), type: 'error' },
  { value: '9', label: t('card.index.records.status.completed'), type: 'success' },
]
const statusOptionMap = Object.fromEntries(
  statusOptions.map(({ value, ...option }) => [value, option])
)

const reload = () => pageRef.value?.reset()

const runAction = async (permission, request, successText) => {
  if (!hasCardPermission('trade.view', props.shared) || !hasCardPermission(permission, props.shared) || submitting.value) return
  submitting.value = true
  try {
    const result = await request()
    message(successText)
    reload()
  } catch (error) { showRequestError(error) } finally {
    submitting.value = false
  }
}

const handleCancel = (row) => {
  if (!hasCardPermission('trade.cancel', props.shared) || submitting.value) return
  confirm(t('card.index.records.cancelConfirm'), {
    title: t('card.index.records.cancelTitle'),
    okText: t('card.index.records.confirmCancel'),
    cancelText: t('card.index.records.reconsider'),
  }).then(() => runAction(
    'trade.cancel',
    () => props.cancelRequest({ id: row.id }),
    t('card.index.records.cancelSuccess')
  ))
}

const data = computed(() => ({
  apiUrl: props.apiUrl,
  status: [
    { label: t('card.index.common.all'), value: '' },
    ...statusOptions.map(({ value, label }) => ({ value, label })),
  ],
  search: {
    type: 'Create',
    ...(props.shared ? { shared_wallet_id: '' } : {}),
    ...props.searchParams,
    startTime: '',
    endTime: '',
  },
  searchThead: [
    {
      label: t('card.index.common.openingTime'),
      type: 'daterange',
      startKey: 'startTime',
      endKey: 'endTime',
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
  ],
  labelWidth: 76,
  thead: [
    { label: t('card.index.records.applicationTime'), prop: 'created_at', minWidth: 170},
    { label: t('card.index.common.cardBin'), prop: 'number', type: 'slot', minWidth: 180, wapType: 'title'  },
    ...(props.shared ? [{ label: t('card.index.sharedManagement.title'), prop: 'sharedWallet', type: 'slot', minWidth: 160 }] : []),
    ...(props.showPreload ? [{ label: t('card.index.records.preload'), prop: 'amount', width: 120 }] : []),
    { label: `${t('card.index.records.cardFee')} ($)`, prop: 'open', width: 120 },
    {
      label: t('card.index.common.status'),
      prop: 'status',
      width: 120,
      formType: 'dot',
      wapType: 'status',
      options: statusOptionMap,
      tips: (row) => Number(row.status) === -2 ? row.remark : '',
    },
    { label: t('card.index.records.completedTime'), prop: 'updated_at', minWidth: 170 },
  ],
  btns: isPhone.value ? [...props.tabBtns] : [],
  actions: [
    {
      label: t('card.index.records.openAgain'), permission: `${permissionPrefix.value}.create`,
      show: (row) => [-2, -1].includes(Number(row.status)),
      click: () => hasCardPermission('create', props.shared) && toRoute(props.shared ? 'sharedCardAdd' : 'cardAdd'),
    },
    {
      label: t('card.index.records.urgeReview'), permission: `${permissionPrefix.value}.trade.urge`,
      show: (row) => Number(row.status) === 1,
      disabled: () => submitting.value,
      click: (row) => runAction(
        'trade.urge',
        () => props.urgeRequest({ id: row.id }),
        t('card.index.records.urgeSuccess')
      ),
    },
    {
      label: t('card.index.records.cancelOpening'), permission: `${permissionPrefix.value}.trade.cancel`,
      class: 'action-warning',
      show: (row) => Number(row.status) === 2,
      disabled: () => submitting.value,
      click: handleCancel,
    },
    {
      label: t('card.index.records.updateProgress'), permission: `${permissionPrefix.value}.trade.sync`,
      show: (row) => Number(row.status) === 3,
      disabled: () => !props.syncRequest || submitting.value,
      click: props.syncRequest ? (row) => runAction(
        'trade.sync',
        () => props.syncRequest({ id: row.id }),
        t('card.index.records.syncSuccess')
      ) : undefined,
    },
    {
      label: t('card.index.records.viewCard'), permission: `${permissionPrefix.value}.view`,
      class: 'action-default',
      show: (row) => Number(row.status) === 9,
      click: (row) => hasCardPermission('view', props.shared) && toRoute(props.shared ? 'sharedCardDetail' : 'cardDetail', { id: row.card_id }, 'params'),
    },
  ],
}))
</script>
