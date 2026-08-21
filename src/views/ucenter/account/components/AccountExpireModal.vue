<template>
  <FormPupBox ref="pupRef" :pup="pup">
    <template #default="{ form }">
      <div class="list-b-22">
        <FormItemBox  prop="account_expire_time">
          <FormDateBox
            size="large"
            v-model="form.account_expire_time"
            type="date"
            :disableAfterToday="false"
            :placeholder="$t('ucenterAccount.placeholder.permanent')"
            :options="dateOptions"
            @on-change="form.account_expire_time = $event || ''"
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
const rowData = ref(null)

const defaultForm = () => ({
  account_expire_time: '',
})

const dateOptions = {
  disabledDate(date) {
    return date && date.valueOf() < Date.now() - 86400000
  },
}

const pup = reactive({
  status: false,
  title: t('ucenterAccount.title.changeExpirationDate'),
  width: 400,
  labelPosition: 'top',
  form: defaultForm(),
  rules: {},
  actions: [
    {
      label: t('button.save'),
      click: async (pup) => {
        try {
          await userApi.changeAccountExpireTime({
            id: rowData.value.id,
            account_expire_time: pup.form.account_expire_time,
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
    account_expire_time: row.account_expire_time ? new Date(row.account_expire_time) : '',
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
