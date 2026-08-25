<template>
  <FormPupBox :pup="pup" :inner="false">
    <template #default="{form}">
      <FormEmail v-model="form.smtp_test" size="default" width="100%" :placeholder="t('setting.testRecipientEmailPlaceholder')"></FormEmail>
    </template>
  </FormPupBox>
</template>

<script setup>
  import { ref, reactive, computed,onMounted,nextTick } from 'vue'
  import { message } from '@/utils/message'
  import { postApi } from '@/utils/api'
  import { t } from '@/utils/index.js'
  const emit = defineEmits(['onConfirm']);
  const pup = reactive({
    status: false,
    title: t('setting.emailTest'),
    width:400,
    form: {
     smtp_test:''
    },
    //操作
    actions: [
      {
        label: t('setting.confirmSend'),
        permission:'',
        click: (pup) => {
          postApi("/user/agentSite/testEmail",{
            type:'agent',
            smtp_config:pup.row,
            smtp_test:pup.form.smtp_test,
          }).then(res=>{
            message(t('setting.emailSendSuccess'))
            emit('onConfirm',pup.form)
            close()
          }).catch(err=>{
            message(err?.msg, 'error')
          }).finally(()=>{   
            buttonLoading()
          }) 
        }
      },
    ]
  })
  const close=()=>{    
    pup.status = false
    pup.buttonLoading = false
  }
  const buttonLoading=()=>{
    pup.buttonLoading = false
    pup.loading = false
  }
  const open =(row)=>{
    pup.row=row
    pup.status=true  
  }
  defineExpose({ open,close,buttonLoading });
  onMounted(() => {

  });
</script>

<style scoped lang="less">

</style>
