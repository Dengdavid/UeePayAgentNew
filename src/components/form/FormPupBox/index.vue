<template>
  <Modal v-model="pup.status" :footer-hide="pup?.actions?.length === 0 || pup.isNotFooter" :title="pup.title" v-bind="{
    ...pup,
    ...$attrs
  }" :class-name="modalClassName" :style="{
    '--form-pup-box-max-height': formatSize(pup.maxHeight)
  }" @scroll.capture.passive="handleModalScroll" v-if="pup">
    <Form class="pup-form" :style="{
      height:formatSize(pup.height)
    }" ref="formRef" :rules="pup?.rules"  :key="formKey" size="large" :model="pup.form"  :label-width="pup.labelPosition==='top'?null:pup.labelWidth || 80" :label-position="pup.labelPosition || 'right'" @submit.prevent="">
      <slot :form="pup.form"></slot>
      <Spin size="large" fix v-if="pup.loading"></Spin>
    </Form>
    <template #footer>
      <div class="footer">
        <div class="l"></div>
        <div class="r">
          <Button size="default" @click="pup.status=false">{{ $t('button.cancel') }}</Button>
          <Button type="primary" size="default" :loading="pup?.loading" @click="handleOk(action)" :disabled="typeof action.disabled==='function' ? action.disabled(pup.form) : false" v-for="action in pup.actions">
            {{ action.label}}
          </Button>
        </div>
      </div>
    </template>
  </Modal>
</template>

<script setup>
import { computed, onMounted, defineProps, getCurrentInstance,ref,useAttrs,watch,nextTick } from 'vue'
const { proxy } = getCurrentInstance()
const props = defineProps({
  pup: {
    type: Object,
  },
})
const emit = defineEmits(['scroll-bottom'])
const attrs = useAttrs()
const formatSize = (value) => typeof value === 'number' ? `${value}px` : value
const modalClassName = computed(() => [
  'vertical-center-modal',
  'form-pup-box-modal',
  props.pup?.className,
  attrs.className,
  attrs['class-name'],
].filter(Boolean).join(' '))
let hasEmittedScrollBottom = false
const handleModalScroll = (event) => {
  if (hasEmittedScrollBottom || !event.target?.classList?.contains('ivu-modal-body')) return
  const { scrollTop, clientHeight, scrollHeight } = event.target
  if (scrollTop + clientHeight >= scrollHeight - 8) {
    hasEmittedScrollBottom = true
    emit('scroll-bottom')
  }
}
watch(()=>props.pup?.status,(val)=>{
   if(val) hasEmittedScrollBottom = false
   if(!val){
    props.pup.form=JSON.parse(JSON.stringify(oldForm.value))
    props.pup.loading=false
    resetFields()
  }
})
const oldForm=ref(null)
const formKey=ref(0)
const formRef=ref(null)
const resetFields=()=>{
  formKey.value++
}
const validateField=(prop, callback)=>{
  return formRef.value?.validateField(prop, callback)
}
const handleOk = (action) => {
 formRef.value.validate((valid) => {
    if (valid) {
      props.pup.loading=true
      if(action.click && typeof action.click==='function') {
        action.click(props.pup)
      }
    }
  })
}
onMounted(() => {
  if(props.pup?.form){
    oldForm.value=JSON.parse(JSON.stringify(props.pup.form))
  }
})

defineExpose({
  resetFields,
  validateField
})
</script>
<style lang="less" scoped>
.pup-form{
  position: relative;
  margin: calc(0px - var(--ui-dialog-padding));
  padding: var(--ui-dialog-padding) var(--ui-dialog-padding) 22px;
  :deep(.ivu-form-item){
    &:last-child{
      margin-bottom: 0 !important;
    }
  }
}
.footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  button+button{
    margin: 0;
  }
  >*{
    display: flex;
    align-items: center;
    gap: var(--ui-dialog-footer-gap);
  }
}
:global(.form-pup-box-modal) {
  display: flex;
  align-items: center;
  justify-content: center;
}
:global(.form-pup-box-modal .ivu-modal) {
  top: 0;
}
:global(.form-pup-box-modal .ivu-modal:not(.ivu-modal-fullscreen)) {
  margin: 0;
  max-width: calc(100vw - 16px);
  max-height: calc(100vh - 16px);
}
:global(.form-pup-box-modal .ivu-modal:not(.ivu-modal-fullscreen) .ivu-modal-content) {
  display: flex;
  flex-direction: column;
  max-height: min(var(--form-pup-box-max-height, calc(100vh - 16px)), calc(100vh - 16px));
}
:global(.form-pup-box-modal .ivu-modal:not(.ivu-modal-fullscreen) .ivu-modal-body) {
  min-height: 0;
  overflow-x: hidden;
  overflow-y: auto;
  overscroll-behavior: contain;
  -webkit-overflow-scrolling: touch;
}
</style>
