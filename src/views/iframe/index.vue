<template>
   <iframe :src="url" class="iframeBox" frameborder="0"/>
</template>
<script setup>
import {ref,onMounted} from 'vue'
import { useRoute } from 'vue-router'
const route = useRoute()
const url=ref('')
onMounted(() => {
  url.value=route.query.url
});

</script>

<style scoped lang="less">
.iframeBox{
   position: absolute;
   left: 0;
   top: 0;
   width: 100%;
   height: 100%;
}
</style>