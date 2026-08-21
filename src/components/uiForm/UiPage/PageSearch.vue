<template>
  <Form :model="pageSearch" inline class="searchFrom list-r-8" v-if="data?.length>0" ref="searchRef" @keyup.enter="search">
    <div :style="{width:typeof item.width==='number'?item.width+'px':item.width ?? '160px'}" v-for="item in data" :key="item.prop">
      <UiFormItem  :row="pageSearch"  :title="item.label" v-bind="item" @on-change="search"/>
    </div>
  </Form>
</template>
<script setup>
const props = defineProps({
  data:{
    type: Array,
  },
  pageSearch:{
    type: Object,
    default:()=>{
      return {}
    }
  },
  statusValue:{}
})
const emit = defineEmits(['search'])
const search=()=>{
  emit('search')
}
</script>
<style lang="less" scoped>
.searchFrom{
  flex: 1;
  display: flex;
  flex-wrap: wrap;
  overflow: hidden;
  padding-top: 1px;
  padding-bottom: 1px;
  margin-top: -1px;
  margin-bottom: -1px;
}
</style>
