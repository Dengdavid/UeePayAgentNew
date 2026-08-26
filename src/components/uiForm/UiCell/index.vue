<template>
   <div class="ui-cell list-b-16" :class="{
    isBg:isBg
   }">
    <div class="ui-cell-thead" v-if="title">
      <div class="ui-cell-title">
        <h3>{{ title }}</h3>
        <UiTips :data="tips"/>
        <span v-if="$slots.sub || sub">
          <slot name="sub" v-if="$slots.sub"></slot>
          <template v-else>{{ sub }}</template>
        </span>
      </div>
      <div class="ui-cell-btn">
         <slot name="btn"></slot>
      </div>
    </div>
    <div class="ui-cell-box">
      <slot></slot>
      <Spin fix :show="loading"></Spin>
    </div>
   </div>
</template>

<script setup>
const props = defineProps({
  title: {
    type: String,
    default: ''
  },
  sub: {
    type: String,
    default: ''
  },
  tips: {
    type: String,
    default: ''
  },
  isBg: {
    type: Boolean,
    default: false
  },
  loading: {
    type: Boolean,
    default: false
  },
})
</script>

<style scoped lang="less">
.ui-cell{
  &:not(:last-child){
    margin-bottom: 16px;
  }
  &.isBg{
    padding: var(--ui-padding-16);
    background: #f7faff;
  }
  .ui-cell-thead{
    min-height: 32px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    .ui-cell-title{
      display: flex;
      align-items:baseline;
      gap: 8px;
      h3{
        font-size: 18px;
      }
      sub{
        color: var(--ui-color-text-secondary);
        font-size: 12px;
      }
    }
    .ui-cell-btn{
      display: flex;
      align-items: center;
      gap: 8px;
    }
  }
  .ui-cell-box{
    position: relative;
  }
}
</style>
