<template>
  <UiPage :data="data" isNotTitle row-key="id">
    <template #card_no="{ row }">
      <CardNumber
        :value="row.card_no"
        :bin="row.bin || row.card_bin"
        :type="row.network || ''"
        :encrypt="false"
      />
    </template>
    <template #bin_name="{ row }">
      {{ row.bin?.name || '-' }}
    </template>
  </UiPage>
</template>

<script setup>
import { computed, reactive } from 'vue'
import { storeToRefs } from 'pinia'
import CardNumber from '@/components/ui/card-number.vue'
import { useCardStore } from '@/store/card.js'
import { t } from '@/utils'

const cardStore = useCardStore()
const { bins } = storeToRefs(cardStore)

const statusOptions = computed(() => [
  { value: '-1', label: t('card.index.list.status.locked'), type: 'default' },
  { value: '0', label: t('card.index.list.status.active'), type: 'success' },
  { value: '1', label: t('card.index.list.status.freezing'), type: 'error' },
  { value: '2', label: t('card.index.list.status.closed'), type: 'error' },
  { value: '3', label: t('card.index.list.status.closing'), type: 'warning' },
  { value: '4', label: t('card.index.list.status.blocked'), type: 'error' },
])

const statusOptionMap = computed(() => Object.fromEntries(
  statusOptions.value.map(({ value, ...option }) => [value, option])
))

const search = reactive({
  nickname: '',
  card_no: '',
  bin: '',
  startTime: '',
  endTime: '',
})

const data = computed(() => ({
  apiUrl: '/user/AgentSite/cards',
  statusKey: 'status',
  status: [
    { label: t('card.index.common.all'), value: null },
    ...statusOptions.value.map(({ value, label }) => ({ value, label })),
  ],
  search,
  searchThead: [
    {
      label: t('userManagement.username'),
      prop: 'nickname',
      type: 'input',
      width: 180,
    },
    {
      label: t('card.index.common.cardNumber'),
      prop: 'card_no',
      type: 'input',
      width: 220,
    },
    {
      label: t('card.index.common.cardBin'),
      prop: 'bin',
      type: 'select',
      options: bins.value || [],
      labelKey: 'bin',
      valueKey: 'bin',
      width: 180,
    },
    {
      label: t('card.index.common.openingTime'),
      type: 'daterange',
      startKey: 'startTime',
      endKey: 'endTime',
      width: 230,
    },
  ],
  labelWidth: 72,
  thead: [
    {
      label: t('userManagement.username'),
      prop: 'nickname',
      width: 220,
      wapType: 'title',
    },
    {
      label: t('card.index.common.cardNumber'),
      prop: 'card_no',
      type: 'slot',
      width: 210,
    },
    {
      label: t('card.index.common.cardBin'),
      prop: 'bin_name',
      type: 'slot',
      width: 150,
    },
    {
      label: t('card.index.list.balance'),
      prop: 'available',
      width: 150,
      unit:"$"
    },
    {
      label: t('card.index.common.openingTime'),
      prop: 'create_time',
      width: 180,
      align: 'center',
    },
    {
      label: t('card.index.common.status'),
      prop: 'status',
      width: 120,
      formType: 'dot',
      wapType: 'status',
      options: statusOptionMap.value,
    },
    {
      label: t('card.index.list.label'),
      prop: 'label',
      minWidth: 220,
    },
  ],
}))
</script>
