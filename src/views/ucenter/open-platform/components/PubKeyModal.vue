<template>
  <FormPupBox ref="pupRef" :pup="pup">
    <template #default="{ form }">
      <div class="list-b-22">
        <FormItemBox :label="$t('openPlatform.publicKey.field')" prop="pubkey">
          <FormInput size="large" type="textarea" :rows="3" v-model="form.pubkey" :placeholder="$t('openPlatform.publicKey.placeholder')" />
        </FormItemBox>
        <div class="text list-b-4">
          <p><b>{{ $t('openPlatform.publicKey.notice') }}</b></p>
          <p class="desc">{{ $t('openPlatform.publicKey.method') }}</p>
          <p class="tips" v-if="isComplete">{{ $t('openPlatform.publicKey.masked') }}</p>
        </div>
      </div>
    </template>
  </FormPupBox>
</template>

<script setup>
import { reactive, ref,computed } from 'vue'
import { message } from '@/utils/message.js'
import { postApi } from '@/utils/api.js'
import { t } from '@/utils'

const emit = defineEmits(['success'])
const pupRef = ref(null)
const isComplete=computed(()=>{
  return  !!(pup.form.pubkey && pup.form.pubkey.includes('*'))
})
const pup = reactive({
  status: false,
  title: t('openPlatform.publicKey.title'),
  width:500,
  labelPosition: 'top',
  form:{},
  actions: [
    {
      label: t('openPlatform.save'),
      disabled:(form)=>{
        return isComplete.value
      },
      click: (pup) => {
        const {pubkey}=pup.form
        postApi('/user/setPubkey', {pubkey:pubkey})
          .then((res) => {
            message(t('openPlatform.publicKey.success'))
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
  pup.form.pubkey=value
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
.text{
  p{
    margin:0;
  }
  .desc{
    color:var(--ui-color-neutral-550);
    font-size: 12px;
  }
  .tips{
    color: var(--error-color);
    font-size: 12px;
    font-weight: 600;
  }
}
</style>
