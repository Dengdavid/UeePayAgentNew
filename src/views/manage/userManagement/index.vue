<template>
  <UiPage :data="data" row-key="id" isNotTitle>
    <template #group_title="{ row }">
      {{ row.group?.title || '-' }}
    </template>
  </UiPage>
</template>

<script setup>
import { computed, reactive } from 'vue'
import { t } from '@/utils'

const statusOptions = computed(() => [
  { label: t('userManagement.status.normal'), value: '1', type: 'success' },
  { label: t('userManagement.status.frozen'), value: '0', type: 'error' },
])

const authStatusOptions = computed(() => [
  { label: t('userManagement.auth_status.passed'), value: '1', type: 'success' },
  { label: t('userManagement.auth_status.not_passed'), value: '0', type: 'error' },
])

const authTypeOptions = computed(() => [
  { label: t('userManagement.auth_type.enterprise'), value: '1', type: 'warning' },
  { label: t('userManagement.auth_type.individual'), value: '0', type: 'primary' },
])

const emailStatusOptions = computed(() => [
  { label: t('userManagement.email_status.activated'), value: '1', type: 'success' },
  { label: t('userManagement.email_status.not_activated'), value: '0', type: 'error' },
])

const toOptionMap = (options) => Object.fromEntries(
  options.map(({ value, ...option }) => [value, option])
)

const search = reactive({

})

const data = computed(() => ({
  apiUrl: '/user/AgentSite/users',
  search,
  searchThead: [
    {
      label: t('userManagement.keyword'),
      prop: 'keyword',
      type: 'input',
      width: 220,
    },
    {
      label: t('userManagement.register_time'),
      type: 'daterange',
      startKey: 'startTime',
      endKey: 'endTime',
      width: 230,
    },
    {
      label: t('userManagement.auth_status_label'),
      prop: 'auth_status',
      type: 'select',
      options: authStatusOptions.value,
      width: 160,
    },
    {
      label: t('userManagement.account_status_label'),
      prop: 'status',
      type: 'select',
      options: statusOptions.value,
      width: 160,
    },
  ],
  labelWidth: 100,
  thead: [
    {
      label: t('userManagement.username'),
      prop: 'nickname',
      minWidth: 220,
      wapType: 'title',
    },
    {
      label: t('userManagement.group'),
      prop: 'group_title',
      type: 'slot',
      minWidth: 220,
    },
    {
      label: t('userManagement.money'),
      prop: 'money',
      minWidth: 160,
    },
    {
      label: t('userManagement.email'),
      prop: 'email',
      minWidth: 220,
    },
    {
      label: t('userManagement.register_time'),
      prop: 'created_at',
      width: 180,
      align: 'center',
    },
    {
      label: t('userManagement.register_ip'),
      prop: 'create_ip',
      minWidth: 160,
      align: 'center',
    },
    {
      label: t('userManagement.login_ip'),
      prop: 'login_ip',
      minWidth: 120,
      align: 'center',
    },
    {
      label: t('userManagement.login_count'),
      prop: 'login_count',
      minWidth: 120,
      align: 'center',
    },
    {
      label: t('userManagement.email_status_label'),
      prop: 'email_status',
      width: 200,
      align: 'center',
      formType: 'dot',
      options: toOptionMap(emailStatusOptions.value),
    },
    {
      label: t('userManagement.auth_type_label'),
      prop: 'auth_type',
      width: 160,
      align: 'center',
      formType: 'dot',
      options: toOptionMap(authTypeOptions.value),
    },
    {
      label: t('userManagement.auth_status_label'),
      prop: 'auth_status',
      width: 180,
      align: 'center',
      formType: 'dot',
      options: toOptionMap(authStatusOptions.value),
    },
    {
      label: t('userManagement.account_status_label'),
      prop: 'status',
      width: 160,
      align: 'center',
      formType: 'dot',
      wapType: 'status',
      options: toOptionMap(statusOptions.value),
    },
  ]
}))
</script>
