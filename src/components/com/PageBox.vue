<template>
  <div class="page-box">
    <div  :class="{
      isBg:isBg,
      isFull:isFull
    }">
       <slot></slot>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
const props = defineProps({
  isBg:{
    type:Boolean,
    default:false
  },
  isFull:{
    type:Boolean,
    default:false
  }
})
</script>
<style lang="less" scoped>
.page-box{
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  padding: var(--ui-padding-10);
  overflow-x: hidden;
  display: flex;
  flex-direction: column;
  gap: 10px;
  .isBg{
    background-color: var(--ui-color-surface);
    border-radius: var(--ui-radius-lg);
    padding:var(--ui-padding-16);
    &.isFull{
      flex: 1;
    }
  }
}
</style>
