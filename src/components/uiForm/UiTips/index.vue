<template>
   <Tooltip placement="right" class="tip-icon" v-if="data">
      <Icon custom="iconfont icon-question"></Icon>
      <template #content>
        <div v-html="data"></div>
      </template>
    </Tooltip>
</template>

<script setup>
const props = defineProps({
  data: {
    type: String,
    default: ''
  },
})
</script>

<style scoped lang="less">
.tip-icon{
  .icon-question{
    color: var(--ui-color-text-secondary);
    font-size: 14px;
    cursor: pointer;
    &:hover{
      color: var(--primary-color);
    }
  }
}
</style>
