<template>
  <div class="ui-card-box">
    <div class="ui-card-box-title" v-if="title || $slots.title || $slots.titleRight">
      <div class="flexAuto">
        <slot name="title" v-if="$slots.title"></slot>
        <UiBreadCrumb :title="title" v-else-if="isBack"></UiBreadCrumb>
        <h3 :title="title" v-else-if="title">{{ title }}</h3>
        <slot name="titleLeft"></slot>
      </div>
      <div class="ui-card-box-title-right">
        <slot name="titleRight"></slot>
      </div>
    </div>
    <LoadingBox v-if="loading"/>
    <slot v-else></slot>
  </div>
</template>

<script setup>
import { defineProps } from 'vue'
import UiBreadCrumb from '@/components/ui/bread-crumb.vue'
const props = defineProps({
  title: {
    type: String,
    default: '',
  },
  titleStyle: {
    type: String,
    default: '',
  },
  isBack: {
    type: Boolean,
    default: false,
  },
  loading: {
    type: Boolean,
    default: false,
  },
})
const goBack = () => {
  router.go(-1)
}
</script>

<style scoped lang="less">
.ui-card-box {
  padding: var(--ui-card-padding);
  background-color: var(--ui-card-background);
}

.ui-card-box-title {
  display: flex;
  align-items: center;
  margin-bottom: var(--ui-card-gap);
  line-height: var(--ui-line-height-2xl);
  .flexAuto{
    display: flex;
    align-items: center;
    min-width: 0;
    gap: var(--ui-space-10);
    h3 {
      min-width: 0;
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
    }
  }
}
.flexAuto {
  flex: 1;
  min-width: 0;
}
.ui-card-box-title-right {
  flex-shrink: 0;
}
.ui-card-box-line {
  margin: 0 calc(0px - var(--ui-card-padding)) var(--ui-card-gap);
  padding: 0 var(--ui-card-padding) var(--ui-card-gap);
  border-bottom: var(--ui-border-divider);
}

.ui-card-box-line:before {
  display: none;
}
</style>
