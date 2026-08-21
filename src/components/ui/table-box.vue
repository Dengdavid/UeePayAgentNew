<template>
  <div class="tableBox" v-if="table">
    <div class="tableBox-main" v-if="table.tbody">
      <template v-if="$slots.default">
        <FellBox :data="table.tbody" :list="list" :margin="margin">
          <template #default="{ row }">
            <slot :row="row" />
          </template>
        </FellBox>
      </template>
      <template v-else-if="table.thead">
        <p>使用表格</p>
      </template>
    </div>
    <div
      class="tableBox-page"
      :style="{
        marginTop: `${setSize(margin)}`,
      }"
      v-if="table.search && table.search.page && table.search.limit"
    >
      <div class="text">
        <span>共计</span>
        <span class="count">{{ table.search?.total || 0 }}</span>
        <span>条</span>
      </div>
      <Page
        v-model="table.search.page"
        :total="table.search?.total || 0"
        :page-size="table.search.limit"
        :page-size-opts="[10, 20, 30, 40]"
        show-elevator
        show-sizer
        prev-text="上一页"
        next-text="下一页"
        @on-change="onChange"
        @on-page-size-change="onSize"
      />
    </div>
  </div>
</template>

<script setup>
import { FellBox, setSize, EmptyBox } from '@/utils/plugin.js'

import { defineProps, ref } from 'vue'

const props = defineProps({
  table: {
    type: Object,
  },
  list: {
    type: Number,
    default: 1,
  },
  margin: {
    type: [Number, String],
    default: 8,
  },
})
const emits = defineEmits(['update:on', 'onClick', 'onSearch'])
const onChange = (row) => {
  onSearch()
}
const onSize = (value) => {
  props.table.search.pageIndex = 1
  props.table.search.pageSize = value
  onSearch()
}
const onSearch = () => {
  emits('onSearch')
}
</script>

<style scoped lang="less">
.tableBox {
  .tableBox-page {
    display: flex;
    align-items: center;
    justify-content: space-between;
    .count {
      margin: var(--ui-margin-0-4);
      color: var(--ui-color-primary);
    }
  }
  .tableBox-main {
    flex: 1;
    overflow: hidden;
  }
}
</style>
