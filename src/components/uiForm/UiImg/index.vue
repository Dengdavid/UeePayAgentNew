<template>
  <div class="UiImg" :style="{
    width: size(width),
    height: size(height, width)
  }">
    <Image :src="src" fit="contain" lazy  v-bind="$attrs"  :preview="isRreview" :preview-list="previewUrl?previewUrl:[src]" :style="{ width: '100%', height: '100%' }" @on-load="onLoad">
      <template #error>
        <Icon type="md-image" size="16" color="#ccc"/>
      </template>
      <template #placeholder>
        <Icon type="ios-loading" size='16' class="demo-spin-icon-load"></Icon>
      </template>
      <template #preview>
        <Icon type="ios-eye" size='16' />
      </template>
    </Image>
  </div>
</template>

<script setup>
import { computed, defineProps, getCurrentInstance, ref } from 'vue';
const { proxy } = getCurrentInstance()
const props = defineProps({
  src: {
    type: String,
  },
  previewUrl:{
    type:Array,
  },
  width: {
    type: [Number, String],
  },
  height: {
    type: [Number, String],
  },
})
const size = (number, defaultNumber) => {
  const _number = number ?? defaultNumber;
  if (typeof _number === 'string') {
    return _number;
  }
  return `${_number}px`;
};
const isRreview=ref(false)
const onLoad=()=>{
  isRreview.value=true
}
</script>
<style lang="less" scoped>
.UiImg {
  background: var(--ui-color-surface-neutral);
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  border-radius:var(--ui-radius-3);
  &:not(:hover){
    .ivu-icon-ios-eye{
      display: none;
    }
  }
  .ivu-icon-ios-eye{
    position: absolute;
    top:0;
    right:0;
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(0, 0, 0, 0.5);
    color: var(--ui-color-text-inverse);
  }
  .demo-spin-col .circular {
        width:25px;
        height:25px;
    }
    .demo-spin-icon-load{
        animation: ani-demo-spin var(--ui-loading-spin-duration) var(--ui-ease-linear) infinite;
    }
    @keyframes ani-demo-spin {
        from { transform: rotate(0deg);}
        50%  { transform: rotate(180deg);}
        to   { transform: rotate(360deg);}
    }
    .demo-spin-col{
        height: var(--ui-size-100);
        position: relative;
        border: var(--ui-border-subtle);
    }
}
</style>
