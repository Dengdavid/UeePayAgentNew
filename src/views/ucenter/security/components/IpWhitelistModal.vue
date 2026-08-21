<template>
  <FormPupBox ref="pupRef" :pup="pup">
    <template #default="{form}">
       <newline-input :key="true" v-model="form.iptables" v-if="show"/>
    </template>
  </FormPupBox>
</template>

<script setup>
import {ref,reactive,nextTick} from 'vue'
import { postApi } from '@/utils/api.js'
import { message } from '@/utils/message.js'
import newlineInput from '@/components/utils/newline-input.vue'
import { t } from '@/utils'
const props = defineProps({
})
const show=ref(false)
const setIptables=(ips)=>{
  if (typeof ips !== 'string') ips = ips ? String(ips) : '';
  const ipList = ips.split('\n').map(ip => ip.trim()).filter(ip => ip !== '')
  const seen = new Set();
  let duplicateIp = null;
  for (const ip of ipList) {
      const lower = ip.toLowerCase();
      if (seen.has(lower)) {
          duplicateIp = ip;
          break;
      }
      seen.add(lower);
  }
  if (duplicateIp) {
      message(t('security.ipWhitelist.duplicate', { ip: duplicateIp }),'error');
      return false;
  }
  const finalIptables = ipList.join('\n');
  return finalIptables
}
const emits = defineEmits(['success'])
const pup = reactive({
  status:false,
  title: t('security.ipWhitelist.title'),
  width:400,
  form:{
    iptables:'',
  },
  actions:[
    {
      label: t('security.ipWhitelist.save'),
      click: (pup) => {
        const {iptables}=pup.form
        const finalIptables = setIptables(iptables)
        // 必须严格判断是否等于 false，因为清空白名单时 finalIptables 会等于 ''，如果是 !finalIptables 就会导致永远无法清空
        if (finalIptables===false){
          pup.loading=false
          return
        }
        postApi('/user/setIptables',{
          iptables:finalIptables,
        }).then((res) =>{
          message(t('security.ipWhitelist.success'))
          close()
          emits('success')
        }).catch((err) =>{
          message(err?.msg || t('security.ipWhitelist.failed'),'error')
        }).finally(()=>{
          pup.loading=false
        })
      }
    }
  ]
})
const open=(ips)=>{
  pup.status=true
  pup.form.iptables=ips
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

</style>
