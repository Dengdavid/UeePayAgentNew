<template>
  <div class="loading-box list-b-18">
    <Space size="large" fix>
      <Spin size="small" />
      <Spin />
      <Spin size="small" />
    </Space>
  </div>
</template>

<script setup>
import { defineProps, ref } from 'vue'
import Empty from '@/assets/images/empty.png'
const props = defineProps({
  text: {
    type: String,
    default: '暂无数据',
  },
})
</script>

<style scoped lang="less">
.loading-box {
  position: fixed;
  left: 0;
  top: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  z-index: var(--ui-layer-overlay);
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(2px);
}
</style>
