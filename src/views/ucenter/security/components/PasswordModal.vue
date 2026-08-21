<template>
  <FormPupBox ref="pupRef" :pup="pup">
    <template #default="{form}">
       <FormItemBox :label="$t('security.password.old')" prop="oldpwd" isRequired :rules="[
        { min: 6, max: 32, message: $t('security.password.length'), trigger: 'blur' },
      ]">
        <FormInput type="password" v-model="form.oldpwd" :placeholder="$t('security.password.oldPlaceholder')"></FormInput>
      </FormItemBox>
      <FormItemBox :label="$t('security.password.new')" prop="pwd" isRequired :rules="[
        { min: 6, max: 32, message: $t('security.password.length'), trigger: 'blur' },
      ]">
        <FormInput type="password" v-model="form.pwd" :placeholder="$t('security.password.newPlaceholder')"></FormInput>
      </FormItemBox>
      <FormItemBox :label="$t('security.password.confirm')" prop="repwd" isRequired :rules="[
        {
          validator: (rule, value, callback) => {
            if (value !== form.pwd) {
              callback(new Error($t('security.password.mismatch')))
            } else {
              callback()
            }
          },
          trigger: 'blur',
        },
      ]">
        <FormInput  type="password" v-model="form.repwd" :placeholder="$t('security.password.confirmPlaceholder')"></FormInput>
      </FormItemBox>
    </template>
  </FormPupBox>
</template>

<script setup>
import {ref,reactive} from 'vue'
import { postApi } from '@/utils/api.js'
import { message } from '@/utils/message.js'
import { toRoute } from '@/utils/route.js'
import { useUserStore } from '@/utils/store.js'
import { t } from '@/utils'
const userStore = useUserStore()
const props = defineProps({
})
const pup = reactive({
  status:false,
  title: t('security.password.title'),
  width:400,
  labelPosition:'top',
  form:{
    oldpwd:'',
    pwd:'',
    repwd:'',
  },
  actions:[
    {
      label: t('security.password.submit'),
      click: (pup) => {
        const {pwd,repwd,oldpwd}=pup.form
        postApi('/user/auth/changePwd',{
          oldpwd:oldpwd,
          pwd:pwd,
        }).then((res) =>{
          message(t('security.password.success'))
          userStore.logout()
          toRoute('login')
          pup.status=false
        }).catch((err) =>{
          message(err?.msg || t('security.password.failed'),'error')
        }).finally(()=>{
          pup.loading=false
        })
      }
    }
  ]
})
const open=()=>{
  pup.status=true
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

</style>
