<template>
   <Tooltip placement="right" class="tip-icon" :max-width="maxWidth" v-if="data">
      <Icon custom="iconfont icon-question"></Icon>
      <template #content>
        <div class="tip-content" v-html="data"></div>
      </template>
    </Tooltip>
</template>

<script setup>
const props = defineProps({
  data: {
    type: String,
    default: ''
  },
  maxWidth: {
    type: [Number, String],
    default: undefined
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

.tip-content{
  line-height: 20px;
  white-space: normal;
  word-break: break-word;
}
</style>
