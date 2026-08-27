<template>
  <Image
    :style="{
      background: src ? '' : '#f5f5f5',
      padding: src ? '' : '10px',
    }"
    :src="src"
    :fit="fit"
    :width="setSize(width)"
    :height="setSize(height, width)"
  >
    <template #error>
      <div class="error list-b-8">
        <Icon type="md-image" size="32" color="#ccc" />
        <p v-if="isText">暂无图片</p>
      </div>
    </template>
  </Image>
</template>

<script setup>
import { computed, defineProps, ref } from 'vue'
import { setSize } from '@/utils/plugin.js'
const props = defineProps({
  src: {
    type: String,
  },
  fit: {
    type: String,
    default: 'contain',
  },
  width: {
    type: [String, Number],
  },
  height: {
    type: [String, Number],
  },
})
const isText = computed(() => {
  let value = props.height || props.width
  if (typeof value === 'string') {
    value = getLeadingNumber(value)
  }
  return value && value > 60
})
const getLeadingNumber = (str) => {
  const trimmed = str.trim()
  const match = trimmed.match(/^-?\d+(?:\.\d+)?/)
  return match ? parseFloat(match[0]) : null
}
</script>

<style scoped lang="less">
.error {
  position: absolute;
  left: 0;
  top: 0;
  right: 0;
  bottom: 0;
  background: #f5f5f5;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  color: var(--ui-color-text-secondary);
  font-size: 12px;
}
</style>
