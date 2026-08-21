<template>
  <UiPage ref="pageRef" isNotBg :fallback="{name:'home'}" isNotTitle :padding="0">
   <HelpHead />
   <div class="pageWidth">
    <div class="helpList">
      <div class="helpList__item" @click="goItem(item)" v-for="item in category" :key="item.id">
        <div class="helpList__item__center">
          <h3 class="helpList__item__center__title">{{ item.title }}</h3>
          <p class="helpList__item__center__desc">{{ item.desc }}</p>
          <div class="helpList__item__center__bottom">
            <Button type="text" ghost>
              <span>{{ $t('help.viewMore') }}</span>
              <Icon type="md-arrow-forward" />
            </Button>
          </div>
        </div>
        <div class="helpList__item__icon">
          <UiImg :src="item.icon"></UiImg>
        </div>
      </div>
    </div>
   </div>
  </UiPage>
</template>

<script setup>
import HelpHead from './components/SearchHead.vue'
import {onMounted,ref,watch,nextTick} from 'vue'
import {toRoute} from '@/utils/route'
const props=defineProps({
  category:{
    type:Array,
    default:()=>[]
  }
})
const pageRef=ref(null)
const goItem=(item)=>{
  toRoute('helpList',{id:item.id},'params')
}
onMounted(() => {
})

</script>

<style scoped lang="less">
@import './style.less';

.helpList{
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 16px;
  margin:var(--ui-margin-24-0);
  &__item{
    position: relative;
    background: #fff;
    display: flex;
    padding: var(--ui-padding-24);
    gap: 16px;
    border-radius: var(--ui-radius-2xl);
    overflow: hidden;
    border: var(--ui-border-subtle);
    box-shadow: 0 4px 16px rgba(31, 45, 77, 0.03);
    transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
    cursor: pointer;
    &::before {
      content: '';
      position: absolute;
      top: -20%;
      left: -20%;
      width: 140%;
      height: 140%;
      background: radial-gradient(circle at 85% 15%, rgba(45, 140, 240, 0.06), transparent 50%);
      opacity: 0;
      transition: opacity 0.4s cubic-bezier(0.16, 1, 0.3, 1);
      pointer-events: none;
      z-index: 0;
    }

    &::after {
      content: '';
      position: absolute;
      left: 0;
      top: 0;
      width: 100%;
      height: var(--ui-size-3);
      background: linear-gradient(90deg, #1d64f2 0%, #689dff 100%);
      transform: scaleX(0);
      transform-origin: center;
      transition: transform 0.5s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.3s ease;
      opacity: 0;
      z-index: 2;
    }

    @media screen and (min-width: 768px) {
      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 16px 32px rgba(31, 45, 77, 0.04), 0 24px 48px rgba(31, 45, 77, 0.06);
        border-color: rgba(45, 140, 240, 0.15);
        &::before {
          opacity: 1;
        }
        &::after {
          transform: scaleX(1);
          opacity: 1;
        }
        .helpList__item__center__title {
          color: var(--ui-color-primary);
        }
        .helpList__item__center__desc {
          color: #4b5a73;
        }
        :deep(.ivu-btn-text) {
          color: var(--ui-color-primary);
          background: rgba(45, 140, 240, 0.08);
        }
        :deep(.ivu-icon-md-arrow-forward) {
          transform: translateX(6px);
        }
      }
    }
    &__center{
      position: relative;
      z-index: 1;
      flex: 1;
      min-width: 0;
      display: flex;
      flex-direction: column;
      gap: 10px;
      &__title{
        font-size: 17px;
        font-weight: 600;
        line-height: 1.4;
        transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
      }
      &__desc{
        flex: 1;
        font-size: 13px;
        color: var(--ui-color-neutral-700);
        line-height: 1.6;
        display: -webkit-box;
        -webkit-line-clamp: 3;
        -webkit-box-orient: vertical;
        overflow: hidden;
        transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
      }
      &__bottom{
        display: flex;
        justify-content: flex-start;
        margin-top: 4px;
        transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        :deep(.ivu-btn) {
          padding: var(--ui-padding-6-12);
          font-weight: 500;
          border-radius: var(--ui-radius-6);
          transition: all 0.3s ease;
        }
        :deep(.ivu-icon-md-arrow-forward) {
          transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }
      }
    }
    &__icon{
      display: flex;
      align-items: flex-end;
    }
  }
}

@media screen and (max-width: 767px) {
  .pageWidth {
    padding-top: 0;
  }

  .helpList {
    margin: var(--ui-margin-12-0);
  }
}
</style>
