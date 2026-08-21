<template>
    <div class="ui-layout">
       <router-view></router-view>
    </div>
</template>

<script setup>

import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

const handleBack = function() {
    router.back();
}
</script>
<style lang="less">
    .ui-layout {
      padding: var(--ui-page-padding) 0;
    }
</style>
