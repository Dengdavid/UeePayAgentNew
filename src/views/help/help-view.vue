<template>
  <router-view :category="category"></router-view>
  <Spin fix v-if="loading" ></Spin>
</template>

<script setup>
import { ref,onMounted } from 'vue'
import { getApi } from '@/utils/api.js'
import { message } from '@/utils/message.js'
const category=ref([])
const loading=ref(false)
const getCategory=()=>{
  loading.value=true
  getApi('/help/cate').then((res) => {
    category.value = res || []
  }).catch((err) => {
    message(err?.msg, 'error')
  }).finally(() => {
    loading.value=false
  })
}
onMounted(() => {
  getCategory()

})
</script>

<style>

</style>
