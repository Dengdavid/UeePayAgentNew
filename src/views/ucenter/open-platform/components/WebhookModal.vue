<template>
  <FormPupBox ref="pupRef" :pup="pup">
    <template #default="{ form }">
      <div class="webhook-form list-b-16">
        <div class="webhook-tip">
          {{ $t('openPlatform.webhook.tip') }}
        </div>
        <FormItemBox :label="$t('openPlatform.webhook.label')" prop="webhook" isRequired>
          <FormInput size="large" v-model="form.webhook" v-model:select="form.protocol" :options="protocolOptions" placeholder="api.example.com/webhook" />
        </FormItemBox>
      </div>
    </template>
  </FormPupBox>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { message } from '@/utils/message.js'
import { postApi } from '@/utils/api.js'
import { t } from '@/utils'

const emit = defineEmits(['success'])
const pupRef = ref(null)
const protocolOptions=ref([
  {label:'http',value:'http'},
  {label:'https',value:'https'}
])
const pup = reactive({
  status: false,
  title: t('openPlatform.webhook.title'),
  width:500,
  labelPosition: 'top',
  form:{
    protocol:'https',
    webhook:''
  },
  actions: [
    {
      label: t('openPlatform.save'),
      click: (pup) => {
        const {protocol, webhook}=pup.form
        postApi('/user/setCallbackUrl', {webhook:`${protocol}://${webhook}`})
          .then((res) => {
            message(t('openPlatform.webhook.success'))
            emit('success')
            close()
          }).catch((err)=>{
            message(err?.msg, 'error')
          }).finally(()=>{
            pup.loading = false
          })
      },
    },
  ],
})

const open = (value) => {
  pup.form.protocol = 'https'
  pup.form.webhook = ''
  if(value){
    const splitValue=value.split('://')
    if(splitValue.length==2){
      pup.form.protocol = splitValue[0]
      pup.form.webhook = splitValue[1]
    }else{
      pup.form.webhook = value || ''
      pup.form.protocol = 'https'
    }
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
<style lang="css" scoped>
.webhook-form{
  .webhook-tip{
    padding:var(--ui-padding-8-12);
    border: var(--ui-border-primary-subtle);
    border-radius: var(--ui-radius-sm);
    background: #f7faff;
  }
}
@media screen and (max-width: 768px) {
  .webhook-form{
    .webhook-url-row{
      .webhook-url-field{
        .protocol-select{
          width: 104px;
        }
      }
    }
  }
}
</style>
