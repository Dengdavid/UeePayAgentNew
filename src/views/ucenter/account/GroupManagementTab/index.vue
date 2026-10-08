<template>
  <UiPage ref="pageRef" :data="data" row-key="id" isNotTitle>
    <template #accounts="{ row }">
      <UIArrMembers
        :data="row.accounts"
        name-key="nickname"
        :title="t('ucenterAccount.field.relatedMembers')"
        :count-formatter="count => t('ucenterAccount.memberPicker.memberCount', { count })"
      >
        <template #item-icon><Icon type="md-person" :size="18" /></template>
      </UIArrMembers>
    </template>
    <template #shared_wallets="{ row }">
      <UIArrMembers :data="row.shared_wallets" name-key="name" :title="t('ucenterAccount.sharedWalletBatch.wallets')" />
    </template>
  </UiPage>
  <SharedWalletBatchModal ref="sharedWalletBatchModalRef" target="group" @success="reload" />
</template>

<script setup>
import SharedWalletBatchModal from '../components/SharedWalletBatchModal.vue'
import { hasPermission } from '@/utils/permission.js'
import { computed, ref } from 'vue'
import { userApi } from '@/api'
import { t } from '@/utils/index.js'
import { confirm, message, showRequestError } from '@/utils/message.js'
import { escapeHtml } from '@/utils/text.js'
import { toRoute, useRoute } from '@/utils/route.js'
import UIArrMembers from '@/components/uiForm/UIArrMembers/index.vue'

const route = useRoute()
const pageRef = ref(null)
const sharedWalletBatchModalRef = ref(null)
const batchLoading = ref(false)

const statusOptions = computed(() => ({
  1: {
    label: t('ucenterAccount.status.enabled'),
    type: 'success',
  },
  0: {
    label: t('ucenterAccount.status.disabled'),
    type: 'error',
  },
}))

const data = computed(() => ({
  apiUrl: '/user/TeamGroup/index',
  method: 'get',
  notPage: true,
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
      label: t('ucenterAccount.groupForm.name'),
      prop: 'keyword',
      type: 'input',
      clearable: true,
      width: 200,
    },
  ],
  btns: [
    {
      label: t('button.add'),
      permission: 'team.group.create',
      type: 'primary',
      icon: 'md-add',
      click: () => openGroup(),
    },
  ],
  batchBtns: [
    {
      label: t('ucenterAccount.sharedWalletBatch.add'),
      permission: 'team.group.shared_wallet.add',
      isNotConfirm: true,
      click: (rows) => sharedWalletBatchModalRef.value?.open({ rows, action: 'add' }),
    },
    {
      label: t('ucenterAccount.sharedWalletBatch.remove'),
      permission: 'team.group.shared_wallet.remove',
      isNotConfirm: true,
      click: (rows) => sharedWalletBatchModalRef.value?.open({ rows, action: 'remove' }),
    },
    {
      label: t('ucenterAccount.action.disable'),
      permission: 'team.group.disable',
      type: 'error',
      click: (rows) => handleBatchChangeStatus(rows, false),
    },
    {
      label: t('ucenterAccount.action.enable'),
      permission: 'team.group.enable',
      type: 'primary',
      click: (rows) => handleBatchChangeStatus(rows, true),
    },
  ],
  dataProcessor: (rows) => {
    if (Array.isArray(rows)) return rows
    if (Array.isArray(rows?.list)) return rows.list
    return []
  },
  thead: [
    {
      label: t('ucenterAccount.groupForm.name'),
      prop: 'name',
      width: 180,
      wapType: 'title',
    },
    {
      label: t('ucenterAccount.groupForm.description'),
      prop: 'description',
      width: 220,
    },
    {
      label: t('ucenterAccount.field.relatedMembers'),
      prop: 'accounts',
      type: 'slot',
      width: 160,
      autoWidth: false,
    },
    {
      label: t('ucenterAccount.sharedWalletBatch.wallets'),
      prop: 'shared_wallets',
      type: 'slot',
      width: 200,
      autoWidth: false,
    },
    {
      label: t('ucenterAccount.field.createdDate'),
      prop: 'created_at',
      width: 170,
    },
    {
      label: t('ucenterAccount.field.status'),
      prop: 'status',
      width: 100,
      formType: 'dot',
      wapType: 'status',
      options: statusOptions.value,
    },
  ],
  actions: [
    {
      label: (row) => Number(row.status) === 1 ? t('ucenterAccount.action.disable') : t('ucenterAccount.action.enable'),
      show: (row) => hasPermission(Number(row.status) === 1 ? 'team.group.disable' : 'team.group.enable'),
      style: (row) => ({
        color: Number(row.status) === 1
          ? 'var(--ui-color-error-strong)'
          : 'var(--ui-color-success)',
      }),
      disabled: (row) => row.loading,
      click: (row) => handleChangeStatus(row),
    },
    {
      label: t('ucenterAccount.action.edit'),
      show: (row) => Number(row.is_system) !== 1 && hasPermission('team.group.update'),
      click: (row) => openGroup(row),
    },
  ],
}))

const openGroup = async (row) => {
  if (!hasPermission('team.group.view') || !hasPermission(row ? 'team.group.update' : 'team.group.create') || Number(row?.is_system) === 1) return
  await toRoute('ucenterAccount', { ...route.query, type: 'group' }, 'query', { replace: true })
  return row ? toRoute('ucenterAccountGroupEdit', { id: row.id }, 'params') : toRoute('ucenterAccountGroupCreate')
}

const reload = () => {
  pageRef.value?.clearSelection?.()
  pageRef.value?.reset?.()
}

const handleBatchChangeStatus = async (rows, enabled) => {
  if (!hasPermission(enabled ? 'team.group.enable' : 'team.group.disable')) return
  if (batchLoading.value || !rows.length) return
  try {
    batchLoading.value = true
    const confirmed = await confirm(
      `${escapeHtml(t(enabled ? 'ucenterAccount.confirm.batchEnableGroup' : 'ucenterAccount.confirm.batchDisableGroup', { count: rows.length }))}<br><br>${escapeHtml(t('ucenterAccount.groupForm.name'))}:<br>${rows.map(row => escapeHtml(row.name || `#${row.id}`)).join('<br>')}`,
      { resolveCancel: true },
    )
    if (!confirmed || !hasPermission(enabled ? 'team.group.enable' : 'team.group.disable')) return
    await (enabled ? userApi.batchEnableTeamGroup : userApi.batchDisableTeamGroup)({
      group_ids: rows.map((row) => row.id),
    })
    message(enabled ? t('uiCommon.batchEnabled') : t('uiCommon.batchDisabled'))
    reload()
  } catch (error) {
    showRequestError(error)
  } finally {
    batchLoading.value = false
  }
}

const handleChangeStatus = async (row) => {
  if (!hasPermission(Number(row.status) === 1 ? 'team.group.disable' : 'team.group.enable')) return
  if (row.loading) return
  const isEnabled = Number(row.status) === 1
  try {
    row.loading = true
    const confirmed = await confirm(
      escapeHtml(t(isEnabled ? 'ucenterAccount.confirm.disableGroup' : 'ucenterAccount.confirm.enableGroup', { name: row.name || `#${row.id}` })),
      { resolveCancel: true },
    )
    if (!confirmed || !hasPermission(isEnabled ? 'team.group.disable' : 'team.group.enable')) return
    await (isEnabled ? userApi.disableTeamGroup : userApi.enableTeamGroup)({
      group_id: row.id,
    })
    row.status = isEnabled ? 0 : 1
    message(t(isEnabled ? 'message.disableSuccess' : 'message.enableSuccess', { name: row.name }))
    reload()
  } catch (error) {
    showRequestError(error)
  } finally {
    row.loading = false
  }
}
</script>
