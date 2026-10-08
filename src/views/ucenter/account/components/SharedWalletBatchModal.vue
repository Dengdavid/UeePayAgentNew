<template>
  <FormPupBox :pup="pup">
    <template #default="{ form }">
      <div class="wallet-batch-content">
        <section class="wallet-batch-targets">
          <div class="wallet-batch-target-header">
            <h3>
              {{ t(props.target === 'account' ? 'ucenterAccount.sharedWalletBatch.selectedAccounts' : 'ucenterAccount.sharedWalletBatch.selectedGroups') }}
              <span>({{ selectedNames.length }})</span>
            </h3>
            <button
              v-if="targetsOverflow || targetsExpanded"
              type="button"
              class="wallet-batch-target-toggle"
              :aria-expanded="targetsExpanded"
              :aria-controls="`wallet-batch-${props.target}-targets`"
              @click="targetsExpanded = !targetsExpanded"
            >
              {{ t(targetsExpanded ? 'ucenterAccount.sharedWalletBatch.collapseTargets' : 'ucenterAccount.sharedWalletBatch.expandTargets') }}
              <Icon type="md-arrow-dropdown" :class="{ 'is-expanded': targetsExpanded }" aria-hidden="true" />
            </button>
          </div>
          <div class="wallet-batch-target-viewport" :class="{ 'is-collapsed': !targetsExpanded }" :tabindex="targetsExpanded ? 0 : -1">
            <ul :id="`wallet-batch-${props.target}-targets`" ref="targetListRef" class="wallet-batch-target-list">
              <li v-for="(name, index) in selectedNames" :key="index" class="wallet-batch-target-name" :aria-hidden="!targetsExpanded && index >= visibleTargetCount ? true : undefined">
                <span class="wallet-batch-target-dot" aria-hidden="true"></span>
                <span class="wallet-batch-target-text" :title="name">{{ name }}</span>
              </li>
            </ul>
          </div>
        </section>
        <Alert v-if="!canLoad || loadError" type="error" show-icon>
          {{ !canLoad ? t('ucenterAccount.sharedWalletBatch.noPermission') : loadError }}
          <Button v-if="action === 'remove' && canLoad" type="text" size="small" :loading="loadingOptions" @click="loadRemovalWallets">
            {{ t('remoteSelect.retry') }}
          </Button>
        </Alert>
        <FormItemBox
          class="wallet-batch-wallets"
          :label="t(action === 'add' ? 'ucenterAccount.sharedWalletBatch.addWallets' : 'ucenterAccount.sharedWalletBatch.removeWallets')"
          prop="shared_wallet_ids"
          isRequired
        >
          <p class="wallet-batch-helper">
            {{ t(action === 'add' ? 'ucenterAccount.sharedWalletBatch.addDescription' : props.target === 'account' ? 'ucenterAccount.sharedWalletBatch.removeAccountDescription' : 'ucenterAccount.sharedWalletBatch.removeDescription', { target: t(props.target === 'account' ? 'ucenterAccount.field.account' : 'ucenterAccount.field.group') }) }}
          </p>
          <FormRemoteSelect
            v-if="pup.status && action === 'add'"
            v-model="form.shared_wallet_ids"
            apiUrl="/vcc/SharedWallet/dataList"
            method="get"
            size="large"
            :page-size="20"
            :params="{ status: 0 }"
            :max-tag-count="3"
            :active="canLoad"
            :disabled="submitting || !canManage"
            :data-processor="processWalletPage"
            :placeholder="t('ucenterAccount.sharedWalletBatch.searchWallets')"
            multiple
            @loading-change="loadingOptions = $event"
            @load-error="loadError = $event ? t('ucenterAccount.sharedWalletBatch.loadFailed') : ''"
          />
          <FormSelectBox
            v-else-if="pup.status"
            v-model="form.shared_wallet_ids"
            :options="removalWalletOptions"
            value-key="id"
            label-key="name"
            option-label-key="name"
            size="large"
            :max-tag-count="3"
            :loading="loadingOptions"
            :loading-text="t('ucenterAccount.sharedWalletBatch.loading')"
            :not-found-text="t(removalWalletOptions.length ? 'remoteSelect.empty' : 'ucenterAccount.sharedWalletBatch.noLinkedWallets')"
            :disabled="submitting || !canLoad || loadingOptions || !!loadError"
            :placeholder="t('ucenterAccount.sharedWalletBatch.searchWallets')"
            multiple
          />
          <div class="wallet-batch-summary" aria-live="polite" aria-atomic="true">
            <I18nT
              :keypath="action === 'add' ? 'ucenterAccount.sharedWalletBatch.addSummary' : 'ucenterAccount.sharedWalletBatch.removeSummary'"
              tag="p"
              scope="global"
            >
              <template #targetCount><span class="text-msg">{{ selectedNames.length }}</span></template>
              <template #target>{{ t(props.target === 'account' ? 'ucenterAccount.field.account' : 'ucenterAccount.field.group') }}</template>
              <template #walletCount><span class="text-msg">{{ form.shared_wallet_ids.length }}</span></template>
            </I18nT>
          </div>
        </FormItemBox>
      </div>
    </template>
  </FormPupBox>
</template>

<script setup>
import { computed, onBeforeUnmount, reactive, ref, watch } from 'vue'
import { Translation as I18nT } from 'vue-i18n'
import { userApi } from '@/api'
import FormRemoteSelect from '@/components/form/FormRemoteSelect/index.vue'
import { t } from '@/utils'
import { hasPermission } from '@/utils/permission.js'
import { confirm, message, showRequestError } from '@/utils/message.js'

const props = defineProps({ target: { type: String, required: true, validator: (value) => ['account', 'group'].includes(value) } })
const emit = defineEmits(['success'])
const selectedNames = ref([])
const targetsExpanded = ref(false)
const targetsOverflow = ref(false)
const visibleTargetCount = ref(0)
const targetListRef = ref(null)
const removalWalletOptions = ref([])
const loadingOptions = ref(false)
const submitting = ref(false)
const loadError = ref('')
const action = ref('add')
const canManage = computed(() => hasPermission(`team.${props.target}.shared_wallet.${action.value}`))
const canLoad = computed(() => canManage.value && hasPermission('shared_wallet.view'))
let targetIds = []
let session = 0
let removalWalletSources = []
let targetResizeObserver = null

const updateTargetOverflow = () => {
  const list = targetListRef.value
  if (!list?.clientWidth || targetsExpanded.value) return
  list.parentElement.scrollTop = 0
  const items = [...list.children]
  visibleTargetCount.value = items.filter((item) => item.offsetTop === items[0]?.offsetTop).length
  targetsOverflow.value = items.length > visibleTargetCount.value || items.some((item) => {
    const name = item.querySelector('.wallet-batch-target-text')
    return name.scrollWidth > name.clientWidth
  })
}

watch(targetListRef, (list) => {
  targetResizeObserver?.disconnect()
  if (!list) return
  targetResizeObserver = new ResizeObserver(updateTargetOverflow)
  targetResizeObserver.observe(list)
  updateTargetOverflow()
}, { flush: 'post' })
watch([selectedNames, targetsExpanded], updateTargetOverflow, { flush: 'post' })

const pup = reactive({
  status: false,
  title: computed(() => t(action.value === 'add' ? 'ucenterAccount.sharedWalletBatch.add' : 'ucenterAccount.sharedWalletBatch.remove')),
  width: 620,
  labelPosition: 'top',
  form: { shared_wallet_ids: [] },
  actions: [{
    label: computed(() => t(action.value === 'add' ? 'ucenterAccount.sharedWalletBatch.submitAdd' : 'ucenterAccount.sharedWalletBatch.submitRemove')),
    disabled: () => submitting.value || loadingOptions.value || !!loadError.value || !canLoad.value || !pup.form.shared_wallet_ids.length,
    click: submit,
  }],
})

const toWalletOption = (wallet) => {
  if ((typeof wallet?.id !== 'string' && !Number.isSafeInteger(wallet?.id)) || !wallet.id) throw new Error('Invalid wallet ID')
  const id = String(wallet.id)
  return { id, name: wallet.name || id }
}

const processWalletPage = (response) => {
  if (!Array.isArray(response?.data)) throw new Error('Invalid wallet list')
  const lastPage = Number(response.last_page)
  const currentPage = Number(response.current_page)
  if (!Number.isInteger(lastPage) || lastPage < 0 || !Number.isInteger(currentPage) || currentPage < 1) throw new Error('Invalid wallet pagination')
  return {
    list: response.data.map(toWalletOption),
    hasMore: typeof response.has_more === 'boolean' ? response.has_more : currentPage < lastPage,
  }
}

function loadRemovalWallets() {
  if (!pup.status || action.value !== 'remove' || !canLoad.value) return
  loadError.value = ''
  removalWalletOptions.value = []
  try {
    const wallets = new Map()
    for (const source of removalWalletSources) {
      if (!Array.isArray(source)) throw new Error('Missing linked wallet data')
      for (const wallet of source) {
        const option = toWalletOption(wallet)
        wallets.set(option.id, option)
      }
    }
    removalWalletOptions.value = [...wallets.values()]
  } catch (error) {
    loadError.value = t('ucenterAccount.sharedWalletBatch.loadFailed')
  }
}

async function submit(modal) {
  if (submitting.value) return
  const currentSession = session
  if (!canLoad.value || loadingOptions.value || loadError.value || !targetIds.length || !modal.form.shared_wallet_ids.length) {
    modal.loading = false
    return
  }
  const walletIds = [...new Set(modal.form.shared_wallet_ids)]
  if (walletIds.some((id) => typeof id !== 'string' || !id || (action.value === 'remove' && !removalWalletOptions.value.some((wallet) => wallet.id === id)))) {
    modal.loading = false
    return
  }
  const ids = [...targetIds]
  const currentAction = action.value
  submitting.value = true
  try {
    const confirmed = await confirm(t(currentAction === 'add' ? 'ucenterAccount.sharedWalletBatch.confirmAdd' : 'ucenterAccount.sharedWalletBatch.confirmRemove', {
      count: `<strong style="color: var(--ui-color-primary)">${ids.length}</strong>`,
      walletCount: `<strong style="color: var(--ui-color-primary)">${walletIds.length}</strong>`,
    }), { resolveCancel: true })
    if (!confirmed || currentSession !== session || !pup.status || !canLoad.value) return
    const isAccount = props.target === 'account'
    const api = isAccount
      ? (currentAction === 'add' ? userApi.batchAddAccountSharedWallets : userApi.batchRemoveAccountSharedWallets)
      : (currentAction === 'add' ? userApi.batchAddTeamGroupSharedWallets : userApi.batchRemoveTeamGroupSharedWallets)
    await api({ [isAccount ? 'account_ids' : 'group_ids']: ids, shared_wallet_ids: walletIds })
    message(t('ucenterAccount.sharedWalletBatch.success'))
    if (currentSession === session) close()
    emit('success')
  } catch (error) {
    showRequestError(error)
  } finally {
    submitting.value = false
    if (currentSession === session) modal.loading = false
  }
}

const open = ({ rows, action: nextAction }) => {
  if (submitting.value || !rows?.length || !['add', 'remove'].includes(nextAction) || !hasPermission(`team.${props.target}.shared_wallet.${nextAction}`)) return
  session += 1
  loadingOptions.value = false
  removalWalletOptions.value = []
  removalWalletSources = nextAction === 'remove' ? rows.map((row) => props.target === 'group' ? row.shared_wallets : row.direct_shared_wallets) : []
  targetIds = [...new Set(rows.map((row) => row.id))]
  selectedNames.value = rows.map((row) => row.nickname || row.name || `#${row.id}`)
  targetsExpanded.value = false
  targetsOverflow.value = false
  action.value = nextAction
  pup.form = { shared_wallet_ids: [] }
  pup.loading = false
  pup.status = true
  loadError.value = ''
  if (nextAction === 'remove') loadRemovalWallets()
}

const close = () => { pup.status = false }
watch(() => pup.status, (visible) => {
  if (!visible) {
    session += 1
    removalWalletOptions.value = []
    removalWalletSources = []
    loadingOptions.value = false
  }
}, { flush: 'sync' })
watch(canLoad, (allowed) => {
  if (allowed) loadRemovalWallets()
})
onBeforeUnmount(() => {
  session += 1
  targetResizeObserver?.disconnect()
})
defineExpose({ open, close })
</script>

<style scoped lang="less">
.wallet-batch-content {
  display: flex;
  flex-direction: column;
  gap: var(--ui-space-24);
  min-width: 0;
}

.wallet-batch-targets {
  padding: var(--ui-space-16);
  border-radius: var(--ui-radius-lg);
  background: color-mix(in srgb, var(--ui-color-surface-subtle) 60%, var(--ui-color-surface-muted));
}

.wallet-batch-target-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: var(--ui-space-4) var(--ui-space-12);
  min-height: var(--ui-size-24);
  margin-bottom: var(--ui-space-8);
  color: var(--ui-color-text-subtle);
  font-size: var(--ui-font-size-xs);
  line-height: var(--ui-line-height-md);

  h3 {
    margin: 0;
    font-size: inherit;
    font-weight: var(--ui-font-weight-semibold);
  }
}

.wallet-batch-target-toggle {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--ui-space-4);
  min-height: var(--ui-size-24);
  padding: 0;
  border: 0;
  border-radius: var(--ui-radius-sm);
  background: transparent;
  color: var(--ui-color-primary);
  font: inherit;
  white-space: nowrap;
  cursor: pointer;
  transition: color var(--ui-motion-control) var(--ui-ease-standard);

  &:hover,
  &:active {
    color: color-mix(in srgb, var(--ui-color-primary) 82%, var(--ui-color-text));
  }

  &:focus-visible {
    outline: var(--ui-border-primary-accent);
    outline-offset: var(--ui-space-2);
  }

  :deep(.ivu-icon) {
    font-size: var(--ui-font-size-lg);
    transition: transform var(--ui-motion-control) var(--ui-ease-standard);

    &.is-expanded {
      transform: rotate(180deg);
    }
  }
}

.wallet-batch-target-viewport {
  max-height: 144px;
  overflow-y: auto;
  overscroll-behavior: contain;

  &.is-collapsed {
    max-height: var(--ui-size-26);
    overflow: hidden;
  }

  &:focus-visible {
    outline: var(--ui-border-primary-accent);
    outline-offset: var(--ui-space-2);
  }
}

.wallet-batch-target-list {
  display: flex;
  flex-wrap: wrap;
  gap: var(--ui-space-8);
  margin: 0;
  padding: 0;
  list-style: none;
}

.wallet-batch-target-name {
  display: inline-flex;
  align-items: baseline;
  gap: var(--ui-space-6);
  max-width: 100%;
  padding: var(--ui-space-2) var(--ui-space-10);
  border: var(--ui-border-primary-soft);
  border-radius: var(--ui-radius-6);
  background: var(--ui-color-surface);
  color: var(--ui-color-text);
  font-size: inherit;
  line-height: var(--ui-line-height-md);
}

.wallet-batch-target-dot {
  flex-shrink: 0;
  align-self: flex-start;
  width: var(--ui-size-6);
  height: var(--ui-size-6);
  margin-top: calc((var(--ui-line-height-md) - var(--ui-size-6)) / 2);
  border-radius: var(--ui-radius-circle);
  background: var(--ui-color-success);
}

.wallet-batch-target-text {
  min-width: 0;
  overflow-wrap: anywhere;
}

.is-collapsed .wallet-batch-target-text {
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.wallet-batch-helper {
  margin: 0 0 var(--ui-space-12);
  color: var(--ui-color-text-subtle);
  font-size: var(--ui-font-size-xs);
  line-height: var(--ui-line-height-md);
}

.wallet-batch-wallets {
  margin-bottom: 0;

  :deep(.ivu-form-item-label) {
    display: flex;
    align-items: baseline;
    width: 100%;
    padding-bottom: var(--ui-space-4);
  }

  :deep(.formTitle) {
    display: flex;
    flex: 1;
    flex-wrap: wrap;
    align-items: baseline;
    gap: var(--ui-space-4) var(--ui-space-12);
    min-width: 0;
    line-height: var(--ui-line-height-md);
  }

  :deep(.formTitle .title) {
    font-size: var(--ui-font-size-md);
    font-weight: var(--ui-font-weight-semibold);
  }
}

.wallet-batch-summary {
  color: var(--ui-color-text-subtle);
  line-height: var(--ui-line-height-md);

  p {
    margin: var(--ui-space-12) 0 0;
  }

  .text-msg {
    font-weight: var(--ui-font-weight-semibold);
    font-variant-numeric: tabular-nums;
  }
}

.wallet-batch-content > :deep(.ivu-alert) {
  margin-bottom: 0;
}

@media screen and (max-width: 768px) {
  .wallet-batch-targets {
    padding: var(--ui-space-12);
  }

  .wallet-batch-target-toggle {
    min-height: var(--ui-size-44);
    margin-block: calc(var(--ui-space-10) * -1);
  }
}

</style>
