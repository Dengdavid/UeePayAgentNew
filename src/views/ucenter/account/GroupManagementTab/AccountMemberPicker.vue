<script setup>
import { computed, onBeforeUnmount, ref, useId, watch } from 'vue'
import { userApi } from '@/api'
import { t } from '@/utils'
import { accountListParams, normalizeAccountIds } from './data.js'

const props = defineProps({
  modelValue: {
    type: Array,
    default: () => [],
  },
  active: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['update:modelValue', 'loading-change'])
const searchInputId = useId()
const accountOptions = ref([])
const searchKeyword = ref('')
const activeMobilePanel = ref('all')
const loading = ref(false)
const loadError = ref('')
let loadController = null

const selectedIds = computed({
  get: () => normalizeAccountIds(props.modelValue),
  set: (value) => emit('update:modelValue', normalizeAccountIds(value)),
})
const selectedIdSet = computed(() => new Set(selectedIds.value))
const accountById = computed(() => new Map(
  accountOptions.value.map((account) => [account.id, account]),
))
const availableAccounts = computed(() => accountOptions.value.filter((account) => Number(account.status) !== 0))
const filteredAccounts = computed(() => {
  const keyword = searchKeyword.value.trim().toLowerCase()
  if (!keyword) return availableAccounts.value
  return availableAccounts.value.filter((account) => {
    return [account.nickname, account.email, account.id]
      .some((value) => String(value ?? '').toLowerCase().includes(keyword))
  })
})
const selectedAccounts = computed(() => selectedIds.value.map((accountId) => {
  return accountById.value.get(accountId) || {
    id: accountId,
    nickname: `#${accountId}`,
  }
}))
const visibleSelectionState = computed(() => {
  const visibleIds = filteredAccounts.value.map((account) => account.id)
  const selectedCount = visibleIds.filter((accountId) => selectedIdSet.value.has(accountId)).length
  return {
    checked: visibleIds.length > 0 && selectedCount === visibleIds.length,
    indeterminate: selectedCount > 0 && selectedCount < visibleIds.length,
  }
})

const accountName = (account) => account?.nickname || account?.email || `#${account?.id}`
const accountEmail = (account) => account?.nickname && account?.email ? account.email : ''
const accountInitial = (account) => Array.from(accountName(account).trim())[0]?.toUpperCase() || '#'

const toggleAccount = (accountId, checked) => {
  const nextIds = new Set(selectedIds.value)
  if (checked) nextIds.add(Number(accountId))
  else nextIds.delete(Number(accountId))
  selectedIds.value = [...nextIds]
}

const toggleVisibleAccounts = (checked) => {
  const nextIds = new Set(selectedIds.value)
  for (const account of filteredAccounts.value) {
    if (checked) nextIds.add(account.id)
    else nextIds.delete(account.id)
  }
  selectedIds.value = [...nextIds]
}

const invertVisibleAccounts = () => {
  const nextIds = new Set(selectedIds.value)
  for (const account of filteredAccounts.value) {
    if (nextIds.has(account.id)) nextIds.delete(account.id)
    else nextIds.add(account.id)
  }
  selectedIds.value = [...nextIds]
}

const clearSelection = () => {
  selectedIds.value = []
}

const normalizeAccountOptions = (response) => {
  const rows = Array.isArray(response)
    ? response
    : Array.isArray(response?.data)
      ? response.data
      : Array.isArray(response?.list)
        ? response.list
        : []
  const accountMap = new Map()
  for (const row of rows) {
    const accountId = Number(row?.id)
    if (!Number.isInteger(accountId) || accountId <= 0 || accountMap.has(accountId)) continue
    accountMap.set(accountId, { ...row, id: accountId })
  }
  return [...accountMap.values()]
}

const isCanceledError = (error) => {
  return error?.code === 'ERR_CANCELED' || error?.name === 'CanceledError'
}

const cancelLoad = () => {
  loadController?.abort()
  loadController = null
}

const loadOptions = async () => {
  cancelLoad()
  const controller = new AbortController()
  loadController = controller
  loading.value = true
  emit('loading-change', true)
  loadError.value = ''
  try {
    const response = await userApi.getAccountList(accountListParams, {
      signal: controller.signal,
    })
    if (loadController !== controller || controller.signal.aborted) return
    accountOptions.value = normalizeAccountOptions(response)
  } catch (error) {
    if (!isCanceledError(error) && loadController === controller) {
      loadError.value = t('ucenterAccount.memberPicker.loadFailed')
    }
  } finally {
    if (loadController === controller) {
      loadController = null
      loading.value = false
      emit('loading-change', false)
    }
  }
}

watch(() => props.active, (active) => {
  searchKeyword.value = ''
  activeMobilePanel.value = 'all'
  if (active) loadOptions()
  else {
    cancelLoad()
    loading.value = false
    emit('loading-change', false)
  }
}, { immediate: true })

onBeforeUnmount(cancelLoad)
</script>

<template>
  <section class="account-member-picker" :aria-busy="loading">
    <div class="account-member-picker__mobile-tabs">
      <button
        type="button"
        :aria-pressed="activeMobilePanel === 'all'"
        :class="{ 'is-active': activeMobilePanel === 'all' }"
        @click="activeMobilePanel = 'all'"
      >
        <span
          class="account-member-picker__mobile-label"
          :title="t('ucenterAccount.memberPicker.allMembers')"
        >
          {{ t('ucenterAccount.memberPicker.allMembers') }}
        </span>
        <span class="account-member-picker__mobile-count">{{ availableAccounts.length }}</span>
      </button>
      <button
        type="button"
        :aria-pressed="activeMobilePanel === 'selected'"
        :class="{ 'is-active': activeMobilePanel === 'selected' }"
        @click="activeMobilePanel = 'selected'"
      >
        <span
          class="account-member-picker__mobile-label"
          :title="t('ucenterAccount.memberPicker.selectedMembers')"
        >
          {{ t('ucenterAccount.memberPicker.selectedMembers') }}
        </span>
        <span class="account-member-picker__mobile-count">{{ selectedIds.length }}</span>
      </button>
    </div>

    <div class="account-member-picker__columns">
      <section
        class="account-member-picker__panel account-member-picker__panel--all"
        :class="{ 'is-mobile-active': activeMobilePanel === 'all' }"
      >
        <header class="account-member-picker__panel-header">
          <div class="account-member-picker__panel-title">
            <h4 :title="t('ucenterAccount.memberPicker.allMembers')">
              {{ t('ucenterAccount.memberPicker.allMembers') }}
            </h4>
            <span class="account-member-picker__count">
              {{ t('ucenterAccount.memberPicker.memberCount', { count: availableAccounts.length }) }}
            </span>
          </div>
        </header>

        <div class="account-member-picker__search">
          <label class="account-member-picker__sr-only" :for="searchInputId">
            {{ t('ucenterAccount.memberPicker.searchPlaceholder') }}
          </label>
          <FormInput
            v-model="searchKeyword"
            prefix="ios-search"
            :element-id="searchInputId"
            :change-delay="0"
            :disabled="loading || Boolean(loadError)"
            :placeholder="t('ucenterAccount.memberPicker.searchPlaceholder')"
            autocomplete="one-time-code"
          />
        </div>

        <div v-if="loading" class="account-member-picker__state" aria-live="polite">
          <Spin />
          <span class="account-member-picker__sr-only">{{ t('message.loading') }}</span>
        </div>
        <div v-else-if="loadError" class="account-member-picker__state" role="alert">
          <span class="account-member-picker__state-icon is-error" aria-hidden="true">
            <Icon type="ios-alert-outline" />
          </span>
          <strong class="account-member-picker__state-title">{{ loadError }}</strong>
          <Button type="text" size="small" @click="loadOptions">
            {{ t('button.refresh') }}
          </Button>
        </div>
        <template v-else>
          <div v-if="filteredAccounts.length" class="account-member-picker__select-all">
            <Checkbox
              :model-value="visibleSelectionState.checked"
              :indeterminate="visibleSelectionState.indeterminate"
              @on-change="toggleVisibleAccounts"
            >
              {{ t(visibleSelectionState.checked
                ? 'ucenterAccount.memberPicker.deselectAllInList'
                : 'ucenterAccount.memberPicker.selectAllInList') }}
            </Checkbox>
            <Button type="text" size="small" @click="invertVisibleAccounts">
              {{ t('ucenterAccount.memberPicker.invertSelection') }}
            </Button>
          </div>
          <div v-if="filteredAccounts.length" class="account-member-picker__list">
            <Checkbox
              v-for="account in filteredAccounts"
              :key="account.id"
              class="account-member-picker__option"
              :class="{ 'is-selected': selectedIdSet.has(account.id) }"
              :model-value="selectedIdSet.has(account.id)"
              @on-change="toggleAccount(account.id, $event)"
            >
              <span
                class="account-member-picker__avatar"
                :class="{ 'is-selected': selectedIdSet.has(account.id) }"
                aria-hidden="true"
              >
                {{ accountInitial(account) }}
              </span>
              <span class="account-member-picker__info">
                <span class="account-member-picker__name" :title="accountName(account)">
                  {{ accountName(account) }}
                </span>
                <span
                  v-if="accountEmail(account)"
                  class="account-member-picker__email"
                  :title="accountEmail(account)"
                >
                  {{ accountEmail(account) }}
                </span>
              </span>
            </Checkbox>
          </div>
          <div
            v-else
            class="account-member-picker__state"
            role="status"
            aria-live="polite"
          >
            <span class="account-member-picker__state-icon" aria-hidden="true">
              <Icon :type="searchKeyword ? 'ios-search' : 'ios-people-outline'" />
            </span>
            <strong class="account-member-picker__state-title">
              {{ t(searchKeyword
                ? 'ucenterAccount.memberPicker.noResults'
                : 'ucenterAccount.memberPicker.noMembers') }}
            </strong>
            <span class="account-member-picker__state-description">
              {{ t(searchKeyword
                ? 'ucenterAccount.memberPicker.noResultsDescription'
                : 'ucenterAccount.memberPicker.noMembersDescription') }}
            </span>
          </div>
        </template>
      </section>

      <section
        class="account-member-picker__panel account-member-picker__panel--selected"
        :class="{ 'is-mobile-active': activeMobilePanel === 'selected' }"
      >
        <header class="account-member-picker__panel-header">
          <div class="account-member-picker__panel-title">
            <h4 :title="t('ucenterAccount.memberPicker.selectedMembers')">
              {{ t('ucenterAccount.memberPicker.selectedMembers') }}
            </h4>
            <span class="account-member-picker__count account-member-picker__count--selected" aria-live="polite">
              {{ t('ucenterAccount.memberPicker.memberCount', { count: selectedIds?.length || 0 }) }}
            </span>
          </div>
          <Button
            v-if="selectedIds.length"
            type="text"
            size="small"
            @click="clearSelection"
          >
            {{ t('ucenterAccount.memberPicker.clearSelection') }}
          </Button>
        </header>

        <div
          v-if="selectedAccounts.length"
          class="account-member-picker__list account-member-picker__list--selected"
        >
          <div
            v-for="account in selectedAccounts"
            :key="account.id"
            class="account-member-picker__selected-item"
          >
            <span class="account-member-picker__avatar is-selected" aria-hidden="true">
              {{ accountInitial(account) }}
            </span>
            <span class="account-member-picker__info">
              <span class="account-member-picker__name" :title="accountName(account)">
                {{ accountName(account) }}
              </span>
              <span
                v-if="accountEmail(account)"
                class="account-member-picker__email"
                :title="accountEmail(account)"
              >
                {{ accountEmail(account) }}
              </span>
            </span>
            <button
              type="button"
              class="account-member-picker__remove"
              :aria-label="t('ucenterAccount.memberPicker.removeFromSelection', { name: accountName(account) })"
              @click="toggleAccount(account.id, false)"
            >
              <Icon type="ios-close" :size="20" aria-hidden="true" />
            </button>
          </div>
        </div>
        <div v-else class="account-member-picker__state">
          <span class="account-member-picker__state-icon" aria-hidden="true">
            <Icon type="md-person-add" />
          </span>
          <strong class="account-member-picker__state-title">
            {{ t('ucenterAccount.memberPicker.noSelection') }}
          </strong>
          <span class="account-member-picker__state-description">
            {{ t('ucenterAccount.memberPicker.noSelectionDescription') }}
          </span>
        </div>
      </section>
    </div>
  </section>
</template>

<style scoped lang="less">
.account-member-picker {
  min-width: 0;
  overflow: hidden;
  border: var(--ui-border-subtle);
  border-radius: var(--ui-radius-6);
  background: var(--ui-color-surface);
}

.account-member-picker__columns {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  height: clamp(var(--ui-size-280), 36vh,440px);
}

.account-member-picker__panel {
  display: flex;
  min-width: 0;
  min-height: 0;
  flex-direction: column;
  background: var(--ui-color-surface);
}

.account-member-picker__panel--selected {
  border-inline-start: var(--ui-border-subtle);
  background: var(--ui-color-surface);
}

.account-member-picker__panel-header,
.account-member-picker__panel-title {
  display: flex;
  align-items: center;
}

.account-member-picker__panel-header {
  min-height: var(--ui-size-44);
  justify-content: space-between;
  gap: var(--ui-space-8);
  padding: 0 var(--ui-space-16);
  border-bottom: var(--ui-border-subtle);
  background: var(--ui-color-surface);
}

.account-member-picker__panel--all .account-member-picker__panel-header {
  display: none;
}

.account-member-picker__panel--selected .account-member-picker__panel-header {
  height: var(--ui-size-44);
  flex-shrink: 0;
  padding: 0 var(--ui-space-12);
  border-bottom: var(--ui-border-subtle);
  background: var(--ui-color-surface-muted);
}

:deep(.account-member-picker__panel--selected .account-member-picker__panel-header .ivu-btn-text) {
  padding-inline: 0;
  border-color: transparent;
  color: var(--ui-color-primary);
  background: transparent;
}

:deep(.account-member-picker__panel--selected .account-member-picker__panel-header .ivu-btn-text:hover) {
  border-color: transparent;
  color: var(--ui-color-primary);
  background: transparent;
}

.account-member-picker__panel-title {
  min-width: 0;
  flex: 1;
  gap: var(--ui-space-8);
}

.account-member-picker__panel-header h4 {
  min-width: 0;
  flex: 0 1 auto;
  margin: 0;
  overflow: hidden;
  color: var(--ui-color-text);
  font-size: var(--ui-font-size-md);
  font-weight: var(--ui-font-weight-semibold);
  line-height: var(--ui-line-height-md);
  text-overflow: ellipsis;
  white-space: nowrap;
}

.account-member-picker__count,
.account-member-picker__mobile-count {
  flex-shrink: 0;
  color: var(--ui-color-text-secondary);
  font-size: var(--ui-font-size-xs);
  line-height: var(--ui-line-height-md);
}

.account-member-picker__mobile-label {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.account-member-picker__count--selected {
  color: var(--ui-color-text);
}

.account-member-picker__search {
  display: flex;
  align-items: center;
  height: var(--ui-size-44);
  flex-shrink: 0;
  padding: 0 var(--ui-space-6);
  border-bottom: var(--ui-border-subtle);
  background: var(--ui-color-surface-muted);
}

.account-member-picker__select-all {
  display: flex;
  align-items: center;
  min-height: var(--ui-size-40);
  gap: var(--ui-space-8);
  padding: 0 var(--ui-space-12);
  border-bottom: var(--ui-border-subtle);
  background: var(--ui-color-surface);
}

:deep(.account-member-picker__select-all .ivu-checkbox-wrapper) {
  display: flex;
  align-items: center;
  min-width: 0;
  flex: 1;
  margin: 0;
}

:deep(.account-member-picker__select-all .ivu-btn-text) {
  min-width: var(--ui-size-32);
  height: var(--ui-size-32);
  flex-shrink: 0;
  padding-inline: 0;
  border-color: transparent;
  color: var(--ui-color-primary);
  background: transparent;
}

:deep(.account-member-picker__select-all .ivu-btn-text:hover) {
  border-color: transparent;
  color: var(--ui-color-primary);
  background: transparent;
}

.account-member-picker__list {
  display: flex;
  min-height: 0;
  flex: 1;
  flex-direction: column;
  gap: 0;
  padding: var(--ui-space-2) var(--ui-space-4) var(--ui-space-6);
  overflow-y: auto;
  overscroll-behavior: contain;
  background: var(--ui-color-surface);
}

.account-member-picker__list--selected {
  gap: 0;
  padding: var(--ui-space-2) 0 var(--ui-space-6);
  background: var(--ui-color-surface);
}

:deep(.account-member-picker__option.ivu-checkbox-wrapper) {
  display: flex;
  align-items: center;
  box-sizing: border-box;
  width: 100%;
  min-height: var(--ui-size-48);
  margin: 0;
  padding: var(--ui-space-4) var(--ui-space-8);
  border: var(--ui-border-transparent);
  border-radius: var(--ui-radius-6);
  transition: background-color var(--ui-motion-control) var(--ui-ease-standard);
}

:deep(.account-member-picker__option.ivu-checkbox-wrapper:hover) {
  background: var(--ui-color-surface-hover);
}

:deep(.account-member-picker__option.ivu-checkbox-wrapper.is-selected) {
  border: var(--ui-border-transparent);
  background: transparent;
}

:deep(.account-member-picker__option.ivu-checkbox-wrapper.is-selected:hover) {
  background: var(--ui-color-surface-hover);
}

:deep(.account-member-picker__option .ivu-checkbox-label-text) {
  display: flex;
  align-items: center;
  min-width: 0;
  flex: 1;
  gap: var(--ui-space-6);
  padding-inline-start: var(--ui-space-6);
}

.account-member-picker__avatar {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  width: var(--ui-size-32);
  height: var(--ui-size-32);
  flex: 0 0 var(--ui-size-32);
  border: var(--ui-border-primary-subtle);
  border-radius: var(--ui-radius-circle);
  color: var(--ui-color-primary);
  background: var(--ui-color-surface-navigation);
  font-size: var(--ui-font-size-xs);
  font-weight: var(--ui-font-weight-semibold);
  transition:
    border-color var(--ui-motion-control) var(--ui-ease-standard),
    background-color var(--ui-motion-control) var(--ui-ease-standard);
}

.account-member-picker__avatar.is-selected {
  border-color: var(--ui-color-border-primary-muted);
  background: var(--ui-color-surface-selected-strong);
}

.account-member-picker__info {
  display: flex;
  min-width: 0;
  flex: 1;
  flex-direction: column;
}

.account-member-picker__name,
.account-member-picker__email {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.account-member-picker__name {
  color: var(--ui-color-text);
  font-size: var(--ui-font-size-md);
  font-weight: var(--ui-font-weight-semibold);
  line-height: var(--ui-line-height-md);
}

.account-member-picker__email {
  color: var(--ui-color-text-secondary);
  font-size: var(--ui-font-size-xs);
  line-height: var(--ui-size-18);
}

.account-member-picker__selected-item {
  display: flex;
  align-items: center;
  box-sizing: border-box;
  min-height: var(--ui-size-48);
  gap: var(--ui-space-8);
  padding-block: var(--ui-space-4);
  padding-inline: var(--ui-space-12) var(--ui-space-6);
  border: 0;
  border-radius: 0;
  background: var(--ui-color-surface);
  transition: background-color var(--ui-motion-control) var(--ui-ease-standard);
}

.account-member-picker__selected-item:hover {
  background: var(--ui-color-surface-hover);
}

.account-member-picker__selected-item .account-member-picker__avatar {
  border: var(--ui-border-subtle);
  color: var(--ui-color-text-muted);
  background: var(--ui-color-surface-neutral);
}

.account-member-picker__remove {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: var(--ui-size-40);
  height: var(--ui-size-40);
  flex: 0 0 var(--ui-size-40);
  padding: 0;
  border: 0;
  border-radius: var(--ui-radius-circle);
  color: var(--ui-color-text-muted);
  background: transparent;
  cursor: pointer;
  transition: color var(--ui-motion-control) var(--ui-ease-standard),
    background-color var(--ui-motion-control) var(--ui-ease-standard);
}

.account-member-picker__remove:hover {
  color: var(--ui-color-primary);
  background: var(--ui-color-surface-navigation);
}

.account-member-picker__remove:focus-visible,
.account-member-picker__mobile-tabs button:focus-visible {
  outline: none;
  box-shadow: var(--ui-shadow-focus-brand);
}

.account-member-picker__state {
  display: flex;
  min-height: 0;
  flex: 1;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  gap: var(--ui-space-8);
  padding: var(--ui-space-12);
  color: var(--ui-color-text-secondary);
  text-align: center;
}

.account-member-picker__state-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: var(--ui-size-48);
  height: var(--ui-size-48);
  border: var(--ui-border-subtle);
  border-radius: var(--ui-radius-circle);
  color: var(--ui-color-primary);
  background: var(--ui-color-surface-muted);
  font-size: var(--ui-font-size-2xl);
}

.account-member-picker__state-icon.is-error {
  border: var(--ui-border-error-subtle);
  color: var(--ui-color-error-strong);
  background: var(--ui-color-surface-danger-soft);
}

.account-member-picker__state-title {
  color: var(--ui-color-text);
  font-size: 13px;
  font-weight: var(--ui-font-weight-semibold);
  line-height: var(--ui-line-height-md);
}

.account-member-picker__state-description {
  max-width: var(--ui-size-260);
  color: var(--ui-color-text-secondary);
  font-size: var(--ui-font-size-xs);
  line-height: var(--ui-line-height-md);
}

.account-member-picker__mobile-tabs {
  display: none;
}

.account-member-picker__sr-only {
  position: absolute;
  width: var(--ui-size-1);
  height: var(--ui-size-1);
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  clip-path: inset(50%);
  white-space: nowrap;
}

@media screen and (max-width: 768px) {
  .account-member-picker__mobile-tabs {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 0;
    padding: 0;
    border-bottom: var(--ui-border-subtle);
    background: var(--ui-color-surface);
  }

  .account-member-picker__mobile-tabs button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 0;
    min-height: var(--ui-size-44);
    gap: var(--ui-space-6);
    padding: 0 var(--ui-space-8);
    border: 0;
    border-bottom: var(--ui-border-primary-accent);
    border-bottom-color: transparent;
    border-radius: 0;
    color: var(--ui-color-text-subtle);
    background: transparent;
    font: inherit;
    cursor: pointer;
  }

  .account-member-picker__mobile-tabs button.is-active {
    border-bottom-color: var(--ui-color-primary);
    color: var(--ui-color-primary);
    background: var(--ui-color-surface);
  }

  .account-member-picker__columns {
    display: block;
    height: clamp(var(--ui-size-280), 48vh, var(--ui-size-320));
  }

  .account-member-picker__search {
    padding: 0 var(--ui-space-8);
  }

  .account-member-picker__select-all {
    min-height: var(--ui-size-48);
    padding: 0 var(--ui-space-10);
  }

  :deep(.account-member-picker__select-all .ivu-checkbox-wrapper) {
    min-height: var(--ui-size-44);
  }

  :deep(.account-member-picker__select-all .ivu-btn-text) {
    min-width: var(--ui-size-44);
    height: var(--ui-size-44);
  }

  .account-member-picker__list {
    padding: var(--ui-space-2) var(--ui-space-2) var(--ui-space-6);
  }

  .account-member-picker__list--selected {
    padding: var(--ui-space-2) 0 var(--ui-space-6);
  }

  :deep(.account-member-picker__option.ivu-checkbox-wrapper) {
    min-height: var(--ui-size-48);
    padding: var(--ui-space-4) var(--ui-space-6);
  }

  :deep(.account-member-picker__option .ivu-checkbox-label-text) {
    gap: var(--ui-space-6);
    padding-inline-start: var(--ui-space-6);
  }

  .account-member-picker__panel {
    display: none;
    height: 100%;
  }

  .account-member-picker__panel.is-mobile-active {
    display: flex;
  }

  .account-member-picker__panel--selected {
    border-inline-start: 0;
  }

  .account-member-picker__panel--selected .account-member-picker__panel-header {
    padding: 0 var(--ui-space-10);
  }

  .account-member-picker__panel--selected .account-member-picker__panel-header h4 {
    display: none;
  }

  .account-member-picker__remove {
    width: var(--ui-size-44);
    height: var(--ui-size-44);
    flex-basis: var(--ui-size-44);
  }

  .account-member-picker__selected-item {
    min-height: var(--ui-size-48);
    gap: var(--ui-space-6);
    padding-block: var(--ui-space-2);
    padding-inline: var(--ui-space-8) var(--ui-space-4);
  }

  .account-member-picker__state {
    padding: var(--ui-space-8);
  }

  .account-member-picker__panel-header :deep(.ivu-btn),
  .account-member-picker__state :deep(.ivu-btn) {
    min-width: var(--ui-size-44);
    min-height: var(--ui-size-44);
  }

  .account-member-picker__name,
  .account-member-picker__email {
    overflow: visible;
    text-overflow: clip;
    white-space: normal;
    overflow-wrap: anywhere;
  }
}
</style>
