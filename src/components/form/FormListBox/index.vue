<template>
  <div class="formList" :class="{
    isText:isText,
    isTop:isTop
  }" ref="listRef" :style="gridStyle">
    <template v-if="data && dataList?.length>0">
      <dl :class="item.span ? `full-${item.span}` : ''" v-for="item in dataList" :key="item.prop">
        <dt :style="{width:labelWidth}">
          <span>{{ item.label }}</span>
        </dt>
        <dd>
          <p>
            <template v-if="item.type">
             <ColumnsItemType :data="item"  :row="data"/>
            </template>
            <template v-else>
              {{ item.value || data[item.prop] || '-' }}
            </template>
          </p>
        </dd>
      </dl>
    </template>
    <slot v-else-if="$slots.default"></slot>
  </div>
</template>

<script setup>
  import { ref, computed,onMounted } from 'vue';
  import { useResizeObserver } from '@vueuse/core';
  import ColumnsItemType from '@/components/form/FormTable/ColumnsItemType.vue';
  const props = defineProps({
    data:{
      type: Object,
    },
    dataList:{
      type: Array,
    },
    list: {
      type: Number,
      default: 3
    },
    gap: {
      type: [Number,String],
      default:8,
    },
    labelWidth: {
      type: [Number,String],
      default: 100
    },
    minWidth: {
      type: Number,
      default: 360
    },
    isText: {
      type: Boolean,
      default: false
    },
    isTop: {
      type: Boolean,
      default: false
    },
    isEdit: {
      type: Boolean,
      default: false
    },
  });
  const listRef = ref(null)
  const dynamicColumns = ref(props.list);
  const gridStyle = computed(() => {
    const {gap,list,data,dataList,minWidth} = props
    const gapStyle = typeof gap === 'number' ? `${gap}px` : gap
    const minList=Math.min(list, dynamicColumns.value)
    return {
      'grid-template-columns': `repeat(${minList}, minmax(${minList>1?`${minWidth}px`:0}, 1fr))`,
      'gap':data && dataList?.length>0 ? '8px' : gapStyle
    }
  });
  const updateColumns = () => {
    if (listRef.value) {
      const containerWidth = listRef.value.offsetWidth;
      dynamicColumns.value = Math.max(1, Math.floor(containerWidth / props.minWidth));
    }
  }
  useResizeObserver(listRef, () => {
    updateColumns();
  });
  const emit = defineEmits(['edit'])
  const handleEdit=(item)=>{
    emit('edit',item)
  }
  onMounted(() => {
    updateColumns()
  })
</script>
<style scoped lang="less">
.loop-full(@i) when (@i <= 10) {
  .full-@{i} {
    grid-column: span @i;
  }
  .loop-full(@i + 1);
}
.formList{
  display: grid;
  :deep(.el-form-item){
    margin-bottom: 0;
  }
  .loop-full(0);
  &.isTop{
    dl{
      flex-direction: column;
      dt{
        width: 100% !important;
      }
      dd{
        margin: 0 !important;
        padding-bottom: 8px;
        border-bottom: 1px solid #f5f5f5;
      }
      &:hover{
        dd{
          // border-bottom-color: var(--el-color-primary);
        }
      }
    }
  }
  dl{
    display: flex;
    width: 100%;
    margin: 0;
    gap: 8px;
    dt{
      color: var(--ui-color-text-secondary);
      display: flex;
      align-items: center;
      gap: 8px;
    }
    dd{
      flex: 1;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .btn{
      cursor: pointer;
      &:hover{
        color: var(--el-color-primary);
      }
    }
  }
  &.isText{
    >.el-form-item{
      margin-bottom: 0;
    }
  }
}
</style>
