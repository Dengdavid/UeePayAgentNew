<template>
  <FormPupBox ref="pupRef" :pup="pup">
    <template #default="{ form }">
      <div class="list-b-22">
        <FormItemBox prop="email" isRequired>
          <FormEmail size="large" v-model="form.email" :placeholder="$t('ucenterAccount.placeholder.newEmail')" />
        </FormItemBox>
      </div>
    </template>
  </FormPupBox>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { message } from '@/utils/message.js'
import { t } from '@/utils/index.js'
import { userApi } from '@/api'

const emit = defineEmits(['success'])
const pupRef = ref(null)
const rowData = ref(null)

const defaultForm = () => ({
  email: '',
})

const pup = reactive({
  status: false,
  title: t('ucenterAccount.title.changeEmail'),
  width: 400,
  labelPosition: 'top',
  form: defaultForm(),
  rules: {
    email: [
      { required: true, message: t('ucenterAccount.validation.newEmailRequired'), trigger: 'blur' },
      { type: 'email', message: t('ucenterAccount.validation.emailFormat'), trigger: 'blur' },
    ],
  },
  actions: [
    {
      label: t('button.save'),
      click: async (pup) => {
        try {
          await userApi.changeAccountEmail({
            id: rowData.value.id,
            email: pup.form.email,
          })
          message(t('ucenterAccount.message.updated'))
          pup.status = false
          emit('success')
        } catch (error) {
          message(error?.msg, 'error')
        } finally {
          pup.loading = false
        }
      },
    },
  ],
})

const open = (row) => {
  rowData.value = row
  pup.form = {
    email: row.email || '',
  }
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
