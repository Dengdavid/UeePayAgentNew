<template>
   <div class="card" :class="{
    'cardNotBox':!(title || $slots.title) && list?.length>0
   }"  :style="{
    background:background
   }">
      <div class="card-title" :class="{
        title:list?.length>0,
        'm-b-12':list?.length>0
      }" v-if="title || $slots.title">
        <IconBox :icon="icon" :size="18" v-if="icon" />
        <slot name="title" v-if="$slots.title"></slot>
        <b v-else>{{title}}</b>
      </div>
      <template v-if="list?.length>0">
        <FormListBox class="card-list" :list="listNumber || list?.length" :minWidth="160">
          <template v-for="(item) in list">
            <dl :class="{
              onBtn:item?.onclick
            }" :style="{
              background:item.background || '#fafafa'
            }" @click="item?.onclick?.(item)">
              <dd class="price">
                <CountUp :end="Number(item.value ?? 0)" :duration="duration" :decimals="item.decimals ?? 0" ref="count"
            :options="{ useGrouping: false }" v-font="font" />
              </dd>
              <dt>{{item.label}}</dt>
            </dl>
          </template>
        </FormListBox>
      </template>
      <div class="card-number" v-else>
        <span class="price">
          <CountUp :end="Number(value ?? 0)" :duration="duration" :decimals="0" ref="count" v-font="font" />
        </span>
      </div>
    </div>
</template>

<script setup>
const props = defineProps({
  title:{
    type:String,
  },
  icon:{
    type:String,
  },
  iconColor:{
    type:String,
  },
  background:{
    type:String,
    default:'linear-gradient(0deg, #fff 70%, #fcfdff 100%)'
  },
  value:{
    type:[Number,String],
  },
  listNumber:{
    type:Number,
  },
  list:{
    type:Array,
  },
  duration:{
    type:Number,
    default:0
  },
  font:{
    type:Number,
    default:22
  }
})
</script>

<style lang="less" scoped>
.card{
  &:not(.cardNotBox){
    padding:var(--ui-padding-12);
    border-radius:var(--ui-radius-sm);
    overflow: hidden;
    border: 1px solid rgba(0, 0, 0, .06);
    box-shadow: 0 4px 14px rgba(15, 23, 42, .02);
    backdrop-filter: blur(12px);
  }
  dl{
    dt{
      color: var(--ui-color-text-secondary);
    }
  }
  .card-title{
    font-size: 12px;
    color: var(--ui-color-text-secondary);
    display: flex;
    align-items: center;
    gap:4px;
    &.title{
      font-size: 14px;
      color: var(--ui-color-text);
      font-weight: bold;
    }
    .IconBox{
      color: var(--primary-color);
    }
  }
  .card-number{
    font-weight: bold;
    margin-top: 8px;
    display: flex;
    align-items: baseline;
    gap:2px;
    .unit{
      font-size: 14px;
      position: relative;
      top:-2px;
    }
  }
  .card-list{
    >*{
      overflow: hidden;
      padding:var(--ui-padding-12-16);
      border-radius: var(--ui-radius-sm);
      &.onBtn{
        cursor: pointer;
      }
    }
  }
  .price{
    font-weight: bold;
    font-size: 24px;
  }
}
</style>
