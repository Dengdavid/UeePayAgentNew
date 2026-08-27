<template>
  <div class="header-phone">
    <button
      v-if="isLogin"
      ref="menuTriggerRef"
      type="button"
      class="menu-trigger"
      :aria-label="$t('route.menu')"
      :aria-expanded="String(isShowMenu)"
      aria-haspopup="dialog"
      aria-controls="mobile-business-menu"
      @click="openBusinessMenu"
    >
      <Icon type="ios-apps" :size="20" />
      <span class="route-title" :title="$t('route.menu')">{{ $t('route.menu') }}</span>
    </button>
    <button v-else-if="siteLogo" type="button" class="logo" @click="toRoute('home')">
      <img :src="siteLogo" :alt="siteName" />
    </button>
    <div class="user">
      <NoticeBox disabled />
      <MessageBox />
      <GlobalPreferences :authenticated="isLogin" compact tooltip-disabled />
      <div class="name" v-if="isLogin">
        <Dropdown ref="userRef" trigger="click">
          <a class="userName" href="javascript:void(0)">
            <span class="user-name-text">{{ accountName }}</span>
            <Icon type="ios-arrow-down"></Icon>
          </a>
          <template #list>
            <div class="userThead">
              <div class="user-info-card" @click="toRoute('pricing')">
                <div class="vip-badge">
                  <Icon custom="iconfont icon-vip" :size="16"></Icon>
                  <span class="vip-title" :title="userGroup.title">{{ userGroup.title }}</span>
                </div>
                <div class="expire-info">
                  <span class="label">{{ $t('header.validUntil') }}</span>
                  <span class="time">{{ expireTime }}</span>
                </div>
              </div>
              <div class="user-info-money">
                <div class="price-item list-b-8">
                  <dl>
                    <dt>{{ $t('header.availableBalance') }}</dt>
                    <dd class="moneySub">${{ user.money }}</dd>
                  </dl>
                  <Button class="recharge-btn" long @click="()=>{
                    userClose()
                    toRoute('ucenter_deposit')
                  }">
                    {{ $t('header.rechargeNow') }}
                  </Button>
                </div>
                <div class="price-item" v-if="user.freeze_amount > 0">
                  <dl>
                    <dt>{{ $t('header.frozenAmount') }}</dt>
                    <dd>${{ user.freeze_amount }}</dd>
                  </dl>
                  <dl>
                    <dt>{{ $t('header.frozenDate') }}</dt>
                    <dd>{{ dayjs(user.freezed_at).format('YYYY-MM-DD') }}</dd>
                  </dl>
                </div>
              </div>
              <div class="action-wrap">
                <Button class="logout-btn" @click.stop="handleLogout">
                  <Icon type="md-log-out" :size="14" style="margin-right: 4px;"></Icon>{{ $t('button.logout') }}
                </Button>
              </div>
            </div>
          </template>
        </Dropdown>
      </div>
      <div class="list-r-6" v-else>
        <Button size="small" @click="toRoute('register')">{{ $t('header.register') }}</Button>
        <Button type="primary" size="small" @click="toRoute('login')">{{ $t('header.login') }}</Button>
      </div>
    </div>
    <Drawer
      v-model="isShowMenu"
      placement="left"
      :width="280"
      :closable="false"
      :styles="drawerStyles"
      class-name="mobile-business-menu-drawer"
      @on-close="restoreBusinessMenuFocus"
    >
      <div
        id="mobile-business-menu"
        class="mobile-business-menu"
        role="dialog"
        aria-modal="true"
        aria-labelledby="mobile-business-menu-title"
        @keydown="handleBusinessMenuKeydown"
      >
        <div class="menu-drawer-header">
          <div class="menu-drawer-brand">
            <span v-if="siteLogo" class="menu-drawer-logo">
              <img :src="siteLogo" :alt="siteName" />
            </span>
            <div class="menu-drawer-brand-copy">
              <strong id="mobile-business-menu-title" :title="siteName">{{ siteName }}</strong>
              <button
                type="button"
                class="menu-drawer-user"
                :aria-label="$t('header.account.copyUserName')"
                @click="handleCopyAccountName"
              >
                <Icon type="md-person" :size="14" />
                <span>{{ accountName }}</span>
              </button>
            </div>
          </div>
          <button
            ref="menuCloseRef"
            type="button"
            class="menu-drawer-close"
            :aria-label="$t('button.collapse')"
            @click="closeBusinessMenu"
          >
            <Icon type="ios-close" :size="26" />
          </button>
        </div>

        <nav class="menu-drawer-list" :aria-label="$t('route.menu')">
          <button
            v-for="item in accountMenus"
            :key="item.name"
            type="button"
            class="menu-drawer-item"
            :class="{ active: isRouteActive(item.name) }"
            @click="handleGoPage(item.name)"
          >
            <IconBox :icon="item.meta.menuIcon" :size="20" />
            <span class="menu-drawer-title">{{ accountMenuTitle(item) }}</span>
            <span v-if="item.meta.menuTagKey" class="menu-drawer-tag">
              {{ $t(item.meta.menuTagKey) }}
            </span>
          </button>

          <button
            v-for="item in agentMenuItems"
            :key="item.id || item.name || item.url"
            type="button"
            class="menu-drawer-item"
            :class="{ active: route.query.url === item.url }"
            @click="handleAgentMenu(item)"
          >
            <IconBox :icon="item.icon" :size="20" />
            <span class="menu-drawer-title">{{ item.title }}</span>
          </button>
        </nav>

        <div class="menu-drawer-footer">
          <button
            v-if="customerUrl"
            type="button"
            class="menu-drawer-item"
            @click="handleCustomerService"
          >
            <IconBox icon="icon-kefu" :size="20" />
            <span class="menu-drawer-title">{{ $t('help.onlineSupport') }}</span>
          </button>
          <button
            v-if="user.is_admin"
            type="button"
            class="menu-drawer-item"
            :class="{ active: isRouteActive('manage') }"
            @click="handleGoPage('marketing')"
          >
            <IconBox icon="icon-shezhi" :size="20" />
            <span class="menu-drawer-title">{{ $t('menu.manage') }}</span>
          </button>
          <button type="button" class="menu-drawer-logout" @click="handleLogout">
            <Icon type="md-log-out" :size="18" />
            <span>{{ $t('button.logout') }}</span>
          </button>
        </div>
      </div>
    </Drawer>
  </div>
</template>

<script setup>
import NoticeBox from '@/components/layout/components/NoticeBox.vue'
import MessageBox from '@/components/wap/layout/components/MessageBox.vue'
import GlobalPreferences from '@/components/layout/GlobalPreferences.vue'
import IconBox from '@/components/com/IconBox.vue'
import dayjs from 'dayjs'
import { computed, nextTick, onMounted, ref } from 'vue'
import { toRoute,useRoute } from '@/utils/route.js'
import { ucenterRoutes, whiteRoutes } from '@/router/router.js'
const route = useRoute()
import { message,confirm } from '@/utils/message.js'
import { getApi, postApi } from '@/utils/api.js'
import { t } from '@/utils/index.js'
import { agentLogo, agentName } from '@/utils/agent.js'
import { clearBrowserCache } from '@/utils/preferences.js'
import { copyText } from '@/utils/dataInfo.js'
import { useAppStoreRefs, useUserStoreRefs } from '@/utils/store'
import { useUserStore } from '@/store/user.js'
const userStore=useUserStore()
const { user, userGroup,isLogin, menuPermissions } = useUserStoreRefs()
const { customerUrl } = useAppStoreRefs()
const isShowMenu = ref(false)
const menuTriggerRef = ref(null)
const menuCloseRef = ref(null)
const agentMenuItems = ref([])
const drawerStyles = {
  padding: '0',
  overflow: 'hidden',
}
const accountName = computed(() => user.value?.nickname || user.value?.username || t('header.unnamed'))
const siteLogo = computed(() => agentLogo())
const siteName = computed(() => agentName())
const activeRouteNames = computed(() => {
  const direct = route.meta?.direct
  return new Set([
    route.name,
    ...(Array.isArray(direct) ? direct : [direct]),
  ].filter(Boolean))
})
const showAccountMenu = (item) => {
  if (!item?.meta?.need_auth) return true
  return Boolean(user.value?.[item.meta.need_auth] || menuPermissions.value?.[item.meta.need_auth])
}
const accountMenus = computed(() => ucenterRoutes.children.filter(
  item => !item.meta?.hidden && showAccountMenu(item),
))
const accountMenuTitle = (item) => {
  const titleKey = item.meta?.menuTitleKey || item.meta?.titleKey
  return titleKey ? t(titleKey) : item.meta?.title || ''
}
const isRouteActive = name => activeRouteNames.value.has(name)
const expireTime = computed(() => {
  if (!user.value.expire_time) return t('header.permanent')
  return user.value.expire_time.split(' ')[0]
})
const userRef = ref(null)
const userClose = () => {
  if (userRef.value) userRef.value.currentVisible = false
}
const handleCopyAccountName = () => {
  const value = user.value?.nickname || user.value?.username
  if (!value) return
  copyText(
    value,
    t('header.account.userNameCopied'),
    t('header.account.copyFailed'),
  )
}
const restoreBusinessMenuFocus = async () => {
  await nextTick()
  if (!isShowMenu.value) menuTriggerRef.value?.focus()
}
const openBusinessMenu = async () => {
  isShowMenu.value = true
  await nextTick()
  menuCloseRef.value?.focus()
}
const closeBusinessMenu = async () => {
  isShowMenu.value = false
  await restoreBusinessMenuFocus()
}
const trapDrawerFocus = (event, containerId, closeDrawer) => {
  if (event.key === 'Escape') {
    event.preventDefault()
    closeDrawer()
    return
  }
  if (event.key !== 'Tab') return

  const container = document.getElementById(containerId)
  const focusableElements = Array.from(container?.querySelectorAll(
    'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
  ) || []).filter(element => element.offsetParent !== null)
  if (!focusableElements.length) return

  const firstElement = focusableElements[0]
  const lastElement = focusableElements[focusableElements.length - 1]
  if (event.shiftKey && document.activeElement === firstElement) {
    event.preventDefault()
    lastElement.focus()
  } else if (!event.shiftKey && document.activeElement === lastElement) {
    event.preventDefault()
    firstElement.focus()
  }
}
const handleBusinessMenuKeydown = event => trapDrawerFocus(
  event,
  'mobile-business-menu',
  closeBusinessMenu,
)
const handleGoPage = async (name) => {
  isShowMenu.value = false
  await toRoute(name)
}
const handleAgentMenu = async (item) => {
  isShowMenu.value = false
  if (Number(item.open_type) === 0) {
    await toRoute('iframe', { url: item.url })
    return
  }
  window.open(item.url, '_blank', 'noopener,noreferrer')
}
const handleCustomerService = () => {
  isShowMenu.value = false
  if (customerUrl.value) {
    window.open(customerUrl.value, '_blank', 'noopener,noreferrer')
  }
}
const loadAgentMenus = async () => {
  try {
    const result = await getApi('/user/agentSite/menus')
    agentMenuItems.value = Array.isArray(result) ? result : []
  } catch {
    agentMenuItems.value = []
  }
}
// 退出
const handleLogout = () =>{
  userClose()
  isShowMenu.value = false
  confirm(t('message.logoutConfirm')).then(()=>{
    postApi('/user/auth/logout').then(async () => {
      message(t('message.logoutSuccess'))
      userStore.logout()
      await clearBrowserCache()
      // 非白名单页面，退出后跳转首页
      const index = whiteRoutes.findIndex((item) => item.name === route.name)
      if (index === -1 || ['certify', 'card'].includes(route.name)) {
        await toRoute('home', {}, 'query', { replace: true })
      }
      window.location.reload()
    })
  })
}
onMounted(() => {
  if (isLogin.value) loadAgentMenus()
})
</script>

<style scoped lang="less">
.header-phone{
  box-sizing: border-box;
  height:var(--ui-size-50);
  background: #e3e7f5;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--ui-padding-4-12);
  gap: 10px;
  border-bottom: var(--ui-border-divider);
  .menu-trigger,
  .logo{
    min-width: 0;
    flex: 1;
    height: var(--ui-size-40);
    padding: 0;
    border: 0;
    background: transparent;
  }
  .menu-trigger{
    display: flex;
    align-items: center;
    gap: 4px;
    color: var(--ui-color-text);
    line-height: 1;
    text-align: left;
    cursor: pointer;
    :deep(.ivu-icon){
      display: block;
      line-height: 1;
    }
    .route-title{
      min-width: 0;
      overflow: hidden;
      font-size: 14px;
      font-weight: 600;
      line-height: 20px;
      white-space: nowrap;
      text-overflow: ellipsis;
    }
  }
  .logo{
    display: flex;
    align-items: center;
    cursor: pointer;
    img{
      display: block;
      max-width: 120px;
      max-height:22px;
    }
  }
  .user{
    min-width: 0;
    flex: none;
    margin-left: auto;
    display: flex;
    align-items: center;
    gap: var(--ui-space-4);
    .name{
      min-width: 0;
      .userName{
        max-width: 88px;
        display: flex;
        align-items: center;
        gap: var(--ui-space-4);
        color: var(--ui-color-text);
        .user-name-text{
          min-width: 0;
          overflow: hidden;
          white-space: nowrap;
          text-overflow: ellipsis;
        }
      }
    }
  }
}

.mobile-business-menu{
  height: 100%;
  display: flex;
  flex-direction: column;
  background: var(--ui-color-surface);
  .menu-drawer-header{
    position: relative;
    padding: calc(14px + env(safe-area-inset-top)) 14px 14px;
    background: #e3e7f5;
    border-bottom: var(--ui-border-divider);
  }
  .menu-drawer-brand{
    min-width: 0;
    padding-right: 48px;
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .menu-drawer-logo{
    width: var(--ui-size-40);
    height: var(--ui-size-40);
    padding: 6px;
    flex: none;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    border: var(--ui-border-overlay-soft);
    border-radius: var(--ui-radius-xl);
    background: var(--ui-color-surface-overlay-soft);
    img{
      max-width: 100%;
      max-height: 100%;
      object-fit: contain;
    }
  }
  .menu-drawer-brand-copy{
    min-width: 0;
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 3px;
    strong{
      min-width: 0;
      overflow: hidden;
      font-size: 15px;
      line-height: 20px;
      white-space: nowrap;
      text-overflow: ellipsis;
    }
  }
  .menu-drawer-close{
    position: absolute;
    top: calc(14px + env(safe-area-inset-top));
    right: 14px;
    width: var(--ui-size-40);
    height: var(--ui-size-40);
    padding: 0;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    color: var(--ui-color-text-subtle);
    border: var(--ui-border-overlay-soft);
    border-radius: var(--ui-radius-circle);
    background: color-mix(in srgb, var(--ui-color-surface) 48%, transparent);
    cursor: pointer;
    &:active{
      color: var(--ui-color-primary);
      background: var(--ui-color-surface-selected);
      transform: scale(0.96);
    }
    &:focus-visible{
      outline: var(--ui-outline-primary);
      outline-offset: 1px;
    }
  }
  .menu-drawer-user{
    min-width: 0;
    max-width: 100%;
    padding: 0;
    display: flex;
    align-items: center;
    gap: 4px;
    overflow: hidden;
    color: var(--ui-color-text-secondary);
    border: 0;
    background: transparent;
    font: inherit;
    font-size: 12px;
    line-height: 16px;
    text-align: left;
    white-space: nowrap;
    cursor: pointer;
    &:active{
      color: var(--ui-color-primary);
    }
    &:focus-visible{
      outline: var(--ui-outline-primary);
      outline-offset: 2px;
    }
    >span{
      min-width: 0;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  }
  .menu-drawer-list{
    flex: 1;
    min-height: 0;
    padding: 10px;
    overflow-y: auto;
  }
  .menu-drawer-item{
    width: 100%;
    min-width: 0;
    min-height: var(--ui-size-44);
    padding: 8px 12px;
    display: flex;
    align-items: center;
    gap: 10px;
    color: var(--ui-color-text);
    border: 0;
    border-radius: var(--ui-radius-lg);
    background: transparent;
    font: inherit;
    text-align: left;
    cursor: pointer;
    &:not(:last-child){
      margin-bottom: 2px;
    }
    &:active{
      background: var(--ui-color-surface-hover);
    }
    &.active{
      color: var(--ui-color-text-inverse);
      background: linear-gradient(90deg, #2b5cd9 0%, #5d84e6 100%);
    }
  }
  .menu-drawer-title{
    min-width: 0;
    flex: 1;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }
  .menu-drawer-tag{
    flex: none;
    padding: 1px 6px;
    color: var(--ui-color-text-inverse);
    background: var(--ui-color-error-strong);
    border-radius: var(--ui-radius-full);
    font-size: 10px;
    line-height: 16px;
  }
  .menu-drawer-footer{
    padding: 8px 10px calc(8px + env(safe-area-inset-bottom));
    border-top: var(--ui-border-divider);
  }
  .menu-drawer-logout{
    width: 100%;
    min-height: var(--ui-size-40);
    padding: 8px 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    color: var(--ui-color-error-strong);
    border: 0;
    border-radius: var(--ui-radius-lg);
    background: var(--ui-color-status-error-surface);
    font: inherit;
    cursor: pointer;
  }
}
</style>
<style lang="less">
.userThead {
  width: 220px;
  padding: var(--ui-padding-10);
  background: var(--ui-color-surface);
  border-radius: var(--ui-radius-lg);
  display: flex;
  flex-direction: column;
  gap: 10px;
  box-shadow: var(--ui-shadow-neutral-card);

  .user-info-card {
    background-image:
      /* 网格圆点纹理层 1（主点） */
      radial-gradient(rgba(255, 255, 255, 0.08) 1px, transparent 1px),
      /* 网格圆点纹理层 2（交错点） */
      radial-gradient(rgba(255, 255, 255, 0.04) 1px, transparent 1px),
      /* 左上角的柔和金光 */
      radial-gradient(circle at top left, rgba(255, 203, 82, 0.2) 0%, transparent 60%),
      /* 基础的深色渐变背景 */
      linear-gradient(135deg, #2b2e38 0%, #0a0b0e 100%);

    background-size:
      6px 6px,
      6px 6px,
      100% 100%,
      100% 100%;

    background-position:
      0 0,
      3px 3px,
      0 0,
      0 0;

    border: 1px solid rgba(255, 203, 82, 0.2);
    box-shadow: var(--ui-shadow-mobile-membership);
    border-radius: var(--ui-radius-lg);
    padding: 14px 12px;
    position: relative;
    overflow: hidden;

    &::after {
      content: '';
      position: absolute;
      bottom: -30px;
      right: -20px;
      width: var(--ui-size-100);
      height: var(--ui-size-100);
      background: radial-gradient(circle, rgba(255, 203, 82, 0.12) 0%, transparent 60%);
      border-radius: var(--ui-radius-circle);
      pointer-events: none;
    }

    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: var(--ui-size-1);
      background: linear-gradient(90deg, transparent, rgba(255, 203, 82, 0.3), transparent);
    }

    .vip-badge {
      display: flex;
      align-items: center;
      gap: 6px;
      min-width: 0;
      color: var(--ui-color-gold-300);

      .vip-title {
        min-width: 0;
        overflow: hidden;
        font-size: 14px;
        font-weight: 600;
        white-space: nowrap;
        text-overflow: ellipsis;
        background: linear-gradient(90deg, #ffcb52, #ffebd2);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
      }
    }

    .expire-info {
      margin-top: 8px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 12px;

      .label {
        color: rgba(255, 255, 255, 0.6);
      }

      .time {
        color: var(--ui-color-gold-300);
        font-family: monospace;
      }
    }
  }

  .user-info-money {
    background: linear-gradient(180deg, #f4f9ff 0%, #f8fafc 100%);
    border-radius: var(--ui-radius-lg);
    padding: var(--ui-padding-12);
    display: flex;
    flex-direction: column;
    border: var(--ui-border-muted);

    .price-item {
      display: flex;
      flex-direction: column;

      &:not(:last-child) {
        border-bottom: 1px dashed #cbd5e1;
        padding-bottom: 12px;
        margin-bottom: 12px !important;
      }

      dl {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin: 0 0 6px 0;
        line-height: 1.2;

        &:last-of-type {
          margin-bottom: 0;
        }

        dt {
          color: var(--ui-color-neutral-700);
          font-size: 12px;
        }

        dd {
          color: #0f172a;
          font-family: 'DIN Alternate', -apple-system, sans-serif;
        }
      }

      .moneySub{
        color: var(--primary-color);
        font-size: 16px;
        font-weight: bold;
      }
    }

    .recharge-btn {
      width: 100%;
      height: var(--ui-size-32);
      background: linear-gradient(90deg, #146fff, #1aa0ff);
      color: var(--ui-color-text-inverse);
      border: none;
      border-radius: var(--ui-radius-6);
      font-size: 13px;
      font-weight: 600;
      box-shadow: var(--ui-shadow-mobile-action);
      transition: all 0.2s ease;

      &:hover {
        opacity: 0.9;
        box-shadow: var(--ui-shadow-mobile-action-hover);
      }
    }
  }

  .action-wrap {
    .logout-btn {
      width: 100%;
      height: var(--ui-size-32);
      border: none;
      background-color: var(--ui-color-status-error-surface);
      color: var(--ui-color-error-strong);
      font-size: 13px;
      border-radius: var(--ui-radius-6);
      transition: all 0.2s ease-in-out;

      &:hover {
        background-color: #ffccc7;
        color: #cf1322;
      }
    }
  }
}
</style>
