<template>
  <div class="pageTitle" :class="{
    isBlack:isBlack,
  }" v-if="title">
    <div class="title">
      <div class="hot hot-left">
        <div>
          <span :style="{
            opacity:num*opacity,
          }" v-for="num in titleNum"></span>
        </div>
        <div>
         <span :style="{
            opacity:num*opacity,
          }" v-for="num in titleNum"></span>
        </div>
      </div>
      <h1>{{title}}</h1>
      <div class="hot hot-right">
        <div>
          <span :style="{
            opacity:0.8- num*opacity,
          }" v-for="num in titleNum"></span>
        </div>
        <div>
          <span :style="{
            opacity:0.8- num*opacity,
          }" v-for="num in titleNum"></span>
        </div>
      </div>
    </div>
    <slot name="subtitle" v-if="$slots.subtitle"></slot>
    <p class="subtitle" v-else-if="subtitle">{{ subtitle }}</p>
  </div>
</template>

<script setup lang="ts">
const props = defineProps({
  title: {
    type: String,
  },
  subtitle: {
    type: String,
  },
  isBlack: {
    type: Boolean,
    default: false,
  },
})
const titleNum=5
const opacity=0.1
</script>

<style scoped lang="less">
.pageTitle {
  text-align: center;
  .title{
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--primary-color);
    > *{
      &:not(:last-child){
        margin-right:8px;
      }
    }
    h1{
      font-size: 36px;
    }
    .hot{
      div{
        display: flex;
        align-items: center;
        justify-content: center;
        &:not(:last-child){
          margin-bottom:2px;
        }
        span{
          &:not(:last-child){
            margin-right:2px;
          }
          display: inline-block;
          width:var(--ui-size-6);
          height:var(--ui-size-6);
          background: var(--ui-color-primary);
          border-radius:var(--ui-radius-2xl);
        }
      }

    }
  }
  .subtitle{
    font-size: 16px;
    color: var(--ui-color-text);
    margin-top: 8px;
  }
  &.isBlack{
    .title{
      color: var(--ui-color-text-inverse);
    }
    .subtitle{
      color: var(--ui-color-text-inverse);
      opacity: 0.8
    }
    .hot{
      div{
        span{
          background: var(--ui-color-surface);
        }
      }
    }
  }
}

@media screen and (max-width: 768px) {
  .pageTitle {
    .title h1 {
      font-size: 26px;
    }
    .title .hot div span {
      width: var(--ui-size-4);
      height: var(--ui-size-4);
    }
    .subtitle {
      font-size: 14px;
      margin-top: 6px;
    }
  }
}
</style>
