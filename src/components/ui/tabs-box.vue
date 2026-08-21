<template>
  <Tabs :value="tabValue">
    <TabPane
      :label="item[dataName]"
      :name="index"
      v-for="(item, index) in data"
    >
      <slot :name="`tab${index}`" :row="item"></slot>
    </TabPane>
  </Tabs>
</template>

<script setup>
import { defineProps, ref } from 'vue'

const props = defineProps({
  data: {
    type: Array,
    default: [],
  },
  dataName: {
    type: String,
    default: 'title',
  },
})
const tabValue = ref(0)
</script>

<style scoped lang="less">
.cellBox {
  --m: 14px;
  &:not(:last-child) {
    margin-bottom: var(--m);
  }
  > * {
    &:not(:last-child) {
      margin-bottom: var(--m);
    }
  }
  .cellBox-thead {
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: var(--ui-size-28);
    h3 {
      font-size: 14px;
    }
    .cellBox-btn {
      display: flex;
      align-items: center;
      > * {
        &:not(:last-child) {
          margin-bottom: 6px;
        }
      }
    }
  }
}
</style>
