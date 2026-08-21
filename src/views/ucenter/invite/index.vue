<template>
  <UiPage :data="detailData" row-key="id">
    <template #tbody>
       <div class="invite-page">
          <div class="invite-hero">
            <div class="invite-link-panel">
              <div class="panel-title">
                <div class="panel-title-main">
                  <Icon type="md-share" size="18" />
                  <h3>{{ $t('invite.linkTitle') }}</h3>
                </div>
                <span
                  class="rate-badge"
                  :title="$t('invite.commissionRate', { rate: commissionRate })"
                >
                  {{ $t('invite.commissionRate', { rate: commissionRate }) }}
                </span>
              </div>
              <div class="invite-url-box">
                <Ellipsis class="invite-url-text" :lines="1" :text="inviteUrl" tooltip />
                <Button type="primary" class="copy-btn" :class="{ 'is-copied': copied }" @click="handleCopy">
                  <Icon v-if="!copied" type="md-copy" size="16" />
                  <span>{{ copied ? $t('invite.copied') : $t('invite.copyLink') }}</span>
                </Button>
              </div>
              <div class="benefit-grid">
                <div>
                  <span>{{ $t('invite.newUserBenefit') }}</span>
                  <strong>{{ $t('invite.cardDiscount', { rate: user.invite_discount_rate || 0 }) }}</strong>
                </div>
                <div>
                  <span>{{ $t('invite.ongoingCommission') }}</span>
                  <strong>{{ $t('invite.commissionDescription') }}</strong>
                </div>
              </div>
            </div>
            <div class="invite-metric-panel">
              <div class="metric-main">
                <div class="metric-head">
                  <span>{{ $t('invite.totalCommission') }}</span>
                </div>
                <div class="metric-value-row">
                  <div class="amount-row">
                    <span class="amount-currency">$</span>
                    <CountUp class="amount-value" :end="stats.total_amount || 0" :options="{ useGrouping: true }" :duration="1.5" :decimals="2" />
                  </div>
                  <Button class="withdraw-btn" @click="toRoute('withdraw')">
                    <span>{{ $t('invite.withdrawal') }}</span>
                    <Icon type="md-arrow-forward" size="14" />
                  </Button>
                </div>
              </div>
              <div class="metric-divider"></div>
              <div class="metric-grid">
                <div>
                  <span>{{ $t('invite.referrals') }}</span>
                  <strong>
                    <span class="metric-number">{{ stats.invite_number || 0 }}</span>
                    <span class="metric-unit">{{ $t('invite.peopleUnit') }}</span>
                  </strong>
                </div>
                <div>
                  <span>{{ $t('invite.referredCards') }}</span>
                  <strong>
                    <span class="metric-number">{{ stats.card_number || 0 }}</span>
                    <span class="metric-unit">{{ $t('invite.cardUnit') }}</span>
                  </strong>
                </div>
              </div>
            </div>
          </div>
        </div>
    </template>
  </UiPage>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useUserStore } from '@/store/user.js'
import { userApi } from '@/api'
import { Copy } from 'view-ui-plus'
import { toRoute } from '@/utils/route.js'
import { t } from '@/utils'

const userStore = useUserStore()
const { user, inviteUrl } = storeToRefs(userStore)

const stats = ref({})
const copied = ref(false)
let copyTimer = null

const typeList = {
  invite: t('invite.types.invite'),
  transfer: t('invite.types.transfer'),
  package: t('invite.types.package'),
  invite_cashback: t('invite.types.cashback')
}

const commissionRate = computed(() => {
  return user.value.package_commission_rate || 0
})

const formatNum = (value) => {
  if (!value) return 0
  return Number(value.toString().replace(/,/g, '')) || 0
}

const formatAmountText = (value) => {
  const amount = formatNum(value)
  return `${amount >= 0 ? '+' : '-'}${Math.abs(amount).toFixed(2)}`
}

const detailData = computed(() => ({
  apiUrl: '/user/inviteList',
  statusKey: 'type',
  status: [
    {
      label: t('invite.types.all'),
      value: '',
    },
    ...Object.entries(typeList).map(([value, label]) => ({
      label,
      value,
    })),
  ],
  search: {
    type: '',
    invited_nickname: '',
  },
  searchThead: [
    {
      label: t('invite.creditedDate'),
      type: 'daterange',
      startKey: 'startTime',
      endKey: 'endTime',
      maxMonths: 1,
      width: 230,
    },
    {
      label: t('invite.username'),
      prop: 'invited_nickname',
      type: 'input',
      clearable: true,
      width: 220,
    },
  ],
  thead: [
    {
      label: t('invite.creditedAt'),
      prop: 'updated_at',
      width: 180,
      wapType: 'title',
    },
    {
      label: t('invite.username'),
      prop: 'invited_nickname',
      minWidth: 140,
    },
    {
      label: t('invite.type'),
      prop: 'type',
      width: 120,
      options: typeList,
      value: (row) => typeList[row.type] || row.type || '-',
      style: () => ({
        color: 'var(--primary-color)',
      }),
    },
    {
      label: t('invite.amount'),
      prop: 'amount',
      unit: '$',
      width: 130,
    },
    {
      label: t('invite.description'),
      prop: 'summary',
      minWidth: 260,
    },
  ],
}))

const init = () => {
  userApi.inviteStatistics().then(res => {
    const data = {}
    Object.keys(res || {}).forEach(key => {
      data[key] = formatNum(res[key])
    })
    stats.value = data
  }).catch(() => {
    stats.value = {}
  })
}

const handleCopy = () => {
  Copy({ text: inviteUrl.value })
  copied.value = true
  if (copyTimer) {
    clearTimeout(copyTimer)
  }
  copyTimer = window.setTimeout(() => {
    copied.value = false
    copyTimer = null
  }, 1400)
}

onMounted(() => {
  init()
})

onBeforeUnmount(() => {
  if (copyTimer) {
    clearTimeout(copyTimer)
  }
})
</script>

<style scoped lang="less">
.invite-page{
  color: var(--ui-color-text);
}
.invite-hero{
  --invite-gap: 16px;
  --invite-side-gap: 24px;
  --invite-title-height: 30px;
  --invite-main-height: 48px;
  --invite-footer-height: 44px;
  display: grid;
  grid-template-columns: minmax(0, 1fr) 350px;
  gap: var(--invite-side-gap);
  padding: var(--invite-side-gap);
  border: var(--ui-border-primary-muted);
  border-radius: var(--ui-radius-lg);
  background: linear-gradient(135deg, #f7fbff 0%, #fff 46%, #f5f8ff 100%);
  box-shadow: 0 8px 20px rgba(31, 45, 77, 0.035);
}
.invite-link-panel{
  display: grid;
  grid-template-rows: minmax(var(--invite-title-height), auto) var(--invite-main-height) var(--invite-footer-height);
  row-gap: var(--invite-gap);
  min-width: 0;
  padding-right: var(--invite-side-gap);
  border-right: 1px solid #e8edf5;
}
.panel-title{
  display: flex;
  flex-wrap: nowrap;
  align-items: center;
  gap: 8px;
  min-width: 0;
  min-height: var(--invite-title-height);
  .panel-title-main{
    flex-shrink: 0;
    min-width: 0;
    display: flex;
    align-items: center;
    gap: 8px;
  }
  h3{
    flex: none;
    margin: 0;
    color: var(--ui-color-neutral-900);
    font-size: 15px;
    line-height: 22px;
    white-space: nowrap;
  }
  :deep(.ivu-icon){
    color: var(--primary-color);
  }
}
.rate-badge{
  flex: 0 1 auto;
  min-width: 0;
  max-width: 100%;
  margin-left: auto;
  min-height: 24px;
  padding: 2px 11px;
  border: 1px solid #dbe8ff;
  border-radius: var(--ui-radius-2xl);
  color: var(--primary-color);
  font-size: 12px;
  line-height: 18px;
  font-weight: 600;
  background: #f2f7ff;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}
.invite-url-box{
  display: flex;
  align-items: center;
  gap: 10px;
  height: var(--invite-main-height);
  padding: 5px 5px 5px 16px;
  border: var(--ui-border-primary-muted);
  border-radius: var(--ui-radius-lg);
  background: #fff;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
  &:hover{
    border-color: #c5d7f8;
    box-shadow: 0 4px 12px rgba(43, 92, 217, 0.06);
  }
}
.invite-url-text{
  flex: 1;
  min-width: 0;
  color: #52627a;
  font-size: 13px;
  line-height: 22px;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace;
}
.copy-btn{
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 5px;
  justify-content: center;
  height: var(--ui-size-34);
  min-width: 98px;
  padding: var(--ui-padding-0-14);
  border-radius: var(--ui-radius-6);
  overflow: hidden;
  transition: transform 0.18s ease, box-shadow 0.18s ease, background-color 0.18s ease, border-color 0.18s ease;
  &:after{
    content: '';
    position: absolute;
    inset: -1px;
    background: linear-gradient(120deg, transparent 0%, rgba(255, 255, 255, 0.36) 48%, transparent 72%);
    transform: translateX(-120%);
    pointer-events: none;
  }
  &.is-copied{
    transform: translateY(-1px) scale(1.02);
    color: var(--ui-color-text-inverse);
    border-color: #20a464;
    background: #20a464;
    box-shadow: 0 8px 18px rgba(32, 164, 100, 0.2);
    &:hover,
    &:focus,
    &:active{
      color: var(--ui-color-text-inverse);
      border-color: #20a464;
      background: #20a464;
    }
    &:after{
      animation: copy-flash 0.48s ease;
    }
  }
}
.benefit-grid{
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: var(--invite-side-gap);
  align-items: start;
  min-height: var(--invite-footer-height);
  span{
    display: block;
    color: #8793a8;
    font-size: 12px;
    line-height: 18px;
  }
  strong{
    display: block;
    margin-top: 4px;
    color: var(--ui-color-text);
    font-size: 13px;
    line-height: 20px;
  }
}
.invite-metric-panel{
  display: grid;
  row-gap: 10px;
  min-width: 0;
}
.metric-main{
  display: grid;
  row-gap: 4px;
}
.metric-head{
  display: flex;
  align-items: center;
  color: var(--ui-color-neutral-500);
  font-size: 12px;
  line-height: 18px;
  min-height: 18px;
  >span{
    padding-top: 0;
  }
}
.metric-value-row{
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  min-height: 40px;
}
.withdraw-btn{
  display: inline-flex;
  align-items: center;
  gap: 4px;
  height: var(--ui-size-30);
  padding: 0 13px;
  color: var(--ui-color-text-inverse);
  border-color: #111827;
  background: #111827;
  border-radius: var(--ui-radius-15);
  &:hover{
    color: var(--ui-color-text-inverse);
    border-color: #263142;
    background: #263142;
  }
}
.amount-row{
  display: flex;
  align-items: baseline;
  gap: 1px;
  color: var(--ui-color-neutral-900);
  font-size: 24px;
  line-height: 30px;
  font-weight: 700;
  letter-spacing: 0;
  .amount-currency,
  .amount-value{
    color: var(--ui-color-text);
    font-size: 24px;
    line-height: 30px;
    font-weight: 700;
  }
}
.metric-divider{
  height: var(--ui-size-1);
  background: #edf1f7;
}
.metric-grid{
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: var(--invite-side-gap);
  align-items: start;
  min-height: 52px;
  >div{
    display: grid;
    row-gap: 4px;
    align-content: start;
  }
  >div>span{
    display: block;
    color: var(--ui-color-neutral-500);
    font-size: 12px;
    line-height: 18px;
  }
  strong{
    display: flex;
    align-items: baseline;
    gap: 4px;
    margin-top: 0;
    color: var(--ui-color-text);
    font-size: 24px;
    line-height: 30px;
    font-weight: 700;
  }
  .metric-number{
    color: var(--ui-color-text);
    font-size: 24px;
    line-height: 30px;
    font-weight: 700;
  }
  .metric-unit{
    color: #9aa4b5;
    font-size: 13px;
    line-height: 18px;
    font-weight: 500;
  }
  em{
    display: block;
    margin-top: 5px;
    color: var(--ui-color-neutral-500);
    font-size: 12px;
    line-height: 18px;
    font-style: normal;
  }
}
@keyframes copy-flash {
  0% {
    transform: translateX(-120%);
  }
  100% {
    transform: translateX(120%);
  }
}
@media screen and (max-width: 768px) {
  .invite-hero{
    --invite-gap: 14px;
    --invite-side-gap: 16px;
    grid-template-columns: 1fr;
    gap: var(--invite-gap);
    padding: var(--invite-side-gap);
  }
  .invite-link-panel{
    grid-template-rows: auto;
    row-gap: 12px;
    padding-right: 0;
    padding-bottom: 0;
    border-right: none;
    border-bottom: none;
  }
  .panel-title{
    flex-direction: column;
    align-items: stretch;
    min-height: auto;
    .panel-title-main{
      width: 100%;
      h3{
        min-width: 0;
        flex: 1;
        white-space: normal;
        overflow-wrap: anywhere;
      }
    }
    .rate-badge{
      margin-left: 0;
      align-self: flex-start;
      max-width: 100%;
      height: auto;
      min-height: 24px;
      white-space: normal;
      line-height: 18px;
      padding: var(--ui-padding-3-10);
    }
  }
  .invite-url-box{
    align-items: stretch;
    flex-direction: column;
    height: auto;
    gap: 10px;
    padding: var(--ui-padding-12);
  }
  .copy-btn{
    justify-content: center;
    width: 100%;
  }
  .benefit-grid{
    grid-template-columns: repeat(2, minmax(0, 1fr));
    min-height: auto;
    gap: 12px;
  }
  .invite-metric-panel{
    display: flex;
    flex-direction: column;
    gap: 16px;
    padding: var(--ui-padding-16);
    border: 1px solid #d8e6fb;
    border-radius: var(--ui-radius-lg);
    background: rgba(255, 255, 255, 0.9);
    box-shadow: 0 6px 16px rgba(31, 45, 77, 0.04);
  }
  .metric-main{
    display: grid;
    grid-template-columns: minmax(0, 1fr);
    gap: 4px;
  }
  .metric-head{
    display: flex;
    min-height: auto;
    >span{
      align-self: auto;
    }
  }
  .metric-value-row{
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    min-height: 40px;
  }
  .withdraw-btn{
    align-self: center;
  }
  .amount-row{
    align-items: center;
    min-height: auto;
  }
  .metric-divider{
    display: block;
    margin: -2px 0;
  }
  .metric-grid{
    min-height: auto;
    gap: 0;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    padding-top: 2px;
    >div{
      padding: 0;
      border: none;
      border-radius: 0;
      background: transparent;
      &:not(:first-child){
        padding-left: 16px;
        border-left: 1px solid #e8edf5;
      }
    }
  }
}
@media screen and (max-width: 420px) {
  .benefit-grid{
    grid-template-columns: 1fr;
  }
}
</style>
