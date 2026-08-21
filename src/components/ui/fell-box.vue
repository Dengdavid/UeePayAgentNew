<template>
  <div class="fellBox">
    <div
      :style="{
        marginBottom: `-${setSize(padding)}`,
      }"
      v-if="data?.length > 0"
    >
      <Row
        :gutter="padding"
        :style="{
          marginBottom: setSize(padding),
        }"
        v-for="arr in chunkArray(data, list)"
      >
        <Col :span="24 / list" v-for="item in arr">
          <slot :row="item" />
        </Col>
      </Row>
    </div>
    <EmptyBox v-else></EmptyBox>
  </div>
</template>

<script setup>
import { defineProps, computed } from 'vue'
import { setSize, EmptyBox } from '@/utils/plugin.js'

const props = defineProps({
  data: {
    type: Array,
    default: [],
  },
  list: {
    type: Number,
    default: 1,
  },
  padding: {
    type: [Number, String],
    default: 8,
  },
  isLink: {
    type: Boolean,
    default: false,
  },
})
const chunkArray = (arr, size = 1) =>
  Array.from({ length: Math.ceil(arr.length / size) }, (_, index) =>
    arr.slice(index * size, index * size + size)
  )
</script>

<style scoped lang="less">
.fellBox {
  overflow: hidden;
  .ivu-col {
    display: flex;
    > * {
      flex: 1;
    }
  }
}
</style>
