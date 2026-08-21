<template>
  <div class="lightDotRise" aria-hidden="true">
    <span v-for="particle in particles" :key="particle.id" class="lightDotRise-item" :style="particle.style" />
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  // 粒子总数，建议页面场景控制在 20 - 60 之间。
  count: {
    type: Number,
    default: 32,
    validator: value => Number.isInteger(value) && value >= 0 && value <= 120
  },
  // 每一批近似同时出现的粒子数量。
  simultaneous: {
    type: Number,
    default: 6,
    validator: value => Number.isInteger(value) && value >= 1 && value <= 120
  },
  // 速度倍率，数值越大动画越快。
  speed: {
    type: Number,
    default: 1,
    validator: value => value >= 0.1 && value <= 5
  },
  // 光点基础尺寸，实际尺寸会围绕该值产生稳定差异。
  size: {
    type: Number,
    default: 8,
    validator: value => value >= 1 && value <= 32
  },
  // 上升过程中的横向分散距离，单位为 px。
  spread: {
    type: Number,
    default: 120,
    validator: value => value >= 0 && value <= 400
  },
  // 初始生成带距离容器顶部的百分比。
  startTop: {
    type: Number,
    default: 70,
    validator: value => value >= 0 && value <= 100
  },
  // 初始生成带的垂直高度范围，单位为百分比。
  startRange: {
    type: Number,
    default: 6,
    validator: value => value >= 0 && value <= 100
  }
})

const getRandomValue = function(index, salt) {
  let value = Math.imul(index + 1, 0x9e3779b1) ^ Math.imul(salt + 1, 0x85ebca6b)
  value = Math.imul(value ^ (value >>> 16), 0x7feb352d)
  value = Math.imul(value ^ (value >>> 15), 0x846ca68b)
  value ^= value >>> 16
  return (value >>> 0) / 4294967295
}

const particles = computed(() => {
  const count = Math.min(120, Math.max(0, Math.round(props.count)))
  const simultaneous = Math.min(Math.max(1, Math.round(props.simultaneous)), Math.max(1, count))
  const speed = Math.min(5, Math.max(0.1, props.speed))
  const size = Math.min(32, Math.max(1, props.size))
  const spread = Math.min(400, Math.max(0, props.spread))
  const startTop = Math.min(100, Math.max(0, props.startTop))
  const startRange = Math.min(100 - startTop, Math.max(0, props.startRange))
  const baseDuration = 8.8 / speed
  const groupCount = Math.max(1, Math.ceil(count / simultaneous))
  const groupInterval = baseDuration / groupCount

  return Array.from({ length: count }, (_, index) => {
    const groupIndex = Math.floor(index / simultaneous)
    const groupDuration = 6.2 + getRandomValue(groupIndex, 9) * 5.6
    const duration = (groupDuration * (0.92 + getRandomValue(index, 10) * 0.16)) / speed
    const drift = (getRandomValue(index, 1) - 0.5) * spread
    const rise = -(240 + getRandomValue(index, 3) * 260)
    const particleSize = size * (0.45 + getRandomValue(index, 4) * 0.9)
    const delayJitter = getRandomValue(index, 5) * Math.min(0.28, groupInterval * 0.22)
    const delay = -(groupIndex * groupInterval + delayJitter)
    const centerWeightedLeft =
      (getRandomValue(index, 7) + getRandomValue(index, 11) + getRandomValue(index, 12)) / 3

    return {
      id: index,
      style: {
        '--particle-left': `${(3 + centerWeightedLeft * 94).toFixed(2)}%`,
        '--particle-top': `${(startTop + getRandomValue(index, 8) * startRange).toFixed(2)}%`,
        '--particle-size': `${particleSize.toFixed(2)}px`,
        '--particle-duration': `${duration.toFixed(2)}s`,
        '--particle-delay': `${delay.toFixed(2)}s`,
        '--particle-drift': `${drift.toFixed(2)}px`,
        '--particle-rise': `${rise.toFixed(2)}px`
      }
    }
  })
})
</script>

<style scoped lang="less">
.lightDotRise {
  position: absolute;
  z-index: 0;
  inset: 0;
  overflow: hidden;
  pointer-events: none;

  .lightDotRise-item {
    position: absolute;
    top: var(--particle-top);
    left: var(--particle-left);
    width: var(--particle-size);
    height: var(--particle-size);
    border-radius: var(--ui-radius-circle);
    background: #fff;
    box-shadow:
      0 0 calc(var(--particle-size) * 0.9) rgba(255, 255, 255, 1),
      0 0 calc(var(--particle-size) * 2.8) rgba(181, 213, 255, 0.88),
      0 0 calc(var(--particle-size) * 5) rgba(143, 191, 255, 0.38);
    opacity: 0;
    filter: brightness(1.08);
    transform: translate3d(0, 28px, 0) scale(0.25);
    animation: lightDotRise-up var(--particle-duration) ease-in-out var(--particle-delay) infinite;
    will-change: transform, opacity;

    &::before {
      content: '';
      position: absolute;
      top: 50%;
      left: 50%;
      width: calc(var(--particle-size) * 5.8);
      height: calc(var(--particle-size) * 5.8);
      border-radius: var(--ui-radius-circle);
      background: radial-gradient(
        circle,
        rgba(255, 255, 255, 0.9) 0%,
        rgba(235, 245, 255, 0.72) 24%,
        rgba(159, 201, 255, 0.3) 50%,
        rgba(133, 185, 255, 0) 76%
      );
      filter: blur(calc(var(--particle-size) * 0.34));
      transform: translate(-50%, -50%);
      animation: lightDotRise-glow 2.2s ease-in-out var(--particle-delay) infinite alternate;
    }
  }
}

@media (prefers-reduced-motion: reduce) {
  .lightDotRise .lightDotRise-item {
    animation: none;
    opacity: 0.55;
    transform: none;

    &::before {
      animation: none;
    }
  }
}

@keyframes lightDotRise-glow {
  from {
    opacity: 0.7;
    transform: translate(-50%, -50%) scale(0.9);
  }

  to {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1.08);
  }
}

@keyframes lightDotRise-up {
  0% {
    opacity: 0;
    transform: translate3d(0, 28px, 0) scale(0.25);
  }

  18% {
    opacity: 0.9;
  }

  68% {
    opacity: 0.58;
  }

  100% {
    opacity: 0;
    transform: translate3d(var(--particle-drift), var(--particle-rise), 0) scale(1.15);
  }
}
</style>
