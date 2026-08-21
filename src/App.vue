<template>
  <UILoading :title="$t('appLoading.welcome')" v-if="pageLoading"/>
  <LayoutApp v-else-if="showHeader && isPhone" />
  <div
    v-else-if="showHeader"
    class="app"
    :style="{ '--sticky-header-height': showNotice && notice ? '96px' : '56px' }"
  >
    <div class="sticky-header">
      <LayoutHeader />
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
    <LayoutFooter />
  </div>
  <router-view v-else :key="route.name || route.path" />
</template>

<script setup>
import LayoutFooter from '@/components/layout/LayoutFooter.vue'
import LayoutHeader from '@/components/layout/LayoutHeader.vue'
import NoticeMarquee from '@/components/layout/NoticeMarquee.vue'
import LayoutApp from '@/components/wap/layout/LayoutApp.vue'
import { errorRoutes, loginUnableRoutes } from '@/router/router.js'
import { t } from '@/utils'
import { useAppStore, useAppStoreRefs, useUserStore } from '@/utils/store.js'
import { isPhone } from '@/utils/device.js'
import Cookies from 'js-cookie'
import { Modal } from 'view-ui-plus'
import { computed, nextTick, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const userStore = useUserStore()
const appStore = useAppStore()
const { notice } = useAppStoreRefs()

const loginUnableRouteNames = new Set(loginUnableRoutes.map((item) => item.name))
const errorRoutesNames = new Set(errorRoutes.map((item) => item.name))

const showNotice = ref(true)
const pageLoading = ref(true)
const showHeader = computed(() => {
  if (!route.name) return false
  return (
    !loginUnableRouteNames.has(route.name) &&
    !errorRoutesNames.has(route.name)
  )
})

const showNoticeDetail = function () {
  Modal.info({
    title: t('header.notice.title'),
    width: 800,
    content: notice.value,
    okText: t('button.confirm'),
  })
}
const closeNotice = function () {
  showNotice.value = false
}

onMounted(async () => {
  try {
    const token = Cookies.get('token')
    if (token) {
      await userStore.init()
    }
    appStore.init()
  } finally {
    await nextTick()
    pageLoading.value = false
  }
})
</script>

<style>
@import '@/assets/css/ui.css';
@import '@/assets/css/layout.css';
@import '@/assets/fonts/font.css';
@import '@/assets/icons/iconfont.css';
@import '@/assets/fontsnew/iconfont.css';

.sticky-header {
  position: sticky;
  top: 0;
  z-index: 1000;
}
</style>
<style lang="less">
@import '@/assets/css/com.less';
.app{
  .ui-bar{
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
