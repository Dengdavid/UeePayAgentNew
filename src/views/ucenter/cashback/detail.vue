<template>
  <UiPage isBack :fallback="{ name: 'ucenterCashback' }" ref="pageRef">
    <Form ref="formRef" :model="currentRecord" class="cashback-detail" :rules="rules" v-if="isForm">
      <section class="detail-overview">
        <div class="overview-info">
          <div class="overview-label">{{ $t('cashback.detail.cashbackMonth') }}</div>
          <div class="overview-title-row">
            <strong>{{ formatCashbackDate(currentRecord.date) || '--' }}</strong>
            <span class="status-pill" :style="{ backgroundColor: colors?.[currentRecord.status] }">
              {{ statusList?.[currentRecord.status]?.label || '--' }}
            </span>
          </div>
        </div>
        <div class="overview-amount">
          <span>{{ $t('cashback.detail.cashbackAmount') }}</span>
          <strong><em>$</em>{{ currentRecord.amount || '0' }}</strong>
        </div>
      </section>
      <section class="detail-section">
        <div class="section-head">
          <h5 class="section-title">{{ $t('cashback.detail.cashbackDetails') }}</h5>
          <span v-if="currentRecord?.list?.length">{{ $t('cashback.detail.recordCount', { count: currentRecord.list.length }) }}</span>
        </div>
        <template v-if="currentRecord?.list?.length > 0">
          <div v-if="isPhone" class="detail-wap-list">
            <div class="detail-wap-item" v-for="(row, index) in currentRecord.list" :key="row.id || index">
              <div class="detail-wap-head">
                <strong>{{ row.bin || '--' }}</strong>
                <UiDot v-if="!isGenerated" v-model="row.status" :options="statusList"/>
              </div>
              <div class="detail-wap-body">
                <div class="detail-wap-row">
                  <span>{{ $t('cashback.detail.consumptionAmount') }}</span>
                  <strong>$ {{ row.clean_consumption_amount ?? '-' }}</strong>
                </div>
                <div class="detail-wap-row">
                  <span>{{ $t('cashback.detail.cashbackAmount') }}</span>
                  <strong>$ {{ row.amount ?? '-' }}</strong>
                </div>
                <div class="detail-wap-row detail-wap-row--input" v-if="isGenerated">
                  <span>{{ $t('cashback.detail.appealConsumptionAmount') }}</span>
                  <FormNumber
                    v-model="currentRecord.list[index].appeal_clean_consumption_amount"
                    :placeholder="canFillAppealAmount(row) ? $t('cashback.detail.appealConsumptionAmount') : $t('cashback.detail.positiveCashbackRequired')"
                    :precision="3"
                    :disabled="!canFillAppealAmount(row)"
                  />
                </div>
              </div>
            </div>
          </div>
          <UiTable
            v-else
            :thead="getDetailColumnCom(currentRecord.type || 0)"
            :tbody="currentRecord.list"
            :loading="detailLoading"
          >
            <template #appeal_clean_consumption_amount="{ row, index }">
              <FormNumber
                v-model="currentRecord.list[index].appeal_clean_consumption_amount"
                :placeholder="canFillAppealAmount(row) ? $t('cashback.detail.appealConsumptionAmount') : $t('cashback.detail.positiveCashbackRequired')"
                :precision="3"
                :disabled="!canFillAppealAmount(row)"
              />
            </template>
            <template #status="{ row, index }">
              <UiDot v-model="row.status" :options="statusList"/>
            </template>
          </UiTable>
        </template>
        <div v-else-if="!detailLoading" class="empty-state">
          {{ $t('cashback.detail.noData') }}
        </div>
      </section>

      <section v-if="isGenerated" class="appeal-section">
        <div class="section-head">
          <h5 class="section-title">{{ $t('cashback.detail.appealReason') }}</h5>
        </div>
        <FormItem prop="appeal_remark">
          <FormInput v-model="currentRecord.appeal_remark" :maxlength="300" type="textarea" :placeholder="$t('cashback.detail.appealReasonPlaceholder')">
          </FormInput>
        </FormItem>
      </section>
    </Form>

    <div class="action-buttons">
      <template v-if="isGenerated">
        <Button @click="handleAppeal(formRef)">{{ $t('cashback.detail.submitAppeal') }}</Button>
        <Button type="primary" @click="isGenerated = false">{{ $t('cashback.detail.cancelAppeal') }}</Button>
      </template>
      <template v-else>
        <template v-if="currentRecord.status === 0">
          <Button @click="isGenerated = true">{{ $t('cashback.detail.appealAction') }}</Button>
          <Button type="primary" @click="handleConfirm">{{ $t('cashback.detail.confirmCashback') }}</Button>
        </template>
      </template>
    </div>
    <CashbackAppealModal v-model:visible="appealModal" :record="currentRecord" @success="handleAppealSuccess" />
  </UiPage>
</template>

<script setup>
import { ref, onMounted, reactive, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Modal } from 'view-ui-plus'
import { message } from '@/utils/message.js'
import CashbackAppealModal from './components/CashbackAppealModal.vue'
import cardApi from '@/api/card.js'
import { isPhone } from '@/utils/device.js'
import { t } from '@/utils'
const route = useRoute()
const router = useRouter()

// 数据状态
const pageRef = ref(null)
const formRef = ref(null)
const currentRecord = reactive({
  date: '',
  amount: '',
  status: null,
  appeal_amount: 0,
  appeal_remark: '',
  remark: '',
  type: null,
  list: [],
})
const detailLoading = ref(false)
const appealModal = ref(false)
const isGenerated = ref(false)
const isForm = ref(true)

// 状态配置
const colors = {
  0: 'var(--ui-color-primary)', // 待确认
  1: 'var(--ui-color-success)', // 已确认
  2: 'var(--ui-color-error)', // 申诉中
}

const statusList = {
  0: {
    label: t('cashback.status.pending'),
    type: 'primary',
  },
  1: {
    label: t('cashback.status.confirmed'),
    type: 'success',
  },
  2: {
    label: t('cashback.status.appealing'),
    type: 'error',
  },
}
const rules = {
  appeal_remark: [{ required: true, message: t('cashback.validate.appealReasonRequired'), trigger: 'blur' }],
}
const getDetailColumnCom = (type = 0) => {
  const detailColumnCom = [
    {
      label: t('cashback.detail.consumptionBin'),
      prop: 'bin',
      minWidth: 100,
    },
    {
      label: t('cashback.detail.consumptionAmount'),
      unit: '$',
      prop: 'clean_consumption_amount',
      minWidth: 100,
    },
    {
      label: t('cashback.detail.cashbackAmount'),
      unit: '$',
      prop: 'amount',
      minWidth: 100,
    },
  ]
  let arr = []
  if (isGenerated.value) {
    arr = [
      {
        label: t('cashback.detail.appealConsumptionAmount'),
        unit: '$',
        prop: 'appeal_clean_consumption_amount',
        type: 'custom',
      },
    ]
  } else {
    arr = [
      {
        label: t('cashback.list.status'),
        prop: 'status',
        type: 'dot',
      },
    ]
  }
  return detailColumnCom.concat(arr).map((el) => ({
    ...el,
    minWidth: el.minWidth || 120,
  }))
}
// 方法
// 格式化返现月份，将 2025-05-01 格式转换为 2025-05 格式
const formatCashbackDate = (dateStr) => {
  if (!dateStr) return ''
  // 如果是 2025-05-01 格式，提取年月部分
  if (dateStr.includes('-') && dateStr.split('-').length === 3) {
    const parts = dateStr.split('-')
    return `${parts[0]}-${parts[1]}`
  }
  return dateStr
}

const canFillAppealAmount = (row) => Number(row?.amount) > 0

// 获取详情数据
const loadDetailData = async () => {
  const _query = route.query

  if (!_query?.date) {
    nextTick(() => {
      message(t('cashback.message.invalidParams'), 'error')
      handleAppealSuccess()
    })

    return
  }
  detailLoading.value = true
  pageRef.value.loading = true
  cardApi
    .getCashbackDetail({ date: _query.date })
    .then((res) => {
      currentRecord.date = res.date
      currentRecord.amount = res.amount
      currentRecord.status = res.status
      currentRecord.appeal_remark = res.appeal_remark
      currentRecord.list = res.data.map((el) => ({
        ...el,
        appeal_clean_consumption_amount:
          Number(el.appeal_clean_consumption_amount) || null,
      }))
      detailLoading.value = false
    })
    .catch((err) => {
      detailLoading.value = false
      message(err.msg, 'error')
      handleAppealSuccess()
    }).finally(() => {
      pageRef.value.loading = false
    })
}

// 确认返现
const handleConfirm = () => {
  Modal.confirm({
    title: t('cashback.message.confirmTitle'),
    content: t('cashback.message.confirmContent'),
    onOk: async () => {
      try {
        await cardApi.confirmCashback({ date: currentRecord.date })
        message(t('cashback.message.confirmSuccess'))
        // 返回返现记录页面
        handleAppealSuccess()
      } catch (error) {
        message(t('cashback.message.confirmFailed'), 'error')
      }
    },
  })
}

// 申诉返现
const handleAppeal = (ref) => {
  ref.validate((valid) => {
    if (valid) {
      const _list = currentRecord.list.filter(
        (el) => canFillAppealAmount(el) && Number(el.appeal_clean_consumption_amount) > 0
      )
      if (_list.length === 0) {
        Modal.error({
          title: t('cashback.message.noticeTitle'),
          content: t('cashback.message.validAppealRequired'),
          onOk: async () => { },
        })
        return
      }
      cardApi
        .appealCashback({
          date: currentRecord.date,
          appeal_remark: currentRecord.appeal_remark,
          data: _list.map((el) => ({
            id: el.id,
            amount: el.appeal_clean_consumption_amount,
          })),
        })
        .then((res) => {
          message(t('cashback.message.submitSuccess'))
          handleAppealSuccess()
          isGenerated.value = false
        })
        .catch((err) => {
          message(err.msg || t('cashback.message.submitFailed'), 'error')
        })
    }
  })
}

// 申诉成功回调
const handleAppealSuccess = () => {
  // 返回返现记录页面
  router.push('/ucenter/cashback')
}

// 返回
const goBack = () => {
  router.go(-1)
}

// 初始化
const init = () => {
  // 从路由参数获取记录数据
  const _query = route.query
  if (_query) {
    try {
      loadDetailData()
    } catch (error) {
      message(t('cashback.message.invalidData'), 'error')
    }
  } else {
    message(t('cashback.message.missingData'), 'error')
    goBack()
  }
}

onMounted(() => {
  init()
})
</script>

<style scoped>
.cashback-detail {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.detail-overview {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  align-items: center;
  gap: 20px;
  min-height: 82px;
  border-radius: var(--ui-radius-lg);
  border: var(--ui-border-primary-muted);
  background: linear-gradient(116deg, rgba(43, 92, 217, 0.12) 0%, rgba(43, 92, 217, 0.055) 44%, rgba(255, 255, 255, 0.98) 100%);
  padding: var(--ui-padding-16-20);
}

.overview-info {
  min-width: 0;
}

.overview-label {
  color: var(--subsidiary-color);
  font-size: 12px;
  line-height: 16px;
}

.overview-title-row {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-top: 8px;
}

.overview-title-row strong {
  color: var(--text-color);
  font-size: 18px;
  font-weight: 700;
  line-height: 24px;
}

.status-pill {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 56px;
  height: var(--ui-size-22);
  border-radius: var(--ui-radius-full);
  background: var(--subsidiary-color);
  color: var(--ui-color-text-inverse);
  font-size: 12px;
  font-weight: 500;
  padding: var(--ui-padding-0-10);
  white-space: nowrap;
}

.overview-amount {
  min-width: 170px;
  text-align: right;
}

.overview-amount span {
  display: block;
  color: var(--subsidiary-color);
  font-size: 12px;
  line-height: 16px;
}

.overview-amount strong {
  display: inline-flex;
  align-items: baseline;
  justify-content: flex-end;
  margin-top: 8px;
  color: var(--text-color);
  font-size: 22px;
  font-weight: 700;
  line-height: 26px;
}

.overview-amount em {
  margin-right: 5px;
  font-size: 13px;
  font-style: normal;
  font-weight: 600;
  line-height: 1;
}

.detail-section,
.appeal-section {
  display: grid;
  gap: 14px;
  margin-top: 4px;
}

.section-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.section-head span {
  color: var(--subsidiary-color);
  font-size: 12px;
}

.section-title {
  margin: 0;
  color: var(--text-color);
  font-size: 15px;
  font-weight: 700;
  line-height: 24px;
}

.detail-wap-list {
  display: grid;
  gap: 10px;
}

.detail-wap-item {
  border: var(--ui-border-subtle);
  border-radius: var(--ui-radius-lg);
  background: #fff;
  overflow: hidden;
}

.detail-wap-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  min-height:32px;
  background: #fafbfc;
  padding: var(--ui-padding-10-12);
  box-sizing: border-box;
}

.detail-wap-head strong {
  color: var(--text-color);
  font-size: 14px;
  font-weight: 600;
  line-height: 20px;
}

.detail-wap-body {
  display: grid;
  padding: var(--ui-padding-2-12);
  border-top: 1px solid #f3f5f8;
}

.detail-wap-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  min-height: 38px;
}

.detail-wap-row:first-child {
  border-top: 0;
}

.detail-wap-row span {
  color: var(--subsidiary-color);
  font-size: 12px;
  line-height: 18px;
  white-space: nowrap;
}

.detail-wap-row strong {
  color: var(--text-color);
  font-size: 13px;
  font-weight: 500;
  line-height: 18px;
  text-align: right;
  word-break: break-all;
}

.detail-wap-row--input {
  align-items: flex-start;
  flex-direction: column;
  gap: 8px;
  padding: var(--ui-padding-10-0);
}

.detail-wap-row--input :deep(.ivu-input-number) {
  width: 100%;
}

.empty-state {
  border: 1px dashed #d8e0ec;
  border-radius: var(--ui-radius-lg);
  color: var(--subsidiary-color);
  padding: 32px 16px;
  text-align: center;
}

.action-buttons {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 12px;
  margin-top: 22px;
}

.action-buttons .ivu-btn {
  min-width: 88px;
}

@media (max-width: 900px) {
  .detail-overview {
    grid-template-columns: 1fr;
  }

  .overview-amount {
    min-width: 0;
    text-align: left;
  }

}

@media (max-width: 520px) {
  .action-buttons {
    justify-content: stretch;
  }

  .action-buttons .ivu-btn {
    flex: 1;
  }
}
</style>
