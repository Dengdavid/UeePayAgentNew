<template>
  <FormPupBox ref="pupRef" :pup="pup">
    <template #default="{ form }">
      <div class="list-b-22">
        <FormItemBox :label="$t('ucenterAccount.field.account')" prop="nickname" isRequired>
          <FormInput size="large" v-model="form.nickname" :placeholder="$t('ucenterAccount.placeholder.account')" />
        </FormItemBox>
        <FormItemBox :label="$t('ucenterAccount.field.email')" prop="email" isRequired>
          <FormEmail size="large" v-model="form.email" :placeholder="$t('ucenterAccount.placeholder.email')" />
        </FormItemBox>
        <FormItemBox :label="$t('ucenterAccount.field.password')" prop="pwd" isRequired>
          <FormInput size="large" v-model="form.pwd" type="password" :placeholder="$t('ucenterAccount.placeholder.password')" autocomplete="new-password" />
        </FormItemBox>
        <FormItemBox :label="$t('ucenterAccount.field.status')" prop="status">
          <FormSwitch v-model="form.status" :trueValue="1" :falseValue="0">
            <template #open>
              <span>{{ $t('ucenterAccount.status.enabled') }}</span>
            </template>
            <template #close>
              <span>{{ $t('ucenterAccount.status.disabled') }}</span>
            </template>
          </FormSwitch>
        </FormItemBox>
        <FormItemBox :label="$t('ucenterAccount.field.expirationDate')" prop="account_expire_time">
          <FormDateBox
            size="large"
            v-model="form.account_expire_time"
            type="date"
            :disableAfterToday="false"
            :placeholder="$t('ucenterAccount.placeholder.permanent')"
            :options="dateOptions"
          />
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
import { formatDate } from '@/libs/tools.js'

const emit = defineEmits(['success'])
const pupRef = ref(null)

const defaultForm = () => ({
  nickname: '',
  email: '',
  pwd: '',
  status: 1,
  account_expire_time: '',
})

const dateOptions = {
  disabledDate(date) {
    return date && date.valueOf() < Date.now() - 86400000
  },
}

const pup = reactive({
  status: false,
  title: t('ucenterAccount.title.create'),
  width: 400,
  labelPosition: 'top',
  form: defaultForm(),
  rules: {
    nickname: [{ required: true, message: t('ucenterAccount.validation.accountRequired'), trigger: 'blur' }],
    email: [
      { required: true, message: t('ucenterAccount.validation.emailRequired'), trigger: 'blur' },
      { type: 'email', message: t('ucenterAccount.validation.emailFormat'), trigger: 'blur' },
    ],
    pwd: [
      { required: true, message: t('ucenterAccount.validation.passwordRequired'), trigger: 'blur' },
      { min: 6, max: 20, message: t('ucenterAccount.validation.passwordLength'), trigger: 'blur' },
    ],
  },
  actions: [
    {
      label: t('button.save'),
      click: async (pup) => {
        try {
          const formData = { ...pup.form }
          if (formData.account_expire_time) {
            formData.account_expire_time = formatDate(formData.account_expire_time)
          }
          await userApi.createAccount(formData)
          message(t('ucenterAccount.message.created'))
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

const open = () => {
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
