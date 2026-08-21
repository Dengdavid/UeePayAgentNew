<template>
  <FormPupBox ref="pupRef" :pup="pup">
    <template #default="{form}">
      <div class="list-b-22">
        <div class="emailBox">
          <h3>{{ $t('security.email.verifyTitle') }}</h3>
          <p>{{ $t('security.email.verifyDescription', { email: maskEmail(form.email) }) }}</p>
        </div>
        <FormItemBox  prop="email_code" isRequired>
          <FormCode size="large" v-model="form.email_code" event="validate" :email="form.email" :placeholder="form.email ? $t('security.email.codePlaceholder') : $t('security.email.codeAfterEmail')"></FormCode>
        </FormItemBox>
        <div class="tip">
          <span class="iconfont icon-shujuanquan"></span>
          <p>{{ $t('security.email.securityFooter') }}</p>
        </div>
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
const maskEmail = (email) => {
  if (!email) return ''

  const atIndex = email.indexOf('@')
  if (atIndex <= 0) return '***'

  const username = email.slice(0, atIndex)
  const domain = email.slice(atIndex)

  if (username.length <= 2) return `${username.charAt(0)}***${domain}`
  if (username.length <= 4) return `${username.charAt(0)}***${username.slice(-1)}${domain}`
  if (username.length <= 6) return `${username.slice(0, 2)}***${username.slice(-1)}${domain}`

  return `${username.slice(0, 3)}***${username.slice(-2)}${domain}`
}
const pup = reactive({
  status:false,
  title: t('security.email.securityTitle'),
  width:400,
  labelPosition:'top',
  form:{
    email:'',
    email_code:'',
    event:'validate',

  },
  actions:[
    {
      label: t('security.email.submit'),
      click: (pup) => {
        postApi('/user/auth/closedSecretKey',{
          code:pup.form.email_code
        }).then((res) =>{
          message(t('security.email.googleClosed'))
          close()
          emits('success')
        }).catch((err) =>{
          message(err?.msg || t('security.email.googleCloseFailed'),'error')
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
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.tip{
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 4px;
  color: var(--ui-color-text-secondary);
  text-align: center;
}
</style>
