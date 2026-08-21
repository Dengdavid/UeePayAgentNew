<template>
  <div class="form-back list-r-10">
    <router-link class="list-r-4" :to="{ name:name,query:query,params:params }">
        <Icon type="ios-arrow-back"/>
        <span>返回</span>
    </router-link>
    <Divider type="vertical" />
    <div class="title">
      <template v-if="$slots.default">
        <slot></slot>
      </template>
      <template v-else>
        <h3>{{ title }}</h3>
      </template>
    </div>

  </div>
</template>

<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue'
const props = defineProps({
  title: {
    type: String,
    default: '',
  },
  name: {
    type: String,
    default: '/',
  },
  query: {
    type: Object,
    default: () => {},
  },
  params: {
    type: Object,
    default: () => {},
  },
})
const handleBack = () => {
}
</script>
<style lang="less" scoped>
.form-back{
    display: flex;
    align-items: center;
    a{
      display: flex;
      align-items: center;
      color: var(--ui-color-text);
      &:hover{
        color: var(--ui-color-info);
      }
    }
    .title{
        margin-left: 12px;
        h3{
          font-size: 18px;
        }
    }
}
</style>
