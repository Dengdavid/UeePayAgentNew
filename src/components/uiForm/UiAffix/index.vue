<template>
  <div class="ui-affix" :style="affixPlaceholderStyle">
    <Affix v-bind="$attrs">
      <div ref="slotRef" class="ui-affix-slot">
        <slot />
      </div>
    </Affix>
  </div>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'

const slotRef = ref(null)
const slotHeight = ref(0)
let slotResizeObserver = null

const affixPlaceholderStyle = computed(() => (
  slotHeight.value > 0
    ? { height: `${slotHeight.value}px` }
    : undefined
))

const updateSlotHeight = () => {
  const height = slotRef.value?.getBoundingClientRect().height || 0
  slotHeight.value = Math.ceil(height)
}

onMounted(() => {
  nextTick(() => {
    updateSlotHeight()
    if (!slotRef.value || typeof ResizeObserver === 'undefined') return
    slotResizeObserver = new ResizeObserver(updateSlotHeight)
    slotResizeObserver.observe(slotRef.value)
  })
})

onBeforeUnmount(() => {
  slotResizeObserver?.disconnect()
  slotResizeObserver = null
})
</script>

<style scoped lang="less">
.ui-affix {
  width: 100%;
}

.ui-affix-slot {
  display: flow-root;
}
</style>
