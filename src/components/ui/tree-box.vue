<template>
  <div class="treeBox">
    <ul>
      <li
        :key="item[valueName] || index"
        :class="{
          on: on == item[valueName],
        }"
        v-for="(item, index) in data"
        @click="onClick(item, index)"
      >
        {{ item[labelName] }}
      </li>
    </ul>
  </div>
</template>

<script setup>
import { defineProps, ref } from 'vue'

const props = defineProps({
  data: {
    type: Array,
    default: [],
  },
  labelName: {
    type: String,
    default: 'label',
  },
  valueName: {
    type: String,
    default: 'value',
  },
  on: {
    type: [String, Number],
  },
})
const emits = defineEmits(['update:on', 'onClick'])
const onClick = (row, index) => {
  emits('onClick', row, index)
}
</script>

<style scoped lang="less">
.treeBox {
  width: 100%;
  ul {
    > * {
      line-height: 40px;
      padding: var(--ui-padding-0-16);
      position: relative;
      background: no-repeat center center;
      background-size: 0% 0%; /* 初始背景大小 */
      transition:
        background-size var(--ui-motion-enter) var(--ui-ease-soft),
        background-color var(--ui-motion-enter) var(--ui-ease-soft);
      cursor: pointer;
      &:not(:last-child) {
        margin-bottom: 1px;
      }
      &:hover {
        background: #f0f4fe;
        background-size: 100% 100%; /* 背景填充至整个元素 */
      }
      &.on {
        font-weight: bold;
        color: var(--ui-color-primary);
        background: #f0f4fe;
        &::after {
          content: '';
          position: absolute;
          left: 0;
          top: 0;
          bottom: 0;
          width: var(--ui-size-3);
          background: var(--ui-color-primary);
        }
      }
    }
  }
}
</style>
