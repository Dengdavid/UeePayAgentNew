<template>
  <div class="page-box-cell" :class="{
    isFull:isFull
  }">
    <slot></slot>
  </div>
</template>

<script setup>
import { ref } from 'vue'
const props = defineProps({
  isFull:{
    type:Boolean,
    default:false,
  }
})
</script>
<style lang="less" scoped>
.page-box-cell{
  padding: var(--ui-padding-16);
  background-color: var(--ui-color-surface);
  border-radius: var(--ui-radius-sm);
  position: relative;
  overflow: hidden;
  &.isFull{
    flex: 1;
  }
  &:not(:last-child){
    margin-bottom: 10px;
  }
}
</style>
