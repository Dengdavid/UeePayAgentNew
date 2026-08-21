<template>
  <div class="formList" :class="{
    isBorder: isBorder,
  }"  v-if="data.length>0">
    <div class="formList-item" :style="{
      width: `calc((100% - (${columns} - 1) * ${margin}px) / ${columns})`,
      marginRight: index % columns !== columns - 1 ? `${margin}px` : '0',
      marginBottom: isFootItem(index) ? margin + 'px' : '0',
      borderRadius: `${radius}px`,
    }" :key="rowKey?item[rowKey] || item :index" v-for="(item, index) in data">
      <div class="tag" v-if="$slots.tag">
        <slot name="tag" :item="item" :index="index"></slot>
      </div>
      <div class="hd" :class="{
        isCenter: isCenter,
        isFlex: isFlex,
      }"
      :style="{
        padding: `${padding}px`,
        height: height ? `${height}px` : 'auto'
      }">
        <slot :item="item" :index="index"></slot>
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineProps, getCurrentInstance } from 'vue';
const { proxy } = getCurrentInstance()
const props = defineProps({
  data: {
    type: Array,
    default: () => [],
  },
  rowKey: {
    type: String,
  },
  columns: {
    type: Number,
    default:3,
  },
  margin: {
    type: Number,
    default:16,
  },
  radius: {
    type: Number,
    default: 2,
  },
  padding: {
    type: Number,
    default:8,
  },
  //内容高度
  height: {
    type: Number,
  },
  //是否有边框
  isBorder: {
    type: Boolean,
    default:false,
  },
  //是否内容居中
  isCenter: {
    type: Boolean,
    default:false,
  },
  //是否内容居中
  isFlex: {
    type: Boolean,
    default: false,
  },
})
const isFootItem = (index) => {
  const rowCount= Math.ceil(props.data.length / props.columns)
  return index < (rowCount-1) * props.columns
}
</script>
<style lang="less" scoped>
  .formList{
    display: flex;
    flex-wrap: wrap;
    overflow: hidden;
    .formList-item{
      cursor: pointer;
      box-sizing: border-box;
      position: relative;
      overflow: hidden;
      .tag {
          position: absolute;
          left: 0;
          top: 0;
          z-index: 1;
          background: rgba(0, 0, 0, 0.7);
          color: var(--ui-color-text-inverse);
          font-size: 10px;
          padding: 2px 4px;
          border-radius: 0 0 4px 0;
      }
    }
    &.isBorder{
      .formList-item{
        border: var(--ui-border-subtle);
        &:hover{
          border-color: var(--ui-color-primary);
          .tag{
            background: var(--ui-color-primary);
          }
        }
      }
    }
    .isFlex,.isCenter{
      display: flex;
      gap:8px;
    }
    .isFlex{
      align-items: start;
    }
    .isCenter{
      align-items: center;
        justify-content: center;
        flex-direction: column;
    }
  }
</style>
