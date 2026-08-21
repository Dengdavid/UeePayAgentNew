<template>
  <div class="ui-tabs">
    <slot/>
    <button v-show="canScrollPrev" type="button" class="ui-tabs-scroll ui-tabs-scroll--prev" aria-label="向左查看更多" @click="scrollTabs(-1)">
      <Icon type="ios-arrow-back" />
    </button>
    <div class="ui-tabs-list" ref="tabsListRef" :class="{ hasPrev: canScrollPrev, hasNext: canScrollNext, 'is-scrollable': tabsOverflow }" @scroll.passive="updateScrollButtons">
      <div class="ui-tabs-list-item" :class="{
        active:activeTab===item.name
      }" v-for="item in data" :key="item.name" @click="changeTab(item)">
        <p>{{ item.title }}</p>
      </div>
    </div>
    <button v-show="canScrollNext" type="button" class="ui-tabs-scroll ui-tabs-scroll--next" aria-label="向右查看更多" @click="scrollTabs(1)">
      <Icon type="ios-arrow-forward" />
    </button>
    <div class="ui-tabs-tbody" ref="tbodyRef">
       <component
         :is="activeItem?.component"
         v-bind="componentProps"
         v-on="componentEvents"
       ></component>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, nextTick, onBeforeUnmount, onMounted, watch } from 'vue'
import { useRoute, useRouter, clearQuery } from '@/utils/route'
const route = useRoute()
const router = useRouter()
const props = defineProps({
  data: {
    type: Array,
    default: ()=>[],
  },
  loading:{
    type: Boolean,
    default: false,
  }
})
const emit = defineEmits(['init'])
const init=()=>{
  emit('init')
}
const getDefaultTab = () => {
  const queryTab = route.query?.type
  if (props.data?.some(item => item.name === queryTab)) {
    return queryTab
  }
  const routeTab = props.data?.find(item => (item.routeName || item.name) === route.name)
  if (routeTab) {
    return routeTab.name
  }
  return props.data?.[0]?.name
}
const activeTab = ref(getDefaultTab());
const activeItem = computed(() => props.data?.find(item => item.name === activeTab.value))
const componentProps = computed(() => ({
  ...(activeItem.value?.props || {}),
  ...(activeItem.value?.passActive === false ? {} : { active: activeTab.value }),
}))
const componentEvents = computed(() => {
  const events = activeItem.value?.events || {}
  if (activeItem.value?.forwardInit === false) return events
  return {
    ...events,
    init: (...args) => {
      events.init?.(...args)
      init(...args)
    },
  }
})

const tbodyRef = ref(null)
const tabsListRef = ref(null)
const canScrollPrev = ref(false)
const canScrollNext = ref(false)
const tabsOverflow = ref(true)
const updateScrollButtons = () => {
  const el = tabsListRef.value
  if (!el) return
  tabsOverflow.value = el.scrollWidth > el.clientWidth + 2
  if (!tabsOverflow.value) {
    canScrollPrev.value = false
    canScrollNext.value = false
    return
  }
  canScrollPrev.value = el.scrollLeft > 2
  canScrollNext.value = el.scrollLeft + el.clientWidth < el.scrollWidth - 2
}
const scrollTabs = (direction) => {
  tabsListRef.value?.scrollBy({ left: direction * 120, behavior: 'smooth' })
}
const handleTabsResize = () => {
  tabsOverflow.value = true
  nextTick(updateScrollButtons)
}
const scrollActiveTabIntoView = () => {
  nextTick(() => {
    tabsListRef.value?.querySelector('.ui-tabs-list-item.active')?.scrollIntoView({
      behavior: 'smooth',
      block: 'nearest',
      inline: 'center',
    })
  })
}
const scrollInto=()=>{

  nextTick(() => {
    if (tbodyRef.value) {
      // scrollIntoView 会自动找到最近的滚动父元素并滚动
      tbodyRef.value.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  })
}
const changeTab=(item)=>{
  if(item.name===activeTab.value) return
  activeTab.value=item.name
  if(item.to){
    router.push(item.to)
    return
  }
  if(item.routeName){
    router.push({ name: item.routeName })
    return
  }
  if(route.query){
    clearQuery()
  }
  // scrollInto()
}

watch(
  () => [route.name, route.query?.type],
  () => {
    const defaultTab = getDefaultTab()
    if (defaultTab && defaultTab !== activeTab.value) {
      activeTab.value = defaultTab
    }
  }
)

// Tab 内动态 props/events 更新时不重置当前选中项，仅在配置确实移除当前 Tab 时回退。
watch(
  () => props.data?.map(item => `${item.name}:${item.routeName || ''}`).join('|'),
  () => {
    if (props.data?.some(item => item.name === activeTab.value)) return
    activeTab.value = getDefaultTab()
  }
)

onMounted(() => {
  window.addEventListener('resize', handleTabsResize)
  nextTick(updateScrollButtons)
  // 如果链接带有 type 参数，说明是从其他地方跳过来专门看这个 Tab 的，自动滚动过去
  if (route.query.type) {
    // 稍微延迟确保页面和父容器滚动条已经完全挂载完毕
    setTimeout(() => {
     scrollInto()
    }, 300)
  }
})

onBeforeUnmount(() => window.removeEventListener('resize', handleTabsResize))
watch(() => props.data?.length, () => {
  tabsOverflow.value = true
  nextTick(updateScrollButtons)
})
watch(activeTab, scrollActiveTabIntoView)

</script>
<style lang="less" scoped>
.ui-tabs{
  display: flex;
  flex-direction: column;
  gap: var(--ui-tabs-gap);
  position: relative;
  .ui-tabs-list{
    position: sticky;
    top: 0;
    z-index: var(--ui-tabs-sticky-layer);
    display: flex;
    --gap: var(--ui-tabs-gap);
    gap:var(--gap);
    background: var(--ui-tabs-background);
    border-bottom: 1px var(--ui-tabs-border-color) solid;
    .ui-tabs-list-item{
      padding: var(--ui-space-2) var(--ui-space-8);
      box-sizing: border-box;
      border-radius: var(--ui-radius-full);
      cursor: pointer;
      position: relative;
      line-height: var(--ui-line-height-3xl);
      display: flex;
      align-items: center;
      justify-content: center;
      &:hover{
        color: var(--ui-color-primary);
      }
      &.active{
        color: var(--ui-color-primary);
        font-weight: var(--ui-font-weight-bold);
        &:after{
          content: '';
          position: absolute;
          bottom: -1px;
          left: 0;
          width: 100%;
          height:var(--ui-size-2);
          background: var(--ui-color-primary);
        }
      }
    }
  }
  .ui-tabs-tbody{
    flex: 1;
    position: relative;
    overflow: hidden;
    scroll-margin-top: 44px; /* 抵消 sticky tab 的高度，防止滚动后内容被遮挡 */
    :deep(>.ui-page){
      padding: 0 !important;
      .ui-page-thead{
        display: none;
      }
    }
  }
  @media screen and (max-width: 768px) {
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    top: 0;
    padding: 0;
    gap:0;
    .ui-tabs-scroll{
      position: absolute;
      top: 8px;
      z-index: 1001;
      width: var(--ui-size-28);
      height: var(--ui-size-28);
      padding: 0;
      border: var(--ui-border-primary-soft);
      border-radius: var(--ui-radius-circle);
      color: var(--ui-color-primary);
      background: color-mix(in srgb, var(--ui-color-surface) 94%, transparent);
      box-shadow: var(--ui-status-scroll-shadow);
      &--prev{ left: 6px; }
      &--next{ right: 6px; }
    }
    .ui-tabs-list{
      width: 100%;
      min-width: 0;
      gap: 0;
      padding: 0 var(--ui-space-8);
      box-sizing: border-box;
      overflow-x: auto;
      overflow-y: hidden;
      border-bottom-color: #edf0f4;
      background: var(--ui-color-surface-navigation);
      overscroll-behavior-x: contain;
      touch-action: pan-x;
      scrollbar-width: none;
      -webkit-overflow-scrolling: touch;
      &::-webkit-scrollbar{
        display: none;
      }
      &.hasPrev{ padding-left: 38px; }
      &.hasNext{ padding-right: 38px; }
      &:not(.is-scrollable) .ui-tabs-list-item{
        flex: 1 1 0;
        min-width: 0;
      }
      .ui-tabs-list-item{
        flex: 1 0 96px;
        min-width: 96px;
        min-height: 44px;
        padding: 0 var(--ui-space-12);
        border-radius: 0;
        line-height: var(--ui-line-height-md);
        text-align: center;
        white-space: nowrap;
        touch-action: manipulation;
        p{
          position: relative;
          z-index: 1;
        }
        &.active:before{
          position: absolute;
          bottom: -10px;
          left: 22%;
          right: 22%;
          height: var(--ui-size-28);
          border-radius: var(--ui-radius-circle);
          background: color-mix(in srgb, var(--ui-color-surface) 90%, transparent);
          filter: blur(10px);
          pointer-events: none;
          content: '';
        }
        &.active:after{
          left: 50%;
          width: var(--ui-size-24);
          height: var(--ui-size-3);
          border-radius: 3px 3px 0 0;
          transform: translateX(-50%);
        }
      }
    }
  }
}
@media screen and (min-width: 769px) {
  .ui-tabs-scroll{ display: none !important; }
}
</style>
