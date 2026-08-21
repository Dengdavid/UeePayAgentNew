<template>
  <div class="empty-box list-b-8">
    <Image :src="Empty" fit="contain" width="100px" height="100px" />
    <p class="text-color-text">{{ text }}</p>
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
.empty-box {
  width: 100%;
  min-height: 160px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  user-select: none;         /* 标准语法 */
  pointer-events:none
}
</style>
