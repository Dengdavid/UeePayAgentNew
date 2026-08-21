<template>
  <div class="logoBox" :aria-label="$t('accessibility.returnHome')" @click="handleGoHome">
    <img src="@/assets/images/logo.png" :alt="siteConfig.nameEn" />
  </div>
</template>

<script setup>
import { siteConfig } from '@/config/site.js'
import { toRoute } from '@/utils/route.js'

const handleGoHome = function() {
  toRoute('home')
}
</script>

<style scoped lang="less">
.logoBox {
  width: fit-content;
  position: relative;
  padding: 0;
  overflow: hidden;
  border: 0;
  background: transparent;
  cursor: pointer;
  isolation: isolate;

  img {
    display: block;
    max-width: 100%;
    max-height: 100%;
  }

  &::after {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(
        108deg,
        rgba(255, 255, 255, 0) 18%,
        rgba(255, 255, 255, 0.16) 34%,
        rgba(255, 255, 255, 0.82) 50%,
        rgba(255, 255, 255, 0.2) 66%,
        rgba(255, 255, 255, 0) 82%
      )
      no-repeat;
    background-position: -120% 0;
    background-size: 52% 100%;
    -webkit-mask: url('@/assets/images/logo.png') center / contain no-repeat;
    mask: url('@/assets/images/logo.png') center / contain no-repeat;
    mix-blend-mode: screen;
    pointer-events: none;
    opacity: 0;
    animation: logo-highlight-sweep 6.2s linear 0.8s infinite;
  }
}

@media (prefers-reduced-motion: reduce) {
  .logoBox::after {
    display: none;
    animation: none;
  }
}

@keyframes logo-highlight-sweep {
  0%,
  60% {
    background-position: -120% 0;
    opacity: 0;
  }

  64% {
    background-position: -60% 0;
    opacity: 0.82;
  }

  82% {
    background-position: 210% 0;
    opacity: 0.82;
  }

  86%,
  100% {
    background-position: 270% 0;
    opacity: 0;
  }
}
</style>
