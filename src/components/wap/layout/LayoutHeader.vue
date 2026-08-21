<template>
  <div class="header-phone" >
    <div class="logo" @click="toRoute('home')">
      <img src="@/assets/images/logo.png" />
    </div>
    <div class="user" >
      <MessageBox />
      <GlobalPreferences :authenticated="isLogin" compact />
      <div class="name" v-if="isLogin">
        <Dropdown ref="userRef" trigger="click">
            <a class="userName" href="javascript:void(0)">
              {{ user?.nickname || user?.username || $t('header.unnamed') }}
                <Icon type="ios-arrow-down"></Icon>
            </a>
            <template #list>
              <div class="userThead">
                <div class="user-info-card" @click="toRoute('pricing')">
                  <div class="vip-badge">
                    <Icon custom="iconfont icon-vip" :size="16"></Icon>
                    <span class="vip-title">{{ userGroup.title }}</span>
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
                    <Button class="recharge-btn" long  @click="()=>{
                      userClose()
                      toRoute('ucenter_deposit')
                    }">
                      {{ $t('header.rechargeNow') }}
                    </Button>
                  </div>
                  <div class="price-item" v-if="user.freeze_amount>0">
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
  </div>
</template>

<script setup>
import MessageBox from '@/components/wap/layout/components/MessageBox.vue'
import GlobalPreferences from '@/components/layout/GlobalPreferences.vue'
import dayjs from 'dayjs'
import { computed, ref ,onMounted} from 'vue'
import { toRoute,useRoute } from '@/utils/route.js'
import { whiteRoutes } from '@/router/router.js'
const route = useRoute()
import { message,confirm } from '@/utils/message.js'
import { postApi } from '@/utils/api.js'
import { t } from '@/utils/index.js'
import { clearBrowserCache } from '@/utils/preferences.js'
import { useUserStoreRefs } from '@/utils/store'
import { useUserStore } from '@/store/user.js'
const userStore=useUserStore()
const { user, userGroup,isLogin } = useUserStoreRefs()
const expireTime = computed(() => {
  if (!user.value.expire_time) return t('header.permanent')
  return ref(user.value.expire_time.split(' ')[0])
})
const userRef=ref(null)
const userClose=()=>{
  userRef.value.currentVisible = false
}
// 退出
const handleLogout = () =>{
   userClose()
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
</script>

<style scoped lang="less">
.header-phone{
  height:var(--ui-size-50);
  background: rgba(255, 255, 255, 0.6);
  backdrop-filter: blur(100px);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--ui-padding-4-12);
  border-bottom: 1px #eee solid;
  .logo{
    img{
      display: block;
      max-height:22px;
    }
  }
  .user{
    display: flex;
    align-items: center;
    gap:16px;
    .name{
      .userName{
        color: var(--ui-color-text);
      }

    }
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
      color: var(--ui-color-gold-300);

      .vip-title {
        font-size: 14px;
        font-weight: 600;
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
