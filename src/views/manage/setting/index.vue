<template>
  <UiPage isNotTitle>
    <div class="setting-page">
      <div class="setting-actions">
        <div class="title list-b-4">
          <h3>{{ $t('setting.siteInfoTitle') }}</h3>
          <p>{{ $t('setting.siteInfoDesc') }}</p>
        </div>
        <Button
          type="primary"
          :loading="loadingButton"
          :disabled="!isDirty || loading"
          @click="handleSave"
        >
          {{ $t('button.save') }}
        </Button>
      </div>

      <Form
        ref="formRef"
        :key="formKey"
        class="setting-form"
        :model="data"
        :label-position="isPhone ? 'top' : 'right'"
        :label-width="isPhone ? null : 180"
      >
        <div class="setting-columns">
          <div class="setting-column">
            <FormCell
              class="setting-card"
              :title="$t('setting.basicInfo')"
              isBg
              :padding="24"
              :margin="0"
              isNotShow
            >
              <FormItemBox :label="$t('setting.siteName')">
                <FormInput v-model="data.site_name" disabled size="default" width="100%" />
              </FormItemBox>
              <FormItemBox
                :label="$t('setting.customerService')"
                prop="customer_link"
                isRequired
              >
                <FormInput
                  v-model="data.customer_link"
                  size="default"
                  width="100%"
                  :placeholder="$t('setting.customerServicePlaceholder')"
                />
              </FormItemBox>
              <FormItemBox :label="$t('setting.homeUrl')" prop="source_url">
                <FormInput
                  v-model="data.source_url"
                  size="default"
                  width="100%"
                  :placeholder="$t('setting.homeUrlPlaceholder')"
                />
              </FormItemBox>
              <FormItemBox :label="$t('setting.logo')" prop="site_logo">
                <div class="logo-upload">
                  <SettingImageUpload
                    v-model="data.site_logo"
                    action="/user/agentSite/upload"
                    :width="160"
                    :aspect-ratio="1"
                    :max-size="1024"
                    :format="fieldFormat"
                    :alt="$t('setting.logo')"
                    :des="{
                      size: 1,
                      format: 'PNG,JPG',
                      dimension: '160*160',
                    }"
                  />
                </div>
              </FormItemBox>
            </FormCell>

            <FormCell
              class="setting-card"
              :title="$t('setting.bgSetting')"
              isBg
              :padding="24"
              :margin="0"
              isNotShow
            >
              <div class="background-grid">
                <div class="background-item">
                  <div class="background-title">{{ $t('setting.loginBg') }}</div>
                  <SettingImageUpload
                    v-model="data.login_background"
                    action="/user/agentSite/upload"
                    width="100%"
                    :aspect-ratio="16 / 9"
                    :max-size="1024"
                    :format="fieldFormat"
                    :alt="$t('setting.loginBg')"
                    :des="{
                      size: 1,
                      format: 'PNG,JPG',
                      dimension: '1920*1080',
                    }"
                  />
                </div>
                <div class="background-item">
                  <div class="background-title">{{ $t('setting.registerBg') }}</div>
                  <SettingImageUpload
                    v-model="data.register_background"
                    action="/user/agentSite/upload"
                    width="100%"
                    :aspect-ratio="16 / 9"
                    :max-size="1024"
                    :format="fieldFormat"
                    :alt="$t('setting.registerBg')"
                    :des="{
                      size: 1,
                      format: 'PNG,JPG',
                      dimension: '1920*1080',
                    }"
                  />
                </div>
                <div class="background-item">
                  <div class="background-title">{{ $t('setting.resetBg') }}</div>
                  <SettingImageUpload
                    v-model="data.find_pwd_background"
                    action="/user/agentSite/upload"
                    width="100%"
                    :aspect-ratio="16 / 9"
                    :max-size="1024"
                    :format="fieldFormat"
                    :alt="$t('setting.resetBg')"
                    :des="{
                      size: 1,
                      format: 'PNG,JPG',
                      dimension: '1920*1080',
                    }"
                  />
                </div>
              </div>
            </FormCell>
          </div>

          <div class="setting-column setting-column-right">
            <FormCell
              v-if="data.smtp_config"
              class="setting-card setting-card-fill"
              :title="$t('setting.emailConfig')"
              isBg
              isNotShow
              :padding="24"
              :margin="0"
            >
              <FormItemBox
                :label="$t('setting.serverHost')"
                prop="smtp_config.smtp_host"
                isRequired
              >
                <FormInput
                  v-model="data.smtp_config.smtp_host"
                  size="default"
                  width="100%"
                  :placeholder="$t('setting.serverHostPlaceholder')"
                />
                <div v-if="smtpLink" class="help-link-box">
                  <a :href="smtpLink" target="_blank" rel="noopener noreferrer">
                    {{ $t('setting.viewConfigTutorial') }}
                  </a>
                </div>
              </FormItemBox>
              <FormItemBox
                :label="$t('setting.serverPort')"
                prop="smtp_config.smtp_port"
                isRequired
                :rules="[
                  {
                    pattern: /^\d+$/,
                    message: $t('validate.formatError', { field: $t('setting.serverPort') }),
                    trigger: 'blur',
                  },
                ]"
              >
                <FormInput
                  v-model="data.smtp_config.smtp_port"
                  size="default"
                  width="100%"
                  :placeholder="$t('setting.serverPortPlaceholder')"
                />
              </FormItemBox>
              <FormItemBox
                :label="$t('setting.emailUser')"
                prop="smtp_config.smtp_user"
                isRequired
              >
                <FormInput
                  v-model="data.smtp_config.smtp_user"
                  size="default"
                  width="100%"
                  :placeholder="$t('setting.emailUserPlaceholder')"
                />
              </FormItemBox>
              <FormItemBox
                :label="$t('setting.emailPassword')"
                prop="smtp_config.smtp_pass"
                :isRequired="!isSmtpPass"
              >
                <div class="inline-control">
                  <FormInput
                    v-model="data.smtp_config.smtp_pass"
                    size="default"
                    width="100%"
                    :disabled="isSmtpPass"
                    :placeholder="
                      isSmtpPass
                        ? $t('setting.passwordSet')
                        : $t('setting.emailPasswordPlaceholder')
                    "
                  />
                  <Button
                    v-if="oldSmtpPass"
                    type="default"
                    size="default"
                    @click="handleResetPassword(data)"
                  >
                    {{ isSmtpPass ? $t('setting.resetPassword') : $t('setting.cancelEdit') }}
                  </Button>
                </div>
              </FormItemBox>
              <FormItemBox
                :label="$t('setting.senderName')"
                prop="smtp_config.smtp_name"
                isRequired
              >
                <FormInput
                  v-model="data.smtp_config.smtp_name"
                  size="default"
                  width="100%"
                  :placeholder="$t('setting.senderNamePlaceholder')"
                />
              </FormItemBox>
              <FormItemBox
                :label="$t('setting.senderEmail')"
                prop="smtp_config.smtp_form"
                isRequired
              >
                <FormEmail
                  v-model="data.smtp_config.smtp_form"
                  size="default"
                  width="100%"
                  :placeholder="$t('setting.senderEmailPlaceholder')"
                />
              </FormItemBox>
              <div class="email-test-panel">
                <FormItemBox prop="smtp_test">
                  <Button size="default" icon="md-mail" @click="testEmail">
                    {{ $t('setting.emailTest') }}
                  </Button>
                </FormItemBox>
              </div>
            </FormCell>
          </div>
        </div>
      </Form>

      <EmailPup ref="emailPupRef" />
      <Spin fix v-if="loading" />
    </div>
  </UiPage>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { isPhone } from '@/utils/device.js'
import { message } from '@/utils/message.js'
import { t } from '@/utils/index.js'
import EmailPup from './components/EmailPup.vue'
import SettingImageUpload from './components/SettingImageUpload.vue'
import {
  data,
  getData,
  isDirty,
  isSmtpPass,
  loading,
  loadingButton,
  oldSmtpPass,
  save,
} from './data.js'

const formRef = ref(null)
const formKey = ref(0)
const emailPupRef = ref(null)
const fieldFormat = ['png', 'jpg']

const smtpLink = computed(() => {
  const smtpHost = data.value.smtp_config?.smtp_host
  const hostRegex = /^[a-zA-Z0-9.-]+\.[a-zA-Z0-9]{2,}$/
  if (!smtpHost || !hostRegex.test(smtpHost)) return ''
  return `https://www.google.com/search?q=${encodeURIComponent(smtpHost)}+smtp+配置教程`
})

const smtpTestRequiredFields = [
  { key: 'smtp_host', label: 'setting.serverHost' },
  { key: 'smtp_port', label: 'setting.serverPort' },
  { key: 'smtp_user', label: 'setting.emailUser' },
  { key: 'smtp_name', label: 'setting.senderName' },
  { key: 'smtp_form', label: 'setting.senderEmail' },
  { key: 'smtp_pass', label: 'setting.emailPassword' },
]

const handleResetPassword = (form) => {
  isSmtpPass.value = !isSmtpPass.value
  form.smtp_config.smtp_pass = isSmtpPass.value ? oldSmtpPass.value : ''
  formKey.value += 1
}

const testEmail = () => {
  const smtpConfig = data.value.smtp_config || {}
  const emptyField = smtpTestRequiredFields.find(
    item => !String(smtpConfig[item.key] ?? '').trim()
  )
  if (emptyField) {
    message(t('setting.fieldRequired', { field: t(emptyField.label) }), 'error')
    return
  }
  emailPupRef.value?.open(smtpConfig)
}

const handleSave = () => {
  if (!isDirty.value) return
  formRef.value?.validate((valid) => {
    if (valid) save()
  })
}

onMounted(getData)
</script>

<style lang="less" scoped>
.setting-page {
  position: relative;
  min-height: 320px;
}

.setting-form {
  :deep(.ivu-form-item) {
    margin-bottom: 28px;
  }

  :deep(.ivu-form-item:last-child) {
    margin-bottom: 0;
  }

  :deep(.form_cell_title) {
    padding-bottom: 14px;
    margin-bottom: 24px;
    border-bottom: 1px solid #eef1f6;
  }
}

.setting-columns {
  display: grid;
  grid-template-columns: minmax(600px, 1fr) minmax(0, 1fr);
  align-items: stretch;
  gap: 16px;
}

.setting-column {
  display: flex;
  flex-direction: column;
  min-width: 0;
  gap: 16px;
}

.setting-column-right {
  min-height: 100%;
}

.setting-card {
  box-sizing: border-box;
  min-width: 0;
  border: 1px solid #edf0f5;
  box-shadow: 0 2px 10px rgba(15, 23, 42, 0.03);
}

.setting-card-fill {
  flex: 1;
}

.logo-upload {
  max-width: 360px;
}

.inline-control {
  display: flex;
  align-items: center;
  gap: 12px;

  :deep(.ivu-input-wrapper) {
    flex: 1;
    min-width: 0;
    width: auto !important;
  }

  .ivu-btn {
    flex: none;
  }
}

.background-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 18px;
}

.background-item {
  min-width: 0;
  padding-right: 18px;
  border-right: 1px solid #edf0f5;

  &:last-child {
    padding-right: 0;
    border-right: 0;
  }
}

.background-title {
  margin-bottom: 10px;
  color: #30384a;
  font-size: 14px;
  font-weight: 600;
}

.setting-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 16px;
  margin-bottom: 12px;
  background: var(--ui-color-surface);
  border: 1px solid #edf0f5;
  border-radius: var(--ui-radius-lg);

  .title {
    h3 {
      font-size: 16px;
    }

    p {
      color: #999aaa;
      font-size: 12px;
    }
  }

  .ivu-btn {
    min-width: 96px;
  }
}

.help-link-box {
  margin-bottom: -16px;
}

@media (max-width: 1024px) {
  .setting-columns {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .setting-form {
    :deep(.ivu-form-item) {
      margin-bottom: 22px;
    }

    :deep(.form_cell_title) {
      margin-bottom: 18px;
    }
  }

  .setting-columns,
  .setting-column {
    gap: 12px;
  }

  .inline-control {
    align-items: stretch;
    flex-direction: column;

    .ivu-btn {
      width: 100%;
    }
  }

  .background-grid {
    grid-template-columns: 1fr;
  }

  .background-item {
    padding-right: 0;
    padding-bottom: 16px;
    border-right: 0;
    border-bottom: 1px solid #edf0f5;

    &:last-child {
      padding-bottom: 0;
      border-bottom: 0;
    }
  }

  .setting-actions {
    position: sticky;
    top: 0;
    z-index: 20;
    align-items: stretch;
    flex-direction: column;
    gap: 8px;

    .ivu-btn {
      width: 100%;
    }
  }
}
</style>
