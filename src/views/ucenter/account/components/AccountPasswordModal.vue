<template>
  <FormPupBox ref="pupRef" :pup="pup">
    <template #default="{ form }">
      <div class="list-b-22">
        <FormItemBox prop="pwd" isRequired>
          <FormInput size="large" v-model="form.pwd" type="password" :placeholder="$t('ucenterAccount.placeholder.newPassword')" autocomplete="new-password" />
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

const pupRef = ref(null)
const rowData = ref(null)

const defaultForm = () => ({
  pwd: '',
})

const pup = reactive({
  status: false,
  title: t('ucenterAccount.title.changePassword'),
  width: 400,
  labelPosition: 'top',
  form: defaultForm(),
  rules: {
    pwd: [
      { required: true, message: t('ucenterAccount.validation.newPasswordRequired'), trigger: 'blur' },
      { min: 6, max: 20, message: t('ucenterAccount.validation.passwordLength'), trigger: 'blur' },
    ],
  },
  actions: [
    {
      label: t('button.save'),
      click: async (pup) => {
        try {
          await userApi.resetAccountPassword({
            id: rowData.value.id,
            pwd: pup.form.pwd,
          })
          message(t('ucenterAccount.message.updated'))
          pup.status = false
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
  pup.form = defaultForm()
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
