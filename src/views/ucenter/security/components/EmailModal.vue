<template>
  <FormPupBox ref="pupRef" :pup="pup">
    <template #default="{form}">
      <div class="list-b-22 ">
        <div class="emailBox">
          <p>{{ $t('security.email.bound') }} <span class="ui-text-primary">{{ oldEmail }}</span></p>
        </div>
        <FormItemBox :label="$t('security.email.newAddress')" prop="email" isRequired :rules="[
          {
            validator: async (rule, value, callback) => {
              const reg = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
              if (!value || reg.test(value)) {
                callback()
              } else {
                callback(new Error($t('security.email.invalid')))
              }
            }
          }
        ]">
          <FormEmail size="large" :data="form" data-name="email" :placeholder="$t('security.email.newPlaceholder')"></FormEmail>
        </FormItemBox>
        <FormItemBox :label="$t('security.email.code')" prop="email_code" isRequired v-if="form.email?.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)">
          <FormCode size="large" v-model="form.email_code" event="validate" :email="form.email" :placeholder="form.email ? $t('security.email.codePlaceholder') : $t('security.email.codeAfterEmail')"></FormCode>
        </FormItemBox>
      </div>
    </template>
  </FormPupBox>
</template>

<script setup>
import {ref,reactive,nextTick,watch,onBeforeUnmount} from 'vue'
import { postApi } from '@/utils/api.js'
import { message } from '@/utils/message.js'
import { t } from '@/utils'
const props = defineProps({
})
const show=ref(false)
const oldEmail=ref('')
const submitting=ref(false)
let requestGeneration=0
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
      disabled: () => submitting.value,
      click: (pup) => {
        if(submitting.value) return
        const generation=requestGeneration
        const payload={...pup.form}
        submitting.value=true
        postApi('/user/auth/changeEmail',payload).then((res) =>{
          if(generation!==requestGeneration || !pup.status) return
          message(t('security.email.changeSuccess'))
          close()
          emits('success')
        }).catch((err) =>{
          if(generation!==requestGeneration || !pup.status || err?.silent || err?.cancelled || err?.msg==='SILENT_ERROR') return
          message(err?.msg || t('security.email.changeFailed'),'error')
        }).finally(()=>{
          submitting.value=false
          pup.loading=false
        })
      }
    }
  ]
})
watch(() => pup.form.email, async (email) => {
  if (email && email === oldEmail.value) {
    pup.form.email = ''
    pup.form.email_code = ''
    const generation=requestGeneration
    await nextTick()
    if(generation!==requestGeneration || !pup.status) return
    message(t('security.email.duplicate'), 'error')
  }
}, { flush: 'post' })
watch([() => pup.status, () => pup.form.email], () => {
  requestGeneration++
}, { flush: 'sync' })
onBeforeUnmount(() => {
  requestGeneration++
})
const open=(email)=>{
  pup.status=true
  oldEmail.value=email
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
