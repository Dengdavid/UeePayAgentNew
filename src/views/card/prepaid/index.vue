<template>
  <UiPage  :tabs="tabs" :tabBtns="tabBtns" isAuto  @init="getInfo">
    <template #title-icon>
      <span v-if="!isPhone" class="regular-card-title-icon" aria-hidden="true">
        <Icon custom="iconfont icon-yinhangka-m" :size="12" />
      </span>
    </template>
    <template #counts>
      <UiCounts :data="stats" isBg  :list="countsList" :loading="loading" @refresh="getInfo"></UiCounts>
    </template>
  </UiPage>
</template>

<script setup>
import { showRequestError } from '@/utils/message.js'
import { cardApi } from '@/api'
import { t } from '@/utils'
import { toRoute } from '@/utils/route'
import { isPhone } from '@/utils/device'
import { useCardStore, useUserStoreRefs } from '@/utils/store'
import { hasCardPermission, hasPermission } from '@/utils/permission'
import { computed, onMounted, ref, watch } from 'vue'
import CardBills from '../components/CardBills.vue'
import CardList from '../components/CardList.vue'
import CardRecords from '../components/CardRecords.vue'

const { user } = useUserStoreRefs()
const cardStore = useCardStore()

watch([() => user.value?.id, () => hasCardPermission('view')], async ([userId, allowed], _, onCleanup) => {
  let active = true
  onCleanup(() => { active = false })
  cardStore.bins = []
  if (!userId || !allowed) return
  try {
    const bins = await cardApi.getBinList()
    if (active) cardStore.bins = Array.isArray(bins) ? bins : []
  } catch (error) { showRequestError(error) }
}, { immediate: true, flush: 'sync' })


const tabs = computed(() => [
  { title: t('card.index.cardList'), name: 'list', component: CardList, permission: 'card.view',
    props: { tabBtns: tabBtns.value, apiUrl: '/vcc/index', privateRequest: cardApi.vccPrivate, labelRequest: cardApi.vccLabel } },
  { title: t('card.index.openingRecords'), name: 'record', component: CardRecords, permission: ['card.view', 'card.trade.view'],
    props: { tabBtns: tabBtns.value, apiUrl: '/vcc/trade', cancelRequest: cardApi.vccTradeCancel, urgeRequest: cardApi.vccTradeUrge, syncRequest: cardApi.vccTradeSync } },
  { title: t('card.index.cardBills'), name: 'bill', component: CardBills, permission: ['card.view', 'card.transaction'],
    props: { tabBtns: tabBtns.value, apiUrl: '/vcc/transaction', exportApiUrl: '/vcc/transactionExport' } },
])
const tabBtns = computed(() => [
  {
    label: t('card.index.applyPhysicalCard'),
    type: 'warning',
    class:'card-action-btn physical-btn',
    click: () => toRoute('cardPhysical'),
  },
  {
    label: t('card.index.openCardQuickly'),
    type: 'primary',
    class: hasPermission('card.create') ? 'card-action-btn ui-button-shine' : 'card-action-btn',
    disabled: !hasPermission('card.create'),
    tooltip: !hasPermission('card.create') ? t('counts.noPermission') : '',
    click: () => hasPermission('card.create') && toRoute('cardAdd'),
  },
])
const loading = ref(false)
const stats = ref({})
const countsList = computed(() => [
  {
    label: t('counts.availableBalance'),
    prop: 'money',
    type: 'money',
    countType: 'available_balance',
    autoWidth: true,
    style: { background: '#f5f7ff' },
    btns: [
      { label: t('counts.recharge'), type: 'default', click: () => toRoute('ucenter_deposit') },
      { label: t('counts.withdraw'), type: 'warning', hidden: user.value?.parent_uid, click: () => toRoute('withdraw') },
    ],
  },
  {
    label: t('counts.availableCardSlots'),
    prop: 'available_capacity',
    propSub: 'total_capacity',
    min: 0,
    defaultValue: 0,
    decimals: 0,
    tips: t('counts.unlimitedCardSlotsTip'),
    style: { background: '#f6faf5' },
    btns: [{ label: t('counts.expandCapacity'), type: 'default', disabled: !!user.value?.parent_uid, tooltip: user.value?.parent_uid ? t('counts.noPermission') : '', click: () => toRoute('pricing') }],
  },
  {
    label: t('counts.currentRate'),
    prop: 'card_depost_fee',
    type: 'rate',
    style: { background: '#fff8f2' },
    btns: [{ label: t('counts.lowerRate'), type: 'default', disabled: !!user.value?.parent_uid, tooltip: user.value?.parent_uid ? t('counts.noPermission') : '', click: () => toRoute('pricing') }],
  },
  {
    label: t('counts.failureRate'),
    prop: 'fail_rate',
    type: 'level_rate',
    tipsType: 'level_rate',
    showLevelInLabel: false,
    min: 0,
    defaultValue: 0,
    decimals:2,
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
    decimals:2,
    btns: [{ label: t('counts.description'), type: 'tips', tips: t('counts.refundRateTip') }],
  },
])

const getInfo = () => {
  if (loading.value) return
  loading.value = true
  cardApi.vccStatistics()
    .then((res) => {
      stats.value = res || {}
    })
    .catch(showRequestError)
    .finally(() => {
      loading.value = false
    })
}

onMounted(getInfo)
</script>

<style scoped lang="less">
.regular-card-title-icon {
  display: inline-flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  width: var(--ui-size-26);
  height: var(--ui-size-26);
  border-radius: 3px;
  color: var(--ui-color-text-inverse);
  background: var(--ui-gradient-warning-wide);
}

:deep(.ui-counts > .btn) {
  margin-right: 4px;
  padding: var(--ui-padding-8);
}

</style>
