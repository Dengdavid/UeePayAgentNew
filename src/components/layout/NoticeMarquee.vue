<template>
  <div
    ref="viewportRef"
    class="notice-marquee"
    :class="{ 'notice-marquee--scrolling': isOverflowing }"
  >
    <div class="notice-marquee__track" :style="trackStyle">
      <span ref="textRef" class="notice-marquee__text">{{ text }}</span>
      <span v-if="isOverflowing" class="notice-marquee__text" aria-hidden="true">{{ text }}</span>
    </div>
  </div>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'

const props = defineProps({
  text: {
    type: String,
    default: '',
  },
  speed: {
    type: Number,
    default: 36,
  },
  gap: {
    type: Number,
    default: 32,
  },
})

const viewportRef = ref(null)
const textRef = ref(null)
const isOverflowing = ref(false)
const textWidth = ref(0)
let resizeObserver = null

const trackStyle = computed(() => {
  if (!isOverflowing.value) return {}

  const distance = textWidth.value + props.gap
  const duration = Math.max(distance / props.speed, 8)

  return {
    '--notice-marquee-distance': `${distance}px`,
    '--notice-marquee-duration': `${duration}s`,
    '--notice-marquee-gap': `${props.gap}px`,
  }
})

const measureOverflow = () => {
  if (!viewportRef.value || !textRef.value) return

  textWidth.value = textRef.value.scrollWidth
  isOverflowing.value = textWidth.value > viewportRef.value.clientWidth
}

onMounted(() => {
  measureOverflow()
  resizeObserver = new ResizeObserver(measureOverflow)
  resizeObserver.observe(viewportRef.value)
  resizeObserver.observe(textRef.value)
})

onBeforeUnmount(() => {
  resizeObserver?.disconnect()
})

watch(
  () => props.text,
  async () => {
    isOverflowing.value = false
    await nextTick()
    measureOverflow()
  },
)
</script>

<style scoped lang="less">
.notice-marquee{
  min-width: 0;
  flex: 1;
  display: flex;
  align-items: center;
  overflow: hidden;
  white-space: nowrap;

  &__track{
    width: max-content;
    display: flex;
    align-items: center;
    line-height: 20px;
    will-change: transform;
  }

  &__text{
    flex-shrink: 0;
  }

  &--scrolling{
    .notice-marquee__track{
      animation: notice-marquee-scroll var(--notice-marquee-duration) linear infinite;
    }

    .notice-marquee__text + .notice-marquee__text{
      margin-left: var(--notice-marquee-gap);
    }

    &:hover .notice-marquee__track{
      animation-play-state: paused;
    }
  }
}

@keyframes notice-marquee-scroll{
  from{
    transform: translateX(0);
  }
  to{
    transform: translateX(calc(-1 * var(--notice-marquee-distance)));
  }
}

@media (prefers-reduced-motion: reduce){
  .notice-marquee--scrolling{
    overflow-x: auto;

    .notice-marquee__track{
      animation: none;
    }

    .notice-marquee__text[aria-hidden='true']{
      display: none;
    }
  }
}
</style>
