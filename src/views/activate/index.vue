<template>
  <main class="account-activation">
    <div class="account-activation__content">
      <header v-if="!loading && !activated && !loadError" class="account-activation__header">
        <h1>{{ $t('ucenterAccount.activationPage.title') }}</h1>
      </header>

      <div v-if="loading" class="account-activation__loading">
        <Spin size="large" />
      </div>

      <Result
        v-else-if="activated"
        class="account-activation__state"
        type="success"
        :title="$t('ucenterAccount.activationPage.successTitle')"
        :desc="$t('ucenterAccount.activationPage.success')"
        role="status"
      >
        <template #actions>
          <Button type="primary" size="large" :loading="loginLoading" @click="goToLogin">
            {{ $t('forgotPassword.action.loginNow') }}
          </Button>
        </template>
      </Result>

      <Result
        v-else-if="loadError"
        class="account-activation__state"
        type="error"
        :title="$t('ucenterAccount.activationPage.title')"
        :desc="loadError"
        role="alert"
      >
        <template #actions>
          <Button type="primary" size="large" :loading="loginLoading" @click="goToLogin">
            {{ $t('forgotPassword.action.loginNow') }}
          </Button>
        </template>
      </Result>

      <template v-else-if="detail">
        <div class="account-activation__summary list-b-12">
          <div class="account-activation__instructions">
            <i18n-t keypath="ucenterAccount.activationPage.description" tag="p" scope="global">
              <template #teamSiteName>
                <strong>{{ detail.site_name }}</strong>
              </template>
            </i18n-t>
            <i18n-t keypath="ucenterAccount.activationPage.expiresAt" tag="p" class="account-activation__expiry" scope="global">
              <template #time>
                <strong>{{ detail.expires_at }}</strong>
              </template>
            </i18n-t>
          </div>
          <dl>
            <div>
              <dt>{{ $t('ucenterAccount.field.account') }}</dt>
              <dd>{{ detail.nickname }}</dd>
            </div>
            <div>
              <dt>{{ $t('ucenterAccount.field.email') }}</dt>
              <dd>{{ detail.email }}</dd>
            </div>
          </dl>
        </div>

        <Form
          ref="formRef"
          :model="form"
          :rules="rules"
          label-position="top"
          autocomplete="off"
          @keyup.enter="handleActivate"
        >
          <FormItemBox
            :label="$t('ucenterAccount.field.password')"
            prop="password"
            :rules="rules.password"
            isRequired
          >
            <FormInput
              v-model="form.password"
              name="password"
              type="password"
              size="large"
              autocomplete="new-password"
              :placeholder="$t('ucenterAccount.placeholder.password')"
            >
              <template #prefix>
                <Icon type="md-lock" />
              </template>
            </FormInput>
          </FormItemBox>

          <FormItemBox
            :label="$t('forgotPassword.placeholder.confirmPassword')"
            prop="password_confirm"
            :rules="rules.password_confirm"
            isRequired
          >
            <FormInput
              v-model="form.password_confirm"
              name="password-confirm"
              type="password"
              size="large"
              autocomplete="new-password"
              :placeholder="$t('forgotPassword.placeholder.confirmPassword')"
            >
              <template #prefix>
                <Icon type="md-lock" />
              </template>
            </FormInput>
          </FormItemBox>

          <Button
            long
            type="primary"
            size="large"
            :loading="submitting"
            :disabled="submitting"
            @click="handleActivate"
          >
            {{ $t('ucenterAccount.action.activate') }}
          </Button>
        </Form>
      </template>
    </div>
  </main>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, reactive, ref } from 'vue'
import userApi from '@/api/user.js'
import { setLocale } from '@/locales/set.js'
import { t } from '@/utils/index.js'
import { confirm, showRequestError } from '@/utils/message.js'
import { removeQuery, toRoute, useRoute } from '@/utils/route.js'
import { useUserStore } from '@/utils/store.js'
import Cookies from 'js-cookie'
import { tokenName } from '@systemConfig'

const PASSWORD_MIN_LENGTH = 6
const PASSWORD_MAX_LENGTH = 64
const TOKEN_PATTERN = /^[a-f0-9]{64}$/

const route = useRoute()
const userStore = useUserStore()
const queryToken = typeof route.query.token === 'string' ? route.query.token : ''
const activationToken = ref(TOKEN_PATTERN.test(String(queryToken || '')) ? String(queryToken) : '')
const queryCleanup = removeQuery('token')
const formRef = ref(null)
const detail = ref(null)
const loading = ref(false)
const loadError = ref('')
const submitting = ref(false)
const loginLoading = ref(false)
const activated = ref(false)
const form = reactive({
  password: '',
  password_confirm: '',
})
let detailController = null

const isSilentError = (error) => error?.silent || error?.msg === 'SILENT_ERROR'

const rules = computed(() => ({
  password: [
    {
      validator: (_rule, value, callback) => {
        if (!value) return callback()
        const length = Array.from(String(value)).length
        if (length < PASSWORD_MIN_LENGTH || length > PASSWORD_MAX_LENGTH) {
          return callback(new Error(t('ucenterAccount.activationPage.passwordLength')))
        }
        return callback()
      },
      trigger: 'change,blur',
    },
  ],
  password_confirm: [
    {
      validator: (_rule, value, callback) => {
        if (!value) return callback()
        if (value !== form.password) {
          return callback(new Error(t('forgotPassword.validation.passwordMismatch')))
        }
        return callback()
      },
      trigger: 'change,blur',
    },
  ],
}))

const loadDetail = async () => {
  if (!activationToken.value) {
    loadError.value = t('ucenterAccount.activationPage.invalidLink')
    return
  }

  detailController?.abort()
  const controller = new AbortController()
  detailController = controller
  loading.value = true
  loadError.value = ''

  try {
    const data = await userApi.getAccountActivationDetail(
      { token: activationToken.value },
      { signal: controller.signal },
    )
    if (detailController !== controller) return
    if (data?.can_activate !== true) {
      detail.value = null
      loadError.value = t('ucenterAccount.activationPage.invalidLink')
      return
    }
    setLocale(data.locale, { persist: false })
    detail.value = {
      nickname: String(data.nickname || '-'),
      email: String(data.email || '-'),
      site_name: String(data.site_name || 'UeePay'),
      expires_at: String(data.expires_at || '-'),
    }
  } catch (error) {
    if (controller.signal.aborted || detailController !== controller) return
    detail.value = null
    loadError.value = !isSilentError(error) && typeof error?.msg === 'string' && error.msg.trim()
      ? error.msg
      : t('ucenterAccount.activationPage.loadFailed')
  } finally {
    if (detailController === controller) {
      detailController = null
      loading.value = false
    }
  }
}

const handleActivate = async () => {
  if (submitting.value || !detail.value || !activationToken.value) return
  if (!formRef.value) return
  submitting.value = true
  try {
    const valid = await new Promise((resolve) => formRef.value?.validate(resolve))
    if (!valid) return

    await userApi.activateAccount({
      token: activationToken.value,
      password: form.password,
      password_confirm: form.password_confirm,
    })
    activationToken.value = ''
    form.password = ''
    form.password_confirm = ''
    detail.value = null
    activated.value = true
  } catch (error) {
    form.password = ''
    form.password_confirm = ''
    showRequestError(error)
  } finally {
    submitting.value = false
  }
}

const goToLogin = async () => {
  if (loginLoading.value) return
  loginLoading.value = true

  try {
    if (Cookies.get(tokenName)) {
      const confirmed = await confirm(t('message.logoutConfirm'), { resolveCancel: true })
      if (!confirmed) return

      let logoutError = null
      try {
        await userApi.logout({
          requestPolicy: {
            redirectOnNetworkError: false,
          },
        })
      } catch (error) {
        logoutError = error
        showRequestError(error)
      } finally {
        userStore.logout()
      }
      if (Number(logoutError?.code) === 451) return
    }
    await toRoute('login', {}, 'query', { replace: true })
  } catch (error) {
    showRequestError(error)
  } finally {
    loginLoading.value = false
  }
}

onMounted(async () => {
  try {
    await queryCleanup
    await loadDetail()
  } catch (error) {
    showRequestError(error)
  }
})

onBeforeUnmount(() => {
  detailController?.abort()
  detailController = null
  activationToken.value = ''
  form.password = ''
  form.password_confirm = ''
})
</script>

<style scoped lang="less">
.account-activation {
  display: flex;
  min-height: 100vh;
  min-height: 100dvh;
  padding: var(--ui-space-32) var(--ui-space-16);
  background: var(--ui-color-surface);

  &__content {
    width: 100%;
    max-width: 520px;
    min-width: 0;
    margin: auto;
  }

  &__header {
    margin-bottom: var(--ui-space-32);
    text-align: center;

    h1 {
      margin: 0;
      color: var(--ui-color-text);
      font-size: var(--ui-font-size-3xl);
      font-weight: var(--ui-font-weight-semibold);
      line-height: 1.4;
    }
  }

  &__loading {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 240px;
  }

  &__summary {
    margin-bottom: var(--ui-space-24);
  }

  &__state {
    :deep(.ivu-result-desc) {
      overflow-wrap: anywhere;
    }

  }

  &__summary {
    color: var(--ui-color-text-muted);
    line-height: 1.7;
    overflow-wrap: anywhere;

    dl {
      padding: var(--ui-space-12) var(--ui-space-16);
      border-radius: var(--ui-radius-2xl);
      background: var(--ui-color-neutral-50);
    }

    dl > div {
      display: grid;
      grid-template-columns: minmax(72px, auto) minmax(0, 1fr);
      gap: var(--ui-space-12);
      padding: var(--ui-space-6) 0;
    }

    dt {
      color: var(--ui-color-text-subtle);
    }

    dd {
      min-width: 0;
      margin: 0;
      overflow-wrap: anywhere;
      color: var(--ui-color-text);
      text-align: end;
    }
  }

  &__instructions {
    text-align: center;

    strong {
      color: var(--ui-color-text);
      font-weight: var(--ui-font-weight-semibold);
    }
  }

  &__expiry {
    font-size: var(--ui-font-size-xs);
  }
  @media (max-width: 480px) {
    &__summary dl > div {
      grid-template-columns: minmax(0, 1fr);
      gap: var(--ui-space-4);
    }

    &__summary dd {
      text-align: start;
    }
  }
}
</style>
