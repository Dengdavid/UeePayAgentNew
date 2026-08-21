<template>
  <div class="cashback-category-tabs">
    <button
      v-show="canScrollPrev"
      type="button"
      class="tabs-scroll tabs-scroll--prev"
      :aria-label="previousLabel"
      @click="scrollTabs(-1)"
    >
      <Icon type="ios-arrow-back" />
    </button>
    <div
      ref="tabsListRef"
      class="tabs-list"
      :class="{ hasPrev: canScrollPrev, hasNext: canScrollNext, 'is-scrollable': tabsOverflow }"
      role="tablist"
      :aria-label="ariaLabel"
      @scroll.passive="updateScrollButtons"
    >
      <button
        v-for="(item, index) in items"
        :key="item.value"
        :ref="(element) => setTabRef(element, index)"
        class="cashback-category-tab"
        :class="{ active: modelValue === item.value }"
        type="button"
        role="tab"
        :aria-selected="modelValue === item.value"
        :tabindex="modelValue === item.value ? 0 : -1"
        @click="selectTab(item.value)"
        @keydown="handleKeydown($event, index)"
      >
        {{ item.label }}
      </button>
    </div>
    <button
      v-show="canScrollNext"
      type="button"
      class="tabs-scroll tabs-scroll--next"
      :aria-label="nextLabel"
      @click="scrollTabs(1)"
    >
      <Icon type="ios-arrow-forward" />
    </button>
  </div>
</template>

<script setup>
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'

const props = defineProps({
  items: {
    type: Array,
    default: () => [],
  },
  modelValue: {
    type: String,
    default: '',
  },
  ariaLabel: {
    type: String,
    default: '',
  },
  previousLabel: {
    type: String,
    default: '',
  },
  nextLabel: {
    type: String,
    default: '',
  },
})

const emit = defineEmits(['update:modelValue'])
const tabRefs = ref([])
const tabsListRef = ref(null)
const canScrollPrev = ref(false)
const canScrollNext = ref(false)
const tabsOverflow = ref(false)

const setTabRef = (element, index) => {
  if (element) tabRefs.value[index] = element
}

const selectTab = (value) => {
  if (value !== props.modelValue) emit('update:modelValue', value)
}

const updateScrollButtons = () => {
  const element = tabsListRef.value
  if (!element) return
  tabsOverflow.value = element.scrollWidth > element.clientWidth + 2
  canScrollPrev.value = tabsOverflow.value && element.scrollLeft > 2
  canScrollNext.value = tabsOverflow.value && element.scrollLeft + element.clientWidth < element.scrollWidth - 2
}

const scrollTabs = (direction) => {
  tabsListRef.value?.scrollBy({ left: direction * 120, behavior: 'smooth' })
}

const scrollActiveTabIntoView = () => {
  nextTick(() => {
    tabsListRef.value?.querySelector('.cashback-category-tab.active')?.scrollIntoView({
      behavior: 'smooth',
      block: 'nearest',
      inline: 'center',
    })
  })
}

const handleResize = () => nextTick(updateScrollButtons)

const focusTab = (index) => {
  const target = props.items[index]
  if (!target) return
  selectTab(target.value)
  tabRefs.value[index]?.focus()
  tabRefs.value[index]?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' })
}

const handleKeydown = (event, index) => {
  const lastIndex = props.items.length - 1
  const targetIndex = {
    ArrowLeft: index === 0 ? lastIndex : index - 1,
    ArrowRight: index === lastIndex ? 0 : index + 1,
    Home: 0,
    End: lastIndex,
  }[event.key]

  if (targetIndex === undefined) return
  event.preventDefault()
  focusTab(targetIndex)
}

onMounted(() => {
  window.addEventListener('resize', handleResize)
  nextTick(updateScrollButtons)
})

onBeforeUnmount(() => window.removeEventListener('resize', handleResize))

watch(() => props.items.length, handleResize)
watch(() => props.modelValue, scrollActiveTabIntoView)
</script>

<style scoped>
.cashback-category-tabs {
  position: relative;
  width: 100%;
  min-width: 0;
  border-radius: var(--ui-radius-sm);
  background: var(--ui-color-surface-subtle);
}

.tabs-list {
  display: flex;
  gap: 8px;
  width: 100%;
  min-width: 0;
  padding: var(--ui-padding-4-6);
  overflow-x: auto;
  border-radius: inherit;
  scrollbar-width: thin;
}

.tabs-scroll {
  display: none;
}

.cashback-category-tab {
  flex: 0 0 auto;
  min-width: 58px;
  height: var(--ui-size-30);
  padding: var(--ui-padding-0-12);
  border: 0;
  border-radius: var(--ui-radius-sm);
  color: var(--text-color);
  background: transparent;
  cursor: pointer;
  font-size: 13px;
  line-height: 30px;
  white-space: nowrap;
  transition: color 0.2s ease, background-color 0.2s ease;
}

.cashback-category-tab:hover {
  color: var(--primary-color);
}

.cashback-category-tab.active {
  color: var(--white-color);
  background: var(--primary-color);
}

.cashback-category-tab:focus-visible {
  outline: 2px solid var(--primary-color);
  outline-offset: 2px;
}

.cashback-category-tab.active:hover {
  color: var(--white-color);
}

@media (max-width: 767px) {
  .tabs-list {
    gap: 4px;
    padding: var(--ui-padding-4);
    overscroll-behavior-x: contain;
    touch-action: pan-x;
    -webkit-overflow-scrolling: touch;
    scrollbar-width: none;
  }

  .tabs-list.hasPrev {
    padding-left: 34px;
  }

  .tabs-list.hasNext {
    padding-right: 34px;
  }

  .tabs-list::-webkit-scrollbar {
    display: none;
  }

  .tabs-scroll {
    position: absolute;
    top: 5px;
    z-index: 2;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: var(--ui-size-28);
    height: var(--ui-size-28);
    padding: 0;
    border: 1px solid var(--ui-color-border-subtle);
    border-radius: var(--ui-radius-circle);
    color: var(--primary-color);
    background: var(--white-color);
    cursor: pointer;
  }

  .tabs-scroll--prev {
    left: 3px;
  }

  .tabs-scroll--next {
    right: 3px;
  }

  .cashback-category-tab {
    min-width: auto;
    padding: var(--ui-padding-0-10);
  }
}
</style>
