<template>
  <UiPage :tabs="tabs" isAuto :title="$t('card.index.management')"  isNotTitle @init="getInfo">
    <template #counts>
      <UiCounts :data="stats" isBg :list="countsList" :loading="loading" @refresh="getInfo">
        <Button class="card-action-btn physical-btn" type="primary" size="large" long @click="toRoute('cardPhysical')">{{ $t('card.index.applyPhysicalCard') }}</Button>
        <Button class="card-action-btn ui-button-shine" type="primary" size="large" long @click="toRoute('cardAdd')">{{ $t('card.index.openCardQuickly') }}</Button>
      </UiCounts>
    </template>
  </UiPage>
</template>

<script setup>
import { cardApi } from '@/api'
import { t } from '@/utils'
import { toRoute } from '@/utils/route'
import { isPhone } from '@/utils/device'
import { useUserStoreRefs } from '@/utils/store'
import { computed, onMounted, ref } from 'vue'
import CardBills from './components/CardBills.vue'
import CardList from './components/CardList.vue'
import CardRecords from './components/CardRecords.vue'

const { user } = useUserStoreRefs()

const tabs = computed(() => [
  { title: t('card.index.cardList'), name: 'list', component: CardList },
  { title: t('card.index.openingRecords'), name: 'record', component: CardRecords },
  { title: t('card.index.cardBills'), name: 'bill', component: CardBills },
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
    btns: [{ label: t('counts.expandCapacity'), type: 'default', click: () => toRoute('pricing') }],
  },
  {
    label: t('counts.currentRate'),
    prop: 'card_depost_fee',
    type: 'rate',
    style: { background: '#fff8f2' },
    btns: [{ label: t('counts.lowerRate'), type: 'default', click: () => toRoute('pricing') }],
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
    .catch(() => {})
    .finally(() => {
      loading.value = false
    })
}

onMounted(getInfo)
</script>

<style scoped lang="less">
:deep(.ui-counts > .btn) {
  margin-right: 4px;
  padding: var(--ui-padding-8);
}

.card-action-btn {
  width: auto;
  min-width: 140px !important;
  height: var(--ui-size-36);
  padding: var(--ui-padding-0-16);
  border: 0;
  font-size: 13px;
  box-shadow: none;
  white-space: nowrap;

  &:hover,
  &:focus,
  &:active {
    border: 0;
    box-shadow: none;
  }
}

.physical-btn {
  background: var(--ui-gradient-warning-wide);

  &:hover,
  &:focus {
    color: var(--ui-color-text-inverse);
    opacity: 0.88;
  }
}

@media screen and (max-width: 768px) {
  .card-action-btn {
    width: 100%;
    min-width: 100% !important;
    height: var(--ui-size-44);
  }
}
</style>
