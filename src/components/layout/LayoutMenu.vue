<template>
  <nav class="ui-menu" :class="{ 'is-collapsed': collapsed }">
    <div class="logo">
      <LogoBox :collapsed="collapsed" />
    </div>
    <div class="menu-list">
      <div
        class="account-menu-item"
        :class="{
          active:(route.meta.direct || route.name)===item.name
        }"
        @click="handleGoPage(item.name)"
        v-for="item in accountMenus"
        :key="item.name"
         v-show="showAccountMenu(item)"
        :title="accountMenuTitle(item)"
      >
        <span class="iconfont" :class="item.meta?.menuIcon || 'icon-CRMEB-xiadanjianshu-mianxing'"></span>
        <span class="account-menu-title">{{ accountMenuTitle(item) }}</span>
      </div>
      <div
        class="account-menu-item"
        :class="{
          active:route.query.url===item.url
        }"
        v-for="item in menus"
        :key="item.name"
        :title="item.title"
        @click="handleSelect(item)"
      >
        <span class="iconfont" :style="{
          fontSize:item.fontSize,
        }" :class="item.icon || 'icon-CRMEB-xiadanjianshu-mianxing'"></span>
        <span class="account-menu-title">{{ item.title }}</span>
      </div>
    </div>
    <div v-if="!collapsed" class="user-balance">
      <div class="balance-header">
        <div class="balance-title">
          <span class="label">{{ $t('dashboard.availableBalance') }}</span>
          <Tooltip
            placement="right"
            :max-width="280"
            transfer
          >
            <button
              class="frozen-info-trigger"
              type="button"
              :aria-label="$t('header.frozenAmount')"
            >
              <Icon type="ios-help-circle-outline" :size="14" />
            </button>
            <template #content>
              <div class="frozen-tooltip">
                <div class="frozen-tooltip-row">
                  <span class="frozen-tooltip-label">{{ $t('header.frozenAmount') }}</span>
                  <strong class="frozen-tooltip-value">
                    {{ `$${user.freeze_amount ?? 0}` }}
                  </strong>
                </div>
                <div class="frozen-tooltip-row">
                  <span class="frozen-tooltip-label">{{ $t('header.frozenDate') }}</span>
                  <span class="frozen-tooltip-value">{{ user.freezed_at || '-' }}</span>
                </div>
              </div>
            </template>
          </Tooltip>
        </div>
        <button class="recharge-link" type="button" @click="handleGoPage('ucenter_deposit')">
          {{ $t('dashboard.recharge') }}
        </button>
      </div>
      <div class="balance-value">
        <div class="balance-amount">
          <span class="currency-symbol">$</span>
          <span class="value" :title="`$${user.money || 0}`">{{ user.money || 0 }}</span>
        </div>
        <button
          class="balance-refresh"
          type="button"
          :aria-label="$t('button.refresh')"
          :title="$t('button.refresh')"
          :disabled="isBalanceRefreshing"
          @click="refreshBalance"
        >
          <Icon type="md-refresh" :class="{ rotating: isBalanceRefreshing }" :size="12" />
        </button>
      </div>
    </div>
    <div v-if="user.is_admin" class="admin-footer">
      <div class="admin-info account-menu-item" @click="handleGoPage('marketing')">
        <span class="iconfont icon-shezhi"></span>
        <span>{{ $t('menu.manage') }}</span>
      </div>
    </div>
  </nav>
</template>

<script setup>
import LogoBox from '@/views/components/LogoBox/index.vue'
import { ucenterRoutes} from '@/router/router.js'
import { computed,ref,onMounted} from 'vue'
import Decimal from 'decimal.js'
import { toRoute} from '@/utils/route.js'
import { useRoute } from 'vue-router'
const route = useRoute()
import { useUserStore, useUserStoreRefs } from '@/utils/store.js'
const {user,menuPermissions } = useUserStoreRefs()
import { t } from '@/utils/index.js'
import { getApi } from '@/utils/api.js'
defineProps({ collapsed: Boolean })
const menus = ref([])
const userStore = useUserStore()
const isBalanceRefreshing = ref(false)
const hasFrozenAmount = computed(() => {
  try {
    return new Decimal(user.value?.freeze_amount ?? 0).greaterThan(0)
  } catch {
    return false
  }
})
const accountMenus = computed(() =>ucenterRoutes.children.filter(
  item => !item.meta?.hidden,
))

const getMenus=()=>{
  getApi('/user/agentSite/menus').then(res=>{
    menus.value = res || []
  })
}
const accountMenuTitle = (item) => {
  const name= t(
  item.meta.menuTitleKey || item.meta.titleKey,
) || item.meta.title
  return  name
}


const showAccountMenu = (item) => {
  if (!item?.meta?.need_auth) return true
  return Boolean(user.value?.[item.meta.need_auth] || menuPermissions.value?.[item.meta.need_auth])
}

const handleSelect = (row) => {
  if(row.open_type===0){
    toRoute('iframe',{url:row.url})
  }else{
    window.open(row.url,'_blank')
  }
}
const refreshBalance = async () => {
  if (isBalanceRefreshing.value) return
  isBalanceRefreshing.value = true
  try {
    await userStore.getUserInfo()
  } finally {
    isBalanceRefreshing.value = false
  }
}
// 跳转页面
const handleGoPage =  (name) =>{
  toRoute(name)
}
onMounted(()=>{
  getMenus()
})
</script>

<style scoped lang="less">
.account-menu-item{
  position: relative;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 0 8px;
  box-sizing: border-box;
  height: 44px;
  line-height: 44px;
  cursor: pointer;
  color: var(--menu-text-color);
  transition: color .16s ease, background-color .16s ease;
  .iconfont{
    font-size: 18px;
  }
  &:hover{
    color: var(--menu-text-strong-color);
    background: var(--menu-surface-hover-color);
  }
  &.active{
    color: var(--menu-text-strong-color);
    background: linear-gradient(
      105deg,
      color-mix(in srgb, var(--ui-color-primary) 76%, var(--ui-color-text)) 0%,
      var(--ui-color-primary) 44%,
      color-mix(in srgb, var(--ui-color-primary) 72%, var(--ui-color-surface)) 100%
    );
  }
}
.ui-menu{
  position: relative;
  display: flex;
  flex-direction: column;
  height: 100vh;
  color: var(--menu-text-color);
  .logo{
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 16px;
    height: var(--app-shell-header-height);
    border-bottom: 1px solid var(--menu-border-color);
    box-sizing: border-box;
    :deep(.logoText){
      color: var(--menu-text-strong-color);
    }
  }
  .menu-list{
    flex: 1;
    overflow-x: hidden;
    display: flex;
    flex-direction: column;
    gap: 4px;
    padding: 12px 10px;
    .account-menu-item{
      padding: 0 10px;
      border: 0;
      border-radius: 8px;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 10px;
      .iconfont{
        width: 28px;
        height: 28px;
        flex: none;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: color .16s ease;
      }
      .account-menu-title{
        overflow: hidden;
        font-size: 14px;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      &.active .iconfont{
        color: var(--menu-text-strong-color);
      }
    }
  }
  .user-balance{
    position: relative;
    overflow: hidden;
    margin: 10px;
    padding: 14px;
    border: 1px solid color-mix(in srgb, var(--menu-neon-color) 22%, var(--menu-border-color));
    border-radius: 12px;
    background: var(--menu-surface-color);
    box-shadow:
      inset 0 1px 0 rgba(255, 255, 255, 0.06),
      0 10px 28px color-mix(in srgb, var(--ui-color-primary) 14%, transparent),
      0 0 18px color-mix(in srgb, var(--menu-neon-color) 8%, transparent);
    transition:
      border-color .22s cubic-bezier(.16, 1, .3, 1),
      box-shadow .22s cubic-bezier(.16, 1, .3, 1);
    &:hover{
      border-color: color-mix(in srgb, var(--menu-neon-color) 55%, var(--menu-border-color));
      box-shadow:
        inset 0 1px 0 rgba(255, 255, 255, 0.1),
        0 12px 32px color-mix(in srgb, var(--ui-color-primary) 18%, transparent),
        0 0 24px color-mix(in srgb, var(--menu-neon-color) 18%, transparent);
    }
    .balance-header{
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
    }
    .balance-title{
      display: flex;
      align-items: center;
      min-width: 0;
      gap: 6px;
    }
    .label{
      overflow: hidden;
      color: var(--menu-text-muted-color);
      font-size: 12px;
      font-weight: 500;
      line-height: 18px;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .frozen-info-trigger{
      display: inline-flex;
      flex: none;
      align-items: center;
      justify-content: center;
      width: 18px;
      height: 18px;
      padding: 0;
      border: 0;
      border-radius: 50%;
      color: var(--menu-text-muted-color);
      background: transparent;
      cursor: help;
      transition: color .16s ease, background-color .16s ease;
      &:hover,
      &:focus-visible{
        color: var(--menu-text-strong-color);
        background: var(--menu-surface-hover-color);
      }
      &:focus-visible{
        outline: var(--ui-outline-primary);
        outline-offset: 1px;
      }
    }
    .recharge-link{
      flex: none;
      padding: 3px 10px;
      border: 0;
      border-radius: 6px;
      color: var(--menu-text-strong-color);
      font: inherit;
      font-size: 12px;
      font-weight: 600;
      line-height: 18px;
      cursor: pointer;
      background: var(--ui-color-primary);
      transition: background-color .16s ease, transform .16s ease;
      &:hover{
        background: color-mix(in srgb, var(--ui-color-primary) 94%, var(--ui-color-surface));
      }
      &:active{
        transform: scale(.97);
      }
      &:focus-visible{
        outline: var(--ui-outline-primary);
        outline-offset: 2px;
      }
    }
    .balance-refresh{
      display: inline-flex;
      flex: none;
      align-items: center;
      justify-content: center;
      width: 20px;
      height: 20px;
      padding: 0;
      border: 0;
      border-radius: 6px;
      color: var(--menu-text-muted-color);
      background: transparent;
      cursor: pointer;
      transition: color .16s ease, background-color .16s ease;
      &:hover:not(:disabled){
        color: var(--menu-text-strong-color);
        background: var(--menu-surface-hover-color);
      }
      &:disabled{
        opacity: .5;
        cursor: default;
      }
      &:focus-visible{
        outline: var(--ui-outline-primary);
        outline-offset: 2px;
      }
      .rotating{
        animation: balance-refresh-rotate .8s linear infinite;
      }
    }
    .balance-value{
      display: flex;
      align-items: flex-end;
      min-width: 0;
      margin-top: 8px;
      line-height: 28px;
      .balance-refresh{
        margin-left: 6px;
      }
    }
    .balance-amount{
      display: flex;
      flex: 0 1 auto;
      align-items: baseline;
      min-width: 0;
    }
    .currency-flag{
      flex: none;
      margin-right: 8px;
      font-size: 22px;
      line-height: 1;
    }
    .value{
      overflow: hidden;
      color: var(--menu-text-strong-color);
      font-size: 22px;
      font-weight: 650;
      letter-spacing: -.3px;
      line-height: 28px;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .currency-symbol{
      flex: none;
      margin-right: 4px;
      color: var(--menu-text-color);
      font-size: 14px;
      font-weight: 600;
      line-height: 20px;
    }
  }
  &.is-collapsed{
    .logo{
      padding-right: 8px;
      padding-left: 8px;
    }
    .menu-list{
      padding-right: 8px;
      padding-left: 8px;
      .account-menu-item{
        justify-content: center;
        flex-direction: column;
        gap: 2px;
        height: 52px;
        padding-top: 5px;
        padding-bottom: 5px;
        line-height: normal;
        padding-right: 0;
        padding-left: 0;
        .iconfont{
          width: 26px;
          height: 26px;
        }
        .account-menu-title{
          display: block;
          width: 100%;
          overflow: hidden;
          font-size: 10px;
          line-height: 14px;
          text-align: center;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
      }
    }
    .admin-info{
      justify-content: center;
      span:last-child{
        display: none;
      }
    }
    .admin-footer{
      padding-right: 8px;
      padding-left: 8px;
    }
  }
}
.frozen-tooltip{
  min-width: 210px;
  font-size: 12px;
  line-height: 18px;
}
.frozen-tooltip-row{
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  gap: 12px;
  & + &{
    margin-top: 4px;
  }
}
.frozen-tooltip-label{
  color: color-mix(in srgb, var(--ui-color-text-inverse) 72%, transparent);
  white-space: nowrap;
}
.frozen-tooltip-value{
  min-width: 0;
  color: var(--ui-color-text-inverse);
  font-weight: 600;
  text-align: right;
  overflow-wrap: anywhere;
}
.admin-footer{
  padding: 0 10px 10px;
}
.admin-info{
  margin: 0;
  padding: 0 10px;
  border-radius: 8px;
  justify-content: center;
  gap: 6px;
  color: var(--menu-text-color);
  background: var(--menu-surface-hover-color);
  font-size: 12px;
  .iconfont{
    display: flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    flex: none;
    font-style:18px;
  }
  &:hover{
    color: var(--menu-text-strong-color);
    background: var(--ui-color-primary);
  }
}
@keyframes balance-refresh-rotate {
  to {
    transform: rotate(360deg);
  }
}
@media (prefers-reduced-motion: reduce) {
  .user-balance{
    transition: none;
  }
}
</style>
