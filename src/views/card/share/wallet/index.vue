<template>
  <div v-if="canAccess" class="wallet-page">
    <UiPage ref="pageRef" :data="data" :return-state="returnState.wallets"  :isBack="!embedded" :fallback="{ name: 'sharedCard' }" isAuto :isNotTitle="embedded" title-size="small" row-key="id">
      <template #counts>
        <UiCounts class="wallet-counts" :data="countsData" isBg :list="countsList" :loading="quotaLoading" @refresh="reload" />
      </template>
      <template #item="{ row }">
        <CardBox class="wallet-card">
          <header class="wallet-header">
            <div class="wallet-icon" aria-hidden="true">
              <Icon custom="iconfont icon-feiyong" />
            </div>
            <div class="wallet-heading">
              <h3 :title="row.name">{{ row.name || '—' }}</h3>
              <p class="wallet-purpose" :title="row.remark">{{ t('card.index.sharedForm.remark') }}：{{ row.remark || '—' }}</p>
            </div>
            <UITag :title="row.status == null ? '—' : data.status.find(status => status.value === Number(row.status))?.label || '—'" :type="row.status == null ? 'default' : ({ 0: 'success', 1: 'error', 2: 'error' })[Number(row.status)] || 'default'" />
          </header>
          <dl class="wallet-highlight">
            <div class="wallet-balance">
              <dt>{{ t('card.index.sharedManagement.walletBalance') }}</dt>
              <dd>
                <strong><UiMoney :value="row.amount || 0" tone="negative" /></strong>
              </dd>
            </div>
            <div class="wallet-recharge">
              <dt>
                {{ t('card.index.sharedManagement.totalRecharge') }}
              </dt>
              <dd><strong><UiMoney :value="row.clear_transfer_amount || 0" /></strong></dd>
            </div>
            <div class="wallet-consumption">
              <dt>{{ t('card.index.sharedManagement.totalConsumption') }}</dt>
              <dd><strong><UiMoney :value="row.clear_deduction_amount || 0" /></strong></dd>
            </div>
          </dl>
          <div v-if="row.updated_at" class="wallet-created">
            <span v-if="row.updated_at">
              <Icon custom="iconfont icon-shijian1" aria-hidden="true" />
              <span>{{ t('card.index.sharedManagement.updatedAt') }}</span>
              <time>{{ String(row.updated_at).slice(0, 10) }}</time>
            </span>
          </div>
          <footer class="wallet-footer">
            <Button v-for="action in getRowActions(row, data.actions.slice(0, 1))" :key="action.key" class="wallet-detail" type="text" :disabled="getActionValue(action, 'disabled', row)" @click.stop="runAction(action, row)">
              {{ getActionValue(action, 'label', row) }}
              <Icon type="md-arrow-forward" aria-hidden="true" />
            </Button>
            <div class="wallet-actions">
              <Tooltip v-for="(action, index) in getRowActions(row, data.actions.slice(1, 2))" :key="index" :disabled="!getActionValue(action, 'tooltip', row)" :content="getActionValue(action, 'tooltip', row)" placement="top" transfer>
                <span class="action-tooltip-trigger" :tabindex="getActionValue(action, 'tooltip', row) ? 0 : undefined" :aria-label="getActionValue(action, 'tooltip', row)">
                  <Button type="primary" ghost :disabled="getActionValue(action, 'disabled', row)" @click.stop="runAction(action, row)">
                    {{ getActionValue(action, 'label', row) }}
                  </Button>
                </span>
              </Tooltip>
              <Dropdown v-if="getRowActions(row, data.actions.slice(2)).length" trigger="click" placement="bottom-end" transfer :capture="true">
                <Button :loading="row.loading">
                  {{ t('button.more') }}
                  <Icon type="ios-arrow-down" aria-hidden="true" />
                </Button>
                <template #list>
                  <DropdownMenu class="ui-table-action-menu">
                    <DropdownItem v-for="(action, index) in getRowActions(row, data.actions.slice(2))" :key="index" :disabled="getActionValue(action, 'disabled', row)" :class="getActionValue(action, 'class', row)" @click.stop="runAction(action, row)">
                      <Tooltip v-if="getActionValue(action, 'tooltip', row)" :content="getActionValue(action, 'tooltip', row)" placement="top" transfer style="display: block">
                        <span tabindex="0" :aria-label="getActionValue(action, 'tooltip', row)">{{ getActionValue(action, 'label', row) }}</span>
                      </Tooltip>
                      <template v-else>{{ getActionValue(action, 'label', row) }}</template>
                    </DropdownItem>
                  </DropdownMenu>
                </template>
              </Dropdown>
            </div>
          </footer>
        </CardBox>
      </template>
    </UiPage>
    <WalletTransferModal ref="transferRef" v-model:busy="fundsBusy" @success="reload" />
    <WalletCollectModal ref="collectRef" v-model:busy="fundsBusy" @success="reload" />
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import Decimal from 'decimal.js'
import { cardApi } from '@/api'
import { t } from '@/utils'
import { hasPermission, hasCardPermission } from '@/utils/permission'
import { confirm, message, showRequestError } from '@/utils/message'
import { toRoute } from '@/utils/route'
import { useUserStore, useUserStoreRefs } from '@/utils/store'
import { escapeHtml } from '@/utils/text'
import WalletTransferModal from './components/WalletTransferModal.vue'
import WalletCollectModal from './components/WalletCollectModal.vue'
import { useReturnState } from '../useReturnState'

const returnState = useReturnState()

defineProps({ embedded: { type: Boolean, default: false } })
const pageRef = ref(null)
const transferRef = ref(null)
const collectRef = ref(null)
const changingStatus = ref(false)
const fundsBusy = ref(false)
const canAccess = computed(() => hasPermission('shared_wallet.view'))
const userStore = useUserStore()
const { user } = useUserStoreRefs()
const walletCount = ref(null)
const quotaLoading = ref(true)
const stats = ref({})
const availableWalletCount = computed(() => {
  const limit = String(user.value?.shared_wallet_limit)
  const count = String(stats.value.wallet_count)
  if (limit === '-1') return '-1'
  if (!/^\d+$/.test(limit) || !/^\d+$/.test(count)) return null
  return Decimal.max(new Decimal(limit).minus(count), 0).toFixed(0)
})
const countsData = computed(() => ({
  ...stats.value,
  available_wallet_count: availableWalletCount.value,
  shared_wallet_limit: user.value?.shared_wallet_limit,
}))
const countsList = computed(() => [
  { label: t('card.index.sharedManagement.walletBalance'), prop: 'available_amount', type: 'money' },
  { label: t('card.index.sharedManagement.totalRecharge'), prop: 'clear_transfer_amount', type: 'money' },
  { label: t('card.index.sharedManagement.totalConsumption'), prop: 'clear_deduction_amount', type: 'money' },
  { label: t('card.index.sharedOverview.accountCount'), prop: 'available_wallet_count', propSub: 'shared_wallet_limit', decimals: 0, tips: t('dashboard.unlimitedTip') },
])
const walletLimitReached = computed(() => {
  const limit = String(user.value?.shared_wallet_limit)
  return !quotaLoading.value && /^\d+$/.test(limit) && walletCount.value != null && new Decimal(walletCount.value).gte(limit)
})
const creationDisabled = computed(() => {
  if (quotaLoading.value) return true
  const limit = String(user.value?.shared_wallet_limit)
  if (limit === '-1') return false
  if (!/^\d+$/.test(limit) || walletCount.value == null) return true
  return new Decimal(walletCount.value).gte(limit)
})
watch(canAccess, allowed => {
  if (!allowed) toRoute('error_403', {}, 'query', { replace: true })
}, { immediate: true })
let alive = true
let quotaController
const refreshCreationQuota = async () => {
  quotaController?.abort()
  const controller = new AbortController()
  quotaController = controller
  quotaLoading.value = true
  walletCount.value = null
  stats.value = {}
  try {
    const [, statistics] = await Promise.all([
      userStore.getUserInfo(),
      cardApi.getSharedWalletStatistics({ signal: controller.signal }),
    ])
    if (!alive || controller.signal.aborted) return
    stats.value = statistics || {}
    const limit = String(user.value?.shared_wallet_limit)
    if (limit === '-1') return
    if (!/^\d+$/.test(limit)) return
    if (new Decimal(limit).isZero()) {
      walletCount.value = '0'
      return
    }
    if (alive && !controller.signal.aborted && /^\d+$/.test(String(statistics?.wallet_count))) walletCount.value = statistics.wallet_count
  } catch (error) { showRequestError(error) } finally {
    if (alive && quotaController === controller) quotaLoading.value = false
  }
}
// 与列表加载同时检查额度，避免列表完成后再次请求并延长按钮等待。
watch([canAccess, () => pageRef.value?.loading], ([allowed, loading], [wasAllowed, wasLoading] = []) => {
  if (allowed && loading && (!wasAllowed || !wasLoading)) void refreshCreationQuota()
}, { immediate: true })
const reload = () => pageRef.value?.reset()
const can = code => hasPermission('shared_wallet.view') && hasPermission(code)


const edit = row => {
  if (fundsBusy.value || !can('shared_wallet.update') || row.status == null || Number(row.status) !== 0 || changingStatus.value) return
  toRoute('cardSharedWalletEdit', { id: String(row.id) }, 'params')
}

const openTransfer = row => {
  if (fundsBusy.value || changingStatus.value || !can('shared_wallet.transfer') || row.status == null || Number(row.status) !== 0) return
  transferRef.value?.open({ id: row.id, name: row.name, amount: row.amount, currency: row.currency, auto_recharge_enabled: row.auto_recharge_enabled, auto_recharge_threshold: row.auto_recharge_threshold })
}
const openCollect = row => {
  if (fundsBusy.value || changingStatus.value || !can('shared_wallet.collect') || row.status == null || Number(row.status) !== 0) return
  collectRef.value?.open({ id: row.id, name: row.name, amount: row.amount, currency: row.currency, auto_recharge_enabled: row.auto_recharge_enabled, auto_recharge_threshold: row.auto_recharge_threshold })
}

const changeStatus = async row => {
  if (fundsBusy.value || !can(Number(row.status) === 0 ? 'shared_wallet.disable' : 'shared_wallet.enable') || changingStatus.value || row.status == null || ![0, 1].includes(Number(row.status))) return
  const status = Number(row.status) === 0 ? 1 : 0
  changingStatus.value = true
  row.loading = true
  try {
    const confirmed = await confirm(escapeHtml(t(`card.index.sharedManagement.${status ? 'disableConfirm' : 'enableConfirm'}`, { name: row.name })), { resolveCancel: true })
    if (!confirmed || !alive || !can(status === 1 ? 'shared_wallet.disable' : 'shared_wallet.enable')) return
    await cardApi.setSharedWalletStatus({ shared_wallet_id: String(row.id), status })
    if (!alive) return
    message(t('card.index.sharedManagement.statusSuccess'))
    reload()
  } catch (error) { showRequestError(error) } finally {
    row.loading = false
    changingStatus.value = false
  }
}

const data = computed(() => ({
  apiUrl: '/vcc/SharedWallet/index',
  method: 'get',
  statusKey: 'status',
  status: [
    { value: null, label: t('card.index.common.all') },
    { value: 0, label: t('card.index.sharedManagement.normal') },
    { value: 1, label: t('card.index.sharedManagement.disabled') },
    { value: 2, label: t('card.index.sharedManagement.locked') },
  ],
  search: { status: null, keyword: '' },
  searchThead: [{ prop: 'keyword', type: 'input', label: t('card.index.sharedManagement.keyword'), width: 280 }],
  btns: [
    { label: t('card.index.sharedOverview.create'), type: 'primary', icon: 'md-add', loading: quotaLoading.value, disabled: !can('shared_wallet.create') || creationDisabled.value, tooltip: !can('shared_wallet.create') ? t('counts.noPermission') : walletLimitReached.value ? t('card.index.sharedForm.walletLimitReached') : '', click: () => can('shared_wallet.create') && !creationDisabled.value && toRoute('cardSharedWalletAdd') },
  ],
  actions: [
    { key: 'detail', label: t('card.index.opening.viewDetails'), permission: 'shared_wallet.view', click: row => canAccess.value && row?.id && toRoute('cardSharedWalletDetail', { id: String(row.id) }, 'params') },
    { label: t('card.index.bills.typeMap.Create'), tooltip: !can('shared_card.create') || !hasCardPermission('create', true) ? t('counts.noPermission') : '', disabled: row => !can('shared_card.create') || !hasCardPermission('create', true) || fundsBusy.value || changingStatus.value || row.status == null || Number(row.status) !== 0, click: row => can('shared_card.create') && hasCardPermission('create', true) && !fundsBusy.value && !changingStatus.value && row?.id && row.status != null && Number(row.status) === 0 && toRoute('sharedCardAdd', { shared_wallet_id: String(row.id) }) },
    { label: t('card.index.sharedManagement.transfer'), class: 'action-primary', tooltip: !can('shared_wallet.transfer') ? t('counts.noPermission') : '', disabled: row => !can('shared_wallet.transfer') || fundsBusy.value || changingStatus.value || row.status == null || Number(row.status) !== 0, click: openTransfer },
    { label: t('card.index.sharedManagement.collect'), class: 'action-warning', tooltip: !can('shared_wallet.collect') ? t('counts.noPermission') : '', disabled: row => !can('shared_wallet.collect') || fundsBusy.value || changingStatus.value || row.status == null || Number(row.status) !== 0, click: openCollect },
    { label: t('ucenterAccount.action.edit'), tooltip: !can('shared_wallet.update') ? t('counts.noPermission') : '', disabled: row => !can('shared_wallet.update') || fundsBusy.value || changingStatus.value || row.status == null || Number(row.status) !== 0, click: edit },
    { label: row => t(`card.index.sharedManagement.${Number(row.status) === 0 ? 'disable' : 'enable'}`), tooltip: row => !can(Number(row.status) === 0 ? 'shared_wallet.disable' : 'shared_wallet.enable') ? t('counts.noPermission') : '', disabled: row => !can(Number(row.status) === 0 ? 'shared_wallet.disable' : 'shared_wallet.enable') || fundsBusy.value || changingStatus.value || row.status == null || ![0, 1].includes(Number(row.status)), click: changeStatus },
  ],
}))

const getActionValue = (action, key, row) => key === 'disabled' && action.key !== 'detail' && Number(row.status) === 2 ? true : typeof action[key] === 'function' ? action[key](row) : action[key]
const getRowActions = (row, actions = data.value.actions) => actions.filter(action => hasPermission(action.permission) && getActionValue(action, 'show', row) !== false && getActionValue(action, 'hidden', row) !== true)
const runAction = (action, row) => {
  if (!getRowActions(row).includes(action) || getActionValue(action, 'disabled', row)) return
  action.click(row)
}

onBeforeUnmount(() => {
  alive = false
  quotaController?.abort()
})
</script>

<style lang="less" scoped>
.action-tooltip-trigger {
  display: inline-flex;

  :deep(button:disabled) { pointer-events: none; }
}

.wallet-counts :deep(.ui-counts-item-value-number > .unit) {
  font-size: 14px;
  color: var(--ui-color-neutral-500);
}

.wallet-page {
  :deep(.ui-page-tbody-list) {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: var(--ui-space-12);

    > .ui-page-tbody-item {
      min-width: 0;
      margin: 0;
      margin-bottom: 0 !important;
    }

    @media (max-width: 767px) {
      grid-template-columns: minmax(0, 1fr);
    }
  }
}

.wallet-page .wallet-card {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: var(--ui-space-20) var(--ui-space-20) var(--ui-space-12);
  border: var(--ui-border-primary-subtle);
  border-radius: var(--ui-card-radius);
  box-shadow: var(--ui-shadow-surface);
  color: var(--ui-color-text);

  h3, p, dl, dd {
    margin: 0;
  }

  .wallet-header {
    display: flex;
    align-items: flex-start;
    gap: var(--ui-space-12);
    margin-bottom: var(--ui-space-16);
  }

  .wallet-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    width: var(--ui-size-40);
    height: var(--ui-size-40);
    border-radius: var(--ui-radius-lg);
    background: var(--ui-color-surface-selected);
    color: var(--ui-color-primary);

    .ivu-icon {
      font-size: var(--ui-size-20);
    }
  }

  .wallet-heading {
    flex: 1;
    min-width: 0;

    h3 {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      font-size: var(--ui-font-size-lg);
      font-weight: var(--ui-font-weight-semibold);
      line-height: var(--ui-line-height-md);
    }
  }

  .wallet-purpose {
    margin-top: var(--ui-space-2);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    color: var(--ui-color-text-subtle);
    font-size: var(--ui-font-size-xs);
    line-height: var(--ui-line-height-md);
  }

  .wallet-highlight {
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(0, 1fr) minmax(0, 0.7fr);
    align-items: center;
    padding: var(--ui-space-12) var(--ui-space-16);
    border-radius: var(--ui-radius-lg);
    background: var(--ui-color-surface-selected);

    > div {
      min-width: 0;
      padding-inline-end: var(--ui-space-12);

      + div {
        padding-inline-start: var(--ui-space-16);
        border-inline-start: var(--ui-border-primary-muted);
      }

      &:last-child {
        padding-inline-end: 0;
      }
    }

    dt {
      color: var(--ui-color-text-subtle);
      font-size: var(--ui-font-size-xs);
      line-height: var(--ui-line-height-md);
      overflow-wrap: anywhere;
    }

    .consumption-tip {
      margin-inline-start: var(--ui-space-4);
      cursor: help;
    }

    dd {
      margin-top: 0;
      font-variant-numeric: tabular-nums;
      overflow-wrap: anywhere;
    }

    :deep(.ui-money) {
      white-space: normal;
      overflow-wrap: anywhere;
    }

    strong {
      display: block;
      font-size: var(--ui-font-size-2xl);
      font-weight: var(--ui-font-weight-semibold);
      line-height: var(--ui-line-height-xl);
    }

    .wallet-balance strong {
      font-size: var(--ui-font-size-3xl);
    }
  }

  .wallet-created {
    display: flex;
    flex-wrap: wrap;
    gap: var(--ui-space-8) var(--ui-space-24);
    padding-block: var(--ui-space-8);
    color: var(--ui-color-text-subtle);
    font-size: var(--ui-font-size-xs);
    line-height: var(--ui-line-height-md);
    font-variant-numeric: tabular-nums;

    > span {
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      gap: var(--ui-space-8);
      min-width: 0;
    }

    time {
      overflow-wrap: anywhere;
    }

    .ivu-icon {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      font-size: var(--ui-font-size-xs);
      line-height: 1;
    }
  }

  .wallet-footer {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: var(--ui-space-8);
    margin-top: auto;
    padding-top: var(--ui-space-12);
    border-top: var(--ui-border-subtle);

    :deep(.ivu-btn) {
      min-height: var(--ui-size-32);
      height: auto;
      white-space: normal;
    }
  }

  .wallet-detail {
    padding-inline: 0;
    color: var(--ui-color-primary);
  }

  .wallet-actions {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: var(--ui-space-8);
    margin-inline-start: auto;
  }

  @media (max-width: 767px) {
    padding: var(--ui-space-12);

    .wallet-header {
      gap: var(--ui-space-8);
    }

    .wallet-highlight {
      padding: var(--ui-space-8);

      > div {
        padding-inline-end: var(--ui-space-8);

        + div {
          padding-inline-start: var(--ui-space-8);
        }
      }

      strong,
      .wallet-balance strong {
        font-size: var(--ui-font-size-lg);
      }
    }

    .wallet-footer :deep(.ivu-btn) {
      min-height: var(--ui-size-44);
    }
  }
}
</style>
