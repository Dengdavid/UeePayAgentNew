<template>
  <div class="ColumnsItemTypeBox" :class="{
    auto:typeof data.click ==='function',
    nowrap:Boolean(data.options),
  }" :style="typeof data.style==='function' ? data.style(row):data.style">
    <template v-if="['dot'].includes(data.type || data.formType)">
      <UiDot v-model="row[data.prop]" :valueText="row?.[`${data.prop}_text`]" :options="data.options"/>
    </template>
    <template v-else-if="data.value">
      {{typeof data.value==='function' ? data.value(row):data.value}}
    </template>
    <div :class="{
      'not-text':!row?.[data.prop]
    }" v-else>
      {{ row?.[data.prop] || row?.[data.prop]===0?row[data.prop] : '-' }}
    </div>
    <Tooltip  placement="top" :max-width="400" v-if="isTipsShow(row,data)">
      <template #content>
        <div class="TooltipContent">
          {{ typeof data.tips ==='function'? data.tips(row):data.tips }}
        </div>
      </template>
      <span class="iconfont icon-question"></span>
    </Tooltip>
    <div class="btns" v-if="data.click" >
      <span class="iconfont icon-edit"  @click="data.click(row)"></span>
    </div>
  </div>
</template>

<script setup>
import UiDot from '@/components/uiForm/UiDot/index.vue'
const props = defineProps({
  row:{
    type: Object,
    default: ()=>{},
  },
  data:{
    type: Object,
    default: ()=>{},
  },
})
const isTipsShow=(row,data)=>{
  if(typeof data.tipsShow==='function'){
    return Boolean(data.tipsShow(row))
  }
  if(data.tipsShow !== undefined){
    return Boolean(data.tipsShow)
  }
  if(typeof data.tips==='function'){
    return Boolean(data.tips(row))
  }
  return Boolean(data.tips)
}

</script>
<style lang="less" scoped>
.ColumnsItemTypeBox{
  display: inline-flex;
  align-items: center;
  gap:4px;
  &.nowrap{
    white-space: nowrap;
  }
  .not-text{
    color: var(--ui-color-neutral-275);
  }
  &.auto{
    display: flex;
    width: 100%;

		> div:not(.btns) {
			min-width: 0;
			flex: 1;
			overflow: hidden;
			text-overflow: ellipsis;
			white-space: nowrap;
		}
  }
  .btns{
		width: var(--ui-size-18);
		flex: 0 0 18px;
		display: flex;
		align-items: center;
		justify-content: flex-end;
  }
  >*{
    margin: 0 !important;
  }
  .icon-question,.icon-edit{
    font-size: 14px;
    color: var(--ui-color-text-secondary);
    cursor: pointer;
    &:hover{
      color: var(--primary-color);
    }
  }
  &:not(:hover){
    .icon-edit{
      display: none;
    }
  }
}
.TooltipContent{
  width: 100%;
  white-space: pre-wrap;
  word-break: break-word;
}
</style>
