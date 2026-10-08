<script>
// 新增草稿仅保留在当前会话内存中，刷新页面后自动清空。
let createDraft = null
let draftScope = null
const clearCreateDraft = () => {
  createDraft = null
  draftScope?.stop()
  draftScope = null
}
</script>

<script setup>
import { computed, effectScope, nextTick, onBeforeUnmount, ref, watch } from 'vue'
import { onBeforeRouteLeave, onBeforeRouteUpdate } from 'vue-router'
import { cardApi, userApi } from '@/api'
import { t } from '@/utils'
import { isRecoveryRoute, goBack, toRoute, useRoute } from '@/utils/route'
import { confirm, message, showRequestError } from '@/utils/message'
import { hasPermission } from '@/utils/permission'
import { useUserStore, useUserStoreRefs } from '@/utils/store'
import Decimal from 'decimal.js'

const route = useRoute()
const userStore = useUserStore()
const { user } = useUserStoreRefs()
const draftUserId = user.value?.id
let creationSaved = false
const scopeParams = { status: 1 }
// 浏览器可能忽略 autocomplete="off"，直接设置下拉框内部的搜索输入框。
const vDisableAutofill = (el) => {
  el.querySelector('input')?.setAttribute('autocomplete', 'new-password')
}
const formRef = ref()
const form = ref({
  name: '',
  remark: '',
  currency: 'USD',
  amount: null,
  team_group_ids: [],
  account_ids: [],
  auto_recharge_enabled: 0,
  auto_recharge_threshold: null,
  auto_recharge_amount: null,
  low_balance_notice_enabled: 0,
  low_balance_threshold: null,
  notice_channels: ['notice'],
})
const groups = ref([])
const accounts = ref([])
const refreshingBalance = ref(false)
const loading = ref(true)
const loadError = ref('')
const disabledWallet = ref(false)
const submitting = ref(false)
// 创建结果未确认时保留原参数，重试期间锁定表单。
const pendingPayload = ref(null)
let loadController
let alive = true

const id = computed(() => typeof route.params.id === 'string' ? route.params.id : '')
const editing = computed(() => route.name === 'cardSharedWalletEdit')
const canManage = computed(() => hasPermission('shared_wallet.view') && hasPermission(editing.value ? 'shared_wallet.update' : 'shared_wallet.create'))
const canCreateGroup = computed(() => hasPermission('team.view') && hasPermission('team.group.view') && hasPermission('team.group.create'))
const canCreateAccount = computed(() => hasPermission('team.view') && hasPermission('team.account.view') && hasPermission('team.account.create'))
const teamCreateQuery = computed(() => ({
  returnTo: editing.value ? 'cardSharedWalletEdit' : 'cardSharedWalletAdd',
  ...(editing.value ? { walletId: id.value } : {}),
}))
const fallback = { name: 'cardSharedWallets' }
const title = computed(() => text(editing.value ? 'editTitle' : 'createTitle'))
const balance = computed(() => user.value?.money ?? null)
const walletCount = ref(null)
const creationDisabled = computed(() => {
  if (editing.value) return false
  const limit = String(user.value?.shared_wallet_limit)
  if (limit === '-1') return false
  if (!/^\d+$/.test(limit) || walletCount.value == null) return true
  return new Decimal(walletCount.value).gte(limit)
})

watch([form, groups, accounts, pendingPayload, loading], () => {
  if (editing.value || loading.value || loadError.value || creationSaved || !userStore.isLogin || draftUserId == null || user.value?.id !== draftUserId) return
  createDraft = {
    userId: draftUserId,
    ...JSON.parse(JSON.stringify({
      form: form.value,
      groups: groups.value.filter(group => form.value.team_group_ids.includes(group.id)).map(({ id, name }) => ({ id, name })),
      accounts: accounts.value.filter(account => form.value.account_ids.includes(account.id)).map(({ id, name }) => ({ id, name })),
      pendingPayload: pendingPayload.value,
    })),
  }
  if (!draftScope) {
    // 页面卸载后仍需在登出或切换账号时清除草稿。
    draftScope = effectScope(true)
    draftScope.run(() => watch([() => userStore.user?.id, () => userStore.isLogin], clearCreateDraft, { flush: 'sync' }))
  }
}, { deep: true })

const rememberOptions = (current, selectedIds, options) => {
  return [...new Map([
    ...current.filter(option => selectedIds.includes(option.id)),
    ...options.map(({ id, name }) => ({ id, name })),
  ].map(option => [option.id, option])).values()]
}

const refreshCreationQuota = async (config = {}) => {
  walletCount.value = null
  await userStore.getUserInfo()
  const limit = String(user.value?.shared_wallet_limit)
  if (limit === '-1') return
  if (!/^\d+$/.test(limit)) throw new Error('Invalid wallet limit')
  if (new Decimal(limit).isZero()) {
    walletCount.value = '0'
    return
  }
  const statistics = await cardApi.getSharedWalletStatistics(config)
  if (config.signal?.aborted) return
  if (!/^\d+$/.test(String(statistics?.wallet_count))) throw new Error('Invalid wallet count')
  walletCount.value = statistics.wallet_count
}
// 初始划转的字段校验包含金额格式与可用余额判断。
const amountError = computed(() => {
  if (editing.value) return ''
  if (!isValidAmount(form.value.amount)) return text('amountInvalid')
  if (balance.value == null || !/^-?\d+(\.\d+)?$/.test(String(balance.value)) || new Decimal(form.value.amount).gt(balance.value)) return text('balanceInsufficient')
  return ''
})
const rules = computed(() => ({
  name: [{ required: true, type: 'string', min: 1, max: 50, transform: value => value?.trim(), message: text('nameInvalid'), trigger: 'change,blur' }],
  remark: [{ required: true, type: 'string', min: 1, max: 100, transform: value => value?.trim(), message: text('remarkInvalid'), trigger: 'change,blur' }],
  amount: [{
    validator: (rule, value, callback) => callback(amountError.value ? new Error(amountError.value) : undefined),
    trigger: 'change,blur',
  }],
  auto_recharge_threshold: [{
    validator: (rule, value, callback) => callback(!form.value.auto_recharge_enabled || isValidSettingAmount(value) ? undefined : new Error(text('settingAmountInvalid'))),
    trigger: 'change,blur',
  }],
  auto_recharge_amount: [{
    validator: (rule, value, callback) => {
      const error = form.value.auto_recharge_enabled ? getRechargeAmountError(value) : ''
      callback(error ? new Error(error) : undefined)
    },
    trigger: 'change,blur',
  }],
  low_balance_threshold: [{
    validator: (rule, value, callback) => callback(!form.value.low_balance_notice_enabled || isValidSettingAmount(value) ? undefined : new Error(text('settingAmountInvalid'))),
    trigger: 'change,blur',
  }],
}))

const text = (key, params) => t(`card.index.sharedForm.${key}`, params)

const submitHint = computed(() => {
  if (creationDisabled.value) return text('creationDisabled')
  if (!form.value.name.trim() || form.value.name.trim().length > 50) return text('nameInvalid')
  if (!form.value.remark.trim() || form.value.remark.trim().length > 100) return text('remarkInvalid')
  if (amountError.value) return `${text('amount')}：${amountError.value}`
  if (form.value.auto_recharge_enabled && !isValidSettingAmount(form.value.auto_recharge_threshold)) return `${text('autoRecharge')} · ${text('threshold')}：${text('settingAmountInvalid')}`
  const rechargeError = form.value.auto_recharge_enabled ? getRechargeAmountError(form.value.auto_recharge_amount) : ''
  if (rechargeError) return `${text('autoRecharge')} · ${text('rechargeAmount')}：${rechargeError}`
  if (form.value.low_balance_notice_enabled && !isValidSettingAmount(form.value.low_balance_threshold)) return `${text('lowBalance')} · ${text('threshold')}：${text('settingAmountInvalid')}`
  return ''
})

/** 检查金额原值是否为大于零、最多 17 位整数和 3 位小数的普通十进制数。 */
const isValidAmount = value => /^\d{1,17}(\.\d{1,3})?$/.test(String(value)) && new Decimal(value).gt(0)

const normalizeSettingAmount = value => {
  if (value == null || value === '') return null
  const amount = String(value)
  return /^\d{1,17}(\.\d+)?$/.test(amount) ? new Decimal(amount).toFixed() : amount
}
const isValidSettingAmount = value => /^\d{1,17}(\.\d{1,2})?$/.test(String(value)) && new Decimal(value).gte(0) && new Decimal(value).lte(9999999)

const rechargeMin = computed(() => isValidSettingAmount(form.value.auto_recharge_threshold) ? form.value.auto_recharge_threshold : '0')
const getRechargeAmountError = value => {
  if (!isValidSettingAmount(value)) return text('settingAmountInvalid')
  return new Decimal(value).lt(rechargeMin.value) ? text('rechargeAmountBelowThreshold') : ''
}
const syncRechargeAmount = () => {
  const amount = form.value.auto_recharge_amount || '0'
  if (isValidSettingAmount(amount) && new Decimal(amount).lt(rechargeMin.value)) {
    form.value.auto_recharge_amount = String(rechargeMin.value)
  }
}
watch(() => form.value.auto_recharge_threshold, () => {
  if (!loading.value) syncRechargeAmount()
})

const refreshBalance = async () => {
  if (refreshingBalance.value || submitting.value || pendingPayload.value) return
  refreshingBalance.value = true
  try {
    await userStore.getUserInfo()
  } finally {
    refreshingBalance.value = false
  }
}

const rowsOf = response => {
  const rows = Array.isArray(response) ? response : response?.data ?? response?.list
  if (!Array.isArray(rows)) throw new Error('Invalid selection response')
  return rows
}

/** 转换分组分页选项，沿用字符串 ID 并保留已选分组。 */
const processGroupPage = response => {
  const rows = rowsOf(response)
  return {
    list: rows.map(group => ({
      ...group,
      id: String(group.id),
    })),
    hasMore: typeof response?.has_more === 'boolean' ? response.has_more
      : response?.current_page != null && response?.last_page != null ? Number(response.current_page) < Number(response.last_page)
        : rows.length >= 20,
  }
}

/** 转换账号分页选项并补齐显示名称。 */
const processAccountPage = response => {
  const rows = rowsOf(response)
  return {
    list: rows.map(account => ({
      ...account,
      name: account.nickname || account.email || account.id,
    })),
    hasMore: typeof response?.has_more === 'boolean' ? response.has_more
      : response?.current_page != null && response?.last_page != null ? Number(response.current_page) < Number(response.last_page)
        : rows.length >= 20,
  }
}

const loadPage = async () => {
  loadController?.abort()
  if (!canManage.value) {
    toRoute('error_403', {}, 'query', { replace: true })
    return
  }
  const controller = new AbortController()
  loadController = controller
  loading.value = true
  creationSaved = false
  loadError.value = ''
  disabledWallet.value = false
  try {
    if (editing.value && !/^[A-Za-z0-9_-]{1,32}$/.test(id.value)) throw new Error('Invalid wallet id')
    const detail = editing.value ? await userApi.getSharedWalletDetail({ shared_wallet_id: id.value }, { signal: controller.signal }) : null
    if (!editing.value) await refreshCreationQuota({ signal: controller.signal })
    if (controller.signal.aborted) return
    if (editing.value && (!detail || String(detail.id) !== id.value || detail.status == null || detail.currency !== 'USD' || !Array.isArray(detail.team_group_ids) || !Array.isArray(detail.account_ids))) throw new Error('Invalid wallet detail')
    if (!editing.value && (balance.value == null || !/^-?\d+(\.\d+)?$/.test(String(balance.value)))) throw new Error('Invalid balance')
    form.value = {
      name: detail?.name ?? '',
      remark: detail?.remark ?? '',
      currency: detail?.currency ?? 'USD',
      amount: null,
      team_group_ids: (detail?.team_group_ids || []).map(String),
      account_ids: [...(detail?.account_ids || [])],
      auto_recharge_enabled: Number(detail?.auto_recharge_enabled || 0),
      auto_recharge_threshold: normalizeSettingAmount(detail?.auto_recharge_threshold),
      auto_recharge_amount: normalizeSettingAmount(detail?.auto_recharge_amount),
      low_balance_notice_enabled: Number(detail?.low_balance_notice_enabled || 0),
      low_balance_threshold: normalizeSettingAmount(detail?.low_balance_threshold),
      notice_channels: ['notice', ...(detail?.notice_channels || []).filter(value => value === 'email' || value === 'member')],
    }
    if (createDraft && createDraft.userId !== user.value?.id) clearCreateDraft()
    const draft = !editing.value ? createDraft : null
    if (draft) form.value = JSON.parse(JSON.stringify(draft.form))
    pendingPayload.value = draft?.pendingPayload ?? null
    disabledWallet.value = editing.value && Number(detail.status) !== 0
    groups.value = (detail?.team_groups || []).map(group => ({ ...group, id: String(group.id) }))
    accounts.value = (detail?.accounts || []).map(account => ({ ...account, name: account.nickname || account.email || account.id }))
    if (draft) {
      groups.value = draft.groups
      accounts.value = draft.accounts
    }
    for (const groupId of form.value.team_group_ids) {
      if (!groups.value.some(group => String(group.id) === groupId)) groups.value.push({ id: groupId, name: `#${groupId}` })
    }
    for (const accountId of form.value.account_ids) {
      if (!accounts.value.some(account => account.id === accountId)) accounts.value.push({ id: accountId })
    }
  } catch {
    if (!controller.signal.aborted) loadError.value = text('loadFailed')
  } finally {
    // 回填触发的联动侦听器执行完后再挂载表单，避免校验尚未注册的字段。
    await nextTick()
    if (loadController === controller) loading.value = false
  }
}

/** 校验表单后提交，编辑时需确认；校验、确认和请求期间共用提交锁。 */
const submit = async () => {
  if (!canManage.value || creationDisabled.value || !formRef.value || submitting.value || loading.value || loadError.value || disabledWallet.value) return
  submitting.value = true
  try {
    if (!await formRef.value.validate() || !alive) return
    if (!editing.value) {
      try {
        await refreshCreationQuota()
      } catch {
        if (alive) loadError.value = text('loadFailed')
        return
      }
      if (!alive || creationDisabled.value) return
    }
    const payload = pendingPayload.value || {
      name: form.value.name.trim(),
      remark: form.value.remark.trim(),
      currency: form.value.currency,
      team_group_ids: [...form.value.team_group_ids],
      account_ids: [...form.value.account_ids],
      auto_recharge_enabled: form.value.auto_recharge_enabled,
      auto_recharge_threshold: form.value.auto_recharge_threshold || '0.000',
      auto_recharge_amount: form.value.auto_recharge_amount || '0.000',
      low_balance_notice_enabled: form.value.low_balance_notice_enabled,
      low_balance_threshold: form.value.low_balance_threshold || '0.000',
      notice_channels: [...form.value.notice_channels],
      ...(editing.value ? { shared_wallet_id: id.value } : { amount: form.value.amount }),
    }
    if (editing.value && !await confirm(text('editConfirm'), { title: title.value, resolveCancel: true })) return
    if (!alive || !canManage.value || creationDisabled.value) return
    if (!editing.value) pendingPayload.value = payload
    if (editing.value) await cardApi.editSharedWallet(payload)
    else await cardApi.createSharedWallet(payload)
    if (!editing.value) {
      creationSaved = true
      if (createDraft?.userId === draftUserId) clearCreateDraft()
    }
    pendingPayload.value = null
    if (!editing.value) await userStore.getUserInfo()
    if (!alive) return
    message(text(editing.value ? 'editSuccess' : 'createSuccess'))
    submitting.value = false
    if (editing.value) goBack(fallback)
    else await toRoute(fallback.name, {}, 'query', { replace: true })
  } catch (error) {
    if (!alive) return
    showRequestError(error)
    if (typeof error?.code === 'number' || error?.cancelled) pendingPayload.value = null
  } finally {
    submitting.value = false
  }
}

onBeforeRouteLeave(to => isRecoveryRoute(to) || !submitting.value)
onBeforeRouteUpdate(to => isRecoveryRoute(to) || (!submitting.value && !pendingPayload.value))
watch([id, editing, canManage], loadPage, { immediate: true })
onBeforeUnmount(() => {
  alive = false
  loadController?.abort()
})
</script>

<template>
  <UiPage v-if="canManage" isBack isNotBg isAuto :title="title" :fallback="fallback">
    <div class="shared-account-form">
      <LoadingBox v-if="loading" />
      <div v-else-if="loadError" role="alert">
        <UiNotice>{{ loadError }}</UiNotice>
        <Button @click="loadPage">{{ t('remoteSelect.retry') }}</Button>
      </div>
      <template v-else>
        <UiNotice v-if="disabledWallet">{{ text('disabledWallet') }}</UiNotice>
        <Form ref="formRef" label-position="top" :model="form" :show-message="false" @submit.prevent="submit">
          <fieldset :disabled="submitting || disabledWallet || !!pendingPayload">
            <section class="basic-section">
              <h3>{{ t('card.index.sharedManagement.basicInfo') }}</h3>
              <div class="form-columns">
                <FormItemBox :label="text('name')" prop="name" required :rules="rules.name">
                  <FormInput v-model="form.name" :maxlength="50" :placeholder="text('namePlaceholder')" />
                </FormItemBox>
                <FormItemBox :label="text('remark')" prop="remark" required :rules="rules.remark">
                  <FormInput v-model="form.remark" :maxlength="100" :placeholder="text('remarkPlaceholder')" />
                </FormItemBox>
              </div>
            </section>
            <FormItemBox v-if="hasPermission('team.group.view') || hasPermission('team.account.view')" :label="text('scope')" :label-sub="t('certify.optional')" :desc="text('scopeHelp')" class="scope-block">
              <div class="form-columns">
                <div v-if="hasPermission('team.group.view')" class="scope-section">
                  <div class="scope-heading">
                    <h4>{{ text('groups') }} <span>{{ text('multiple') }}</span></h4>
                    <Button
                      v-if="canCreateGroup"
                      icon="md-add"
                      type="text"
                      size="small"
                      :disabled="submitting || disabledWallet || !!pendingPayload"
                      @click="canCreateGroup && toRoute('ucenterAccountGroupCreate', teamCreateQuery)"
                    >{{ t('card.index.sharedOverview.create') }}</Button>
                  </div>
                  <FormRemoteSelect
                    v-disable-autofill
                    v-model="form.team_group_ids"
                    apiUrl="/user/TeamGroup/index"
                    method="get"
                    :page-size="20"
                    :params="scopeParams"
                    :max-tag-count="3"
                    :selected-options="groups"
                    :data-processor="processGroupPage"
                    @options-loaded="({ options }) => groups = rememberOptions(groups, form.team_group_ids, options)"
                    :active="hasPermission('team.group.view')"
                    :disabled="submitting || disabledWallet || !!pendingPayload"
                    :aria-label="text('groups')"
                    :placeholder="t('remoteSelect.searchGroups')"
                    multiple
                  />
                </div>
                <div v-if="hasPermission('team.account.view')" class="scope-section">
                  <div class="scope-heading">
                    <h4>{{ text('accounts') }} <span>{{ text('multiple') }}</span></h4>
                    <Button
                      v-if="canCreateAccount"
                      icon="md-add"
                      type="text"
                      size="small"
                      :disabled="submitting || disabledWallet || !!pendingPayload"
                      @click="canCreateAccount && toRoute('ucenterAccountCreate', teamCreateQuery)"
                    >{{ t('card.index.sharedOverview.create') }}</Button>
                  </div>
                  <FormRemoteSelect
                    v-disable-autofill
                    v-model="form.account_ids"
                    apiUrl="/user/account/index"
                    method="post"
                    :page-size="20"
                    :params="scopeParams"
                    :max-tag-count="3"
                    :selected-options="accounts"
                    :data-processor="processAccountPage"
                    @options-loaded="({ options }) => accounts = rememberOptions(accounts, form.account_ids, options)"
                    :active="hasPermission('team.account.view')"
                    :disabled="submitting || disabledWallet || !!pendingPayload"
                    :aria-label="text('accounts')"
                    :placeholder="text('searchAccount')"
                    multiple
                  />
                </div>
              </div>
            </FormItemBox>
            <div v-if="!editing" class="initial-transfer">
              <FormItemBox :label="text('amount')" prop="amount" required :rules="rules.amount">
                <div class="amount-input">
                  <FormNumber v-model="form.amount" unit="USD" :max="balance == null ? null : Number(balance)" :min="0" :placeholder="text('amountPlaceholder')" />
                  <div class="amount-all" @click.stop>
                    <Button type="text" :disabled="submitting || disabledWallet || !!pendingPayload || (form.amount == null && !isValidAmount(balance))" @click="form.amount = form.amount == null ? new Decimal(balance).toNumber() : null">{{ t(form.amount == null ? 'card.index.common.all' : 'card.index.common.clear') }}</Button>
                  </div>
                </div>
              </FormItemBox>
              <div class="transfer-summary">
                <div class="helper balance-helper">
                  <span>{{ text('availableBalance') }}：<UiMoney class="text-msg" :value="balance" empty-text="-" /></span>
                  <Button size="small" type="text" icon="md-refresh" :aria-label="t('button.refresh')" :loading="refreshingBalance" :disabled="submitting || !!pendingPayload" @click="refreshBalance" />
                  <Button size="small" type="text" :disabled="submitting || !!pendingPayload" @click="toRoute('ucenter_deposit')">{{ t('card.index.transfer.recharge') }}</Button>
                </div>
                <Alert type="error">{{ text('transferNotice') }}</Alert>
              </div>
            </div>
            <section class="fund-settings">
              <h3>{{ text('settings') }}</h3>
              <p class="helper">{{ text('settingsHelp') }}</p>
              <div class="setting-section">
                <div class="setting-heading" :class="{ 'setting-heading-enabled': form.auto_recharge_enabled }">
                  <div><h4>{{ text('autoRecharge') }}</h4><p class="helper">{{ text('autoRechargeHelp') }}</p></div>
                  <FormSwitch v-model="form.auto_recharge_enabled" :aria-label="text('autoRecharge')" :disabled="submitting || disabledWallet || !!pendingPayload" />
                </div>
                <div v-show="form.auto_recharge_enabled" class="setting-fields inline-fields">
                  <FormItemBox :label="text('threshold')" prop="auto_recharge_threshold" :rules="rules.auto_recharge_threshold">
                    <FormNumber v-model="form.auto_recharge_threshold" string-mode :precision="2" :min="0" :max="9999999" unit="USD" :disabled="!form.auto_recharge_enabled" :placeholder="text('thresholdPlaceholder')" />
                  </FormItemBox>
                  <FormItemBox :label="text('rechargeAmount')" prop="auto_recharge_amount" :rules="rules.auto_recharge_amount">
                    <FormNumber v-model="form.auto_recharge_amount" string-mode :precision="2" :min="rechargeMin" :max="9999999" unit="USD" :disabled="!form.auto_recharge_enabled" :placeholder="text('amountPlaceholder')" @on-blur="syncRechargeAmount" />
                  </FormItemBox>
                </div>
              </div>
              <div class="setting-section">
                <div class="setting-heading" :class="{ 'setting-heading-enabled': form.low_balance_notice_enabled }">
                  <div><h4>{{ text('lowBalance') }}</h4><p class="helper">{{ text('lowBalanceHelp') }}</p></div>
                  <FormSwitch v-model="form.low_balance_notice_enabled" :aria-label="text('lowBalance')" :disabled="submitting || disabledWallet || !!pendingPayload" />
                </div>
                <div v-show="form.low_balance_notice_enabled" class="setting-fields inline-fields">
                  <FormItemBox :label="text('threshold')" prop="low_balance_threshold" :rules="rules.low_balance_threshold">
                    <FormNumber v-model="form.low_balance_threshold" string-mode :precision="2" :min="0" :max="9999999" unit="USD" :disabled="!form.low_balance_notice_enabled" :placeholder="text('thresholdPlaceholder')" />
                  </FormItemBox>
                  <FormItemBox :label="text('channels')" prop="notice_channels">
                    <CheckboxGroup v-model="form.notice_channels">
                      <Checkbox label="notice" disabled>{{ text('notice') }}</Checkbox>
                      <Checkbox label="email" :disabled="!form.low_balance_notice_enabled || submitting || disabledWallet || !!pendingPayload">{{ text('email') }}</Checkbox>
                      <Checkbox label="member" :disabled="!form.low_balance_notice_enabled || submitting || disabledWallet || !!pendingPayload">{{ text('member') }}</Checkbox>
                    </CheckboxGroup>
                  </FormItemBox>
                </div>
              </div>
            </section>
          </fieldset>
          <div class="form-footer">
            <UiAffix :offset-bottom="10">
              <div class="form-actions">
                <div class="form-errors" role="alert" aria-live="polite">
                  <p v-if="submitHint">{{ submitHint }}</p>
                </div>
                <div class="form-action-buttons">
                  <Button type="primary" :loading="submitting" :disabled="!canManage || creationDisabled || disabledWallet || submitting || !!submitHint" @click="submit">
                    <span>{{ pendingPayload ? text('retrySubmit') : editing ? text('save') : text('create') }}</span>
                    <Icon type="ios-arrow-forward" />
                  </Button>
                </div>
              </div>
            </UiAffix>
          </div>
        </Form>
      </template>
    </div>
  </UiPage>
</template>

<style lang="less" scoped>
.shared-account-form {
  padding: var(--ui-padding-24);
  background: var(--ui-color-surface);
  fieldset { min-width: 0; padding: 0; border: 0; }
  h3, h4 { color: var(--ui-color-text); }
  h3 {
    font-size: var(--ui-font-size-xl);
    font-weight: 600;
  }
  h4 { font-size: var(--ui-font-size-xs); margin-bottom: var(--ui-space-8); }
  h4 span { font-weight: 400; color: var(--ui-color-text-secondary); }
  :deep(.ivu-form-item) { margin-bottom: var(--ui-space-24); }
  :deep(.ivu-form-item-label) { padding-bottom: var(--ui-space-8); }
  :deep(.ivu-form-item-content > .desc), :deep(.ivu-form-item-error-tip) { position: static; padding-top: var(--ui-space-8); line-height: var(--ui-line-height-md); }
  > .ui-notice { margin-bottom: var(--ui-space-16); }
  :deep(fieldset + .ui-notice) { margin-top: var(--ui-space-16); }
  :deep(.ivu-checkbox-group) { display: flex; flex-wrap: wrap; gap: var(--ui-space-8); }
  :deep(.ivu-checkbox-wrapper) { margin: 0; }
  :deep(.ivu-checkbox-border) { height: auto; min-height: var(--ui-size-32); background: var(--ui-color-surface); }
}
.helper { margin-block: var(--ui-space-8); color: var(--ui-color-text-secondary); font-size: var(--ui-font-size-xs); line-height: var(--ui-line-height-md); }
.balance-helper {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0;
  margin-top: 0;

  > span {
    min-width: 0;
    overflow-wrap: anywhere;
  }

  :deep(.ui-money-currency) {
    font-size: inherit;
  }

  :deep(.ivu-btn) {
    margin: 0;
    padding-inline: 0;
  }

  :deep(.ivu-btn-icon-only) {
    width: 14px;
    min-width: 14px;
  }

  :deep(.ivu-btn + .ivu-btn) {
    margin-inline-start: var(--ui-space-8);
  }

  @media (max-width: 768px) {
    :deep(.ivu-btn) {
      min-width: var(--ui-size-44);
      min-height: var(--ui-size-44);
    }
  }
}
.amount-input {
  position: relative;

  :deep(.ivu-input-number-input) {
    padding-inline-end: 74px;
  }

  :deep(.ivu-input-number-handler-wrap) {
    display: none;
  }
}
.amount-all {
  position: absolute;
  top: 50%;
  inset-inline-end: var(--ui-space-10);
  transform: translateY(-50%);
  z-index: 2;

  :deep(.ivu-btn) {
    padding-inline: var(--ui-space-4);
    min-width: var(--ui-size-44);
  }
}
.form-columns {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 22rem), 1fr));
  gap: var(--ui-space-24);

  > * {
    min-width: 0;
  }

  @media (max-width: 768px) {
    grid-template-columns: minmax(0, 1fr);
    gap: var(--ui-space-16);
  }
}
.basic-section {
  margin-bottom: var(--ui-space-24);
  padding-bottom: var(--ui-space-24);
  border-bottom: var(--ui-border-subtle);

  h3 {
    margin-bottom: var(--ui-space-16);
  }

  :deep(.ivu-form-item) {
    margin-bottom: 0;
  }
}
.initial-transfer {
  padding-top: var(--ui-space-24);
  margin-bottom: var(--ui-space-24);
  border-top: var(--ui-border-subtle);

  :deep(.ivu-form-item) {
    margin-bottom: 0;
  }

  .transfer-summary {
    margin-top: var(--ui-space-12);

    :deep(.ivu-alert) {
      margin-bottom: 0;
    }
  }

}
.scope-block {
  :deep(.ivu-form-item-label) {
    font-size: var(--ui-font-size-xl);
    font-weight: 600;
  }
}
.scope-section {
  min-width: 0;
}
.scope-heading {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: var(--ui-space-8);
  margin-bottom: var(--ui-space-4);

  h4 {
    margin-bottom: 0;
  }

  :deep(.ivu-btn) {
    flex-shrink: 0;
    color: var(--ui-color-primary);

    @media (max-width: 768px) {
      min-height: var(--ui-size-44);
    }
  }
}
.fund-settings { border-top: var(--ui-border-subtle); padding-top: var(--ui-space-24); }
.fund-settings > .helper { margin-block: var(--ui-space-4) 0; }
.setting-section { padding: var(--ui-padding-16); border: var(--ui-border-subtle); border-radius: var(--ui-radius-lg); margin-top: var(--ui-space-16); }
.setting-section > .helper { margin: var(--ui-space-12) 0 0; }
.setting-heading { display: flex; align-items: center; justify-content: space-between; gap: var(--ui-space-16); }
.setting-heading h4 { font-size: var(--ui-font-size-md); margin-bottom: var(--ui-space-4); }
.setting-heading > div { min-width: 0; }
.setting-heading :deep(.ivu-switch) { flex-shrink: 0; }
.setting-heading .helper { margin: 0; }
.setting-heading-enabled {
  margin: calc(-1 * var(--ui-space-16));
  margin-bottom: 0;
  padding: var(--ui-padding-16);
  border-start-start-radius: inherit;
  border-start-end-radius: inherit;
  background: var(--ui-color-surface-muted);

  @media (max-width: 768px) {
    margin: calc(-1 * var(--ui-space-12));
    margin-bottom: 0;
    padding: var(--ui-padding-12);
  }
}
.setting-fields {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 18rem), 1fr));
  align-items: start;
  gap: var(--ui-space-16) var(--ui-space-24);
  margin-top: var(--ui-space-20);

  :deep(.ivu-form-item) {
    min-width: 0;
    margin-bottom: 0;
  }

  :deep(.ivu-form-item-label) {
    max-width: 100%;
    font-size: var(--ui-font-size-md);
  }

  :deep(.ivu-form-item-content) {
    min-width: 0;
  }

  :deep(.ivu-input-wrapper) {
    width: 100%;
  }

  :deep(.ivu-checkbox-group) {
    gap: var(--ui-space-8) var(--ui-space-16);
    min-height: var(--ui-size-32);
    align-items: center;
  }

  :deep(.ivu-checkbox-wrapper) {
    white-space: normal;
    overflow-wrap: anywhere;
  }

  @media (max-width: 768px) {
    grid-template-columns: minmax(0, 1fr);

    :deep(.ivu-checkbox-wrapper) {
      display: inline-flex;
      align-items: center;
      min-height: var(--ui-size-44);
    }

    :deep(.ivu-checkbox) {
      flex-shrink: 0;
    }
  }
}
.inline-fields {
  :deep(.ivu-form-item) {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: var(--ui-space-8) var(--ui-space-16);

    &::before, &::after {
      display: none;
    }
  }

  :deep(.ivu-form-item-label) {
    flex-shrink: 0;
    padding-bottom: 0;
  }

  :deep(.ivu-form-item-content) {
    flex: 1 1 160px;
  }
}
.form-footer { margin-top: var(--ui-space-24); padding-bottom: calc(var(--ui-space-16) + env(safe-area-inset-bottom, 0px)); }
.form-actions { display: flex; align-items: center; justify-content: space-between; gap: var(--ui-space-16); padding: var(--ui-padding-16-24); background: var(--ui-color-surface); border: var(--ui-border-subtle); border-radius: var(--ui-radius-lg); box-shadow: 0 4px 20px rgba(0, 0, 0, 0.04); }
.form-action-buttons { display: flex; flex-shrink: 0; gap: var(--ui-space-12); }
.form-action-buttons :deep(.ivu-btn) { min-height: var(--ui-size-42); border-radius: var(--ui-radius-24); }
.form-action-buttons :deep(.ivu-btn-primary) { min-width: var(--ui-size-160); font-weight: 600; }
.form-errors { flex: 1; min-width: 0; color: var(--ui-color-error); font-size: var(--ui-font-size-xs); line-height: var(--ui-line-height-md); overflow-wrap: anywhere; }
.form-errors p { margin: 0; }
@media (max-width: 768px) {
  .shared-account-form { padding: var(--ui-padding-16); }
  .setting-section { padding: var(--ui-padding-12); }
  .form-actions { flex-direction: column; align-items: stretch; padding: var(--ui-padding-12-16); }
  .form-errors:empty { display: none; }
  .form-action-buttons :deep(.ivu-btn) { flex: 1; min-width: 0; min-height: var(--ui-size-44); }
  .shared-account-form :deep(.ivu-checkbox-border) { min-height: var(--ui-size-44); display: inline-flex; align-items: center; }
}
</style>
