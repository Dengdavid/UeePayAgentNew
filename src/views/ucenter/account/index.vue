<template>
  <UiPage ref="pageRef" :data="data" row-key="id"></UiPage>
  <AccountCreateModal ref="createModalRef" @success="reload" />
  <AccountPasswordModal ref="passwordModalRef" />
  <AccountEmailModal ref="emailModalRef" @success="reload" />
  <AccountExpireModal ref="expireModalRef" @success="reload" />
</template>

<script setup>
import { computed, ref } from 'vue'
import { message } from '@/utils/message.js'
import { t } from '@/utils/index.js'
import { userApi } from '@/api'
import AccountCreateModal from './components/AccountCreateModal.vue'
import AccountPasswordModal from './components/AccountPasswordModal.vue'
import AccountEmailModal from './components/AccountEmailModal.vue'
import AccountExpireModal from './components/AccountExpireModal.vue'

const pageRef = ref(null)
const createModalRef = ref(null)
const passwordModalRef = ref(null)
const emailModalRef = ref(null)
const expireModalRef = ref(null)

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
      type: 'primary',
      icon: 'md-add',
      click: () => createModalRef.value?.open(),
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
  ],
  actions: [
    {
      label: (row) => row.status === 1 ? t('ucenterAccount.action.disableAccount') : t('ucenterAccount.action.enableAccount'),
      style: (row) => ({
        color: row.status === 1 ? 'var(--ui-color-error-strong)' : 'var(--ui-color-success)',
      }),
      click: (row) => handleChangeStatus(row),
    },
    {
      label: t('ucenterAccount.action.changePassword'),
      click: (row) => passwordModalRef.value?.open(row),
    },
    {
      label: t('ucenterAccount.action.changeEmail'),
      click: (row) => emailModalRef.value?.open(row),
    },
    {
      label: t('ucenterAccount.action.setExpirationDate'),
      click: (row) => expireModalRef.value?.open(row),
    },
  ],
}))

const reload = () => {
  pageRef.value?.reset?.()
}

const handleChangeStatus = async (row) => {
  const nextStatus = row.status === 1 ? 0 : 1
  try {
    row.loading = true
    await userApi.changeAccountStatus({
      id: row.id,
      status: nextStatus,
    })
    row.status = nextStatus
    message(t('ucenterAccount.message.statusUpdated'))
  } catch (error) {
    message(error?.msg, 'error')
  } finally {
    row.loading = false
  }
}
</script>
