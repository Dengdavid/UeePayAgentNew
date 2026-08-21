<template>
  <div class="loading-box">
    <Spin fix>
      <Icon type="ios-loading" size=18 class="demo-spin-icon-load"></Icon>
      <p>{{ text }}</p>
    </Spin>
  </div>
</template>

<script setup>
import { defineProps, ref } from 'vue'
const props = defineProps({
  text: {
    type: String,
    default: 'loading',
  },
})
</script>

<style scoped lang="less">
.loading-box {
  min-height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  p{
    color: var(--ui-color-primary);
    margin-top:6px;
  }
  .demo-spin-icon-load{
    animation: ani-demo-spin var(--ui-loading-spin-duration) var(--ui-ease-linear) infinite;
  }
  @keyframes ani-demo-spin {
    from { transform: rotate(0deg);}
    50%  { transform: rotate(180deg);}
    to   { transform: rotate(360deg);}
  }
}
</style>
