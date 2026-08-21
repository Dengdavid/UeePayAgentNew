<template>
  <FormPupBox ref="pupRef" :pup="pup">
    <template #default="{ form }">
      <div class="transfer-form">
        <section class="transfer-card" :aria-label="$t('card.index.transfer.transferIn')">
          <div class="amount-panel">
            <FormItemBox :label="$t('card.index.transfer.transferInAmount')" :labelSub="amountRangeText" prop="amount" isRequired>
              <div
                class="amount-input-line"
                :class="{ 'has-value': form.amount !== null && form.amount !== undefined && form.amount !== '' }"
              >
                <span class="amount-currency">$</span>
                <FormNumber
                  ref="amountInputRef"
                  size="large"
                  v-model="form.amount"
                  :max="max"
                  :min="min"
                  :precision="2"
                  :disabled="!canTransfer"
                  style="width: 100%"
                  :placeholder="$t('card.index.transfer.enterAmount')"
                />
                <Button
                  type="text"
                  class="amount-action"
                  :disabled="!form.amount && !canTransfer"
                  @click="handleAmountAction"
                >
                  {{ form.amount ? $t('card.index.common.clear') : $t('card.index.common.all') }}
                </Button>
              </div>
            </FormItemBox>
            <div class="account-summary">
              <div class="summary-row">
                <span>{{ $t('card.index.transfer.cardNumber') }}</span>
                <strong :title="maskedCardNumber">{{ maskedCardNumber || '--' }}</strong>
              </div>
              <div class="summary-row summary-row--balance">
                <span>{{ $t('card.index.transfer.accountBalance') }}</span>
                <div class="summary-value">
                  <strong>$ {{ user.money || '0.000' }}</strong>
                  <router-link :to="{ name: 'ucenter_deposit' }">{{ $t('card.index.transfer.recharge') }}</router-link>
                </div>
              </div>
            </div>
          </div>

          <section class="cost-summary" :aria-label="$t('card.index.transfer.costDetails')">
            <h4>{{ $t('card.index.transfer.costDetails') }}</h4>
            <dl>
              <div><dt>{{ $t('card.index.transfer.transferInAmount') }}</dt><dd>$ {{ amountText }}</dd></div>
              <div><dt>{{ $t('card.index.transfer.rateFee', { rate: fee }) }}</dt><dd>$ {{ feeMoney }}</dd></div>
              <div class="total"><dt>{{ $t('card.index.transfer.totalCost') }}</dt><dd>$ {{ total }}</dd></div>
            </dl>
          </section>
        </section>
      </div>
    </template>
  </FormPupBox>
</template>

<script setup>
import { computed, nextTick, reactive, ref } from 'vue'
import { storeToRefs } from 'pinia'
import Decimal from 'decimal.js'
import { cardApi } from '@/api'
import { maskCardNumber } from '@/utils/card.js'
import { t } from '@/utils'
import { useUserStore } from '@/store/user.js'
import { message } from '@/utils/message.js'

const emit = defineEmits(['on-update'])
const userStore = useUserStore()
const { user, userGroup } = storeToRefs(userStore)
const pupRef = ref(null)
const amountInputRef = ref(null)
const row = ref({})
const balanceLoading = ref(false)
const maskedCardNumber = computed(() => maskCardNumber(row.value.card_no))

const defaultForm = () => ({ amount: null })
const decimal = (value, fallback = 0) => {
  try {
    const result = new Decimal(value ?? fallback)
    return result.isFinite() ? result : new Decimal(fallback)
  } catch {
    return new Decimal(fallback)
  }
}
const fee = computed(() => Decimal.max(decimal(row.value.fee), 0).toNumber())
const positiveLimit = (value) => {
  const limit = decimal(value)
  return limit.greaterThan(0) ? limit : null
}
const max = computed(() => {
  const balance = decimal(user.value.money)
  const rateMultiplier = new Decimal(1).plus(decimal(fee.value).div(100))
  const affordableAmount = balance.div(rateMultiplier).toDecimalPlaces(2, Decimal.ROUND_DOWN)
  const limits = [
    affordableAmount,
    positiveLimit(userGroup.value.recharge_max_amount),
    positiveLimit(row.value.in_max_amount),
  ].filter(Boolean)
  const maximum = Decimal.min(...limits)
  return Decimal.max(maximum, 0).toNumber()
})
const min = computed(() => Decimal.max(
  decimal(userGroup.value.recharge_min_amount),
  decimal(row.value.in_min_amount),
  0,
).toNumber())
const canTransfer = computed(() => !balanceLoading.value && decimal(max.value).greaterThan(0) && decimal(max.value).greaterThanOrEqualTo(min.value))
const maximumBelowMinimumText = computed(() => t('card.index.transfer.maximumBelowMinimum', {
  action: t('card.index.transfer.transferIn'),
  max: `$${decimal(max.value).toFixed(2)}`,
  min: `$${decimal(min.value).toFixed(2)}`,
}))
const amountRangeText = computed(() => {
  const minimum = decimal(min.value)
  const maximum = decimal(max.value)
  if (maximum.lessThanOrEqualTo(0) && minimum.lessThanOrEqualTo(0)) {
    return t('card.index.transfer.noAvailableTransferInAmount')
  }
  if (maximum.lessThan(minimum)) return maximumBelowMinimumText.value
  return t('card.index.transfer.availableRange', {
    action: t('card.index.transfer.transferIn'),
    min: `$${minimum.toFixed(2)}`,
    max: `$${maximum.toFixed(2)}`,
  })
})
const feeMoney = computed(() => {
  if (!pup.form.amount || !fee.value) return '0.000'
  return new Decimal(pup.form.amount).mul(fee.value).div(100).toFixed(3)
})
const total = computed(() => new Decimal(pup.form.amount || 0).plus(feeMoney.value).toFixed(3))
const amountText = computed(() => new Decimal(pup.form.amount || 0).toFixed(2))
const isAmountValid = (value) => {
  if (!canTransfer.value || value === null || value === undefined || value === '') return false
  const amount = decimal(value)
  return amount.greaterThan(0) && amount.greaterThanOrEqualTo(min.value) && amount.lessThanOrEqualTo(max.value)
}
const handleAmountAction = async () => {
  if (pup.form.amount) {
    pup.form.amount = null
    return
  }
  pup.form.amount = max.value
  await nextTick()
  pupRef.value?.validateField('amount')
}
const validateAmount = (_rule, value, callback) => {
  if (decimal(max.value).lessThan(min.value)) return callback(new Error(maximumBelowMinimumText.value))
  if (value === null || value === undefined || value === '') return callback(new Error(t('card.index.transfer.enterTransferInAmount')))
  const amount = decimal(value)
  if (amount.lessThanOrEqualTo(0)) return callback(new Error(t('card.index.transfer.amountGreaterThanZero', { action: t('card.index.transfer.transferIn'), amount: '$0' })))
  if (amount.lessThan(min.value)) return callback(new Error(t('card.index.transfer.amountBelowMinimum', { action: t('card.index.transfer.transferIn'), amount: `$${min.value}` })))
  if (amount.greaterThan(max.value)) return callback(new Error(t('card.index.transfer.amountAboveMaximum', { action: t('card.index.transfer.transferIn'), amount: `$${max.value}` })))
  callback()
}

const pup = reactive({
  status: false,
  title: t('card.index.transfer.transferIn'),
  width: 440,
  loading: false,
  labelPosition: 'top',
  form: defaultForm(),
  rules: {
    amount: [{ validator: validateAmount, trigger: 'change' }],
  },
  actions: [
    {
      label: t('card.index.transfer.confirmTransferIn'),
      disabled: (form) => !isAmountValid(form.amount),
      click: async (pupData) => {
        try {
          if (!row.value.id) throw new Error(t('card.index.transfer.cardInfoInvalid'))
          const amount = decimal(pupData.form.amount)
          if (amount.lessThanOrEqualTo(0)) {
            throw new Error(t('card.index.transfer.amountGreaterThanZero', { action: t('card.index.transfer.transferIn'), amount: '$0' }))
          }
          if (amount.lessThan(min.value)) {
            throw new Error(t('card.index.transfer.amountBelowMinimum', { action: t('card.index.transfer.transferIn'), amount: `$${min.value}` }))
          }
          if (amount.greaterThan(max.value)) {
            throw new Error(t('card.index.transfer.amountAboveMaximum', { action: t('card.index.transfer.transferIn'), amount: `$${max.value}` }))
          }
          await cardApi.vccIn({ cardId: row.value.id, amount: pupData.form.amount })
          message(t('card.index.transfer.transferInSuccess'))
          pupData.status = false
          userStore.getUserInfo()
          emit('on-update', row.value.id)
        } catch (error) {
          await userStore.getUserInfo()
          message(error?.msg || error?.message || t('card.index.transfer.transferInFailed'), 'error')
        } finally {
          pupData.loading = false
        }
      },
    },
  ],
})

const open = async (currentRow = {}) => {
  row.value = currentRow
  pup.form = defaultForm()
  pup.status = true
  balanceLoading.value = true
  pup.loading = true
  try {
    await userStore.getUserInfo()
  } finally {
    balanceLoading.value = false
    pup.loading = false
  }
  if (!pup.status) return
  nextTick(() => {
    window.requestAnimationFrame(() => {
      const input = amountInputRef.value
      if (typeof input?.focus === 'function') {
        input.focus()
        return
      }
      input?.$el?.querySelector('input')?.focus()
    })
  })
}
const close = () => {
  pup.status = false
}

defineExpose({ open, close })
</script>

<style scoped lang="less">
.transfer-card {
  overflow: hidden;
  margin: var(--ui-margin-neg-15-neg-15-neg-22);
  background:
    radial-gradient(circle at 100% 0%, rgba(119, 174, 255, 0.12), transparent 34%),
    linear-gradient(180deg, #f7faff 0%, #fff 38%);
  box-shadow: 0 5px 16px rgba(30, 59, 119, 0.06);
}
.amount-panel {
  padding: var(--ui-padding-15-15-10);

  :deep(.ivu-form-item) {
    margin-bottom: 20px;
  }

  :deep(.ivu-form-item-label) {
    display: flex;
    width: 100%;
    align-items: baseline;
    font-size: 14px;

    &::before {
      flex: none;
    }
  }

  :deep(.formTitle) {
    min-width: 0;
    flex: 1;
    flex-wrap: wrap;
    line-height: 1.4;
    white-space: normal;
  }

  :deep(.formTitle .title),
  :deep(.formTitle .sub) {
    min-width: 0;
    overflow-wrap: anywhere;
  }

  :deep(.ivu-input-number) {
    height: var(--ui-size-52);
    border: 0;
    border-radius: 0;
    background: transparent;
    box-shadow: none;

    &:hover,
    &.ivu-input-number-focused {
      box-shadow: none;
    }

    &.ivu-input-number-focused .ivu-input-number-input {
      color: var(--primary-color);
    }
  }

  :deep(.ivu-input-number-input) {
    height: var(--ui-size-50);
    padding: 0;
    background: transparent;
    color: var(--ui-color-text);
    font-size: 26px;
    font-weight: 700 !important;
    font-variant-numeric: tabular-nums;
  }

  :deep(.ivu-input-number-handler-wrap) {
    display: none;
  }
}
.amount-input-line {
  display: flex;
  align-items: center;
  gap: 4px;
  border-bottom: 1px solid #cfd7e5;
  transition: border-color 0.2s ease;

  &:focus-within {
    border-bottom-color: var(--primary-color);

    .amount-currency {
      color: var(--primary-color);
    }
  }

  &.has-value {
    .amount-currency {
      color: var(--primary-color);
    }

    :deep(.ivu-input-number-input) {
      color: var(--primary-color);
    }
  }
}
.amount-action {
  height: var(--ui-size-36);
  flex: none;
  padding: var(--ui-padding-0-2-0-10);
  font-size: 12px;
  font-weight: 500;
}
.amount-currency {
  display: inline-flex;
  height: var(--ui-size-52);
  flex: none;
  align-items: center;
  color: var(--ui-color-text);
  font-size: 26px;
  font-weight: 700;
  line-height: 52px;
  transform: translateY(-4px);
  transition: color 0.2s ease;
}
.account-summary {
  margin-top: 2px;
  padding: var(--ui-padding-7-12);
  border: var(--ui-border-subtle);
  border-radius: var(--ui-radius-6);
  background: linear-gradient(135deg, #f7f9fc 0%, #f3f6fa 100%);
}
.summary-row {
  display: flex;
  min-height: 34px;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  color: var(--ui-color-neutral-500);
  font-size: 13px;

  strong {
    overflow: hidden;
    color: var(--ui-color-neutral-800);
    font-weight: 500;
    font-variant-numeric: tabular-nums;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}
.summary-row--balance strong {
  color: var(--ui-color-text);
  font-weight: 600;
}
.summary-value {
  display: flex;
  min-width: 0;
  align-items: center;
  gap: 10px;

  a {
    display: inline-flex;
    align-items: center;
    gap: 2px;

    &::after {
      content: '›';
      margin-left:4px;
      font-size: 15px;
      line-height: 1;
    }
  }
}
.cost-summary {
  margin: 0 15px;
  padding: 4px 0 15px;

  h4 { margin-bottom: 10px; color: var(--ui-color-text); }
  dl { display: flex; flex-direction: column; gap: 8px; }
  dl > div { display: flex; justify-content: space-between; gap: 16px; }
  dt { flex: none; color: var(--ui-color-neutral-600); }
  dd {
    min-width: 0;
    flex: 1;
    color: var(--ui-color-text);
    font-variant-numeric: tabular-nums;
    text-align: right;
  }
  .total { padding-top: 8px; border-top: 1px solid #e3e8f0; }
  .total dd { color: var(--error-color); font-weight: 600; }
}
</style>
