<template>
  <UiPage isNotTitle>
    <div class="marketing-page">
      <UiCell :title="$t('marketing.dataOverview')">
        <FormListBox :list="2">
          <CardTotalBox
            icon="icon-CRMEB-zichan-mianxing"
            :list="cardOverviewList"
            :title="$t('marketing.cardData')"
          />
          <CardTotalBox
            icon="icon-CRMEB-fangkeshu-mianxing-2"
            :list="memberOverviewList"
            :title="$t('marketing.memberData')"
          />
        </FormListBox>
      </UiCell>

      <UiCell :title="$t('marketing.revenueEstimate')">
        <template #btn>
          <TabsDayBox @change="handleTabsChange" />
        </template>
        <CardTotalBox
          icon="icon-fukuanshenqingicon"
          :list="revenueList"
          :list-number="3"
        >
          <template #title>
            <div class="revenue-title">
              <span>{{ $t('marketing.types.total') }} ( $ {{ statistics.revenue.total ?? 0 }} )</span>
              <span
                v-if="statistics.revenue.remark"
                class="revenue-remark"
                :title="statistics.revenue.remark"
              >
                {{ statistics.revenue.remark }}
              </span>
            </div>
          </template>
        </CardTotalBox>
      </UiCell>

      <UiCell :title="$t('marketing.consumptionTrend')">
        <UiCounts
          :data="consumptionOverview"
          :list="consumptionOverviewList"
          :loading="loading"
        />
        <div class="chart-box">
          <EChartBoxLine :x-data="chartData.xData" :y-data="chartData.yData" />
        </div>
      </UiCell>

      <Spin fix v-if="loading" />
    </div>
  </UiPage>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { format, subDays } from 'date-fns'
import EChartBoxLine from '@/components/echarts/EChartBoxLine.vue'
import TabsDayBox from '@/components/com/TabsDayBox.vue'
import { getApi } from '@/utils/api.js'
import { message } from '@/utils/message.js'
import { t } from '@/utils'

const loading = ref(false)

const search = reactive({
  quick_type: 0,
  start_date: format(subDays(new Date(), 7), 'yyyy-MM-dd'),
  end_date: format(new Date(), 'yyyy-MM-dd'),
})

const statistics = reactive({
  cards: {},
  users: {},
  revenue: {},
  consumptionSummary: {},
})

const chartData = reactive({
  xData: [],
  yData: [],
})

const normalizeObject = value => (
  value && typeof value === 'object' && !Array.isArray(value) ? value : {}
)

const formatChartDate = (value) => {
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? String(value ?? '') : format(date, 'MM-dd')
}

const cardOverviewList = computed(() => [
  { label: t('marketing.cardTotal'), value: statistics.cards.total },
  { label: t('marketing.cardBalance'), value: statistics.cards.balance, decimals: 2 },
  { label: t('marketing.cardFrozen'), value: statistics.cards.frozen },
  { label: t('marketing.cardCancelled'), value: statistics.cards.cancelled },
])

const memberOverviewList = computed(() => [
  { label: t('marketing.memberTotal'), value: statistics.users.total },
  { label: t('marketing.memberBalance'), value: statistics.users.total_money, decimals: 3 },
])

const revenueList = computed(() => [
  {
    label: `${t('marketing.types.account_depost_amount')}($)`,
    value: statistics.revenue.account_depost_amount ?? 0,
    decimals: 2,
  },
  {
    label: `${t('marketing.types.create_amount')}($)`,
    value: statistics.revenue.create_amount ?? 0,
    decimals: 2,
  },
  {
    label: `${t('marketing.types.card_depost_amount')}($)`,
    value: statistics.revenue.card_depost_amount ?? 0,
    decimals: 2,
  },
  {
    label: `${t('marketing.types.auth_amount')}($)`,
    value: statistics.revenue.auth_amount ?? 0,
    decimals: 2,
  },
  {
    label: `${t('marketing.types.foreign_amount')}($)`,
    value: statistics.revenue.foreign_amount ?? 0,
    decimals: 2,
  },
  {
    label: `${t('marketing.types.buy_group_amount')}($)`,
    value: statistics.revenue.buy_group_amount ?? 0,
    decimals: 2,
  },
])

const consumptionOverview = computed(() => ({
  newCardCount: statistics.cards.new_in_range ?? 0,
  newUserCount: statistics.users.new ?? 0,
  transactionCount: statistics.consumptionSummary.total_count ?? 0,
  transactionAmount: statistics.consumptionSummary.total_amount ?? 0,
}))

const consumptionOverviewList = computed(() => [
  { label: t('marketing.newCardCount'), prop: 'newCardCount', decimals: 0 },
  { label: t('marketing.newUserCount'), prop: 'newUserCount', decimals: 0 },
  { label: t('marketing.transactionCount'), prop: 'transactionCount', decimals: 0 },
  { label: t('marketing.transactionAmount'), prop: 'transactionAmount', decimals: 3 },
])

const getData = async () => {
  loading.value = true
  try {
    const response = normalizeObject(await getApi('/user/agentSite/statistics', search))
    const consumption = Array.isArray(response.consumption) ? response.consumption : []

    statistics.cards = normalizeObject(response.cards)
    statistics.users = normalizeObject(response.users)
    statistics.revenue = normalizeObject(response.revenue)
    statistics.consumptionSummary = normalizeObject(response.consumption_summary)
    chartData.xData = consumption.map(item => formatChartDate(item?.date))
    chartData.yData = consumption.map(item => item?.amount ?? 0)
  } catch (error) {
    message(error, 'error')
  } finally {
    loading.value = false
  }
}

const handleTabsChange = (dateRange) => {
  search.start_date = dateRange.start
  search.end_date = dateRange.end
  getData()
}

onMounted(getData)
</script>

<style lang="less" scoped>
.marketing-page {
  position: relative;
  min-height: 360px;
}

.revenue-title {
  display: flex;
  flex: 1;
  align-items: center;
  justify-content: space-between;
  min-width: 0;
  gap: 16px;
}

.revenue-remark {
  overflow: hidden;
  color: var(--ui-color-text-secondary);
  font-size: 12px;
  font-weight: 400;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.chart-box {
  height: 300px;
  margin-top: 16px;
  overflow: hidden;
}

@media (max-width: 767px) {
  .revenue-title {
    align-items: flex-start;
    flex-direction: column;
    gap: 4px;
  }

  .revenue-remark {
    max-width: 100%;
  }
}
</style>
