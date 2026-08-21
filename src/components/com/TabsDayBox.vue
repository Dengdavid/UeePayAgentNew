<template>
  <div class="TabsDayBox">
    <div class="TabsDayBox-tabs" v-if="!isPhone">
      <div class="item" :class="{
        active:data.active==item.value
      }" v-for="(item) in data.tabs" :key="item.value" @click="handleClick(item)">
        {{ item.label }}
      </div>
      <div class="item" :class="{
        active:!data.active
      }" @click="handleClick(null)">
        {{ t('dateRange.custom') }}
      </div>
    </div>
    <div class="TabsDayBox-date">
        <FormDateBox :data="data.date" width="210px" :startKey="'start'" :endKey="'end'" size="default" :maxMonths="1"  @on-change="handleChange"/>
    </div>
  </div>
</template>

<script setup>
import {reactive} from 'vue'
import { format, subDays,addDays,differenceInDays } from 'date-fns'
import { Message } from 'view-ui-plus'
import { message } from '@/utils/message.js'
import { isPhone } from '@/utils/device.js'
import { t } from '@/utils'
const props = defineProps({
  modelValue:{
    type:[String,Number],
  },
})
const data=reactive({
   active:'last7Days',
   date:{
    start:format(subDays(new Date(),7), "yyyy-MM-dd"),
    end:format(new Date(), "yyyy-MM-dd"),
   },
   tabs:[
      {
         label:t('dateRange.last7Days'),
         value:'last7Days',
         start:format(subDays(new Date(),7), "yyyy-MM-dd"),
         end:format(new Date(), "yyyy-MM-dd"),
      },
      {
         label:t('dateRange.last15Days'),
         value:'last15Days',
         start:format(subDays(new Date(),15), "yyyy-MM-dd"),
         end:format(new Date(), "yyyy-MM-dd"),
      },
      {
         label:t('dateRange.last30Days'),
         value:'last30Days',
         start:format(subDays(new Date(),30), "yyyy-MM-dd"),
         end:format(new Date(), "yyyy-MM-dd"),
      },
   ],
})
const emit = defineEmits(['change','update:modelValue'])
const handleChange=(value)=>{
  handleClick(null)
}
const handleClick = (item) => {
  data.active=item?.value || null
  if(item){
    data.date.start=item.start
    data.date.end=item.end
  }
  emit('change',data.date)
}
</script>
<style lang="less" scoped>
.TabsDayBox{
  display: flex;
  align-items: center;
  gap:8px;
  .TabsDayBox-tabs{
    background: var(--ui-color-page);
    padding: var(--ui-padding-4);
    border-radius: var(--ui-radius-sm);
    display: flex;
    align-items: center;
    line-height:18px;
    .item{
      padding:var(--ui-padding-4-10);
      box-sizing: border-box;
      color: var(--ui-color-text-subtle);
      cursor: pointer;
      border-radius: var(--ui-radius-xs);
      &:hover{
        color: var(--primary-color);
      }
      &.active{
        color: var(--primary-color);
        font-weight: 600;
        background: var(--ui-color-surface);
      }
    }
  }
}
</style>
