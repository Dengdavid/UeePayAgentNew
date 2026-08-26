<template>
  <div class="price-page">
    <div class="ui-layout price-layout">
      <section class="pricing-hero" v-if="hasLoginSession">
        <aside class="account-summary">
          <div class="summary-top">
            <div class="summary-main">
              <h1>{{ $t('pricing.title') }}</h1>
              <p>{{ $t('pricing.subtitle') }}</p>
              <ul class="summary-guide">
                <li v-for="index in 3" :key="index"><Icon type="md-checkmark" :size="13" />{{ $t(`pricing.guides.${index - 1}`) }}</li>
              </ul>
            </div>
            <div class="summary-grid">
              <div>
                <span>{{ $t('pricing.availableBalance') }}</span>
                <strong>
                  <em>{{ accountBalanceMeta.unit }}</em>
                  <b>{{ accountBalanceMeta.value }}</b>
                </strong>
              </div>
              <div>
                <span>{{ $t('pricing.availableCapacity') }}</span>
                <strong>
                  <b>{{ availableCapacityMeta.value }}</b>
                  <em>{{ availableCapacityMeta.suffix }}</em>
                </strong>
              </div>
            </div>
          </div>
        </aside>
      </section>

      <section class="plans-section">
        <div class="plans-shell">

          <div class="empty-plans" v-if="!pageLoading && groups.length === 0">
            <Icon type="ios-card-outline" :size="28" />
            <p>{{ $t('pricing.empty') }}</p>
          </div>
          <div
            ref="plansGridRef"
            class="plans-grid"
            :class="{ 'scrollable-plans': groups.length > 4 }"
            @scroll.passive="updatePlansScrollButtons"
            v-else
          >
            <article
              class="plan-card"
              :class="[planTone(index), { current: isVip(item), recommended: isRecommended(item, index) }]"
              v-for="(item, index) in groups"
              :key="item.id || index"
            >
              <div class="plan-ribbon" v-if="isVip(item)">
                <Icon custom="iconfont icon-vip" :size="14" />
                <span>{{ $t('pricing.currentPlan') }}</span>
              </div>

              <div class="plan-head">
                <div class="plan-title-group">
                  <h3 :title="getPlanTitle(item)">{{ getPlanTitle(item) }}</h3>
                </div>
                <Tag color="primary" v-if="isRecommended(item, index)">{{ $t('pricing.recommended') }}</Tag>
                <Tag v-else-if="item.price === 0 && !item.upgrade">{{ $t('pricing.custom') }}</Tag>
              </div>

              <div class="price-row">
                <template v-if="item.price > 0">
                  <span>$</span>
                  <strong class="price-amount">{{ item.price }}</strong>
                </template>
                <strong v-else>{{ getPlanPrice(item) }}</strong>
                <em>/ {{ item.expire_time > 0 ? $t('pricing.days', { days: item.expire_time }) : $t('pricing.permanent') }}</em>
              </div>
              <div class="plan-stats">
                <p>{{ $t('pricing.capacityLimit') }} <b>{{ item.capacity > 0 ? `${item.capacity}` : $t('pricing.unlimited') }}</b>{{ $t('cardTag.cardUnit', { count: item.capacity > 0 ? item.capacity : 2 }) }}</p>
              </div>
              <div class="fee-list">
                <dl v-for="priceItem in priceList" :key="priceItem.key">
                  <dt>{{ priceItem.label }}</dt>
                  <dd :class="{ free: getCreateAmount(item[priceItem.key], priceItem.feeType) === $t('pricing.free') }">
                    {{ getCreateAmount(item[priceItem.key], priceItem.feeType) }}
                  </dd>
                </dl>
              </div>
              <Button
                long
                size="large"
                type="primary"
                v-if="item.price == 0 && !item.upgrade"
                @click="handleGoCustomer"
              >
                {{ $t('pricing.consultCustom') }}
              </Button>
              <Button
                long
                size="large"
                :type="'primary'"
                v-else-if="isVip(item)"
                @click="handleGoAdd"
              >
                {{ $t('pricing.openCardWithCurrent') }}
              </Button>
              <Button long size="large" type="primary" :loading="submiting" @click="handleBuy(item)" v-else>
                {{ $t('pricing.upgradeNow') }}
              </Button>
            </article>
          </div>
          <button
            v-show="groups.length > 4 && canScrollPlansPrev"
            type="button"
            class="plans-scroll plans-scroll-prev"
            :aria-label="$t('button.prevStep')"
            @click="scrollPlans(-1)"
          >
            <Icon type="ios-arrow-back" :size="20" />
          </button>
          <button
            v-show="groups.length > 4 && canScrollPlansNext"
            type="button"
            class="plans-scroll plans-scroll-next"
            :aria-label="$t('button.nextStep')"
            @click="scrollPlans(1)"
          >
            <Icon type="ios-arrow-forward" :size="20" />
          </button>
        </div>
      </section>

      <section class="detail-section">
        <aside class="rule-card">
          <div class="rule-main">
            <div class="rule-head">
              <h3>{{ $t('pricing.rulesTitle') }}</h3>
            </div>
            <div class="rule-list">
              <p v-for="(tip, tipIndex) in tips" :key="tipIndex">
                <span>{{ tipIndex + 1 }}</span>
                {{ tip }}
              </p>
            </div>
          </div>
          <div class="service-card">
            <div class="service-content">
              <div class="service-kicker">
                <span class="service-icon" aria-hidden="true">
                  <Icon type="md-people" :size="18" />
                </span>
                <span>{{ $t('pricing.customChannel') }}</span>
              </div>
              <h3>{{ $t('pricing.customTitle') }}</h3>
              <p>{{ $t('pricing.customDescription') }}</p>
              <Button class="service-action" @click="handleGoCustomer">
                {{ $t('pricing.consultPlan') }}
                <Icon type="md-arrow-forward" />
              </Button>
            </div>
          </div>
        </aside>
      </section>
    </div>
    <Spin fix v-if="pageLoading"></Spin>
  </div>
  <Aurora class="full"></Aurora>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, computed, nextTick, watch } from 'vue'
import { useRouter } from 'vue-router'
import Cookies from 'js-cookie'
const router = useRouter()
import { userApi, cardApi } from '@/api'
import { Message, Modal } from 'view-ui-plus'
import { message } from '@/utils/message.js'
import { storeToRefs } from 'pinia'
import { useAppStore } from '@/store/app.js'
import Decimal from 'decimal.js'
import { useUserStore } from '@/store/user.js'
import Aurora from '@/views/home/components/Aurora.vue'
import { t } from '@/utils'
import { tokenName } from "@systemConfig";
const appStore = useAppStore()
const { customerUrl } = storeToRefs(appStore)
const userStore = useUserStore()
const { isLogin, user, groups } = storeToRefs(userStore)
const pageLoading = ref(false)
const cardStats = ref({})
const plansGridRef = ref(null)
const canScrollPlansPrev = ref(false)
const canScrollPlansNext = ref(false)
const hasLoginSession = computed(() => (
  isLogin.value && Boolean(Cookies.get(tokenName)) && Boolean(user.value?.id)
))

const updatePlansScrollButtons = () => {
  const element = plansGridRef.value
  if (!element) return
  const overflow = element.scrollWidth > element.clientWidth + 2
  canScrollPlansPrev.value = overflow && element.scrollLeft > 2
  canScrollPlansNext.value = overflow && element.scrollLeft + element.clientWidth < element.scrollWidth - 2
}
const scrollPlans = (direction) => {
  const element = plansGridRef.value
  if (!element) return
  const card = element.querySelector('.plan-card')
  const gap = Number.parseFloat(window.getComputedStyle(element).columnGap) || 0
  const distance = (card?.getBoundingClientRect().width || element.clientWidth * 0.235) + gap
  const behavior = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'
  element.scrollBy({ left: direction * distance, behavior })
}
const refreshPlansScroll = () => {
  nextTick(() => {
    if (groups.value.length <= 4 && plansGridRef.value) plansGridRef.value.scrollLeft = 0
    updatePlansScrollButtons()
  })
}
watch(() => groups.value.length, refreshPlansScroll)

const isVip = (item) => {
  return hasLoginSession.value && user.value.group_id === item.id
}
const accountBalanceMeta = computed(() => {
  if (!hasLoginSession.value) return { unit: '', value: '--' }
  return {
    unit: '$',
    value: cardStats.value.money ?? '0.00',
  }
})
const availableCapacityMeta = computed(() => {
  if (!hasLoginSession.value) return { value: '--', suffix: '' }
  const { available_capacity, total_capacity } = cardStats.value
  if (total_capacity < 0) return { value: '∞', suffix: '' }
  if (available_capacity === undefined && total_capacity === undefined) return { value: '--', suffix: '' }
  const available = Number(available_capacity || 0) < 0 ? 0 : Number(available_capacity || 0)
  const total = Number(total_capacity || 0)
  return {
    value: available,
    suffix: `/${total}`,
  }
})
const currentRateMeta = computed(() => {
  if (!hasLoginSession.value) return { value: '--', suffix: '' }
  const rate = cardStats.value.card_depost_fee
  return rate || rate === 0
    ? { value: rate, suffix: '%' }
    : { value: '--', suffix: '' }
})
const priceList = computed(() => [
  {
    label: t('pricing.feeLabels.recharge'),
    key: 'account_depost_fee',
    feeType: 'fee_rate',
  },
  {
    label: t('pricing.feeLabels.activation'),
    key: 'create_amount',
    feeType: 'fee',
  },
  {
    label: t('pricing.feeLabels.transferIn'),
    key: 'card_depost_fee',
    feeType: 'fee_rate',
  },
  {
    label: t('pricing.feeLabels.transaction'),
    key: 'auth_fee_config',
    feeType: null,
  },
  {
    label: t('pricing.feeLabels.crossBorder'),
    key: 'foreign_fee_config',
    feeType: null,
  },
])
const tips = ref(Array.from({ length: 5 }, (_, index) => t(`pricing.rules.${index}`)))

const loadCardStats = () => {
  cardApi
    .vccStatistics()
    .then((res) => {
      cardStats.value = res || {}
    })
    .catch(() => {
      cardStats.value = {}
    })
}
watch(hasLoginSession, (loggedIn) => {
  if (loggedIn) loadCardStats()
}, { immediate: true })

const init = function () {
  pageLoading.value = true
  userApi
    .getGroupList()
    .then((res) => {
      groups.value = res || []
    })
    .catch((err) => {
      message(err?.msg || t('pricing.loadFailed'), 'error')
    })
    .finally(() => {
      pageLoading.value = false
    })
}
const submiting = ref(false)
const handleGoAdd = function () {
  if (!hasLoginSession.value) {
    router.push({ name: 'login' })
    return false
  }
  router.push({ name: 'cardAdd' })
}
const isRecommended = (item, index) => {
  return item.upgrade === 1 && item.price > 0 && index > 0
}
const planTone = (index) => {
  return ['tone-blue', 'tone-purple', 'tone-amber', 'tone-indigo'][index % 4]
}
const escapeText = (value) => String(value ?? '').replace(/[&<>"']/g, (character) => ({
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
})[character])
const getPlanPrice = (item) => {
  if (item.price == 0) {
    return item.upgrade == 1 ? t('pricing.free') : t('pricing.customService')
  }
  return `${item.price}`
}
const getPlanTitle = (item) => item.title_alias || item.title || item.alias || '-'
const isPositiveFee = (value) => {
  try {
    return new Decimal(value ?? 0).greaterThan(0)
  } catch {
    return false
  }
}
const getCreateAmount = (number, key) => {
  if (!number) return t('pricing.free')
  if (typeof number === 'object') {
    const lastValue = Object.values(number)[0]
    if (!lastValue || typeof lastValue !== 'object') return t('pricing.free')
    const hasFee = isPositiveFee(lastValue.fee)
    const hasFeeRate = isPositiveFee(lastValue.fee_rate)
    if (key === 'fee') {
      return hasFee ? `$${lastValue.fee}` : t('pricing.free')
    } else if (key === 'fee_rate') {
      return hasFeeRate ? `${new Decimal(lastValue.fee_rate).mul(100).toNumber()}%` : t('pricing.free')
    }
    if (!hasFeeRate && !hasFee) return t('pricing.free')
    if (!hasFeeRate) return `$${lastValue.fee}`
    if (!hasFee) return `${new Decimal(lastValue.fee_rate).mul(100).toNumber()}%`
    return `${new Decimal(lastValue.fee_rate).mul(100).toNumber()}% + $${lastValue.fee}`
  }
  return isPositiveFee(number) ? `$${number}` : t('pricing.free')
}
const handleBuy = (item) => {
  if (submiting.value) return false
  if (!hasLoginSession.value) {
    router.push({ name: 'login' })
    return false
  }
  if (user.value.group_id === item.id) return false
  Modal.confirm({
    title: t('pricing.purchaseTitle'),
    content: `<p>${t('pricing.purchaseConfirm', { plan: escapeText(getPlanTitle(item)), balance: escapeText(`$ ${user.value.money}`) })}</p>`,
    okText: t('button.confirm'),
    cancelText: t('button.cancel'),
    onOk: () => {
      const msg = Message.loading({
        content: t('pricing.submitting'),
        duration: 0,
      })
      submiting.value = true
      userApi
        .buyGroup({ id: item.id })
        .then(() => {
          msg()
          submiting.value = false
          message(t('pricing.purchaseSuccess'))
          userStore.getUserInfo()
        })
        .catch((err) => {
          msg()
          submiting.value = false
          message(err?.msg || t('pricing.purchaseFailed'), 'error')
        })
    },
  })
}

const handleGoCustomer = () => {
  window.open(customerUrl.value, '_blank')
}
onMounted(() => {
  init()
  refreshPlansScroll()
  window.addEventListener('resize', refreshPlansScroll)
})
onBeforeUnmount(() => {
  window.removeEventListener('resize', refreshPlansScroll)
})
</script>

<style scoped lang="less">
.price-page {
  position: relative;
  overflow: hidden;
  padding:var(--ui-padding-24-0);
  min-height: 100%;
  background:
    linear-gradient(180deg, rgba(43, 92, 217, 0.08) 0%, rgba(43, 92, 217, 0) 40%),
    #fafafa;
  &::after {
    right: -130px;
    background:
      linear-gradient(135deg, rgba(255, 187, 84, 0.36), rgba(43, 92, 217, 0.03) 70%),
      radial-gradient(circle at 32% 34%, rgba(255, 121, 25, 0.32), transparent 50%);
    transform: rotate(18deg);
  }
}

.price-layout {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  gap: 34px;
}

.pricing-hero {
  display: flex;
  flex-direction: column;
  gap: 18px;
  align-items: center;
}
.header-subtitle{
  margin-top: 12px;
  p {
    color: var(--ui-color-neutral-700);
    font-size: 14px;
  }
}
.account-summary {
  position: relative;
  display: flex;
  flex-direction: column;
  width: 100%;
  padding: var(--ui-padding-16-18);
  overflow: hidden;
  border-radius: var(--ui-radius-2xl);
  box-shadow: 0 14px 32px rgba(31, 45, 68, 0.055);
  background:
    rgba(255, 255, 255, 0.62);
  backdrop-filter: blur(100px);

  &::before {
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    width: 40%;
    background:
      radial-gradient(280px 130px at 45% 18%, rgba(255, 255, 255, 0.82), transparent 64%),
      radial-gradient(360px 150px at 78% 24%, rgba(43, 92, 217, 0.1), transparent 68%),
      radial-gradient(260px 120px at 50% 112%, rgba(213, 169, 79, 0.08), transparent 62%);
    opacity: 0.9;
    content: '';
    pointer-events: none;
  }

  > * {
    position: relative;
    z-index: 1;
  }

  h1 {
    color: var(--text-color);
    font-size: 20px;
    line-height: 1.25;
    font-weight: 750;
  }

  p {
    max-width: 460px;
    margin-top: 6px;
    color: var(--ui-color-neutral-700);
    line-height: 1.55;
  }
}

.summary-guide {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 10px;

  li {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: var(--ui-padding-5-9);
    color: #526179;
    background: rgba(255, 255, 255, 0.72);
    border: 1px solid rgba(220, 228, 240, 0.76);
    border-radius: var(--ui-radius-full);
    font-size: 12px;
    line-height: 1;

    .ivu-icon {
      color: #2f9e67;
    }
  }
}

.summary-top {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(480px, 560px);
  gap: 18px;
  align-items: center;
}

.summary-main {
  display: flex;
  min-height: 58px;
  min-width: 0;
  flex-direction: column;
  justify-content: center;
  padding: var(--ui-padding-0-4);
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
  margin-top: 0;

  > div {
    display: flex;
    min-height: 64px;
    flex-direction: column;
    justify-content: center;
    padding: var(--ui-padding-10-14);
    background: rgba(255, 255, 255, 0.86);
    border-radius: var(--ui-radius-6);
  }

  span {
    display: block;
    color: var(--grey-color);
    font-size: 12px;
  }

  strong {
    display: flex;
    align-items: baseline;
    gap: 3px;
    margin-top: 4px;
    color: var(--text-color);
    line-height: 1.25;

    b {
      color: var(--ui-color-neutral-900);
      font-size: 20px;
      font-weight: 800;
      font-variant-numeric: tabular-nums;
    }

    em {
      color: #7d8797;
      font-size: 13px;
      font-style: normal;
      font-weight: 650;
    }
  }
}

.section-title {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 24px;
  margin-bottom: 18px;
  .title{
    display: flex;
    align-items: center;
    gap: 10px;
    .iconfont{
      font-size:22px;
      color: var(--primary-color);
      line-height: 1;
    }
  }
  h2 {
    color: var(--text-color);
    font-size:22px;
    line-height: 1;
  }

  p {
    color: var(--grey-color);
  }
}

.plans-shell {
  position: relative;
  min-height: 220px;
  padding: 0;
}

.empty-plans {
  display: flex;
  min-height: 190px;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: var(--grey-color);
}

.plans-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 14px;
  width: 100%;
  max-width: 2056px;
  margin: 0 auto;
}

.plans-scroll {
  position: absolute;
  top: 50%;
  z-index: 2;
  display: inline-flex;
  width: var(--ui-size-40);
  height: var(--ui-size-40);
  padding: 0;
  align-items: center;
  justify-content: center;
  color: var(--ui-color-primary);
  background: var(--ui-color-surface);
  border: var(--ui-border-default);
  border-radius: var(--ui-radius-circle);
  box-shadow: var(--ui-shadow-neutral-floating);
  cursor: pointer;
  transform: translateY(-50%);
  transition:
    color var(--ui-motion-control) var(--ui-ease-standard),
    background-color var(--ui-motion-control) var(--ui-ease-standard),
    border-color var(--ui-motion-control) var(--ui-ease-standard);

  &:hover,
  &:focus-visible {
    color: var(--ui-color-text-inverse);
    background: var(--ui-color-primary);
    border-color: var(--ui-color-primary);
  }

  &:focus-visible {
    outline: var(--ui-outline-primary);
    outline-offset: 2px;
  }
}

.plans-scroll-prev {
  left: var(--ui-space-8);
}

.plans-scroll-next {
  right: var(--ui-space-8);
}

.plan-card {
  --plan-color: var(--ui-color-primary);
  --plan-color-dark: #2147aa;
  --plan-soft: #f5f7fb;

  position: relative;
  display: flex;
  width: 100%;
  min-width: 0;
  flex-direction: column;
  justify-self: center;
  padding: 16px 14px 14px;
  overflow: hidden;
  background:
    linear-gradient(180deg, rgba(248, 250, 253, 0.92) 0%, #fff 34%),
    #fff;
  border: 1px solid rgba(220, 228, 240, 0.92);
  border-radius: var(--ui-radius-xl);
  box-shadow: 0 8px 18px rgba(31, 45, 68, 0.045);
  transition: border-color 0.2s ease, box-shadow 0.2s ease, transform 0.2s ease;

  &::after {
    position: absolute;
    top: 16px;
    right: -28px;
    display: block;
    width: var(--ui-size-86);
    height: var(--ui-size-86);
    background: radial-gradient(circle, rgba(43, 92, 217, 0.08) 0%, rgba(43, 92, 217, 0) 68%);
    content: '';
    pointer-events: none;
  }

  &:hover {
    border-color: rgba(43, 92, 217, 0.22);
    box-shadow: 0 12px 24px rgba(31, 45, 68, 0.07);
    transform: translateY(-2px);
  }

  &.recommended {
    background: #fff;
  }

  &.tone-blue {
    --plan-color: var(--ui-color-primary);
    --plan-color-dark: #2147aa;
    --plan-soft: #f5f7fb;
  }

  &.tone-purple {
    --plan-color: var(--ui-color-primary);
    --plan-color-dark: #2147aa;
    --plan-soft: #f6f8fc;
  }

  &.tone-amber {
    --plan-color: var(--ui-color-primary);
    --plan-color-dark: #2147aa;
    --plan-soft: #f5f7fb;
  }

  &.tone-indigo {
    --plan-color: var(--ui-color-primary);
    --plan-color-dark: #2147aa;
    --plan-soft: #f6f8fc;
  }

  &.current {
    --plan-color: #111827;
    --plan-color-dark: #020617;

    background:
      linear-gradient(180deg, #fffaf0 0%, #fff 38%),
      #fff;
    border-color: rgba(213, 169, 79, 0.5);
    box-shadow: 0 16px 34px rgba(17, 24, 39, 0.1);

    .plan-head {
      background: transparent;
      min-height: 34px;
      padding: 4px 88px 10px 0;
    }

    .plan-head h3 {
      color: var(--ui-color-text);
    }

    .price-row {
      color: var(--ui-color-gold-800);
      background: transparent;
      border-color: transparent;
    }
    .plan-stats{
      color: var(--ui-color-gold-800);
      background: #fff2df;
    }
    :deep(.ivu-btn-primary) {
      color: var(--ui-color-gold-100);
      background: #111827;
      border-color: #111827;

      &:hover {
        color: #fff2c8;
        background: #020617;
        border-color: #020617;
      }
    }
  }

  :deep(.ivu-btn-primary) {
    background: #2f5fd1;
    border-color: #2f5fd1;

    &:hover {
      background: #244cad;
      border-color: #244cad;
    }
  }
}

.plan-ribbon {
  position: absolute;
  top: 8px;
  right: 8px;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: var(--ui-padding-4-8);
  color: var(--ui-color-gold-100);
  background: linear-gradient(135deg, #0f172a 0%, #1f2937 100%);
  border: 1px solid rgba(241, 213, 138, 0.36);
  border-radius: var(--ui-radius-6);
  box-shadow: 0 8px 18px rgba(17, 24, 39, 0.24);
  font-size: 12px;
  font-weight: 700;
}

.plan-head {
  display: flex;
  min-height: 34px;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin: var(--ui-margin-0-0-10);
  padding: 4px 0 10px;
  background: transparent;

  h3 {
    color: var(--text-color);
    font-size: 16px;
    font-weight: 750;
    line-height: 1.3;
  }

  :deep(.ivu-tag) {
    color: var(--primary-color);
    background: #eef4ff;
    border-color: #dbe7f7;
  }
}

.plan-title-group {
  display: grid;
  flex: 1;
  min-width: 0;

  h3 {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}

.price-row {
  position: relative;
  display: flex;
  min-height: 50px;
  align-items: baseline;
  gap: 4px;
  margin-top: 0;
  padding: 6px 0 12px;
  background: transparent;
  border: var(--ui-border-transparent);
  border-radius: 0;
  color: #2f5fd1;
  span {
    position: relative;
    bottom: 0;
    font-size: 14px;
    font-weight: 750;
  }

  strong {
    flex: none;
    color: inherit;
    font-size: 24px;
    line-height: 1.05;
    font-weight: 800;
    white-space: nowrap;
    word-break: normal;
  }

  .price-amount {
    font-size: 32px;
    line-height: 1;
  }

  em {
    position: relative;
    color: var(--grey-color);
    font-style: normal;
    white-space: nowrap;
  }
}
.plan-stats{
  background: #f4f7fb;
  padding: var(--ui-padding-6-12);
  border-radius:var(--ui-radius-6);
}
.fee-list {
  margin:var(--ui-margin-12-0);
  dl {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 8px;
    padding:6px 0;

    &:last-child {
      border-bottom: none;
    }
  }

  dt {
    color: var(--grey-color);
    white-space: nowrap;
  }

  dd {
    min-width: 0;
    color: var(--text-color);
    font-weight: 650;
    text-align: right;
    word-break: break-word;

    &.free {
      color: var(--grey-color);
      font-weight: 400;
    }
  }
}

.detail-section {
  display: block;
}

.rule-card {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 340px;
  gap: 32px;
  align-items: start;
  padding: var(--ui-padding-24);
  background: #fff;
  border-radius: var(--ui-radius-2xl);
}

.rule-main {
  min-width: 0;
}

.rule-head {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--primary-color);

  h3 {
    color: var(--text-color);
    font-size: 18px;
  }
}

.rule-list {
  display: grid;
  gap: 10px;
  margin-top: 16px;
  p {
    display: flex;
    gap: 10px;
    color: var(--ui-color-neutral-700);
  }
  span {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex: 0 0 22px;
    width: var(--ui-size-22);
    height: var(--ui-size-22);
    color: #5d6b82;
    background: #eef3fa;
    border: 1px solid #dbe4f0;
    border-radius: var(--ui-radius-xl);
    font-size: 12px;
    font-weight: 750;
  }
}

.service-card {
  display: flex;
  min-height: 100%;
  flex-direction: column;
  justify-content: center;
  padding: 4px 0 4px 24px;
  border-left: 1px solid #e3e9f2;

  .service-kicker {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .service-icon {
    display: inline-flex;
    width: var(--ui-size-28);
    height: var(--ui-size-28);
    align-items: center;
    justify-content: center;
    flex: none;
    color: var(--primary-color);
    background: #eef3ff;
    border: 1px solid #dbe5fb;
    border-radius: var(--ui-radius-7);
  }

  .service-content {
    min-width: 0;
  }

  .service-kicker > span:last-child {
    color: #66748a;
    font-size: 12px;
    font-weight: 650;
    letter-spacing: .04em;
  }

  h3 {
    margin-top: 12px;
    color: var(--text-color);
    font-size: 17px;
    line-height: 1.4;
  }

  p {
    margin-top: 6px;
    color: var(--grey-color);
    line-height: 1.65;
  }

  .service-action {
    min-width: 112px;
    height: var(--ui-size-36);
    margin-top: 14px;
    color: var(--primary-color);
    background: transparent;
    border-color: #cbd8f5;
    font-weight: 650;

    &:hover,
    &:focus-visible {
      color: var(--ui-color-text-inverse);
      background: var(--primary-color);
      border-color: var(--primary-color);
    }

    .ivu-icon {
      margin-left: 4px;
    }
  }
}

@media (prefers-reduced-motion: reduce) {
  .plan-card {
    transition: none;
  }
}

@media screen and (min-width: 769px) {
  .plans-grid.scrollable-plans {
    grid-template-columns: none;
    grid-auto-columns: calc(23.5% - 10.5px);
    grid-auto-flow: column;
    justify-content: start;
    overflow-x: auto;
    overscroll-behavior-inline: contain;
  }
}

@media screen and (max-width: 768px) {
  .price-page {
    padding: 28px 0 44px;
  }

  .price-layout {
    min-width: 100%;
    gap: 22px;
    padding: var(--ui-padding-0-15);
  }

  .pricing-hero,
  .detail-section {
    grid-template-columns: 1fr;
  }

  .hero-content,
  .account-summary {
    padding: 0;
  }

  .account-summary {
    padding: var(--ui-padding-14);

    &::before {
      display: none;
    }
  }

  .summary-top {
    grid-template-columns: 1fr;
  }

  .summary-grid {
    grid-template-columns: 1fr;
  }

  .summary-guide {
    display: none;
  }

  .hero-content {
    h1 {
      font-size: 30px;
      line-height: 1.22;
    }

    p {
      font-size: 14px;
      line-height: 1.75;
    }
  }

  .section-title {
    display: block;

    p {
      margin-top: 8px;
      text-align: left;
    }
  }

  .plans-shell {
    padding: 0;
  }

  .plans-grid {
    grid-template-columns: 1fr;
  }

  .plans-scroll {
    display: none;
  }

  .plan-card {
    padding: var(--ui-padding-16);
  }

  .plan-head {
    min-height: auto;
    margin: var(--ui-margin-0-0-16);
    padding: 2px 0 16px;
  }

  .price-row strong {
    font-size: 29px;
  }

  .rule-card {
    grid-template-columns: 1fr;
    padding: var(--ui-padding-18);
  }

  .service-card {
    min-height: 0;
    justify-content: flex-start;
    padding: 18px 0 0;
    border-top: 1px solid #e3e9f2;
    border-left: 0;

    .service-icon {
      width: var(--ui-size-28);
      height: var(--ui-size-28);
    }

    .service-action {
      min-height: 40px;
    }
  }
}
</style>
