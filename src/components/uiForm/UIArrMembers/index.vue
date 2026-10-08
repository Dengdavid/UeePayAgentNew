<template>
  <div v-if="isPhone" class="account-members-text">{{ members.length ? members.map(member => member.name).join('、') : emptyText }}</div>
  <div v-else class="account-members" :class="{ 'is-summary': summary }">
    <Tooltip v-if="summary && members.length" class="account-members-preview" :content="members[0].name" :disabled="!nameOverflows" :always="nameFocused && nameOverflows" :max-width="320" transfer>
      <span ref="nameElement" class="account-members-name" :title="nameOverflows ? members[0].name : undefined" :tabindex="nameOverflows ? 0 : -1" @mouseenter="updateNameOverflow" @focus="nameFocused = true" @blur="nameFocused = false" @keydown.esc="nameFocused = false">{{ members[0].name }}</span>
    </Tooltip>
    <span v-else-if="summary" class="account-members-empty">{{ emptyText }}</span>
    <Poptip
      v-if="!summary || remainingCount"
      v-model="isOpen"
      trigger="click"
      :placement="summary ? 'right-start' : 'top'"
      :width="summary ? 320 : 240"
      :disabled="!members.length"
      transfer
      :transfer-class-name="summary ? 'account-members-poptip account-members-poptip-summary' : 'account-members-poptip'"
    >
      <button
        ref="countButton"
        type="button"
        class="account-members-count"
        :class="{ 'is-open': isOpen }"
        :disabled="!members.length"
        :aria-label="`${panelTitle}: ${countText}`"
        :aria-expanded="isOpen"
        :aria-controls="accountMembersListId"
        @keydown.esc.stop.prevent="closePanel"
      >
        <span>{{ summary ? `+${remainingCount}` : members.length }}</span>
      </button>
      <template #title>
        <div class="account-members-heading">
          <div class="account-members-title" :title="panelTitle">{{ panelTitle }}</div>
          <span v-if="summary" class="account-members-total">{{ countText }}</span>
        </div>
      </template>
      <template #content>
        <div :id="accountMembersListId" class="account-members-panel" role="region" :aria-label="panelTitle" @keydown.esc.stop.prevent="closePanel" @focusout="handleFocusOut">
          <div v-if="summary" class="account-members-search">
            <Icon custom="iconfont icon-search" aria-hidden="true" />
            <input ref="searchInput" v-model="keyword" type="search" :placeholder="searchText" :aria-label="searchText" />
            <button v-if="keyword" type="button" class="account-members-clear" :title="clearText" :aria-label="clearText" @mousedown.prevent @click="keyword = ''; searchInput?.focus()">
              <Icon type="md-close-circle" aria-hidden="true" />
            </button>
          </div>
          <ul v-if="filteredMembers.length" class="account-members-list" tabindex="0" :aria-label="panelTitle">
            <li v-for="member in filteredMembers" :key="member.key" class="account-members-item" :title="member.name">
              <span v-if="summary && $slots['item-icon']" class="account-members-avatar" aria-hidden="true"><slot name="item-icon" :item="member.value" :text="member.name" /></span>
              <span class="account-members-item__name">{{ member.name }}</span>
            </li>
          </ul>
          <p v-else class="account-members-no-results" role="status">{{ noResultsMessage }}</p>
        </div>
      </template>
    </Poptip>
  </div>
</template>

<script setup>
import { computed, nextTick, ref, useId, watch } from 'vue'
import { useResizeObserver } from '@vueuse/core'
import { t } from '@/utils'
import { isPhone } from '@/utils/device'

const props = defineProps({
  data: { type: Array, default: () => [] },
  title: { type: String },
  label: { type: String },
  nameKey: { type: [String, Array], default: 'name' },
  searchPlaceholder: { type: String },
  clearLabel: { type: String },
  noResultsText: { type: String },
  emptyText: { type: String, default: '-' },
  countFormatter: { type: Function, default: count => String(count) },
  separator: { type: String, default: '-' },
  summary: { type: Boolean, default: true },
})
const isOpen = ref(false)
const nameFocused = ref(false)
const nameElement = ref(null)
const nameOverflows = ref(false)
const keyword = ref('')
const searchInput = ref(null)
const countButton = ref(null)
const accountMembersListId = useId()
const panelTitle = computed(() => props.title ?? props.label ?? t('uiCommon.title'))
const searchText = computed(() => props.searchPlaceholder ?? t('uiCommon.searchWithTitle', { title: panelTitle.value }))
const clearText = computed(() => props.clearLabel ?? t('uiCommon.clear'))
const noResultsMessage = computed(() => props.noResultsText ?? t('uiCommon.noResultsWithTitle', { title: panelTitle.value }))
const members = computed(() => {
  const keys = Array.isArray(props.nameKey) ? props.nameKey : [props.nameKey]
  return (Array.isArray(props.data) ? props.data : []).filter(item => item != null).map((item, index) => {
    const name = typeof item === 'object'
      ? keys.map(key => item[key]).filter(value => value != null && value !== '').join(` ${props.separator} `) || props.emptyText
      : String(item)
    return { name, key: `${item?.id ?? name}-${index}`, value: item }
  })
})
const countText = computed(() => props.countFormatter(members.value.length))
const remainingCount = computed(() => Math.max(members.value.length - 1, 0))
const filteredMembers = computed(() => {
  const query = keyword.value.trim().toLocaleLowerCase()
  return !props.summary || !query ? members.value : members.value.filter(member => member.name.toLocaleLowerCase().includes(query))
})
const updateNameOverflow = () => {
  const element = nameElement.value
  nameOverflows.value = Boolean(element && element.scrollWidth > element.clientWidth)
}
const closePanel = async () => {
  isOpen.value = false
  await nextTick()
  countButton.value?.focus()
}
const handleFocusOut = event => {
  if (event.relatedTarget && !event.currentTarget.contains(event.relatedTarget)) isOpen.value = false
}

useResizeObserver(nameElement, updateNameOverflow)
watch([nameElement, () => members.value[0]?.name], updateNameOverflow, { flush: 'post' })
watch(isOpen, async open => {
  keyword.value = ''
  if (open && props.summary) {
    await nextTick()
    if (isOpen.value) searchInput.value?.focus()
  }
})
watch(remainingCount, count => {
  if (props.summary && !count) isOpen.value = false
})
</script>

<style scoped lang="less">
.account-members-text {
  line-height: var(--ui-line-height-md);
  white-space: normal;
  overflow-wrap: anywhere;
}

.account-members {
  display: inline-flex;
  align-items: center;
  gap: var(--ui-space-6);
  max-width: 100%;
  min-width: 0;

  &.is-summary {
    width: 100%;

    > :deep(.ivu-poptip) { flex-shrink: 0; }

    .account-members-count {
      min-width: var(--ui-size-32);
      border: 0;
      border-radius: var(--ui-radius-md);

      &.is-open {
        color: var(--ui-color-text-inverse);
        background: var(--ui-color-primary);
      }
    }
  }
}

.account-members-preview {
  display: block;
  min-width: 0;
  max-width: 100%;
  flex: 0 1 auto;

  :deep(.ivu-tooltip-rel) { display: block; min-width: 0; }
}

.account-members-name {
  display: block;
  overflow: hidden;
  padding: var(--ui-space-4) var(--ui-space-8);
  border-radius: var(--ui-radius-md);
  background: var(--ui-color-surface-muted);
  color: var(--ui-color-text);
  line-height: var(--ui-line-height-md);
  text-overflow: ellipsis;
  white-space: nowrap;

  &:focus-visible { outline: 2px solid var(--ui-color-primary); outline-offset: 2px; }
}

:deep(.ivu-poptip-rel) {
  display: inline-flex;
}

.account-members-count {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--ui-space-4);
  box-sizing: border-box;
  min-width: var(--ui-size-44);
  height: var(--ui-size-26);
  padding: 0 var(--ui-space-8);
  border: var(--ui-border-primary-soft);
  border-radius: var(--ui-radius-full);
  color: var(--ui-color-primary);
  background: var(--ui-color-surface-selected);
  font: inherit;
  font-size: 13px;
  font-weight: var(--ui-font-weight-semibold);
  line-height: 1;
  cursor: pointer;
  transition:
    color var(--ui-motion-control) var(--ui-ease-standard),
    border-color var(--ui-motion-control) var(--ui-ease-standard),
    background-color var(--ui-motion-control) var(--ui-ease-standard),
    box-shadow var(--ui-motion-control) var(--ui-ease-standard);

  &:hover,
  &.is-open {
    border-color: var(--ui-color-border-primary-muted);
    background: var(--ui-color-surface-selected-strong);
  }

  &.is-open {
    box-shadow: var(--ui-shadow-primary-soft);
  }

  &:focus-visible {
    outline: none;
    box-shadow: var(--ui-shadow-focus-brand);
  }
}

.account-members-empty {
  display: inline-flex;
  color: var(--ui-color-text-muted);
  font-size: 13px;
  line-height: var(--ui-size-26);
}

</style>

<style lang="less">
.account-members-poptip {
  max-width: calc(100vw - var(--ui-space-24));

  .ivu-poptip-inner {
    box-sizing: border-box;
    overflow: hidden;
    border: var(--ui-border-muted);
    border-radius: var(--ui-radius-lg);
    background: var(--ui-color-surface);
    box-shadow: var(--ui-shadow-surface);
  }

  .ivu-poptip-title {
    padding: var(--ui-space-6) var(--ui-space-10);
    background: var(--ui-color-surface-muted);
  }

  .ivu-poptip-title::after {
    right: 0;
    left: 0;
    background: var(--ui-color-border-subtle);
  }

  .ivu-poptip-body {
    padding: var(--ui-space-4) 0 var(--ui-space-6);
  }

  .ivu-poptip-body-content {
    overflow: visible;
  }

  &[x-placement^="top"] .ivu-poptip-arrow {
    border-top-color: var(--ui-color-border-muted);
  }

  &[x-placement^="top"] .ivu-poptip-arrow::after {
    border-top-color: var(--ui-color-surface);
  }

  &[x-placement^="bottom"] .ivu-poptip-arrow {
    border-bottom-color: var(--ui-color-border-muted);
  }

  &[x-placement^="bottom"] .ivu-poptip-arrow::after {
    border-bottom-color: var(--ui-color-surface-muted);
  }

  .account-members-title {
    overflow: hidden;
    color: var(--ui-color-text);
    font-size: 13px;
    font-weight: var(--ui-font-weight-semibold);
    line-height: var(--ui-line-height-md);
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .account-members-list {
    max-height: 50vh;
    margin: 0;
    padding: 0;
    overflow-x: hidden;
    overflow-y: auto;
    background: var(--ui-color-surface);
    list-style: none;
    white-space: normal;
  }

  .account-members-item {
    min-height: var(--ui-size-32);
    padding: var(--ui-space-6) var(--ui-space-10);
    color: var(--ui-color-text);
    background: var(--ui-color-surface);
    font-size: 13px;
    line-height: var(--ui-line-height-md);
  }

  .account-members-item + .account-members-item {
    border-top: var(--ui-border-subtle);
  }

  .account-members-item__name {
    display: block;
    overflow-wrap: anywhere;
    font-variant-numeric: tabular-nums;
  }
}
.account-members-poptip-summary {
  .ivu-poptip-title {
    padding: var(--ui-space-12) var(--ui-space-16);
    background: var(--ui-color-surface);

    &::after { display: none; }
  }

  .account-members-heading {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--ui-space-12);
  }

  .account-members-title { font-size: var(--ui-font-size-md); }

  .account-members-total {
    flex-shrink: 0;
    color: var(--ui-color-primary);
    font-size: var(--ui-font-size-xs);
  }

  .account-members-search {
    position: relative;
    display: flex;
    align-items: center;
    gap: var(--ui-space-8);
    margin: 0 var(--ui-space-16) var(--ui-space-8);
    padding: var(--ui-space-6) var(--ui-space-8);
    border: var(--ui-border-muted);
    border-radius: var(--ui-radius-md);
    color: var(--ui-color-text-muted);
    background: var(--ui-color-surface-muted);

    &:focus-within { border-color: var(--ui-color-primary); }

    input {
      width: 100%;
      min-width: 0;
      padding-inline-end: var(--ui-space-24);
      border: 0;
      outline: 0;
      background: transparent;
      color: var(--ui-color-text);
      font: inherit;

      &::placeholder { color: var(--ui-color-text-muted); }
      &::-webkit-search-cancel-button { -webkit-appearance: none; }
    }

    .account-members-clear {
      position: absolute;
      top: 50%;
      inset-inline-end: var(--ui-space-8);
      display: inline-flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      width: var(--ui-size-24);
      height: var(--ui-size-24);
      padding: 0;
      border: 0;
      border-radius: var(--ui-radius-circle);
      color: var(--ui-color-text-muted);
      background: transparent;
      cursor: pointer;
      transform: translateY(-50%);

      &:hover { color: var(--ui-color-text); }
      &:focus-visible { outline: 2px solid var(--ui-color-primary); }
    }
  }

  .account-members-item {
    display: flex;
    align-items: center;
    gap: var(--ui-space-12);
    padding: var(--ui-space-10) var(--ui-space-16);
  }

  .account-members-avatar {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    width: var(--ui-size-32);
    height: var(--ui-size-32);
    border-radius: var(--ui-radius-circle);
    background: var(--ui-color-surface-muted);
    color: var(--ui-color-text-muted);
  }

  .account-members-item__name { min-width: 0; }

  .account-members-no-results {
    margin: 0;
    padding: var(--ui-space-16);
    color: var(--ui-color-text-muted);
    text-align: center;
    white-space: normal;
  }
}
</style>
