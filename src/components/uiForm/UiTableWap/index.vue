<template>
  <div class="ui-table-wap list-b-12">
    <div class="ui-table-wap-item" v-for="(item,rowIndex) in tbody" :key="getRowKey(item,rowIndex)" @click.stop="handleSelect(item,rowIndex)">
      <div class="ui-table-wap-item-header" v-if="columns.title">
        <div class="title">
          <slot v-if="$slots[columns.title]" :name="columns.title" :row="item" :index="rowIndex" />
          <h3 v-else>{{ item[columns.title] }}</h3>
        </div>
        <div class="status" v-if="columns.status">
          <Tag :color="columns.statusOptions?.[item?.[columns.status]]?.type">
            {{ columns.statusOptions?.[item?.[columns.status]]?.label ?? item?.[columns.status] }}
          </Tag>
        </div>
      </div>
      <div
        class="ui-table-wap-item-content"
        :style="{
          '--ui-table-wap-label-max-width': Math.max(labelWidth, labelMaxWidth) + 'px'
        }"
      >
        <dl v-for="(row,columnIndex) in columns.rowList" :key="columnIndex">
          <dt :style="{
            minWidth:labelWidth+'px'
          }">{{ row.label }}：</dt>
          <dd v-if="$slots[row.prop || row.key]" :style="row.style?.(item)">
            <slot :name="row.prop || row.key" :row="item" :index="rowIndex" />
          </dd>
          <dd v-else class="field-value" :class="{ editable: typeof row.click === 'function' }" :style="row.style?.(item)">
            <span v-if="typeof row.value==='function' && row.html === true" v-html="row.value(item)"></span>
            <span v-else-if="typeof row.value==='function'">{{ row.value(item) }}</span>
            <span v-else>{{ itemValue(row,item) }}</span>
            <button
              v-if="typeof row.click === 'function'"
              type="button"
              class="edit-button"
              :aria-label="$t('button.editField', { field: row.label })"
              @click.stop="row.click(item)"
            >
              <Icon custom="iconfont icon-edit" color="var(--ui-color-text-muted)" :size="14" />
            </button>
          </dd>
        </dl>
      </div>
      <div  class="ui-table-wap-item-footer" v-if="c_actions(item)?.length>0 && !isSelect">
        <Button type="text" :class="c_fun(item,action,'class')" :style="c_fun(item,action,'style')" :disabled="c_fun(item,action,'disabled')" :loading="item.loading  && loadingLabel===c_fun(item,action,'label')" :icon="action.icon" v-for="(action,index) in visibleActions(item)" :key="action.key || index" @click.stop="onClick(action,item,index)">
          {{ c_fun(item,action,'label') }}
        </Button>
        <Dropdown
          v-if="overflowActions(item).length"
          class="footer-more"
          placement="bottom-end"
          trigger="click"
          transfer
          :capture="true"
          @click.stop
        >
          <Button type="text" class="more-button">
            <span>{{ $t('button.more') }}</span>
            <Icon type="ios-arrow-down" />
          </Button>
          <template #list>
            <DropdownMenu class="ui-table-action-menu">
              <DropdownItem
                v-for="(action,index) in overflowActions(item)"
                :key="action.key || index"
                :disabled="c_fun(item,action,'disabled')"
                :class="c_fun(item,action,'class')"
                :style="c_fun(item,action,'style')"
                @click.stop="onClick(action,item,index + 2)"
              >
                {{ c_fun(item,action,'label') }}
              </DropdownItem>
            </DropdownMenu>
          </template>
        </Dropdown>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
const props = defineProps({
  thead:{
    type: Array,
    default: ()=>[],
  },
  tbody:{
    type: Array,
    default: ()=>[],
  },
  buttonLoading:{
    type:Boolean,
    default: false,
  },
  actions:{
    type: Array,
    default: ()=>[],
  },
  labelWidth:{
    type: Number,
    default:60,
  },
  labelMaxWidth:{
    type: Number,
    default:120,
  },
  title:{
    type: String,
  },
  loading:{
    type: Boolean,
    default: false,
  },
  isSelect:{
    type: Boolean,
    default: false,
  },
  rowKey:{
    type: [String, Function],
    default: 'id',
  }
})
const loadingLabel=ref('')
const c_fun=(row,data,key)=>{
  return typeof data?.[key]==='function'?data?.[key]?.(row):data?.[key]
}
const itemValue=(item,row)=>{
  const value=row?.[item?.prop] || row?.[item?.prop]===0 ?row?.[item?.prop]: '--'
  if(item?.unit){
    if(['$'].includes(item?.unit)){
      return `${item?.unit} ${value}`
    }
    return `${value} ${item?.unit}`
  }
  return value
}
const c_actions=(row)=>{
  return props.actions.filter(action=>{
    if(typeof action.show==='function'){
      return action.show(row)
    }
    return action.show !== false
  })
}
const visibleActions=(row)=>{
  const actions=c_actions(row)
  return actions.length > 3 ? actions.slice(0,2) : actions
}
const overflowActions=(row)=>{
  const actions=c_actions(row)
  return actions.length > 3 ? actions.slice(2) : []
}
const getRowKey=(row,index)=>{
  if(typeof props.rowKey==='function'){
		return props.rowKey(row,index) ?? index
  }
  const value=props.rowKey?.split('.').reduce((result,key)=>result?.[key],row)
  return value ?? index
}
const onClick=(action,row,index)=>{
  if(typeof action.click==='function'){
    action.loading=true
    loadingLabel.value=c_fun(row,action,'label')
    action.click(row,action,index)
  }
}
const columns=computed(()=>{
  const rowList=[]
  let title=''
  let status=''
  let statusOptions={}
  props.thead.forEach(item=>{
    if(item.wapType==='title'){
      title=item.prop
    }else if(item.wapType==='status'){
      status=item.prop
      statusOptions=item.options || {}
    }else{
      rowList.push(item)
    }
  })
  return {
    title:title,
    status:status,
    statusOptions:statusOptions,
    rowList:rowList
  }
})
const emit=defineEmits(['select'])
const handleSelect=(row,index)=>{
  emit('select',row,index)
}
</script>
<style lang="less" scoped>
.ui-table-wap{
  .ui-table-wap-item{
    border: var(--ui-border-subtle);
    border-radius:var(--ui-radius-sm);
    box-sizing: border-box;
    overflow: hidden;
    >*{
      &:not(:last-child){
        border-bottom:1px solid #eee;
      }
    }
    .ui-table-wap-item-header{
      padding:var(--ui-padding-6-8);
      display: flex;
      align-items: center;
      justify-content: space-between;
      background: #f8f9fa;
      .title{
        h3{
          font-size: 14px;
          font-weight: 600;
        }
      }
      .status{
        font-size: 14px;
        margin-right: -6px;
      }
    }
    .ui-table-wap-item-content{
      display: grid;
      grid-template-columns: fit-content(var(--ui-table-wap-label-max-width)) minmax(0, 1fr);
      column-gap: var(--ui-space-8);
      row-gap: var(--ui-space-4);
      padding: var(--ui-padding-8);
      dl{
        display: contents;
        dt{
          align-self: start;
          color: var(--ui-color-text-secondary);
          font-size: 12px;
          line-height: var(--ui-line-height-md);
          overflow-wrap: anywhere;
          white-space: normal;
        }
        dd{
          min-width: 0;
          color: #141414;
          font-size: 12px;
          overflow: hidden;

          &.field-value {
            display: flex;
            min-width: 0;
            align-items: center;
            gap: 10px;

            > span {
              min-width: 0;
              flex: 1;
              overflow: visible;
              white-space: normal;
              overflow-wrap: anywhere;
            }
          }

          .edit-button {
            display: inline-flex;
            position: relative;
            width: var(--ui-size-16);
            height: var(--ui-size-16);
            flex: none;
            align-items: center;
            justify-content: center;
            margin: 0;
            padding: 0;
            border: 0;
            border-radius: var(--ui-radius-sm);
            background: transparent;
            color: var(--ui-color-text-muted);
            cursor: pointer;

            &::before {
              position: absolute;
              inset: -8px;
              content: '';
            }

            &:active {
              color: var(--primary-color);
            }
          }
        }
      }
    }
    .ui-table-wap-item-footer{
      display: flex;
      background: #f8f9fa;
      >*{
        flex: 1;
        height:var(--ui-size-32);
        line-height:32px;
        border-radius: 0 !important;
        display: flex;
        align-items: center;
        justify-content: center;
        color: var(--ui-color-text);
        &[disabled] {
          color: var(--ui-color-neutral-550) !important;
        }
        &:not(:last-child){
          border-right:1px solid #eee !important;
        }
      }
      :deep(.footer-more .ivu-dropdown-rel){
        width: 100%;
        height: 100%;
      }
      .more-button{
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: var(--ui-space-4);
        color: var(--ui-color-text);
      }
    }
  }
}
:deep(.ivu-btn-text.action-warning:not(:disabled)){
  color: var(--ui-color-warning) !important;
}
:deep(.ivu-btn-text.action-default:not(:disabled)){
  color: var(--ui-color-text-muted) !important;
}
</style>
