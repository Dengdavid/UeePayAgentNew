<template>
  <UiPage isBack :back-handler="backToAccounts" :fallback="{ name: 'ucenterAccount', query: { type: 'account' } }">
    <LoadingBox v-if="loading" />
    <div v-else-if="loadError" role="alert">
      <UiNotice>{{ loadError }}</UiNotice>
      <Button @click="loadPage">{{ $t('button.refresh') }}</Button>
    </div>
    <Form v-else-if="detail" ref="formRef" :model="form" :rules="rules" label-position="top" :show-message="false" @submit.prevent="submit">
      <div class="list-b-22">
        <FormItemBox :label="$t('ucenterAccount.field.account')" prop="">
          <FormInput :model-value="detail?.nickname || '-'" size="large" disabled :clearable="false" />
        </FormItemBox>

        <FormItemBox
          :label="$t('ucenterAccount.field.email')"
          :prop="canEditEmail ? 'email' : ''"
          :isRequired="canEditEmail"
        >
          <FormEmail
            :data="form"
            data-name="email"
            size="large"
            :disabled="!canEditEmail || submitLoading"
            :placeholder="$t('ucenterAccount.placeholder.email')"
          />
          <Alert v-if="!canEditEmail" type="info" class="m-t-8 m-b-0">
            {{ $t('ucenterAccount.edit.emailReadonly') }}
          </Alert>
        </FormItemBox>

        <FormItemBox
          :label="$t('ucenterAccount.field.role')"
          :labelSub="$hasPermission('team.account.update') ? '' : $t('ucenterAccount.permission.noEditPermission')"
          :prop="$hasPermission('team.account.update') ? 'role_ids' : ''"
          :isRequired="$hasPermission('team.account.update')"
        >
          <FormSelectBox
            v-model="form.role_ids"
            size="large"
            :options="editableRoleOptions"
            label-key="name"
            value-key="id"
            option-label-key="name"
            multiple
            :disabled="!$hasPermission('team.account.update') || submitLoading"
            :placeholder="$t('ucenterAccount.placeholder.role')"
          />
        </FormItemBox>

        <FormItemBox
          :label="$t('ucenterAccount.field.group')"
          :labelSub="$hasPermission('team.account.update') ? '' : $t('ucenterAccount.permission.noEditPermission')"
          prop="group_ids"
        >
          <FormSelectBox
            v-model="form.group_ids"
            size="large"
            :options="editableGroupOptions"
            label-key="name"
            value-key="id"
            option-label-key="name"
            multiple
            :disabled="!$hasPermission('team.account.update') || submitLoading"
            :placeholder="$t('ucenterAccount.placeholder.group')"
          />
        </FormItemBox>

        <FormItemBox
          :label="$t('ucenterAccount.field.expirationDate')"
          prop="account_expire_time"
        >
          <FormDateBox
            v-model="form.account_expire_time"
            size="large"
            type="date"
            :disable-after-today="false"
            :placeholder="$t('ucenterAccount.placeholder.permanent')"
            :options="dateOptions"
            :disabled="submitLoading"
            @on-change="form.account_expire_time = $event || ''"
          />
        </FormItemBox>

        <FormItemBox
          :label="$t('ucenterAccount.field.remark')"
          prop="account_remark"
        >
          <FormInput
            v-model="form.account_remark"
            type="textarea"
            :rows="3"
            :maxlength="REMARK_MAX_LENGTH"
            :change-delay="0"
            :disabled="submitLoading"
            :placeholder="$t('ucenterAccount.placeholder.remark')"
          />
        </FormItemBox>
      </div>
      <div class="form-footer">
        <UiAffix :offset-bottom="10">
          <div class="form-actions">
            <div class="form-errors" role="alert" aria-live="polite">
              <p v-if="submitHint">{{ submitHint }}</p>
            </div>
            <div class="form-action-buttons">
              <Button type="primary" :loading="submitLoading" :disabled="submitLoading || !!submitHint" @click="submit">
                <span>{{ $t('button.save') }}</span>
              </Button>
            </div>
          </div>
        </UiAffix>
      </div>
    </Form>
  </UiPage>
</template>

<script setup>
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { onBeforeRouteLeave, onBeforeRouteUpdate } from 'vue-router'
import { userApi } from '@/api'
import { t } from '@/utils'
import { hasPermission } from '@/utils/permission.js'
import { message, showRequestError } from '@/utils/message.js'
import { isRecoveryRoute, toRoute, useRoute } from '@/utils/route.js'
import { getCalendarDateInTimezone } from '@/utils/preferences.js'

const route = useRoute()
const formRef = ref(null)
const detail = ref(null)
const form = ref({ email: '', role_ids: [], group_ids: [], account_expire_time: '', account_remark: '' })
const loading = ref(true)
const loadError = ref('')
const submitLoading = ref(false)
const roleOptions = ref([])
const groupOptions = ref([])
const REMARK_MAX_LENGTH = 200
let controller = null
let loadVersion = 0
let initialRoleIds = []
let initialGroupIds = []
const canEdit = computed(() => hasPermission('team.view') && hasPermission('team.account.view') && hasPermission('team.account.update'))
const canEditEmail = computed(() => [2, 3].includes(Number(detail.value?.status)))
const accountId = computed(() => Number(route.params.id))

const normalizeText = (value) => String(value ?? '').trim()
const normalizeCalendarDate = (value) => (
  normalizeText(value).match(/^(\d{4}-\d{2}-\d{2})/)?.[1] || ''
)
const normalizeRelationIds = (items) => (
  Array.isArray(items)
    ? [...new Set(items.map((item) => Number(item?.id ?? item)).filter((id) => id > 0))]
    : []
)
const sameIds = (left, right) => (
  [...left].sort((a, b) => a - b).join(',') === [...right].sort((a, b) => a - b).join(',')
)
const normalizeOptions = (items, currentItems = []) => {
  const options = new Map()
  const optionItems = [...(Array.isArray(currentItems) ? currentItems : []), ...items]
  optionItems.forEach((item) => {
    const id = Number(item?.id)
    if (id < 1 || !item?.name) return
    options.set(id, {
      ...options.get(id),
      ...item,
      id,
    })
  })
  return [...options.values()]
}

const dateOptions = {
  disabledDate(date) {
    if (!date) return false
    const calendarDate = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 12)
    return calendarDate.getTime() < getCalendarDateInTimezone().getTime()
  },
}

const rules = computed(() => ({
  email: canEditEmail.value ? [
    {
      required: true,
      message: t('ucenterAccount.validation.emailRequired'),
      trigger: 'blur',
      transform: normalizeText,
    },
    {
      type: 'email',
      max: 50,
      message: t('ucenterAccount.validation.emailFormat'),
      trigger: 'blur',
      transform: normalizeText,
    },
  ] : [],
  account_remark: [{
    max: REMARK_MAX_LENGTH,
    message: t('ucenterAccount.batchCreate.validation.remarkMaxLength', { max: REMARK_MAX_LENGTH }),
    trigger: 'change',
  }],
  role_ids: [{
    validator: (_rule, value, callback) => {
      if (!hasPermission('team.account.update')) return callback()
      if (!Array.isArray(value) || !value.length) {
        return callback(new Error(t('ucenterAccount.batchCreate.validation.roleRequired')))
      }
      return callback()
    },
    trigger: 'change',
  }],
}))

const submitHint = computed(() => {
  if (canEditEmail.value && !normalizeText(form.value.email)) return t('ucenterAccount.validation.emailRequired')
  if (canEditEmail.value && (form.value.email.length > 50 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.value.email))) return t('ucenterAccount.validation.emailFormat')
  if (!form.value.role_ids.length) return t('ucenterAccount.batchCreate.validation.roleRequired')
  if (form.value.account_remark.length > REMARK_MAX_LENGTH) return t('ucenterAccount.batchCreate.validation.remarkMaxLength', { max: REMARK_MAX_LENGTH })
  return ''
})

const getEditableOptions = (options, selectedItems) => {
  const selectedIds = new Set(normalizeRelationIds(selectedItems))
  return options
    .filter((item) => item.status === undefined || Number(item.status) === 1 || selectedIds.has(item.id))
    .map((item) => ({ ...item, disabled: false }))
}
const editableRoleOptions = computed(() => getEditableOptions(roleOptions.value, form.value.role_ids))
const editableGroupOptions = computed(() => getEditableOptions(groupOptions.value, form.value.group_ids))

const backToAccounts = () => toRoute('ucenterAccount', { type: 'account' }, 'query', { replace: true })

const loadPage = async () => {
  const version = ++loadVersion
  controller?.abort()
  controller = null
  detail.value = null
  roleOptions.value = []
  groupOptions.value = []
  loadError.value = ''
  loading.value = true
  if (route.name !== 'ucenterAccountEdit') return
  if (!canEdit.value) {
    toRoute('error_403', {}, 'query', { replace: true })
    return
  }
  const id = accountId.value
  if (!/^\d+$/.test(String(route.params.id)) || !Number.isSafeInteger(id) || id <= 0) {
    toRoute('error_404', {}, 'query', { replace: true })
    return
  }
  const requestController = new AbortController()
  controller = requestController
  try {
    const data = await userApi.getAccountDetail({ account_id: id }, { signal: requestController.signal })
    if (version !== loadVersion) return
    if (!data || Number(data.id ?? data.account_id) !== id || ![0, 1, 2, 3].includes(Number(data.status)) || !Array.isArray(data.role_ids ?? data.roles) || !Array.isArray(data.group_ids ?? data.groups)) throw new Error('Invalid account detail')
    const options = await userApi.getAccountOptions({ signal: requestController.signal })
    if (version !== loadVersion) return
    if (!options || !Array.isArray(options.roles) || !Array.isArray(options.groups)) throw new Error('Invalid account options')
    initialRoleIds = normalizeRelationIds(data.role_ids ?? data.roles)
    initialGroupIds = normalizeRelationIds(data.group_ids ?? data.groups)
    roleOptions.value = normalizeOptions(options.roles, data.roles)
    groupOptions.value = normalizeOptions(options.groups, data.groups)
    form.value = {
      email: data.email || '',
      role_ids: [...initialRoleIds],
      group_ids: [...initialGroupIds],
      account_expire_time: normalizeCalendarDate(data.account_expire_time),
      account_remark: data.account_remark || '',
    }
    detail.value = data
  } catch (error) {
    if (version !== loadVersion || requestController.signal.aborted) return
    loadError.value = !error?.silent && error?.msg && error.msg !== 'SILENT_ERROR' ? error.msg : t('ucenterAccount.edit.loadFailed')
  } finally {
    if (version === loadVersion) {
      loading.value = false
      controller = null
    }
  }
}

const submit = async () => {
  if (!canEdit.value || loading.value || loadError.value || !detail.value || !formRef.value || submitLoading.value) return
  const version = loadVersion
  submitLoading.value = true
  try {
    if (!await formRef.value.validate() || version !== loadVersion || !canEdit.value) return
    const data = {
      account_id: accountId.value,
      account_expire_time: normalizeCalendarDate(form.value.account_expire_time),
      account_remark: normalizeText(form.value.account_remark),
    }
    const roleIds = normalizeRelationIds(form.value.role_ids)
    const groupIds = normalizeRelationIds(form.value.group_ids)
    if (!sameIds(roleIds, initialRoleIds)) data.role_ids = roleIds
    if (!sameIds(groupIds, initialGroupIds)) data.group_ids = groupIds
    if (canEditEmail.value) data.email = normalizeText(form.value.email)
    await userApi.updateAccount(data)
    if (version !== loadVersion) return
    message(t('ucenterAccount.message.updated'))
    submitLoading.value = false
    await backToAccounts()
  } catch (error) {
    showRequestError(error)
  } finally {
    if (version === loadVersion) submitLoading.value = false
  }
}

onBeforeRouteLeave(to => isRecoveryRoute(to) || !submitLoading.value)
onBeforeRouteUpdate(to => isRecoveryRoute(to) || !submitLoading.value)
watch(() => [route.name, route.params.id], loadPage, { immediate: true, flush: 'sync' })
onBeforeUnmount(() => {
  loadVersion += 1
  controller?.abort()
})
</script>

<style scoped lang="less">
.form-footer { margin-top: var(--ui-space-24); padding-bottom: calc(var(--ui-space-16) + env(safe-area-inset-bottom, 0px)); }
.form-actions { display: flex; align-items: center; justify-content: space-between; gap: var(--ui-space-16); padding: var(--ui-padding-16-24); background: var(--ui-color-surface); border: var(--ui-border-subtle); border-radius: var(--ui-radius-lg); box-shadow: 0 4px 20px rgba(0, 0, 0, 0.04); }
.form-action-buttons { display: flex; flex-shrink: 0; gap: var(--ui-space-12); }
.form-action-buttons :deep(.ivu-btn) { min-height: var(--ui-size-42); border-radius: var(--ui-radius-24); }
.form-action-buttons :deep(.ivu-btn-primary) { min-width: var(--ui-size-160); font-weight: 600; }
.form-errors { flex: 1; min-width: 0; color: var(--ui-color-error); font-size: var(--ui-font-size-xs); line-height: var(--ui-line-height-md); overflow-wrap: anywhere; }
.form-errors p { margin: 0; }

@media (max-width: 768px) {
  .form-actions { flex-direction: column; align-items: stretch; padding: var(--ui-padding-12-16); }
  .form-errors:empty { display: none; }
  .form-action-buttons :deep(.ivu-btn) { flex: 1; min-width: 0; min-height: var(--ui-size-44); }
}
</style>
