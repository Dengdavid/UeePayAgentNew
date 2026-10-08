<template>
  <span class="ui-money" :class="colorClass" dir="ltr">
    <template v-if="loading"><small v-if="currency" class="ui-money-currency">{{ currency }}</small>-</template>
    <template v-else-if="formatted"><small v-if="currency" class="ui-money-currency">{{ formatted.sign }}{{ currency }}</small><template v-else>{{ formatted.sign }}</template>{{ formatted.number }}</template>
    <template v-else>{{ emptyText }}</template>
  </span>
</template>

<script setup>
import { computed } from 'vue'
import Decimal from 'decimal.js'

const props = defineProps({
  value: { type: [String, Number], default: null },
  currency: { type: String, default: '$' },
  decimals: { type: Number, default: undefined },
  minDecimals: { type: Number, default: 0 },
  signed: { type: Boolean, default: false },
  tone: { type: String, default: 'default', validator: value => ['default', 'negative', 'signed'].includes(value) },
  emptyText: { type: String, default: '—' },
  loading: { type: Boolean, default: false },
})

const formatted = computed(() => {
  if (!['string', 'number'].includes(typeof props.value) || !/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?$/i.test(String(props.value).trim())) return null
  try {
    const amount = new Decimal(String(props.value).trim())
    if (!amount.isFinite()) return null
    const negative = amount.lt(0)
    const positive = amount.gt(0)
    const fixed = props.decimals === undefined
      ? amount.abs().toDecimalPlaces(3).toFixed()
      : props.decimals === null ? amount.abs().toFixed() : amount.abs().toFixed(props.decimals)
    const [integer, fraction = ''] = fixed.split('.')
    const decimal = props.decimals === undefined
      ? fraction.padEnd(2, '0')
      : props.decimals === null ? fraction.padEnd(props.minDecimals, '0') : fraction
    return {
      negative,
      positive,
      sign: negative ? '-' : props.signed && positive ? '+' : '',
      number: `${integer}${decimal ? `.${decimal}` : ''}`,
    }
  } catch {
    return null
  }
})

const colorClass = computed(() => {
  if (props.loading || !formatted.value || props.tone === 'default') return ''
  if (formatted.value.negative) return 'is-negative'
  return props.tone === 'signed' && formatted.value.positive ? 'is-positive' : ''
})
</script>

<style lang="less" scoped>
.ui-money {
  font-family: inherit;
  font-weight: inherit;
  white-space: nowrap;

  .ui-money-currency {
    font-size: .75em;
    font-weight: inherit;
    margin-inline-end: 0.25em;
  }

  &.is-negative { color: var(--ui-color-error); }
  &.is-positive { color: var(--ui-color-success); }
}
</style>
