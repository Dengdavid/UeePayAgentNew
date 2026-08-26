<template>
   <div class="manage-page">
      <div class="manage-thead">
         <button v-show="canScrollPrev" type="button" class="manage-thead-scroll manage-thead-scroll--prev" :aria-label="$t('button.prevStep')" @click="scrollManageTabs(-1)">
            <Icon type="ios-arrow-back" />
         </button>
         <div ref="manageTheadRef" class="manage-thead-list" :class="{ hasPrev: canScrollPrev, hasNext: canScrollNext }" @scroll.passive="updateScrollButtons">
            <router-link class="manage-thead-item" :class="{active: route.name === item.name}" :to="{name:item.name}" v-for="item in manageRoutes" :key="item.name">
               {{ item.meta.titleKey ? $t(item.meta.titleKey) : item.meta.title }}
            </router-link>
         </div>
         <button v-show="canScrollNext" type="button" class="manage-thead-scroll manage-thead-scroll--next" :aria-label="$t('button.nextStep')" @click="scrollManageTabs(1)">
            <Icon type="ios-arrow-forward" />
         </button>
      </div>
      <div class="manage-main">
         <router-view></router-view>
      </div>
   </div>
</template>

<script setup>
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import {manageRoutes} from '@/router/router'
import { locale } from '@/locales/set.js'
import { useRoute } from 'vue-router'
const route = useRoute()

const manageTheadRef = ref(null)
const canScrollPrev = ref(false)
const canScrollNext = ref(false)

const updateScrollButtons = () => {
   const el = manageTheadRef.value
   if (!el) return
   const isOverflow = el.scrollWidth > el.clientWidth + 2
   canScrollPrev.value = isOverflow && el.scrollLeft > 2
   canScrollNext.value = isOverflow && el.scrollLeft + el.clientWidth < el.scrollWidth - 2
}

const scrollManageTabs = (direction) => {
   manageTheadRef.value?.scrollBy({ left: direction * 120, behavior: 'smooth' })
}

const scrollActiveTabIntoView = () => {
   nextTick(() => {
      manageTheadRef.value?.querySelector('.manage-thead-item.active')?.scrollIntoView({
         behavior: 'smooth',
         block: 'nearest',
         inline: 'center',
      })
      updateScrollButtons()
   })
}

const handleResize = () => nextTick(updateScrollButtons)

onMounted(() => {
   window.addEventListener('resize', handleResize)
   scrollActiveTabIntoView()
})

onBeforeUnmount(() => window.removeEventListener('resize', handleResize))

watch(() => [route.name, locale.value], scrollActiveTabIntoView)

</script>

<style lang="less" scoped>
.manage-page{
   position: absolute;
   top: 0;
   left: 0;
   right: 0;
   bottom: 0;
   display: flex;
   flex-direction: column;
   >*{
      &:not(:last-child){
         border-bottom: 1px solid #e5e5e5;
      }
   }
   .manage-thead{
      position: relative;
      overflow: hidden;
      background: #fff;
      .manage-thead-scroll{
         position: absolute;
         top: 50%;
         z-index: 2;
         width: var(--ui-size-28);
         height: var(--ui-size-28);
         padding: 0;
         border: var(--ui-border-primary-soft);
         border-radius: var(--ui-radius-circle);
         color: var(--ui-color-primary);
         background: var(--ui-color-surface-overlay-strong);
         box-shadow: var(--ui-status-scroll-shadow);
         cursor: pointer;
         transform: translateY(-50%);
         &--prev{ left: 6px; }
         &--next{ right: 6px; }
      }
      .manage-thead-list{
         display: flex;
         align-items: center;
         width: 100%;
         min-width: 0;
         box-sizing: border-box;
         overflow-x: auto;
         overflow-y: hidden;
         overscroll-behavior-x: contain;
         scrollbar-width: none;
         -webkit-overflow-scrolling: touch;
         &::-webkit-scrollbar{
            display: none;
         }
         &.hasPrev{ padding-left: 38px; }
         &.hasNext{ padding-right: 38px; }
         .manage-thead-item{
            flex-shrink: 0;
            padding: 0 16px;
            line-height:50px;
            cursor: pointer;
            color: #333;
            position: relative;
            white-space: nowrap;
            &:hover{
               color: var(--primary-color);
            }
            &.active{
               font-weight: bold;
               color: var(--primary-color);
               &::after{
                  content: '';
                  position: absolute;
                  bottom: 0;
                  left: 0;
                  width: 100%;
                  height: 2px;
                  background-color: var(--primary-color);
               }
            }
         }
      }
   }
   .manage-main{
      flex: 1;
      overflow-x: hidden;
      position: relative;
   }
}
</style>
