<template>
  <div class="ui-filter-select">
    <span v-if="title" class="filter-label" :title="title">{{ title }}</span>
    <Poptip v-model="isOpen" trigger="click" placement="bottom-end" :width="width" padding="0" :events-enabled="true" transfer transfer-class-name="ui-filter-select-poptip">
      <button ref="triggerRef" type="button" class="filter-trigger" :class="{ active: isOpen }" :title="selectedText" :aria-label="title + selectedText" aria-haspopup="listbox" :aria-expanded="isOpen" @keydown.esc.stop.prevent="close" @keydown.down.stop.prevent="isOpen = true">
        <span>{{ selectedText }}</span>
        <Icon custom="iconfont icon-caret-dropdown" :class="{ expanded: isOpen }" aria-hidden="true" />
      </button>
      <template #content>
        <div class="filter-panel" @keydown.esc.stop.prevent="close" @keydown="moveFocus" @focusout="handleFocusOut">
          <div class="filter-search">
            <FormInput ref="searchRef" v-model="query" :placeholder="t('uiCommon.search')" :aria-label="t('uiCommon.search')" :change-delay="0" clearable>
              <template #prefix>
                <Icon custom="iconfont icon-search" aria-hidden="true" />
              </template>
            </FormInput>
          </div>
          <div class="filter-options" role="listbox" :aria-label="title || placeholder" :aria-busy="loading">
            <button v-if="!loading && !query.trim()" type="button" class="filter-option" role="option" :aria-selected="!selectedIds.length" @click="clear">
              <span>{{ t('card.index.common.all') }}</span>
            </button>
            <button v-for="row in visibleOptions" :key="row[ValueKey]" type="button" class="filter-option" role="option" :aria-selected="selectedIds.includes(row[ValueKey])" :disabled="row.disabled || loading" :title="optionLabel(row)" @click="select(row)">
              <slot name="option" :row="row"><span>{{ optionLabel(row) }}</span></slot>
            </button>
            <div v-if="loading" class="filter-state" role="status">{{ t('remoteSelect.loading') }}</div>
            <div v-else-if="loadError" class="filter-state"><Button type="text" @click="loadPage">{{ t('remoteSelect.retry') }}</Button></div>
            <div v-else-if="!visibleOptions.length" class="filter-state">{{ t(query ? 'remoteSelect.noResults' : 'remoteSelect.empty') }}</div>
            <div v-else-if="hasMore" class="filter-state"><Button type="text" @click="loadPage">{{ t('button.loadMore') }}</Button></div>
          </div>
        </div>
      </template>
    </Poptip>
  </div>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue'
import FormInput from '@/components/form/FormInput/index.vue'
import request from '@/api/request.js'
import { t } from '@/utils'

const props = defineProps({
  modelValue: { type: [String, Number], default: '' },
  title: { type: String, default: '' },
  url: { type: String, default: '' },
  opention: { type: Array, default: () => [] },
  lableKey: { type: String, default: 'label' },
  ValueKey: { type: String, default: 'value' },
  placeholder: { type: String, default: '' },
  width: { type: Number, default: 280 },
})
const emit = defineEmits(['update:modelValue', 'on-change'])
const isOpen = ref(false)
const triggerRef = ref(null)
const searchRef = ref(null)
const query = ref('')
const rows = ref([])
const loading = ref(false)
const loadError = ref(false)
const hasMore = ref(false)
const selectedRow = ref(null)
let page = 0
let controller = null
let timer = null
let requestId = 0
const selectedIds = computed(() => props.modelValue === '' || props.modelValue == null ? [] : [props.modelValue])
const optionLabel = row => String(row[props.lableKey] ?? row[props.ValueKey])
const visibleOptions = computed(() => props.url ? rows.value : props.opention.filter(row => optionLabel(row).toLocaleLowerCase().includes(query.value.trim().toLocaleLowerCase())))
const selectedText = computed(() => {
  if (!selectedIds.value.length) return props.placeholder || t('card.index.common.all')
  const options = props.url ? rows.value : props.opention
  return selectedIds.value.map(id => {
    const row = options.find(row => row[props.ValueKey] === id) || (selectedRow.value?.[props.ValueKey] === id ? selectedRow.value : null)
    return row ? optionLabel(row) : String(id)
  }).join(', ')
})
const close = () => {
  isOpen.value = false
  nextTick(() => triggerRef.value?.focus())
}
const updateValue = value => {
  if (value !== props.modelValue) {
    emit('update:modelValue', value)
    emit('on-change', value)
  }
  close()
}
const select = row => {
  if (row.disabled || loading.value) return
  const id = row[props.ValueKey]
  selectedRow.value = row
  updateValue(id)
}
const clear = () => {
  updateValue('')
}
const cancelRequest = () => {
  requestId++
  controller?.abort()
  controller = null
  clearTimeout(timer)
  timer = null
  loading.value = false
}
const loadPage = async () => {
  if (!props.url || loading.value) return
  const id = ++requestId
  const currentController = new AbortController()
  controller = currentController
  loading.value = true
  loadError.value = false
  try {
    const response = await request({ url: props.url, method: 'get', params: { page: page + 1, limit: 100, keyword: query.value.trim() }, signal: currentController.signal })
    if (id !== requestId || currentController.signal.aborted) return
    const list = Array.isArray(response) ? response : response?.data ?? response?.list
    if (!Array.isArray(list)) throw new Error('Invalid filter options')
    const options = new Map(rows.value.map(row => [row[props.ValueKey], row]))
    const previousSize = options.size
    for (const row of list) {
      const value = row?.[props.ValueKey]
      if ((typeof value !== 'string' && typeof value !== 'number') || value === '' || (typeof value === 'number' && !Number.isSafeInteger(value))) throw new Error('Invalid option ID')
      options.set(value, row)
      if (selectedIds.value.includes(value)) selectedRow.value = row
    }
    rows.value = [...options.values()]
    page++
    const more = typeof response?.has_more === 'boolean' ? response.has_more
      : response?.last_page != null ? page < Number(response.last_page)
      : response?.total != null ? page * 100 < Number(response.total)
      : !Array.isArray(response) && list.length >= 100
    hasMore.value = more && options.size > previousSize
  } catch (error) {
    if (id === requestId && !currentController.signal.aborted) loadError.value = true
  } finally {
    if (id === requestId) { loading.value = false; controller = null }
  }
}
const reload = (delay = 0) => {
  cancelRequest()
  rows.value = []
  page = 0
  hasMore.value = false
  loadError.value = false
  if (props.url) {
    if (delay) {
      loading.value = true
      timer = setTimeout(() => { timer = null; loading.value = false; loadPage() }, delay)
    }
    else loadPage()
  }
}
watch(query, () => { if (props.url) reload(300) })
watch(isOpen, async open => {
  if (!open) return
  await nextTick()
  if (isOpen.value) searchRef.value?.$el?.querySelector('input')?.focus()
})
watch(() => [props.url, props.ValueKey, props.lableKey], () => {
  selectedRow.value = null
  reload()
}, { immediate: true })
const moveFocus = event => {
  if (!['ArrowDown', 'ArrowUp'].includes(event.key) || event.isComposing) return
  const options = [...event.currentTarget.querySelectorAll('[role="option"]:not(:disabled)')]
  if (!options.length) return
  event.preventDefault()
  const index = options.indexOf(document.activeElement)
  const targetIndex = index < 0 ? (event.key === 'ArrowDown' ? 0 : options.length - 1) : (index + (event.key === 'ArrowDown' ? 1 : -1) + options.length) % options.length
  options[targetIndex]?.focus()
}
const handleFocusOut = event => {
  if (event.relatedTarget && !event.currentTarget.contains(event.relatedTarget) && !triggerRef.value?.contains(event.relatedTarget)) isOpen.value = false
}
onBeforeUnmount(cancelRequest)
</script>

<style lang="less" scoped>
.ui-filter-select { display: flex; align-items: center; min-width: 0; gap: var(--ui-space-4); }
.filter-label { color: var(--ui-color-text-secondary); white-space: nowrap; }
.filter-trigger {
  display: flex;
  align-items: center;
  max-width: 200px;
  gap: var(--ui-space-4);
  padding: var(--ui-space-4) var(--ui-space-8);
  border: 0;
  border-radius: var(--ui-radius-sm);
  background: transparent;
  color: var(--ui-color-primary);
  font: inherit;
  cursor: pointer;
  > span { min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  &:hover, &.active { background: var(--ui-color-surface-selected); }
  &:focus-visible { outline: var(--ui-outline-primary); }
  .expanded { transform: rotate(180deg); }
}
.filter-panel {
  overflow: hidden;
  border-radius: var(--ui-radius-lg);
  background: var(--ui-color-surface);
  color: var(--ui-color-text);
  white-space: normal;

  .filter-search {
    padding: var(--ui-space-8);
    border-bottom: var(--ui-border-subtle);
    background: var(--ui-color-surface-muted);

    :deep(.ivu-input) {
      height: var(--ui-size-36);
      border-radius: var(--ui-radius-6);
      border-color: var(--ui-color-control-border);
      background: var(--ui-color-surface);

      &:focus {
        border-color: var(--ui-color-control-border-focus);
        box-shadow: var(--ui-input-focus-shadow);
      }
    }

    :deep(.ivu-input-prefix i),
    :deep(.ivu-input-icon) {
      height: var(--ui-size-36);
      line-height: var(--ui-line-height-3xl);
      color: var(--ui-color-text-secondary);
    }
  }

  .filter-options {
    display: flex;
    flex-direction: column;
    gap: var(--ui-space-2);
    max-height: 300px;
    overflow-y: auto;
    padding: var(--ui-space-8);
  }

  .filter-option {
    display: flex;
    align-items: center;
    flex-shrink: 0;
    gap: var(--ui-space-8);
    width: 100%;
    min-height: var(--ui-size-36);
    padding: var(--ui-space-8) var(--ui-space-12);
    border: 0;
    border-radius: var(--ui-radius-6);
    background: transparent;
    color: inherit;
    font: inherit;
    line-height: var(--ui-line-height-md);
    text-align: start;
    cursor: pointer;

    > span:last-child {
      min-width: 0;
      overflow-wrap: anywhere;
    }

    &:hover:not(:disabled):not([aria-selected="true"]) {
      background: var(--ui-color-surface-hover);
    }

    &[aria-selected="true"] {
      background: var(--ui-color-surface-selected);
      color: var(--ui-color-primary);
      font-weight: var(--ui-font-weight-semibold);
    }

    &:focus-visible {
      outline: var(--ui-outline-primary);
      outline-offset: -2px;
    }

    &:disabled {
      cursor: not-allowed;
      opacity: var(--ui-opacity-control-disabled);
    }
  }

  .filter-state {
    padding: var(--ui-space-12);
    text-align: center;
    color: var(--ui-color-text-secondary);
  }
}

:global(.ui-filter-select-poptip .ivu-poptip-inner) {
  border: var(--ui-border-overlay-soft);
  border-radius: var(--ui-radius-lg);
  box-shadow: var(--ui-shadow-neutral-floating);
}

:global(.ui-filter-select-poptip .ivu-poptip-arrow) {
  display: none;
}
</style>
