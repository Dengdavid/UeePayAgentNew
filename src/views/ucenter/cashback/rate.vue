<template>
  <UiPage isBack :fallback="{ name: 'ucenterCashback' }" ref="pageRef">
    <div class="cashback-rate">
      <template v-if="availableCategories.length">
        <CashbackCategoryTabs
          v-model="selectedCategory"
          :items="categoryTabs"
          :aria-label="$t('cashback.rate.selectCategory')"
          :previous-label="$t('cashback.rate.previousCategory')"
          :next-label="$t('cashback.rate.nextCategory')"
        />
        <section v-if="currentCategory" class="config-section" :aria-label="$t('cashback.rate.tiersAndRates')">
          <Table
            v-if="!isPhone"
            class="cashback-rate-table"
            :columns="columns"
            :data="tableData"
            :border="true"
            :show-header="true"
            :max-height="700"
            :span-method="spanMethod"
            :row-class-name="rowClassName"
            disabled-hover
          />
          <div v-else class="mobile-bin-list">
            <article
              v-for="group in mobileBinGroups"
              :key="group.id"
              class="mobile-bin-card"
            >
              <header class="mobile-bin-header">
                <div>
                  <span>{{ $t('cashback.rate.cardBin') }}</span>
                  <strong>{{ group.binCode }}</strong>
                </div>
                <span>{{ $t('cashback.rate.tierCount', { count: group.tiers.length }) }}</span>
              </header>
              <div v-if="group.tiers.length" class="mobile-tier-list">
                <div v-for="tier in group.tiers" :key="tier.rawRange" class="mobile-tier-row">
                  <div class="mobile-tier-field">
                    <span>{{ $t('cashback.rate.monthlyVolumeRange') }}</span>
                    <strong>{{ tier.range }}</strong>
                  </div>
                  <div class="mobile-tier-field">
                    <span>{{ $t('cashback.rate.rewardConfig') }}</span>
                    <strong>{{ tier.reward }}</strong>
                  </div>
                </div>
              </div>
              <div v-else class="mobile-empty">{{ $t('cashback.rate.noConfig') }}</div>
            </article>
          </div>
        </section>
      </template>
      <UiEmptyBox v-else-if="hasLoaded" :text="$t('cashback.rate.noRates')" />
    </div>
  </UiPage>
</template>

<script setup>
import { computed, ref, onMounted } from 'vue'
import Decimal from 'decimal.js'
import { message } from '@/utils/message.js'
import cardApi from '@/api/card.js'
import { t } from '@/utils'
import { isPhone } from '@/utils/device.js'
import CashbackCategoryTabs from './components/CashbackCategoryTabs.vue'

const categories = ref([])
const selectedCategory = ref('')
const pageRef = ref(null)
const hasLoaded = ref(false)

const availableCategories = computed(() => {
  return categories.value.filter((category) => getBinCount(category) > 0)
})

const categoryTabs = computed(() => {
  return availableCategories.value.map((category) => ({
    value: String(category.id),
    label: `${category.name}(${getBinCount(category)})`,
  }))
})

const currentCategory = computed(() => {
  return availableCategories.value.find((category) => String(category.id) === selectedCategory.value)
})

const tableData = computed(() => {
  return (currentCategory.value?.bins || []).flatMap((bin, groupIndex) => {
    const tierRows = getBinTierRows(bin)
    const rows = tierRows.length
      ? tierRows
      : [{ range: t('cashback.rate.noConfig'), reward: '--' }]

    return rows.map((row, rowIndex) => ({
      ...row,
      binCode: getBinCode(bin),
      groupIndex,
      groupRowSpan: rows.length,
      isGroupStart: rowIndex === 0,
    }))
  })
})

const mobileBinGroups = computed(() => {
  return (currentCategory.value?.bins || []).map((bin) => ({
    id: bin.id,
    binCode: getBinCode(bin),
    tiers: getBinTierRows(bin),
  }))
})

const columns = [
  {
    title: t('cashback.rate.cardBin'),
    key: 'binCode',
    align: 'center',
    width: 160,
  },
  {
    title: t('cashback.rate.monthlyVolumeRange'),
    key: 'range',
    minWidth: 250,
  },
  {
    title: t('cashback.rate.rewardConfig'),
    key: 'reward',
    minWidth: 180,
  },
]

const getBinTierRows = (bin) => {
  const configData = bin?.cashback_fee_config || {}
  if (Object.keys(configData).length === 0) {
    return []
  }

  return Object.entries(configData)
    .map(([range, config]) => {
      const bounds = parseRange(range)
      return {
        rawRange: range,
        min: bounds.min,
        max: bounds.max,
        range: formatRange(bounds),
        reward: formatReward(config),
        config,
      }
    })
    .sort((a, b) => a.min.minus(b.min).toNumber())
}

const spanMethod = ({ row, columnIndex }) => {
  if (columnIndex !== 0) return [1, 1]
  return row.isGroupStart ? [row.groupRowSpan, 1] : [0, 0]
}

const rowClassName = (row) => {
  return `bin-group-${row.groupIndex % 2 === 0 ? 'even' : 'odd'}`
}

const parseRange = (range) => {
  const [minValue = 0, maxValue = 0] = String(range).split('-')
  const min = new Decimal(Number(minValue) || 0)
  const max = String(maxValue).includes('∞')
    ? new Decimal(Infinity)
    : new Decimal(Number(maxValue) || 0)
  return { min, max }
}

const formatRange = ({ min, max }) => {
  if (!max.isFinite()) {
    return `${formatNumber(min, 4)} < x ≤ ∞`
  }
  return `${formatNumber(min, 4)} < x ≤ ${formatNumber(max, 4)}`
}

const formatReward = (config = {}) => {
  const fee = new Decimal(config.fee || 0)
  const ratePercent = new Decimal(config.fee_rate || 0).mul(100)

  if (fee.gt(0)) {
    return `$ ${formatNumber(fee, 2)} + ${formatNumber(ratePercent, 2)}%`
  }
  return `${formatNumber(ratePercent, 2)}%`
}

const getBinCount = (category) => {
  return category?.bins?.length || 0
}

const getBinCode = (bin) => {
  return bin?.name || bin?.bin || '--'
}

const formatNumber = (value, precision = 2) => {
  const decimal = Decimal.isDecimal(value) ? value : new Decimal(value || 0)
  return decimal.toFixed(precision).replace(/\.?0+$/, '')
}

const init = async () => {
  pageRef.value.loading = true
  try {
    const response = await cardApi.getBinCate()
    categories.value = response || []
    hasLoaded.value = true
    if (availableCategories.value.length > 0) {
      selectedCategory.value = String(availableCategories.value[0].id)
    }
  } catch (error) {
    message(t('cashback.message.loadCategoriesFailed'), 'error')
  } finally {
    pageRef.value.loading = false
  }
}

onMounted(() => {
  init()
})
</script>

<style scoped>
.cashback-rate {
  padding: 2px 0 18px;
  color: var(--text-color);
}

.config-section {
  padding-top: 16px;
}

.cashback-rate-table {
  overflow: hidden;
  border: 1px solid var(--ui-color-border-subtle);
  border-right: 0;
  border-bottom: 0;
  border-radius: var(--ui-radius-lg);
}

:deep(.cashback-rate-table .ivu-table-border td),
:deep(.cashback-rate-table .ivu-table-border th) {
  border-right-color: var(--ui-color-border-subtle);
}

:deep(.cashback-rate-table .ivu-table td),
:deep(.cashback-rate-table .ivu-table th) {
  border-bottom-color: var(--ui-color-border-subtle);
}

:deep(.cashback-rate-table .ivu-table::before),
:deep(.cashback-rate-table .ivu-table-border::after) {
  background-color: var(--ui-color-border-subtle);
}

:deep(.cashback-rate-table .ivu-table-row.bin-group-even td) {
  background: var(--white-color);
}

:deep(.cashback-rate-table .ivu-table-row.bin-group-odd td) {
  background: color-mix(in srgb, var(--primary-color) 4%, var(--white-color));
}

:deep(.cashback-rate-table .ivu-table-row td) {
  color: var(--text-color);
  font-weight: 400;
}

.mobile-bin-list {
  display: grid;
  gap: 12px;
}

.mobile-bin-card {
  overflow: hidden;
  border: 1px solid var(--ui-color-border-subtle);
  border-radius: var(--ui-radius-lg);
  background: var(--white-color);
}

.mobile-bin-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  min-height: 46px;
  padding: var(--ui-padding-8-12);
  border-bottom: 1px solid var(--ui-color-border-subtle);
}

.mobile-bin-header > div {
  display: flex;
  align-items: baseline;
  gap: 8px;
}

.mobile-bin-header span,
.mobile-tier-field span {
  color: var(--grey-color);
  font-size: 12px;
}

.mobile-bin-header strong {
  color: var(--text-color);
  font-size: 14px;
}

.mobile-tier-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  gap: 12px;
  padding: var(--ui-padding-12);
}

.mobile-tier-row + .mobile-tier-row {
  border-top: 1px solid var(--ui-color-border-subtle);
}

.mobile-tier-field {
  display: grid;
  gap: 4px;
  min-width: 0;
}

.mobile-tier-field strong {
  overflow-wrap: anywhere;
  color: var(--text-color);
  font-size: 13px;
  font-weight: 500;
}

.mobile-empty {
  padding: 18px 12px;
  color: var(--grey-color);
  text-align: center;
}

</style>
