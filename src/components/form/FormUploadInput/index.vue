<template>
  <Input :model-value="modelValue" :placeholder="placeholder" readonly style="width: 100%;" v-if="show">
    <template #prepend v-if="modelValue">
      <UiImg  class="imgBox" :src="modelValue"  width="28px"/>
    </template>
    <template #append>
      <FormUpload isNotProgress v-bind="$attrs" @on-change="handleChange">
        <template #default="{loading}">
          <Button :loading="loading" icon="ios-cloud-upload-outline">上传</Button>
        </template>
      </FormUpload>
    </template>
  </Input>
</template>

<script setup>
import { nextTick, ref, getCurrentInstance, inject } from 'vue';
const { proxy } = getCurrentInstance()
const FormItemInstance = inject('FormItemInstance', null);

const props = defineProps({
  modelValue: {},
  placeholder:{
    type:String,
    default:'点击上传文件'
  }
})
const show=ref(true)
const emits = defineEmits(['update:modelValue', 'on-change'])
const handleChange=(file)=>{
   emits('update:modelValue',file.fileFullUrl)
   emits('on-change', file.fileFullUrl)
   if (FormItemInstance && typeof FormItemInstance.onFieldChange === 'function') {
      FormItemInstance.onFieldChange();
   } else if (FormItemInstance && typeof FormItemInstance.validate === 'function') {
      FormItemInstance.validate('change');
   }
   show.value=false
   nextTick(()=>{
    show.value=true
   })
}
</script>
<style lang="less" scoped>
.imgBox{
  margin: -5px -7px;
  :deep(.ivu-image-mark){
    display: none !important;
  }
}
</style>

