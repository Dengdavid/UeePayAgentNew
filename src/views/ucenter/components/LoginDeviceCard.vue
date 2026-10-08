<template>
  <div class="item-box" :class="{ 'is-current': isCurrent }">
    <div class="device-icon">
      <slot name="icon">
        <Icon :type="getDeviceIcon(device.login_os)" size="24" />
      </slot>
    </div>
    <div class="device-info">
      <div class="device-summary">
        <div class="device-title">
          <h4>{{ device.login_os || $t('security.loginRecords.unknownDevice') }}</h4>
          <div class="current-tag" v-if="isCurrent">
            <span class="dot"></span>{{ $t('security.loginRecords.currentLogin') }}
          </div>
        </div>
        <div class="device-browser">
          <Icon :type="getBrowserIcon(device.login_browser)"/> <bdi>{{ device.login_browser || $t('security.loginRecords.unknownBrowser') }}</bdi>
        </div>
      </div>
      <div class="device-meta">
        <div class="meta-row">
          <span class="label">{{ $t('security.loginRecords.ipAddress') }}:</span>
          <span class="value">{{ device.login_ip || '--' }}</span>
        </div>
        <div class="meta-row">
          <span class="label">{{ $t('security.loginRecords.loginTime') }}:</span>
          <span class="value">{{ device.created_at || '--' }}</span>
        </div>
      </div>
    </div>
    <div v-if="$slots.action" class="device-action">
      <slot name="action" />
    </div>
  </div>
</template>

<script setup>
defineProps({
  device: { type: Object, default: () => ({}) },
  isCurrent: { type: Boolean, default: false },
})

const getDeviceIcon = (os) => {
    if (!os) return 'ios-phone-portrait';
    os = os.toLowerCase();
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

</script>

<style scoped lang="less">
.item-box {
  background-color: var(--ui-color-surface);
  border-radius: var(--ui-radius-2xl);
  padding: var(--ui-padding-16-20);
  box-sizing: border-box;
  border: var(--ui-border-subtle);
  display: flex;
  gap: 16px;
  position: relative;
  overflow: hidden;

  &.is-current {
    &::before {
      content: '';
      position: absolute;
      inset-inline-start: 0;
      top: 0;
      bottom: 0;
      width: var(--ui-size-4);
      background-color: var(--ui-color-success);
      border-radius: 4px 0 0 4px;
    }
  }

  .device-icon {
    width: var(--ui-size-48);
    height: var(--ui-size-48);
    border-radius: var(--ui-radius-2xl);
    background-color: var(--ui-color-surface-muted);
    border: var(--ui-border-subtle);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    color: var(--ui-color-text);
  }

  .device-summary { display: contents; }

  .device-info {
    flex: 1;
    min-width: 0;
    overflow-wrap: anywhere;
    display: flex;
    flex-direction: column;
    gap: 4px;

    .device-title {
      display: flex;
      align-items: center;
      gap: 12px;
      min-height: var(--ui-size-32);
      flex-wrap: wrap;
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
        background-color: color-mix(in srgb, var(--ui-color-success) 8%, var(--ui-color-surface));
        color: var(--ui-color-success);
        padding: var(--ui-padding-4-10);
        border-radius: var(--ui-radius-3xl);
        font-size: 12px;
        font-weight: 500;
        .dot {
          width: var(--ui-size-6);
          height: var(--ui-size-6);
          background-color: var(--ui-color-success);
          border-radius: var(--ui-radius-circle);
        }
      }
    }

    .device-browser {
      width: fit-content;
      max-width: 100%;
      display: flex;
      align-items: center;
      gap: 6px;
      color: var(--ui-color-neutral-700);
      background-color: var(--ui-color-surface-muted);
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
        align-items: baseline;
        flex-wrap: wrap;
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
      border-top: var(--ui-border-width) dashed var(--ui-color-border-subtle);
    }
  }
}
</style>
