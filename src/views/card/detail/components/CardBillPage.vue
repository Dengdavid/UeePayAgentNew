<template>
  <UiPage ref="pageRef" :data="pageData" row-key="id" isNotTitle :title="t('card.detail.billsTitle')" :padding="isPhone ? 16 : 0">
      <template #number="{ row }">
          <CardNumber
              :value="maskCardNumber(row.card_no)"
              :bin="row.bin || row.card_bin"
              :type="row.network || ''"
              :encrypt="false"
          />
      </template>
  </UiPage>
</template>

<script setup>
import CardNumber from '@/components/ui/card-number.vue'
import { cardApi } from '@/api'
import { formatDate } from '@/libs/tools.js'
import { copyCard, maskCardNumber, statusKeyMap, statusOptions, transactionStatusValues, transactionTypeValues } from '@/utils/card.js'
import { postApi } from '@/utils/api.js'
import { message } from '@/utils/message.js'
import { t } from '@/utils'
import { computed, ref, watch } from 'vue'
import { subMonths } from 'date-fns'
import { isPhone } from '@/utils/device.js'
const props = defineProps({
    cardId: {
        type: [String, Number],
        required: true
    }
})
const emit = defineEmits(['reload'])

const endDate = new Date()
const startDate = subMonths(endDate, 1)
const searchForm = ref({
    cardId: props.cardId,
    type: '',
    status: '',
    times: [startDate, endDate],
    startTime: formatDate(startDate),
    endTime: formatDate(endDate)
})
const exportLoading = ref(false)
const syncLoading = ref(false)
const pageRef = ref(null)

const getTransactionTypeLabel = (value) => t(`card.index.bills.typeMap.${value}`)
const getStatusOptions = () => Object.fromEntries(
    Object.entries(statusOptions).map(([value, option]) => [
        value,
        {
            ...option,
            label: statusKeyMap[value]
                ? t(`card.index.bills.status.${statusKeyMap[value]}`)
                : option.label
        }
    ])
)

const handleExport = async () => {
    if (exportLoading.value) return
    exportLoading.value = true
    try {
        await postApi('/vcc/transactionExport', {
            cardId: props.cardId,
            startTime: searchForm.value.startTime,
            endTime: searchForm.value.endTime,
            type: searchForm.value.type,
            status: searchForm.value.status
        })
        message(t('card.index.bills.exportCreated'))
    } catch (error) {
        message(error?.msg || t('card.index.bills.exportFailed'), 'error')
    } finally {
        exportLoading.value = false
    }
}
const handleSyncCard = async () => {
    if (!props.cardId || syncLoading.value) return
    syncLoading.value = true
    try {
        await cardApi.vccCardSync({ cardId: props.cardId })
        message(t('card.index.bills.syncSubmitted'))
        reset()
        emit('reload')
    } catch (error) {
        message(error?.msg || t('card.index.bills.syncFailed'), 'error')
    } finally {
        syncLoading.value = false
    }
}

const pageData = computed(() => ({
    apiUrl: '/vcc/transaction',
    statusKey: 'type',
    status: [
        { label: t('card.index.common.all'), value: '' },
        ...transactionTypeValues.map((value) => ({
            value,
            label: getTransactionTypeLabel(value)
        }))
    ],
    search: searchForm.value,
    searchThead: [
        { label: t('card.index.bills.transactionTime'), type: 'daterange', startKey: 'startTime', endKey: 'endTime', maxMonths: 3, clearable: false, width: 230 },
        {
            label: t('card.index.bills.transactionStatus'),
            prop: 'status',
            type: 'select',
            options: transactionStatusValues.map((value) => ({
                value,
                label: getStatusOptions()[value].label
            })),
            width: 150
        }
    ],
    btns: [
        { label: t('card.index.bills.export'), icon: 'md-download', loading: exportLoading.value, click: handleExport },
        { label: t('card.index.bills.sync'), icon: 'md-cloud-download', loading: syncLoading.value, click: handleSyncCard }
    ],
    labelWidth: 76,
    thead: [
        {
          label: t('card.index.bills.transactionTime'),
          prop: 'transaction_time',
          width: 180,
        },
        {
          label: t('card.index.common.cardNumber'),
          prop: 'number',
          width: 210,
          type: 'slot',
          wapType: 'title'
        },
        {
          label: t('card.index.bills.type'),
          prop: 'type',
          width: 120,
          value: (row) => transactionTypeValues.includes(row.type)
              ? getTransactionTypeLabel(row.type)
              : row.type ?? '-'
        },
        {
          label: t('card.index.common.amount'),
          prop: 'amount',
          width: 150,
          value: (row) => `${row.amount ?? '-'} ${row.currency ?? ''}`.trim()
        },
        { label: t('card.index.common.fee'), prop: 'fee', width: 120 },
        {
          label: t('card.index.common.status'),
          prop: 'status',
          width: 100,
          formType: 'dot',
          wapType: 'status',
          options: getStatusOptions(),
          tips: (row) => row.status === 'Fail' ? row.remark : ''
        },
        { label: t('card.index.common.detail'), prop: 'detail', minWidth: 180 }
    ],
    actions: [
        { label: t('card.index.bills.copy'), icon: 'ios-copy-outline', click: (row) => copyCard(row) }
    ]
}))

const reset = () => pageRef.value?.reset?.()
const search = () => pageRef.value?.search?.()

defineExpose({ reset, search })

watch(() => props.cardId, (cardId) => {
    searchForm.value.cardId = cardId
    pageRef.value?.reset?.()
})
</script>
