<template>
  <div class="listAddBox">
    <FormListBox :list="3" :minWidth="150" :gap="12" v-bind="$attrs">
      <div class="listAddBox-item" :style="{
        minHeight:typeof height==='number'?height+'px':height
      }" v-for="item in datas" @click="onClick(item)">
          <div class="header" v-if="$slots.header">
            <h3>
                <slot name="header" :row="item"/>
            </h3>
            <div class="tag" v-if="$slots.tag">
              <slot name="tag" :row="item"/>
            </div>
          </div>
          <div class="tag full" v-else-if="$slots.tag">
              <slot name="tag" :row="item"/>
            </div>
          <div class="main">
            <div class="left" v-if="$slots.icon">
              <slot name="icon" :row="item"/>
            </div>
            <div class="right">
              <slot :row="item"/>
            </div>
          </div>
          <div class="footer" v-if="actions?.length>0 || $slots.footer">
            <slot name="footer" :row="item"/>
            <Button v-for="action in actions" :type="action.type || 'default'" size="small" :key="action.title" @click.stop="action.onClick(item)">
              <span>{{ typeof action.title==='function'?action.title(item):action.title }}</span>
            </Button>
          </div>
      </div>
      <div class="listAddBox-item add"  :style="{
        minHeight:typeof height==='number'?height+'px':height
      }" @click="addBtn">
          <Icon type="ios-add" :size="32"/>
          <p>{{ addText }}</p>
      </div>
    </FormListBox>
  </div>
</template>

<script setup>
import { Button } from 'view-ui-plus'

const props = defineProps({
  datas:{
    type:Array,
    default:()=>[]
  },
  addText:{
    type:String,
    default:'添加'
  },
  actions:{
    type:Array,
    default:()=>[]
  },
  height:{
    type:[String,Number],
    default:120
  }
})
const getStyle = (item) => {
  const colorMap = {
    'primary': 'var(--ui-color-primary)',
    'success': 'var(--ui-color-success)',
    'warning': 'var(--ui-color-warning)',
    'error': 'var(--ui-color-error)',
    'dot': 'var(--ui-color-notice)',
    'grey': 'var(--ui-color-text-muted)',
    'text': 'var(--ui-color-text)',
  }
  return {
    color: colorMap[item.type || ''] || ''
  }
}
const emit=defineEmits(['add'])
const onClick=(row)=>{
  emit('click',row)
}
const addBtn=()=>{
  emit('add')
}
</script>

<style lang="less" scoped>
.listAddBox{
  .listAddBox-item{
    border: var(--ui-border-subtle);
    border-radius: var(--ui-radius-sm);
    cursor: pointer;
    transition: all .2s;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    background: #fcfcfc;
    position: relative;
    box-shadow: var(--ui-shadow-surface);
    .header{
      background: var(--ui-color-surface);
      padding:6px 4px 6px 12px;
      border-bottom: 1px #eee solid;
      display: flex;
      justify-content: space-between;
      align-items: center;
      backdrop-filter: blur(10px);
      & + .main{
        border-top: 1px solid #fff;
      }
      h3{
        flex: 1;
        -webkit-line-clamp: 1; /* 限制文本显示的行数为2行 */
        -webkit-box-orient: vertical; /* 设置盒模型布局方向为垂直 */
        display: -webkit-box; /* 使用旧版WebKit内核布局盒模型 */
        overflow: hidden; /* 超出部分隐藏 */
        text-overflow: ellipsis; /* 使用省略号表示被截断的部分 */
      }
      gap:4px;
    }
    .tag{
      &.full{
        position: absolute;
        top:0;
        right:0;
        :deep(.ivu-tag){
          border: none;
          border-radius: 0;
          margin: 0;
          border-bottom-left-radius: 4px;
          border-top-right-radius: 4px;
        }
      }
    }
    .footer{
      display: flex;
      justify-content: end;
      gap: 6px;
      padding:var(--ui-padding-8);
      .footer-btn{
        flex: 1;
        text-align: center;
        padding:var(--ui-padding-4-6);
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        line-height: 28px;
        &:not(:last-child){
          border-right: 1px solid #eee;
        }
        &:hover{
          background: var(--primary-color);
          span{
            color:var(--ui-color-text-inverse) !important;
          }
        }
      }
    }
    :deep(.main){
      flex: 1;
      padding: var(--ui-padding-12);
      display: flex;
      gap:8px;
      .left{
        line-height: 32px;
      }
      .right{
        flex: 1;
      }
      .title{
        display: flex;
        align-items: center;
        gap:4px;
        line-height: 32px;
        h3{
          flex: 1;
          overflow: hidden;
        }
      }
      .text{
        display: flex;
        flex-direction: column;
        gap: 4px;
        color: var(--ui-color-text-secondary);
        dl{
          display: flex;
          gap:4px;
          dd{
            flex: 1;
            overflow: hidden;
          }
        }
      }
    }
    &:hover{
      box-shadow: var(--ui-shadow-list-card-hover);
    }
    &.add{
      padding:var(--ui-padding-12);
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--ui-color-text-secondary);
      flex-direction: column;
      background: linear-gradient(0deg, #fff 70%, #fcfdff 100%);
      p{
        font-size: 12px;
      }
      &:hover{
        background: #f3f7ff;
        color: var(--primary-color);
        border-color: var(--primary-color);
      }
    }
  }
}
</style>
