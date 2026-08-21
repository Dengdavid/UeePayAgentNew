<template>
  <Tooltip v-if="data" placement="top" :content="data">
    <Icon custom="iconfont icon-question" class="ui-text-grey"></Icon>
  </Tooltip>
</template>

<script setup>
const props = defineProps({
  data:{
    type:String,
  },
})
</script>
<style lang="less" scoped>
.IconBox{
  display: inline-flex;
  align-items: center;
  justify-content: center;
  .iconfont,
  .ivu-icon{
    font-size: 18px;
  }
}
</style>
