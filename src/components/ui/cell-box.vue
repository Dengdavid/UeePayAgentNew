<template>
  <div class="cellBox">
    <div class="cellBox-thead">
      <h3
        :style="{
          fontSize: setSize(size),
        }"
      >
        {{ title }}
      </h3>
      <div class="cellBox-btn" v-if="$slots.btn">
        <slot name="btn"></slot>
      </div>
    </div>
    <div class="cellBox-main" v-if="$slots.default">
      <slot />
    </div>
  </div>
</template>

<script setup>
import { defineProps } from 'vue'
import { setSize } from '@/utils/unitConversion.js'

const props = defineProps({
  title: {
    type: String,
  },
  size: {
    type: [String, Number],
    default: 14,
  },
})
</script>

<style scoped lang="less">
.cellBox {
  --m: 14px;
  &:not(:last-child) {
    margin-bottom: var(--m);
  }
  > * {
    &:not(:last-child) {
      margin-bottom: var(--m);
    }
  }
  .cellBox-thead {
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: var(--ui-size-28);
    h3 {
      font-size: 14px;
    }
    .cellBox-btn {
      display: flex;
      align-items: center;
      > * {
        &:not(:last-child) {
          margin-bottom: 6px;
        }
      }
    }
  }
}
</style>
