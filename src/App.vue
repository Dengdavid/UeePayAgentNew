<template>
  <UILoading  v-if="pageLoading"/>
  <LayoutApp v-else-if="showHeader && isPhone" />
  <div
    v-else-if="showHeader"
    class="app"
    :class="{ 'is-menu-collapsed': isMenuCollapsed }"
    :style="{ '--sticky-header-height': showNotice && notice ? '96px' : '56px' }"
  >
    <div class="app-menu">
      <LayoutMenu
        :collapsed="isMenuCollapsed"
      />
    </div>
    <div class="app-main">
      <div class="sticky-header">
        <LayoutHeader
          :menu-collapsed="isMenuCollapsed"
          @toggle-menu-collapse="toggleMenuCollapse"
        />
        <div v-if="showNotice && notice" class="ui-bar">
          <div class="w1200">
            <div class="app-notice-content">
              <NoticeMarquee :text="notice" />
              <a class="app-notice-detail" @click="showNoticeDetail">
                {{ $t('header.notice.detail') }}
              </a>
            </div>
            <Icon
              type="md-close-circle"
              size="16"
              color="#fcc"
              class="ui-pointer ui-flex-shrink ml-20"
              :aria-label="$t('header.notice.close')"
              @click="closeNotice"
            />
          </div>
        </div>
      </div>
      <div class="ui-main">
        <router-view :key="route.matched[0]?.name || route.path" />
      </div>
    </div>
  </div>
  <router-view v-else :key="route.name || route.path" />
</template>

<script setup>
import LayoutHeader from '@/components/layout/LayoutHeader.vue'
import LayoutMenu from '@/components/layout/LayoutMenu.vue'
import NoticeMarquee from '@/components/layout/NoticeMarquee.vue'
import LayoutApp from '@/components/wap/layout/LayoutApp.vue'
import { errorRoutes, loginUnableRoutes } from '@/router/router.js'
import { t } from '@/utils'
import { isPhone, updateIsPhone } from '@/utils/device.js'
import { useAppStore, useAppStoreRefs, useUserStore } from '@/utils/store.js'
import Cookies from 'js-cookie'
import { Modal } from 'view-ui-plus'
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { tokenName } from "@systemConfig";

const route = useRoute()
const userStore = useUserStore()
const appStore = useAppStore()
const { notice } = useAppStoreRefs()

const loginUnableRouteNames = new Set(loginUnableRoutes.map((item) => item.name))
const errorRoutesNames = new Set(errorRoutes.map((item) => item.name))

const showNotice = ref(true)
const pageLoading = ref(true)
const isMenuManuallyCollapsed = ref(false)
const isNarrowViewport = ref(false)
const isMenuCollapsed = computed(() => isMenuManuallyCollapsed.value)
const showHeader = computed(() => {
  if (!route.name) return false
  if (route.meta.standalone) return false
  return (
    !loginUnableRouteNames.has(route.name) &&
    !errorRoutesNames.has(route.name)
  )
})

const syncViewport = () => {
  updateIsPhone()
  const nextIsNarrow = window.innerWidth < 1400
  if (nextIsNarrow && !isNarrowViewport.value) {
    isMenuManuallyCollapsed.value = true
  }
  isNarrowViewport.value = nextIsNarrow
}

const toggleMenuCollapse = () => {
  isMenuManuallyCollapsed.value = !isMenuManuallyCollapsed.value
}

const showNoticeDetail = () => {
  Modal.info({
    title: t('header.notice.title'),
    width: 800,
    content: notice.value,
    okText: t('button.confirm'),
  })
}

const closeNotice = () => {
  showNotice.value = false
}


onMounted(async () => {
  syncViewport()
  window.addEventListener('resize', syncViewport)
  try {
    const token = Cookies.get(tokenName)
    if (token) {
      await userStore.init()
    }
    await appStore.init()
  } finally {
    await nextTick()
    pageLoading.value = false
  }
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', syncViewport)
})
</script>

<style>
@import '@/assets/css/ui.css';
@import '@/assets/css/layout.css';
@import '@/assets/fonts/font.css';
@import '@/assets/icons/iconfont.css';
@import '@/assets/fontsnew/iconfont.css';
@import '@/assets/css/iconfont-runtime.css';

.sticky-header {
  position: sticky;
  top: 0;
  z-index: 1000;
  flex-shrink: 0;
}
</style>
<style lang="less">
@import '@/assets/css/com.less';
.app{
  .sticky-header{
    width: 100%;
  }

  .ui-bar{
    min-height: var(--ui-size-40);
    padding: 0 var(--ui-space-16);
    color: var(--ui-color-error-strong);
    background: var(--ui-color-surface-danger-soft);

    .w1200{
      min-height: var(--ui-size-40);
      display: flex;
      align-items: center;
    }

    .app-notice-content{
      min-width: 0;
      flex: 1;
      display: flex;
      align-items: center;
    }

    .app-notice-detail{
      flex-shrink: 0;
      margin-left: 10px;
    }
  }
}

</style>
