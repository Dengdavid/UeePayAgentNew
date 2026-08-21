<template>
  <template v-if="!user?.is_invite_cashback">
    <AgentApply/>
  </template>
  <template v-else-if="isHiddenAgentRoute">
    <router-view/>
  </template>
  <template v-else>
    <UiPage :tabs="tabs" :fallback="{ name: 'home' }" :title="$t('agent.title')"></UiPage>
  </template>
</template>

<script setup>
import AgentApply from './agentApply/index.vue'
import { computed, defineAsyncComponent } from 'vue'
import { agentRoutes } from '@/router/router.js'
import { useRoute } from '@/utils/route'
import { useUserStore } from '@/store/user.js';
import { t } from '@/utils'
const userStore = useUserStore()
const user = computed(() => userStore.user)
const route = useRoute()
const tabRoutes = agentRoutes.filter((route) => !route?.meta?.hidden).map((item) => {
  return {
    titleKey: item?.meta?.titleKey,
    fallbackTitle: item?.meta?.title,
    name: item?.name,
    component: defineAsyncComponent(item?.component),
    passActive: false,
  }
})
const tabs = computed(() => tabRoutes.map(({ titleKey, fallbackTitle, ...item }) => ({
  ...item,
  title: titleKey ? t(titleKey) : fallbackTitle,
})))
const isHiddenAgentRoute = computed(() => {
  return agentRoutes.some((item) => item?.name === route.name && item?.meta?.hidden)
})
</script>

<style scoped lang="less">

</style>
