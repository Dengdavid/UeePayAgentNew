<template>
  <UiPage :tabs="tabs" :tabBtns="tabBtns" :tab-search="tabSearch" :return-state="returnState.tabs" isAuto @tab-change="resetTabState" @init="getInfo">
    <template #title-icon>
      <span class="shared-card-title-icon" aria-hidden="true">
        <Icon custom="iconfont icon-feiyong" :size="12" />
      </span>
    </template>
    <template #tab-search-option="{ row }">
      <span class="wallet-search-option">
        <span class="wallet-search-name" :title="row.name">{{ row.name }}</span>
        <span class="wallet-search-details">
          <UiMoney class="wallet-search-balance" :value="row.amount" :currency="row.currency === 'USD' ? '$' : row.currency || ''" tone="negative" />
          <UITag v-if="walletStatusOptions[row.status]?.title" class="wallet-search-status" v-bind="walletStatusOptions[row.status]" size="small" />
        </span>
      </span>
    </template>
    <template #counts>
      <UiCounts class="shared-card-counts" :data="countsData" isBg :list="countsList" :loading="loading" @refresh="getInfo">
        <template #item-footer="{ item }">
          <div v-if="item.prop === 'available_amount'" class="shared-card-consumption">
            <span>{{ t('card.index.sharedOverview.totalSpent') }}</span>
            <UiMoney class="shared-card-consumption-amount" :value="stats.clear_deduction_amount || 0" :loading="loading" />
          </div>
        </template>
      </UiCounts>
    </template>
  </UiPage>
</template>

<script setup>
import { showRequestError } from '@/utils/message.js'
import { cardApi } from '@/api'
import { t } from '@/utils'
import { toRoute } from '@/utils/route'
import { useUserStoreRefs } from '@/utils/store'
import { hasCardPermission, hasPermission } from '@/utils/permission'
import { computed, onMounted, ref, watch } from 'vue'
import Decimal from 'decimal.js'
import CardList from '../components/CardList.vue'
import CardBills from '../components/CardBills.vue'
import CardRecords from '../components/CardRecords.vue'
import { useReturnState } from './useReturnState'
const returnState = useReturnState()
const resetTabState = (name) => {
  const state = returnState[name]
  if (state) Object.keys(state).forEach(key => delete state[key])
}
const { user } = useUserStoreRefs()
const bins = ref([])
const walletStatusOptions = computed(() => ({
  0: { title: t('card.index.sharedManagement.normal'), type: 'success' },
  1: { title: t('card.index.sharedManagement.disabled'), type: 'error' },
  2: { title: t('card.index.sharedManagement.locked'), type: 'error' },
}))
const tabSearch = computed(() => ({
  search: { shared_wallet_id: '' },
  searchThead: [{
    title: t('card.index.sharedManagement.currentWallet'),
    prop: 'shared_wallet_id',
    url: '/vcc/SharedWallet/dataList',
    lableKey: 'name',
    ValueKey: 'id',
    width: 360,
  }],
}))
const tabs = computed(() => [
  { title: t('card.index.cardList'), name: 'list', component: CardList, permission: 'shared_card.view',
    props: { tabBtns: tabBtns.value, shared: true, binOptions: bins.value, returnState: returnState.list, apiUrl: '/vcc/SharedCard/index', privateRequest: cardApi.sharedCardPrivate, labelRequest: cardApi.sharedCardLabel } },
  { title: t('card.index.openingRecords'), name: 'record', component: CardRecords, permission: ['shared_card.view', 'shared_card.trade.view'],
    props: { tabBtns: tabBtns.value, shared: true, returnState: returnState.record, apiUrl: '/vcc/SharedTrade/index', cancelRequest: cardApi.sharedTradeCancel, urgeRequest: cardApi.sharedTradeUrge, syncRequest: cardApi.sharedTradeSync, showPreload: false, searchParams: { card_type: 'share' } } },
  { title: t('card.index.cardBills'), name: 'bill', component: CardBills, permission: 'shared_card.transaction',
    props: { tabBtns: tabBtns.value, shared: true, returnState: returnState.bill, apiUrl: '/vcc/SharedCard/transaction', exportApiUrl: '/vcc/SharedCard/transactionExport' } }
])
const tabBtns = computed(() => [
  {
    label: t('card.index.sharedManagement.title'),
    type: 'warning',
    class: hasPermission('shared_wallet.view') ? 'card-action-btn shared-wallet-btn' : 'card-action-btn',
    disabled: !hasPermission('shared_wallet.view'),
    tooltip: !hasPermission('shared_wallet.view') ? t('counts.noPermission') : '',
    click: () => hasPermission('shared_wallet.view') && toRoute('cardSharedWallets'),
  },
  {
    label: t('card.index.openCardQuickly'),
    type: 'primary',
    class: hasPermission('shared_card.create') ? 'card-action-btn ui-button-shine' : 'card-action-btn',
    disabled: !hasPermission('shared_card.create'),
    tooltip: !hasPermission('shared_card.create') ? t('counts.noPermission') : '',
    click: () => hasPermission('shared_card.create') && toRoute('sharedCardAdd'),
  }
])
const loading = ref(false)
const stats = ref({})
const availableWalletCount = computed(() => {
  const limit = String(user.value?.shared_wallet_limit)
  const count = String(stats.value.wallet_count)
  if (limit === '-1') return '-1'
  if (!/^\d+$/.test(limit) || !/^\d+$/.test(count)) return null
  return Decimal.max(new Decimal(limit).minus(count), 0).toFixed(0)
})
const countsData = computed(() => ({
  ...stats.value,
  available_wallet_count: availableWalletCount.value,
  shared_wallet_limit: user.value?.shared_wallet_limit,
  available_amount: stats.value.available_amount || 0,
}))
const walletLimitReached = computed(() => {
  const limit = String(user.value?.shared_wallet_limit)
  const count = String(stats.value.wallet_count)
  return !loading.value && /^\d+$/.test(limit) && (new Decimal(limit).isZero() || (/^\d+$/.test(count) && new Decimal(count).gte(limit)))
})
const creationDisabled = computed(() => {
  if (loading.value) return true
  const limit = String(user.value?.shared_wallet_limit)
  if (limit === '-1') return false
  const count = String(stats.value.wallet_count)
  if (!/^\d+$/.test(limit) || !/^\d+$/.test(count)) return true
  return new Decimal(count).gte(limit)
})
const countsList = computed(() => [
  { label: t('card.index.sharedOverview.balance'), prop: 'available_amount', type: 'money', refresh: true },
  {
    label: t('counts.availableCardSlots'),
    prop: 'available_capacity',
    propSub: 'total_capacity',
    min: 0,
    defaultValue: 0,
    decimals: 0,
    tips: t('counts.unlimitedCardSlotsTip'),
    btns: [{ label: t('counts.expandCapacity'), type: 'default', disabled: !!user.value?.parent_uid, tooltip: user.value?.parent_uid ? t('counts.noPermission') : '', click: () => toRoute('pricing') }],
  },
  {
    label: t('card.index.sharedOverview.accountCount'),
    prop: 'available_wallet_count',
    propSub: 'shared_wallet_limit',
    decimals: 0,
    tips: t('dashboard.unlimitedTip'),
    btns: [{ label: t('card.index.sharedOverview.createWallet'), type: 'default', disabled: !hasPermission('shared_wallet.view') || !hasPermission('shared_wallet.create') || creationDisabled.value, tooltip: !hasPermission('shared_wallet.view') || !hasPermission('shared_wallet.create') ? t('counts.noPermission') : walletLimitReached.value ? t('card.index.sharedForm.walletLimitReached') : '', click: () => toRoute('cardSharedWalletAdd') }],
  },
  {
    label: t('counts.failureRate'),
    prop: 'fail_rate',
    type: 'level_rate',
    tipsType: 'level_rate',
    showLevelInLabel: false,
    min: 0,
    defaultValue: 0,
    decimals: 2,
    btns: [{ label: t('counts.description'), type: 'tips', tips: t('counts.failureRateTip') }],
  },
  {
    label: t('counts.refundRate'),
    prop: 'credit_reversal_rate',
    type: 'level_rate',
    tipsType: 'level_rate',
    showLevelInLabel: false,
    min: 0,
    defaultValue: 0,
    decimals: 2,
    btns: [{ label: t('counts.description'), type: 'tips', tips: t('counts.refundRateTip') }],
  },
])

const getInfo = () => {
  if (loading.value) return
  loading.value = true
  cardApi.getSharedWalletStatistics()
    .then((res) => {
      stats.value = res || {}
    })
    .catch(showRequestError)
    .finally(() => {
      loading.value = false
    })
}

onMounted(getInfo)
onMounted(async () => {
  if (!hasCardPermission('view', true)) return
  try {
    const result = await cardApi.sharedCardBins()
    bins.value = Array.isArray(result) ? result : []
  } catch (error) { showRequestError(error) }
})
</script>

<style scoped lang="less">
.shared-card-title-icon {
  display: inline-flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  width: var(--ui-size-26);
  height: var(--ui-size-26);
  border-radius: 3px;
  color: var(--ui-color-text-inverse);
  background: var(--ui-gradient-purple-blue);

  @media screen and (max-width: 768px) {
    display: none;
  }
}

.wallet-search-option {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--ui-space-12);
  width: 100%;
  min-width: 0;

  .wallet-search-details {
    display: flex;
    align-items: center;
    flex-shrink: 0;
    gap: var(--ui-space-6);

    .wallet-search-status {
      min-height: var(--ui-size-18);
      padding: 0 var(--ui-space-4);
      gap: var(--ui-space-4);
      line-height: var(--ui-size-18);

      &::before {
        width: var(--ui-size-4);
        height: var(--ui-size-4);
      }
    }
  }

  .wallet-search-name {
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .wallet-search-balance {
    flex-shrink: 0;
    font-variant-numeric: tabular-nums;

    :deep(.ui-money-currency) {
      font-size: inherit;
    }
  }
}

.shared-card-consumption {
  display: flex;
  align-items: baseline;
  gap: var(--ui-space-4);
  margin-top: var(--ui-space-2);
  color: var(--ui-color-text);
  font-size: var(--ui-font-size-xs);
  white-space: nowrap;

  > span:first-child {
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .shared-card-consumption-amount {
    flex-shrink: 0;
    color: var(--primary-color);

    :deep(.ui-money-currency) {
      font-size: inherit;
    }
  }
}
.shared-card-counts :deep(.ui-counts-item-value-number > .unit) { font-size: 14px; color: var(--ui-color-neutral-500); }
:deep(.ui-counts > .btn) {
  margin-right: 4px;
  padding: var(--ui-padding-8);
}

@media screen and (min-width: 769px) {
  .shared-card-counts {
    min-height: calc(2lh + var(--ui-line-height-3xl) + var(--ui-space-24) + var(--ui-space-2));
  }
}

</style>
