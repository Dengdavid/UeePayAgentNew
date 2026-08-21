<template>
  <UiPage ref="pageRef" :data="data" row-key="id" isNotTitle>
    <template #number="{ row }">
      <CardNumber :value="row.bin" :bin="row.bin" :type="row?.card_bin?.network" :encrypt="false" />
    </template>
  </UiPage>
</template>

<script setup>
import { computed, ref } from 'vue'
import CardNumber from '@/components/ui/card-number.vue'
import { cardApi } from '@/api'
import { confirm, message, t } from '@/utils'
import { toRoute } from '@/utils/route.js'
import { isPhone } from '@/utils/device.js'

defineProps({
  active: {
    type: String,
    default: '',
  },
})

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

const runAction = async (request, successText, fallbackError) => {
  if (submitting.value) return
  submitting.value = true
  try {
    const result = await request()
    message(successText)
    reload()
  } catch (error) {
    message(error?.msg || fallbackError, 'error')
  } finally {
    submitting.value = false
  }
}

const handleCancel = (row) => {
  if (submitting.value) return
  confirm(t('card.index.records.cancelConfirm'), {
    title: t('card.index.records.cancelTitle'),
    okText: t('card.index.records.confirmCancel'),
    cancelText: t('card.index.records.reconsider'),
  }).then(() => runAction(
    () => cardApi.vccTradeCancel({ id: row.id }),
    t('card.index.records.cancelSuccess'),
    t('card.index.records.cancelFailed')
  ))
}

const data = computed(() => ({
  apiUrl: '/vcc/trade',
  status: [
    { label: t('card.index.common.all'), value: '' },
    ...statusOptions.map(({ value, label }) => ({ value, label })),
  ],
  search: {
    type: 'Create',
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
  ],
  labelWidth: 76,
  thead: [
    { label: t('card.index.records.applicationTime'), prop: 'created_at', minWidth: 170},
    { label: t('card.index.common.cardBin'), prop: 'number', type: 'slot', minWidth: 180, wapType: 'title'  },
    { label: t('card.index.records.preload'), prop: 'amount', width: 120 },
    { label: t('card.index.records.cardFee'), prop: 'open', width: 120 },
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
  btns: [
    {
      label: t('card.index.openCardQuickly'),
      icon: 'md-add',
      hidden:()=>isPhone,
      click: () => toRoute('cardAdd'),
    },
  ],
  actions: [
    {
      label: t('card.index.records.openAgain'),
      show: (row) => [-2, -1].includes(Number(row.status)),
      click: () => toRoute('cardAdd'),
    },
    {
      label: t('card.index.records.urgeReview'),
      show: (row) => Number(row.status) === 1,
      disabled: () => submitting.value,
      click: (row) => runAction(
        () => cardApi.vccTradeUrge({ id: row.id }),
        t('card.index.records.urgeSuccess'),
        t('card.index.records.urgeFailed')
      ),
    },
    {
      label: t('card.index.records.cancelOpening'),
      class: 'action-warning',
      show: (row) => Number(row.status) === 2,
      disabled: () => submitting.value,
      click: handleCancel,
    },
    {
      label: t('card.index.records.updateProgress'),
      show: (row) => Number(row.status) === 3,
      disabled: () => submitting.value,
      click: (row) => runAction(
        () => cardApi.vccTradeSync({ id: row.id }),
        t('card.index.records.syncSuccess'),
        t('card.index.records.syncFailed')
      ),
    },
    {
      label: t('card.index.records.viewCard'),
      class: 'action-default',
      show: (row) => Number(row.status) === 9,
      click: (row) => toRoute('cardDetail', { id: row.card_id }, 'params'),
    },
  ],
}))
</script>
