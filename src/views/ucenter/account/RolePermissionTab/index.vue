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
  </UiPage>
</template>

<script setup>
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
  apiUrl: '/user/TeamRole/index',
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
      label: t('ucenterAccount.field.role'),
      prop: 'keyword',
      type: 'input',
      clearable: true,
      width: 200,
    },
  ],
  btns: [
    {
      label: t('button.add'),
      permission: 'team.role.create',
      type: 'primary',
      icon: 'md-add',
      click: () => openRole(),
    },
  ],
  dataProcessor: (rows) => {
    if (Array.isArray(rows)) return rows
    if (Array.isArray(rows?.list)) return rows.list
    return []
  },
  thead: [
    {
      label: t('ucenterAccount.field.roleName'),
      prop: 'name',
      width: 180,
      wapType: 'title',
    },
    {
      label: t('ucenterAccount.field.roleDescription'),
      prop: 'description',
      width:220,
      value: (row) => row.description || '-',
    },
    {
      label: t('ucenterAccount.field.relatedMembers'),
      prop: 'accounts',
      type: 'slot',
      width: 160,
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
      show: (row) => Number(row.is_system) !== 1 && hasPermission(Number(row.status) === 1 ? 'team.role.disable' : 'team.role.enable'),
      style: (row) => ({
        color: Number(row.status) === 1 ? 'var(--ui-color-error-strong)' : 'var(--ui-color-success)',
      }),
      disabled: (row) => row.loading,
      click: (row) => handleChangeStatus(row),
    },
    {
      label: (row) => t(Number(row.is_system) === 1 || !hasPermission('team.role.update') ? 'ucenterAccount.action.view' : 'ucenterAccount.action.edit'),
      click: (row) => openRole(row),
    },
  ],
}))

const openRole = async (row) => {
  await toRoute('ucenterAccount', { ...route.query, type: 'role' }, 'query', { replace: true })
  return row
    ? toRoute('ucenterAccountRoleEdit', { id: row.id }, 'params')
    : toRoute('ucenterAccountRoleCreate')
}

const reload = () => {
  pageRef.value?.reset?.()
}

const handleChangeStatus = async (row) => {
  if (Number(row.is_system) === 1 || !hasPermission(Number(row.status) === 1 ? 'team.role.disable' : 'team.role.enable')) return
  if (row.loading) return
  const isEnabled = Number(row.status) === 1
  try {
    row.loading = true
    const confirmed = await confirm(
      escapeHtml(t(isEnabled ? 'ucenterAccount.confirm.disableRole' : 'ucenterAccount.confirm.enableRole', { name: row.name || `#${row.id}` })),
      { resolveCancel: true },
    )
    if (!confirmed || !hasPermission(isEnabled ? 'team.role.disable' : 'team.role.enable') || Number(row.is_system) === 1) return
    await (isEnabled ? userApi.disableTeamRole : userApi.enableTeamRole)({ role_id: row.id })
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
