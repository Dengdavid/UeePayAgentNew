<template>
  <div class="card-fee-section">
    <div v-if="bin.id" class="fee-input-section mb-10">
      <h3 class="mb-20">{{ $t('card.index.opening.feeInfo.title') }}</h3>
      <Row :gutter="20">
        <Col :xs="24" :sm="12">
          <div class="mb-10">
            {{ $t('card.index.opening.feeInfo.cardQuantity') }}<span class="ui-text-grey">（{{ $t('cardTag.cardsUnit') }}）</span>
          </div>
          <FormNumber
            v-model="cardNumber"
            :max="numberMax"
            :min="1"
            :precision="0"
            :active-change="false"
            :placeholder="$t('card.index.opening.feeInfo.cardQuantityPlaceholder')"
            class="fee-input"
          />
          <p class="mt-5 ui-text-sub list-r-4">
            <template v-if="bin.allow_create_count >= 0">
              <span>{{ $t('card.index.opening.feeInfo.remainingBinCapacity') }}</span>
              <span class="ui-text-warning">{{ bin.allow_create_count }}</span>
              <span>{{ $t('cardTag.cardUnit', { count: bin.allow_create_count }) }},</span>
            </template>
            <template v-if="expenseDetails.free_cards_nums > 0">
              <span>{{ $t('card.index.opening.feeInfo.remainingFreeSlots') }}</span>
              <span class="ui-text-warning">{{ expenseDetails.free_cards_nums }}</span>
              <span>{{ $t('cardTag.cardUnit', { count: expenseDetails.free_cards_nums }) }},</span>
            </template>
            <span>{{ $t('card.index.opening.feeInfo.remainingAvailableSlots') }}</span>
            <span class="ui-text-warning">
              {{ maxNum === Infinity ? $t('card.index.opening.feeInfo.unlimited') : maxNum }}
            </span>
            <span>{{ $t('cardTag.cardUnit', { count: maxNum === Infinity ? 2 : maxNum }) }}</span>
          </p>
        </Col>

        <Col :xs="24" :sm="12">
          <div class="mb-10 flex-b-c mt-10-mobile">
            <p>
              {{ $t('card.index.opening.feeInfo.transferInAmount') }}
              <span class="ui-text-grey">
                （{{ $t('card.index.opening.feeInfo.availableBalance') }} <span class="ml-5 ui-text-warning">${{ balance }}</span>）
              </span>
            </p>
          </div>
          <FormNumber
            v-model="amountValue"
            :precision="2"
            :active-change="false"
            :min="rechargeLimit.min"
            :max="rechargeLimit.max"
            :placeholder="$t('card.index.opening.feeInfo.amountPlaceholder')"
            class="fee-input"
          />
          <p class="mt-5 ui-text-sub list-r-4">
            <template v-if="rechargeLimit.min > 0">
              <span>{{ $t('card.index.opening.feeInfo.minimumTransferIn') }}</span>
              <span class="ui-text-warning">${{ rechargeLimit.min.toFixed(2) }}</span>
              <span>，</span>
            </template>
            <span>{{ $t('card.index.opening.feeInfo.maximumTransferIn') }}</span>
            <span v-if="rechargeLimit.max === Infinity" class="ui-text-warning">{{ $t('card.index.opening.feeInfo.unlimited') }}</span>
            <span v-else class="ui-text-warning">${{ rechargeLimit.max.toFixed(2) }}</span>
          </p>
        </Col>
      </Row>
    </div>

    <Teleport to="body" :disabled="!isPhone">
      <div
        class="fee-detail-section mb-40"
        :class="{ 'is-keyboard-open': isKeyboardOpen }"
        :style="{ '--keyboard-offset': `${keyboardOffset}px` }"
      >
        <div class="fee-summary-bar">
          <div class="fee-summary-main">
            <div class="fee-amount-block">
              <span class="fee-summary-label">{{ $t('card.index.opening.feeInfo.total') }}</span>
              <div class="fee-summary-value">
                <span class="fee-currency">$</span>
                <strong>{{ expenseDetails.totalExpenses || '0.000' }}</strong>
                <button class="fee-detail-trigger" type="button" @click="showDetails = true">
                  <span>{{ $t('card.index.opening.feeInfo.viewDetails') }}</span>
                  <Icon type="ios-arrow-forward" />
                </button>
              </div>
            </div>
          </div>
          <div v-if="$slots.actions" class="fee-summary-actions">
            <slot name="actions" />
          </div>
        </div>
        <div v-if="$slots.status" class="fee-summary-status">
          <slot name="status" />
        </div>
      </div>
    </Teleport>

    <Modal
      v-model="showDetails"
      :title="$t('card.index.opening.feeInfo.details')"
      :width="860"
      :footer-hide="true"
      class-name="vertical-center-modal fee-detail-modal"
    >
      <div class="fee-modal-summary">
        <div>
          <p>{{ $t('card.index.opening.feeInfo.currentTotal') }}</p>
          <strong><small>$</small>{{ expenseDetails.totalExpenses || '0.000' }}</strong>
        </div>
        <span>{{ $t('cardTag.cardCount', { count: expenseDetails.details?.length || 0 }) }}</span>
      </div>
      <div v-if="isPhone" class="fee-mobile-list">
        <article
          v-for="(row, index) in expenseDetails.details || []"
          :key="index"
          class="fee-mobile-item"
        >
          <header>{{ $t('card.index.opening.feeInfo.cardSequence', { index: index + 1 }) }}</header>
          <dl>
            <div>
              <dt>{{ $t('card.index.opening.feeInfo.cardOpeningFee') }}</dt>
              <dd>
                <template v-if="!hasFeeDiscount(row)">$ {{ row.fee }}</template>
                <template v-else>
                  <span>$ {{ row.fee }}</span>
                  <s>$ {{ row.oldFee }}</s>
                </template>
                <small v-if="row.isFreeCard">
                  {{ $t('cardTag.firstCardsFree', { count: expenseDetails.free_cards_nums }) }}
                </small>
              </dd>
            </div>
            <div>
              <dt>{{ $t('card.index.opening.feeInfo.transferInAmount') }}</dt>
              <dd>{{ row.rechargeAmount === '0.000' ? '-' : `$ ${row.rechargeAmount}` }}</dd>
            </div>
            <div>
              <dt>{{ $t('card.index.opening.feeInfo.handlingFee') }}</dt>
              <dd>
                <span>
                  {{ formatRechargeHandlingFee(row) === $t('card.index.opening.feeInfo.free')
                    ? $t('card.index.opening.feeInfo.free')
                    : formatRechargeHandlingFee(row) === '-'
                      ? '-'
                      : `$ ${formatRechargeHandlingFee(row)}` }}
                </span>
                <small>{{ $t('card.index.opening.feeInfo.rate', { rate: expenseDetails.card_depost_fee || 0 }) }}</small>
              </dd>
            </div>
          </dl>
        </article>
      </div>
      <Table
        v-else
        :columns="columns"
        :data="expenseDetails.details || []"
        max-height="360"
        size="small"
      >
        <template #fee="{ row }">
          <template v-if="!hasFeeDiscount(row)">
            {{ row.fee }}
          </template>
          <div v-else class="list-r-8">
            <span>{{ row.fee }}</span>
            <s class="ui-text-grey">{{ row.oldFee }}</s>
          </div>
        </template>
        <template #rechargeAmount="{ row }">
          {{ row.rechargeAmount === '0.000' ? '-' : row.rechargeAmount }}
        </template>
        <template #rechargeHandlingFee="{ row }">
          {{ formatRechargeHandlingFee(row) }}
        </template>
      </Table>
      <p class="fee-modal-note">{{ $t('card.index.opening.feeInfo.finalAmountNotice') }}</p>
    </Modal>
  </div>
</template>

<script setup>
import { evaluateAndFormat, evaluateExpression } from '@/utils/decimal-expression-evaluator.js'
import { isPhone } from '@/utils/device.js'
import { useKeyboardViewportOffset } from '@/composables/useKeyboardViewportOffset.js'
import { computed, ref, watch } from 'vue'
import { t } from '@/utils'

const props = defineProps({
  number: {
    type: Number,
    default: 1,
  },
  amount: {
    type: Number,
    default: null,
  },
  bin: {
    type: Object,
    default: () => ({}),
  },
  balance: {
    type: [Number, String],
    default: 0,
  },
  maxNum: {
    type: Number,
    default: 0,
  },
  rechargeLimit: {
    type: Object,
    default: () => ({ min: 0, max: Infinity }),
  },
  usedCapacity: {
    type: Number,
    default: 0,
  },
  freeCardsNums: {
    type: Number,
    default: 0,
  },
})

const emit = defineEmits(['update:number', 'update:amount', 'expense-change'])

const cardNumber = computed({
  get: () => props.number,
  set: (value) => emit('update:number', value),
})

const amountValue = computed({
  get: () => props.amount,
  set: (value) => emit('update:amount', value),
})

const showDetails = ref(false)
const { isKeyboardOpen, keyboardOffset } = useKeyboardViewportOffset()

const numberMax = computed(() => Math.min(
  props.maxNum,
  props.bin.allow_create_count >= 0 ? props.bin.allow_create_count : Infinity,
  100,
))

const getFeeRule = (cardIndex, rules) => {
  const ranges = Object.entries(rules)
    .map(([key, data]) => {
      const [minString = 0, maxString = 999999999] = key.split('-')
      return {
        min: Number.parseFloat(minString),
        max: Number.parseFloat(maxString),
        data: {
          fee: data.fee > 0 ? data.fee : 0,
          fee_rate: data.fee_rate > 0 ? data.fee_rate : 0,
        },
      }
    })
    .sort((a, b) => a.min - b.min)

  if (ranges.length) {
    ranges[0].min = Math.min(ranges[0].min, 0)
    ranges[ranges.length - 1].max = Math.max(
      ranges[ranges.length - 1].max,
      999999999,
    )
  }

  return ranges.find((range) => cardIndex >= range.min && cardIndex < range.max)?.data
    || ranges[0]?.data
    || {}
}

const expenseDetails = computed(() => {
  const number = props.number ?? 0
  const amount = props.amount ?? 0
  const usedCapacity = props.usedCapacity ?? 0
  const freeCardsNums = props.freeCardsNums ?? 0
  const bin = props.bin || {}

  let createAmount = bin.create_amount || {}
  if (typeof bin.create_amount === 'number') {
    createAmount = {
      '0-9999999': {
        fee: bin.create_amount,
        fee_rate: 0,
      },
    }
  }

  const cardDepositFee = bin.card_depost_fee
  const inviteDiscountRate = bin.invite_discount_rate
  const details = []
  const rechargeAmount = amount.toFixed(3)
  const rechargeHandlingFee = amount && cardDepositFee
    ? evaluateAndFormat(`${amount}*${cardDepositFee}/100`, 3)
    : '0.000'

  for (let index = 1; index <= number; index += 1) {
    const cardIndex = usedCapacity + index
    if (cardIndex <= freeCardsNums) {
      details.push({
        fee: '0.000',
        isFreeCard: true,
        rechargeAmount,
        rechargeHandlingFee,
      })
      continue
    }

    const cardRow = getFeeRule(cardIndex, createAmount)
    if (!cardRow) continue

    const oldFee = evaluateAndFormat(
      `${cardRow.fee ?? 0}*${cardRow.fee_rate ?? 0}`,
      3,
    )
    const inviteFee = evaluateAndFormat(
      `${oldFee ?? 0}*${inviteDiscountRate ?? 0}/100`,
      3,
    )
    details.push({
      fee: evaluateAndFormat(`${oldFee}-${inviteFee}`, 3),
      oldFee,
      rechargeAmount,
      rechargeHandlingFee,
    })
  }

  const totalExpenses = details.reduce(
    (sum, item) => evaluateExpression(
      `${sum}+${item.fee ?? 0}+${item.rechargeAmount ?? 0}+${item.rechargeHandlingFee ?? 0}`,
    ),
    0,
  ) ?? 0

  return {
    free_cards_nums: freeCardsNums - usedCapacity,
    totalExpenses: totalExpenses.toFixed(3),
    card_depost_fee: cardDepositFee,
    details,
  }
})

watch(
  expenseDetails,
  (value) => emit('expense-change', value),
  { immediate: true, flush: 'sync' },
)

const columns = computed(() => [
  {
    title: t('card.index.opening.feeInfo.sequence'),
    type: 'index',
    width: 90,
    align: 'center',
  },
  {
    title: t('card.index.opening.feeInfo.cardOpeningFeeCurrency'),
    key: 'fee',
    slot: 'fee',
    align: 'center',
  },
  {
    title: t('card.index.opening.feeInfo.transferInAmountCurrency'),
    key: 'rechargeAmount',
    slot: 'rechargeAmount',
    align: 'center',
  },
  {
    title: t('card.index.opening.feeInfo.handlingFeeWithRate', { rate: expenseDetails.value.card_depost_fee || 0 }),
    key: 'rechargeHandlingFee',
    slot: 'rechargeHandlingFee',
    align: 'center',
  },
])

const hasFeeDiscount = (row) => row.oldFee != null && row.fee != row.oldFee

const formatRechargeHandlingFee = (row) => {
  if (row.rechargeAmount === '0.000') return '-'
  return row.rechargeHandlingFee === '0.000' ? t('card.index.opening.feeInfo.free') : row.rechargeHandlingFee
}
</script>

<style scoped lang="less">
.fee-input {
  width: 100%;
}

.fee-detail-section {
  --fee-surface: #f6f8fc;
  --fee-surface-subtle: #f7f9fc;
  --fee-border: #e5eaf2;
  --fee-text-secondary: #728097;
}

.fee-summary-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  min-height: 76px;
  padding: 14px 16px 14px 18px;
  border: 0;
  border-radius: var(--ui-radius-lg);
  background: var(--fee-surface);
  box-shadow: none;
}

.fee-summary-main {
  display: flex;
  align-items: center;
  min-width: 0;
  gap: 16px;
}

.fee-amount-block {
  display: flex;
  align-items: flex-start;
  flex-direction: column;
  gap: 5px;
}

.fee-summary-label {
  color: var(--fee-text-secondary);
  font-size: 12px;
  line-height: 1;
  font-weight: 500;
  letter-spacing: 0.02em;
  white-space: nowrap;
}

.fee-summary-value {
  display: inline-flex;
  align-items: baseline;
  color: var(--error-color);
  font-variant-numeric: tabular-nums;
  white-space: nowrap;

  .fee-detail-trigger {
    align-self: center;
    margin-left: 16px;
    margin-top: 0;
  }

  strong {
    font-size: 24px;
    line-height: 1;
    font-weight: 600;
  }
}

.fee-currency {
  margin-right: 3px;
  font-size: 15px;
  font-weight: 600;
}

.fee-detail-trigger {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  height: var(--ui-size-28);
  margin-top: 12px;
  padding: var(--ui-padding-0-8);
  border: 1px solid var(--fee-border);
  border-radius: var(--ui-radius-lg);
  color: var(--ui-color-neutral-700);
  background: var(--ui-color-surface);
  box-shadow: none;
  white-space: nowrap;
  cursor: pointer;
  transition: color 180ms ease, border-color 180ms ease, background-color 180ms ease;

  &:hover {
    color: var(--primary-color);
    border-color: #d4def2;
    background: #f8faff;
  }

  &:focus-visible {
    outline: var(--ui-outline-primary);
    outline-offset: 2px;
  }
}

.fee-summary-actions {
  flex: none;
}

.fee-summary-status {
  margin-top: 8px;

  &:empty {
    display: none;
  }

  :deep(.order-submit-error) {
    width: 100%;
    max-width: none;
  }
}

.fee-modal-summary {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  margin-bottom: 16px;
  padding: var(--ui-padding-14-16);
  border: var(--ui-border-subtle);
  border-radius: var(--ui-radius-lg);
  background: #f7f9fc;

  p,
  > span {
    color: var(--ui-color-text-muted);
    font-size: 12px;
  }

  strong {
    display: block;
    margin-top: 5px;
    color: var(--error-color);
    font-size: 22px;
    line-height: 1;
  }

  small {
    margin-right: 3px;
    font-size: 13px;
  }
}

.fee-modal-note {
  margin-top: 12px;
  color: var(--ui-color-neutral-550);
  font-size: 12px;
  text-align: center;
}

.fee-mobile-list {
  display: grid;
  gap: 8px;
  max-height: 360px;
  overflow-y: auto;
}

.fee-mobile-item {
  overflow: hidden;
  border: var(--ui-border-muted);
  border-radius: var(--ui-radius-lg);
  background: var(--ui-color-surface);

  header {
    padding: 6px 10px;
    border-bottom: 1px solid #edf1f7;
    background: #f7f9fc;
    color: var(--ui-color-neutral-700);
    font-size: 12px;
    font-weight: 600;
    line-height: 18px;
  }

  dl {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    padding: 10px 4px;
  }

  dl > div {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-start;
    gap: 6px;
    min-width: 0;
    padding: var(--ui-padding-0-6);
    text-align: center;

    & + div {
      border-left: 1px solid #edf1f7;
    }
  }

  dt {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    color: var(--ui-color-control-text);
    font-size: 12px;
    line-height: 17px;
    white-space: nowrap;
  }

  dd {
    display: flex;
    flex-direction: column;
    align-items: center;
    color: var(--ui-color-text);
    font-size: 13px;
    font-variant-numeric: tabular-nums;
    line-height: 18px;
    white-space: nowrap;

    s,
    small {
      color: var(--ui-color-neutral-550);
      font-size: 10px;
      line-height: 14px;
    }
  }
}

@media screen and (max-width: 768px) {
  .mt-10-mobile {
    margin-top: 10px;
  }

  .fee-summary-bar {
    display: grid;
    grid-template-columns: minmax(0, 1fr);
    align-items: center;
    gap: var(--ui-space-6);
    width: 100%;
    max-width: none;
    min-height: 48px;
    margin: 0 auto;
    padding: var(--ui-padding-6);
    background: transparent;
  }

  .fee-summary-actions {
    width: 100%;
  }

  .fee-summary-main {
    display: flex;
    min-width: 0;
    justify-content: flex-start;
  }

  .fee-amount-block {
    width: 100%;
    gap: 4px;
  }

  .fee-summary-label {
    color: var(--ui-color-text-muted);
    font-size: 11px;
  }

  .fee-summary-value {
    justify-content: flex-start;

    .fee-detail-trigger {
      margin-left: 10px;
    }
  }

  .fee-detail-trigger {
    flex: none;
    height: var(--ui-size-22);
    margin-top: 0;
    padding: 0;
    border-color: transparent;
    color: var(--ui-color-neutral-700);
    background: transparent;
    font-size: 12px;

    &:hover {
      border-color: transparent;
      background: #f6f8fc;
    }
  }

  .fee-detail-section {
    position: fixed;
    z-index: 900;
    right: auto;
    bottom: calc(10px + env(safe-area-inset-bottom) + var(--keyboard-offset, 0px));
    left: 50%;
    width: min(calc(100% - 24px), 480px);
    margin: 0 !important;
    box-sizing: border-box;
    padding: var(--ui-padding-6);
    transform: translateX(-50%);
    overflow: hidden;
    border: var(--ui-border-on-dark-muted);
    border-radius: var(--ui-radius-14);
    background: linear-gradient(
      135deg,
      rgba(255, 255, 255, .76) 0%,
      rgba(238, 244, 255, .58) 52%,
      rgba(255, 255, 255, .66) 100%
    );
    box-shadow: var(--ui-shadow-card-visual);
    -webkit-backdrop-filter: blur(9px) saturate(165%);
    backdrop-filter: blur(9px) saturate(165%);
    touch-action: manipulation;
    transition: opacity .18s ease, transform .18s ease, visibility .18s ease;

    &.is-keyboard-open {
      transform: translate(-50%, calc(100% + 24px));
      visibility: hidden;
      opacity: 0;
      pointer-events: none;
    }

    &::before {
      position: absolute;
      inset: 0;
      border-radius: inherit;
      background:
        radial-gradient(circle at 18% 0, rgba(255, 255, 255, .72), transparent 34%),
        linear-gradient(180deg, rgba(255, 255, 255, .24), transparent 54%);
      content: '';
      pointer-events: none;
    }

    > * {
      position: relative;
      z-index: 1;
    }
  }

  .fee-summary-status {
    width: auto;
    max-width: none;
    margin: var(--ui-space-6);

    :deep(.order-submit-error) {
      padding: 5px 8px;
      font-size: 11px;
      line-height: 18px;
    }
  }

  .fee-summary-value strong {
    font-size: 22px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .fee-detail-trigger {
    transition: none;
  }
}

@media (prefers-reduced-transparency: reduce) {
  .fee-detail-section {
    background: var(--ui-color-surface);
    -webkit-backdrop-filter: none;
    backdrop-filter: none;
  }
}
</style>
