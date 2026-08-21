<template>
  <FormPupBox ref="pupRef" :pup="pup">
    <template #default="{ form }">
      <div class="transfer-form">
        <section class="transfer-card" :aria-label="$t('card.index.transfer.transferOut')">
          <div class="amount-panel">
            <FormItemBox
              :label="$t('card.index.transfer.transferOutAmount')"
              :labelSub="amountRangeText"
              prop="amount"
              isRequired
            >
              <div
                class="amount-input-line"
                :class="{
                  'has-value': form.amount !== null && form.amount !== undefined && form.amount !== '',
                  'is-disabled': !canTransfer,
                }"
              >
                <span class="amount-currency">$</span>
                <FormNumber
                  ref="amountInputRef"
                  size="large"
                  v-model="form.amount"
                  :max="max"
                  :min="min"
                  :precision="3"
                  :disabled="!canTransfer"
                  style="width: 100%"
                  :placeholder="$t('card.index.transfer.enterAmount')"
                />
                <Button
                  type="text"
                  class="amount-action"
                  :disabled="!canTransfer"
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
                <span>{{ $t('card.index.transfer.cardBalance') }}</span>
                <strong>$ {{ row.available || '0.000' }}</strong>
              </div>
              <div class="summary-row">
                <span>{{ $t('card.index.transfer.minimumRetainedBalance') }}</span>
                <strong>$ {{ keepAmountText }}</strong>
              </div>
            </div>
          </div>

          <UiNotice
            class="transfer-notice"
            :role="canTransfer ? 'note' : 'alert'"
            showIcon
          >
            <span v-if="canTransfer">{{ $t('card.index.transfer.transferOutNotice') }}</span>
            <span v-else-if="balanceIsZero">{{ $t('card.index.transfer.zeroBalanceNotice', { amount: row.available || '0.000' }) }}</span>
            <span v-else-if="balanceBelowKeep">{{ balanceBelowKeepText }}</span>
            <span v-else>{{ $t('card.index.transfer.transferOutUnavailableNotice') }}</span>
          </UiNotice>
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
const { userGroup } = storeToRefs(userStore)
const pupRef = ref(null)
const amountInputRef = ref(null)
const row = ref({})
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
const positiveLimit = (value) => {
  const limit = decimal(value)
  return limit.greaterThan(0) ? limit : null
}
const keepAmount = computed(() => Decimal.max(decimal(row.value.out_keep_amount), 0))

const max = computed(() => {
  const balance = decimal(row.value.available)
  const transferableBalance = Decimal.max(balance.minus(keepAmount.value), 0)
  const limits = [
    transferableBalance,
    positiveLimit(userGroup.value.withdraw_max_amount),
    positiveLimit(row.value.out_max_amount),
  ].filter(Boolean)
  const maximum = Decimal.min(...limits)
  return Decimal.max(maximum, 0).toNumber()
})
const min = computed(() => Decimal.max(
  decimal(userGroup.value.withdraw_min_amount, 1),
  decimal(row.value.out_min_amount),
  1,
).toNumber())
const keepAmountText = computed(() => keepAmount.value.toFixed(3))
const balanceIsZero = computed(() => decimal(row.value.available).lessThanOrEqualTo(0))
const balanceBelowKeep = computed(() => decimal(row.value.available).lessThan(keepAmount.value))
const balanceBelowKeepText = computed(() => t('card.index.transfer.balanceBelowRetainedBalance', {
  balance: `$${decimal(row.value.available).toFixed(3)}`,
  keep: `$${keepAmount.value.toFixed(3)}`,
}))
const canTransfer = computed(() => decimal(max.value).greaterThan(0) && decimal(max.value).greaterThanOrEqualTo(min.value))
const maximumBelowMinimumText = computed(() => t('card.index.transfer.maximumBelowMinimum', {
  action: t('card.index.transfer.transferOut'),
  max: `$${decimal(max.value).toFixed(3)}`,
  min: `$${decimal(min.value).toFixed(3)}`,
}))
const amountRangeText = computed(() => {
  const minimum = new Decimal(min.value)
  const maximum = new Decimal(max.value)
  if (balanceIsZero.value) return t('card.index.transfer.noAvailableBalance')
  if (balanceBelowKeep.value) return balanceBelowKeepText.value
  if (maximum.lessThanOrEqualTo(0)) return t('card.index.transfer.noAvailableBalance')
  if (maximum.lessThan(minimum)) return maximumBelowMinimumText.value
  if (minimum.equals(maximum)) return t('card.index.transfer.availableAmount', {
    action: t('card.index.transfer.transferOut'),
    amount: `$${maximum.toFixed(3)}`,
  })
  return t('card.index.transfer.availableRange', {
    action: t('card.index.transfer.transferOut'),
    min: `$${minimum.toFixed(3)}`,
    max: `$${maximum.toFixed(3)}`,
  })
})
const handleAmountAction = async () => {
  if (pup.form.amount) {
    pup.form.amount = null
    return
  }
  pup.form.amount = max.value
  await nextTick()
  pupRef.value?.validateField('amount')
}
const isAmountValid = (value) => {
  if (!canTransfer.value || value === null || value === undefined || value === '') return false
  const amount = decimal(value)
  return amount.greaterThan(0) && amount.greaterThanOrEqualTo(min.value) && amount.lessThanOrEqualTo(max.value)
}

const validateAmount = (_rule, value, callback) => {
  if (balanceIsZero.value) return callback(new Error(t('card.index.transfer.insufficientCardBalance')))
  if (balanceBelowKeep.value) return callback(new Error(balanceBelowKeepText.value))
  if (decimal(max.value).lessThanOrEqualTo(0)) return callback(new Error(t('card.index.transfer.noAvailableBalance')))
  if (decimal(max.value).lessThan(min.value)) return callback(new Error(maximumBelowMinimumText.value))
  if (!canTransfer.value) return callback(new Error(t('card.index.transfer.insufficientCardBalance')))
  if (value === null || value === undefined || value === '') return callback(new Error(t('card.index.transfer.enterTransferOutAmount')))
  const amount = decimal(value)
  if (amount.lessThanOrEqualTo(0)) return callback(new Error(t('card.index.transfer.amountGreaterThanZero', { action: t('card.index.transfer.transferOut'), amount: '$0' })))
  if (amount.lessThan(min.value)) return callback(new Error(t('card.index.transfer.amountBelowMinimum', { action: t('card.index.transfer.transferOut'), amount: `$${min.value}` })))
  if (amount.greaterThan(max.value)) return callback(new Error(t('card.index.transfer.amountAboveMaximum', { action: t('card.index.transfer.transferOut'), amount: `$${max.value}` })))
  callback()
}

const pup = reactive({
  status: false,
  title: t('card.index.transfer.transferOut'),
  width: 440,
  labelPosition: 'top',
  form: defaultForm(),
  rules: {
    amount: [{ validator: validateAmount, trigger: 'change' }],
  },
  actions: [
    {
      label: t('card.index.transfer.confirmTransferOut'),
      disabled: (form) => !isAmountValid(form.amount),
      click: async (pupData) => {
        try {
          if (!row.value.id) throw new Error(t('card.index.transfer.cardInfoInvalid'))
          const amount = decimal(pupData.form.amount)
          if (amount.lessThanOrEqualTo(0)) {
            throw new Error(t('card.index.transfer.amountGreaterThanZero', { action: t('card.index.transfer.transferOut'), amount: '$0' }))
          }
          if (amount.lessThan(min.value)) {
            throw new Error(t('card.index.transfer.amountBelowMinimum', { action: t('card.index.transfer.transferOut'), amount: `$${min.value}` }))
          }
          if (amount.greaterThan(max.value)) {
            throw new Error(t('card.index.transfer.amountAboveMaximum', { action: t('card.index.transfer.transferOut'), amount: `$${max.value}` }))
          }
          await cardApi.vccOut({ cardId: row.value.id, amount: pupData.form.amount })
          message(t('card.index.transfer.transferOutSuccess'))
          pupData.status = false
          userStore.getUserInfo()
          emit('on-update', row.value.id)
        } catch (error) {
          message(error?.msg || error?.message || t('card.index.transfer.transferOutFailed'), 'error')
        } finally {
          pupData.loading = false
        }
      },
    },
  ],
})

const open = (currentRow = {}) => {
  row.value = currentRow
  pup.form = defaultForm()
  pup.status = true
  if (!canTransfer.value) return
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
.transfer-form {
  display: flex;
  flex-direction: column;
  gap: 22px;
}
.transfer-meta {
  overflow: hidden;
  border: 1px solid #d8e1f0;
  border-radius: var(--ui-radius-lg);
  background: #fff;
  box-shadow: 0 3px 10px rgba(30, 59, 119, 0.05);
}
.meta-row {
  min-width: 0;
  padding: 15px 16px 16px;

  &:first-child {
    position: relative;
    overflow: hidden;
    background:
      radial-gradient(circle at 12% -20%, rgba(255, 255, 255, 0.8), transparent 38%),
      linear-gradient(125deg, #f2f6ff 0%, #e9f0ff 52%, #e2edff 100%);
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.72);

    &::before,
    &::after {
      position: absolute;
      border-radius: var(--ui-radius-circle);
      filter: blur(30px);
      content: '';
      pointer-events: none;
    }

    &::before {
      top: -58px;
      right: -18px;
      width: 148px;
      height: 126px;
      background: rgba(68, 201, 255, 0.18);
    }

    &::after {
      right: 72px;
      bottom: -70px;
      width: 142px;
      height: 116px;
      background: rgba(139, 103, 255, 0.13);
    }

    .meta-label {
      margin-bottom: 8px;
      color: #71809b;
    }

    .meta-label,
    .meta-value {
      position: relative;
      z-index: 1;
    }
  }

  & + & {
    display: grid;
    min-height: 48px;
    grid-template-columns: auto minmax(0, 1fr);
    align-items: center;
    gap: 16px;
    padding: var(--ui-padding-10-14);
    border-top: 0;
    background: #fff;

    .meta-label {
      margin-bottom: 0;
    }

    .meta-value {
      text-align: right;
    }
  }
}
.meta-label {
  display: block;
  margin-bottom: 6px;
  color: #7c889b;
  font-size: 12px;
  line-height: 1;
}
.meta-value {
  display: block;
  overflow: hidden;
  color: #344158;
  font-size: 13px;
  font-variant-numeric: tabular-nums;
  text-overflow: ellipsis;
  white-space: nowrap;

  &--money {
    display: flex;
    align-items: baseline;
    gap: 5px;
    color: #2856c7;
    font-size: 20px;
    font-weight: 700;
    line-height: 1.2;
    letter-spacing: 0.2px;
  }
}
.currency-symbol {
  font-size: 14px;
  font-weight: 600;
  opacity: 0.86;
}
.amount-panel {
  :deep(.ivu-input-number-handler-wrap) {
    display: none;
  }

  :deep(.ivu-input-number-input) {
    padding-right: 54px;
    font-weight: 700 !important;
  }
}
.amount-input {
  position: relative;
}
.all-button {
  position: absolute;
  top: 50%;
  right: 4px;
  height: var(--ui-size-32);
  padding: var(--ui-padding-0-10) !important;
  transform: translateY(-50%);
}
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

  &.is-disabled .amount-currency {
    color: #c5cbd6;
    transform: translateY(-1px);
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
.transfer-card > .transfer-notice {
  margin: 4px 15px 15px;
}
</style>
