<template>
 <Drawer title="搜索" placement="bottom" height="90dvh" :closable="true" v-model="show">
  <Form class="drawerBox" label-position="top" :model="pageSearch">
    <FormItemBox :label="item.label"  v-for="item in data" :key="item.prop">
      <UiFormItem  :row="pageSearch"   :title="item.label" v-bind="{
        ...item,
        width:'100%'
      }"/>
    </FormItemBox>
  </Form>
  <div class="demo-drawer-footer">
    <Button style="margin-right: 8px" @click="reset">重置</Button>
    <Button type="primary" @click="search">搜索</Button>
  </div>
  </Drawer>
</template>
<script setup>
import { ref } from 'vue'
const props = defineProps({
  data:{
    type:Array,
    default:()=>{
      return []
    }
  },
  pageSearch:{
    type:Object,
    default:()=>{
      return {}
    }
  },
})
const show=ref(false)
const emit = defineEmits(['search','update:pageSearch'])
const reset=()=>{
  emit('update:pageSearch', {})
  show.value=false
  emit('search')
}
const search=()=>{
  show.value=false
  emit('search')
}
const open=()=>{
  show.value=true
}
defineExpose({
  open
})

</script>
<style lang="less" scoped>
.drawerBox{
  padding-bottom:58px;
}
.demo-drawer-footer{
  width: 100%;
  position: fixed;
  bottom: 0;
  left: 0;
  border-top: 1px solid #e8e8e8;
  padding: 10px 16px 16px;
  background: var(--ui-color-surface);
  display: flex;
  >*{
    flex: 1;
    overflow: hidden;
  }
}
</style>
