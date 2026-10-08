<template>
  <UiPage ref="pageRef" :data="data" row-key="id" isNotTitle>
    <template #groups="{ row }">
      <UIArrMembers :data="row.groups" name-key="name" :title="t('ucenterAccount.field.group')" />
    </template>
    <template #roles="{ row }">
      <UIArrMembers :data="row.roles" name-key="name" :title="t('ucenterAccount.field.role')" />
    </template>
    <template #direct_shared_wallets="{ row }">
      <UIArrMembers :data="row.direct_shared_wallets" name-key="name" :title="t('ucenterAccount.sharedWalletBatch.wallets')" />
    </template>
  </UiPage>
  <SharedWalletBatchModal ref="sharedWalletBatchModalRef" target="account" @success="reload" />
</template>

<script setup>
import SharedWalletBatchModal from '../components/SharedWalletBatchModal.vue'
import { hasPermission } from '@/utils/permission.js'
import { computed, ref } from 'vue'
import { confirm, message, showRequestError } from '@/utils/message.js'
import { escapeHtml } from '@/utils/text.js'
import { t } from '@/utils/index.js'
import { toRoute, useRoute } from '@/utils/route.js'
import { userApi } from '@/api'
import router from '@/router/index.js'
import UIArrMembers from '@/components/uiForm/UIArrMembers/index.vue'

const route = useRoute()
const pageRef = ref(null)
const sharedWalletBatchModalRef = ref(null)
const batchLoading = ref(false)
const getActivationUrl = () => new URL(
  router.resolve({ name: 'accountActivation' }).href,
  window.location.origin,
).href

const statusOptions = computed(() => ({
  1: {
    label: t('ucenterAccount.status.enabled'),
    type: 'success',
  },
  0: {
    label: t('ucenterAccount.status.disabled'),
    type: 'error',
  },
  2: {
    label: t('ucenterAccount.status.pendingActivation'),
    type: 'warning',
  },
  3: {
    label: t('ucenterAccount.status.activating'),
    type: 'primary',
  },
}))

const statusActionOptions = computed(() => ({
  0: {
    label: t('ucenterAccount.action.enable'),
    permission: 'team.account.enable',
    color: 'var(--ui-color-success)',
  },
  1: {
    label: t('ucenterAccount.action.disable'),
    permission: 'team.account.disable',
    color: 'var(--ui-color-error-strong)',
  },
  2: {
    label: t('ucenterAccount.action.sendActivation'),
    permission: 'team.account.activation.send',
    color: 'var(--primary-color)',
  },
  3: {
    label: t('ucenterAccount.action.resendActivation'),
    permission: 'team.account.activation.send',
    color: 'var(--primary-color)',
  },
}))

const getStatusAction = (row) => statusActionOptions.value[Number(row.status)]

const data = computed(() => ({
  apiUrl: '/user/account/index',
  search: {
    keyword: '',
    status: '',
  },
  searchThead: [
    {
      label: t('ucenterAccount.field.status'),
      prop: 'status',
      type: 'select',
      clearable: true,
      width: 120,
      options: statusOptions.value,
    },
    {
      label: t('ucenterAccount.search.emailOrAccount'),
      prop: 'keyword',
      type: 'input',
      clearable: true,
      width: 200,
    },
  ],
  btns: [
    {
      label: t('button.add'),
      disabled: !hasPermission('team.account.create'),
      tooltip: !hasPermission('team.account.create') ? t('counts.noPermission') : '',
      type: 'primary',
      icon: 'md-add',
      click: () => hasPermission('team.account.create') && openAccount('ucenterAccountCreate'),
    },
  ],
  batchBtns: [
    {
      label: t('ucenterAccount.sharedWalletBatch.add'),
      disabled: !hasPermission('team.account.shared_wallet.add'),
      tooltip: !hasPermission('team.account.shared_wallet.add') ? t('counts.noPermission') : '',
      isNotConfirm: true,
      click: (rows) => hasPermission('team.account.shared_wallet.add') && sharedWalletBatchModalRef.value?.open({ rows, action: 'add' }),
    },
    {
      label: t('ucenterAccount.sharedWalletBatch.remove'),
      disabled: !hasPermission('team.account.shared_wallet.remove'),
      tooltip: !hasPermission('team.account.shared_wallet.remove') ? t('counts.noPermission') : '',
      isNotConfirm: true,
      click: (rows) => hasPermission('team.account.shared_wallet.remove') && sharedWalletBatchModalRef.value?.open({ rows, action: 'remove' }),
    },
    {
      label: t('ucenterAccount.action.batchDisableAccount'),
      disabled: !hasPermission('team.account.disable'),
      tooltip: !hasPermission('team.account.disable') ? t('counts.noPermission') : '',
      type: 'error',
      isNotConfirm: true,
      click: (rows) => handleBatchChangeStatus(rows, false),
    },
    {
      label: t('ucenterAccount.action.batchEnableAccount'),
      disabled: !hasPermission('team.account.enable'),
      tooltip: !hasPermission('team.account.enable') ? t('counts.noPermission') : '',
      type: 'primary',
      isNotConfirm: true,
      click: (rows) => handleBatchChangeStatus(rows, true),
    },
    {
      label: t('ucenterAccount.action.batchActivateAccount'),
      disabled: !hasPermission('team.account.activation.send'),
      tooltip: !hasPermission('team.account.activation.send') ? t('counts.noPermission') : '',
      type: 'primary',
      isNotConfirm: true,
      click: (rows) => handleBatchActivation(rows),
    },
  ],
  thead: [
    {
      label: t('ucenterAccount.field.account'),
      prop: 'nickname',
      minWidth: 135,
      wapType: 'title',
    },
    {
      label: t('ucenterAccount.field.email'),
      prop: 'email',
      minWidth: 220,
    },
    {
      label: t('ucenterAccount.field.status'),
      prop: 'status',
      width: 100,
      formType: 'dot',
      wapType: 'status',
      options: statusOptions.value,
    },
    {
      label: t('ucenterAccount.field.group'),
      prop: 'groups',
      type: 'slot',
      width: 160,
      autoWidth: false,
    },
    {
      label: t('ucenterAccount.field.role'),
      prop: 'roles',
      type: 'slot',
      width: 160,
      autoWidth: false,
    },
    {
      label: t('ucenterAccount.sharedWalletBatch.wallets'),
      prop: 'direct_shared_wallets',
      type: 'slot',
      width: 200,
      autoWidth: false,
    },
    {
      label: t('ucenterAccount.field.lastLoginAt'),
      prop: 'login_at',
      width: 176,
      autoWidth: false,
      value: (row) => row.login_at || '-',
    },
    {
      label: t('ucenterAccount.field.lastLoginIp'),
      prop: 'login_ip',
      width: 160,
      autoWidth: false,
      value: (row) => row.login_ip || '-',
    },
    {
      label: t('ucenterAccount.field.expirationDate'),
      prop: 'account_expire_time',
      width: 170,
      value: (row) => row.account_expire_time || t('ucenterAccount.permanent'),
    },
    {
      label: t('ucenterAccount.table.createdAt'),
      prop: 'created_at',
      width: 170,
    },
    {
      label: t('ucenterAccount.field.remark'),
      prop: 'account_remark',
      width: 200,
      autoWidth: false,
      value: (row) => row.account_remark || '-',
    },
  ],
  actions: [
    {
      label: (row) => getStatusAction(row)?.label,
      show: (row) => Boolean(getStatusAction(row)),
      tooltip: (row) => !hasPermission(getStatusAction(row)?.permission) ? t('counts.noPermission') : '',
      style: (row) => !row.loading && hasPermission(getStatusAction(row)?.permission) ? { color: getStatusAction(row)?.color } : {},
      disabled: (row) => Boolean(row.loading) || !hasPermission(getStatusAction(row)?.permission),
      click: (row) => handleStatusAction(row),
    },
    {
      label: t('ucenterAccount.action.edit'),
      tooltip: () => !hasPermission('team.account.update') ? t('counts.noPermission') : '',
      disabled: (row) => Boolean(row.loading) || !hasPermission('team.account.update'),
      click: (row) => hasPermission('team.account.update') && openAccount('ucenterAccountEdit', row),
    },
    {
      label: t('ucenterAccount.security.title'),
      tooltip: () => !hasPermission('team.account.security.view') ? t('counts.noPermission') : '',
      disabled: (row) => Boolean(row.loading) || !hasPermission('team.account.security.view'),
      click: (row) => hasPermission('team.account.security.view') && openAccount('ucenterAccountSecurity', row),
    },
  ],
}))

const openAccount = async (name, row) => {
  await toRoute('ucenterAccount', { ...route.query, type: 'account' }, 'query', { replace: true })
  return row ? toRoute(name, { id: row.id }, 'params') : toRoute(name)
}

const reload = () => {
  pageRef.value?.clearSelection?.()
  pageRef.value?.reset?.()
}

const showActivationResult = (data, requestedCount, isBatch = false) => {
  const queuedCount = Number(data?.queued_count)
  const failedCount = Number(data?.failed_count)
  const result = data?.result

  if (result === 'success' && queuedCount === requestedCount) {
    message(isBatch
      ? t('ucenterAccount.message.batchActivationQueued', { count: queuedCount })
      : t('ucenterAccount.message.activationQueued'))
  } else if (result === 'partial_success' && queuedCount > 0) {
    message(t('ucenterAccount.message.batchActivationPartial', {
      queuedCount,
      failedCount,
    }), 'warning')
  } else {
    message(data?.failed?.[0]?.message || t('ucenterAccount.message.activationFailed'), 'error')
  }

  return ['success', 'partial_success', 'failed'].includes(result)
}

const handleBatchChangeStatus = async (rows, enabled) => {
  if (!hasPermission(enabled ? 'team.account.enable' : 'team.account.disable')) return
  if (batchLoading.value || !rows.length) return
  const sourceStatus = enabled ? 0 : 1
  if (!rows.every((row) => Number(row.status) === sourceStatus)) {
    const messageKey = enabled
      ? 'ucenterAccount.message.batchEnableStatusMismatch'
      : 'ucenterAccount.message.batchDisableStatusMismatch'
    message(t(messageKey), 'warning')
    return
  }
  const confirmKey = enabled
    ? 'ucenterAccount.confirm.batchEnableAccount'
    : 'ucenterAccount.confirm.batchDisableAccount'

  batchLoading.value = true
  try {
    const confirmed = await confirm(
      `${escapeHtml(t(confirmKey, { count: rows.length }))}<br><br>${escapeHtml(t('ucenterAccount.field.account'))}:<br>${rows.map(row => escapeHtml(row.nickname || `#${row.id}`)).join('<br>')}`,
      { resolveCancel: true },
    )
    if (!confirmed || !hasPermission(enabled ? 'team.account.enable' : 'team.account.disable')) return
    await (enabled ? userApi.batchEnableAccount : userApi.batchDisableAccount)({
      account_ids: rows.map((row) => row.id),
    })
    message(t('ucenterAccount.message.statusUpdated'))
    reload()
  } catch (error) {
    showRequestError(error)
  } finally {
    batchLoading.value = false
  }
}

const handleBatchActivation = async (rows) => {
  if (!hasPermission('team.account.activation.send')) return
  if (batchLoading.value || !rows.length) return
  if (!rows.every((row) => [2, 3].includes(Number(row.status)))) {
    message(t('ucenterAccount.message.batchActivationStatusMismatch'), 'warning')
    return
  }

  batchLoading.value = true
  try {
    const confirmed = await confirm(
      t('ucenterAccount.confirm.batchActivateAccount', { count: rows.length }),
      { resolveCancel: true },
    )
    if (!confirmed || !hasPermission('team.account.activation.send')) return
    const data = await userApi.sendAccountActivation({
      account_ids: rows.map((row) => Number(row.id)),
      activation_url: getActivationUrl(),
    })
    if (showActivationResult(data, rows.length, true)) reload()
  } catch (error) {
    showRequestError(error)
  } finally {
    batchLoading.value = false
  }
}

const handleChangeStatus = async (row) => {
  if (![0, 1].includes(Number(row.status)) || !hasPermission(getStatusAction(row).permission)) return
  if (row.loading) return
  const nextStatus = Number(row.status) === 1 ? 0 : 1
  const confirmKey = nextStatus === 1
    ? 'ucenterAccount.confirm.enableAccount'
    : 'ucenterAccount.confirm.disableAccount'

  row.loading = true
  try {
    const confirmed = await confirm(
      escapeHtml(t(confirmKey, { name: row.nickname || `#${row.id}` })),
      { resolveCancel: true },
    )
    if (!confirmed || !hasPermission(nextStatus === 1 ? 'team.account.enable' : 'team.account.disable')) return
    await (nextStatus === 1 ? userApi.enableAccount : userApi.disableAccount)({
      account_id: row.id,
    })
    row.status = nextStatus
    message(t('ucenterAccount.message.statusUpdated'))
  } catch (error) {
    showRequestError(error)
  } finally {
    row.loading = false
  }
}

const handleStatusAction = (row) => {
  const status = Number(row.status)
  if ([0, 1].includes(status)) return handleChangeStatus(row)
  if ([2, 3].includes(status)) return handleSendActivation(row)
}

const handleSendActivation = async (row) => {
  if (!hasPermission('team.account.activation.send')) return
  if (row.loading) return
  const isResend = Number(row.status) === 3
  const confirmKey = isResend
    ? 'ucenterAccount.confirm.resendActivation'
    : 'ucenterAccount.confirm.sendActivation'

  row.loading = true
  try {
    const confirmed = await confirm(t(confirmKey), { resolveCancel: true })
    if (!confirmed || !hasPermission('team.account.activation.send')) return
    const data = await userApi.sendAccountActivation({
      account_ids: [Number(row.id)],
      activation_url: getActivationUrl(),
    })
    if (showActivationResult(data, 1)) reload()
  } catch (error) {
    showRequestError(error)
  } finally {
    row.loading = false
  }
}
</script>
