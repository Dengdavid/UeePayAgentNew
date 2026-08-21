<template>
  <FormPupBox ref="pupRef" :pup="pup">
    <template #default="{ form }">
      <div class="authorization list-b-8">
        <div class="title">{{ $t('openPlatform.authorization.saveNotice') }}</div>
        <div class="text">{{ form.authorization }}</div>
      </div>
    </template>
  </FormPupBox>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { copyText } from '@/utils/dataInfo.js'
import { t } from '@/utils'
const emit = defineEmits(['success'])
const pupRef = ref(null)
const pup = reactive({
  status: false,
  title: t('openPlatform.authorization.viewTitle'),
  width: 400,
  labelPosition: 'top',
  form:{
    authorization:'',
  },
  actions: [
    {
      label: t('openPlatform.authorization.copy'),
      click: (pup) => {
        const { authorization}=pup.form
        copyText(authorization, t('openPlatform.authorization.copied'))
        emit('success')
        close()
      },
    },
  ],
})

const open = (value) => {
  pup.form.authorization =value
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
<style lang="less" scoped>
.authorization{
  text-align: center;
  .title{
    font-weight: 600;
  }
  .text{
    background: #f5f7fa;
    padding: var(--ui-padding-8);
    border-radius:var(--ui-radius-3);
  }
}
</style>
