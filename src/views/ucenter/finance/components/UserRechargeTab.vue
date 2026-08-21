<template>
  <UiPage ref="pageRef" :data="data" row-key="id" isNotTitle @init="init"></UiPage>

  <Modal
    v-model="detailModal.visible"
    :title="$t('finance.detail.title')"
    :width="680"
    footer-hide
    class-name="vertical-center-modal recharge-detail-modal"
  >
    <div v-if="detailModal.data" class="detail-content">
      <div class="detail-item">
        <span class="detail-label">{{ $t('finance.detail.rechargeTime') }}</span>
        <span class="detail-value">{{ detailModal.data.created_at }}</span>
      </div>
      <div class="detail-item">
        <span class="detail-label">{{ $t('finance.detail.rechargeStatus') }}</span>
        <span class="detail-value">
          <DotText :color="colors[detailModal.data.status]">{{ statusMap[detailModal.data.status] }}</DotText>
        </span>
      </div>
      <div class="detail-item">
        <span class="detail-label">{{ $t('finance.detail.toAddress') }}</span>
        <span class="detail-value">{{ detailModal.data.to_address }}</span>
      </div>
      <div class="detail-item">
        <span class="detail-label">{{ $t('finance.detail.fromAddress') }}</span>
        <span class="detail-value">{{ detailModal.data.from_address }}</span>
      </div>
      <div class="detail-item">
        <span class="detail-label">{{ $t('finance.detail.rechargeBlock') }}</span>
        <span class="detail-value">
          <a v-if="detailModal.data.hash_url" :href="detailModal.data.hash_url" target="_blank">{{ $t('finance.detail.viewBlock') }}</a>
          <span v-else>--</span>
        </span>
      </div>
      <div class="detail-item">
        <span class="detail-label">{{ $t('finance.detail.currency') }}</span>
        <span class="detail-value">{{ detailModal.data.currency }}</span>
      </div>
      <div class="detail-item">
        <span class="detail-label">{{ $t('finance.detail.network') }}</span>
        <span class="detail-value">{{ detailModal.data.chain }}</span>
      </div>
      <div class="detail-item">
        <span class="detail-label">{{ $t('finance.detail.rechargeAmount') }}</span>
        <span class="detail-value">${{ detailModal.data.origin_amount }}</span>
      </div>
      <div class="detail-item">
        <span class="detail-label">{{ $t('finance.detail.fee') }}</span>
        <span class="detail-value">${{ detailModal.data.fee }}</span>
      </div>
      <div class="detail-item">
        <span class="detail-label">{{ $t('finance.detail.creditedAmount') }}</span>
        <span class="detail-value">${{ detailModal.data.amount }}</span>
      </div>
      <div class="detail-item">
        <span class="detail-label">{{ $t('finance.detail.creditedAt') }}</span>
        <span class="detail-value">{{ detailModal.data.finish_at || '--' }}</span>
      </div>
      <div v-if="detailModal.data.status === 'OnHold'" class="detail-group">
        <div class="detail-item">
          <span class="detail-label">{{ $t('finance.detail.riskLevel') }}</span>
          <span class="detail-value">
            <Tag :color="getRiskLevelColor(detailModal.data.risk_level)">{{ getRiskLevelText(detailModal.data.risk_level) }}</Tag>
          </span>
        </div>
        <div class="detail-item">
          <span class="detail-label">{{ $t('finance.detail.riskReason') }}</span>
          <span class="detail-value">
            <template v-if="Array.isArray(detailModal.data.details)">
              <div class="risk-reasons-container">
                <div v-for="(item, index) in detailModal.data.details" :key="index" class="risk-reason-item">
                  {{ item.strategy }}
                </div>
              </div>
            </template>
            <template v-else-if="detailModal.data.details?.strategy">
              {{ detailModal.data.details.strategy }}
            </template>
            <template v-else>--</template>
          </span>
        </div>
      </div>
      <div
        v-if="['InProgress','Refunded','Rejected','ChannelRefunding'].includes(detailModal.data.status)"
        class="detail-group"
      >
        <div class="detail-item">
          <span class="detail-label">{{ $t('finance.detail.refundAddress') }}</span>
          <span class="detail-value">{{ detailModal.data.refund_address || '--' }}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">{{ $t('finance.detail.refundFee') }}</span>
          <span class="detail-value">{{ detailModal.data.refund_fee || '--' }}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">{{ $t('finance.detail.refundBlock') }}</span>
          <span class="detail-value">
            <a v-if="detailModal.data.refund_hash_url" :href="detailModal.data.refund_hash_url" target="_blank">{{ $t('finance.detail.viewBlock') }}</a>
            <span v-else>--</span>
          </span>
        </div>
      </div>
    </div>
  </Modal>

  <RiskRefundModal ref="refundModalRef" @success="pageRef?.reset?.()" />
</template>

<script setup>
import { computed, ref } from 'vue'
import { Tag } from 'view-ui-plus'
import { message } from '@/utils/message.js'
import DotText from '@/components/ui/dot-text.vue'
import { useUserStore } from '@/store/user.js'
import RiskRefundModal from './RiskRefundModal.vue'
import { t } from '@/utils'

defineProps({
  active: {
    type: String,
    default: '',
  },
})

const pageRef = ref(null)
const emit = defineEmits(['init'])
const init = () => {
  emit('init')
}
const userStore = useUserStore()
const user = computed(() => userStore.user)

const detailModal = ref({
  visible: false,
  data: null,
})

const refundModalRef = ref(null)

const statusList = [
  { label: t('finance.status.all'), value: '' },
  { label: t('finance.status.processing'), value: 'Pending' },
  { label: t('finance.status.onHold'), value: 'OnHold' },
  { label: t('finance.status.reexamine'), value: 'Reexamine' },
  { label: t('finance.status.completed'), value: 'Closed' },
  { label: t('finance.status.refundReview'), value: 'InProgress' },
  { label: t('finance.status.channelRefunding'), value: 'ChannelRefunding' },
  { label: t('finance.status.refunded'), value: 'Refunded' },
  { label: t('finance.status.rejected'), value: 'Rejected' },
]

const statusOptions = {
  Closed: {
    label: t('finance.status.completed'),
    type: 'success',
  },
  Pending: {
    label: t('finance.status.processing'),
    type: 'primary',
  },
  OnHold: {
    label: t('finance.status.onHold'),
    type: 'warning',
  },
  Reexamine: {
    label: t('finance.status.reexamine'),
    type: 'warning',
  },
  InProgress: {
    label: t('finance.status.refundReview'),
    type: 'primary',
  },
  ChannelRefunding: {
    label: t('finance.status.channelRefunding'),
    type: 'warning',
  },
  Refunded: {
    label: t('finance.status.refunded'),
    type: 'error',
  },
  Rejected: {
    label: t('finance.status.rejected'),
    type: 'error',
  },
}

const colors = {
  Closed: 'var(--ui-color-success)',
  Pending: 'var(--ui-color-primary)',
  OnHold: 'var(--ui-color-warning)',
  Reexamine: 'var(--ui-color-warning)',
  InProgress: 'var(--ui-color-primary)',
  Refunded: 'var(--ui-color-error)',
  Rejected: 'var(--ui-color-error)',
  ChannelRefunding: 'var(--ui-color-warning)',
}

const statusMap = Object.entries(statusOptions).reduce((map, [key, item]) => {
  map[key] = item.label
  return map
}, {})



const emptyText = (value) => value || value === 0 ? value : '--'

const canRefund = (status) => ['OnHold', 'Reexamine', 'Rejected'].includes(status)

const getRiskLevelText = (level) => {
  const levelMap = {
    low: t('finance.riskLevel.low'),
    middle: t('finance.riskLevel.middle'),
    high: t('finance.riskLevel.high'),
    severe: t('finance.riskLevel.severe'),
  }
  return levelMap[level] || level || '--'
}

const getRiskLevelColor = (level) => {
  const colorMap = {
    low: 'blue',
    middle: 'orange',
    high: 'red',
    severe: 'purple',
  }
  return colorMap[level] || 'default'
}

const handleDetail = (row) => {
  detailModal.value.data = row
  detailModal.value.visible = true
}

const handleRefund = (row) => {
  if(!row){
    return
  }

  if(user.value.email_status !== 1 && user.value.google_auth_status !== 1){
    message(t('finance.securityRequired'), 'error')
    return
  }

  refundModalRef.value?.open(row)
}

const handleRefundClick = (row) => {
  if(row.is_refund){
    handleRefund(row)
    return
  }

  message(t('finance.severeRiskRefundAt', { time: row.operation_refund_time }), 'warning', {
    duration: 5,
  })
}

const data = computed(()=>{
  return {
    apiUrl: '/user/rechargeList',
    statusKey: 'status',
    status: statusList,
    labelWidth: 76,
    search:{

    },
    searchThead: [
      {
        label: t('finance.fields.rechargeTime'),
        type: 'daterange',
        startKey: 'startTime',
        endKey: 'endTime',
        maxMonths: 1,
        width: 230,
      },
    ],
    thead: [
      {
        label: t('finance.fields.rechargeTime'),
        prop: 'created_at',
        width: 174,
        wapType: 'title',
      },
      {
        label: t('finance.fields.status'),
        prop: 'status',
        width: 115,
        formType: 'dot',
        wapType: 'status',
        options: statusOptions,
        tips: (row) => row.status === 'Rejected' && row.remark ? row.remark : '',
      },
      {
        label: t('finance.fields.rechargeAmountUsd'),
        prop: 'origin_amount',
        minWidth: 120,
      },
      {
        label: t('finance.fields.creditedAmountUsd'),
        prop: 'amount',
        minWidth: 120,
      },
      {
        label: t('finance.fields.feeUsd'),
        prop: 'fee',
        minWidth: 110,
      },
      {
        label: t('finance.fields.creditedAt'),
        prop: 'finish_at',
        width: 174,
      },
    ],
    actions: [
      {
        label: t('finance.actions.detail'),
        click: handleDetail,
      },
      {
        label: t('finance.actions.refund'),
        style: {
          color: '#ed4014 !important',
        },
        show: (row) => canRefund(row.status) && !user.value?.parent_uid,
        click: handleRefundClick,
      },
    ],
  }
})
</script>

<style scoped>
.detail-content {
  display: grid;
  grid-template-columns: max-content minmax(0, 1fr);
  column-gap: 12px;
  row-gap: 15px;
  max-height: min(68vh, 620px);
  overflow-y: auto;
  padding-right: 4px;
}

.detail-group,
.detail-item {
  display: contents;
}

.detail-label {
  align-self: start;
  text-align: right;
  color: var(--ui-color-text-subtle);
  white-space: nowrap;
}

.detail-value {
  min-width: 0;
  overflow-wrap: anywhere;
  word-break: break-word;
}

.risk-reasons-container {
  display: flex;
  flex-wrap: wrap;
  width: 100%;
}

.risk-reason-item {
  width: 50%;
  margin-bottom: 5px;
}

@media (max-width: 768px) {
  .detail-content {
    column-gap: 8px;
  }
}
</style>
