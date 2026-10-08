<script setup>
import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue'
import request from '@/api/request.js'
import { t } from '@/utils'

defineOptions({ inheritAttrs: false })
const props = defineProps({
  modelValue: { type: [Array, String, Number], default: () => [] },
  apiUrl: { type: String, required: true },
  method: { type: String, default: 'get', validator: (value) => ['get', 'post'].includes(value.toLowerCase()) },
  pageSize: { type: Number, default: 20 },
  params: { type: Object, default: () => ({}) },
  pageKey: { type: String, default: 'page' },
  pageSizeKey: { type: String, default: 'limit' },
  searchKey: { type: String, default: 'keyword' },
  valueKey: { type: String, default: 'id' },
  labelKey: { type: String, default: 'name' },
  selectedOptions: { type: Array, default: () => [] },
  dataProcessor: { type: Function, default: null },
  multiple: { type: Boolean, default: true },
  disabled: { type: Boolean, default: false },
  active: { type: Boolean, default: true },
  placeholder: { type: String, default: '' },
})
const emit = defineEmits(['update:modelValue', 'on-change', 'loading-change', 'load-error', 'options-loaded'])
const selectRef = ref(null)
const rows = ref([])
const searchPending = ref(false)
const loading = ref(false)
const loadError = ref(false)
const hasMore = ref(false)
const isOpen = ref(false)
const selectKey = ref(0)
const loadMoreRef = ref(null)
const selectedCache = ref(new Map())
const query = ref('')
let page = 0
let controller = null
let searchTimer = null
let requestId = 0
let observer = null
let pendingLabelRefresh = false

const selectedIds = computed(() => Array.isArray(props.modelValue)
  ? props.modelValue
  : props.modelValue === '' || props.modelValue == null ? [] : [props.modelValue])
const getLabel = (row) => String(row[props.labelKey] ?? row[props.valueKey])
const selectedRows = computed(() => selectedIds.value.map((id) => selectedCache.value.get(id)
  || props.selectedOptions.find((row) => row[props.valueKey] === id)
  || rows.value.find((row) => row[props.valueKey] === id)
  || { [props.valueKey]: id, [props.labelKey]: String(id) }))
const retainedOptions = computed(() => selectedRows.value.filter((row) => !rows.value.some((item) => item[props.valueKey] === row[props.valueKey])))
const selectedLabels = computed(() => selectedRows.value.map(getLabel))
// View UI Plus 会在更新多选值时清空 query，恢复搜索文本但不触发请求。
const restoreSearch = () => {
  const select = selectRef.value
  if (!select || (!props.multiple && !isOpen.value)) return
  select.preventRemoteCall = true
  select.query = query.value
  const head = select.$refs?.selectHead
  if (head) {
    head.preventRemoteCall = true
    head.query = query.value
  }
}
const refreshLabels = () => {
  selectKey.value += 1
  nextTick(restoreSearch)
}
watch(selectedIds, () => {
  if (props.multiple) nextTick(restoreSearch)
})
watch([() => JSON.stringify(selectedIds.value), () => JSON.stringify(selectedLabels.value)], ([ids, labels], [previousIds, previousLabels]) => {
  if (ids !== previousIds || labels === previousLabels) return
  if (isOpen.value) pendingLabelRefresh = true
  else refreshLabels()
})
watch(isOpen, (open) => {
  if (!open && pendingLabelRefresh) {
    pendingLabelRefresh = false
    refreshLabels()
  }
})

const rememberSelection = () => {
  const options = new Map([...selectedRows.value, ...props.selectedOptions, ...rows.value].map((row) => [row[props.valueKey], row]))
  selectedCache.value = new Map(selectedIds.value.map((id) => [id, options.get(id) || { [props.valueKey]: id }]))
}
watch([selectedIds, () => props.selectedOptions, rows], rememberSelection, { deep: true })

const updateValue = (value) => {
  const nextValue = props.multiple ? [...new Set(Array.isArray(value) ? value : [])] : value
  if (props.multiple
    ? nextValue.length === selectedIds.value.length && nextValue.every((id, index) => id === selectedIds.value[index])
    : nextValue === props.modelValue) return
  emit('update:modelValue', nextValue)
  emit('on-change', nextValue)
}
const clearSelection = () => {
  if (props.disabled || !props.multiple || !selectedIds.value.length) return
  updateValue([])
  nextTick(() => selectRef.value?.$refs?.selectHead?.$refs?.input?.focus())
}
const handleKeydown = (event) => {
  if (event.target?.closest('button')) return
  if (!isOpen.value || !['ArrowUp', 'ArrowDown', 'Enter'].includes(event.key)) return
  if (!searchPending.value && [...retainedOptions.value, ...rows.value].some((row) => !row.disabled)) return
  event.preventDefault()
  event.stopPropagation()
}
const setLoading = (value) => {
  loading.value = value
  emit('loading-change', value)
}
const cancelRequest = () => {
  requestId += 1
  controller?.abort()
  controller = null
  clearTimeout(searchTimer)
  searchTimer = null
}

const normalizeResponse = (response) => {
  if (props.dataProcessor) return props.dataProcessor(response)
  const list = Array.isArray(response) ? response : response?.data ?? response?.list
  if (!Array.isArray(list)) throw new Error('Invalid remote options')
  if (typeof response?.has_more === 'boolean') return { list, hasMore: response.has_more }
  if (response?.last_page != null) {
    const lastPage = Number(response.last_page)
    if (!Number.isInteger(lastPage) || lastPage < 0) throw new Error('Invalid pagination')
    return { list, hasMore: page + 1 < lastPage }
  }
  if (response?.total != null) return { list, hasMore: (page + 1) * props.pageSize < Number(response.total) }
  return { list, hasMore: !Array.isArray(response) && list.length >= props.pageSize }
}

const loadPage = async () => {
  if (!props.active || props.disabled || !props.apiUrl) return
  const currentRequestId = ++requestId
  const currentController = new AbortController()
  controller = currentController
  setLoading(true)
  loadError.value = false
  emit('load-error', null)
  try {
    const method = props.method.toLowerCase()
    if (!['get', 'post'].includes(method) || !Number.isInteger(props.pageSize) || props.pageSize < 1) throw new Error('Invalid remote select configuration')
    const parameters = { ...props.params, [props.pageKey]: page + 1, [props.pageSizeKey]: props.pageSize, [props.searchKey]: query.value }
    const response = await request({
      url: props.apiUrl,
      method,
      ...(method === 'get' ? { params: parameters } : { data: parameters }),
      signal: currentController.signal,
    })
    if (currentRequestId !== requestId || currentController.signal.aborted) return
    const result = normalizeResponse(response)
    if (!Array.isArray(result?.list) || typeof result.hasMore !== 'boolean') throw new Error('Invalid remote select result')
    const options = new Map((page === 0 ? [] : rows.value).map((row) => [row[props.valueKey], row]))
    const previousSize = options.size
    for (const row of result.list) {
      const id = row?.[props.valueKey]
      if ((typeof id !== 'string' && typeof id !== 'number') || id === '' || (typeof id === 'number' && !Number.isSafeInteger(id))) throw new Error('Invalid option ID')
      options.set(id, row)
    }
    rows.value = [...options.values()]
    searchPending.value = false
    page += 1
    hasMore.value = result.hasMore && options.size > previousSize
    emit('options-loaded', { options: rows.value, hasMore: result.hasMore, query: query.value })
  } catch (error) {
    if (currentRequestId !== requestId || currentController.signal.aborted || error?.code === 'ERR_CANCELED') return
    loadError.value = true
    emit('load-error', error)
  } finally {
    if (currentRequestId === requestId) {
      controller = null
      setLoading(false)
    }
  }
}
const reload = (delay = 0, preserveRows = false) => {
  rememberSelection()
  cancelRequest()
  if (!preserveRows) rows.value = []
  searchPending.value = true
  page = 0
  hasMore.value = false
  loadError.value = false
  emit('load-error', null)
  if (!props.active || props.disabled || !props.apiUrl) {
    setLoading(false)
    return
  }
  setLoading(true)
  if (delay) searchTimer = setTimeout(() => { searchTimer = null; loadPage() }, delay)
  else loadPage()
}
const remoteSearch = () => {}
// 仅响应原生输入，忽略标签选择、回填和中文输入法组合过程产生的变化。
const handleInput = (event) => {
  if (event.target?.tagName !== 'INPUT' || event.isComposing || props.disabled || !props.active) return
  handleSearch(event.target.value)
}
const handleSearch = (value) => {
  const nextQuery = String(value || '').trim()
  if (nextQuery === query.value) return
  query.value = nextQuery
  reload(300, true)
}
const loadMore = () => {
  if (isOpen.value && props.active && !props.disabled && !loading.value && !loadError.value && hasMore.value) loadPage()
}
const retry = () => { if (!loading.value) loadPage() }
watch([
  () => props.apiUrl, () => props.method, () => props.pageSize, () => JSON.stringify(props.params),
  () => props.pageKey, () => props.pageSizeKey, () => props.searchKey, () => props.valueKey,
  () => props.labelKey, () => props.dataProcessor, () => props.active,
], () => {
  query.value = ''
  reload()
  nextTick(restoreSearch)
}, { immediate: true })
watch(() => props.disabled, (disabled) => {
  if (disabled) { cancelRequest(); setLoading(false) }
  else if (props.active && (searchPending.value || !rows.value.length)) reload(0, true)
})
watch([loadMoreRef, isOpen, () => props.disabled], async () => {
  observer?.disconnect()
  await nextTick()
  observer?.disconnect()
  const element = loadMoreRef.value?.$el
  if (!element || !isOpen.value || props.disabled || typeof IntersectionObserver === 'undefined') return
  observer = new IntersectionObserver((entries) => {
    if (entries.some((entry) => entry.isIntersecting)) loadMore()
  })
  observer.observe(element)
}, { flush: 'post' })
onBeforeUnmount(() => {
  cancelRequest()
  observer?.disconnect()
})
defineExpose({ reload: () => reload(), getSelectedOptions: () => selectedRows.value })
</script>

<template>
  <div class="form-remote-select" :class="{ 'has-clear': multiple && selectedIds.length && !disabled }">
    <Select
      ref="selectRef"
      :key="selectKey"
      v-bind="$attrs"
      :model-value="modelValue"
      :multiple="multiple"
      :disabled="disabled"
      :placeholder="placeholder || t('placeholder.selectPlaceholder')"
      :default-label="multiple ? selectedLabels : selectedLabels[0]"
      :remote-method="remoteSearch"
      :hide-not-found="true"
      :events-enabled="true"
      filterable
      clearable
      transfer-class-name="form-select-box-dropdown"
      @update:model-value="updateValue"
      @input.capture="handleInput"
      @compositionend.capture="handleInput"
      @on-open-change="isOpen = $event"
      @keydown.capture="handleKeydown"
    >
      <Option v-for="row in rows" :key="row[valueKey]" :class="{ 'remote-select-hidden': searchPending }" :value="row[valueKey]" :label="getLabel(row)" :disabled="row.disabled || searchPending">
        <slot :row="row">{{ getLabel(row) }}</slot>
      </Option>
      <!-- 远程 Select 无 Option 时会关闭弹层，失败时保留占位注册但隐藏文案。 -->
      <Option v-if="!rows.length" v-show="!loadError" class="remote-select-empty" value="" disabled>
        {{ t(loading ? (query ? 'remoteSelect.searching' : 'remoteSelect.loading') : query ? 'remoteSelect.noResults' : 'remoteSelect.empty') }}
      </Option>
      <OptionGroup v-if="retainedOptions.length" :class="{ 'remote-select-hidden': searchPending }" :label="t('remoteSelect.selected')">
        <Option v-for="row in retainedOptions" :key="row[valueKey]" :value="row[valueKey]" :label="getLabel(row)" :disabled="row.disabled || searchPending">
          <slot :row="row">{{ getLabel(row) }}</slot>
        </Option>
      </OptionGroup>
      <li class="remote-select-state" @mousedown.prevent @click.stop @keydown.stop>
        <span v-if="loading && rows.length" role="status" aria-live="polite">{{ t(page > 0 ? 'remoteSelect.loadingMore' : query ? 'remoteSelect.searching' : 'remoteSelect.loading') }}</span>
        <Button v-else-if="loadError" size="small" type="text" :disabled="disabled" @click="retry">
          {{ t('remoteSelect.retry') }}
        </Button>
        <Button v-else-if="hasMore" ref="loadMoreRef" size="small" type="text" :disabled="disabled" @click="loadMore">
          {{ t('button.loadMore') }}
        </Button>
      </li>
    </Select>
    <Icon
      v-if="!multiple"
      class="remote-select-arrow"
      :class="{ 'is-open': isOpen }"
      custom="iconfont icon-arrow-dropdown"
      aria-hidden="true"
    />
    <button
      v-if="multiple && selectedIds.length && !disabled"
      class="remote-select-clear"
      type="button"
      :aria-label="t('ucenterAccount.memberPicker.clearSelection')"
      :title="t('ucenterAccount.memberPicker.clearSelection')"
      @mousedown.prevent
      @click.stop="clearSelection"
    >
      <Icon type="ios-close-circle" />
    </button>
  </div>
</template>

<style scoped lang="less">
.form-remote-select {
  position: relative;
  width: 100%;

  &.has-clear :deep(.ivu-select-selection) { padding-inline-end: var(--ui-space-32); }
  :deep(.ivu-select:has(.ivu-select-selection .ivu-select-arrow)) ~ .remote-select-arrow { display: none; }
}
.remote-select-arrow {
  position: absolute;
  top: 50%;
  inset-inline-end: var(--ui-space-8);
  color: var(--ui-color-text-secondary);
  font-size: var(--ui-font-size-lg);
  pointer-events: none;
  transform: translateY(-50%);

  &.is-open { transform: translateY(-50%) rotate(180deg); }
}
.remote-select-clear {
  position: absolute;
  inset-block: 0;
  inset-inline-end: var(--ui-space-4);
  display: flex;
  align-items: center;
  justify-content: center;
  width: var(--ui-size-24);
  padding: 0;
  border: 0;
  background: transparent;
  color: var(--ui-color-text-secondary);
  font-size: var(--ui-font-size-lg);
  cursor: pointer;

  &:hover { color: var(--ui-color-text); }
  &:focus-visible { outline: var(--ui-border-primary-accent); outline-offset: 0; }
}

.remote-select-hidden { display: none; }

.remote-select-empty {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: var(--ui-line-height-3xl);
  padding: var(--ui-space-8) var(--ui-space-12);
  line-height: var(--ui-line-height-md);
  white-space: normal;
  text-align: center;
}

.remote-select-state {
  padding: var(--ui-space-8) var(--ui-space-12);
  text-align: center;
  color: var(--ui-color-text-secondary);
  list-style: none;

  &:empty {
    display: none;
  }
}
</style>
