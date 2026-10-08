<script setup>
import { computed } from 'vue'
import { hasCardPermission } from '@/utils/permission'
import { t } from '@/utils'
import { useKeyboardViewportOffset } from '@/composables/useKeyboardViewportOffset.js'
import UIArrMembers from '@/components/uiForm/UIArrMembers/index.vue'

const { isKeyboardOpen, keyboardOffset } = useKeyboardViewportOffset()

const props = defineProps({
  detail: { type: Object, required: true },
  loadingDetail: { type: Boolean, default: false },
  actionsDisabled: { type: Boolean, default: false },
  changingStatus: { type: Boolean, default: false },
  can: { type: Function, required: true },
})
defineEmits(['copy', 'transfer', 'collect', 'edit', 'status', 'openCard', 'refresh'])
const statusText = computed(() => props.detail.status == null ? 0 : Number(props.detail.status) === 0 ? t('card.index.sharedManagement.normal') : Number(props.detail.status) === 1 ? t('card.index.sharedManagement.disabled') : Number(props.detail.status) === 2 ? t('card.index.sharedManagement.locked') : 0)
const noticeChannels = computed(() => (props.detail.notice_channels || []).filter(channel => ['notice', 'email', 'member'].includes(channel)).map(channel => channel === 'notice' ? t('notificationSettings.onsite') : t(`card.index.sharedForm.${channel}`)).join('、'))
const enabledText = value => value == null ? 0 : t(`card.index.sharedManagement.${Number(value) === 1 ? 'enabled' : 'notEnabled'}`)
</script>

<template>
  <UiPage isNotTitle isAuto :padding="0">
    <CardBox>
      <div class="account-overview">
        <header class="account-header">
          <div class="account-heading">
            <div class="account-name">
              <h2 :title="detail.name">{{ detail.name || '-' }}</h2>
              <UITag :title="statusText" :type="detail.status == null ? 'default' : ({ 0: 'success', 1: 'error', 2: 'error' })[Number(detail.status)] || 'default'" />
            </div>
            <p class="account-id">
              <span>{{ t('card.index.sharedManagement.id') }} · {{ detail.id ?? '-' }}</span>
              <Tooltip :disabled="!!detail.id" :content="t('counts.noPermission')" placement="top" transfer>
                <span class="action-tooltip-trigger" :tabindex="(detail.id) ? undefined : 0" :aria-label="(detail.id) ? undefined : t('counts.noPermission')">
                  <Button type="text" size="small" custom-icon="iconfont icon-fuzhi" :disabled="loadingDetail" :title="t('card.index.sharedManagement.copyId')" :aria-label="t('card.index.sharedManagement.copyId')" @click="(detail.id) && $emit('copy')" />
                </span>
              </Tooltip>
            </p>
          </div>
          <p class="account-purpose"><span>{{ t('card.index.sharedForm.remark') }}</span>{{ detail.remark || 0 }}</p>
        </header>
        <div class="account-funds">
          <div class="account-available">
            <div class="account-available-label">
              <span>{{ t('card.index.sharedManagement.walletBalance') }}</span>
            </div>
            <p>
              <strong><UiMoney :value="detail.amount || 0" tone="negative" /></strong>
              <button class="refresh-btn" :class="{ refreshing: loadingDetail }" type="button" :disabled="loadingDetail" :aria-label="t(loadingDetail ? 'card.index.detail.statistics.refreshingBalance' : 'card.index.detail.statistics.refreshBalance')" @click="$emit('refresh')">
                <Icon type="md-refresh" size="14" />
              </button>
              <span class="account-gap-operator" aria-hidden="true">＝</span>
            </p>
          </div>
          <dl class="account-metrics">
            <div>
              <span class="account-operator account-equals" aria-hidden="true">＝</span>
              <dt>
                <span>{{ t('card.index.sharedManagement.totalRecharge') }}</span>
              </dt>
              <dd><UiMoney :value="detail.clear_transfer_amount || 0" /><span class="account-gap-operator" aria-hidden="true">−</span></dd>
            </div>
            <div>
              <span class="account-operator" aria-hidden="true">−</span>
              <dt>{{ t('card.index.sharedManagement.totalConsumption') }}</dt>
              <dd><UiMoney :value="detail.clear_deduction_amount || 0" /><span class="account-gap-operator" aria-hidden="true"></span></dd>
            </div>
          </dl>
        </div>
        <div class="account-sections">
          <section class="account-section">
            <div class="account-section-heading">
              <Icon type="md-people" :size="18" aria-hidden="true" />
              <h3>{{ t('card.index.sharedForm.scope') }}</h3>
            </div>
            <dl>
              <div><dt>{{ t('card.index.sharedForm.groups') }}</dt><dd>
                <UIArrMembers :class="{ 'ui-text-grey': !detail.team_groups?.length }" :data="detail.team_groups" name-key="name" :title="t('card.index.sharedForm.groups')" :empty-text="t('card.index.sharedManagement.notSet')" />
              </dd></div>
              <div><dt>{{ t('card.index.sharedForm.accounts') }}</dt><dd>
                <UIArrMembers
                  :class="{ 'ui-text-grey': !detail.accounts?.length }"
                  :data="detail.accounts?.map(account => account.nickname || String(account.id))"
                  :title="t('card.index.sharedForm.accounts')"
                  :empty-text="t('card.index.sharedManagement.notSet')"
                  :count-formatter="count => t('ucenterAccount.memberPicker.memberCount', { count })"
                >
                  <template #item-icon><Icon type="md-person" :size="18" /></template>
                </UIArrMembers>
              </dd></div>
            </dl>
          </section>
          <section class="account-section">
            <div class="account-section-heading">
              <Icon type="md-repeat" :size="18" aria-hidden="true" />
              <h3 :title="t('card.index.sharedManagement.autoRechargeTitle')">{{ t('card.index.sharedManagement.autoRechargeTitle') }}</h3>
              <UITag class="account-setting-status" :title="enabledText(detail.auto_recharge_enabled)" :type="Number(detail.auto_recharge_enabled) === 1 ? 'success' : 'default'" />
            </div>
            <dl>
              <div><dt>{{ t('card.index.sharedForm.threshold') }}</dt><dd><UiMoney v-if="Number(detail.auto_recharge_enabled) === 1" :value="detail.auto_recharge_threshold ?? 0" :decimals="null" /><span v-else class="ui-text-grey">{{ t('card.index.sharedManagement.notSet') }}</span></dd></div>
              <div><dt>{{ t('card.index.sharedForm.rechargeAmount') }}</dt><dd><UiMoney v-if="Number(detail.auto_recharge_enabled) === 1" :value="detail.auto_recharge_amount ?? 0" :decimals="null" /><span v-else class="ui-text-grey">{{ t('card.index.sharedManagement.notSet') }}</span></dd></div>
            </dl>
          </section>
          <section class="account-section">
            <div class="account-section-heading">
              <Icon type="md-notifications" :size="18" aria-hidden="true" />
              <h3 :title="t('card.index.sharedManagement.lowBalanceTitle')">{{ t('card.index.sharedManagement.lowBalanceTitle') }}</h3>
              <UITag class="account-setting-status" :title="enabledText(detail.low_balance_notice_enabled)" :type="Number(detail.low_balance_notice_enabled) === 1 ? 'success' : 'default'" />
            </div>
            <dl>
              <div><dt>{{ t('card.index.sharedManagement.lowBalanceThreshold') }}</dt><dd><UiMoney v-if="Number(detail.low_balance_notice_enabled) === 1" :value="detail.low_balance_threshold ?? 0" :decimals="null" /><span v-else class="ui-text-grey">{{ t('card.index.sharedManagement.notSet') }}</span></dd></div>
              <div><dt>{{ t('card.index.sharedForm.channels') }}</dt><dd :class="{ 'ui-text-grey': Number(detail.low_balance_notice_enabled) !== 1 }">{{ Number(detail.low_balance_notice_enabled) === 1 ? noticeChannels || 0 : t('card.index.sharedManagement.notSet') }}</dd></div>
            </dl>
          </section>
        </div>
        <div class="account-footer">
          <dl class="account-times">
            <div><dt><Icon custom="iconfont icon-shijian1" aria-hidden="true" />{{ t('card.index.sharedManagement.updatedAt') }}</dt><dd>{{ detail.updated_at ?? 0 }}</dd></div>
          </dl>
          <div class="account-actions-space">
            <div class="account-actions" :class="{ 'is-keyboard-open': isKeyboardOpen }" :style="{ '--keyboard-offset': `${keyboardOffset}px` }">
              <Tooltip :disabled="hasCardPermission('create', true)" :content="t('counts.noPermission')" placement="top" transfer>
                <span class="action-tooltip-trigger" :tabindex="(hasCardPermission('create', true)) ? undefined : 0" :aria-label="(hasCardPermission('create', true)) ? undefined : t('counts.noPermission')">
                  <Button custom-icon="iconfont icon-yinhangka-m" :title="t('card.index.bills.typeMap.Create')" type="primary" :disabled="!(hasCardPermission('create', true)) || actionsDisabled || detail.status == null || Number(detail.status) !== 0" @click="(hasCardPermission('create', true)) && $emit('openCard')">{{ t('card.index.bills.typeMap.Create') }}</Button>
                </span>
              </Tooltip>
              <Tooltip :disabled="can('shared_wallet.transfer')" :content="t('counts.noPermission')" placement="top" transfer>
                <span class="action-tooltip-trigger" :tabindex="(can('shared_wallet.transfer')) ? undefined : 0" :aria-label="(can('shared_wallet.transfer')) ? undefined : t('counts.noPermission')">
                  <Button type="primary" ghost custom-icon="iconfont icon-recharge" :title="t('card.index.sharedManagement.transfer')" :disabled="!(can('shared_wallet.transfer')) || actionsDisabled || detail.status == null || Number(detail.status) !== 0" @click="(can('shared_wallet.transfer')) && $emit('transfer')">{{ t('card.index.sharedManagement.transfer') }}</Button>
                </span>
              </Tooltip>
              <Tooltip :disabled="can('shared_wallet.collect')" :content="t('counts.noPermission')" placement="top" transfer>
                <span class="action-tooltip-trigger" :tabindex="(can('shared_wallet.collect')) ? undefined : 0" :aria-label="(can('shared_wallet.collect')) ? undefined : t('counts.noPermission')">
                  <Button type="warning" ghost class="action-collect" custom-icon="iconfont icon-withdraw" :title="t('card.index.sharedManagement.collect')" :disabled="!(can('shared_wallet.collect')) || actionsDisabled || detail.status == null || Number(detail.status) !== 0" @click="(can('shared_wallet.collect')) && $emit('collect')">{{ t('card.index.sharedManagement.collect') }}</Button>
                </span>
              </Tooltip>
              <Tooltip :disabled="can(Number(detail.status) === 0 ? 'shared_wallet.disable' : 'shared_wallet.enable')" :content="t('counts.noPermission')" placement="top" transfer>
                <span class="action-tooltip-trigger" :tabindex="(can(Number(detail.status) === 0 ? 'shared_wallet.disable' : 'shared_wallet.enable')) ? undefined : 0" :aria-label="(can(Number(detail.status) === 0 ? 'shared_wallet.disable' : 'shared_wallet.enable')) ? undefined : t('counts.noPermission')">
                  <Button :type="Number(detail.status) === 0 ? 'error' : 'success'" ghost class="action-status" :custom-icon="Number(detail.status) === 0 ? 'iconfont icon-freeze' : 'iconfont icon-unlock'" :title="t(`card.index.sharedManagement.${Number(detail.status) === 0 ? 'disable' : 'enable'}`)" :disabled="!(can(Number(detail.status) === 0 ? 'shared_wallet.disable' : 'shared_wallet.enable')) || actionsDisabled || detail.status == null || ![0, 1].includes(Number(detail.status))" :loading="changingStatus" @click="(can(Number(detail.status) === 0 ? 'shared_wallet.disable' : 'shared_wallet.enable')) && $emit('status')">{{ t(`card.index.sharedManagement.${Number(detail.status) === 0 ? 'disable' : 'enable'}`) }}</Button>
                </span>
              </Tooltip>
              <Tooltip :disabled="can('shared_wallet.update')" :content="t('counts.noPermission')" placement="top" transfer>
                <span class="action-tooltip-trigger" :tabindex="(can('shared_wallet.update')) ? undefined : 0" :aria-label="(can('shared_wallet.update')) ? undefined : t('counts.noPermission')">
                  <Button custom-icon="iconfont icon-edit" :title="t('ucenterAccount.action.edit')" :disabled="!(can('shared_wallet.update')) || actionsDisabled || detail.status == null || Number(detail.status) !== 0" @click="(can('shared_wallet.update')) && $emit('edit')">{{ t('ucenterAccount.action.edit') }}</Button>
                </span>
              </Tooltip>
            </div>
          </div>
        </div>
      </div>
    </CardBox>
  </UiPage>
</template>

<style lang="less" scoped>
.wallet-overview-card {
  border-radius: var(--ui-radius-2xl);
  box-shadow: var(--ui-shadow-surface);
}

.account-overview {
  padding: 0;
  color: var(--ui-color-text);

  :where(p, h2, h3, dl, dd) {
    margin: 0;
  }

  dt {
    color: var(--ui-color-text-secondary);
  }

  dd {
    min-width: 0;
    overflow-wrap: anywhere;
  }

  .account-header {
    display: flex;
    align-items: center;
    gap: var(--ui-space-12);

    .account-heading {
      flex: 1;
      min-width: 0;

      .account-name {
        display: flex;
        align-items: center;
        gap: var(--ui-space-12);

        h2 {
          min-width: 0;
          overflow-wrap: anywhere;
          font-size: var(--ui-font-size-2xl);
          font-weight: var(--ui-font-weight-semibold);
        }
      }

      .account-id {
        display: flex;
        align-items: center;
        gap: var(--ui-space-4);
        margin-top: var(--ui-space-6);
        color: var(--ui-color-text-secondary);
        font-variant-numeric: tabular-nums;
        overflow-wrap: anywhere;

        > span {
          min-width: 0;
        }

        > .ivu-btn {
          flex-shrink: 0;
        }
      }
    }

    .account-purpose {
      display: grid;
      flex: 0 1 26%;
      gap: var(--ui-space-6);
      overflow-wrap: anywhere;

      span {
        color: var(--ui-color-text-secondary);
      }
    }
  }

  .account-funds {
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(0, 2fr);
    gap: var(--ui-space-16);
    align-items: center;
    margin-block: var(--ui-space-16);
    padding: var(--ui-space-16);
    border-radius: var(--ui-radius-xl);
    background: linear-gradient(90deg, #F0F6FE 0%, #F2F5FE 50%, #F6F4FE 100%);

    .account-gap-operator {
      display: none;
    }

    .refresh-btn{
      position: relative;
      display: inline-flex;
      width: 24px;
      height: 24px;
      padding: 0;
      align-items: center;
      justify-content: center;
      border: 0;
      border-radius: var(--ui-radius-circle);
      color: var(--ui-color-primary);
      background: transparent;
      cursor: pointer;
      touch-action: manipulation;
      transition: color .18s ease, background-color .18s ease, transform .18s ease;

      &:hover,
      &:focus-visible{
        color: var(--ui-color-primary);
        background: color-mix(in srgb, var(--ui-color-primary) 8%, transparent);
        outline: none;
      }

      &:focus-visible{
        box-shadow: 0 0 0 2px color-mix(in srgb, var(--ui-color-primary) 18%, transparent);
      }

      &:active:not(:disabled){
        transform: scale(.88);
      }

      &:disabled{
        cursor: wait;
      }

      &.refreshing :deep(.ivu-icon){
        animation: balance-refresh-spin .7s linear infinite;
      }
    }

    .account-available {
      min-width: 0;

      .account-available-label {
        display: flex;
        align-items: center;
        line-height: 22px;
        color: var(--ui-color-text-secondary);
      }



      p {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: var(--ui-space-8);
        margin-top: var(--ui-space-4);
        color: var(--ui-color-text);

        strong {
          min-width: 0;
          font-size: var(--ui-font-size-3xl);
          line-height: var(--ui-size-28);
          font-weight: var(--ui-font-weight-bold);
          overflow-wrap: anywhere;
        }
      }
    }

    .account-metrics {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: var(--ui-space-16);

      .account-operator {
        position: absolute;
        inset-inline-start: 0;
        top: calc(var(--ui-size-24) + var(--ui-space-4));
        color: color-mix(in srgb, var(--ui-color-text-secondary) 55%, transparent);
        font-size: var(--ui-font-size-2xl);
        line-height: var(--ui-size-28);
      }

      > div {
        position: relative;
        min-width: 0;
        padding-inline-start: calc(var(--ui-space-24) + var(--ui-space-16));

        dt {
          display: flex;
          align-items: center;
          min-height: var(--ui-size-24);
          line-height: 22px;
        }

        dd {
          margin-top: var(--ui-space-4);
          font-size: var(--ui-font-size-2xl);
          line-height: var(--ui-size-28);
          font-weight: var(--ui-font-weight-semibold);
        }
      }
    }
  }

  .account-sections {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: var(--ui-space-16);

    :deep(.ui-money-currency) {
      font-size: inherit;
    }

    .account-section {
      min-width: 0;

      & + .account-section {
        padding-inline-start: var(--ui-space-16);
        border-inline-start: var(--ui-border-subtle);
      }

      .account-section-heading {
        display: flex;
        align-items: center;
        flex-wrap: wrap;
        gap: var(--ui-space-6);
        min-height: var(--ui-size-28);
        margin-bottom: var(--ui-space-12);

        > .ivu-icon {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          width: var(--ui-size-20);
          height: var(--ui-size-20);
          line-height: 1;
          color: var(--ui-color-primary);
        }

        h3 {
          min-width: 0;
          font-size: var(--ui-font-size-md);
          font-weight: var(--ui-font-weight-semibold);
          line-height: var(--ui-line-height-md);
        }

        .account-setting-status {
          margin-inline-start: var(--ui-space-6);
        }
      }

      dl {
        display: grid;
        gap: var(--ui-space-8);

        > div {
          display: grid;
          grid-template-columns: var(--ui-size-100) minmax(0, 1fr);
          align-items: baseline;
          gap: var(--ui-space-8);
        }
      }
    }
  }

  .account-footer {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: var(--ui-space-12) var(--ui-space-16);
    margin-top: var(--ui-space-16);
    padding-top: var(--ui-space-12);
    border-top: var(--ui-border-subtle);

    .account-times {
      display: flex;
      flex: 1;
      flex-wrap: wrap;
      min-width: 0;
      gap: var(--ui-space-8) var(--ui-space-16);
      color: var(--ui-color-text-secondary);
      font-size: var(--ui-font-size-xs);
      line-height: var(--ui-line-height-md);

      > div {
        display: flex;
        align-items: center;
        flex-wrap: wrap;
        gap: var(--ui-space-8);
      }

      dt {
        display: inline-flex;
        align-items: center;
        gap: var(--ui-space-8);
      }

      .ivu-icon {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        font-size: var(--ui-font-size-md);
        line-height: 1;
      }
    }

    .account-actions-space {
      margin-inline-start: auto;
    }

    .account-actions {
      display: flex;
      justify-content: flex-end;
      flex-wrap: wrap;
      gap: var(--ui-space-8);

      .action-tooltip-trigger {
        display: flex;

        :deep(button:disabled) { pointer-events: none; }
      }

      :deep(.ivu-icon + span) {
        margin-inline-start: var(--ui-space-6);
      }
    }

    @media (max-width: 768px) {
      .account-times {
        flex-basis: 100%;
      }

      .account-actions-space {
        width: 100%;
        height: calc(96px + env(safe-area-inset-bottom, 0px));
      }

      .account-actions {
        position: fixed;
        bottom: calc(10px + env(safe-area-inset-bottom, 0px) + var(--keyboard-offset, 0px));
        left: 50%;
        z-index: 900;
        width: min(calc(100% - 24px), 480px);
        box-sizing: border-box;
        flex-wrap: nowrap;
        gap: var(--ui-space-4);
        padding: var(--ui-space-6);
        transform: translateX(-50%);
        border: var(--ui-border-on-dark-muted);
        border-radius: var(--ui-radius-14);
        background: linear-gradient(135deg, rgba(255, 255, 255, .76) 0%, rgba(238, 244, 255, .58) 52%, rgba(255, 255, 255, .66) 100%);
        box-shadow: var(--ui-shadow-card-visual);
        -webkit-backdrop-filter: blur(9px) saturate(165%);
        backdrop-filter: blur(9px) saturate(165%);
        touch-action: manipulation;

        &.is-keyboard-open {
          visibility: hidden;
          pointer-events: none;
        }

        > .ivu-tooltip {
          flex: 1;
          min-width: 0;
        }

        :deep(.ivu-tooltip-rel) {
          display: block;
        }

        :deep(.ivu-btn) {
          display: flex;
          flex: 1;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 2px;
          min-width: 0;
          height: var(--ui-size-56);
          padding: 0 2px;
          border: 0;
          border-radius: var(--ui-radius-xl);
          color: var(--ui-color-primary);
          background: transparent;
          font-size: var(--ui-font-size-xs);
          line-height: 20px;

          > .ivu-icon {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
            width: var(--ui-size-32);
            height: var(--ui-size-32);
            border-radius: var(--ui-radius-circle);
            background: color-mix(in srgb, var(--ui-color-primary) 10%, var(--ui-color-surface));
            font-size: 24px;
          }

          > span {
            width: 100%;
            margin: 0;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }

          &.action-collect {
            color: var(--ui-color-warning);

            > .ivu-icon { background: color-mix(in srgb, var(--ui-color-warning) 10%, var(--ui-color-surface)); }
          }

          &.action-status {
            color: var(--ui-color-error-strong);

            > .ivu-icon { background: var(--ui-color-surface-danger-soft); }
          }

          &[disabled] { opacity: .38; }
          &:active:not([disabled]) { background: var(--ui-color-surface-muted); }
        }

        @media (prefers-reduced-transparency: reduce) {
          background: var(--ui-color-surface);
          -webkit-backdrop-filter: none;
          backdrop-filter: none;
        }
      }
    }
  }

  @media (max-width: 1024px) {
    .account-funds {
      gap: var(--ui-space-16);
      padding: var(--ui-space-16);

      .account-metrics {
        > div {
          padding-inline: var(--ui-space-12);
        }
      }
    }

    .account-sections {
      gap: var(--ui-space-16);

      .account-section {
        & + .account-section {
          padding-inline-start: var(--ui-space-16);
        }

        dl {
          > div {
            grid-template-columns: minmax(0, 1fr);
            gap: var(--ui-space-4);
          }
        }
      }
    }
  }

  @media (min-width: 769px) {
    .account-funds {
      .account-gap-operator {
        display: block;
        flex: 1;
        min-width: var(--ui-size-24);
        margin-inline-end: calc(0px - var(--ui-space-16) - var(--ui-space-24) - var(--ui-space-16));
        color: color-mix(in srgb, var(--ui-color-text-secondary) 55%, transparent);
        font-size: var(--ui-font-size-2xl);
        font-weight: var(--ui-font-weight-regular);
        line-height: var(--ui-size-28);
        text-align: center;
      }

      .account-available p {
        flex-wrap: nowrap;

        .refresh-btn {
          flex-shrink: 0;
        }

        .account-gap-operator {
          margin-inline-start: calc(0px - var(--ui-space-8));
        }
      }

      .account-metrics {
        .account-operator {
          display: none;
        }

        > div dd {
          display: flex;
          align-items: center;
        }
      }

      @media (max-width: 1024px) {
        .account-available .account-gap-operator {
          margin-inline-end: calc(0px - var(--ui-space-16) - var(--ui-space-12));
        }

        .account-metrics .account-gap-operator {
          margin-inline-end: calc(0px - var(--ui-space-12) - var(--ui-space-16) - var(--ui-space-12));
        }
      }
    }
  }

  @media (max-width: 768px) {
    padding: 0;

    .account-header {
      flex-wrap: wrap;

      .account-purpose {
        flex-basis: 100%;
      }
    }

    .account-funds {
      grid-template-columns: minmax(0, 1fr);

      .account-available {
        order: 1;
        display: grid;
        grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
        align-items: center;
        gap: var(--ui-space-8);
        padding-top: var(--ui-space-12);
        padding-inline-start: var(--ui-space-24);
        border-top: var(--ui-border-subtle);

        p {
          justify-content: flex-end;
          margin-top: 0;
          text-align: end;
        }
      }

      .account-metrics {
        grid-template-columns: minmax(0, 1fr);
        gap: var(--ui-space-12);

        .account-operator {
          top: 0;
        }

        .account-equals {
          display: none;
        }

        > div {
          display: grid;
          grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
          align-items: center;
          gap: var(--ui-space-8);
          padding-inline-start: var(--ui-space-24);

          dd {
            margin-top: 0;
            text-align: end;
          }
        }
      }
    }

    .account-sections {
      grid-template-columns: minmax(0, 1fr);

      .account-section {
        & + .account-section {
          padding-inline-start: 0;
          border-inline-start: 0;
        }

        .account-section-heading {
          margin-bottom: var(--ui-space-12);
          padding: var(--ui-space-8) var(--ui-space-12);
          border-radius: var(--ui-radius-md);
          background: var(--ui-color-surface-muted);
        }
      }
    }
  }
}
@keyframes balance-refresh-spin{
  to{ transform: rotate(360deg); }
}

@media (prefers-reduced-motion: reduce){
  .account-overview .account-funds .refresh-btn{
    transition: none;

    &.refreshing :deep(.ivu-icon){
      animation: none;
      opacity: .5;
    }
  }
}

</style>
