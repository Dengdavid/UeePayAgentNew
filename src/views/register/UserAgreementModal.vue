<template>
  <div class="agreement-scroll" @scroll="handleScroll">
    <div class="agreement-content" v-html="$t('register.legal.userAgreement', legalParams)"></div>
  </div>
</template>
<script setup>
import { computed } from 'vue'
import { agentData } from '@/utils/agent.js'

const htmlEntities = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#039;',
}
const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, char => htmlEntities[char])
const legalParams = computed(() => {
  const config = agentData()
  const siteName = escapeHtml(config.site_name)
  const siteDomain = config.site_domain ?? ''
  const website = config.site_protocol && siteDomain
    ? `${config.site_protocol}://${siteDomain}`
    : siteDomain

  return {
    nameZh: siteName,
    nameEn: siteName,
    website: escapeHtml(website),
    privacyEmail: escapeHtml(config.email),
    domain: escapeHtml(siteDomain),
    year: new Date().getFullYear(),
  }
})

const emit = defineEmits(['read-complete'])
let hasEmittedReadComplete = false
const handleScroll = (event) => {
  if (hasEmittedReadComplete) return
  const { scrollTop, clientHeight, scrollHeight } = event.currentTarget
  if (scrollTop + clientHeight >= scrollHeight - 8) {
    hasEmittedReadComplete = true
    emit('read-complete')
  }
}
</script>
<style lang="less" src="./agreement.less"></style>
