<template>
  <div class="form-table list-b-12" v-if="table">
     <div class="form-table-header" v-if="table.searchThead?.length>0 || title || (!table?.notRefresh)">
        <div class="form-table-left">
          <h3 v-if="title" class="title">{{ title }}</h3>
          <template v-for="item in table.searchThead">
            <FormItemType :data="searchData.search || {}" :item="item" @on-change="getData"/>
          </template>
          <div class="" v-if="$slots.headerLeft">
            <slot name="headerLeft"></slot>
          </div>
        </div>
        <div class="form-table-right list-r-8">
          <slot name="headerRight"></slot>
          <Button type="default" icon="md-refresh" @click="getData" v-if="!table?.notRefresh">
            <span>刷新</span>
          </Button>
        </div>
      </div>
      <div class="form-table-body">
        <Table :loading="table.loading || loading" ref="table" size="default" :columns="c_thead" :data="table.tbody || tbody" :key="table.key || 'id'" v-bind="$attrs"  @on-expand="onExpand" @on-selection-change="onSelectionChange">
          <template #expand="{row, index}">
            <slot name="expand" :row="row" :index="index"/>
          </template>
          <template v-for="(_, name) in $slots" :key="name" #[name]="{ row, index }">
            <slot :name="name" :row="row" :index="index"/>
          </template>
          <template v-for="item in slotArr" :key="item.key" #[item.key]="{ row, index }">
            <ColumnsItemType :data="item"  :row="row" :index="index" @search="search"/>
          </template>
          <template v-if="table.action?.length>0" #action="{ row, index }">
            <template v-for="(item,index) in table.action">
              <Divider type="vertical" v-if="index!=0" />
              <Button type="text" size="default" @click="item.onClick?.(row, index)" :style="getText(item, row)"
              :disabled="getDisabled(item, row)" v-if="!getHidden(item, row)">{{ typeof item.title==='function'?item.title(row):item.title }}</Button>
            </template>
          </template>
        </Table>
      </div>
      <div class="form-table-footer" v-if="!table?.notPage">
        <Page
          :model-value="searchData.page.current"
          :page-size-opts="[10, 20, 30, 40, 100]"
          :page-size="searchData.page.size"
          :total="table.total || searchData.total"
          show-total
          show-elevator
          show-sizer
          @on-change="handleChangePage"
          @on-page-size-change="handleChangePageSize"
      />
    </div>
  </div>
</template>

<script setup>
import ColumnsItemType from './ColumnsItemType.vue'
import FormItemType from './FormItemType.vue'
import { getApi,postApi } from '@/utils/api.js'
import { Button } from 'view-ui-plus'
import { computed, getCurrentInstance, ref,onMounted,reactive } from 'vue'
const { proxy } = getCurrentInstance()
const props = defineProps({
  table: {
    type: Object,
  },
  title:{
    type:String
  }
})
const loading=ref(false)
const tbody=ref([])
const searchData=reactive({
  search:props.table?.search || {},
  page:{
    limit: 10,
    page: 1,
  },
  total:0,
})
// 切换页码
const handleChangePage=(page)=>{
  searchData.page.page=page
  getData()
}
// 切换每页条数
const handleChangePageSize=(limit)=>{
  searchData.page.page=1
  searchData.page.limit=limit
  getData()
}
const slotArr=ref([])
const c_thead=computed(()=>{
  slotArr.value=[]
  if(props.table.thead?.length==0){
    return []
  }
  const slots=Object.keys(proxy.$slots)
  let theads=[]
  theads= props.table.thead?.map((item)=>{
    const slot=slots.includes(item.key) || item.type?item.key:undefined
    if(item.type){
      slotArr.value.push(item)
    }
    return {
      ...item,
      title:item.title,
      key:item.key,
      align:item.align,
      width:item.width,
      fixed:item.fixed,
      tooltip:true,
      slot:slot,
    }
  })
  if(!!proxy.$slots.expand){
    theads.unshift({
      type: 'expand',
      width: 50,
      slot: 'expand',
      render: (h, { row, index }) => {
          return h('div', {class:'expandBox'}, proxy.$slots.expand({row, index}))
      }
    })
  }
  if(props.table.selections){
    theads.unshift({
      type: 'selection',
      align:'center',
      width: 60,
    })
  }
  if(props.table.action?.length>0){
    theads.push({
      title:'操作',
      key:'action',
      slot:'action',
      align:'center',
      fixed:'right',
      width:props.table.actionWidth || 80,
    })
  }
  return theads
})
const search=()=>{
  getData()
}
const emits = defineEmits(['search','on-expand','on-selection-change'])
const getData=()=>{
  if(props.table?.api){
    loading.value=true
    postApi(props.table.api,{
      ...searchData.page,
      ...searchData.search,
    }).then((res) => {
      if(props.table?.tbody){
        props.table.tbody =res.data
      }
      tbody.value = res.data
      searchData.total=res.total
    }).finally(()=>{
      loading.value=false
    })
  }else{
    emits('search',{
      ...searchData.page,
      ...searchData.search,
    })
  }
}
const reload=()=>{
  searchData.page.page=1
  getData()
}
const setTableSearch=(search)=>{
  searchData.search=search
  reload()
}
onMounted(()=>{
  reload()
})

//操作字色
const getText = (item, row) => {
  if(getDisabled(item, row)) return {}
  const colorMap = {
    'primary': 'var(--ui-color-primary) !important',
    'success': 'var(--ui-color-success) !important',
    'warning': 'var(--ui-color-warning) !important',
    'error': 'var(--ui-color-error) !important',
    'dot': 'var(--ui-color-notice) !important',
    'grey': 'var(--ui-color-text-muted) !important',
    'text': 'var(--ui-color-text) !important',
  }
  return { color: colorMap[item.type || ''] }
}
const onExpand=(row, status)=>{
  emits('on-expand',row, status)
}
const onSelectionChange=(selection)=>{
  if(props.table.selections){
    props.table.selections=selection
  }
  emits('on-selection-change',selection)
}
//禁用
const getDisabled = (item, row) => {
  if(typeof item.disabled === 'function') {
    return item.disabled(row)
  }
  return !!item.disabled
}

//隐藏
const getHidden = (item, row) => {
  if(typeof item.hidden === 'function') {
    return item.hidden(row)
  }
  return !!item.hidden
}
defineExpose({
  reload,
  setTableSearch
});
</script>
<style lang="less" scoped>
.form-table{
  :deep(.expandBox){
    margin: -20px -50px;
    padding:var(--ui-padding-8);
    background: #f0f4f9;
  }
  .form-table-header{
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 8px;
    .form-table-left{
      flex: 1;
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
      gap: 8px;
    }
    .title{
      font-size: 16px;
        font-weight: bold;
        position: relative;
        padding-left: 10px;
        &:after {
          content: '';
          position: absolute;
          left: 0;
          top: 50%;
          transform: translate(0, -50%);
          height: var(--ui-size-16);
          width: var(--ui-size-3);
          border-radius: var(--ui-radius-xl);
          background: var(--primary-color);
        }
    }
  }
  .form-table-footer{
    display: flex;
    justify-content: center;
    align-items: center;
  }
  :deep(.ivu-btn){
    display: inline-flex;
    align-items: center;
    > span{
      display: inline-flex;
      align-items: center;
      > *{
        &:not(:last-child){
          margin-right: 4px;
        }
      }
    }
  }
  .form-table-list{
    .form-table-list-item{
      border: var(--ui-border-muted);
      border-radius: var(--ui-radius-sm);
      margin-bottom: 8px;
      >*{
        &:not(:last-child){
          border-bottom: 1px solid #e8eaec;
        }
      }
      .form-table-list-center{
        padding: var(--ui-padding-8);
        dl{
          display: flex;
          align-items: start;
          margin-bottom: 4px;
          dt{
            width: var(--ui-size-80);
            color: var(--ui-color-text-secondary);
            margin-right: 8px;
          }
          dd{
            flex: 1;
            overflow: hidden;
          }
        }
      }
      .form-table-list-bd,.form-table-list-hd{
        display: flex;
        background: var(--ui-color-page);
        line-height:28px;
      }
      .form-table-list-hd{
        padding:var(--ui-padding-8);
        align-items: center;
        justify-content: space-between;
        .title{
          flex: 1;
          font-weight: bold;
        }
      }
      .form-table-list-bd{
        >*{
          flex: 1;
          overflow: hidden;
          padding: var(--ui-padding-4-8);
          text-align: center;
          &:not(:last-child){
            border-right: 1px solid #e8eaec;
          }
        }
      }
    }
  }
}
</style>
