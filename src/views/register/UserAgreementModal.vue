<template>
  <div class="agreement-scroll" @scroll="handleScroll">
    <div class="agreement-content" v-html="$t('register.legal.userAgreement', legalParams)"></div>
  </div>
</template>
<script setup>
import { siteConfig } from '@/config/site.js'

const htmlEntities = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#039;',
}
const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, char => htmlEntities[char])
const legalParams = {
  nameZh: escapeHtml(siteConfig.nameZh),
  nameEn: escapeHtml(siteConfig.nameEn),
  website: escapeHtml(siteConfig.website),
  privacyEmail: escapeHtml(siteConfig.privacyEmail),
  domain: escapeHtml(siteConfig.domain),
  year: new Date().getFullYear(),
}

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
