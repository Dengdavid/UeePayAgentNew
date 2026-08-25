<template>
  <FormPupBox :pup="pup">
    <template #default="{ form }">
      <div class="list-b-22">
        <FormItemBox :label="$t('menuManagement.title')" prop="title" isRequired>
          <FormInput v-model="form.title" />
        </FormItemBox>
        <FormItemBox :label="$t('menuManagement.url')" prop="url" isRequired>
          <FormInput v-model="form.url" />
        </FormItemBox>
        <FormItemBox :label="$t('menuManagement.openType')" prop="open_type" isRequired>
          <FormRadio v-model="form.open_type" :options="openTypeOptions" />
        </FormItemBox>
        <FormItemBox :label="$t('menuManagement.icon')" prop="icon">
          <MenuIconSelect v-model="form.icon" />
        </FormItemBox>
        <FormItemBox :label="$t('menuManagement.sort')" prop="sort">
          <FormNumber v-model="form.sort" :min="0" />
        </FormItemBox>
      </div>
    </template>
  </FormPupBox>
</template>

<script setup>
import { computed, reactive } from 'vue'
import MenuIconSelect from './MenuIconSelect.vue'
import { getMenuOpenTypeOptions } from '../data.js'
import { postApi } from '@/utils/api.js'
import { message } from '@/utils/message.js'
import { t } from '@/utils'

const emit = defineEmits(['success'])

const createDefaultForm = () => ({
  title: '',
  url: '',
  open_type: 0,
  icon: '',
  sort: 0,
})

const openTypeOptions = computed(() => getMenuOpenTypeOptions())

const pup = reactive({
  status: false,
  title: t('menuManagement.addTitle'),
  width: 480,
  labelPosition: 'top',
  form: createDefaultForm(),
  actions: [
    {
      label: t('button.save'),
      click: async (currentPup) => {
        const apiUrl = currentPup.form.id
          ? '/user/agentSite/menuUpdate'
          : '/user/agentSite/menuCreate'
        try {
          await postApi(apiUrl, { ...currentPup.form })
          message(t('menuManagement.operationSuccess'))
          close()
          emit('success')
        } catch (error) {
          message(error, 'error')
        } finally {
          currentPup.loading = false
        }
      },
    },
  ],
})

const open = (row) => {
  pup.title = row
    ? t('menuManagement.editTitle')
    : t('menuManagement.addTitle')
  pup.form = row
    ? {
        id: row.id,
        title: row.title || '',
        url: row.url || '',
        open_type: Number(row.open_type) || 0,
        icon: row.icon || '',
        sort: Number(row.sort) || 0,
      }
    : createDefaultForm()
  pup.loading = false
  pup.status = true
}

const close = () => {
  pup.status = false
}

defineExpose({
  open,
  close,
})
</script>
