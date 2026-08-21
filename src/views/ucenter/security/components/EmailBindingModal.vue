<template>
  <FormPupBox ref="pupRef" :pup="pup">
    <template #default="{form}">
      <div class="list-b-22 ">
        <div class="emailBox">
          <p>{{ $t('security.email.unbound') }}</p>
        </div>
        <FormItemBox :label="$t('security.email.newAddress')" prop="email" isRequired :rules="[
          {
            validator: async (rule, value, callback) => {
              const reg = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
              if (reg.test(value)) {
                callback()
              } else {
                callback(new Error($t('security.email.invalid')))
              }
            }
          }
        ]">
          <FormEmail size="large" v-model="form.email" :placeholder="$t('security.email.newPlaceholder')"></FormEmail>
        </FormItemBox>
        <FormItemBox :label="$t('security.email.code')" prop="email_code" isRequired v-if="form.email?.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)">
          <FormCode size="large" v-model="form.email_code" event="validate" :email="form.email" :placeholder="form.email ? $t('security.email.codePlaceholder') : $t('security.email.codeAfterEmail')"></FormCode>
        </FormItemBox>
      </div>
    </template>
  </FormPupBox>
</template>

<script setup>
import {ref,reactive,nextTick} from 'vue'
import { postApi } from '@/utils/api.js'
import { message } from '@/utils/message.js'
import { t } from '@/utils'
const props = defineProps({
})
const show=ref(false)
const oldEmail=ref('')
const emits = defineEmits(['success'])
const pup = reactive({
  status:false,
  title: t('security.email.changeTitle'),
  width:400,
  labelPosition:'top',
  form:{
    email:'',
    email_code:'',
    event:'validate',

  },
  actions:[
    {
      label: t('security.email.save'),
      click: (pup) => {
        postApi('/user/auth/validateEmail',pup.form).then((res) =>{
          message(t('security.email.bindSuccess'))
          close()
          emits('success')
        }).catch((err) =>{
          message(err?.msg || t('security.email.bindFailed'),'error')
        }).finally(()=>{
          pup.loading=false
        })
      }
    }
  ]
})
const open=(email)=>{
  pup.status=true
  pup.form.email=email
  show.value=false
  nextTick(()=>{
    show.value=true
  })
}
const close=()=>{
  pup.status=false
}

defineExpose({
  open,
  close,
})
</script>

<style scoped lang="less">
.emailBox{
  padding: var(--ui-padding-8-12);
  background: #f3f7ff;
  border-radius:var(--ui-radius-sm);
  border:var(--ui-border-primary-muted);
}
</style>
