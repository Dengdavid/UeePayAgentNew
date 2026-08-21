<template>
  <FormPupBox class="UiTableSelect" ref="pupRef" :pup="pup">
    <component :is="tabs[type]" isSelect @select="select" padding="0" v-if="pup.status"/>
  </FormPupBox>
</template>

<script setup>
import { computed, shallowRef, reactive, onMounted } from 'vue'
import { isPhone } from '@/utils/device.js'
const props = defineProps({
  type: {
    type: String,
    default:'history'
  },
})
import ExpressHistoryTab from '@/views/express/index.vue';
import ExpressReceiverTab from '@/views/express/components/ExpressReceiverTab/index.vue';
import ExpressSenderTab from '@/views/express/components/ExpressSenderTab/index.vue';
const tabs = shallowRef({
  history:ExpressHistoryTab,
  receiver:ExpressReceiverTab,
  sender:ExpressSenderTab
});
const pup=reactive({
  status:false,
  title:'选择',
  width:'1200',
  isNotFooter:true,
})
const open=(title)=>{
  pup.status=true
  pup.title=title
}
const close=()=>{
  pup.status=false
}
const emit=defineEmits(['select'])
const select=(row,index)=>{
  close()
  emit('select',row,index)
}
defineExpose({
  open,
  close,
})
</script>
<style lang="less" >
@media screen and (max-width: 768px) {
  .UiTableSelect{
    .ivu-modal-body{
      padding:0 !important;
      overflow: hidden;
      .ivu-form{
        height: 80vh !important;
      }
      .ui-page{
        position: relative;
        padding: var(--ui-padding-8);
      }
    }
  }
}
</style>
