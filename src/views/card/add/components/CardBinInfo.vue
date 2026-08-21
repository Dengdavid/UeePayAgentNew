<template>
  <div class="card-bin-info">
    <Row class="card-info-grid">
      <Col :xs="12" :sm="6" class="card-info-item">
        <p class="ui-text-grey mb-5">{{ $t('card.index.opening.binInfo.network') }}</p>
        <CardNumber :type="bin.network" :encrypt="false">{{ bin.network }}</CardNumber>
      </Col>
      <Col :xs="12" :sm="6" class="card-info-item">
        <p class="ui-text-grey mb-5">{{ $t('card.index.opening.binInfo.issuerCountry') }}</p>
        <p>{{ bin.country }}</p>
      </Col>
      <Col :xs="12" :sm="6" class="card-info-item">
        <p class="ui-text-grey mb-5">{{ $t('card.index.opening.binInfo.currency') }}</p>
        <p>{{ bin.currency }}</p>
      </Col>
      <Col :xs="12" :sm="6" class="card-info-item">
        <p class="ui-text-grey mb-5">{{ $t('card.index.opening.binInfo.spendingLimit') }}</p>
        <p>{{ bin.lifetime_purchase_limit || $t('card.index.opening.binInfo.unlimited') }}</p>
      </Col>
    </Row>

    <Row class="card-info-grid">
      <Col :xs="12" :sm="6" class="card-info-item">
        <p class="ui-text-grey mb-5">{{ $t('card.index.opening.binInfo.avs') }}</p>
        <p>{{ bin.avs ? $t('card.index.opening.binInfo.supported') : $t('card.index.opening.binInfo.unsupported') }}</p>
      </Col>
      <Col :xs="12" :sm="6" class="card-info-item">
        <p class="ui-text-grey mb-5">{{ $t('card.index.opening.binInfo.threeDs') }}</p>
        <p>{{ bin['3ds'] ? $t('card.index.opening.binInfo.supported') : $t('card.index.opening.binInfo.unsupported') }}</p>
      </Col>
      <Col :xs="12" :sm="6" class="card-info-item">
        <p class="ui-text-grey mb-5">Apple Pay</p>
        <p>{{ bin.apple_pay ? $t('card.index.opening.binInfo.supported') : $t('card.index.opening.binInfo.unsupported') }}</p>
      </Col>
      <Col :xs="12" :sm="6" class="card-info-item">
        <p class="ui-text-grey mb-5">Google Wallet</p>
        <p>{{ bin.google_wallet ? $t('card.index.opening.binInfo.supported') : $t('card.index.opening.binInfo.unsupported') }}</p>
      </Col>
    </Row>

    <Row v-if="bin.allow_create_count >= 0" class="card-info-grid">
      <Col :xs="12" :sm="6" class="card-info-item">
        <p class="ui-text-grey mb-5">{{ $t('card.index.opening.binInfo.remainingCards') }}</p>
        <p>{{ $t('cardTag.cardCount', { count: bin.allow_create_count }) }}</p>
      </Col>
    </Row>

    <div class="card-fee-section">
      <div class="card-info-section-title">{{ $t('card.index.opening.binInfo.feeSchedule') }}</div>
      <div class="card-fee-list">
        <div v-for="item in feeItems" :key="item.label" class="card-fee-item">
          <Tooltip :content="item.tip" :placement="isPhone ? 'right' : 'top'" :max-width="item.maxWidth">
            <span class="fee-label">{{ item.label }}</span>
          </Tooltip>
          <span class="card-fee-value">{{ item.value }}</span>
        </div>
      </div>
      <div class="card-extra-charges" v-html="bin.charges"></div>
      <UiNotice class="card-fee-notice">
        {{ $t('card.index.opening.binInfo.issuerFeeNotice') }}
      </UiNotice>
    </div>

    <template v-if="bin.scenes?.length">
      <div class="scene-section">
        <p class="mb-10">{{ $t('card.index.opening.binInfo.recommendedScenarios') }}</p>
        <div
          ref="sceneListRef"
          class="scene-list"
          :style="{
            maxHeight: isExpanded || !hasSceneOverflow
              ? 'none'
              : `${sceneCollapsedHeight}px`,
          }"
        >
          <Tag
            v-for="(item, index) in bin.scenes"
            :key="`${item}-${index}`"
            color="geekblue"
            size="medium"
          >
            {{ item }}
          </Tag>
        </div>
      </div>
      <Divider v-if="hasSceneOverflow">
        <a class="expand-btn" @click="isExpanded = !isExpanded">
          {{ isExpanded ? $t('card.index.opening.binInfo.collapsePlatforms') : $t('card.index.opening.binInfo.expandPlatforms') }}
        </a>
      </Divider>
    </template>
  </div>
</template>

<script setup>
import CardNumber from '@/components/ui/card-number.vue'
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { isPhone } from '@/utils/device'
import { t } from '@/utils'

const props = defineProps({
  bin: {
    type: Object,
    default: () => ({}),
  },
})

const formatFeeConfig = (config) => {
  const entries = config ? Object.entries(config) : []
  if (!entries.length) return t('card.index.opening.binInfo.free')

  const feeTexts = entries
    .map(([range, feeInfo]) => {
      const parts = []
      if (feeInfo.fee > 0) parts.push(t('card.index.opening.binInfo.perTransaction', { amount: feeInfo.fee }))
      if (feeInfo.fee_rate > 0) {
        const percentage = feeInfo.fee_rate * 100
        const formattedPercentage = percentage % 1 === 0
          ? percentage.toFixed(0)
          : percentage.toFixed(2).replace(/\.?0+$/, '')
        parts.push(`${formattedPercentage}%`)
      }
      if (feeInfo.fee === 0 && feeInfo.fee_rate === 0) parts.push(t('card.index.opening.binInfo.free'))
      if (!parts.length) return null
      if (entries.length === 1) return parts.join(' + ')

      const [min, max] = range.split('-')
      return t('card.index.opening.binInfo.feeRange', { min, max, fee: parts.join(' + ') })
    })
    .filter(Boolean)

  return feeTexts.length ? feeTexts.join('; ') : t('card.index.opening.binInfo.free')
}

const feeItems = computed(() => [
  {
    label: t('card.index.opening.binInfo.refundFee'),
    tip: t('card.index.opening.binInfo.refundFeeTip'),
    maxWidth: 300,
    value: formatFeeConfig(props.bin.refund_fee_config),
  },
  {
    label: t('card.index.opening.binInfo.reversalFee'),
    tip: t('card.index.opening.binInfo.reversalFeeTip'),
    maxWidth: 400,
    value: formatFeeConfig(props.bin.reversal_fee_config),
  },
  {
    label: t('card.index.opening.binInfo.foreignFee'),
    tip: t('card.index.opening.binInfo.foreignFeeTip'),
    maxWidth: 400,
    value: formatFeeConfig(props.bin.foreign_fee_config),
  },
  {
    label: t('card.index.opening.binInfo.authorizationFee'),
    tip: t('card.index.opening.binInfo.authorizationFeeTip'),
    maxWidth: 300,
    value: formatFeeConfig(props.bin.auth_fee_config),
  },
  {
    label: t('card.index.opening.binInfo.withdrawalFee'),
    tip: t('card.index.opening.binInfo.withdrawalFeeTip'),
    maxWidth: 300,
    value: t('card.index.opening.binInfo.free'),
  },
])

const isExpanded = ref(false)
const sceneListRef = ref(null)
const hasSceneOverflow = ref(false)
const sceneCollapsedHeight = ref(0)
let sceneResizeObserver = null

const updateSceneOverflow = () => {
  nextTick(() => {
    const sceneList = sceneListRef.value
    if (!sceneList) {
      hasSceneOverflow.value = false
      sceneCollapsedHeight.value = 0
      return
    }

    const tags = Array.from(sceneList.children)
    const rowTops = [...new Set(tags.map((tag) => tag.offsetTop))].sort((a, b) => a - b)
    hasSceneOverflow.value = rowTops.length > 4

    if (!hasSceneOverflow.value) {
      sceneCollapsedHeight.value = sceneList.scrollHeight
      isExpanded.value = false
      return
    }

    const fourthRowTop = rowTops[3]
    const fourthRowTags = tags.filter((tag) => tag.offsetTop === fourthRowTop)
    sceneCollapsedHeight.value = Math.ceil(Math.max(...fourthRowTags.map((tag) => {
      const marginBottom = Number.parseFloat(window.getComputedStyle(tag).marginBottom) || 0
      return tag.offsetTop + tag.offsetHeight + marginBottom
    })))
  })
}

const observeSceneList = () => {
  sceneResizeObserver?.disconnect?.()
  if (!sceneListRef.value || typeof ResizeObserver === 'undefined') return
  sceneResizeObserver = new ResizeObserver(updateSceneOverflow)
  sceneResizeObserver.observe(sceneListRef.value)
}

watch(
  () => props.bin.scenes,
  () => {
    isExpanded.value = false
    updateSceneOverflow()
    nextTick(observeSceneList)
  },
  { deep: true, flush: 'post' },
)

onMounted(() => {
  updateSceneOverflow()
  nextTick(observeSceneList)
})

onBeforeUnmount(() => sceneResizeObserver?.disconnect?.())
</script>

<style scoped lang="less">
.card-bin-info {
  margin-bottom: 24px;
  padding: 18px 20px;
  background: #f6f8fc;
  border: var(--ui-border-subtle);
  border-radius: var(--ui-radius-lg);
  color: var(--ui-color-text);
}

.card-info-grid {
  row-gap: 18px;

  & + & {
    margin-top: 18px;
  }
}

.card-info-item {
  min-width: 0;
  padding-right: 16px;

  > p:last-child {
    color: var(--ui-color-text);
    font-variant-numeric: tabular-nums;
  }
}

.support-status {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  min-height: 23px;
  padding: 1px 8px 1px 3px;
  border: 1px solid #fff;
  border-radius: var(--ui-radius-2xl);
  background: linear-gradient(180deg, #fff8f7 0%, #fff0ee 100%);
  box-shadow: var(--ui-shadow-card-bin-error);
  color: var(--error-color);
  font-size: 12px;
  font-weight: 500;
  line-height: 20px;

  &.supported {
    background: linear-gradient(180deg, #f7fffa 0%, #eaf9f1 100%);
    box-shadow: var(--ui-shadow-card-bin-success);
    color: var(--ui-color-success);

    .status-icon {
      background: var(--ui-color-success);
    }
  }
}

.status-icon {
  display: inline-flex;
  flex: 0 0 14px;
  align-items: center;
  justify-content: center;
  width: 14px;
  height: 14px;
  border-radius: var(--ui-radius-circle);
  background: var(--error-color);
  box-shadow: var(--ui-shadow-card-bin-danger);
  color: var(--ui-color-text-inverse);
}

.card-info-section-title {
  margin-bottom: 10px;
  color: var(--ui-color-text);
  font-size: 13px;
  font-weight: 500;
}

.card-fee-section {
  margin-top: 20px;
  padding-top: 16px;
  border-top: 1px solid #e5eaf2;
}

.card-fee-list {
  display: grid;
  grid-template-columns: max-content minmax(0, 1fr);
  align-items: start;
  column-gap: 12px;
  row-gap: 7px;
}

.card-fee-item {
  display: contents;
  color: var(--ui-color-text-muted);

  :deep(.ivu-tooltip) {
    min-width: 0;
    max-width: 100%;
  }
}

.card-fee-value,
.card-extra-charges {
  color: var(--ui-color-control-text);
  font-variant-numeric: tabular-nums;
}

.card-fee-value,
.fee-label {
  min-height: 20px;
  line-height: 20px;
}

.fee-label {
  display: block;
  white-space: nowrap;
  cursor: help;
  text-decoration: underline dashed;
  text-decoration-thickness: 1px;
  text-underline-offset: 3px;
}

.card-extra-charges {
  margin-top: 8px;
  line-height: 20px;
}

.card-fee-notice {
  margin-top: 12px;
}

.scene-section {
  margin-top: 20px;
  padding-top: 10px;
}

.scene-list {
  position: relative;
  overflow: hidden;
}

.expand-btn {
  color: var(--ui-color-text-muted);
}

@media screen and (max-width: 768px) {
  .card-bin-info {
    padding: var(--ui-padding-16);
  }

  .card-info-grid {
    row-gap: 16px;
  }
}
</style>
