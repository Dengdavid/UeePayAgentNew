<template>
  <UiPage :title="$t('agent.title')" isNotTitle padding="0">
    <section class="agent-apply">
      <div class="ambient ambient-two"></div>
      <div class="hero-layout">
        <div class="hero-copy">
          <div class="eyebrow">
            <span class="eyebrow-dot"></span>
            {{ $t('agent.apply.eyebrow') }}
          </div>
          <h1 class="title">
            <span>{{ $t('agent.apply.title') }}</span>
            <span class="title-accent">{{ $t('agent.apply.titleAccent') }}</span>
          </h1>
          <p class="description">
            {{ $t('agent.apply.description') }}
          </p>
          <div class="action-row">
            <Button type="primary" size="large" class="apply-btn ui-cta-button" @click="handlGoCustomer">
              {{ $t('agent.apply.contactToApply') }}
              <Icon type="ios-arrow-round-forward" size="20" />
            </Button>
            <Button type="text" class="detail-btn" @click="toRoute('cooperate', { type: 1 })">
              {{ $t('agent.apply.learnMore') }}
              <Icon type="ios-arrow-forward" size="14" />
            </Button>
          </div>
          <div class="hero-highlights">
            <div v-for="item in heroHighlights" :key="item.value" class="hero-highlight-item">
              <strong>{{ item.value }}</strong>
              <span>{{ item.label }}</span>
            </div>
          </div>
        </div>

        <div class="hero-visual" aria-hidden="true">
          <div class="orbit orbit-one"></div>
          <div class="orbit orbit-two"></div>
          <div class="bill-panel">
            <div class="bill-head">
              <div>
                <span>{{ $t('agent.apply.agentStatement') }}</span>
                <strong>{{ $t('agent.apply.estimatedRewards', { month: 2024.01 }) }}</strong>
              </div>
            </div>
            <div class="bill-list">
              <div class="bill-list-head">
                <span>{{ $t('agent.apply.rewardComposition') }}</span>
                <strong>{{ $t('agent.apply.automaticSummary') }}</strong>
              </div>
              <div v-for="item in billItems" :key="item.name" class="bill-row">
                <span><Icon :type="item.icon" size="14" /> {{ item.name }}</span>
                <strong>{{ item.value }}</strong>
              </div>
            </div>

            <div class="bill-foot">
              <Icon type="ios-checkmark-circle" size="16" />
                {{ $t('agent.apply.settlementNotice') }}
            </div>
          </div>
        </div>
      </div>

      <div class="service-intro">
        <div
          v-for="item in serviceIntro"
          :key="item.title"
          class="service-card"
          :class="`service-card-${item.theme}`"
        >
          <div class="service-head">
            <span class="service-icon"><Icon :custom="`iconfont ${item.icon}`" size="21" /></span>
            <div>
              <strong>{{ item.title }}</strong>
              <span>{{ item.subtitle }}</span>
            </div>
          </div>
          <p>{{ item.description }}</p>
          <div class="service-tags">
            <span v-for="tag in item.tags" :key="tag">{{ tag }}</span>
          </div>
        </div>
      </div>

      <div class="feature-grid">
        <div v-for="item in features" :key="item.title" class="feature-item">
          <span class="feature-icon"><Icon :custom="`iconfont ${item.icon}`" size="19" /></span>
          <div>
            <strong>{{ item.title }}</strong>
            <span>{{ item.description }}</span>
          </div>
        </div>
      </div>
    </section>
  </UiPage>
</template>

<script setup>
import { computed } from 'vue'
import { t } from '@/utils'
import { useAppStoreRefs } from '@/utils/store'
import { toRoute } from '@/utils/route'

const { customerUrl } = useAppStoreRefs()

const currentMonthStr = computed(() => {
  const date = new Date()
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  return `${year}.${month}`
})

const serviceIntro = computed(() => [
  {
    title: t('agent.apply.services.card.title'),
    subtitle: t('agent.apply.services.card.subtitle'),
    description: t('agent.apply.services.card.description'),
    icon: 'icon-yinhangka-m',
    theme: 'card',
    tags: [t('agent.apply.services.card.tags.opening'), t('agent.apply.services.card.tags.recharge'), t('agent.apply.services.card.tags.scenarios')],
  },
  {
    title: t('agent.apply.services.remittance.title'),
    subtitle: t('agent.apply.services.remittance.subtitle'),
    description: t('agent.apply.services.remittance.description'),
    icon: 'icon-kuajinyewu',
    theme: 'remit',
    tags: [t('agent.apply.services.remittance.tags.transfer'), t('agent.apply.services.remittance.tags.currency'), t('agent.apply.services.remittance.tags.tracking')],
  },
])
const billItems = computed(() => [
  { name: t('agent.rewards.accountRechargeFee'), value: '+$ 4,260', icon: 'md-cash' },
  { name: t('agent.rewards.cardActivationFee'), value: '+$ 3,180', icon: 'md-card' },
  { name: t('agent.rewards.cardTransferInFee'), value: '+$ 2,740', icon: 'md-repeat' },
  { name: t('agent.rewards.transactionFee'), value: '+$ 5,120', icon: 'md-swap' },
  { name: t('agent.rewards.crossBorderFee'), value: '+$ 3,380', icon: 'md-globe' },
])

const heroHighlights = computed(() => [
  { value: t('agent.apply.highlights.integration.value'), label: t('agent.apply.highlights.integration.label') },
  { value: t('agent.apply.highlights.scenarios.value'), label: t('agent.apply.highlights.scenarios.label') },
  { value: t('agent.apply.highlights.settlement.value'), label: t('agent.apply.highlights.settlement.label') },
])

const features = computed(() => [
  { title: t('agent.apply.features.noDevelopment.title'), description: t('agent.apply.features.noDevelopment.description'), icon: 'icon-shujukaifajiaobenkaifa' },
  { title: t('agent.apply.features.brand.title'), description: t('agent.apply.features.brand.description'), icon: 'icon-pinpai' },
  { title: t('agent.apply.features.rewards.title'), description: t('agent.apply.features.rewards.description'), icon: 'icon-shouyi1' },
  { title: t('agent.apply.features.global.title'), description: t('agent.apply.features.global.description'), icon: 'icon-chengshi' },
  { title: t('agent.apply.features.pricing.title'), description: t('agent.apply.features.pricing.description'), icon: 'icon-fangjiandingjia' },
  { title: t('agent.apply.features.support.title'), description: t('agent.apply.features.support.description'), icon: 'icon-zhanghaotuoguan' },
])

const handlGoCustomer = () => {
  if (customerUrl.value) {
    window.open(customerUrl.value, '_blank')
  }
}
</script>

<style scoped lang="less">
.agent-apply {
  --page-space: 48px;
  --section-gap: 32px;
  --grid-gap: 16px;
  position: relative;
  box-sizing: border-box;
  width: 100%;
  padding: var(--page-space);
  color: var(--ui-color-text);
  overflow: hidden;
  background:
    radial-gradient(
      ellipse at 52% 48%,
      transparent 0%,
      transparent 46%,
      color-mix(in srgb, var(--white-color) 72%, transparent) 78%,
      var(--white-color) 100%
    ),
    radial-gradient(
      circle at 88% 16%,
      color-mix(in srgb, var(--primary-color) 7%, transparent),
      transparent 46%
    ),
    radial-gradient(circle at 13% 92%, rgba(26, 160, 255, 0.1), transparent 34%),
    linear-gradient(
      120deg,
      var(--white-color) 0%,
      color-mix(in srgb, var(--primary-color) 2%, var(--white-color)) 58%,
      var(--white-color) 100%
    );
}

.agent-apply *,
.agent-apply *::before,
.agent-apply *::after {
  box-sizing: border-box;
}

.agent-apply::before {
  content: '';
  position: absolute;
  inset: 0;
  opacity: 0.55;
  background-image:
    linear-gradient(rgba(43, 92, 217, 0.045) 1px, transparent 1px),
    linear-gradient(90deg, rgba(43, 92, 217, 0.045) 1px, transparent 1px);
  background-size: 44px 44px;
  mask-image: linear-gradient(to bottom, transparent, #000 35%, #000);
}

.ambient {
  position: absolute;
  border-radius: var(--ui-radius-circle);
  filter: blur(2px);
  pointer-events: none;
}

.ambient-one {
  width: var(--ui-size-360);
  height: 360px;
  top: -230px;
  left: 25%;
  border: var(--ui-border-primary-soft);
}

.ambient-two {
  width: 520px;
  height: 520px;
  right: -380px;
  bottom: -390px;
  background: color-mix(in srgb, var(--primary-color) 1%, transparent);
  filter: blur(32px);
}

.hero-layout {
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: minmax(0, 1.08fr) minmax(340px, 0.92fr);
  align-items: start;
  gap: clamp(34px, 6vw, 84px);
  max-width: 1160px;
  margin: 0 auto;
}

.hero-copy {
  min-height: 344px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  animation: reveal-left 0.65s ease-out both;
}

.eyebrow {
  align-self: flex-start;
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: var(--ui-padding-7-12);
  color: var(--primary-color);
  font-size: 12px;
  line-height: 1.35;
  font-weight: 500;
  letter-spacing: 0.01em;
  border: var(--ui-border-primary-soft);
  border-radius: var(--ui-radius-full);
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.94), rgba(232, 240, 255, 0.82));
  box-shadow:
    0 6px 18px rgba(43, 92, 217, 0.08),
    inset 0 1px 0 rgba(255, 255, 255, 0.9);
}

.eyebrow-dot {
  position: relative;
  flex: 0 0 auto;
  width: var(--ui-size-7);
  height: var(--ui-size-7);
  border-radius: var(--ui-radius-circle);
  background: linear-gradient(135deg, #4f7cff, var(--primary-color));
  box-shadow: 0 0 0 4px rgba(43, 92, 217, 0.1);
  animation: status-dot 1.8s ease-in-out infinite;
}

.eyebrow-dot::after {
  content: '';
  position: absolute;
  inset: -4px;
  border: 1px solid rgba(43, 92, 217, 0.52);
  border-radius: inherit;
  animation: status-ring 1.8s cubic-bezier(0.2, 0.65, 0.3, 1) infinite;
}

h1 {
  margin: 18px 0 0;
  color: var(--ui-color-text);
  font-size: clamp(30px, 3vw, 38px);
  line-height: 1.18;
  letter-spacing: 0;
  font-weight: 700;
}
.title{
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: clamp(36px, 3.4vw, 46px);
  line-height: 1.08;
  color: var(--ui-color-text);
}

.title-accent {
  color: var(--primary-color);
}
.subtitle {
  margin: 0;
  font-size: clamp(17px, 1.55vw, 20px);
  line-height: 1.42;
  font-weight: 600;
}

.description {
  max-width: 540px;
  margin: 16px 0 0;
  color: var(--ui-color-neutral-700);
  font-size: 13px;
  line-height: 1.7;
}

.action-row {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 14px;
  margin-top: 26px;
}

.hero-highlights {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 20px;
  margin-top: 22px;
  padding-top: 22px;
  border-top: 1px solid rgba(43, 92, 217, 0.12);
}

.hero-highlight-item {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.hero-highlight-item strong {
  color: var(--ui-color-text);
  font-size: 20px;
  line-height: 1.2;
}

.hero-highlight-item span {
  margin-top: auto;
  color: var(--ui-color-text-muted);
  font-size: 11px;
  line-height: 1.45;
}

:deep(.apply-btn) {
  flex: 0 0 auto;
  width: auto;
  min-width: max-content;
  height: var(--ui-size-44);
  padding: var(--ui-padding-0-24) !important;
  gap: 7px;
  white-space: nowrap;
}

:deep(.detail-btn) {
  flex: 0 0 auto;
  width: auto;
  min-width: max-content;
  height: var(--ui-size-40);
  padding: var(--ui-padding-0-10) !important;
  color: var(--primary-color) !important;
  font-size: 13px !important;
  white-space: nowrap;

  &:hover {
    text-decoration: underline;
  }
}

.hero-visual {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 344px;
  animation: reveal-right 0.75s 0.08s ease-out both;
}

.hero-visual::before {
  content: '';
  position: absolute;
  width: var(--ui-size-320);
  height: var(--ui-size-160);
  border-radius: var(--ui-radius-circle);
  background: rgba(43, 92, 217, 0.16);
  filter: blur(50px);
}

.orbit {
  position: absolute;
  width: 390px;
  height: 170px;
  border: var(--ui-border-primary-soft);
  border-radius: var(--ui-radius-circle);
  transform: rotate(-10deg);
}

.orbit::after {
  content: '';
  position: absolute;
  top: 39px;
  right: 18px;
  width: var(--ui-size-7);
  height: var(--ui-size-7);
  border-radius: var(--ui-radius-circle);
  background: #1aa0ff;
  box-shadow: 0 0 16px rgba(26, 160, 255, 0.42);
}

.orbit-two {
  width: 330px;
  height: var(--ui-size-240);
  transform: rotate(28deg);
  opacity: 0.5;
}

.bill-panel {
  position: relative;
  z-index: 2;
  width: min(100%, 385px);
  min-height: 344px;
  height: auto;
  padding: var(--ui-padding-20);
  overflow: hidden;
  border: 1px solid rgba(43, 92, 217, 0.2);
  border-radius: var(--ui-radius-3xl);
  background:
    radial-gradient(circle at 86% 8%, rgba(69, 123, 245, 0.24), transparent 34%),
    radial-gradient(circle at 8% 96%, rgba(26, 160, 255, 0.12), transparent 35%),
    linear-gradient(160deg, rgba(232, 240, 255, 0.98) 0%, rgba(216, 229, 254, 0.98) 56%, rgba(197, 215, 249, 0.98) 100%);
  box-shadow: 0 28px 58px rgba(43, 92, 217, 0.22), inset 0 1px rgba(255, 255, 255, 0.72);
}

.bill-panel::after {
  content: '';
  position: absolute;
  width: var(--ui-size-240);
  height: var(--ui-size-240);
  right: -132px;
  bottom: -150px;
  border: 36px solid rgba(43, 92, 217, 0.065);
  border-radius: var(--ui-radius-circle);
}

.bill-head {
  position: relative;
  z-index: 1;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 14px;
  padding: 13px 14px;
  border: 1px solid rgba(43, 92, 217, 0.11);
  border-radius: var(--ui-radius-15);
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.92), rgba(239, 245, 255, 0.8));
}

.bill-head > div {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.bill-head span {
  color: var(--ui-color-neutral-700);
  font-size: 12px;
}

.bill-head strong {
  color: var(--ui-color-text);
  font-size: 15px;
}

.bill-customer {
  flex: 0 0 auto;
  min-width: 74px;
  padding: 7px 9px;
  text-align: right;
  border-radius: var(--ui-radius-11);
  background: rgba(255, 255, 255, 0.92);
}

.bill-customer span {
  display: block;
  color: var(--ui-color-neutral-700);
  font-size: 10px;
}

.bill-customer strong {
  display: block;
  margin-top: 2px;
  color: var(--primary-color);
  font-size: 15px;
}

.bill-amount {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: flex-end;
  gap: 5px;
  margin-top: 15px;
  color: var(--ui-color-text-inverse);
}

.bill-amount span {
  padding-bottom: 6px;
  font-size: 18px;
  font-weight: 700;
}

.bill-amount strong {
  font-size: 38px;
  line-height: 1;
}

.bill-amount em {
  margin-left: 6px;
  margin-bottom: 5px;
  padding: 4px 7px;
  color: #0f9f63;
  font-size: 12px;
  font-style: normal;
  border-radius: var(--ui-radius-full);
  background: rgba(230, 255, 244, 0.92);
}

.bill-track {
  position: relative;
  z-index: 1;
  height: var(--ui-size-8);
  margin-top: 12px;
  overflow: hidden;
  border-radius: var(--ui-radius-full);
  background: rgba(255, 255, 255, 0.18);
}

.bill-track span {
  display: block;
  width: 74%;
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(90deg, #9fc1ff, #ffffff);
  box-shadow: 0 8px 18px rgba(255, 255, 255, 0.18);
}

.bill-summary {
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
  margin-top: 12px;
}

.bill-summary > div {
  min-width: 0;
  padding: 11px 12px;
  border: 1px solid rgba(255, 255, 255, 0.16);
  border-radius: var(--ui-radius-2xl);
  background: rgba(255, 255, 255, 0.12);
}

.bill-summary span {
  display: block;
  color: rgba(255, 255, 255, 0.66);
  font-size: 11px;
}

.bill-summary strong {
  display: block;
  margin-top: 5px;
  color: var(--ui-color-text-inverse);
  font-size: 13px;
}

.bill-list {
  position: relative;
  z-index: 1;
  display: grid;
  gap: 7px;
  margin-top: 12px;
  padding: var(--ui-padding-10);
  border: 1px solid rgba(43, 92, 217, 0.09);
  border-radius: var(--ui-radius-14);
  background: rgba(255, 255, 255, 0.7);
}

.bill-list-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: var(--ui-color-neutral-700);
  font-size: 11px;
}

.bill-list-head strong {
  color: var(--primary-color);
  font-size: 11px;
}

.bill-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  padding: var(--ui-padding-7-8);
  color: var(--ui-color-neutral-700);
  font-size: 12px;
  border: 0;
  border-radius: var(--ui-radius-9);
  background: linear-gradient(90deg, rgba(233, 241, 255, 0.96), rgba(255, 255, 255, 0.76));
}

.bill-row span {
  min-width: 0;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  white-space: nowrap;
}

.bill-row i {
  color: var(--primary-color);
}

.bill-row strong {
  flex: 0 0 auto;
  color: var(--ui-color-success);
  font-size: 12px;
}

.bill-foot {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 10px;
  color: var(--ui-color-neutral-700);
  font-size:12px;
}

.bill-foot i {
  color: var(--ui-color-success);
}

.service-intro {
  position: relative;
  z-index: 2;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: var(--grid-gap);
  max-width: 1160px;
  margin:var(--ui-margin-80-auto-0);
  animation: reveal-up 0.7s 0.14s ease-out both;
}

.service-card {
  position: relative;
  min-width: 0;
  padding: 22px;
  overflow: hidden;
  border: var(--ui-border-primary-soft);
  border-radius: var(--ui-radius-16);
  background: rgba(255, 255, 255, 0.86);
  box-shadow: 0 18px 44px rgba(43, 92, 217, 0.09);
  backdrop-filter: blur(12px);
}

.service-card::before {
  content: '';
  position: absolute;
  inset: 0 auto 0 0;
  width: var(--ui-size-4);
  background: var(--service-accent, var(--primary-color));
}

.service-card::after {
  content: '';
  position: absolute;
  width: var(--ui-size-150);
  height: var(--ui-size-150);
  right: -78px;
  top: -76px;
  border-radius: var(--ui-radius-circle);
  background: var(--service-soft, rgba(43, 92, 217, 0.08));
}

.service-card-card {
  --service-accent: var(--ui-color-primary);
  --service-soft: rgba(43, 92, 217, 0.1);
  background:
    linear-gradient(135deg, rgba(43, 92, 217, 0.075), rgba(255, 255, 255, 0.9) 48%),
    rgba(255, 255, 255, 0.86);
}

.service-card-remit {
  --service-accent: #16a3a3;
  --service-soft: rgba(22, 163, 163, 0.11);
  background:
    linear-gradient(135deg, rgba(22, 163, 163, 0.08), rgba(255, 255, 255, 0.9) 48%),
    rgba(255, 255, 255, 0.86);
}

.service-head {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  gap: 12px;
}

.service-icon {
  flex: 0 0 auto;
  width: var(--ui-size-44);
  height: var(--ui-size-44);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: var(--service-accent, var(--primary-color));
  border-radius: var(--ui-radius-2xl);
  background: var(--service-soft, rgba(43, 92, 217, 0.08));
}

.service-head > div {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.service-head strong {
  color: var(--ui-color-text);
  font-size: 16px;
}

.service-head span {
  color: var(--service-accent, var(--primary-color));
  font-size: 12px;
}

.service-card p {
  position: relative;
  z-index: 1;
  margin: var(--ui-margin-14-0-0);
  color: var(--ui-color-neutral-700);
  font-size: 13px;
  line-height: 1.75;
}

.service-tags {
  position: relative;
  z-index: 1;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 14px;
}

.service-tags span {
  padding: var(--ui-padding-5-9);
  color: var(--service-accent, var(--primary-color));
  font-size: 11px;
  border-radius: var(--ui-radius-full);
  background: rgba(255, 255, 255, 0.72);
  border: 1px solid var(--service-soft, rgba(43, 92, 217, 0.08));
}

.data-chip {
  position: absolute;
  z-index: 3;
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 10px 13px;
  color: var(--ui-color-neutral-700);
  font-size: 11px;
  white-space: nowrap;
  border: var(--ui-border-primary-soft);
  border-radius: var(--ui-radius-xl);
  background: rgba(255, 255, 255, 0.9);
  box-shadow: 0 12px 30px rgba(43, 92, 217, 0.12);
  backdrop-filter: blur(12px);

  strong { color: var(--primary-color); font-size: 13px; }
}

.chip-top { top: 8px; right: 0; }
.chip-bottom { bottom: 4px; left: -5px; }

.trend-icon {
  display: inline-flex;
  padding: var(--ui-padding-5);
  color: var(--primary-color);
  border-radius: var(--ui-radius-6);
  background: rgba(43, 92, 217, 0.08);
}

.feature-grid {
  position: relative;
  z-index: 2;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: var(--grid-gap);
  max-width: 1160px;
  margin: var(--section-gap) auto 0;
  animation: reveal-up 0.7s 0.18s ease-out both;
}

.feature-item {
  min-width: 0;
  display: flex;
  align-items: flex-start;
  gap: 10px;
  min-height: 72px;
  padding: var(--ui-padding-16);
  border: 1px solid rgba(43, 92, 217, 0.075);
  border-radius: var(--ui-radius-2xl);
  background: rgba(255, 255, 255, 0.68);
  box-shadow: 0 10px 26px rgba(43, 92, 217, 0.045);
  backdrop-filter: blur(12px);

  > div {
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 3px;
  }

  strong {
    color: var(--ui-color-text);
    font-size: 13px;
    white-space: nowrap;
  }

  > div > span {
    overflow: hidden;
    color: var(--ui-color-neutral-700);
    font-size: 11px;
    line-height: 1.5;
  }
}

.feature-icon {
  flex: 0 0 auto;
  width: var(--ui-size-34);
  height: var(--ui-size-34);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: var(--primary-color);
  border-radius: var(--ui-radius-lg);
  background: rgba(43, 92, 217, 0.065);
}

@keyframes reveal-left {
  from { opacity: 0; transform: translateX(-18px); }
  to { opacity: 1; transform: translateX(0); }
}

@keyframes reveal-right {
  from { opacity: 0; transform: translateX(18px); }
  to { opacity: 1; transform: translateX(0); }
}

@keyframes reveal-up {
  from { opacity: 0; transform: translateY(16px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes status-dot {
  0%, 100% {
    transform: scale(1);
    box-shadow: 0 0 0 4px rgba(43, 92, 217, 0.1);
  }
  50% {
    transform: scale(1.14);
    box-shadow:
      0 0 0 4px rgba(43, 92, 217, 0.16),
      0 0 10px rgba(43, 92, 217, 0.48);
  }
}

@keyframes status-ring {
  0% {
    opacity: 0.72;
    transform: scale(0.62);
  }
  72%, 100% {
    opacity: 0;
    transform: scale(1.55);
  }
}

@media screen and (max-width: 1100px) {
  .agent-apply { --page-space: 32px; }
  .feature-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); }
}

@media screen and (max-width: 768px) {
  .agent-apply {
    --page-space: 16px;
    --section-gap: 24px;
    min-height: auto;
  }

  .hero-layout {
    grid-template-columns: 1fr;
    gap: var(--section-gap);
  }

  .hero-copy {
    min-height: auto;
    text-align: center;
  }
  .eyebrow {
    align-self: center;
    max-width: 100%;
    font-size: 12px;
  }
  .title {
    margin-top: 16px;
    gap: 2px;
    font-size: 32px;
  }
  .subtitle { font-size: 17px; }
  .description {
    max-width: 330px;
    margin-inline: auto;
    font-size: 13px;
    line-height: 1.7;
  }

  .action-row {
    justify-content: center;
    flex-wrap: wrap;
    gap: 18px;
    margin-top: 22px;
  }

  .hero-highlights {
    margin-top: 24px;
    text-align: left;
  }

  .hero-highlight-item span {
    font-size: 12px;
  }

  :deep(.apply-btn) {
    min-width: 172px;
    height: var(--ui-size-44);
    justify-content: center;
  }

  :deep(.detail-btn) {
    height: var(--ui-size-40);
  }

  .hero-visual {
    width: 100%;
    max-width: 360px;
    min-height: 236px;
    margin: 0 auto;
    overflow: visible;
  }

  .hero-visual::before {
    width: var(--ui-size-260);
    height: 130px;
    filter: blur(42px);
  }

  .bill-panel {
    width: min(88vw, 320px);
    min-height: 292px;
    height: auto;
    padding: var(--ui-padding-18);
    border-radius: 18px;
  }

  .bill-panel::after {
    width: 210px;
    height: 210px;
    right: -118px;
    bottom: -138px;
    border-width: 30px;
  }

  .bill-head {
    padding: var(--ui-padding-12);
    margin: -6px -6px 0;
  }

  .bill-head strong { font-size: 14px; }
  .bill-customer {
    min-width: 68px;
    padding: var(--ui-padding-6-8);
  }

  .bill-customer span {
    font-size: 10px;
  }

  .bill-customer strong {
    font-size: 14px;
  }

  .bill-amount {
    margin-top: 13px;
  }

  .bill-amount strong {
    font-size: 32px;
  }

  .bill-amount span {
    padding-bottom: 5px;
    font-size: 15px;
  }

  .bill-list {
    gap: 7px;
    margin-top: 14px;
  }

  .bill-row {
    padding: 8px 9px;
    font-size: 11px;
  }

  .orbit {
    width: min(90vw, 340px);
    height: 135px;
  }

  .orbit-two {
    width: min(78vw, 280px);
    height: 190px;
  }

  .data-chip {
    max-width: calc(100vw - 40px);
    padding: var(--ui-padding-8-10);
    gap: 6px;
    font-size: 10px;
  }

  .data-chip strong { font-size: 12px; }
  .chip-top { top: 0; right: 0; }
  .chip-bottom { bottom: 0; left: 0; }

  .feature-grid {
    grid-template-columns: 1fr;
  }

  .service-intro {
    grid-template-columns: 1fr;
  }

  .service-card {
    padding: 17px;
  }
}

@media screen and (max-width: 480px) {
  .agent-apply {
    --page-space: 16px;
  }

  .title {
    margin-top: 14px;
    gap: 1px;
    font-size: 30px;
    line-height: 1.15;
  }

  .subtitle { font-size: 16px; }

  .description {
    margin-top: 14px;
  }

  .action-row {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
    max-width: 280px;
    margin-top: 18px;
    margin-inline: auto;
  }

  .hero-highlights {
    gap: 0;
    margin-top: 20px;
    padding: 14px 6px;
    text-align: center;
    border: 1px solid rgba(43, 92, 217, 0.1);
    border-radius: var(--ui-radius-14);
    background: rgba(255, 255, 255, 0.62);
  }

  .hero-highlight-item {
    align-items: center;
    justify-content: center;
    gap: 5px;
    padding: var(--ui-padding-0-8);
    text-align: center;
  }

  .hero-highlight-item + .hero-highlight-item {
    border-left: 1px solid rgba(43, 92, 217, 0.1);
  }

  .hero-highlight-item strong {
    width: 100%;
    font-size: 16px;
    text-align: center;
  }

  .hero-highlight-item span {
    width: 100%;
    min-height: 32px;
    font-size: 11px;
    line-height: 1.45;
    text-align: center;
  }

  :deep(.apply-btn),
  :deep(.detail-btn) {
    width: 100%;
    min-width: 0;
  }

  :deep(.detail-btn) {
    height: var(--ui-size-32);
  }

  .hero-visual {
    max-width: none;
    min-height: 214px;
  }

  .bill-panel {
    width: 100%;
    min-height: auto;
    padding: var(--ui-padding-16);
  }

  .bill-head {
    gap: 8px;
    margin: 0;
    padding: var(--ui-padding-12);
  }

  .bill-head span {
    font-size: 10px;
  }

  .bill-head strong {
    font-size: 12px;
  }

  .bill-customer {
    min-width: 62px;
    padding: 6px 7px;
  }

  .bill-customer strong {
    font-size: 13px;
  }

  .bill-amount strong {
    font-size: 28px;
  }

  .bill-amount em {
    margin-left: 2px;
    padding: 3px 6px;
    font-size: 10px;
  }

  .bill-summary {
    gap: 7px;
    margin-top: 12px;
  }

  .bill-summary > div {
    padding: 9px;
  }

  .bill-row {
    padding: var(--ui-padding-8);
  }

  .bill-list {
    gap: 8px;
    margin-top: 12px;
    padding: var(--ui-padding-12);
  }

  .bill-foot {
    margin-top: 12px;
  }

  .bill-row strong {
    font-size: 11px;
  }

  .data-chip {
    transform: scale(0.92);
  }

  .chip-top {
    right: -8px;
    transform-origin: top right;
  }

  .chip-bottom {
    left: -8px;
    transform-origin: bottom left;
  }

  .feature-item {
    padding: 14px 15px;
    min-height: auto;
  }

  .service-card {
    padding: var(--ui-padding-15);
  }

  .service-head strong {
    font-size: 15px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .hero-copy,
  .hero-visual,
  .service-intro,
  .feature-grid { animation: none; }

  .eyebrow-dot,
  .eyebrow-dot::after { animation: none; }

  .eyebrow-dot::after { opacity: 0; }

}
</style>
