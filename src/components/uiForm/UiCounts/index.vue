<template>
  <div class="ui-counts" :class="{
    isBg:isBg && !isPhone
  }">
    <div class="ui-counts-list" :style="{ '--counts-item-min-width': equalItemMinWidth }">
      <div
        class="ui-counts-item"
        :class="{ 'is-auto-width': item.autoWidth }"
        v-for="item in list"
        :key="item.prop || item.label"
      >
        <div class="ui-counts-item-label">
          <span class="label-text" :class="level(data,item).class" :title="String(item.label ?? '')">
            {{ item.label }}<template v-if="item.showLevelInLabel !== false && level(data,item).text"> {{ level(data,item).text }}</template>
          </span>
          <Tooltip
            v-if="tips(data,item) || (item.countType && user?.freeze_amount)"
            :placement="isPhone ? 'top-end' : 'top'"
            :max-width="280"
            transfer-class-name="ui-counts-label-tooltip"
            class="tip-icon"
            transfer
          >
            <Icon custom="iconfont icon-question"></Icon>
            <template #content>
              <template v-if="item.countType==='available_balance'">
                <p>{{ t('header.frozenAmount') }}: ${{ formatNum(user?.freeze_amount ?? 0) }}</p>
                <p>{{ t('header.frozenDate') }}: {{ user?.freezed_at ?? '-' }}</p>
              </template>
              <div v-html="tips(data,item)" v-else></div>
            </template>
          </Tooltip>
        </div>
        <div class="ui-counts-item-value">
          <div class="ui-counts-item-value-number">
            <div class="unit" v-if="item.type==='money'">$</div>
            <div class="unit" v-else-if="['rate','level_rate'].includes(item.type)">≈</div>
            <div class="number">
              <div class="loading" v-if="loading">-</div>
              <CountUp
                v-else
                :end="countsValue(data,item,item.prop)"
                :options="{ useGrouping: false }"
                :duration="1"
                :decimals="item.decimals ?? 3"
                ref="count"
                v-font="24"
              />
            </div>
            <div class="numberSub" v-if="item.propSub">/ {{ countsValue(data,item,item.propSub) }}</div>
            <div class="unit" v-if="['rate','level_rate'].includes(item.type)">%</div>
            <div class="unit" v-if="item.unit">{{item.unit}}</div>
            <template  v-if="item.countType==='available_balance'">
              <Icon type="ios-loading"  class="icon-load" v-if="loading"></Icon>
              <Icon type="md-refresh" v-else @click="refreshBtn"/>
            </template>
          </div>
          <div class="ui-counts-item-value-btns" v-if="visibleBtns(item).length">
            <template v-for="(btn,btnIndex) in visibleBtns(item)" :key="btn.type || btnIndex">
              <Divider type="vertical" v-if="btnIndex>0 && visibleBtns(item)?.[btnIndex-1]?.type"/>
              <Tooltip
                v-if="btn.type === 'tips'"
                :content="typeof btn.tips === 'function' ? btn.tips(data) : btn.tips"
                :placement="isPhone ? 'top-end' : 'top'"
                :max-width="btn.maxWidth || 320"
                :transfer-class-name="isPhone ? 'ui-counts-mobile-tooltip' : ''"
                transfer
              >
                <div class="btn-item tips" :title="buttonTitle(btn)">
                  {{ buttonLabel(btn) }}
                </div>
              </Tooltip>
              <div
                class="btn-item"
                :class="btn.type"
                :title="buttonTitle(btn)"
                @click.stop="btn.click?.(data)"
                v-else-if="btn.type"
              >
                {{ buttonLabel(btn) }}
              </div>
              <span
                class="text-item"
                :title="buttonTitle(btn)"
                v-else-if="btn.label"
                v-html="buttonLabel(btn)"
              ></span>
            </template>
          </div>
        </div>
      </div>
    </div>
    <div class="btn" v-if="$slots.default">
      <slot/>
    </div>
  </div>
</template>

<script setup>
import {  computed } from 'vue'
import { useUserStoreRefs } from '@/utils/store'
import { isPhone } from '@/utils/device'
import { t } from '@/utils'

const { user } = useUserStoreRefs()
const props = defineProps({
  data: {
    type: Object,
    default: ()=>({}),
  },
  list: {
    type: Array,
    default: ()=>[],
  },
  loading:{
    type: Boolean,
    default: false,
  },
  isBg:{
    type: Boolean,
    default: false,
  }
})
const equalItemMinWidth = computed(() => {
  const itemCount = Math.max(props.list.length, 1)
  const gapWidth = Math.max(itemCount - 1, 0) * 6
  return `calc((100% - ${gapWidth}px) / ${itemCount})`
})
const emits = defineEmits(['refresh'])
const refreshBtn=()=>{
  emits('refresh')
}
const formatNum =  (value) => {
  if (!value) return 0
  value = value.toString().replace(/,/g, '')
  return Number(value) || 0
}
const countsValue=(row,item,prop)=>{
  if(props.loading){
    return 0
  }
  const value=formatNum(row?.[prop || item.prop] ?? 0)
  if((item.min || item.min===0) && value < item.min){
    return item?.defaultValue ?? 0
  }
  return value
}
const level=(data,item)=>{
if(item.tipsType!=='level_rate') return {}
const number = Number(data?.[item?.prop] || 0)
if(number>50) return {class:'ui-text-error',text:t('counts.riskLevelCritical')}
if(number>20) return {class:'ui-text-warning',text:t('counts.riskLevelElevated')}
return {class:'',text:''}
}
const tips=(data,item)=>{
  if(item.tipsType==='level_rate'){
    const text = level(data,item).text
    return text?t('counts.currentRiskLevel', { level: text }):''
  }else if(item.tips){
    if(item.tipsHide?.(data)){
      return ''
    }
    return typeof item.tips==='function'?item.tips(data):item.tips
  }
  return ''
}
const visibleBtns=(item)=>{
  return (item.btns || []).filter((btn)=> {
    if(typeof btn.hidden === 'function'){
      return !btn.hidden(props.data)
    }
    return !btn.hidden
  })
}
const buttonLabel=(btn)=>{
  return typeof btn.label === 'function' ? btn.label(props.data) : btn.label
}
const buttonTitle=(btn)=>{
  return String(buttonLabel(btn) ?? '')
    .replace(/<[^>]*>/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}
</script>
<style lang="less" scoped>
.ui-counts{
  display: flex;
  align-items: center;
  --gap:6px;
  gap:var(--gap);
  border-radius:var(--ui-radius-3);
  &.isBg{
    background: #f3f6ff;
    margin: -15px -15px -6px;
    .ui-counts-list{
      .ui-counts-item{
        background: none;
      }
    }
  }
  .ui-counts-list{
    flex: 1;
    display: flex;
    gap:var(--gap);
    .ui-counts-item{
      background: #f3f6ff;
      flex: 1;
      min-width: 0;
      display: flex;
      flex-direction: column;
      padding:var(--ui-padding-12-16);
      border-radius:var(--ui-radius-sm);
      overflow: hidden;
      &.is-auto-width {
        flex: 0 1 auto;
        width: max-content;
        min-width: var(--counts-item-min-width);
        max-width: 32%;
      }
      .ui-counts-item-label{
        display: flex;
        align-items: center;
        min-width: 0;
        color: var(--ui-color-neutral-500);
        gap:6px;
        .label-text {
          min-width: 0;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .tip-icon {
          flex: 0 0 auto;
          color: #bbbfc4;
          cursor: pointer;
          transition: color var(--ui-motion-control) var(--ui-ease-soft);
          &:hover {
            color: var(--primary-color, #146fff);
          }
        }
      }
      .ui-counts-item-value{
        display:flex;
        width: 100%;
        min-width: 0;
        align-items: baseline;
        flex-direction: column;
        gap: 2px;
        .ui-counts-item-value-number{
          display:flex;
          align-items: baseline;
          gap: 4px;
          .unit {
            font-size: 14px;
          }
          .number{
            font-weight: 600;
            font-size: 24px;
            color: var(--ui-color-neutral-900);
            .loading{
              color: var(--ui-color-text-secondary);
            }
          }
          .numberSub {
            font-size: 14px;
            color: var(--ui-color-neutral-500);
          }
        }
        .ui-counts-item-value-btns{
          display:flex;
          min-width: 0;
          align-self: stretch;
          align-items: center;
          flex-wrap: nowrap;
          gap:8px;
          overflow: hidden;
          >*{
            min-width: 0;
            margin: 0 !important;
          }
          .btn-item{
            flex: 0 0 auto;
            white-space: nowrap;
            cursor: pointer;
            color: var(--primary-color);
            transition: all var(--ui-motion-control) var(--ui-ease-soft);
            &.warning{
              color: var(--ui-color-warning);
            }
            &.error{
              color: var(--error-color);
            }
            &:hover{
              text-decoration: underline;
            }
          }
          .text-item{
            flex: 1 1 auto;
            min-width: 0;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }
        }
      }
    }
  }
  .btn{
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: var(--gap);
    padding: var(--ui-padding-0-8);
    >*{
      min-width: 120px;
    }
  }
  @media screen and (max-width: 768px) {
    background: none;
    align-items: initial;
    flex-direction: column;
    &.bg{
      padding: 0;
      background: none;
    }
    .ui-counts-list{
      display: flex;
      flex-direction: column;
      gap:8px;
      padding: 0;
      .ui-counts-item.is-auto-width {
        width: 100%;
        min-width: 0;
        max-width: none;
      }
    }
    .btn{
      padding: 0;
    }
    .ui-counts-item{
      padding: var(--ui-padding-16);
      background: var(--ui-color-surface);
      .ui-counts-item-value{
        flex-direction: row !important;
        gap: 8px !important;
        .ui-counts-item-value-number{
          flex: 1;
          overflow: hidden;
        }
      }
    }
  }
}
</style>
<style lang="less">
.ui-counts-label-tooltip {
  max-width: calc(100vw - 32px);

  .ivu-tooltip-inner {
    max-width: min(280px, calc(100vw - 32px)) !important;
    line-height: 1.5;
    overflow-wrap: anywhere;
    text-align: left;
    white-space: normal;
  }
}

@media screen and (max-width: 768px) {
  .ui-counts-mobile-tooltip {
    right: 24px !important;
    left: auto !important;
    width: calc(100vw - 48px);
    max-width: 320px;

    .ivu-tooltip-inner {
      width: 100%;
      max-width: none !important;
      padding: var(--ui-padding-10-12);
      line-height: 1.6;
      text-align: left;
      white-space: normal;
      word-break: break-word;
    }
  }
}
</style>
