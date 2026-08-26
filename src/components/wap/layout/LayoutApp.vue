<template>
  <div
    class="app-phone"
    :style="{
      '--app-phone-sticky-top': route.meta?.isAppDetail
        ? '0px'
        : showNotice && notice
          ? '94px'
          : '58px'
    }"
  >
    <div v-if="!route.meta?.isAppDetail" class="app-phone-header">
      <LayoutHeader/>
    </div>
    <div v-if="!route.meta?.isAppDetail && showNotice && notice" class="app-phone-notice">
      <div class="app-phone-notice__content">
        <NoticeMarquee class="app-phone-notice__marquee" :text="notice" />
        <button type="button" class="app-phone-notice__detail" @click="showNoticeDetail">
          {{ $t('header.notice.detail') }}
        </button>
      </div>
      <button
        type="button"
        class="app-phone-notice__close"
        :aria-label="$t('header.notice.close')"
        @click="closeNotice"
      >
        <Icon type="md-close-circle" :size="16" />
      </button>
    </div>
    <div class="app-phone-body">
      <div :class="route.meta?.isApp === false ? 'wAuto' : ''">
        <router-view></router-view>
      </div>
    </div>
  </div>
</template>
<script setup>
import LayoutHeader from '@/components/wap/layout/LayoutHeader.vue'
import NoticeMarquee from '@/components/layout/NoticeMarquee.vue'
import { t } from '@/utils'
import { useAppStoreRefs } from '@/utils/store.js'
import { Modal } from 'view-ui-plus'
import { ref } from 'vue'
import { useRoute } from '@/utils/route.js'
const route = useRoute()
const { notice } = useAppStoreRefs()

const showNotice = ref(true)

const showNoticeDetail = () => {
  Modal.info({
    title: t('header.notice.title'),
    width: 320,
    content: notice.value,
    okText: t('button.confirm'),
  })
}

const closeNotice = () => {
  showNotice.value = false
}
</script>

<style scoped lang="less">
.app-phone{
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100dvh;
  box-sizing: border-box;
  background: var(--ui-color-surface);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  >*{
    background: var(--ui-color-surface);
    position: relative;
    z-index: 2;
  }
  .app-phone-body{
    flex: 1;
    background: var(--ui-color-page);
    overflow: auto;
    z-index: 1;
    .wAuto{
      width: 1232px;
      position: relative;
    }
    .drift-group {
      position: fixed;
      z-index:10;
      right: 16px;
      bottom: 80px;
      display: flex;
      flex-direction: column;
      gap: 12px;
      animation: float-up 0.5s ease-out;
      transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.4s ease;

      &.is-hidden {
        transform: translateX(calc(100% + 20px));
        opacity: 0;
        pointer-events: none;
      }

      .drift-item {
        width:var(--ui-size-44);
        height:var(--ui-size-44);
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: var(--ui-radius-circle);
        cursor: pointer;
        transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);

        &.customer {
          background: linear-gradient(135deg, var(--primary-color, #146fff), #1aa0ff);
          color: var(--ui-color-text-inverse);
          box-shadow: var(--ui-shadow-mobile-customer);
          .iconfont {
            font-size: 22px;
          }
        }

        &.back-top {
          background: var(--ui-color-surface);
          color: var(--ui-color-text-subtle);
          box-shadow: var(--ui-shadow-neutral-floating);
          font-size: 22px;
        }

        &:active {
          transform: scale(0.92);
          box-shadow: var(--ui-shadow-mobile-pressed);
        }
      }
    }

    @keyframes float-up {
      0% { opacity: 0; transform: translateY(20px); }
      100% { opacity: 1; transform: translateY(0); }
    }
  }

  .app-phone-notice{
    min-height: 36px;
    padding: var(--ui-padding-6-12);
    color: var(--ui-color-error-strong);
    background: var(--ui-color-surface-danger-soft);
    display: flex;
    align-items: center;
    gap: 10px;

    &__content{
      min-width: 0;
      flex: 1;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    &__marquee{
      font-size: 12px;
      line-height: 20px;
    }

    &__detail,
    &__close{
      padding: 0;
      border: 0;
      background: transparent;
      cursor: pointer;
      flex-shrink: 0;
    }

    &__detail{
      color: var(--primary-color);
      font-size: 12px;
      line-height: 20px;
    }

    &__close{
      width: var(--ui-size-24);
      height: var(--ui-size-24);
      color: #fcc;
      display: inline-flex;
      align-items: center;
      justify-content: center;
    }
  }
}
</style>
