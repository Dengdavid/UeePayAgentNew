<template>
  <UiPage v-if="canView" ref="pageRef" :data="data" :return-state="returnState" row-key="id" isNotTitle :padding="padding">
    <template #label="{ row }">
      <ColumnsItemType :data="data.thead.find(column => column.prop === 'label')" :row="row" :title="row.label || undefined" />
    </template>
    <template #sharedWallet="{ row }">
      <span v-if="!hasPermission('shared_wallet.view')">{{ row.sharedWallet?.name || '--' }}</span>
      <Button v-else type="text" :disabled="!row.shared_wallet_id" @click="row.shared_wallet_id && hasPermission('shared_wallet.view') && toRoute('cardSharedWalletDetail', { id: String(row.shared_wallet_id) }, 'params')">{{ row.sharedWallet?.name || '--' }}</Button>
    </template>
    <template #number="{ row }">
      <CardNumber
        :value="canViewPrivate && row.show ? row.card_no : row.masked_card_no"
        :bin="row.bin || row.card_bin"
        :card-id="row.id"
        :type="props.shared ? 'share' : 'prepaid'"
        :network="row.bin?.network || row.card_bin?.network || row.network || ''"
        :visible="canViewPrivate && row.show"
        :loading="row.loading"
        :encrypt="canViewPrivate"
        controlled
        @on-change="handleChangeVisible(row)"
      />
    </template>
    <template #term="{ row }">
      <span v-if="!canViewPrivate">**/**</span>
      <TermTime v-else
        :time="row.expire_date"
        :visible="canViewPrivate && row.show"
        :loading="row.loading"
        controlled
        @on-change="handleChangeVisible(row)"
      />
    </template>
    <template #code="{ row }">
      <span v-if="!canViewPrivate">***</span>
      <EncryptText v-else
        :value="row.cvv || '***'"
        :visible="canViewPrivate && row.show"
        :loading="row.loading"
        controlled
        @on-change="handleChangeVisible(row)"
      />
    </template>
  </UiPage>
  <IntoModal v-if="hasCardPermission('recharge', props.shared)" ref="intoModal" @on-update="handleIntoUpdate" />
  <OutModal v-if="hasCardPermission('withdraw', props.shared)" ref="outModal" @on-update="handleUpdate" />
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { hasCardPermission, hasPermission } from '@/utils/permission'
import { maskCardNumber } from '@/utils/card.js'
import { t } from '@/utils'
import CardNumber from '@/components/ui/card-number.vue'
import EncryptText from '@/components/ui/encrypt-text.vue'
import TermTime from '@/components/ui/term-time.vue'
import ColumnsItemType from '@/components/uiForm/UiTable/ColumnsItemType.vue'
import { useCardStore } from '@/store/card.js'
import { confirmInput, message, showRequestError } from '@/utils/message.js'
import { toRoute } from '@/utils/route.js'
import { isPhone } from '@/utils/device.js'
import IntoModal from '../prepaid/components/IntoModal.vue'
import OutModal from '../prepaid/components/OutModal.vue'

const props = defineProps({
  returnState: Object,
  tabBtns: { type: Array, default: () => [] },
  apiUrl: { type: String, required: true },
  shared: { type: Boolean, default: false },
  privateRequest: { type: Function, required: true },
  labelRequest: { type: Function, required: true },
  searchParams: { type: Object },
  statusKey: { type: String, default: 'account_status' },
  binKey: { type: String, default: 'bin' },
  binOptions: { type: Array },
  viewAllowed: { type: Boolean, default: undefined },
  showCreate: { type: Boolean, default: true },
  showSharedWallet: { type: Boolean, default: true },
  detailPermission: { type: String },
  padding: { type: [Number, String] },
  active: {
    type: String,
    default: '',
  },
})

const emit = defineEmits(['init'])
const cardStore = useCardStore()
const { bins } = storeToRefs(cardStore)
const permissionPrefix = computed(() => props.shared ? 'shared_card' : 'card')
const pageRef = ref(null)
const intoModal = ref(null)
const outModal = ref(null)

const canView = computed(() => props.viewAllowed ?? hasCardPermission('view', props.shared))
const canViewPrivate = computed(() => canView.value && hasCardPermission('private', props.shared))
const privateRows = new Map()
const clearPrivateRow = row => {
  row.show = false
  row.loading = false
  row.card_no = row.masked_card_no
  row.expire_date = ''
  row.cvv = ''
  privateRows.delete(row)
}
const clearPrivateRows = () => {
  for (const row of privateRows.keys()) clearPrivateRow(row)
}
watch(canViewPrivate, allowed => {
  if (!allowed) clearPrivateRows()
}, { flush: 'sync' })
watch(() => props.searchParams, clearPrivateRows, { deep: true, flush: 'sync' })
onBeforeUnmount(clearPrivateRows)

const statusOptions = [
  { value: '0', label: t('card.index.list.status.active'), type: 'success' },
  { value: '1', label: t('card.index.list.status.freezing'), type: 'error' },
  { value: '-1', label: t('card.index.list.status.locked'), type: 'default' },
  { value: '4', label: t('card.index.list.status.blocked'), type: 'error' },
  { value: '3', label: t('card.index.list.status.closing'), type: 'warning' },
  { value: '2', label: t('card.index.list.status.closed'), type: 'error' },
]
const statusOptionMap = Object.fromEntries(
  statusOptions.map(({ value, ...option }) => [value, option])
)

const reload = () => pageRef.value?.reset()

const handleEdit = (row) => {
  if (!row.id || !canView.value || !hasCardPermission('update', props.shared)) return
  confirmInput(t('card.index.list.label'), row.label || '', { allowEmpty: true }).then(async ({ value, close }) => {
    try {
      if (!row.id || !canView.value || !hasCardPermission('update', props.shared)) return
      await props.labelRequest({ cardId: row.id, label: value })
      row.label = value
      message(t('card.index.list.editSuccess'))
      close()
    } catch (error) { showRequestError(error) }
  })
}

const handleUpdate = async () => {
  await nextTick()
  reload()
  emit('init')
}
let intoRefreshTimer = null
const handleIntoUpdate = () => {
  window.clearTimeout(intoRefreshTimer)
  intoRefreshTimer = window.setTimeout(handleUpdate, 500)
}

onBeforeUnmount(() => {
  window.clearTimeout(intoRefreshTimer)
})

const handleOpenInto = (row) => {
  if (!hasCardPermission('recharge', props.shared) || Number(row.account_status) !== 0) return
  intoModal.value?.open(row)
}

const handleOpenOut = (row) => {
  if (!hasCardPermission('withdraw', props.shared) || Number(row.account_status) !== 0) return
  outModal.value?.open(row)
}

const handleChangeVisible = async (row) => {
  if (!canViewPrivate.value || !row.id || row.loading) return
  if (row.show) {
    clearPrivateRow(row)
    return
  }
  clearPrivateRow(row)
  const requestId = Symbol()
  privateRows.set(row, requestId)
  row.loading = true
  try {
    const result = await props.privateRequest({ cardId: row.id })
    if (!canViewPrivate.value || privateRows.get(row) !== requestId) return
    row.card_no = result.card_no
    row.expire_date = result.expire_date
    row.cvv = result.cvv
    row.show = true
  } catch (error) {
    if (privateRows.get(row) !== requestId) return
    clearPrivateRow(row)
    showRequestError(error)
  } finally {
    if (privateRows.get(row) === requestId) row.loading = false
  }
}

const data = computed(() => ({
  apiUrl: props.apiUrl,
  statusKey: props.statusKey,
  status: [
    { label: t('card.index.common.all'), value: null },
    ...statusOptions.map(({ value, label }) => ({ value, label })),
  ],
  search: props.searchParams || {
    ...(props.shared && props.showSharedWallet ? { shared_wallet_id: '' } : {}),
    bin: '',
    account_status:null,
    status:null,
    startTime: '',
    endTime: '',
    card_no: '',
  },
  searchThead: [
    {
      label: t('card.index.list.allCardBins'),
      prop: props.binKey,
      type: 'select',
      transfer: true,
      options: (props.binOptions || bins.value || []).filter((item) => item?.bin !== undefined && item?.bin !== null),
      labelKey: 'name',
      valueKey: 'bin',
      width: 200,
    },
    {
      label: t('card.index.common.openingTime'),
      type: 'daterange',
      startKey: 'startTime',
      endKey: 'endTime',
      width: 230,
    },
    ...(props.shared && props.showSharedWallet ? [{
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
      label: t('card.index.list.cardNumberOrLabel'),
      prop: 'card_no',
      type: 'input',
      width: 240,
    },
  ],
  labelWidth: 72,
  dataProcessor: (rows) => {
    clearPrivateRows()
    if (!Array.isArray(rows)) return []
    return rows.map((row) => ({
      ...row,
      masked_card_no: maskCardNumber(row.masked_card_no || row.card_no),
      card_no: maskCardNumber(row.masked_card_no || row.card_no),
      expire_date: '',
      cvv: '',
      loading: false,
      show: false,
    }))
  },
  thead: [
    { label: t('card.index.common.cardNumber'), prop: 'number', type: 'slot', width: 240, wapType: 'title' },
    { label: t('card.index.list.validThru'), prop: 'term', type: 'slot', width: 120 },
    { label: t('card.index.list.securityCode'), prop: 'code', type: 'slot', width: 100 },
    { label: t('card.index.list.label'), prop: 'label', type: 'slot', minWidth: 120, click: hasCardPermission('update', props.shared) ? handleEdit : undefined },
    ...(props.shared && props.showSharedWallet ? [{ label: t('card.index.sharedManagement.title'), prop: 'sharedWallet', type: 'slot', minWidth: 160 }] : []),
    ...(!props.shared ? [{ label: t('card.index.list.balance'), prop: 'available', unit: '$', width: 120 }] : []),
    {
      label: t('card.index.common.status'),
      prop: 'account_status',
      width: 90,
      formType: 'dot',
      wapType: 'status',
      options: statusOptionMap,
    },
    { label: t('card.index.common.openingTime'), prop: 'create_time', width: 174 },
  ],
  btns: props.showCreate && isPhone.value ? [...props.tabBtns] : [],
  actions: [
    ...(!props.shared ? [
      {
        label: t('card.index.list.transferIn'),
        permission: `${permissionPrefix.value}.recharge`,
        class: 'action-primary',
        disabled: (row) => Number(row.account_status) !== 0,
        click: handleOpenInto,
      },
      {
        label: t('card.index.list.transferOut'),
        permission: `${permissionPrefix.value}.withdraw`,
        class: 'action-warning',
        disabled: (row) => Number(row.account_status) !== 0,
        click: handleOpenOut,
      },
    ] : []),
    {
      label: t('card.index.common.detail'),
      permission: props.detailPermission,
      class: 'action-default',
      disabled: row => !row.id,
      click: (row) => row.id && canView.value && hasCardPermission('view', props.shared) && toRoute(props.shared ? 'sharedCardDetail' : 'cardDetail', { id: row.id }, 'params'),
    },
  ],
}))
</script>
