<template>
  <nav class="ui-header">
    <div class="ui-header-content w1200">
      <LogoBox class="logo"/>
      <div ref="navigatorRef" class="ui-navigator">
        <a
          href="javascript:;"
          v-for="item in visibleMenus"
          :key="item.name"
          :class="{ active: activeMenu === item.name }"
          @click="handleGo(item)"
          >{{ item.meta.titleKey ? $t(item.meta.titleKey) : item.meta.title }}</a
        >
        <Dropdown
          v-if="overflowMenus.length"
          class="navigator-more"
          placement="bottom-end"
          trigger="hover"
          transfer
        >
          <button
            type="button"
            class="navigator-more-trigger"
            :class="{ active: overflowMenus.some(item => activeMenu === item.name) }"
          >
            <span>{{ $t('button.more') }}</span>
            <Icon type="ios-arrow-down" :size="14" />
          </button>
          <template #list>
            <DropdownMenu>
              <DropdownItem
                v-for="item in overflowMenus"
                :key="item.name"
                :disabled="item.meta.disabled"
                @click.stop="handleGo(item)"
              >
                {{ item.meta.titleKey ? $t(item.meta.titleKey) : item.meta.title }}
              </DropdownItem>
            </DropdownMenu>
          </template>
        </Dropdown>
        <div ref="navigatorMeasureRef" class="navigator-measure" aria-hidden="true">
          <span
            v-for="item in menus"
            :key="item.name"
            class="navigator-measure-item"
            data-menu-measure
          >
            {{ item.meta.titleKey ? $t(item.meta.titleKey) : item.meta.title }}
          </span>
          <span ref="moreMeasureRef" class="navigator-measure-item navigator-measure-more">
            <span>{{ $t('button.more') }}</span>
            <Icon type="ios-arrow-down" :size="14" />
          </span>
        </div>
      </div>
      <div
        v-if="customerUrl"
        class="radius-btn customer"
        @click="handlGoCustomer"
      >
        <Icon custom="iconfont icon-customer"></Icon>
        <span class="text">{{ $t('header.customerService') }}</span>
      </div>
      <div
        v-if="isLogin"
        class="radius-btn recharge"
        @click="handleGoPage('ucenter_deposit')"
      >
        <svg
          t="1724325301000"
          class="icon"
          viewBox="0 0 1024 1024"
          version="1.1"
          xmlns="http://www.w3.org/2000/svg"
          p-id="54163"
          xmlns:xlink="http://www.w3.org/1999/xlink"
          width="16"
          height="16"
        >
          <path
            d="M698.538667 340.906667a16.981333 16.981333 0 0 1-5.248-26.794667c5.333333-6.656 10.069333-13.781333 14.208-21.248 33.92-59.050667 31.914667-126.805333-5.973334-148.053333a49.749333 49.749333 0 0 0-28.458666-7.253334 61.44 61.44 0 0 0-30.421334 7.253334 9.941333 9.941333 0 0 1-6.954666 1.706666 15.957333 15.957333 0 0 1-14.208-7.253333 126.122667 126.122667 0 0 0-177.066667-30.293333 124.885333 124.885333 0 0 0-30.165333 30.293333 16.213333 16.213333 0 0 1-14.208 7.253333 10.666667 10.666667 0 0 1-7.253334-1.706666 43.050667 43.050667 0 0 0-28.416-9.045334 51.754667 51.754667 0 0 0-28.416 7.04c-37.418667 21.504-40.874667 89.258667-6.997333 148.053334 4.266667 7.509333 8.96 14.677333 14.250667 21.504a17.066667 17.066667 0 0 1-1.536 25.002666 11.477333 11.477333 0 0 1-3.968 2.773334A396.117333 396.117333 0 0 0 128 688.810667a361.429333 361.429333 0 0 0 65.834667 206.848A106.112 106.112 0 0 0 279.125333 938.666667h480c33.578667 0 65.237333-15.957333 85.248-43.008a361.429333 361.429333 0 0 0 65.834667-206.848 389.333333 389.333333 0 0 0-211.669333-347.946667z"
            fill="#ffffff"
            p-id="54164"
            data-spm-anchor-id="a313x.search_index.0.i2.392d3a81LWtGiE"
            class="selected"
          ></path>
          <path
            d="M519.125333 832a214.016 214.016 0 0 0-213.333333-213.461333 213.76 213.76 0 0 0 213.333333-213.205334 214.016 214.016 0 0 0 213.333334 213.205334 214.272 214.272 0 0 0-213.333334 213.461333z"
            fill="#FFC053"
            p-id="54165"
            data-spm-anchor-id="a313x.search_index.0.i1.392d3a81LWtGiE"
            class=""
          ></path>
        </svg>
        <span class="text">{{ $t('header.recharge') }}</span>
      </div>
      <div v-if="isLogin || customerUrl" class="spacer"></div>
      <MessageBox :disabled="false"/>
      <div class="spacer" v-if="isLogin"></div>
      <GlobalPreferences :authenticated="isLogin" />
      <div class="spacer"></div>
      <a class="link" @click="handleGoPage('help')">{{ $t('header.helpCenter') }}</a>
      <div class="user-action">
        <Dropdown v-if="isLogin" :transfer="false" placement="bottom-end">
          <router-link class="user" :to="{ name: 'ucenter_index' }">
            <!--                        <Avatar class="user-avatar" size="small" :src="user.avatar || avatarUrl"></Avatar>-->
            <span class="user-name">{{ accountName || $t('header.unnamed') }}</span>
            <Icon
              :size="12"
              custom="iconfont icon-arrow-dropdown"
              color="#bfbfbf"
            ></Icon>
          </router-link>
          <template #list>
            <DropdownMenu>
              <div class="user-drop-menu">
                <div class="drop-head">
                  <div class="account-info-card">
                    <div class="account-info-row">
                      <span class="account-label">{{ $t('header.account.userName') }}</span>
                      <span
                        class="account-value"
                        :title="accountName || $t('header.unnamed')"
                      >
                        {{ accountName || $t('header.unnamed') }}
                      </span>
                      <Tooltip
                        v-if="accountName"
                        transfer
                        placement="top"
                        :content="$t('header.account.copyUserName')"
                      >
                        <button
                          type="button"
                          class="account-copy-button"
                          :aria-label="$t('header.account.copyUserName')"
                          @click.stop.prevent="handleCopyAccountName"
                        >
                          <Icon type="ios-copy-outline" :size="15" />
                        </button>
                      </Tooltip>
                    </div>
                  </div>

                  <div class="account-membership">
                    <div class="account-membership-head">
                      <div class="vip" @click="handleGoPage('pricing')">
                        <Icon custom="iconfont icon-vip" :size="13"></Icon>
                        <span>{{ userGroup.title }}</span>
                      </div>
                      <button
                        type="button"
                        class="membership-action"
                        @click.stop="handleGoPage('pricing')"
                      >
                        <span>{{ $t('header.account.viewBenefits') }}</span>
                        <Icon type="ios-arrow-forward" :size="13" />
                      </button>
                    </div>
                    <div v-if="expireTime" class="account-expiry">
                      <span>{{ $t('header.validUntil') }}</span>
                      <strong>{{ expireTime }}</strong>
                    </div>
                  </div>
                </div>
                <div class="links">
                  <button
                    v-for="item in accountMenus"
                    v-show="showAccountMenu(item)"
                    :key="item.name"
                    type="button"
                    class="account-menu-item"
                    :title="accountMenuTitle(item)"
                    @click="handleGoPage(item.name)"
                  >
                    <span class="account-menu-icon" :style="item.meta.menuIconStyle">
                      <Icon :type="item.meta.menuIcon" :size="22" />
                    </span>
                    <span v-if="item.meta.menuTagKey" class="account-menu-tag">
                      {{ $t(item.meta.menuTagKey) }}
                    </span>
                    <span>{{ accountMenuTitle(item) }}</span>
                  </button>
                </div>
                <button type="button" class="account-logout" @click="handleLogout('loginout')">
                  <Icon type="ios-log-out" :size="16" />
                  <span>{{ $t('button.logout') }}</span>
                </button>
              </div>
            </DropdownMenu>
          </template>
        </Dropdown>
        <div v-else class="login-btns">
          <Button
            type="primary"
            size="default"
            ghost
            :to="{ name: 'register' }"
            style="background-color: var(--ui-color-surface)"
            >{{ $t('header.register') }}</Button
          >
          <Button type="primary" size="default" :to="{ name: 'login' }"
            >{{ $t('header.login') }}</Button
          >
        </div>
      </div>
    </div>
  </nav>
</template>

<script setup>
import LogoBox from '@/views/components/LogoBox/index.vue'
import MessageBox from '@/components/wap/layout/components/MessageBox.vue'
import GlobalPreferences from '@/components/layout/GlobalPreferences.vue'
import { userApi } from '@/api'
import { ucenterRoutes, whiteRoutes } from '@/router/router.js'
import { useAppStore } from '@/store/app.js'
import { useUserStore } from '@/store/user.js'
import { storeToRefs } from 'pinia'
import { Message } from 'view-ui-plus'
import { copyText } from '@/utils/dataInfo.js'
import { message } from '@/utils/message.js'
import { clearBrowserCache } from '@/utils/preferences.js'
import { toRoute, useRoute } from '@/utils/route.js'
import { t } from '@/utils/index.js'
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'

const route = useRoute()

const userStore = useUserStore()
const { isLogin, user, userGroup, unreadNum, menuPermissions } = storeToRefs(userStore)
const appStore = useAppStore()
const { customerUrl } = storeToRefs(appStore)
const menus = ref(whiteRoutes.filter((item) => !item.meta.hidden))
const navigatorRef = ref(null)
const navigatorMeasureRef = ref(null)
const moreMeasureRef = ref(null)
const visibleMenuCount = ref(menus.value.length)

const visibleMenus = computed(() => menus.value.slice(0, visibleMenuCount.value))
const overflowMenus = computed(() => menus.value.slice(visibleMenuCount.value))

let navigatorResizeObserver = null
let navigatorResizeFrame = 0

const measureNavigator = () => {
  navigatorResizeFrame = 0
  const navigator = navigatorRef.value
  const measure = navigatorMeasureRef.value
  const moreMeasure = moreMeasureRef.value
  if (!navigator || !measure || !moreMeasure) return

  const itemWidths = [...measure.querySelectorAll('[data-menu-measure]')]
    .map(item => Math.ceil(item.getBoundingClientRect().width))
  const availableWidth = Math.floor(navigator.clientWidth)
  const gap = 8
  const totalWidth = itemWidths.reduce((total, width) => total + width, 0)
    + Math.max(itemWidths.length - 1, 0) * gap

  if (totalWidth <= availableWidth) {
    visibleMenuCount.value = itemWidths.length
    return
  }

  let usedWidth = Math.ceil(moreMeasure.getBoundingClientRect().width)
  let count = 0
  for (const width of itemWidths) {
    const nextWidth = usedWidth + gap + width
    if (nextWidth > availableWidth) break
    usedWidth = nextWidth
    count += 1
  }
  visibleMenuCount.value = count
}

const scheduleNavigatorMeasure = () => {
  if (navigatorResizeFrame) window.cancelAnimationFrame(navigatorResizeFrame)
  navigatorResizeFrame = window.requestAnimationFrame(measureNavigator)
}

onMounted(async () => {
  await nextTick()
  scheduleNavigatorMeasure()
  if (typeof ResizeObserver !== 'undefined') {
    navigatorResizeObserver = new ResizeObserver(scheduleNavigatorMeasure)
    navigatorResizeObserver.observe(navigatorRef.value)
    navigatorResizeObserver.observe(navigatorMeasureRef.value)
  }
  document.fonts?.ready.then(scheduleNavigatorMeasure).catch(() => {})
})

onBeforeUnmount(() => {
  navigatorResizeObserver?.disconnect()
  if (navigatorResizeFrame) window.cancelAnimationFrame(navigatorResizeFrame)
})

watch(
  () => [
    t('button.more'),
    ...menus.value.map(item => item.meta.titleKey ? t(item.meta.titleKey) : item.meta.title),
  ],
  async () => {
    await nextTick()
    scheduleNavigatorMeasure()
  },
)

const activeMenu = computed(() => {
  const { direct } = route.meta
  return direct ? direct : route.name
})

const accountName = computed(() => user.value.nickname || user.value.username || '')
const accountMenus = computed(() => ucenterRoutes.children.filter(
  item => !item.meta?.hidden,
))
const accountMenuTitle = item => t(
  item.meta.menuTitleKey || item.meta.titleKey,
) || item.meta.title
const showAccountMenu = (item) => {
  if (!item?.meta?.need_auth) return true
  return Boolean(user.value?.[item.meta.need_auth] || menuPermissions.value?.[item.meta.need_auth])
}

const expireTime = computed(() => {
  if (!user.value.expire_time) return t('header.permanent')
  return ref(user.value.expire_time.split(' ')[0])
})

const handleCopyAccountName = () => {
  if (!accountName.value) return
  copyText(
    accountName.value,
    t('header.account.userNameCopied'),
    t('header.account.copyFailed'),
  )
}

const handleGoHome = function () {
  toRoute('home')
}

const handlGoCustomer = function () {
  window.open(customerUrl.value, '_blank')
}

const handleGo = function (menu) {
  if (menu.meta.disabled) return false
  toRoute(menu.name)
}

// 跳转页面
const handleGoPage = function (name) {
  toRoute(name)
}

// 退出
const handleLogout = async function () {
  await userApi.logout()
  message(t('message.logoutSuccess'))
  userStore.logout()
  await clearBrowserCache()

  // 非白名单页面，退出后跳转首页
  const index = whiteRoutes.findIndex((item) => item.name === route.name)
  if (index === -1 || ['certify', 'card'].includes(route.name)) {
    await toRoute('home', {}, 'query', { replace: true })
  }

  // 重新创建应用实例，清除当前用户遗留的页面运行时缓存和请求状态。
  window.location.reload()
}
</script>

<style scoped>
.ui-header-content .logo {
  margin-right: 32px;
}
.ui-navigator {
  position: relative;
  gap: 8px;
  overflow: hidden;
}
.ui-navigator a {
  flex: 0 0 auto;
  padding-right: 8px;
  padding-left: 8px;
  white-space: nowrap;
}
.ui-header-content .ui-navigator a + a {
  margin-left: 0;
}
.navigator-more {
  flex: 0 0 auto;
}
.navigator-more-trigger,
.navigator-measure-item {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: var(--ui-padding-0-8);
  height: var(--ui-size-36);
  color: var(--ui-color-text-muted);
  font: inherit;
  font-size: 15px;
  line-height: 36px;
  white-space: nowrap;
}
.navigator-more-trigger {
  border: 0;
  background: transparent;
  cursor: pointer;
}
.navigator-more-trigger:hover,
.navigator-more-trigger:focus-visible,
.navigator-more-trigger.active {
  color: var(--primary-color);
  outline: none;
}
.navigator-more-trigger.active {
  font-weight: 600;
}
.navigator-measure {
  position: absolute;
  top: 0;
  left: 0;
  display: flex;
  gap: 8px;
  width: max-content;
  height: 0;
  visibility: hidden;
  pointer-events: none;
}
.navigator-measure-item {
  flex: 0 0 auto;
  font-weight: 600;
}
.radius-btn,
.spacer,
.link,
.user-action {
  flex-shrink: 0;
}
.radius-btn .text,
.link {
  white-space: nowrap;
}
.user-action {
  margin-left: 20px;
}
.login-btns {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}
.login-btns > button {
  min-width: 66px;
}
.radius-btn {
  display: flex;
  align-items: center;
  margin-left: 8px;
  padding: 6px 9px;
  height: var(--ui-size-26);
  color: var(--ui-color-text-inverse);
  border-radius: var(--ui-radius-15);
  cursor: pointer;
}
.radius-btn .text {
  margin-left: 4px;
}
.customer {
  background: linear-gradient(104deg, #ee8fff 0%, #648eff 111%);
}
.recharge {
  background: linear-gradient(110deg, #ffc053 -2%, #f98a14 110%);
}
.spacer {
  margin: var(--ui-margin-0-8);
  width: var(--ui-size-1);
  height: var(--ui-size-12);
  background-color: #d8d8d8;
}
.link {
  color: var(--ui-color-text-muted);
}
.link:hover {
  text-decoration: underline;
}
.badge {
  margin-left: 5px;
  margin-top: -2px;
  padding: var(--ui-padding-0-5);
  min-width: 16px;
  font-size: 12px;
  color: var(--ui-color-text-inverse);
  text-align: center;
  line-height: 16px;
  border-radius: var(--ui-radius-xl);
  background-color: #ff4e4e;
}
.user-action {
  display: flex;
  align-items: center;
}
.user {
  display: flex;
  align-items: center;
  height: var(--ui-size-32);
  color: var(--text-color);
}
.user .user-avatar {
  background: #d7e3f8;
}
.user .user-name {
  margin: var(--ui-margin-0-10);
  max-width: 120px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.user-action :deep(.ivu-select-dropdown) {
  padding: 0;
  overflow: hidden;
  border-radius: var(--ui-radius-xl);
  box-shadow: 0 12px 32px color-mix(in srgb, var(--text-color) 14%, transparent);
}
.user-drop-menu {
  width: var(--ui-size-360);
  background: var(--white-color);
}
.user-drop-menu .drop-head {
  padding: 18px 18px 16px;
  font-size: 12px;
}
.user-drop-menu .account-info-card {
  margin-inline-start: -6px;
  padding: 5px 4px 4px;
  background:
    linear-gradient(
      180deg,
      color-mix(in srgb, var(--primary-color) 4%, var(--white-color)),
      color-mix(in srgb, var(--grey-color) 3%, var(--white-color))
    );
}
.user-drop-menu .account-info-row {
  display: grid;
  grid-template-columns: minmax(64px, max-content) minmax(0, 1fr) 28px;
  align-items: center;
  gap: 8px;
  min-width: 0;
  padding-left:10px;
  min-height: 28px;
}
.user-drop-menu .account-label {
  max-width: 120px;
  color: var(--grey-color);
  font-size: 14px;
  font-weight: 400;
  line-height: 20px;
  overflow-wrap: anywhere;
}
.user-drop-menu .account-value {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  color: var(--text-color);
  font-size: 14px;
  font-weight: 400;
  line-height: 20px;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.user-drop-menu .account-copy-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 28px;
  width: var(--ui-size-28);
  height: var(--ui-size-28);
  padding: 0;
  color: var(--grey-color);
  border: 0;
  border-radius: var(--ui-radius-sm);
  background: transparent;
  cursor: pointer;
}
.user-drop-menu .account-copy-button:hover,
.user-drop-menu .account-copy-button:focus-visible {
  color: var(--primary-color);
  background: color-mix(in srgb, var(--primary-color) 8%, var(--white-color));
  outline: none;
}
.user-drop-menu .account-membership {
  position: relative;
  margin-top: 14px;
  padding: 13px 14px 12px;
  overflow: hidden;
  border: 1px solid color-mix(in srgb, var(--ui-color-warning) 24%, var(--text-color));
  border-radius: var(--ui-radius-lg);
  background:
    radial-gradient(
      circle at 10% 0,
      color-mix(in srgb, var(--ui-color-warning) 22%, transparent),
      transparent 52%
    ),
    linear-gradient(
      135deg,
      color-mix(in srgb, var(--text-color) 91%, var(--white-color)),
      var(--text-color)
    );
  box-shadow:
    inset 0 1px color-mix(in srgb, var(--white-color) 10%, transparent),
    0 5px 14px color-mix(in srgb, var(--text-color) 13%, transparent);
}
.user-drop-menu .account-membership::after {
  position: absolute;
  right: -22px;
  bottom: -34px;
  width: var(--ui-size-96);
  height: var(--ui-size-96);
  border-radius: var(--ui-radius-circle);
  background: radial-gradient(
    circle,
    color-mix(in srgb, var(--ui-color-warning) 16%, transparent),
    transparent 66%
  );
  content: '';
  pointer-events: none;
}
.user-drop-menu .account-membership-head {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}
.user-drop-menu .vip {
  display: flex;
  align-items: center;
  flex: 0 1 auto;
  max-width: 154px;
  padding: 0;
  min-height: 24px;
  color: color-mix(in srgb, var(--ui-color-warning) 62%, var(--white-color));
  font-size: 13px;
  font-weight: 600;
  background: transparent;
  cursor: pointer;
}
.user-drop-menu .vip span {
  margin-left: 5px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.user-drop-menu .membership-action {
  position: relative;
  z-index: 1;
  display: inline-flex;
  align-items: center;
  gap: 2px;
  flex: 0 0 auto;
  min-width: 0;
  height: var(--ui-size-24);
  padding: 0;
  color: color-mix(in srgb, var(--white-color) 74%, transparent);
  border: 0;
  background: transparent;
  font: inherit;
  font-size: 11px;
  cursor: pointer;
}
.user-drop-menu .membership-action:hover,
.user-drop-menu .membership-action:focus-visible {
  color: var(--white-color);
  outline: none;
}
.user-drop-menu .account-expiry {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px solid color-mix(in srgb, var(--white-color) 10%, transparent);
  line-height: 18px;
}
.user-drop-menu .account-expiry span {
  color: color-mix(in srgb, var(--white-color) 58%, transparent);
  font-size: 11px;
}
.user-drop-menu .account-expiry strong {
  color: var(--white-color);
  font-size: 12px;
  font-weight: 600;
}
.user-drop-menu .links {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 14px 4px;
  padding: 16px 14px 17px;
  border-top: var(--ui-border-divider);
}
.user-drop-menu .account-menu-item {
  position: relative;
  display: flex;
  align-items: center;
  flex-direction: column;
  gap: 8px;
  min-width: 0;
  padding: 2px 3px;
  color: var(--text-color);
  border: 0;
  background: transparent;
  font: inherit;
  cursor: pointer;
}
.user-drop-menu .account-menu-item > span:last-child {
  width: 100%;
  overflow: hidden;
  font-size: 12px;
  line-height: 18px;
  text-align: center;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.user-drop-menu .account-menu-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: var(--ui-size-44);
  height: var(--ui-size-44);
  color: var(--white-color);
  border-radius: var(--ui-radius-2xl);
  box-shadow: 0 4px 10px color-mix(in srgb, var(--text-color) 9%, transparent);
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
}
.user-drop-menu .account-menu-tag {
  position: absolute;
  top: 0;
  right: 6px;
  max-width: 42px;
  padding: 1px 5px;
  overflow: hidden;
  color: var(--white-color);
  border-radius: var(--ui-radius-full);
  background: var(--error-color);
  font-size: 10px;
  line-height: 15px;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.user-drop-menu .account-menu-item:hover .account-menu-icon,
.user-drop-menu .account-menu-item:focus-visible .account-menu-icon {
  transform: translateY(-2px);
  box-shadow: 0 7px 14px color-mix(in srgb, var(--text-color) 14%, transparent);
}
.user-drop-menu .account-menu-item:focus-visible {
  outline: none;
}
.user-drop-menu .account-logout {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  width: calc(100% - 24px);
  height: var(--ui-size-44);
  margin: 0 12px;
  padding: 0;
  color: var(--text-color);
  border: 0;
  border-top: var(--ui-border-divider);
  background: transparent;
  font: inherit;
  cursor: pointer;
}
.user-drop-menu .account-logout:hover,
.user-drop-menu .account-logout:focus-visible {
  color: var(--primary-color);
  outline: none;
}
@media (prefers-reduced-motion: reduce) {
  .user-drop-menu .account-menu-icon {
    transition: none;
  }
}
</style>
