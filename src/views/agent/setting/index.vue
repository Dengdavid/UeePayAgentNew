<template>
  <CardBox :loading="loading">
    {{ $t('agent.setting.title') }}
  </CardBox>
</template>

<script setup>
import { onMounted } from 'vue'
import { getInfo,loading } from "./data.js";
onMounted(() => {
  getInfo()
})
</script>

<style scoped lang="less">

</style>
