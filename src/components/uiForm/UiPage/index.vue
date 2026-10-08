<template>
  <div v-if="!tabs?.length || visibleTabs.length" class="ui-page" ref="pageRef" :class="{
    isNotBg:isNotBg || isBackTitle || $slots.pageRight || isContentBg,
    isAuto:isAuto && !isPhone,
    isOverflowX: isPhone,
    isMx: isMx,
  }" :style="{
    padding:isPhone || $slots.pageRight || isNotBg || isContentBg?'':typeof padding==='number'? padding+'px': padding,
  }">
    <template v-if="certificationShow && isCertificationBlocked()">
      <PageCertification/>
    </template>
    <template v-else>
      <div class="ui-page-thead" :class="{
        borderBottom:route.meta?.isAppDetail && isPhone
      }" v-if="theadShow">
        <div  class="title" v-if="!props.isNotTitle || isPhone">
          <template v-if="isBack || (route.meta?.isAppDetail && isPhone)">
            <div class="back" @click="backHandler ? backHandler() : goBack(fallback)">
                <Icon type="ios-arrow-back" :size="16" />
                <span>{{ $t('button.back') }}</span>
            </div>
            <Divider type="vertical" />
          </template>
          <slot name="title-icon" />
          <p :title="pageTitle" v-if="titleSize ? titleSize === 'small' : $slots.pageRight || isNotBg">{{ pageTitle }}</p>
          <h3 :title="pageTitle" v-else>{{ pageTitle }}</h3>
          <Icon type="md-refresh" :class="{ 'demo-spin-icon-load': loading }" color="var(--ui-color-primary)" :size="16" @click="reset" v-if="data?.apiUrl  && !isPhone"/>
        </div>
        <PageActions :data="tabShowBtns" v-if="tabShowBtns?.length>0  && !isSelect && !isPhone"/>
        <Button @click="countsShow=!countsShow" size="small" icon="ios-podium"  type="default" v-if="$slots.counts && isPhone">{{ countsTitle }}</Button>
        <Button
          v-if="$slots.pageRight && isPhone"
          class="ui-page-thead-action"
          size="small"
          type="default"
          :title="pageRightTitle"
          @click="countsShow=!countsShow"
        >{{ pageRightTitle }}</Button>
        <template  v-if="(data?.searchThead?.length===0 || !data?.searchThead) && !isSelect && !isPhone">
          <PageActions :data="pageBtns" :statusValue="statusValue"/>
          <div class="ui-page-thead-arefresh" v-if="data?.thead?.length>0">
            <Button type="default" icon="md-sync" :loading="loading" @click="search">{{ $t('button.refresh') }}</Button>
          </div>
        </template>
      </div>
      <div class="ui-page-content" :class="{ 'has-background': isContentBg }" :style="{
        padding: isContentBg ? (typeof padding === 'number' ? padding + 'px' : padding) : undefined,
      }">
      <div class="ui-page-tip" v-if="$slots.tip">
        <slot name="tip"></slot>
      </div>
      <div class="ui-page-flex" v-if="$slots.pageRight">
        <div class="ui-page-left">
          <slot></slot>
          <Spin fix v-if="loading" ></Spin>
        </div>
        <div class="ui-page-right" ref="pageRightRef" :style="[pageRightStyle, pageRightStickyStyle]" v-if="!isPhone">
          <slot name="pageRight"></slot>
        </div>
      </div>
      <template v-else>
        <div class="banner" v-if="$slots.banner && !isPhone">
          <slot name="banner"></slot>
        </div>
        <div class="ui-page-counts" v-if="$slots.counts && !isPhone">
          <slot name="counts"></slot>
        </div>
        <div class="ui-page-center" v-if="$slots.tbody && !isPhone">
          <slot name="tbody"></slot>
      </div>
      <div class="ui-page-status" v-if="data?.status?.length>0">
          <button v-show="canScrollStatusPrev" type="button" class="status-scroll status-scroll--prev" :aria-label="$t('uiCommon.scrollStatusPrevious')" @click="scrollStatus(-1)">
            <Icon type="ios-arrow-back" />
          </button>
          <div class="ui-page-status-list" ref="statusListRef" :class="{ hasPrev: canScrollStatusPrev, hasNext: canScrollStatusNext, 'is-scrollable': statusOverflow }" @scroll.passive="updateStatusScrollButtons">
            <div class="ui-page-status-item" :class="{
              active:statusValue===item.value
            }" @click.stop="handleStatusClick(item.value, $event)" v-for="(item,index) in data.status" :key="index">
              <span class="label">{{ item.label }}</span>
            </div>
          </div>
          <button v-show="canScrollStatusNext" type="button" class="status-scroll status-scroll--next" :aria-label="$t('uiCommon.scrollStatusNext')" @click="scrollStatus(1)">
            <Icon type="ios-arrow-forward" />
          </button>
        </div>
        <div class="ui-page-search" v-if="data?.searchThead?.length>0 && !isPhone">
          <PageSearch :data="searchThead" :pageSearch="pageSearch" @search="reset"/>
          <div class="ui-page-search-actions">
            <template v-if="!isSelect">
              <PageActions :data="pageBtns" :statusValue="statusValue" />
            </template>
            <Button type="default" icon="md-sync" :loading="loading" @click="search" v-if="data?.searchThead.length>0">{{ $t('button.refresh') }}</Button>
          </div>
        </div>
        <div v-if="batchBtns.length>0" class="batch-btn">
          <Checkbox v-if="isPhone && !isSelect" :model-value="tableWapRef?.allSelected || false" :indeterminate="selectionArr.length > 0 && !tableWapRef?.allSelected" :disabled="loading || !tableWapRef?.selectableRows?.length" @on-change="tableWapRef?.toggleSelectAll($event)">
            {{ $t('ucenterAccount.memberPicker.selectAllInList') }}
          </Checkbox>
          <div class="title">
            <i18n-t keypath="uiCommon.selectedCount" scope="global">
              <template #count><span class="text-smg">{{ selectionArr?.length || 0 }}</span></template>
            </i18n-t>
          </div>
          <Button type="text" @click="clearSelection" v-if="selectionArr?.length>0">{{ $t('uiCommon.clearSelection') }}</Button>
          <PageBatchBtns :data="batchBtns" :selectionArr="selectionArr"/>
        </div>
        <div class="ui-page-tab" v-if="visibleTabs.length>0">
          <UiTabs :data="visibleTabs" :return-state="returnState" @init="init" @change="emit('tab-change', $event)">
            <template v-if="tabSearchThead.length" #right>
              <PageTabSearch :data="tabSearchThead" :pageSearch="tabSearchValues" @search="applyTabSearch">
                <template v-if="$slots['tab-search-option']" #option="slotProps">
                  <slot name="tab-search-option" v-bind="slotProps" />
                </template>
              </PageTabSearch>
            </template>
          </UiTabs>
        </div>
        <div class="ui-page-tbdoy" :class="{
          noPadding:padding==0
        }" :style="data?.style" ref="scrollBody" @scroll="handleScroll" v-else>
          <div class="list-b-16">
            <template v-if="$slots.default">
              <slot/>
            </template>
            <template v-else>
              <template  v-if="$slots.item">
                <div class="ui-page-tbody-list list-b-8" v-if="tbody.length>0">
                  <div class="ui-page-tbody-item" v-for="(item,index) in tbody" :key="index">
                    <slot name="item" :item="item" :row="item" :index="index"/>
                  </div>
                </div>
              </template>
              <template v-else-if="data?.thead?.length>0">
                <div class="ui-page-center" v-if="$slots.tbody && isPhone">
                  <slot name="tbody"></slot>
                </div>
                <template v-if="isPhone">
                    <UiTableWap v-bind="data" ref="tableWapRef" :tbody="tbody" :isSelect="isSelect" :loading="loading" :row-key="tableRowKey" @select="select" @selectionChange="selectionChange">
                      <template v-for="item in tableSlotItems" #[item.prop||item.key]="slotProps" :key="item.prop||item.key">
                        <slot :name="item.prop||item.key" v-bind="slotProps"/>
                      </template>
                    </UiTableWap>
                </template>
                <template v-else>
                    <UiTable v-bind="data" ref="tableRef" :tbody="tbody" :isSelect="isSelect" :loading="loading" :row-key="tableRowKey" @select="select" @selectionChange="selectionChange">
                      <template v-for="item in tableSlotItems" #[item.prop||item.key]="slotProps" :key="item.prop||item.key">
                        <slot :name="item.prop||item.key" v-bind="slotProps"/>
                      </template>
                    </UiTable>
                </template>
              </template>
              <div class="ui-page-status-page">
                <div class="no-data" v-if="tbody.length===0 && (!data?.thead || isPhone)">
                  <UiEmptyBox/>
                </div>
                <template v-else-if="!data?.notPage">
                  <template v-if="isPhone">
                    <Button long @click="more" :loading="loading" v-if="tbody.length<total">{{ $t('button.loadMore') }}</Button>
                    <Button long :disabled="true" v-else>{{ $t('message.loadedAll') }}</Button>
                  </template>
                  <template v-else>
                      <Page
                        :model-value="pageData.page"
                        :total="total"
                        :page-size="pageData.limit"
                        show-sizer
                        show-elevator
                        show-total
                        :page-size-opts="[10,20,30,40,100]"
                        @on-change="handleChangePage"
                        @on-page-size-change="handleChangePageSize"
                      />
                  </template>
                </template>
              </div>
            </template>
          </div>
          <Spin fix v-if="loading && (isPhone || data?.notPage || $slots.item)" ></Spin>
          <div class="drift-group" :class="{ 'is-hidden': isScrolling }" :style="{
            bottom: footerBtns.length>0?'220px':'140px'
          }" v-if="isPhone  && !isMx">
            <div class="drift-item back-top"  @click="openSearch" v-if="data?.searchThead?.length>0  && !isSelect">
              <Icon type="ios-search" />
            </div>
            <div class="drift-item back-top"  @click="reset" v-if="data?.apiUrl">
              <Icon type="md-refresh"  :class="{ 'demo-spin-icon-load': loading }"/>
            </div>
            <div class="drift-item back-top" v-show="showBackTop" @click="handleBackToTop">
              <Icon type="md-arrow-up" />
            </div>
          </div>
        </div>
        <div class="ui-page-footer" v-if="isPhone && footerBtns.length>0 && !isSelect">
          <template  v-for="(item, index) in footerBtns" :key="index">
            <Button
              v-if="typeof item.hidden === 'function' ? item.hidden(statusValue) : true"
              :type="item.type || 'primary'"
              size="large"
              long
              :icon="item.icon"
              :title="item.tooltip"
              :loading="Boolean(item.loading)"
              :disabled="Boolean(item.loading) || item.disabled === true"
              @click="!item.loading && item.disabled !== true && item.click($event)"
            >
              {{ item.label }}
            </Button>
          </template>
        </div>
      </template>
      </div>
    </template>
  </div>
  <div class="pupBox" v-if="$slots.pup">
    <slot name="pup"/>
  </div>
  <Drawer :title="drawerTitle" :height="countsDrawerHeight" :styles="countsDrawerBodyStyle"  placement="bottom" v-model="countsShow" v-if="($slots.counts || $slots.pageRight) && isPhone">
    <div ref="countsBodyRef" class="counts-drawer-body">
      <slot name="counts" v-if="$slots.counts"></slot>
      <slot name="pageRight" v-else-if="$slots.pageRight"></slot>
    </div>
  </Drawer>
  <PageSearchPhone ref="openSearchRef" :data="data?.searchThead" v-model:pageSearch="pageSearch" @search="reset" @reset="resetSearch" v-if="isPhone"/>
</template>

<script setup>
import UiEmptyBox from '@/components/uiForm/UiEmptyBox/index.vue'
import UiTable from '@/components/uiForm/UiTable/index.vue'
import UiTableWap from '@/components/uiForm/UiTableWap/index.vue'
import PageActions from './PageActions.vue'
import PageBatchBtns from './PageBatchBtns.vue'
import PageSearch from './PageSearch.vue'
import PageTabSearch from './PageTabSearch.vue'
import PageSearchPhone from './PageSearchPhone.vue'
import PageCertification from './PageCertification.vue'
import { computed, inject, nextTick, onBeforeUnmount, onMounted, provide, ref, useSlots, watch } from 'vue'
import { isPhone } from '@/utils/device.js'
import { useUserStore, useUserStoreRefs } from '@/utils/store'
import { useCountsDrawer } from './composables/useCountsDrawer.js'
import { useMobileScroll } from './composables/useMobileScroll.js'
import { usePageRequest } from './composables/usePageRequest.js'
import { usePageRightSticky } from './composables/usePageRightSticky.js'
import { t } from '@/utils'
import { hasPermission } from '@/utils/permission.js'
const { user } = useUserStoreRefs()
const userStore = useUserStore()
import { useRoute, goBack, toRoute } from '@/utils/route'
import { Button } from 'view-ui-plus'
const route = useRoute()
const slots = useSlots()
const props = defineProps({
  returnState: Object,
  data:{
    type: Object,
    default: () => ({ notPage: true }),
  },
  pageRightStyle:{
    type: Object,
    default: () => ({}),
  },
  tabs:{
    type: Array,
  },
  tabSearch:{
    type: Object,
    default: () => ({}),
  },
  tabBtns:{
    type: Array,
  },
  forbiddenRedirect:{
    type: Boolean,
    default: false,
  },
  btns:{
    type: Array,
  },
  title:{
    type: String,
  },
  titleSize:{
    type: String,
    validator: value => ['small', 'large'].includes(value),
  },
  countsTitle:{
    type: String,
    default: () => t('counts.statistics'),
  },
  pageRightTitle:{
    type: String,
  },
  fallback:{
    type: Object,
    default: () => ({ name: 'home' }),
  },
  backHandler: {
    type: Function,
  },
  isBack:{
    type: Boolean,
    default: false,
  },
  isBackTitle:{
    type: Boolean,
    default: false,
  },
  isSelect:{
    type: Boolean,
    default: false,
  },
  rowKey:{
    type: String,
  },
  isNotTitle:{
    type: Boolean,
    default: false,
  },
  isMx:{
    type: Boolean,
    default: false,
  },
  isNotBg:{
    type: Boolean,
    default: false,
  },
  isAuto:{
    type: Boolean,
    default: false,
  },
  //是否要先认证
  isCertification:{
    type: Boolean,
    default: false,
  },
  padding:{
    type: [String,Number],
    default: 16,
  }
})
// 公共搜索仅作用于当前 Tabs 的下一层 UiPage，不传入更深层的嵌套页面。
const inheritedTabSearch = inject('uiPageTabSearch', ref({}))
const tabSearchThead = computed(() => isPhone.value ? [] : props.tabSearch.searchThead || [])
const tabSearchValues = ref({ ...(props.tabSearch.search || {}) })
const tabSearchParams = ref(tabSearchThead.value.length ? { ...tabSearchValues.value } : {})
provide('uiPageTabSearch', tabSearchParams)
const applyTabSearch = () => {
  tabSearchParams.value = { ...tabSearchValues.value }
}
const sharedSearch = computed(() => isPhone.value ? {} : inheritedTabSearch.value)
const searchThead = computed(() => (props.data?.searchThead || []).filter(item => !Object.hasOwn(sharedSearch.value, item.prop)))
const visibleTabs = computed(() => (props.tabs || []).filter(tab => {
  const permissions = Array.isArray(tab.permission) ? tab.permission : [tab.permission]
  return permissions.every(hasPermission)
}))
watch(() => props.forbiddenRedirect && props.tabs?.length > 0 && visibleTabs.value.length === 0, (forbidden) => {
  if (forbidden) toRoute('error_403', {}, 'query', { replace: true })
}, { immediate: true })
const pageBtns = computed(() => (props.data?.btns || []).filter(button => hasPermission(button.permission)))
const tabShowBtns = computed(() => (props.tabBtns || []).filter(button => hasPermission(button.permission)))
const batchBtns = computed(() => (props.data?.batchBtns || []).filter(button => hasPermission(button.permission)))
const footerBtns = computed(() => [...pageBtns.value, ...(props.btns || []).filter(button => hasPermission(button.permission))])
const selectionArr=ref([])
const selectionChange=(rows)=>{
  selectionArr.value=rows
}
const clearSelection=()=>{
  selectionArr.value=[]
  if(isPhone.value){
    tableWapRef.value?.clearSelection?.()
  }else{
    tableRef.value?.clearSelection?.()
  }
}
const tableRef=ref(null)
const tableWapRef=ref(null)
const pageTitle = computed(() => props.title || (route.meta.titleKey ? t(route.meta.titleKey) : route.meta.title) || '')
const {
  pageRef,
  pageRightRef,
  pageRightStickyStyle,
} = usePageRightSticky({ isPhone })
const {
  countsShow,
  countsBodyRef,
  countsDrawerHeight,
  countsDrawerBodyStyle,
} = useCountsDrawer()
const drawerTitle=computed(()=>{
  if(slots.counts){
    return props.countsTitle
  }else if(slots.pageRight && props.pageRightTitle){
    return props.pageRightTitle
  }
  return ''
})
const openPageRight=()=>{
  if (!isPhone.value || !slots.pageRight) return
  countsShow.value=true
}
const theadShow=computed(()=>{
  if(props.isSelect || props.isMx){
    return false
  }
  if(props.isNotTitle && !isPhone.value){
    if(pageBtns.value.length>0 && (!props.data?.searchThead || props.data?.searchThead?.length===0)){
      return true
    }
    return false
  }
  return true
})
const isContentBg = computed(() => props.titleSize === 'small' && theadShow.value && !isPhone.value && !props.isNotBg && !props.isBackTitle && !slots.pageRight)
const tableSlotItems=computed(()=>(props.data?.thead || []).filter((item)=>slots[item.prop || item.key]))
const tableRowKey=computed(()=>props.rowKey || props.data?.rowKey || 'id')
const certificationShow=ref(true)
const openSearchRef=ref(null)
const openSearch=()=>{
  openSearchRef.value.open()
}
const isCertificationBlocked=()=>{
  if(!route?.meta?.isCertification){
    return false
  }
  const status = user.value?.auth_status
  return status === 0 || status === undefined || status === null
}
const {
  isScrolling,
  showBackTop,
  scrollBody,
  scrollToTop,
  handleScroll,
  handleBackToTop,
} = useMobileScroll()
const {
  statusValue,
  loading,
  total,
  pageSearch,
  pageData,
  tbody,
  search,
  reset,
  resetSearch,
  setStatus,
  handleChangePage,
  handleChangePageSize,
  more,
  cancelActiveRequest,
  restore,
  getSearchParams,
} = usePageRequest({ props, isPhone, isCertificationBlocked, scrollToTop, scrollBody, sharedSearch })
watch(tbody, clearSelection, { flush: 'sync' })
const emit=defineEmits(['select','init','tab-change'])
const statusListRef = ref(null)
const canScrollStatusPrev = ref(false)
const canScrollStatusNext = ref(false)
const statusOverflow = ref(true)
const updateStatusScrollButtons = () => {
  const el = statusListRef.value
  if (!el) return
  statusOverflow.value = el.scrollWidth > el.clientWidth + 2
  if (!statusOverflow.value) {
    canScrollStatusPrev.value = false
    canScrollStatusNext.value = false
    return
  }
  canScrollStatusPrev.value = el.scrollLeft > 2
  canScrollStatusNext.value = el.scrollLeft + el.clientWidth < el.scrollWidth - 2
}
const scrollStatus = (direction) => {
  statusListRef.value?.scrollBy({ left: direction * 120, behavior: 'smooth' })
}
const handleStatusResize = () => {
  statusOverflow.value = true
  nextTick(updateStatusScrollButtons)
}
const handleStatusClick = (value, event) => {
  props.data?.onStatusChange?.(value)
  setStatus(value)
  event.currentTarget?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' })
}
const select=(row,index)=>{
  emit('select',row,index)
}
const init=()=>{
  emit('init')
}
watch(() => user.value?.auth_status, (status, oldStatus) => {
  nextTick(()=>{
    certificationShow.value = route?.meta?.isCertification && status === 0
    if(
      route?.meta?.isCertification &&
      (oldStatus === 0 || oldStatus === undefined || oldStatus === null) &&
      status !== 0 &&
      status !== undefined &&
      status !== null
    ){
      search()
    }
  })
}, { immediate: true })
//暴露方法
defineExpose({
  reset,
  clearSelection,
  loading,
  search,
  getSearchParams,
  openPageRight,
})
onMounted(async () => {
  window.addEventListener('resize', handleStatusResize)
  nextTick(updateStatusScrollButtons)
  const wasCertificationBlocked = isCertificationBlocked()
  // 认证路由进入时以服务端最新用户资料为准，避免使用审核前的缓存状态。
  if(route?.meta?.isCertification){
    await userStore.getUserInfo()
  }
  if(isCertificationBlocked()){
    return
  }
  // 从未认证变为已认证时由上方 auth_status 监听器触发，避免重复请求。
  if(!wasCertificationBlocked){
    if (props.returnState) await restore()
    else search()
  }
})
onBeforeUnmount(() => {
  cancelActiveRequest()
  window.removeEventListener('resize', handleStatusResize)
})
watch(() => props.data?.status?.length, () => {
  statusOverflow.value = true
  nextTick(updateStatusScrollButtons)
})

</script>
<style lang="less" scoped>
.ui-page{
  display: flex;
  flex-direction: column;
  gap: var(--ui-page-gap);
  position: relative;
  width: 100%;
  .batch-btn{
    background: var(--ui-color-surface-hover);
    padding: var(--ui-space-8) var(--ui-space-12);
    border-radius: var(--ui-radius-3);
    display: flex;
    height: 48px;
    gap: 8px;
    align-items: center;
    > .title,
    > :deep(.ivu-btn){
      flex-shrink: 0;
      white-space: nowrap;
    }
  }
  &.isOverflowX{
    overflow-x:inherit;
    .batch-btn{
      height: auto;
      min-height: 48px;
      flex-wrap: wrap;
      gap: var(--ui-space-8);
      > :deep(.ivu-checkbox-wrapper){
        margin-inline: 0;
      }
      > .title{
        white-space: nowrap;
      }
      > :deep(.ivu-btn){
        padding-inline: var(--ui-space-4);
      }
      :deep(.ui-page-status-btn){
        flex: 0 0 auto;
        margin-inline-start: auto;
        display: flex;
        flex-wrap: wrap;
        gap: var(--ui-space-8);
      }
    }
  }
  &.isAuto{
    max-width: 1200px;
    margin: var(--ui-space-16) auto;
  }
  &:not(.isNotBg){
    background: var(--ui-color-surface);
  }
  .ui-page-content{
    display: contents;
    &.has-background{
      display: flex;
      flex-direction: column;
      gap: var(--ui-page-gap);
      background: var(--ui-color-surface);
    }
  }
  .ui-page-flex{
    display: flex;
    align-items: flex-start;
    gap: var(--ui-card-gap);
    position: relative;
    flex: 1;
    overflow: visible;
    >*{
      border-radius: var(--ui-radius-3);
      background: var(--ui-card-background);
      overflow: hidden;
      padding: var(--ui-card-padding);
    }
    .ui-page-left{
      position: relative;
      flex: 1;
    }
    .ui-page-right{
      width: var(--ui-size-320);
      position: sticky;
    }
  }
  .ui-page-footer{
    display: flex;
    padding: var(--ui-space-8) var(--ui-space-8) var(--ui-space-16);
    gap: var(--ui-space-8);
    >*{
      border: none;
    }
  }
  .ui-page-tip{
    color: var(--ui-color-text-secondary);
    background: var(--ui-color-surface);
  }
  .ui-page-search{
    display: flex;
    align-items: flex-start;
    gap: var(--ui-space-8);
    .ui-page-search-actions{
      display: flex;
      flex-shrink: 0;
      align-items: center;
      gap: var(--ui-space-8);
    }
  }
  .ui-page-thead{
    display: flex;
    align-items: center;
    .ui-page-thead-arefresh{
      flex: 1;
      display: flex;
      justify-content: end;
    }
    .title{
      flex: 1;
      min-width: 0;
      overflow: hidden;
      display: flex;
      align-items: center;
      gap: var(--ui-space-6);
      p,
      h3{
        min-width: 0;
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
      }
      h3{
        font-size: var(--ui-font-size-2xl);
      }
      .back{
        flex-shrink: 0;
        cursor: pointer;
        &:hover{
          color: var(--ui-color-primary);
        }
      }
    }
    &.borderBottom{
      border-bottom: var(--ui-border-subtle);
      .title{
        h3{
          font-size: var(--ui-font-size-md);
          font-weight: var(--ui-font-weight-regular);
        }
      }
    }
  }
  .ui-page-status{
    position: relative;
    padding:var(--ui-padding-6);
    display: flex;
    align-items: center;
    background: var(--ui-color-surface-hover);
    border-radius: var(--ui-radius-xs);
    overflow: hidden;
    .status-scroll{
      display: block;
      position: absolute;
      top: 50%;
      z-index: 2;
      width: var(--ui-size-26);
      height: var(--ui-size-26);
      padding: 0;
      border: var(--ui-border-muted);
      border-radius: var(--ui-radius-circle);
      color: var(--ui-color-primary);
      background: var(--ui-color-surface-overlay-strong);
      box-shadow: var(--ui-status-scroll-shadow);
      cursor: pointer;
      transform: translateY(-50%);
      &--prev{ left: 4px; }
      &--next{ right: 4px; }
    }
    .ui-page-status-list{
      display: flex;
      flex: 1 1 auto;
      width: 100%;
      min-width: 0;
      gap: var(--ui-space-8);
      overflow-x: auto;
      overflow-y: hidden;
      overscroll-behavior-x: contain;
      scrollbar-width: none;
      -webkit-overflow-scrolling: touch;
      &::-webkit-scrollbar{
        display: none;
      }
      &.hasPrev{ padding-left: 28px; }
      &.hasNext{ padding-right: 28px; }
      .ui-page-status-item{
        flex-shrink: 0;
        .label{
         //不换行
         white-space: nowrap;
         display: inline-block;
        }
        cursor: pointer;
        position: relative;
        color: var(--ui-color-text);
        padding: 0 var(--ui-space-16);
        border-radius: var(--ui-radius-sm);
        line-height: var(--ui-line-height-xl);
        @media (hover: hover) and (min-width: 769px) {
          &:hover{
            background: var(--ui-color-surface);
            color: var(--ui-color-primary);
          }
        }
        &.active{
          background: var(--ui-status-active-background);
          color: var(--ui-color-surface);
        }
      }
    }
  }
  .ui-page-tab{
    position: relative;
    flex: 1;
    overflow: hidden;
  }
  .ui-page-tbdoy{
    position: relative;
    .drift-group{
      display: none;
    }
    .ui-page-status-page{
      display: flex;
      align-items: center;
      justify-content: center;
      .no-data{
        text-align: center;
        height:var(--ui-size-300);
        display: flex;
        align-items: center;
        justify-content: center;
      }
    }
  }
  @media screen and (max-width: 768px) {
    &:not(.isMx){
      position: absolute;
      left: 0;
      top: 0;
      bottom: 0;
      right: 0;
      z-index: var(--ui-layer-overlay);
      background: none;
      padding:0;
      gap: 0;
      margin: 0;
    }
    .ui-page-thead{
      height:var(--ui-size-48);
      padding: 0 var(--ui-space-12);
      background: var(--ui-color-surface);
      .ui-page-thead-action{
        display: inline-flex;
        flex: 0 1 30%;
        align-items: center;
        justify-content: center;
        min-width: 0;
        max-width: 30%;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;

        :deep(span){
          min-width: 0;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
      }
      &+.ui-page-content > .ui-page-status:first-child{
        margin-top:0;
      }
    }
    .ui-page-flex{
      overflow-x: hidden;
    }
    .ui-page-tip{
      padding: var(--ui-space-8) var(--ui-space-12);
    }
    .ui-page-status{
      min-width: 0;
      background: var(--ui-color-surface);
      border-radius: 0;
      .ui-page-status-list{
        gap: var(--ui-space-8);
        touch-action: pan-x;
        &:not(.is-scrollable) .ui-page-status-item{
          flex: 1 1 0;
          min-width: 0;
        }
        .ui-page-status-item{
          flex: 0 0 auto;
          min-width: 64px;
          text-align: center;
          line-height: var(--ui-line-height-xl);
          border-radius: var(--ui-radius-full);
        }
    }
    }
    .ui-page-tbdoy{
      background: var(--ui-color-surface);
      &:not(.noPadding){
        padding: var(--ui-space-8);
      }
      flex: 1;
      overflow-x:hidden;
    }
    .drift-group {
      position: fixed;
      z-index: var(--ui-layer-page);
      right: var(--ui-space-8);
      display: flex !important;
      flex-direction: column;
      gap: var(--ui-space-12);
      animation: float-up var(--ui-page-float-enter-duration) var(--ui-ease-enter);
      transition:
        transform var(--ui-page-float-transition-duration) var(--ui-ease-emphasized),
        opacity var(--ui-page-float-transition-duration) var(--ui-ease-soft);

      &.is-hidden {
        transform: translateX(calc(100% + 20px));
        opacity: var(--ui-opacity-hidden);
        pointer-events: none;
      }

      .drift-item {
        width:var(--ui-size-44);
        height:var(--ui-size-44);
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: var(--ui-radius-circle);
        cursor: pointer;
        transition: all var(--ui-page-float-action-duration) var(--ui-ease-spring);
        background: rgba(255, 255, 255, 0.5);
        border: var(--ui-border-subtle);
        box-shadow: var(--ui-shadow-neutral-floating);
        backdrop-filter: blur(1px);
        box-sizing: border-box;
        &.customer {
          .iconfont {
            font-size: var(--ui-font-size-3xl);
          }
        }

        &.back-top {
          font-size: var(--ui-font-size-3xl);
        }

        &:active {
          transform: scale(0.92);
        }
      }
    }
  }
}

@keyframes float-up {
  0% { opacity: var(--ui-opacity-hidden); transform: translateY(20px); }
  100% { opacity: var(--ui-opacity-visible); transform: translateY(0); }
}
.demo-spin-icon-load{
    animation: ani-demo-spin var(--ui-loading-spin-duration) var(--ui-ease-linear) infinite;
}
.counts-drawer-body{
  box-sizing: border-box;
  max-height: calc(80vh - 56px);
  overflow-y: auto;
  padding: var(--ui-space-16);
}
@keyframes ani-demo-spin {
    from { transform: rotate(0deg);}
    50%  { transform: rotate(180deg);}
    to   { transform: rotate(360deg);}
}
</style>
