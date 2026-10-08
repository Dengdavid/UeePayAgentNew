<template>
  <FormPupBox ref="pupRef" :pup="pup">
    <template #default="{ form }">
      <div class="funds-form">
        <div class="funds-direction">
          <div class="funds-account funds-account-main">
            <span>{{ $t('card.index.sharedManagement.sourceAccount') }}</span>
            <div class="funds-account-name">
              <strong :title="$t('card.index.sharedManagement.mainAccount')">{{ $t('card.index.sharedManagement.mainAccount') }}</strong>
            </div>
          </div>
          <span class="direction-arrow" aria-hidden="true"><Icon type="md-arrow-forward" /></span>
          <div class="funds-account">
            <span>{{ $t('card.index.sharedManagement.destinationWallet') }}</span>
            <div class="funds-account-name">
              <strong :title="row.name">{{ row.name }}</strong>
            </div>
          </div>
        </div>
        <FormItemBox class="amount-field" :label="$t('card.index.sharedManagement.transferAmount') + ' (USD)'" prop="amount" :rules="amountRules" isRequired>
          <Alert class="amount-tips" type="warning" show-icon>
            <i18n-t v-if="minAmount?.gt(0)" keypath="card.index.sharedManagement.transferAmountRange" tag="p" class="amount-tip-line" scope="global">
              <template #min><UiMoney :value="minAmount?.toString()" :decimals="3" empty-text="-" /></template>
              <template #max><UiMoney :value="maxAmount.toString()" :decimals="3" empty-text="-" /></template>
            </i18n-t>
            <i18n-t v-else keypath="card.index.sharedManagement.maxTransferAmount" tag="p" class="amount-tip-line" scope="global">
              <template #amount><UiMoney :value="maxAmount.toString()" :decimals="3" empty-text="-" /></template>
            </i18n-t>
            <p v-if="minAmount === null" class="amount-tip-line">{{ $t('card.index.sharedManagement.autoRechargeSettingsInvalid') }}</p>
          </Alert>
          <div class="amount-input-line" dir="ltr">
            <span class="amount-currency">$</span>
            <FormNumber
              ref="amountInputRef"
              size="large"
              v-model="form.amount"
              inputmode="decimal"
              type="number"
              :min="minNumber"
              :precision="3"
              :max="maxNumber"
              :disabled="amountUnavailable"
              :clearable="false"
              :placeholder="$t('card.index.transfer.enterAmount')"
            />
            <Button type="text" class="amount-action" :disabled="!form.amount && amountUnavailable" @click="handleAmountAction(maxNumber)">
              {{ form.amount ? $t('card.index.common.clear') : $t('card.index.common.all') }}
            </Button>
          </div>
        </FormItemBox>
        <section class="balance-preview">
          <h4>{{ $t('card.index.sharedManagement.balancePreview') }}</h4>
          <dl class="balance-row">
            <dt>
              {{ $t('card.index.sharedManagement.mainAccount') }}
              <router-link :to="{ name: 'ucenter_deposit' }" @mousedown.prevent @click="close">{{ $t('card.index.transfer.recharge') }}</router-link>
            </dt>
            <dd dir="ltr">
              <UiMoney :value="user.money" :decimals="3" empty-text="-" />
              <Icon type="md-arrow-forward" class="preview-arrow" aria-hidden="true" />
              <strong :aria-label="$t('card.index.sharedManagement.afterOperation')"><UiMoney :value="balancePreview?.main" :decimals="3" empty-text="-" /></strong>
            </dd>
          </dl>
          <dl class="balance-row">
            <dt>{{ row.name }}</dt>
            <dd dir="ltr">
              <UiMoney :value="row.amount" :decimals="3" empty-text="-" />
              <Icon type="md-arrow-forward" class="preview-arrow" aria-hidden="true" />
              <strong :aria-label="$t('card.index.sharedManagement.afterOperation')"><UiMoney :value="balancePreview?.wallet" :decimals="3" empty-text="-" /></strong>
            </dd>
          </dl>
        </section>
        <p class="preview-notice">
          <Icon type="md-information-circle" aria-hidden="true" />
          <span>{{ $t('card.index.sharedManagement.previewNotice') }}</span>
        </p>
      </div>
    </template>
  </FormPupBox>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, reactive, ref, watch } from 'vue'
import { t } from '@/utils'
import Decimal from 'decimal.js'
import { hasPermission } from '@/utils/permission'
import { postApi } from '@/utils/api.js'
import { REQUEST_CONFIG } from '@/api/request.js'
import { message, showRequestError } from '@/utils/message.js'

const props = defineProps({ busy: { type: Boolean, default: false } })
const emit = defineEmits(['success', 'update:busy'])
import { useUserStoreRefs,useUserStore } from '@/utils/store'
const userStore = useUserStore()
const { user } = useUserStoreRefs()
const pupRef = ref(null)
const amountInputRef = ref(null)
const row = ref({})
const minAmount = computed(() => {
  if (Number(row.value.auto_recharge_enabled) !== 1) return new Decimal(0)
  const threshold = row.value.auto_recharge_threshold
  if (threshold == null || threshold === '') return new Decimal(0)
  try {
    const minimumBalance = new Decimal(threshold)
    if (!minimumBalance.isFinite() || minimumBalance.isNegative() || minimumBalance.decimalPlaces() > 3) return null
    if (minimumBalance.isZero()) return new Decimal(0)
    const balance = new Decimal(row.value.amount)
    if (!balance.isFinite()) return null
    return Decimal.max(minimumBalance.minus(balance), 0).toDecimalPlaces(3, Decimal.ROUND_UP)
  } catch {
    return null
  }
})
const submitting = ref(false)
let alive = true
onBeforeUnmount(() => {
  alive = false
  emit('update:busy', false)
})
const submit = (pup) => {
  if (submitting.value) return
  if (amountError(pup.form)) {
    pup.loading = false
    return
  }
  if (!hasPermission('shared_wallet.view') || !hasPermission('shared_wallet.transfer')) {
    pup.loading = false
    return
  }
  submitting.value = true
  postApi('/vcc/SharedWallet/transfer',pup.form)
    .then((res) => {
      if (!alive) return
      message(t('card.index.sharedManagement.transferSuccess'))
      close()
      emit('success')
    }).catch(error => {
      showRequestError(error)
      if (error?.code === REQUEST_CONFIG.twoFactor.codes.enableGoogle) close()
    }).finally(()=>{
      submitting.value = false
      pup.loading=false
    })
}
//最大数
const maxAmount = computed(() => {
  try {
    const amount = new Decimal(user.value?.money)
    return amount.isFinite() && amount.gt(0) ? amount.toDecimalPlaces(3, Decimal.ROUND_DOWN) : new Decimal(0)
  } catch {
    return new Decimal(0)
  }
})
const maxNumber = computed(() => maxAmount.value.toNumber())
const minNumber = computed(() => minAmount.value?.toNumber() ?? 0)
const amountUnavailable = computed(() => minAmount.value === null || maxAmount.value.lt(minAmount.value))

const pup = reactive({
  status: false,
  get title() { return t('card.index.sharedManagement.transferTitle') },
  width: 540,
  loading: false,
  maskClosable: false,
  form:{
    amount: null
  },
  labelPosition: 'top',
  actions: [
    {
      get label() { return t('button.confirm') },
      disabled: form => Boolean(amountError(form)),
      click: submit
    }
  ],
})

const balancePreview = computed(() => {
  try {
    const main = new Decimal(user.value?.money)
    const wallet = new Decimal(row.value.amount)
    const amount = new Decimal(pup.form?.amount ?? 0)
    if (minAmount.value === null || ![main, wallet, amount].every(value => value.isFinite()) || amount.isNegative() || amount.gt(maxAmount.value) || amount.decimalPlaces() > 3 || (amount.gt(0) && amount.lt(minAmount.value))) return null
    return {
      main: main.minus(amount).toString(),
      wallet: wallet.plus(amount).toString(),
    }
  } catch {
    return null
  }
})
watch(() => pup.status || submitting.value, busy => emit('update:busy', busy), { flush: 'sync' })

//点击全部
const handleAmountAction = async (money) => {
  if(pup.form.amount){
    pup.form.amount = null
  }else{
    pup.form.amount = Number(money ?? 0)
  }
  await nextTick()
  pupRef.value?.validateField('amount')
}
const amountError = (form) => {
  if (minAmount.value === null) return t('card.index.sharedManagement.autoRechargeSettingsInvalid')
  try {
    const amount = new Decimal(form.amount)
    if (!amount.isFinite() || !amount.gt(0) || amount.decimalPlaces() > 3) return t('card.index.sharedForm.amountInvalid')
    if (amount.lt(minAmount.value)) return t('card.index.transfer.amountBelowMinimum', { action: t('card.index.sharedManagement.transfer'), amount: `$${minAmount.value.toFixed(3)}` })
    if (amount.gt(maxAmount.value)) return t('card.index.sharedManagement.exceedsBalance')
    return ''
  } catch {
    return t('card.index.sharedForm.amountInvalid')
  }
}
const amountRules = [{
  validator: (rule, value, callback) => {
    if (value == null || value === '') return callback()
    const error = amountError({ amount: value })
    callback(error ? new Error(error) : undefined)
  },
  trigger: 'change,blur',
}]
const open = async (currentRow = {}) => {
  if (props.busy || submitting.value || !hasPermission('shared_wallet.view') || !hasPermission('shared_wallet.transfer')) return
  if(!currentRow.id){
    return message(t('card.index.sharedManagement.invalidData'),'error')
  }
  row.value = {...currentRow}
  pup.form = {
    shared_wallet_id:currentRow?.id || '',
    amount:null,
  }
  pup.status = true
  pup.loading=true
  await userStore?.getUserInfo?.()
  await nextTick()
  amountInputRef.value?.$el?.querySelector('input')?.focus()
  pup.loading=false
}
const close = () => { pup.status = false }
defineExpose({ open, close })
</script>

<style lang="less" scoped>
.funds-form {
  padding: 0 8px;
  color: var(--ui-color-text);

  .funds-direction {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr);
    align-items: center;
    gap: var(--ui-space-16);
    margin-bottom: var(--ui-space-16);
    padding: var(--ui-space-20);
    border: var(--ui-border-primary-subtle);
    border-radius: var(--ui-radius-6);
    background: var(--ui-color-surface-subtle);

    .funds-account {
      min-width: 0;

      span {
        display: block;
        margin-bottom: var(--ui-space-6);
        color: var(--ui-color-text-muted);
        font-size: var(--ui-font-size-xs);
      }

      .funds-account-name {
        display: flex;
        align-items: center;
        gap: var(--ui-space-8);

        &::before {
          content: '';
          flex-shrink: 0;
          width: var(--ui-size-8);
          height: var(--ui-size-8);
          border-radius: var(--ui-radius-circle);
          background: var(--ui-color-primary);
        }
      }

      strong {
        display: block;
        min-width: 0;
        font-size: var(--ui-font-size-lg);
        font-weight: var(--ui-font-weight-semibold);
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
      }

      &.funds-account-main .funds-account-name::before {
        background: var(--ui-color-success);
      }

      &:last-child {
        text-align: end;

        .funds-account-name {
          justify-content: flex-end;

          &::before {
            order: 1;
          }
        }
      }
    }

    .direction-arrow {
      display: flex;
      align-items: center;
      justify-content: center;
      width: var(--ui-size-40);
      height: var(--ui-size-40);
      border: var(--ui-border-primary-subtle);
      border-radius: var(--ui-radius-circle);
      color: var(--ui-color-text-subtle);
      background: var(--ui-color-surface);
      box-shadow: var(--ui-shadow-surface);
      font-size: var(--ui-font-size-2xl);

      &:dir(rtl) {
        transform: scaleX(-1);
      }
    }
  }

  .amount-field {
    margin-bottom: 24px;

    :deep(.ivu-form-item-error-tip) {
      position: absolute;
      top: 100%;
      width: 100%;
      padding-top: 4px;
      line-height: 14px;
    }

    &.ivu-form-item-error {
      .amount-input-line {
        &, &:hover {
          border-color: var(--ui-input-error-border-color);
        }

        &:focus-within {
          border-color: var(--ui-input-error-border-color-focus);
          box-shadow: var(--ui-shadow-focus-error);
        }
      }
    }

    .amount-input-line {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 6px 12px;
      border: var(--ui-border-width) var(--ui-border-style) var(--ui-input-border-color);
      border-radius: var(--ui-input-radius);
      transition:
        border-color var(--ui-control-transition-duration) var(--ui-ease-standard),
        box-shadow var(--ui-control-transition-duration) var(--ui-ease-standard);

      &:hover {
        border-color: var(--ui-input-border-color-hover);
      }

      &:focus-within {
        border-color: var(--ui-input-border-color-focus);
        box-shadow: var(--ui-input-focus-shadow);
      }

      .amount-currency {
        flex-shrink: 0;
        font-size: 24px;
      }

      :deep(.ivu-input-number) {
        flex: 1;
        min-width: 0;
        border: 0;
        background: transparent;
        box-shadow: none;

        .ivu-input-number-input {
          padding: 0;
          background: transparent;
          font-size: 24px;
          font-variant-numeric: tabular-nums;
        }

        .ivu-input-number-handler-wrap {
          display: none;
        }
      }

      .amount-action {
        flex-shrink: 0;
        height: auto;
        min-height: 32px;
        max-width: 40%;
        padding-inline: 12px 0;
        border-inline-start: var(--ui-border-subtle);
        border-radius: 0;
        color: var(--ui-color-primary);
        white-space: normal;
      }
    }

  }

  .amount-tips {
    margin-bottom: 12px;

    :deep(.ui-money) {
      font-weight: 600;
    }

    .amount-tip-line {
      margin: 0;

      & + .amount-tip-line {
        margin-top: 4px;
      }
    }
  }

  .balance-preview {
    margin-top: 16px;

    h4 {
      margin-bottom: 8px;
      font-size: 14px;
      font-weight: 600;
    }

    .balance-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 8px 16px;
      padding-block: 14px;
      border-top: var(--ui-border-subtle);

      dt {
        min-width: 0;
        overflow-wrap: anywhere;

        a {
          margin-inline-start: 8px;
          font-size: 12px;
          white-space: nowrap;
        }
      }

      dd {
        display: flex;
        align-items: center;
        justify-content: flex-end;
        flex-wrap: wrap;
        gap: 12px;
        margin-inline-start: auto;
        font-variant-numeric: tabular-nums;

        .preview-arrow {
          color: var(--ui-color-text-muted);
        }
      }
    }
  }

  .preview-notice {
    display: flex;
    align-items: flex-start;
    gap: 8px;
    padding-top: 12px;
    border-top: var(--ui-border-subtle);
    color: var(--ui-color-text-secondary);
    font-size: 12px;
    line-height: 1.6;

    .ivu-icon {
      flex-shrink: 0;
      margin-top: 2px;
      font-size: 16px;
    }
  }

  :deep(.ui-money-currency) {
    font-size: 1em;
  }

  @media (max-width: 575px) {
    padding: 0;

    .amount-field {
      margin-bottom: 40px;
    }

    .funds-direction {
      gap: var(--ui-space-12);
      padding: var(--ui-space-16);

      .funds-account strong {
        font-size: var(--ui-font-size-md);
      }
    }

    .balance-preview .balance-row {
      align-items: flex-start;
      flex-direction: column;

      dd {
        max-width: 100%;
      }
    }
  }
}
</style>
