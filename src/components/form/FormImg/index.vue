<template>
  <div class="FormImg" :style="{
    width: size(width),
    height: size(height, width)
  }">
    <template v-if="NATIVE_FORMATS.includes(getType)">
      <Image :src="src" fit="scale-down" :style="{ width: '100%', height: '100%' }" />
    </template>
    <div class="fileBox" v-else>
      <Image :src="iconMap[getType] || iconMap.UNTITLED" fit="contain"
        :style="{ maxWidth: '60px', maxHeight: '60px' }" />
      <p class="text">{{ getName }}</p>
    </div>
  </div>
</template>

<script setup>
import { computed, defineProps, getCurrentInstance, ref } from 'vue';
const { proxy } = getCurrentInstance()
const props = defineProps({
  src: {
    type: String,
  },
  width: {
    type: [Number, String],
  },
  height: {
    type: [Number, String],
  },
})
// 动态加载所有图标
const icons = import.meta.glob('./images/*.png', { eager: true });
// 将图标映射到一个对象中
const iconMap = Object.fromEntries(
  Object.entries(icons).map(([key, value]) => {
    const name = key.match(/([^/]+)\.png$/)[1]; // 提取文件名（不包含扩展名）
    return [name, value.default];
  })
);
const showPreview = ref(false);
// 支持直接渲染的格式（现代浏览器）
const NATIVE_FORMATS = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp'];
const getType = computed(() => {
  if (!props.src) return '';
  const cleanUrl = props.src.split(/[?#]/)[0];
  const match = cleanUrl.match(/\.([^.\/]+)$/);
  const ext = match ? match[1].toLowerCase() : '';
  return ext;
})
const getName = computed(() => {
  if (!props.src) return '';
  const cleanUrl = props.src.split(/[?#]/)[0];
  return cleanUrl.split(/[\\/]/).pop();
})
const size = (number, defaultNumber) => {
  const _number = number ?? defaultNumber;
  if (typeof _number === 'string') {
    return _number;
  }
  return `${_number}px`;
};
</script>
<style lang="less" scoped>
.FormImg {
  background: var(--ui-color-surface-neutral);
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;

  .fileBox {
    position: absolute;
    left: 0;
    top: 0;
    right: 0;
    bottom: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    padding: var(--ui-padding-30);
  }

  .text {
    margin-top: 8px;
    font-size: 12px;
    overflow-wrap: break-word;
    word-wrap: break-word;
    word-break: break-word;
    /* Safari 兼容 */
    hyphens: auto;
    /* 可选：自动加连字符（需语言支持） */
    line-height: 1.5;
  }
}
</style>
