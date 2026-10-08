<template>
  <UiPage :tabs="tabs" forbidden-redirect></UiPage>
</template>

<script setup>
import { computed } from 'vue'
import { t } from '@/utils/index.js'
import AccountManagementTab from './AccountManagementTab/index.vue'
import GroupManagementTab from './GroupManagementTab/index.vue'
import RolePermissionTab from './RolePermissionTab/index.vue'

const tabs = computed(() => [
  {
    title: t('ucenterAccount.tabs.accountManagement'),
    name: 'account',
    permission: 'team.account.view',
    component: AccountManagementTab,
    passActive: false,
    forwardInit: false,
  },
  {
    title: t('ucenterAccount.tabs.groupManagement'),
    name: 'group',
    permission: 'team.group.view',
    component: GroupManagementTab,
    passActive: false,
    forwardInit: false,
  },
  {
    title: t('ucenterAccount.tabs.rolePermissions'),
    name: 'role',
    permission: 'team.role.view',
    component: RolePermissionTab,
    passActive: false,
    forwardInit: false,
  },
])

</script>
