<template>
  <div class="IconBox" :style="{
    width:size+'px',
    height:size+'px',
  }">
    <span class="iconfont" :class="icon" :style="{
      fontSize:size+'px',
    }" v-if="icon?.includes('icon-')"></span>
    <Icon :type="icon || 'ios-apps'" v-else-if="icon?.includes('ios-') || icon?.includes('md-') || icon?.includes('logo-')" :size="size"/>
    <Icon :type="'ios-keypad'" v-else :size="size"/>
  </div>
</template>

<script setup>
const props = defineProps({
  icon:{
    type:String,
  },
  size:{
    type:Number,
    default:18
  }
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
