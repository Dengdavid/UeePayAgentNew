<template>
  <pre class="textHtml" v-html="cleanHtml" v-if="data"></pre>
</template>

<script setup>
import DOMPurify from 'dompurify';
import { computed, onMounted, ref } from 'vue';

const props = defineProps({
  data: {
    type: String,
    default: ''
  }
});
const cleanHtml = computed(() => {
  let sanitized = DOMPurify.sanitize(props.data, {
    // 可选：允许特定标签（默认已够用）
    ALLOWED_TAGS: ['p', 'strong', 'em', 'ul', 'li', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'img', 'br', 'blockquote', 'pre', 'code', 'a'],
    ALLOWED_ATTR: ['src', 'alt', 'href']
  });
  return sanitized;
});
onMounted(() => {
});
</script>

<style scoped lang="less">
.textHtml {
  white-space: pre-wrap;
  word-wrap: break-word;
  line-height: 1.68em;
}
</style>
