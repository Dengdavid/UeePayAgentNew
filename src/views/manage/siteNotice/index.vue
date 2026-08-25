<template>
  <UiPage isNotTitle>
    <div class="site-notice-form">
      <Form ref="formRef" :model="data" label-position="top">
        <FormItemBox  prop="notice">
          <FormInput
            v-model="data.notice"
            type="textarea"
            :autosize="{ minRows: 10, maxRows: 30 }"
            :maxlength="1000"
            width="100%"
          />
        </FormItemBox>
        <Button
          type="primary"
          :loading="loadingButton"
          :disabled="loading || !isDirty"
          @click="handleSave"
        >
          {{ $t('button.save') }}
        </Button>
      </Form>
      <Spin fix v-if="loading" />
    </div>
  </UiPage>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import {
  data,
  getData,
  isDirty,
  loading,
  loadingButton,
  save,
} from '@/views/manage/setting/data.js'

const formRef = ref(null)

const handleSave = () => {
  formRef.value.validate((valid) => {
    if (valid) save()
  })
}

onMounted(getData)
</script>

<style lang="less" scoped>
.site-notice-form {
  position: relative;
  width: 100%;
  max-width: 1000px;
  min-height: 250px;
}
</style>
