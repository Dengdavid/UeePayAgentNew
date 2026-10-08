<template>
  <FormPupBox ref="pupRef" :pup="pup">
    <template #default="{form}">
       <FormItemBox :label="$t('security.password.old')" prop="oldpwd" isRequired :rules="{ min: 6, max: 32 }">
        <FormInput type="password" v-model="form.oldpwd" :placeholder="$t('security.password.oldPlaceholder')"></FormInput>
      </FormItemBox>
      <FormPassword v-model="form.pwd" :label="$t('security.password.new')" prop="pwd" :placeholder="$t('security.password.newPlaceholder')" :rules="[
        {
          validator: (rule, value, callback) => {
            if (value && value === form.oldpwd) {
              callback(new Error($t('security.password.sameAsOld')))
            } else {
              callback()
            }
          },
          trigger: ['change', 'blur'],
        },
      ]" />
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
import {ref,reactive,watch} from 'vue'
import FormPassword from '@/components/form/FormPassword/index.vue'
import { postApi } from '@/utils/api.js'
import { message } from '@/utils/message.js'
import { toRoute } from '@/utils/route.js'
import { useUserStore } from '@/utils/store.js'
import { t } from '@/utils'
const userStore = useUserStore()
const props = defineProps({
})
const pupRef = ref(null)
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
watch(() => pup.form.oldpwd, () => {
  if (pup.status && pup.form.pwd) {
    pupRef.value?.validateField('pwd')
  }
}, { flush: 'post' })
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
