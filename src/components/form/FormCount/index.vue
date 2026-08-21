<template>
  <div class="form_tabs" :class="{
    isCount:isCount
  }" v-if="list?.length>0">
    <dl v-for="item in list">
      <template v-if="isCount">
        <dd>
          <CountUp
            :end="setNumber(data?.[item.key] ?? 0)"
            :decimals="item.decimals || 0"
            :duration="duration"
            :options="{ useGrouping: false }"
            v-font="24"
          />
        </dd>
        <dt>{{ item.title }}</dt>
      </template>
      <template v-else>
        <dt>{{ item.title }}：</dt>
        <dd>
          <template v-if="item.type">
            <ColumnsItemType :data="item" :row="data"/>
          </template>
          <template v-else>{{ data?.[item.key] ?? '-' }}</template>
        </dd>
      </template>
    </dl>
  </div>
</template>

<script setup>
import ColumnsItemType from '@/components/form/FormTable/ColumnsItemType.vue'
const props = defineProps({
  data: {
    type: Object,
    default: '',
  },
  list: {
    type: Array,
    default:[],
  },
  //是否汇总
  isCount: {
    type: Boolean,
    default:false,
  },
  duration:{
    type: Number,
    default: 1,
  }
})
const setNumber=(value)=>{
  // 1. 处理 null, undefined, boolean, object 等非预期类型
  if (value === null || value === undefined || typeof value === 'object' || typeof value === 'boolean') {
    return 0;
  }
  if (typeof value === 'number') {
    return value;
  }
  // 转换为字符串并去除千位符和空白
  let strVal = String(value).replace(/,/g, '').trim();
  // 如果处理后为空字符串，直接返回 0
  if (strVal === '') {
    return 0;
  }
  //尝试转换为数字
  const num = Number(strVal);

  //核心检查：如果转换结果是 NaN (非数字)，则强制返回 0
  // 这能过滤掉 "abc", "12px", "-" 等非法输入
  if (isNaN(num)) {
    return 0;
  }

  // 7. 确保最终返回的是纯数字类型 (number)
  return num;
}
</script>
<style lang="less" scoped>
.form_tabs{
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 8px;
  dl{
    display: flex;
    align-items: center;
    gap: 8px;
    dt{
      color: var(--ui-color-text-secondary);
    }
    dd{
      flex:1;
      overflow: hidden;
      display: flex;
    }
  }
  &.isCount{
    dl{
      align-items: start;
      flex-direction: column;
      padding:var(--ui-padding-12);
      background: var(--ui-color-page);
      gap: 2px;
      dd{
        font-size:20px;
        font-weight: bold;
      }
    }
  }
}
</style>
