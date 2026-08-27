<template>
  <UiPage ref="pageRef" :data="data" row-key="id" isNotTitle>
    <template #number="{ row }">
      <CardNumber
        :value="row.show ? row.card_no : row.masked_card_no"
        :bin="row.bin || row.card_bin"
        :type="row.bin?.network || row.card_bin?.network"
        :visible="row.show"
        :loading="row.loading"
        controlled
        @on-change="handleChangeVisible(row)"
      />
    </template>
    <template #term="{ row }">
      <TermTime
        :time="row.expire_date"
        :visible="row.show"
        :loading="row.loading"
        controlled
        @on-change="handleChangeVisible(row)"
      />
    </template>
    <template #code="{ row }">
      <EncryptText
        :value="row.cvv"
        :visible="row.show"
        :loading="row.loading"
        controlled
        @on-change="handleChangeVisible(row)"
      />
    </template>
  </UiPage>
  <IntoModal ref="intoModal" @on-update="handleIntoUpdate" />
  <OutModal ref="outModal" @on-update="handleUpdate" />
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { cardApi } from '@/api'
import { t } from '@/utils'
import CardNumber from '@/components/ui/card-number.vue'
import EncryptText from '@/components/ui/encrypt-text.vue'
import TermTime from '@/components/ui/term-time.vue'
import { useCardStore } from '@/store/card.js'
import { confirmInput, message } from '@/utils/message.js'
import { toRoute } from '@/utils/route.js'
import { isPhone } from '@/utils/device.js'
import IntoModal from './IntoModal.vue'
import OutModal from './OutModal.vue'

defineProps({
  active: {
    type: String,
    default: '',
  },
})

const emit = defineEmits(['init'])
const cardStore = useCardStore()
const { bins } = storeToRefs(cardStore)
const pageRef = ref(null)
const intoModal = ref(null)
const outModal = ref(null)

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
  confirmInput(t('card.index.list.label'), row.label || '', { allowEmpty: true }).then(async ({ value, close }) => {
    try {
      await cardApi.vccLabel({ cardId: row.id, label: value })
      row.label = value
      message(t('card.index.list.editSuccess'))
      close()
    } catch (error) {
      message(error?.msg || t('card.index.list.editFailed'), 'error')
    }
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
  if (Number(row.account_status) !== 0) return
  intoModal.value?.open(row)
}

const handleOpenOut = (row) => {
  if (Number(row.account_status) !== 0) return
  outModal.value?.open(row)
}

const handleChangeVisible = async (row) => {
  if (row.loading) return
  if (row.show) {
    row.show = false
    return
  }
  row.loading = true
  try {
    const result = await cardApi.vccPrivate({ cardId: row.id })
    row.card_no = result.card_no
    row.expire_date = result.expire_date
    row.cvv = result.cvv
    row.show = true
  } catch (error) {
    message(error?.msg || t('card.index.list.privateInfoFailed'), 'error')
  } finally {
    row.loading = false
  }
}

const data = computed(() => ({
  apiUrl: '/vcc/index',
  statusKey: 'account_status',
  status: [
    { label: t('card.index.common.all'), value: null },
    ...statusOptions.map(({ value, label }) => ({ value, label })),
  ],
  search: {
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
      prop: 'bin',
      type: 'select',
      options: (bins.value || []).filter((item) => item?.bin !== undefined && item?.bin !== null),
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
    {
      label: t('card.index.list.cardNumberOrLabel'),
      prop: 'card_no',
      type: 'input',
      width: 240,
    },
  ],
  labelWidth: 72,
  dataProcessor: (rows) => {
    if (!Array.isArray(rows)) return []
    return rows.map((row) => ({
      ...row,
      masked_card_no: row.card_no,
      loading: false,
      show: false,
    }))
  },
  thead: [
    { label: t('card.index.common.cardNumber'), prop: 'number', type: 'slot', width: 240, wapType: 'title' },
    { label: t('card.index.list.validThru'), prop: 'term', type: 'slot', width: 120 },
    { label: t('card.index.list.securityCode'), prop: 'code', type: 'slot', width: 100 },
    { label: t('card.index.list.label'), prop: 'label', minWidth: 120, click: handleEdit },
    { label: t('card.index.list.balance'), prop: 'available', width: 120 },
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
  btns: [
    {
      label: t('card.index.openCardQuickly'),
      icon: 'md-add',
      hidden:()=>isPhone.value,
      click: () => toRoute('cardAdd'),
    },
  ],
  actions: [
    {
      label: t('card.index.list.transferIn'),
      class: 'action-primary',
      disabled: (row) => Number(row.account_status) !== 0,
      click: handleOpenInto,
    },
    {
      label: t('card.index.list.transferOut'),
      class: 'action-warning',
      disabled: (row) => Number(row.account_status) !== 0,
      click: handleOpenOut,
    },
    {
      label: t('card.index.common.detail'),
      class: 'action-default',
      click: (row) => toRoute('cardDetail', { id: row.id }, 'params'),
    },
  ],
}))
</script>
