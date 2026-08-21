<template>
  <FormPupBox ref="pupRef" :pup="pup">
    <template #default="{ form }">
      <div v-if="recharge" class="refund-modal">
        <section class="info-section">
          <h4 class="section-title">{{ $t('finance.refund.rechargeInfo') }}</h4>
          <div class="info-grid">
            <div class="info-item info-item-time">
              <span class="info-label">{{ $t('finance.refund.rechargeTime') }}</span>
              <span class="info-value">{{ recharge.created_at }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">{{ $t('finance.refund.rechargeAmount') }}</span>
              <span class="info-value info-amount">${{ recharge.origin_amount }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">{{ $t('finance.refund.currencyNetwork') }}</span>
              <span class="info-value">{{ recharge.currency || '-' }} · {{ recharge.chain || '-' }}</span>
            </div>
          </div>
        </section>

        <div class="address-section">
          <FormItemBox
            :label="$t('finance.refund.address')"
            :labelSub="$t('finance.refund.addressHint')"
            prop="refundAddress"
            isRequired
          >
            <FormInput v-model="form.refundAddress" size="large" :placeholder="$t('finance.refund.addressPlaceholder')" />
          </FormItemBox>
        </div>

        <section class="cost-summary" :aria-label="$t('finance.refund.costDetails')">
          <h4>{{ $t('finance.refund.costDetails') }}</h4>
          <dl>
            <div>
              <dt>{{ $t('finance.refund.refundAmount') }}</dt>
              <dd>$ {{ recharge.origin_amount }}</dd>
            </div>
            <div>
              <dt>{{ $t('finance.refund.fee') }}</dt>
              <dd>$ {{ refundFee }}</dd>
            </div>
            <div class="total">
              <dt>{{ $t('finance.refund.estimatedAmount') }}</dt>
              <dd>$ {{ estimatedAmount }}</dd>
            </div>
          </dl>
        </section>
        <UiNotice :title="$t('finance.refund.confirmTitle')" :items="refundNotices" />
      </div>
    </template>
  </FormPupBox>
</template>

<script setup>
import { computed, reactive, ref } from 'vue'
import Decimal from 'decimal.js'
import { message } from '@/utils/message.js'
import { userApi } from '@/api'
import { t } from '@/utils'

const emit = defineEmits(['success'])
const pupRef = ref(null)
const recharge = ref(null)
const refundFee = ref(0)
const refundNotices = [t('finance.refund.noticeAddress'), t('finance.refund.noticeFee'), t('finance.refund.noticeTime')]

const defaultForm = () => ({
  refundAddress: '',
  id: '',
})

const pup = reactive({
  status: false,
  title: t('finance.refund.title'),
  width: 520,
  labelPosition: 'top',
  form: defaultForm(),
  rules: {
    refundAddress: [{ required: true, message: t('finance.refund.addressPlaceholder'), trigger: 'blur' }],
  },
  actions: [
    {
      label: t('finance.refund.confirm'),
      click: async (pupData) => {
        try {
          await userApi.refundRecharge({
            id: pupData.form.id,
            refundAddress: pupData.form.refundAddress,
          })
          message(t('finance.refund.submitted'))
          pupData.status = false
          emit('success')
        } catch (error) {
          message(error?.msg || t('finance.refund.failed'), 'error', { duration: 5 })
        } finally {
          pupData.loading = false
        }
      },
    },
  ],
})

const estimatedAmount = computed(() => {
  const amount = new Decimal(recharge.value?.origin_amount || 0)
  const fee = new Decimal(refundFee.value || 0)
  return amount.minus(fee).toFixed(3)
})

const fetchRefundFee = async (row) => {
  refundFee.value = 0
  if (!row.chain) return

  try {
    refundFee.value = await userApi.getRefundRiskFee({ chain: row.chain, id: row.id })
  } catch (error) {
    refundFee.value = 6
  }
}

const open = async (row = {}) => {
  recharge.value = row
  pup.form = {
    id: row.id,
    refundAddress: row.from_address || '',
  }
  pup.status = true
  await fetchRefundFee(row)
}

const close = () => {
  pup.status = false
}

defineExpose({
  open,
  close,
})
</script>

<style scoped lang="less">
.refund-modal {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.info-section,
.cost-summary {
  background: #f7faff;
  border: 1px solid #eaf0ff;
  border-radius: var(--ui-radius-6);
}

.info-section {
  padding: var(--ui-padding-16);
}

.section-title {
  margin-bottom: 14px;
  color: var(--text-color);
  font-size: 14px;
  font-weight: 600;
}

.info-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.55fr) minmax(0, 0.8fr) minmax(0, 1fr);
  gap: 20px;
}

.info-item {
  display: flex;
  align-items: flex-start;
  flex-direction: column;
  gap: 5px;
  min-width: 0;
  text-align: left;
}

.info-item-time {
  min-width: 148px;
}

.info-label {
  color: var(--grey-color);
  font-size: 12px;
  line-height: 18px;
}

.info-value {
  overflow-wrap: anywhere;
  color: var(--text-color);
  font-size: 14px;
  font-weight: 500;
  line-height: 20px;
}

.info-amount {
  font-weight: 600;
}

.address-section {
  :deep(.ivu-form-item) {
    margin-bottom: 0;
  }
}

.cost-summary {
  padding: 14px 15px 15px;

  h4 {
    margin-bottom: 10px;
    color: var(--ui-color-text);
  }

  dl {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  dl > div {
    display: flex;
    justify-content: space-between;
    gap: 16px;
  }

  dt {
    flex: none;
    color: var(--ui-color-neutral-600);
  }

  dd {
    min-width: 0;
    flex: 1;
    color: var(--ui-color-text);
    font-variant-numeric: tabular-nums;
    text-align: right;
  }

  .total {
    padding-top: 8px;
    border-top: 1px solid #e3e8f0;
  }

  .total dd {
    color: var(--error-color);
    font-weight: 600;
  }
}

@media (max-width: 575px) {
  .refund-modal {
    gap: 16px;
  }

  .info-section {
    padding: var(--ui-padding-14);
  }

  .info-grid {
    grid-template-columns: 1fr;
    gap: 14px;
  }

  .info-item-time {
    min-width: 0;
  }

}
</style>
