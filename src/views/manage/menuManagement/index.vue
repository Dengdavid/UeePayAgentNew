<template>
  <UiPage ref="pageRef" :data="data" isNotTitle row-key="id">
    <template #title="{ row }">
      <div class="title">
        <IconBox :icon="row.icon" />
        <span>{{ row.title }}</span>
      </div>
    </template>
    <template #pup>
      <MenuFormModal ref="menuFormRef" @success="refreshList" />
    </template>
  </UiPage>
</template>

<script setup>
import { computed, ref } from 'vue'
import MenuFormModal from './components/MenuFormModal.vue'
import { getMenuOpenTypeOptions, getMenuStatusOptions } from './data.js'
import { postApi } from '@/utils/api.js'
import { confirm, message } from '@/utils/message.js'
import { t } from '@/utils'

const pageRef = ref(null)
const menuFormRef = ref(null)

const refreshList = () => {
  pageRef.value?.reset()
}

const openMenuForm = (row) => {
  menuFormRef.value?.open(row)
}

const isMenuEnabled = row => Number(row.status) === 1

const updateMenuStatus = async (row) => {
  if (row.loading) return
  row.loading = true
  try {
    await postApi('/user/agentSite/menuStatus', {
      id: row.id,
      status: isMenuEnabled(row) ? 0 : 1,
    })
    message(t('menuManagement.operationSuccess'))
    refreshList()
  } catch (error) {
    message(error, 'error')
  } finally {
    row.loading = false
  }
}

const deleteMenu = async (row) => {
  await confirm(t('menuManagement.deleteConfirm'), {
    title: t('button.delete'),
  })
  if (row.loading) return
  row.loading = true
  try {
    await postApi('/user/agentSite/menuDelete', { id: row.id })
    message(t('menuManagement.operationSuccess'))
    refreshList()
  } catch (error) {
    message(error, 'error')
  } finally {
    row.loading = false
  }
}

const data = computed(() => {
  const openTypeOptions = getMenuOpenTypeOptions()
  const openTypeOptionMap = Object.fromEntries(
    openTypeOptions.map(option => [option.value, option])
  )
  const statusOptionMap = Object.fromEntries(
    getMenuStatusOptions().map(option => [option.value, option])
  )

  return {
    apiUrl: '/user/agentSite/allMenus',
    btns: [
      {
        label: t('button.add'),
        type: 'primary',
        icon: 'md-add',
        click: () => openMenuForm(),
      },
    ],
    thead: [
      {
        label: t('menuManagement.title'),
        prop: 'title',
        minWidth: 220,
        wapType: 'title',
        type: 'slot',
      },
      {
        label: t('menuManagement.status'),
        prop: 'status',
        width: 120,
        align: 'center',
        formType: 'dot',
        wapType: 'status',
        options: statusOptionMap,
      },
      {
        label: t('menuManagement.openType'),
        prop: 'open_type',
        width: 160,
        align: 'center',
        options: openTypeOptionMap,
        value: row => openTypeOptionMap[row.open_type]?.label ?? row.open_type ?? '-',
      },
      {
        label: t('menuManagement.url'),
        prop: 'url',
        minWidth: 280,
      },
      {
        label: t('menuManagement.sort'),
        prop: 'sort',
        width: 100,
        align: 'center',
      },
    ],
    actions: [
      {
        label: t('menuManagement.edit'),
        class: 'action-primary',
        click: openMenuForm,
      },
      {
        label: row => isMenuEnabled(row)
          ? t('menuManagement.disable')
          : t('menuManagement.enable'),
        click: updateMenuStatus,
      },
      {
        label: t('button.delete'),
        class: 'action-warning',
        click: deleteMenu,
      },
    ],
  }
})
</script>
<style lang="less" scoped>
.title{
  display: flex;
  align-items: center;
  gap: 8px;
}
</style>
