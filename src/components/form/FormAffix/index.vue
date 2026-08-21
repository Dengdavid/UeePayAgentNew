<template>
  <Affix :offset-top="top" :key="affixKey" v-bind="$attrs">
    <slot></slot>
  </Affix>
</template>

<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue'
const props = defineProps({
  top: {
    type: Number,
    default: 0,
  },
})
const affixKey = ref(0)
const handleResize = () => {
  affixKey.value += 1
}
onMounted(() => {
  window.addEventListener('resize', handleResize)
})
onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize)
})
</script>
