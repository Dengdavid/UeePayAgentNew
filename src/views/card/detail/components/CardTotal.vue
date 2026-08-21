<template>
  <div class="card-account-box">
    <div class="left">
      <dl>
        <dt>
          <span>{{ $t('card.index.detail.statistics.availableBalance') }}</span>
          <button
            class="refresh-btn"
            :class="{ refreshing }"
            type="button"
            :disabled="refreshing"
            :aria-label="refreshing ? $t('card.index.detail.statistics.refreshingBalance') : $t('card.index.detail.statistics.refreshBalance')"
            @click="refresh"
          >
            <Icon type="md-refresh" size="18" />
          </button>
        </dt>
        <dd>
          <span class="unit">$</span>
          <span class="money">{{ card.available ?? '0.000' }}</span>
        </dd>
      </dl>
    </div>
    <div class="right">
      <div class="times-wrap">
        <button v-show="canScrollTimesPrev" type="button" class="times-scroll times-scroll--prev" :aria-label="$t('button.prevStep')" @click="scrollTimes(-1)">
          <Icon type="ios-arrow-back" />
        </button>
        <div ref="timesRef" class="times" :class="{ hasPrev: canScrollTimesPrev, hasNext: canScrollTimesNext }" @scroll.passive="updateTimesScrollButtons">
          <div class="times-item" :class="{
            active:dayType===item.value
          }" v-for="item in dayTypeOptions" :key="item.value" @click="changeDayType(item, $event)">
            {{ $t(item.labelKey) }}
          </div>
        </div>
        <button v-show="canScrollTimesNext" type="button" class="times-scroll times-scroll--next" :aria-label="$t('button.nextStep')" @click="scrollTimes(1)">
          <Icon type="ios-arrow-forward" />
        </button>
      </div>
      <div class="card-dlText">
        <dl v-for="item in list" :key="item.key">
          <dt :title="`${dayTypeName}${$t(item.labelKey)}`">
            <span>{{ dayTypeName }}{{ $t(item.labelKey) }}：</span>
          </dt>
          <dd class="ui-text-grey" v-if="loading">{{ $t('card.index.detail.statistics.loading') }}</dd>
          <dd class="list-r-2" v-else>
            <span class="unit">$</span>
            <span class="money">{{ stats[item.key] ?? '0.000' }}</span>
          </dd>
        </dl>
       </div>
    </div>
</div>
</template>

<script setup>
import { cardApi } from '@/api'
import { message } from '@/utils/message.js'
import { format, subMonths, subDays, startOfWeek, startOfMonth, endOfMonth } from 'date-fns'
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { t } from '@/utils'
  const props = defineProps({
      card:{
        type:Object,
        default:()=>({})
      },
      refreshing: {
        type: Boolean,
        default: false
      }
  });
  const stats = ref({})
  const dayType=ref('today')
  const formatType='yyyy-MM-dd'
  const createDayTypeOptions = () => {
    const now = new Date()
    return [
    {
      labelKey:'card.index.detail.statistics.today',
      value:'today',
      startDate:format(now,formatType),
      endDate:format(now,formatType)
    },
    {
      labelKey:'card.index.detail.statistics.yesterday',
      value:'yesterday',
      startDate:format(subDays(now,1),formatType),
      endDate:format(subDays(now,1),formatType)
    },
    {
      labelKey:'card.index.detail.statistics.currentWeek',
      value:'week',
      startDate:format(startOfWeek(now, { weekStartsOn: 1 }),formatType),
      endDate:format(now,formatType)
    },
    {
      labelKey:'card.index.detail.statistics.currentMonth',
      value:'month',
      startDate:format(startOfMonth(now),formatType),
      endDate:format(now,formatType)
    },
    {
      labelKey:'card.index.detail.statistics.lastMonth',
      value:'last_month',
      startDate:format(startOfMonth(subMonths(now,1)),formatType),
      endDate:format(endOfMonth(subMonths(now,1)),formatType)
    },
    {
      labelKey:'card.index.detail.statistics.allTime',
      value:'all',
      startDate:null,
      endDate:null
    },
    ]
  }
  const dayTypeOptions = ref(createDayTypeOptions())
  const timesRef = ref(null)
  const canScrollTimesPrev = ref(false)
  const canScrollTimesNext = ref(false)
  const updateTimesScrollButtons = () => {
    const element = timesRef.value
    if (!element) return
    const overflow = element.scrollWidth > element.clientWidth + 2
    canScrollTimesPrev.value = overflow && element.scrollLeft > 2
    canScrollTimesNext.value = overflow && element.scrollLeft + element.clientWidth < element.scrollWidth - 2
  }
  const scrollTimes = (direction) => {
    timesRef.value?.scrollBy({ left: direction * 120, behavior: 'smooth' })
  }
  const handleTimesResize = () => nextTick(updateTimesScrollButtons)
  const dayTypeName=computed(()=>{
    const labelKey = dayTypeOptions.value.find(item=>item.value===dayType.value)?.labelKey
    return labelKey ? t(labelKey) : ''
  })
  const loading=ref(false)
  const list=[
    {
      labelKey:'card.index.detail.statistics.consumption',
      key:'total_consumption',
    },
    {
      labelKey:'card.index.detail.statistics.refund',
      key:'total_refund',
    },
    {
      labelKey:'card.index.detail.statistics.transferIn',
      key:'total_in',
    },
    {
      labelKey:'card.index.detail.statistics.transferOut',
      key:'total_out',
    }
  ]
  const changeDayType=(item, event)=>{
    dayType.value=item.value
    event?.currentTarget?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' })
    return getCardStatistics(item.startDate,item.endDate)
  }
  const emit=defineEmits(['refresh'])
  const refresh=()=>{
    if (props.refreshing) return
    emit('refresh')
  }
  const getCardStatistics=async (startTime,endTime)=>{
    if (!props.card.id) return null
    const cardId = props.card.id
    const requestId = ++statisticsRequestId
    loading.value=true
    try {
      const result = await cardApi.vccInfoStatistics({
        cardId,
        startTime:startTime?`${startTime} 00:00:00`:'',
        endTime:endTime?`${endTime} 23:59:59`:'',
      })
      if (requestId !== statisticsRequestId || String(cardId) !== String(props.card.id)) return null
      stats.value = result || {}
      return stats.value
    } catch (err) {
      if (requestId === statisticsRequestId && String(cardId) === String(props.card.id)) {
        message(err?.msg || err || t('card.index.detail.statistics.operationFailed'), 'error')
      }
      return null
    } finally {
      if (requestId === statisticsRequestId) loading.value=false
    }
  }
  const refreshStatistics = () => {
    dayTypeOptions.value = createDayTypeOptions()
    const currentDayType = dayTypeOptions.value.find((item) => item.value === dayType.value) || dayTypeOptions.value[0]
    return changeDayType(currentDayType)
  }
  let statisticsRequestId=0
  watch(()=>props.card.id,(cardId)=>{
    statisticsRequestId += 1
    loading.value = false
    if (!cardId) {
      stats.value = {}
      return
    }
    dayTypeOptions.value = createDayTypeOptions()
    changeDayType(dayTypeOptions.value[0])
  }, { immediate: true })
  onMounted(() => {
    window.addEventListener('resize', handleTimesResize)
    nextTick(updateTimesScrollButtons)
  })
  onBeforeUnmount(() => {
    statisticsRequestId += 1
    window.removeEventListener('resize', handleTimesResize)
  })
  watch(() => dayTypeOptions.value.map(item => t(item.labelKey)).join('|'), handleTimesResize)
  defineExpose({ refresh: refreshStatistics })
</script>
<style scoped lang="less">
.card-account-box{
  --m: 6px;
  --r: 6px;
  display: flex;
  gap: var(--m);
  padding: var(--m);
  background: transparent;
  border-radius: var(--r);

  dl{
    dt{
      color: var(--grey-color);
    }
  }

  .left,
  .right{
    min-width: 0;
  }

  .left{
    width: var(--ui-size-280);
    padding: 12px 18px;
    display: flex;
    align-items: center;
    background: #fff;
    border-radius: var(--ui-radius-sm);

    dl{
      margin: 0;

      dt{
        display: flex;
        align-items: center;
        line-height: 22px;
      }

      .refresh-btn{
        position: relative;
        display: inline-flex;
        width: var(--ui-size-30);
        height: var(--ui-size-30);
        margin-left: 4px;
        padding: 0;
        align-items: center;
        justify-content: center;
        border: 0;
        border-radius: var(--ui-radius-circle);
        color: var(--primary-color);
        background: transparent;
        cursor: pointer;
        touch-action: manipulation;
        transition: color .18s ease, background-color .18s ease, transform .18s ease;

        &:hover,
        &:focus-visible{
          color: var(--ui-color-primary);
          background: #eef3ff;
          outline: none;
        }

        &:focus-visible{
          box-shadow: 0 0 0 2px rgba(43, 92, 217, .18);
        }

        &:active:not(:disabled){
          transform: scale(.88);
        }

        &:disabled{
          cursor: wait;
        }

        &.refreshing :deep(.ivu-icon){
          animation: balance-refresh-spin .7s linear infinite;
        }
      }

      dd{
        margin-top: 4px;
        line-height: 42px;
      }
    }

    .unit{
      margin-right: 3px;
      color: var(--ui-color-text);
    }

    .money{
      color: var(--ui-color-text);
      font-size: 36px;
      font-weight: 600;
      letter-spacing: -0.5px;
    }
  }

  .right{
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: var(--m);

    .times-wrap{
      position: relative;
      min-width: 0;
    }

    .times{
      min-height: 32px;
      padding: var(--ui-padding-3);
      display: flex;
      gap: 2px;
      overflow-x: auto;
      scrollbar-width: none;
      background: #fff;
      border-radius: var(--r);

      &.hasPrev{
        padding-left: 27px;
      }

      &.hasNext{
        padding-right: 27px;
      }

      &::-webkit-scrollbar{
        display: none;
      }

      .times-item{
        flex: 1 0 auto;
        min-width: 52px;
        padding: var(--ui-padding-0-8);
        display: flex;
        align-items: center;
        justify-content: center;
        line-height: 26px;
        text-align: center;
        white-space: nowrap;
        border-radius: var(--ui-radius-sm);
        cursor: pointer;
        transition: color .2s ease, background-color .2s ease;

        &:hover:not(.active){
          color: var(--primary-color);
          background: #f3f6fd;
        }

        &.active{
          color: var(--ui-color-text-inverse);
          background: var(--primary-color);
        }
      }
    }

    .times-scroll{
      position: absolute;
      top: 50%;
      z-index: 2;
      display: inline-flex;
      width: var(--ui-size-22);
      height: var(--ui-size-22);
      padding: 0;
      align-items: center;
      justify-content: center;
      border: 1px solid rgba(255, 255, 255, .78);
      border-radius: var(--ui-radius-circle);
      color: rgba(43, 92, 217, .88);
      font-size: 12px;
      background: linear-gradient(135deg, rgba(255, 255, 255, .9), rgba(238, 244, 255, .76));
      box-shadow:
        inset 0 1px 0 rgba(255, 255, 255, .92),
        0 2px 7px rgba(43, 92, 217, .14);
      -webkit-backdrop-filter: blur(6px) saturate(145%);
      backdrop-filter: blur(6px) saturate(145%);
      cursor: pointer;
      transform: translateY(-50%);
      transition: background-color .18s ease, box-shadow .18s ease;

      &:hover,
      &:focus-visible{
        background: rgba(255, 255, 255, .96);
        box-shadow:
          inset 0 1px 0 #fff,
          0 3px 9px rgba(43, 92, 217, .18);
        outline: none;
      }

      &--prev{
        left: 3px;
      }

      &--next{
        right: 3px;
      }
    }

    .card-dlText{
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: var(--m);

      dl{
        min-width: 0;
        margin: 0;
        padding: var(--ui-padding-6-12);
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        line-height: 28px;
        background: #fff;
        border-radius: var(--ui-radius-sm);

        dt{
          min-width: 0;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        dd{
          flex-shrink: 0;
          color: #303642;
          font-weight: 500;
        }
      }
    }
  }
}

@keyframes balance-refresh-spin{
  to{ transform: rotate(360deg); }
}

@media (prefers-reduced-motion: reduce){
  .card-account-box .left .refresh-btn{
    transition: none;

    &.refreshing :deep(.ivu-icon){
      animation: none;
      opacity: .5;
    }
  }
}

@media (prefers-reduced-transparency: reduce){
  .card-account-box .right .times-scroll{
    background: #fff;
    -webkit-backdrop-filter: none;
    backdrop-filter: none;
  }
}

@media (max-width: 768px){
  .card-account-box{
    flex-direction: column;

    .left{
      width: auto;
      padding: var(--ui-padding-10-12);
      border-right: 0;

      .money{
        font-size: 30px;
      }
    }

    .right{
      .times{
        overflow-x: auto;

        .times-item{
          flex: 0 0 auto;
        }
      }

      .card-dlText{
        grid-template-columns: 1fr;
      }
    }
  }
}
</style>
