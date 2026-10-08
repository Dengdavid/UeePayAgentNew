<template>
  <UiPage
    isBack
    :back-handler="handleCancel"
    :fallback="{ name: 'ucenterAccount', query: { type: 'account' } }"
  >
    <div class="account-batch-create">
      <Alert show-icon type="info" class="account-batch-create__notice">
        {{ $t('ucenterAccount.activationNotice') }}
      </Alert>

      <Alert v-if="optionsError" show-icon type="error" class="account-batch-create__notice">
        <div class="account-batch-create__error-row">
          <span>{{ optionsError }}</span>
          <Button type="text" :disabled="optionsLoading" @click="loadOptions">
            {{ $t('button.refresh') }}
          </Button>
        </div>
      </Alert>

      <Alert v-if="batchError" show-icon type="error" class="account-batch-create__notice">
        {{ batchError }}
      </Alert>

      <div v-if="optionsLoading" class="account-batch-create__loading">
        <Spin />
      </div>

      <template v-else-if="!optionsError">
        <Form ref="formRef" :model="form" label-position="top" autocomplete="off" @submit.prevent="handleSubmit">
          <section
            v-for="(account, index) in form.accounts"
            :key="account.formKey"
          >
            <div class="account-batch-create__fields">
              <FormItemBox
                :label="$t('ucenterAccount.field.account')"
                :prop="`accounts.${index}.nickname`"
                :rules="nicknameRules"
                :class="fieldClass(index, 'nickname')"
                isRequired
              >
                <FormInput
                  v-model="account.nickname"
                  size="large"
                  :maxlength="ACCOUNT_MAX_LENGTH"
                  :change-delay="0"
                  :disabled="submitLoading"
                  :placeholder="$t('ucenterAccount.placeholder.account')"
                  autocomplete="off"
                  @on-change="clearFieldError(index, 'nickname')"
                />
                <p v-if="fieldError(index, 'nickname')" class="account-batch-create__field-error" role="alert">
                  {{ fieldError(index, 'nickname') }}
                </p>
              </FormItemBox>

              <FormItemBox
                :label="$t('ucenterAccount.field.email')"
                :prop="`accounts.${index}.email`"
                :rules="emailRules"
                :class="fieldClass(index, 'email')"
                isRequired
              >
                <FormEmail
                  :data="account"
                  data-name="email"
                  size="large"
                  :disabled="submitLoading"
                  :placeholder="$t('ucenterAccount.placeholder.email')"
                  @on-change="clearFieldError(index, 'email')"
                />
                <p v-if="fieldError(index, 'email')" class="account-batch-create__field-error" role="alert">
                  {{ fieldError(index, 'email') }}
                </p>
              </FormItemBox>

              <FormItemBox
                :label="$t('ucenterAccount.field.role')"
                :prop="`accounts.${index}.role_ids`"
                :rules="roleRules"
                :class="fieldClass(index, 'role_ids')"
                isRequired
              >
                <FormSelectBox
                  v-model="account.role_ids"
                  size="large"
                  :options="roleOptions"
                  label-key="name"
                  value-key="id"
                  option-label-key="name"
                  multiple
                  :disabled="submitLoading"
                  :placeholder="$t('ucenterAccount.placeholder.role')"
                  @on-change="clearFieldError(index, 'role_ids')"
                />
                <p v-if="fieldError(index, 'role_ids')" class="account-batch-create__field-error" role="alert">
                  {{ fieldError(index, 'role_ids') }}
                </p>
              </FormItemBox>

              <FormItemBox
                :label="$t('ucenterAccount.field.group')"
                :prop="`accounts.${index}.group_ids`"
                :class="fieldClass(index, 'group_ids')"
              >
                <FormSelectBox
                  v-model="account.group_ids"
                  size="large"
                  :options="groupOptions"
                  label-key="name"
                  value-key="id"
                  option-label-key="name"
                  multiple
                  :disabled="submitLoading"
                  :placeholder="$t('ucenterAccount.placeholder.group')"
                  @on-change="clearFieldError(index, 'group_ids')"
                />
                <p v-if="fieldError(index, 'group_ids')" class="account-batch-create__field-error" role="alert">
                  {{ fieldError(index, 'group_ids') }}
                </p>
              </FormItemBox>

              <FormItemBox
                :label="$t('ucenterAccount.field.expirationDate')"
                :prop="`accounts.${index}.account_expire_time`"
                :class="fieldClass(index, 'account_expire_time')"
              >
                <FormDateBox
                  v-model="account.account_expire_time"
                  size="large"
                  type="date"
                  :disable-after-today="false"
                  :disabled="submitLoading"
                  :placeholder="$t('ucenterAccount.placeholder.permanent')"
                  :options="dateOptions"
                  @on-change="clearFieldError(index, 'account_expire_time')"
                />
                <p v-if="fieldError(index, 'account_expire_time')" class="account-batch-create__field-error" role="alert">
                  {{ fieldError(index, 'account_expire_time') }}
                </p>
              </FormItemBox>

              <FormItemBox
                :label="$t('ucenterAccount.field.remark')"
                :prop="`accounts.${index}.account_remark`"
                :rules="remarkRules"
                :class="['account-batch-create__remark', fieldClass(index, 'account_remark')]"
              >
                <FormInput
                  v-model="account.account_remark"
                  type="textarea"
                  :rows="4"
                  :maxlength="REMARK_MAX_LENGTH"
                  :change-delay="0"
                  :disabled="submitLoading"
                  :placeholder="$t('ucenterAccount.placeholder.remark')"
                  @on-change="clearFieldError(index, 'account_remark')"
                />
                <p v-if="fieldError(index, 'account_remark')" class="account-batch-create__field-error" role="alert">
                  {{ fieldError(index, 'account_remark') }}
                </p>
              </FormItemBox>
            </div>
          </section>
        </Form>

        <div class="form-footer">
          <UiAffix :offset-bottom="10" use-capture>
            <div class="form-actions">
              <div class="form-errors" role="alert" aria-live="polite">
                <p v-if="submitHint">{{ submitHint }}</p>
              </div>
              <div class="form-action-buttons">
                <Button type="primary" :loading="submitLoading" :disabled="submitLoading || !$hasPermission('team.account.create') || !!submitHint" @click="handleSubmit">
                  <span>{{ $t('ucenterAccount.batchCreate.submit') }}</span>
                </Button>
              </div>
            </div>
          </UiAffix>
        </div>
      </template>
    </div>
  </UiPage>
</template>

<script setup>
import { hasPermission } from '@/utils/permission.js'
import { computed, nextTick, onBeforeUnmount, onMounted, reactive, ref } from 'vue'
import { onBeforeRouteLeave, onBeforeRouteUpdate } from 'vue-router'
import { userApi } from '@/api'
import { t } from '@/utils/index.js'
import { message } from '@/utils/message.js'
import { getCalendarDateInTimezone } from '@/utils/preferences.js'
import { isRecoveryRoute, toRoute, useRoute } from '@/utils/route.js'

const route = useRoute()
const ACCOUNT_MIN_LENGTH = 6
const ACCOUNT_MAX_LENGTH = 20
const EMAIL_MAX_LENGTH = 50
const REMARK_MAX_LENGTH = 200
const ACCOUNT_PATTERN = /^[A-Za-z0-9_]+$/
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const SERVER_FIELDS = new Set([
  'nickname',
  'email',
  'role_ids',
  'group_ids',
  'account_expire_time',
  'account_remark',
])

let nextFormKey = 1
let optionsController = null
let alive = true

const formRef = ref(null)
const optionsLoading = ref(false)
const optionsError = ref('')
const submitLoading = ref(false)
const roleOptions = ref([])
const groupOptions = ref([])
const serverFieldErrors = ref({})
const batchError = ref('')

const createAccount = () => ({
  formKey: nextFormKey++,
  nickname: '',
  email: '',
  role_ids: [],
  group_ids: [],
  account_expire_time: '',
  account_remark: '',
})

const form = reactive({
  accounts: [createAccount()],
})

const normalizeText = (value) => String(value ?? '').trim()
const fieldKey = (index, field) => `${index}.${field}`

const submitHint = computed(() => {
  if (form.accounts.length !== 1) return t('ucenterAccount.batchCreate.validation.batchSize')
  for (const account of form.accounts) {
    const nickname = normalizeText(account.nickname)
    const email = normalizeText(account.email)
    let hint = ''
    if (!nickname) hint = t('validate.required', { field: t('ucenterAccount.field.account') })
    else if (nickname.length < ACCOUNT_MIN_LENGTH || nickname.length > ACCOUNT_MAX_LENGTH || !ACCOUNT_PATTERN.test(nickname)) hint = t('ucenterAccount.batchCreate.validation.accountFormat', { min: ACCOUNT_MIN_LENGTH, max: ACCOUNT_MAX_LENGTH })
    else if (!email) hint = t('ucenterAccount.validation.emailRequired')
    else if (email.length > EMAIL_MAX_LENGTH || !EMAIL_PATTERN.test(email)) hint = t('ucenterAccount.validation.emailFormat')
    else if (!account.role_ids.length) hint = t('ucenterAccount.batchCreate.validation.roleRequired')
    else if (String(account.account_remark ?? '').length > REMARK_MAX_LENGTH) hint = t('ucenterAccount.batchCreate.validation.remarkMaxLength', { max: REMARK_MAX_LENGTH })
    if (hint) return hint
  }
  return ''
})

const nicknameRules = [{
  validator: (_rule, value, callback) => {
    const nickname = normalizeText(value)
    if (!nickname) return callback()
    if (
      nickname.length < ACCOUNT_MIN_LENGTH
      || nickname.length > ACCOUNT_MAX_LENGTH
      || !ACCOUNT_PATTERN.test(nickname)
    ) {
      return callback(new Error(t('ucenterAccount.batchCreate.validation.accountFormat', {
        min: ACCOUNT_MIN_LENGTH,
        max: ACCOUNT_MAX_LENGTH,
      })))
    }
    return callback()
  },
  trigger: 'blur',
}]

const emailRules = [{
  validator: (_rule, value, callback) => {
    const email = normalizeText(value)
    if (!email) return callback()
    if (email.length > EMAIL_MAX_LENGTH || !EMAIL_PATTERN.test(email)) {
      return callback(new Error(t('ucenterAccount.validation.emailFormat')))
    }
    return callback()
  },
  trigger: 'blur',
}]

const roleRules = computed(() => [{
  validator: (_rule, value, callback) => {
    if (!Array.isArray(value) || !value.length) {
      return callback(new Error(t('ucenterAccount.batchCreate.validation.roleRequired')))
    }
    return callback()
  },
  trigger: 'change',
}])

const remarkRules = computed(() => [{
  validator: (_rule, value, callback) => {
    if (String(value ?? '').length > REMARK_MAX_LENGTH) {
      return callback(new Error(t('ucenterAccount.batchCreate.validation.remarkMaxLength', {
        max: REMARK_MAX_LENGTH,
      })))
    }
    return callback()
  },
  trigger: 'change',
}])

const dateOptions = {
  disabledDate(date) {
    if (!date) return false
    const calendarDate = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 12)
    return calendarDate.getTime() < getCalendarDateInTimezone().getTime()
  },
}

const isCanceledError = (error) => (
  error?.code === 'ERR_CANCELED' || error?.name === 'CanceledError'
)
const isSilentError = (error) => error?.silent || error?.msg === 'SILENT_ERROR'

const normalizeOptions = (items, onlyActive = false) => (
  Array.isArray(items)
    ? items
      .filter((item) => (
        item
        && Number(item.id) > 0
        && item.name
        && (!onlyActive || item.status === undefined || Number(item.status) === 1)
      ))
      .map((item) => ({
        ...item,
        id: Number(item.id),
      }))
    : []
)

const loadOptions = async () => {
  if (!hasPermission('team.account.create')) return
  optionsController?.abort()
  const controller = new AbortController()
  optionsController = controller
  optionsLoading.value = true
  optionsError.value = ''

  try {
    const data = await userApi.getAccountOptions({ signal: controller.signal })
    if (optionsController !== controller) return
    if (!data || !Array.isArray(data.roles) || !Array.isArray(data.groups)) {
      throw new Error('Invalid account options')
    }
    roleOptions.value = normalizeOptions(data.roles, true)
    groupOptions.value = normalizeOptions(data.groups, true)
  } catch (error) {
    if (isCanceledError(error) || isSilentError(error) || optionsController !== controller) return
    optionsError.value = error?.msg || t('ucenterAccount.message.optionsLoadFailed')
  } finally {
    if (optionsController === controller) {
      optionsController = null
      optionsLoading.value = false
    }
  }
}

const clearServerErrors = () => {
  serverFieldErrors.value = {}
  batchError.value = ''
}

const fieldError = (index, field) => (
  serverFieldErrors.value[fieldKey(index, field)]
  || ''
)
const fieldClass = (index, field) => ({
  'account-batch-create__field--error': Boolean(fieldError(index, field)),
})

const clearFieldError = (index, field) => {
  const key = fieldKey(index, field)
  if (serverFieldErrors.value[key]) {
    const nextErrors = { ...serverFieldErrors.value }
    delete nextErrors[key]
    serverFieldErrors.value = nextErrors
  }
  batchError.value = ''
}

const normalizeIds = (ids) => (
  Array.isArray(ids)
    ? [...new Set(ids.map(Number).filter((id) => Number.isInteger(id) && id > 0))]
    : []
)

const createPayloadItem = (account) => {
  const item = {
    nickname: normalizeText(account.nickname),
    email: normalizeText(account.email).toLowerCase(),
    role_ids: normalizeIds(account.role_ids),
  }
  const groupIds = normalizeIds(account.group_ids)
  const expireTime = normalizeText(account.account_expire_time)
  const remark = normalizeText(account.account_remark)

  if (groupIds.length) item.group_ids = groupIds
  if (expireTime) item.account_expire_time = expireTime
  if (remark) item.account_remark = remark
  return item
}

const applyServerErrors = (errors) => {
  if (!Array.isArray(errors)) return false
  const fieldErrors = {}
  const generalErrors = []

  errors.forEach((error) => {
    const index = Number(error?.item_index)
    const field = String(error?.field || '')
    const errorMessage = normalizeText(error?.message)
    if (!errorMessage) return

    if (
      Number.isInteger(index)
      && index >= 0
      && index < form.accounts.length
      && SERVER_FIELDS.has(field)
    ) {
      fieldErrors[fieldKey(index, field)] = errorMessage
    } else {
      generalErrors.push(errorMessage)
    }
  })

  serverFieldErrors.value = fieldErrors
  if (generalErrors.length) batchError.value = [...new Set(generalErrors)].join(' ')
  return Boolean(Object.keys(fieldErrors).length || generalErrors.length)
}

const handleSubmit = async () => {
  if (!hasPermission('team.account.create')) return
  if (submitLoading.value || optionsLoading.value || optionsError.value) return
  submitLoading.value = true
  try {
    clearServerErrors()

    if (form.accounts.length !== 1) {
      batchError.value = t('ucenterAccount.batchCreate.validation.batchSize')
      return
    }

    const valid = formRef.value ? await formRef.value.validate() : false
    if (!valid) {
      await nextTick()
      document.querySelector('.account-batch-create__field--error, .ivu-form-item-error')?.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      })
      return
    }
    if (!alive || !hasPermission('team.account.create')) return
    await userApi.batchCreateAccount({
      accounts: [createPayloadItem(form.accounts[0])],
    })
    if (!alive) return
    message(t('ucenterAccount.message.created'))
    submitLoading.value = false
    await handleCancel()
  } catch (error) {
    if (!alive || isSilentError(error)) return
    const errorMessage = error?.msg || error?.message || t('ucenterAccount.batchCreate.failed')
    const hasInlineErrors = applyServerErrors(error?.data?.errors)
    if (!hasInlineErrors) batchError.value = errorMessage
    await nextTick()
    document.querySelector('.account-batch-create__field--error')?.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
    })
  } finally {
    submitLoading.value = false
  }
}

const handleCancel = () => {
  if (submitLoading.value) return
  if (route.query.returnTo === 'cardSharedWalletAdd') {
    return toRoute('cardSharedWalletAdd', {}, 'query', { replace: true })
  }
  if (route.query.returnTo === 'cardSharedWalletEdit' && typeof route.query.walletId === 'string' && route.query.walletId) {
    return toRoute('cardSharedWalletEdit', { id: route.query.walletId }, 'params', { replace: true })
  }
  return toRoute('ucenterAccount', { type: 'account' }, 'query', { replace: true })
}

onBeforeRouteLeave(to => isRecoveryRoute(to) || !submitLoading.value)
onBeforeRouteUpdate(to => isRecoveryRoute(to) || !submitLoading.value)
onMounted(loadOptions)
onBeforeUnmount(() => {
  alive = false
  optionsController?.abort()
})
</script>

<style scoped lang="less">
.form-footer { margin-top: var(--ui-space-24); padding-bottom: calc(var(--ui-space-16) + env(safe-area-inset-bottom, 0px)); }
.form-actions { display: flex; align-items: center; justify-content: space-between; gap: var(--ui-space-16); padding: var(--ui-padding-16-24); background: var(--ui-color-surface); border: var(--ui-border-subtle); border-radius: var(--ui-radius-md); box-shadow: 0 4px 20px rgba(0, 0, 0, 0.04); }
.form-action-buttons { display: flex; flex-shrink: 0; gap: var(--ui-space-12); }
.form-action-buttons :deep(.ivu-btn) { min-height: var(--ui-size-42); border-radius: var(--ui-radius-md); }
.form-action-buttons :deep(.ivu-btn-primary) { min-width: var(--ui-size-160); font-weight: 600; }
.form-errors { flex: 1; min-width: 0; color: var(--ui-color-error); font-size: var(--ui-font-size-xs); line-height: var(--ui-line-height-md); overflow-wrap: anywhere; }
.form-errors p { margin: 0; }

@media (max-width: 768px) {
  .form-actions { flex-direction: column; align-items: stretch; padding: var(--ui-padding-12-16); }
  .form-errors:empty { display: none; }
  .form-action-buttons :deep(.ivu-btn) { flex: 1; min-width: 0; min-height: var(--ui-size-44); }
}

.account-batch-create {
  width: 100%;

  :deep(.ivu-input),
  :deep(.ivu-select-selection),
  :deep(.ivu-btn) {
    border-radius: var(--ui-radius-md);
  }

  &__notice {
    margin-bottom: var(--ui-space-16);
  }

  &__error-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--ui-space-12);
  }

  &__loading {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 240px;
  }

  &__fields {
    display: grid;
    grid-template-columns: minmax(0, 1fr);
    gap: var(--ui-space-24) var(--ui-space-16);

    > :deep(.ivu-form-item) {
      min-width: 0;
      margin-bottom: 0;
    }

    > .account-batch-create__remark {
      grid-column: ~"1 / -1";
    }

    :deep(.ivu-input),
    :deep(.ivu-select-input),
    :deep(.ivu-select-placeholder) {
      font-size: 13px;
    }
  }

  &__field-error {
    margin: var(--ui-space-4) 0 0;
    color: var(--ui-color-error);
    font-size: var(--ui-font-size-xs);
    line-height: var(--ui-line-height-md);
  }

  &__field--error {
    :deep(.ivu-input),
    :deep(.ivu-select-selection),
    :deep(.ivu-date-picker-rel .ivu-input) {
      border-color: var(--ui-color-error);
    }
  }
}

@media screen and (max-width: 768px) {
  .account-batch-create {
    &__fields {
      grid-template-columns: minmax(0, 1fr);
      > :deep(.ivu-form-item) {
        grid-column: ~"1 / -1";
      }

      :deep(input.ivu-input),
      :deep(.ivu-select-selection) {
        min-height: var(--ui-size-44);
      }
    }

  }
}
</style>
