<template>
  <UiPage ref="pageRef" :data="data" row-key="id" isBack>
    <template #tip>
      <p>{{ $t('security.loginRecords.description') }}</p>
    </template>
    <template #item="{item}">
      <div class="item-box" :class="{'is-current': item.is_current === 1}">
        <div class="device-icon">
          <Icon :type="getDeviceIcon(item.login_os)" size="24" />
        </div>
        <div class="device-info">
          <div class="device-title">
            <h4>{{ item.login_os || $t('security.loginRecords.unknownDevice') }}</h4>
            <div class="current-tag" v-if="item.is_current === 1">
              <span class="dot"></span>{{ $t('security.loginRecords.currentLogin') }}
            </div>
          </div>
          <div class="device-browser">
            <Icon :type="getBrowserIcon(item.login_browser)"/> {{ item.login_browser || $t('security.loginRecords.unknownBrowser') }}
          </div>
          <div class="device-meta">
            <div class="meta-row">
              <span class="label">{{ $t('security.loginRecords.ipAddress') }}:</span>
              <span class="value">{{ item.login_ip || '--' }}</span>
            </div>
            <div class="meta-row">
              <span class="label">{{ $t('security.loginRecords.loginTime') }}:</span>
              <span class="value">{{ item.created_at || '--' }}</span>
            </div>
          </div>
        </div>
        <div class="device-action">
          <div class="btn-current" v-if="item.is_current === 1">
            {{ $t('security.loginRecords.currentSession') }}
          </div>
          <Button v-else class="btn-offline" @click="kickDevice(item)">
            <Icon type="md-power" /> {{ $t('security.loginRecords.offline') }}
          </Button>
        </div>
      </div>
    </template>
  </UiPage>
</template>

<script setup>
import { computed, ref,reactive } from 'vue'
import { useUserStore } from '@/utils/store.js'
import { postApi } from '@/utils/api.js'
import { message,confirm } from '@/utils/message.js'
import { t } from '@/utils'

const userStore = useUserStore()
const pageRef=ref(null)
const data=reactive({
    apiUrl:'/user/getLoginTokens',
    notPage:true,
})

const getDeviceIcon = (os) => {
    if (!os) return 'ios-phone-portrait';
    os = os.toLowerCase();9666
    if (os.includes('windows')) return 'logo-windows';
    if (os.includes('mac') || os.includes('apple')) return 'logo-apple';
    if (os.includes('android')) return 'logo-android';
    if (os.includes('linux')) return 'logo-tux';
    if (os.includes('ios') || os.includes('iphone') || os.includes('ipad')) return 'logo-apple';
    return 'ios-phone-portrait';
}

const getBrowserIcon = (browser) => {
    if (!browser) return 'md-browsers';
    browser = browser.toLowerCase();
    if (browser.includes('chrome')) return 'logo-chrome';
    if (browser.includes('safari')) return 'logo-apple';
    if (browser.includes('firefox')) return 'logo-firefox';
    if (browser.includes('edge')) return 'logo-edge';
    if (browser.includes('app')) return 'md-phone-portrait';
    return 'md-browsers';
}

const getBrowserIconColor = (browser) => {
    if (!browser) return '#9ca3af';
    browser = browser.toLowerCase();
    if (browser.includes('chrome')) return '#ef4444';
    if (browser.includes('firefox')) return '#f97316';
    if (browser.includes('edge')) return '#3b82f6';
    if (browser.includes('safari')) return '#3b82f6';
    return '#6b7280';
}

const kickDevice = (device) => {
  confirm(t('security.loginRecords.confirmContent')).then(()=>{
    postApi('/user/auth/offline', { token: device.token }).then(() => {
        message(t('security.loginRecords.offlineSuccess'))
        pageRef.value.search()
    }).catch(err => {
        message(err?.msg || t('security.loginRecords.failed'), 'error')
    })
  })
}
</script>

<style scoped lang="less">
.item-box {
  background-color: #fff;
  border-radius: var(--ui-radius-2xl);
  padding: var(--ui-padding-16-20);
  box-sizing: border-box;
  border: var(--ui-border-subtle);
  display: flex;
  gap: 16px;
  position: relative;
  overflow: hidden;
  transition: all 0.3s;

  &.is-current {
    &::before {
      content: '';
      position: absolute;
      left: 0;
      top: 0;
      bottom: 0;
      width: var(--ui-size-4);
      background-color: #10b981;
      border-radius: 4px 0 0 4px;
    }
  }

  .device-icon {
    width: var(--ui-size-48);
    height: var(--ui-size-48);
    border-radius: var(--ui-radius-2xl);
    background-color: #f8f9fa;
    border: 1px solid #f0f2f5;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    color: #1c1c1e;
  }

  .device-info {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 4px;

    .device-title {
      display: flex;
      align-items: center;
      gap: 12px;
      height: var(--ui-size-32);
      h4 {
        font-size: 16px;
        color: var(--ui-color-neutral-900);
        margin: 0;
        font-weight: 600;
      }
      .current-tag {
        display: flex;
        align-items: center;
        gap: 6px;
        background-color: #ecfdf5;
        color: #10b981;
        padding: var(--ui-padding-4-10);
        border-radius: var(--ui-radius-3xl);
        font-size: 12px;
        font-weight: 500;
        .dot {
          width: var(--ui-size-6);
          height: var(--ui-size-6);
          background-color: #10b981;
          border-radius: var(--ui-radius-circle);
        }
      }
    }

    .device-browser {
      width: fit-content;
      display: flex;
      align-items: center;
      gap: 6px;
      color: var(--ui-color-neutral-700);
      background-color: #f8fafc;
      border: var(--ui-border-muted);
      border-radius:var(--ui-radius-sm);
      padding: var(--ui-padding-0-6);
      overflow: hidden;
      font-size: 14px;
      .ivu-icon {
        font-size: 16px;
      }
    }

    .device-meta {
      display: flex;
      flex-direction: column;
      gap: 4px;
      margin-top: 2px;
      .meta-row {
        font-size: 13px;
        display: flex;
        align-items: center;
        gap: 8px;
        .label {
          color: var(--ui-color-neutral-550);
        }
        .value {
          color: var(--ui-color-neutral-700);
        }
      }
    }
  }

  .device-action {
    display: flex;
    align-items: center;
    align-self: center;

    .btn-current {
      background-color: #f3f4f6;
      color: var(--ui-color-neutral-700);
      padding: 6px 14px;
      border-radius: var(--ui-radius-6);
      font-size: 13px;
      font-weight: 500;
    }

    :deep(.ivu-btn.btn-offline) {
      border: 1px solid #fca5a5;
      color: #ef4444;
      background-color: #fff;
      border-radius: var(--ui-radius-6);
      padding: var(--ui-padding-0-14);
      height: var(--ui-size-32);
      font-weight: 500;
      font-size: 13px;

      &:hover {
        background-color: #fef2f2;
        border-color: #ef4444;
      }
      .ivu-icon {
        font-size: 14px;
        font-weight: bold;
      }
    }
  }

  @media screen and (max-width: 768px) {
    flex-wrap: wrap;
    gap: 16px;
    padding: var(--ui-padding-16);

    .device-info {
      flex: 1 1 0%;
      min-width: 0;
    }

    .device-action {
      width: 100%;
      display: flex;
      justify-content: flex-end;
      padding-top: 12px;
      margin-top: -4px;
      border-top: 1px dashed #f0f0f0;
    }
  }
}
</style>
