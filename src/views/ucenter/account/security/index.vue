<template>
  <UiPage class="account-security-page" isBack :title="detail ? $t('ucenterAccount.security.titleWithAccount', { account: detail.nickname }) : $t('ucenterAccount.security.heading')" :back-handler="backToAccounts" :fallback="{ name: 'ucenterAccount', query: { type: 'account' } }">
    <div v-if="loading" class="account-security__loading" role="status" :aria-label="$t('message.loading')">
      <Spin size="large" />
    </div>
    <div v-else-if="loadError" class="account-security__error">
      <Alert type="error" show-icon>{{ loadError }}</Alert>
      <Button @click="loadSecurity">{{ $t('button.refresh') }}</Button>
    </div>
    <div v-else-if="detail" class="account-security">
      <CardBox class="account-security__overview">
        <div class="account-security__summary">
          <div class="account-security__progress">
            <i-circle :percent="securityProgress" :size="120" :stroke-width="8" :trail-width="8" :stroke-color="securityProgressColor" trail-color="var(--ui-color-border-primary-soft)" role="progressbar" :aria-label="$t('ucenterAccount.security.progress')" :aria-valuenow="detail.security_completed" :aria-valuemax="detail.security_total" :aria-valuemin="0">
              <strong class="account-security__fraction" :style="{ color: securityProgressColor }"><bdi>{{ detail.security_completed }}/{{ detail.security_total }}</bdi></strong>
            </i-circle>
            <div class="account-security__section-title">
              <h4>{{ $t('ucenterAccount.security.progress') }}</h4>
              <p>{{ $t('ucenterAccount.security.completedDescription', { count: detail.security_completed }) }}</p>
            </div>
          </div>
        </div>
        <div class="account-security__checks">
          <div v-for="item in securityItems" :key="item.key" class="account-security__check">
            <span class="account-security__check-icon"><Icon :type="item.icon" :size="20" color="var(--ui-color-text)" aria-hidden="true" /></span>
            <strong class="account-security__check-label">{{ item.label }}</strong>
            <span class="account-security__status" :class="{ 'account-security__status--unset': !item.complete }">
              <Icon :type="item.complete ? 'md-checkmark-circle' : 'md-alert'" aria-hidden="true" />
              {{ item.status }}
            </span>
          </div>
        </div>
      </CardBox>

      <CardBox class="account-security__activation">
        <div class="account-security__activation-title">
          <span class="account-security__check-icon"><Icon custom="iconfont icon-shijian1" :size="24" color="var(--ui-color-primary)" aria-hidden="true" /></span>
          <div class="account-security__section-title">
            <h3>{{ $t('ucenterAccount.security.activation') }}</h3>
            <div class="account-security__activation-status">
              <span>{{ $t('ucenterAccount.security.activationStatus') }}</span>
              <FormDot :model-value="detail.account_status" :options="accountStatusOptions" />
            </div>
            <p v-if="!detail.activation">{{ $t('ucenterAccount.security.noActivation') }}</p>
          </div>
        </div>
        <dl class="account-security__fields">
          <div>
            <dt>{{ $t('ucenterAccount.security.sentAt') }}</dt>
            <dd><bdi>{{ detail.activation?.sent_at || '-' }}</bdi></dd>
          </div>
          <div>
            <dt>{{ $t(detail.activation?.used_at ? 'ucenterAccount.security.activatedAt' : 'ucenterAccount.security.expiresAt') }}</dt>
            <dd><bdi>{{ detail.activation?.used_at || detail.activation?.expires_at || '-' }}</bdi></dd>
          </div>
        </dl>
      </CardBox>

      <CardBox class="account-security__section account-security__devices">
        <template #title>
          <div class="account-security__section-title">
            <h3>{{ $t('ucenterAccount.security.sessions') }} <span class="account-security__count">{{ detail.sessions.length }}</span></h3>
            <p>{{ $t('ucenterAccount.security.sessionsDescription') }}</p>
          </div>
        </template>
        <template #titleRight>
          <Button v-if="$hasPermission('team.account.security.logout')" type="default" :loading="logoutTarget === 'all'" :disabled="logoutTarget !== null || !detail.sessions.length" @click="logoutSessions()">
            {{ $t('ucenterAccount.security.logoutAllSessions') }}
          </Button>
        </template>
        <div v-if="!detail.sessions.length" class="account-security__empty" role="status">
          <span class="account-security__empty-icon"><Icon type="md-laptop" :size="24" aria-hidden="true" /></span>
          <p>{{ $t('ucenterAccount.security.noSessions') }}</p>
        </div>
        <ul v-else class="account-security__sessions list-b-12">
          <li v-for="session in detail.sessions" :key="session.id">
            <LoginDeviceCard :device="session">
              <template #icon>
                <Icon :type="/android|ios|iphone|ipad/i.test(session.login_os || '') ? 'md-phone-portrait' : 'md-laptop'" :size="24" aria-hidden="true" />
              </template>
              <template #action>
                <Button v-if="$hasPermission('team.account.security.logout')" class="btn-offline" icon="md-power" :loading="logoutTarget === session.id" :disabled="logoutTarget !== null || !session.id" @click="logoutSessions(session)">
                  {{ $t('ucenterAccount.security.logoutSession') }}
                </Button>
              </template>
            </LoginDeviceCard>
          </li>
        </ul>
      </CardBox>
    </div>
  </UiPage>
</template>

<script setup>
import { hasPermission } from '@/utils/permission.js'
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { onBeforeRouteLeave, onBeforeRouteUpdate } from 'vue-router'
import { isRecoveryRoute, toRoute, useRoute } from '@/utils/route.js'
import Decimal from 'decimal.js'
import userApi from '@/api/user.js'
import { t } from '@/utils'
import { confirm, message, showRequestError } from '@/utils/message.js'
import CardBox from '@/components/layout/CardBox.vue'
import LoginDeviceCard from '@/views/ucenter/components/LoginDeviceCard.vue'

const route = useRoute()
const accountId = computed(() => Number(route.params.id))
const backToAccounts = () => toRoute('ucenterAccount', { type: 'account' }, 'query', { replace: true })
const detail = ref(null)
const loading = ref(false)
const loadError = ref('')
const logoutTarget = ref(null)
let requestController = null
let logoutController = null

const accountStatusOptions = computed(() => ({
  0: { label: t('ucenterAccount.status.disabled'), type: 'error' },
  1: { label: t('ucenterAccount.status.normal'), type: 'success' },
  2: { label: t('ucenterAccount.status.pendingActivation'), type: 'warning' },
  3: { label: t('ucenterAccount.status.activating'), type: 'processing' },
}))
const securityProgress = computed(() => detail.value
  ? new Decimal(detail.value.security_completed).div(detail.value.security_total).times(100).round().toNumber()
  : 0)
const securityProgressColor = computed(() => ({
  1: 'var(--ui-color-error)',
  2: 'var(--ui-color-gold-300)',
  3: 'var(--ui-color-success)',
})[detail.value?.security_completed] || 'var(--ui-color-primary)')
const securityItems = computed(() => [
  {
    key: 'password',
    icon: 'md-lock',
    label: t('ucenterAccount.security.password'),
    complete: detail.value?.password_set,
    status: t(detail.value?.password_set ? 'ucenterAccount.security.passwordSet' : 'ucenterAccount.security.passwordNotSet'),
  },
  {
    key: 'email',
    icon: 'md-mail',
    label: t('ucenterAccount.security.emailVerification'),
    complete: detail.value?.email_verified,
    status: t(detail.value?.email_verified ? 'ucenterAccount.security.verified' : 'ucenterAccount.security.notVerified'),
  },
  {
    key: 'twoFactor',
    icon: 'logo-google',
    label: t('ucenterAccount.security.twoFactor'),
    complete: detail.value?.two_factor_bound,
    status: t(detail.value?.two_factor_bound ? 'ucenterAccount.security.bound' : 'ucenterAccount.security.notBound'),
  },
])

const clearSession = () => {
  logoutController?.abort()
  logoutController = null
  logoutTarget.value = null
  requestController?.abort()
  requestController = null
  detail.value = null
  loadError.value = ''
  loading.value = false
}

const loadSecurity = async () => {
  if (route.name !== 'ucenterAccountSecurity') return
  if (!hasPermission('team.view') || !hasPermission('team.account.view') || !hasPermission('team.account.security.view')) {
    toRoute('error_403', {}, 'query', { replace: true })
    return
  }
  if (!/^\d+$/.test(String(route.params.id)) || !Number.isSafeInteger(accountId.value) || accountId.value <= 0) {
    toRoute('error_404', {}, 'query', { replace: true })
    return
  }
  requestController?.abort()
  const controller = new AbortController()
  const requestedAccountId = accountId.value
  requestController = controller
  loading.value = true
  loadError.value = ''
  detail.value = null

  try {
    const data = await userApi.getAccountSecurity({ account_id: requestedAccountId }, { signal: controller.signal })
    if (controller.signal.aborted || requestController !== controller) return
    if (
      !data
      || Number(data.account_id) !== requestedAccountId
      || !Array.isArray(data.sessions)
      || !['password_set', 'email_verified', 'two_factor_bound'].every((key) => typeof data[key] === 'boolean')
      || ![0, 1, 2, 3].includes(Number(data.account_status))
      || !Number.isInteger(data.security_completed)
      || !Number.isInteger(data.security_total)
      || data.security_total <= 0
      || data.security_completed < 0
      || data.security_completed > data.security_total
    ) throw new Error('Invalid account security response')

    detail.value = {
      nickname: data.nickname || '-',
      account_status: Number(data.account_status),
      password_set: data.password_set,
      email_verified: data.email_verified,
      two_factor_bound: data.two_factor_bound,
      security_completed: data.security_completed,
      security_total: data.security_total,
      activation: data.activation ? {
        sent_at: data.activation.sent_at,
        expires_at: data.activation.expires_at,
        used_at: data.activation.used_at,
      } : null,
      sessions: data.sessions.map((session) => ({
        id: session.id,
        login_os: session.login_os,
        login_browser: session.login_browser,
        login_ip: session.login_ip,
        created_at: session.created_at,
      })),
    }
  } catch (error) {
    if (controller.signal.aborted || requestController !== controller) return
    loadError.value = !error?.silent && typeof error?.msg === 'string' && error.msg.trim() && error.msg !== 'SILENT_ERROR'
      ? error.msg
      : t('ucenterAccount.security.loadFailed')
  } finally {
    if (requestController === controller) {
      requestController = null
      loading.value = false
    }
  }
}

const logoutSessions = async (session) => {
  if (!hasPermission('team.account.security.logout')) return
  if (logoutTarget.value !== null || loading.value || !accountId.value || !detail.value?.sessions.length) return
  if (session && (!session.id || !detail.value.sessions.some((item) => item.id === session.id))) return

  const controller = new AbortController()
  const data = {
    account_id: String(accountId.value),
    session_ids: session ? [session.id] : detail.value.sessions.map((item) => item.id),
  }
  logoutController = controller
  logoutTarget.value = session ? session.id : 'all'

  try {
    const confirmed = await confirm(t(session ? 'ucenterAccount.security.confirmLogoutSession' : 'ucenterAccount.security.confirmLogoutAllSessions'), { resolveCancel: true })
    if (!confirmed || !hasPermission('team.account.security.logout') || controller.signal.aborted || logoutController !== controller) return
    await userApi.logoutAccountSessions(data, { signal: controller.signal })
    if (controller.signal.aborted || logoutController !== controller) return
    message(t('ucenterAccount.security.logoutSuccess'))
    await loadSecurity()
  } catch (error) {
    if (controller.signal.aborted || logoutController !== controller || error?.silent || error?.code === 'ERR_CANCELED') return
    showRequestError(error)
  } finally {
    if (logoutController === controller) {
      logoutController = null
      logoutTarget.value = null
    }
  }
}

onBeforeRouteLeave(to => isRecoveryRoute(to) || logoutTarget.value === null)
onBeforeRouteUpdate(to => isRecoveryRoute(to) || logoutTarget.value === null)
watch(() => [route.name, route.params.id], () => {
  clearSession()
  loadSecurity()
}, { immediate: true, flush: 'sync' })
onBeforeUnmount(clearSession)
</script>

<style lang="less" scoped>
.account-security-page {
  --ui-page-gap: var(--ui-space-24);
}

.account-security {
  display: flex;
  flex: 1 0 auto;
  flex-direction: column;
  gap: var(--ui-space-24);

  &__count {
    padding: var(--ui-space-2) var(--ui-space-8);
    border-radius: var(--ui-radius-full);
    background: var(--ui-color-surface-subtle);
    font-size: var(--ui-font-size-xs);
    font-weight: var(--ui-font-weight-regular);
    overflow-wrap: anywhere;
  }

  &__section-title p {
    margin-top: var(--ui-space-4);
    color: var(--ui-color-text-subtle);
    font-size: var(--ui-font-size-md);
    line-height: 1.6;
  }

  &__section-title {
    min-width: 0;
    overflow-wrap: anywhere;

    h3,
    h4 {
      color: var(--ui-color-text);
      font-weight: var(--ui-font-weight-semibold);
      line-height: 1.5;
    }

    h3 { font-size: var(--ui-font-size-xl); }
    h4 { font-size: var(--ui-font-size-lg); }
  }

  &__overview {
    display: grid;
    grid-template-columns: minmax(0, 2fr) minmax(0, 3fr);
    align-items: center;
    gap: var(--ui-space-24);
    padding: var(--ui-space-16) var(--ui-space-24);
    border-radius: var(--ui-radius-2xl);
    background: linear-gradient(110deg, var(--ui-color-surface-subtle), var(--ui-color-surface-selected));
  }

  &__activation-title {
    display: flex;
    align-items: center;
    gap: var(--ui-space-16);

  }

  &__progress {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: var(--ui-space-24);

    :deep(.ivu-chart-circle) { flex-shrink: 0; }
  }

  &__fraction {
    font-variant-numeric: tabular-nums;
    color: var(--ui-color-primary);
    font-size: var(--ui-size-32);
  }

  &__checks {
    min-width: 0;
    padding: var(--ui-space-8);
    border-radius: var(--ui-radius-2xl);
    background: var(--ui-color-surface);
  }

  &__check {
    display: flex;
    align-items: center;
    gap: var(--ui-space-16);
    padding: var(--ui-space-8) var(--ui-space-16);
  }

  &__check-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    width: var(--ui-size-48);
    height: var(--ui-size-48);
    border-radius: var(--ui-radius-xl);
    background: var(--ui-color-surface-navigation);
    color: var(--ui-color-text);
    font-size: var(--ui-size-24);
  }

  &__checks &__check-icon {
    width: var(--ui-size-40);
    height: var(--ui-size-40);
  }

  &__check-label {
    flex: 1;
    min-width: 0;
    overflow-wrap: anywhere;
    font-size: var(--ui-font-size-lg);
    color: var(--ui-color-text);
  }

  &__status {
    max-width: 100%;
    overflow-wrap: anywhere;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: var(--ui-space-8);
    flex-shrink: 0;
    padding: var(--ui-space-6) var(--ui-space-16);
    border-radius: var(--ui-radius-full);
    color: var(--ui-color-success);
    background: color-mix(in srgb, var(--ui-color-success) 9%, var(--ui-color-surface));

    > .ivu-icon { font-size: var(--ui-font-size-2xl); }

    &--unset {
      color: var(--ui-color-warning);
      background: color-mix(in srgb, var(--ui-color-warning) 9%, var(--ui-color-surface));
    }
  }

  &__activation {
    display: grid;
    grid-template-columns: minmax(0, 2fr) minmax(0, 3fr);
    gap: var(--ui-space-24);
    align-items: center;
    padding: 0 0 var(--ui-space-24);
    border-bottom: var(--ui-border-divider);
  }

  &__activation-status {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: var(--ui-space-16);
    margin-top: var(--ui-space-4);
    color: var(--ui-color-text-subtle);
  }

  &__fields {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: var(--ui-space-24);
    margin: 0;

    dt {
      margin-bottom: var(--ui-space-4);
      color: var(--ui-color-text-subtle);
      font-size: var(--ui-font-size-xs);
    }

    dd {
      margin: 0;
      overflow-wrap: anywhere;
      color: var(--ui-color-text);
    }
  }

  &__devices {
    --ui-card-gap: var(--ui-space-16);
    padding: 0;

    :deep(.ui-card-box-title) {
      align-items: flex-start;
      gap: var(--ui-space-16);
      flex-wrap: wrap;
    }
  }

  &__count {
    display: inline-block;
    margin-inline-start: var(--ui-space-6);
    vertical-align: middle;
  }

  &__empty {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--ui-space-16);
    min-height: var(--ui-size-96);
    padding: var(--ui-space-24);
    border-radius: var(--ui-radius-2xl);
    background: linear-gradient(110deg, var(--ui-color-surface-subtle), var(--ui-color-surface-selected));
    color: var(--ui-color-text-subtle);

    p {
      margin: 0;
      min-width: 0;
      overflow-wrap: anywhere;
      font-size: var(--ui-font-size-md);
      line-height: 1.6;
    }
  }

  &__empty-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    width: var(--ui-size-48);
    height: var(--ui-size-48);
    border-radius: var(--ui-radius-xl);
    background: var(--ui-color-surface);
    color: var(--ui-color-text-subtle);
  }
  &__sessions { padding: 0; margin: 0; list-style: none; }

  &__devices :deep(.ivu-btn) {
    min-height: var(--ui-size-40);
    border-radius: var(--ui-radius-lg);
    padding-inline: var(--ui-space-16);
  }

  &__sessions :deep(.item-box) {
    display: grid;
    grid-template-columns: var(--ui-size-48) minmax(0, 1fr) minmax(0, 1.5fr) auto;
    align-items: start;
    grid-template-rows: min-content min-content;
    column-gap: var(--ui-space-16);
    row-gap: var(--ui-space-4);
    padding: var(--ui-space-16);
    border: none;
    background: linear-gradient(110deg, var(--ui-color-surface-subtle), var(--ui-color-surface-selected));

    .device-icon {
      grid-column: 1;
      grid-row: 1 / 3;
      border: none;
      border-radius: var(--ui-radius-xl);
      background: var(--ui-color-surface);
      color: var(--ui-color-text);
    }
    .device-info { display: contents; }
    .device-summary {
      grid-column: 2;
      grid-row: 1 / 3;
      display: flex;
      flex-direction: column;
      gap: var(--ui-space-4);
      min-width: 0;
      overflow-wrap: anywhere;
    }
    .device-title { min-height: 0; }
    .device-browser {
      color: var(--ui-color-text-subtle);
      border: none;
      padding: 0;
      background: transparent;
      overflow-wrap: anywhere;
      .ivu-icon { display: none; }
    }
    .device-meta {
      grid-column: 3;
      grid-row: 1 / 3;
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: var(--ui-space-16);
      margin: 0;
      .meta-row { flex-direction: column; align-items: flex-start; gap: var(--ui-space-4); font-size: var(--ui-font-size-md); }
      .label { color: var(--ui-color-text-subtle); font-size: var(--ui-font-size-xs); }
      .value { color: var(--ui-color-text); overflow-wrap: anywhere; }
    }
    .device-action { grid-column: 4; grid-row: 1 / 3; }
    .ivu-btn.btn-offline {
      height: var(--ui-size-40);
      border-color: transparent;
      background: var(--ui-color-surface-danger-soft);
      color: var(--ui-color-error);
      &:hover:not(:disabled) { border-color: var(--ui-color-error); }
      &:disabled { color: var(--ui-color-control-text-disabled); background: var(--ui-color-surface-disabled); }
    }
  }

  &__loading {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: var(--ui-size-144);
  }

  &__error { padding: var(--ui-space-16); }
}

@media screen and (max-width: 1199px) {
  .account-security {
    &__overview { grid-template-columns: minmax(0, 1fr); }
    &__summary { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: var(--ui-space-24); }
    &__sessions :deep(.item-box) {
      grid-template-columns: var(--ui-size-48) minmax(0, 1fr) auto;
      .device-meta { grid-column: 2; grid-row: 3; margin-top: var(--ui-space-12); }
      .device-action { grid-column: 3; grid-row: 1 / 4; }
    }
  }
}

@media screen and (max-width: 768px) {
  .account-security {
    gap: var(--ui-space-20);

    &__overview {
      padding: var(--ui-space-16);
      gap: var(--ui-space-16);
    }

    &__progress {
      flex-wrap: nowrap;
      gap: var(--ui-space-16);

      :deep(.ivu-chart-circle) {
        width: var(--ui-size-80) !important;
        height: var(--ui-size-80) !important;
      }
    }

    &__fraction {
      font-size: var(--ui-size-24);
    }

    &__checks {
      padding: var(--ui-space-8);
    }

    &__check {
      display: grid;
      grid-template-columns: var(--ui-size-32) minmax(0, 1fr) minmax(0, auto);
      gap: var(--ui-space-8);
      padding: var(--ui-space-8) 0;
    }

    &__checks &__check-icon {
      width: var(--ui-size-32);
      height: var(--ui-size-32);
    }

    &__check-label {
      font-size: var(--ui-font-size-md);
    }

    &__status {
      gap: var(--ui-space-4);
      padding: var(--ui-space-4) var(--ui-space-8);
    }

    &__activation {
      grid-template-columns: minmax(0, 1fr);
      gap: var(--ui-space-16);
      padding-bottom: var(--ui-space-20);
    }

    &__fields {
      grid-template-columns: minmax(0, 1fr);
      gap: var(--ui-space-12);

      > div {
        display: grid;
        grid-template-columns: minmax(0, 1fr) minmax(0, 2fr);
        align-items: baseline;
        gap: var(--ui-space-12);
      }

      dt {
        margin: 0;
        overflow-wrap: anywhere;
      }

      dd {
        text-align: end;
      }
    }

    &__devices {
      :deep(.ui-card-box-title) {
        gap: var(--ui-space-12);
      }

      :deep(.ivu-btn) {
        min-height: var(--ui-size-44);
      }
    }

    &__sessions :deep(.item-box) {
      display: flex;
      flex-wrap: wrap;
      gap: var(--ui-space-16) var(--ui-space-12);

      .device-summary {
        flex: 1 1 calc(100% - var(--ui-size-48) - var(--ui-space-12));
      }

      .device-browser {
        width: 100%;

        bdi {
          min-width: 0;
          overflow-wrap: anywhere;
        }
      }

      .device-meta {
        flex: 0 0 calc(100% - var(--ui-size-48) - var(--ui-space-12));
        grid-template-columns: minmax(0, 1fr);
        gap: 0;
        min-width: 0;
        margin: 0;
        margin-inline-start: calc(var(--ui-size-48) + var(--ui-space-12));

        .meta-row {
          display: flex;
          flex-direction: row;
          align-items: baseline;
          gap: var(--ui-space-8);

          &:last-child {
            min-height: var(--ui-size-32);
            align-items: center;
            padding-inline-end: calc(var(--ui-size-80) + var(--ui-space-12));
          }
        }

        .value {
          min-width: 0;
          text-align: start;
        }
      }

      .device-action {
        position: absolute;
        inset-inline-end: var(--ui-space-16);
        bottom: var(--ui-space-16);
        width: auto;
        margin: 0;
        padding-top: 0;
        border-top: none;
      }

      .ivu-btn.btn-offline {
        height: var(--ui-size-32);
        min-height: var(--ui-size-32);
        padding-inline: var(--ui-space-12);
      }
    }
  }
}

@media (prefers-reduced-motion: reduce) {
  .account-security__progress :deep(path) { transition: none !important; }
}
</style>
