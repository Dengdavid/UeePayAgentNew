<template>
  <article class="person-card" :class="statusClass">
    <header class="person-card__head">
      <div class="person-card__identity">
        <span class="person-card__avatar" aria-hidden="true">
          {{ initials }}
        </span>
        <div class="person-card__primary">
          <strong class="person-card__name">{{ displayName }}</strong>
          <div class="person-card__roles">
            <span class="person-card__field-label">
              {{ $t('certify.personnelRolesLabel') }}
            </span>
            <div class="person-card__role-list">
              <span
                v-for="role in normalizedRoles"
                :key="role"
                class="role-badge"
                :class="`is-${role}`"
              >
                {{ roleText(role) }}
              </span>
              <span v-if="!normalizedRoles.length" class="person-card__empty">-</span>
            </div>
          </div>
        </div>
      </div>
      <div class="person-card__status">
        <span class="person-card__field-label">
          {{ $t('certify.personnelStatusLabel') }}
        </span>
        <span class="status-badge">{{ statusText }}</span>
      </div>
    </header>

    <div class="person-card__facts">
      <div class="person-card__fact">
        <span>{{ $t('certify.personnelIdType') }}</span>
        <strong>{{ documentTypeText }}</strong>
      </div>
      <div class="person-card__fact">
        <span>{{ $t('certify.personnelIdentityLabel') }}</span>
        <strong>{{ maskIdentity(person.national_id) }}</strong>
      </div>
      <div class="person-card__fact">
        <span>{{ $t('certify.personnelOwnershipLabel') }}</span>
        <strong>{{ ownershipText }}</strong>
      </div>
    </div>

    <div v-if="isApproved" class="person-card__resolved is-approved">
      <Icon type="ios-checkmark-circle" />
      <div>
        <strong>{{ $t('certify.personnelApprovedTitle') }}</strong>
        <p>{{ $t('certify.personnelApprovedTip') }}</p>
      </div>
    </div>

    <div v-else-if="!person.verification_required" class="person-card__resolved">
      <Icon type="ios-information-circle-outline" />
      <div>
        <strong>{{ $t('certify.personnelNotRequiredTitle') }}</strong>
        <p>{{ $t('certify.personnelNotRequiredTip') }}</p>
      </div>
    </div>

    <div v-else-if="isCorrectionRequested" class="data-correction-required is-editable">
      <Icon type="ios-create" />
      <div class="data-correction-required__content">
        <strong>{{ $t('certify.personnelCorrectionTitle') }}</strong>
        <p>{{ correctionReason }}</p>
        <p class="data-correction-required__tip">
          {{ $t('certify.personnelCorrectionTip') }}
        </p>
      </div>
      <Button
        type="primary"
        :loading="loading"
        icon="ios-create-outline"
        @click="openCorrection"
      >
        {{ $t('certify.modifyPersonnelInfo') }}
      </Button>
    </div>

    <div v-else-if="isIdentityMismatch" class="data-correction-required">
      <Icon type="ios-alert" />
      <div>
        <strong>{{ $t('certify.personnelDataMismatchTitle') }}</strong>
        <p>{{ identityMismatchReason }}</p>
        <p class="data-correction-required__tip">
          {{ $t('certify.personnelDataMismatchTip') }}
        </p>
      </div>
    </div>

    <div v-else-if="needsSessionRecovery" class="session-expired-recovery">
      <div class="session-expired-recovery__content">
        <Icon type="ios-alert" />
        <div>
          <strong>{{ recoveryTitle }}</strong>
          <p>{{ recoveryTip }}</p>
        </div>
      </div>
      <div class="session-expired-recovery__actions">
        <p v-if="recoveryKind === 'expired'" class="session-expiry is-expired">
          <Icon type="ios-time-outline" />
          <span>{{ sessionExpiryText }}</span>
        </p>
        <Button
          type="primary"
          :loading="loading"
          icon="ios-refresh"
          @click="$emit('create', person)"
        >
          {{ $t('certify.recreatePersonnelSession') }}
        </Button>
      </div>
    </div>

    <div v-else-if="sessionUrl" class="session-area">
      <button
        type="button"
        class="qr-preview"
        :aria-label="$t('certify.enlargePersonnelQr')"
        @click="previewVisible = true"
      >
        <img v-if="qrDataUrl" :src="qrDataUrl" alt="" />
        <Icon v-else type="ios-qr-scanner" />
        <span>{{ $t('certify.enlargePersonnelQr') }}</span>
      </button>

      <div class="session-details">
        <div class="session-details__head">
          <div>
            <strong>{{ $t('certify.personnelSessionReadyTitle') }}</strong>
            <p>{{ $t('certify.personnelSessionReadyTip') }}</p>
          </div>
          <p class="session-expiry" :class="{ 'is-expired': isSessionExpired }">
            <Icon type="ios-time-outline" />
            <span>{{ sessionExpiryText }}</span>
          </p>
        </div>
        <div class="session-link">
          <Icon type="ios-link" />
          <span class="session-link__url" :title="sessionUrl">{{ sessionUrl }}</span>
          <div class="session-link__actions">
            <button
              type="button"
              class="session-link__button is-primary is-icon"
              :title="$t('certify.copyPersonnelLink')"
              :aria-label="$t('certify.copyPersonnelLink')"
              @click="copySessionUrl"
            >
              <Icon type="md-copy" />
            </button>
            <button
              type="button"
              class="session-link__button is-icon"
              :title="$t('certify.openPersonnelLink')"
              :aria-label="$t('certify.openPersonnelLink')"
              @click="openSession"
            >
              <Icon type="md-open" />
            </button>
            <button
              type="button"
              class="session-link__button is-icon"
              :title="$t('certify.downloadPersonnelQr')"
              :aria-label="$t('certify.downloadPersonnelQr')"
              @click="downloadQrCode"
            >
              <Icon type="md-download" />
            </button>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="session-create">
      <div class="session-create__content">
        <strong>{{ createTitle }}</strong>
        <p>{{ createTip }}</p>
      </div>
      <Button
        v-if="!isOngoing"
        type="primary"
        :loading="loading"
        icon="ios-link"
        @click="$emit('create', person)"
      >
        {{ createButtonText }}
      </Button>
    </div>

    <Modal
      v-model="previewVisible"
      footer-hide
      width="460"
      class-name="personnel-qr-modal vertical-center-modal"
    >
      <template #header>
        <h3>{{ $t('certify.personnelQrTitle', { name: displayName }) }}</h3>
      </template>
      <div class="qr-modal-content">
        <img v-if="qrDataUrl" :src="qrDataUrl" alt="" />
        <p>{{ $t('certify.personnelQrTip') }}</p>
        <div class="qr-modal-actions">
          <Button type="primary" icon="md-copy" @click="copySessionUrl">
            {{ $t('certify.copyPersonnelLink') }}
          </Button>
          <Button icon="md-download" @click="downloadQrCode">
            {{ $t('certify.downloadPersonnelQr') }}
          </Button>
        </div>
      </div>
    </Modal>

    <Modal
      v-model="correctionVisible"
      width="620"
      :mask-closable="false"
      class-name="personnel-correction-modal vertical-center-modal"
    >
      <template #header>
        <div class="correction-modal__header">
          <h3>{{ $t('certify.personnelCorrectionDialogTitle') }}</h3>
          <p>{{ $t('certify.personnelCorrectionDialogTip') }}</p>
        </div>
      </template>
      <div class="correction-form">
        <div class="correction-form__notice">
          <Icon type="ios-information-circle-outline" />
          <span>{{ correctionReason }}</span>
        </div>
        <div class="correction-form__grid">
          <label class="correction-field">
            <span><i>*</i>{{ $t('certify.personnelNationality') }}</span>
            <Input
              v-model="correctionForm.nationality"
              :maxlength="8"
              :placeholder="$t('certify.personnelNationalityPlaceholder')"
            />
          </label>
          <label class="correction-field">
            <span><i>*</i>{{ $t('certify.personnelIdType') }}</span>
            <Select
              v-model="correctionForm.id_type"
              filterable
              :placeholder="$t('certify.personnelIdTypePlaceholder')"
            >
              <Option
                v-for="option in documentTypeOptions"
                :key="option"
                :value="option"
              >
                {{ option }}
              </Option>
            </Select>
          </label>
          <label class="correction-field is-wide">
            <span><i>*</i>{{ $t('certify.personnelIdNumber') }}</span>
            <Input
              v-model="correctionForm.national_id"
              :maxlength="200"
              :placeholder="$t('certify.personnelIdNumberPlaceholder')"
            />
          </label>
          <label class="correction-field">
            <span><i>*</i>{{ $t('certify.personnelFirstName') }}</span>
            <Input
              v-model="correctionForm.first_name"
              :maxlength="200"
              :placeholder="$t('certify.personnelFirstNamePlaceholder')"
            />
          </label>
          <label class="correction-field">
            <span><i>*</i>{{ $t('certify.personnelLastName') }}</span>
            <Input
              v-model="correctionForm.last_name"
              :maxlength="200"
              :placeholder="$t('certify.personnelLastNamePlaceholder')"
            />
          </label>
        </div>
      </div>
      <template #footer>
        <Button @click="correctionVisible = false">
          {{ $t('certify.personnelCorrectionCancel') }}
        </Button>
        <Button type="primary" :loading="loading" @click="submitCorrection">
          {{ $t('certify.personnelCorrectionSubmit') }}
        </Button>
      </template>
    </Modal>
  </article>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import QRCode from 'qrcode'
import { message, t } from '@/utils'

const props = defineProps({
  person: {
    type: Object,
    default: () => ({}),
  },
  sessionUrl: {
    type: String,
    default: '',
  },
  sessionExpiresAt: {
    type: String,
    default: '',
  },
  sessionStatus: {
    type: String,
    default: '',
  },
  loading: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['create', 'correct'])

const previewVisible = ref(false)
const correctionVisible = ref(false)
const qrDataUrl = ref('')
const correctionForm = ref({
  nationality: '',
  id_type: '',
  national_id: '',
  first_name: '',
  last_name: '',
})

const normalizedRoles = computed(() => (
  Array.isArray(props.person.roles) ? props.person.roles : []
))
const displayName = computed(() => (
  `${props.person.first_name || ''} ${props.person.last_name || ''}`.trim()
  || props.person.full_name
  || t('certify.personnelUnknown')
))
const initials = computed(() => {
  const words = displayName.value.split(/\s+/).filter(Boolean)
  return words.slice(0, 2).map((word) => word.slice(0, 1).toUpperCase()).join('') || 'P'
})
const isCorrectionRequested = computed(() => (
  props.person.status === 'CorrectionRequired'
  || props.person.verification_result === 'correction_required'
  || Boolean(props.person.can_edit_company_person)
))
const isIdentityMismatch = computed(() => (
  !isCorrectionRequested.value
  && (Boolean(props.person.requires_company_data_correction)
  || props.person.verification_reason_code === 'COMPANY_PERSON_IDENTITY_MISMATCH'
  || props.person.verification_result === 'identity_mismatch')
))
const statusText = computed(() => (
  isCorrectionRequested.value
    ? t('certify.personnelCorrectionStatus')
    : isIdentityMismatch.value
    ? t('certify.personnelDataMismatchStatus')
    : t(`certify.personStatus.${props.person.status || 'NotStarted'}`)
))
const statusClass = computed(() => `is-${String(props.person.status || 'NotStarted').toLowerCase()}`)
const isApproved = computed(() => props.person.status === 'Approved')
const isOngoing = computed(() => ['SessionCreated', 'InProgress', 'InReview'].includes(props.person.status))
const isExpiredStatus = computed(() => props.person.status === 'Expired')
const identityMismatchReason = computed(() => (
  String(props.person.verification_reason || '').trim()
  || t('certify.personnelDataMismatchReason')
))
const correctionReason = computed(() => (
  String(props.person.verification_reason || '').trim()
  || t('certify.personnelCorrectionDefaultReason')
))
const documentTypeOptions = computed(() => {
  const values = [
    correctionForm.value.id_type,
    props.person.id_type,
    props.person.cert_type,
    'passport',
    'id_card',
    'driver_license',
    'residence_permit',
  ]
  return [...new Set(values.map((value) => String(value || '').trim()).filter(Boolean))]
})
const documentTypeText = computed(() => (
  String(
    props.person.id_type_text
    || props.person.id_type_label
    || props.person.id_type
    || props.person.cert_type
    || '',
  ).trim() || '-'
))
const ownershipText = computed(() => {
  const value = props.person.ownership_percentage
  if (value === null || value === undefined || value === '') return '-'
  const number = Number(value)
  if (!Number.isFinite(number)) return '-'
  return `${number.toFixed(2).replace(/\.?0+$/, '')}%`
})
const sessionExpiryDate = computed(() => {
  const value = String(props.sessionExpiresAt || '').trim()
  if (!value) return null
  const parsed = new Date(value.includes('T') ? value : value.replace(' ', 'T'))
  return Number.isNaN(parsed.getTime()) ? null : parsed
})
const isSessionExpired = computed(() => (
  Boolean(sessionExpiryDate.value) && sessionExpiryDate.value.getTime() <= Date.now()
))
const recoveryKind = computed(() => {
  const sessionStatus = String(props.sessionStatus || '').trim()
  if (
    isExpiredStatus.value
    || ['Expired', 'Kyc Expired'].includes(sessionStatus)
    || isSessionExpired.value
  ) {
    return 'expired'
  }
  if (props.person.status === 'Declined' || sessionStatus === 'Declined') {
    return 'declined'
  }
  if (sessionStatus === 'Abandoned') {
    return 'abandoned'
  }
  return ''
})
const needsSessionRecovery = computed(() => Boolean(recoveryKind.value))
const recoveryTitle = computed(() => t(`certify.personnelSession${(
  recoveryKind.value.charAt(0).toUpperCase() + recoveryKind.value.slice(1)
)}Title`))
const recoveryTip = computed(() => t(`certify.personnelSession${(
  recoveryKind.value.charAt(0).toUpperCase() + recoveryKind.value.slice(1)
)}Tip`))
const sessionExpiryText = computed(() => {
  if (!sessionExpiryDate.value) {
    return t(
      isExpiredStatus.value
        ? 'certify.personnelSessionExpiredUnknown'
        : 'certify.personnelSessionExpiryUnknown',
    )
  }
  const date = new Intl.DateTimeFormat(undefined, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(sessionExpiryDate.value)
  return t(
    isSessionExpired.value
      ? 'certify.personnelSessionExpiredAt'
      : 'certify.personnelSessionDeadline',
    { date },
  )
})
const createTitle = computed(() => (
  isOngoing.value
    ? t('certify.personnelSessionMissingTitle')
    : t('certify.personnelSessionCreateTitle')
))
const createTip = computed(() => (
  isOngoing.value
    ? t('certify.personnelSessionMissingTip')
    : t('certify.personnelSessionCreateTip')
))
const createButtonText = computed(() => (
  isOngoing.value
    ? t('certify.retrievePersonnelSession')
    : t('certify.authNow')
))

const roleText = (role) => {
  const labels = {
    director: t('certify.personRoleDirector'),
    ubo: t('certify.personRoleUbo'),
  }
  return labels[role] || role
}

const maskIdentity = (value) => {
  const text = String(value || '')
  if (!text) return '-'
  if (text.length <= 6) return `${text.slice(0, 2)}****`
  return `${text.slice(0, 4)}****${text.slice(-4)}`
}

const openCorrection = () => {
  correctionForm.value = {
    nationality: String(props.person.nationality || props.person.country || '').trim(),
    id_type: String(props.person.id_type || props.person.cert_type || '').trim(),
    national_id: String(props.person.national_id || '').trim(),
    first_name: String(props.person.first_name || '').trim(),
    last_name: String(props.person.last_name || '').trim(),
  }
  correctionVisible.value = true
}

const submitCorrection = () => {
  const data = Object.fromEntries(
    Object.entries(correctionForm.value).map(([key, value]) => [key, String(value || '').trim()]),
  )
  if (Object.values(data).some((value) => !value)) {
    message(t('certify.personnelCorrectionRequired'), 'error')
    return
  }
  emit('correct', {
    person: props.person,
    data,
    onSuccess: () => {
      correctionVisible.value = false
    },
  })
}

const copySessionUrl = async () => {
  try {
    if (globalThis.navigator?.clipboard?.writeText) {
      await globalThis.navigator.clipboard.writeText(props.sessionUrl)
    } else {
      const input = document.createElement('textarea')
      input.value = props.sessionUrl
      input.style.position = 'fixed'
      input.style.opacity = '0'
      document.body.appendChild(input)
      input.select()
      document.execCommand('copy')
      document.body.removeChild(input)
    }
    message(t('certify.personnelLinkCopied'))
  } catch {
    message(t('certify.personnelLinkCopyFailed'), 'error')
  }
}

const openSession = () => {
  window.open(props.sessionUrl, '_blank', 'noopener,noreferrer')
}

const downloadQrCode = () => {
  if (!qrDataUrl.value) return
  const link = document.createElement('a')
  link.href = qrDataUrl.value
  link.download = `person-verification-${String(props.person.id || 'session').slice(0, 8)}.png`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

let qrGeneration = 0
watch(
  () => props.sessionUrl,
  async (url) => {
    const generation = ++qrGeneration
    qrDataUrl.value = ''
    if (!url) return
    try {
      const dataUrl = await QRCode.toDataURL(url, {
        errorCorrectionLevel: 'H',
        type: 'image/png',
        margin: 2,
        width: 420,
        color: {
          dark: '#15284b',
          light: '#ffffff',
        },
      })
      if (generation === qrGeneration) {
        qrDataUrl.value = dataUrl
      }
    } catch {
      if (generation === qrGeneration) {
        message(t('certify.personnelQrGenerateFailed'), 'error')
      }
    }
  },
  { immediate: true },
)
</script>

<style scoped lang="less">
.person-card {
  padding: 20px 22px;
  border: 1px solid #dfe6f2;
  border-radius: 8px;
  background: #fff;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;

  &:not(:last-child) {
    margin-bottom: 16px;
  }

  &:hover {
    border-color: #cad6ef;
    box-shadow: 0 6px 18px rgba(32, 65, 128, 0.06);
  }
}

.person-card__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
}

.person-card__identity {
  display: flex;
  min-width: 0;
  align-items: center;
  gap: 12px;
}

.person-card__avatar {
  width: 42px;
  height: 42px;
  flex: 0 0 42px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  color: #2b5cd9;
  background: #edf3ff;
  font-size: 14px;
  font-weight: 600;
}

.person-card__primary {
  min-width: 0;
}

.person-card__name {
  display: block;
  overflow: hidden;
  color: #1f2a3d;
  font-size: 16px;
  line-height: 24px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.person-card__roles {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 8px;
}

.person-card__role-list {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 6px;
}

.person-card__field-label {
  flex: 0 0 auto;
  color: #8a96a8;
  font-size: 12px;
  line-height: 22px;
}

.person-card__empty {
  color: #8a96a8;
  font-size: 12px;
}

.person-card__status {
  display: flex;
  flex: 0 0 auto;
  align-items: center;
  gap: 8px;
  padding: 8px 10px;
  border-radius: 6px;
  background: #f8fafc;
}

.person-card__facts {
  display: grid;
  grid-template-columns: repeat(3, minmax(160px, 1fr));
  gap: 12px;
  justify-content: start;
  margin-top: 16px;
  padding: 12px 14px;
  border: 1px solid #edf0f5;
  border-radius: 8px;
  background: #fafbfd;
}

.person-card__fact {
  min-width: 0;

  > span {
    display: block;
    color: #8a96a8;
    font-size: 12px;
    line-height: 18px;
  }

  > strong {
    display: block;
    overflow: hidden;
    margin-top: 3px;
    color: #354258;
    font-size: 13px;
    font-weight: 500;
    line-height: 20px;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}

.status-badge,
.role-badge {
  display: inline-flex;
  align-items: center;
  height: 22px;
  padding: 0 8px;
  border-radius: 11px;
  font-size: 12px;
  font-weight: 500;
}

.status-badge {
  color: #315ead;
  background: #edf3ff;
}

.is-approved .status-badge {
  color: #138a50;
  background: #eaf8f1;
}

.is-declined .status-badge,
.is-expired .status-badge,
.is-correctionrequired .status-badge {
  color: #c43d25;
  background: #fff1ed;
}

.role-badge {
  color: #52647f;
  background: #f2f5f9;

  &.is-ubo {
    color: #315ead;
    background: #edf3ff;
  }
}

.person-card__resolved,
.session-create,
.session-area,
.session-expired-recovery,
.data-correction-required {
  margin-top: 16px;
  border-top: 1px solid #edf0f5;
}

.person-card__resolved {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding-top: 14px;
  color: #67758a;

  .ivu-icon {
    margin-top: 1px;
    color: #8090a7;
    font-size: 20px;
  }

  strong {
    color: #344258;
    font-size: 13px;
  }

  p {
    margin-top: 3px;
    font-size: 12px;
    line-height: 20px;
  }

  &.is-approved .ivu-icon {
    color: #19be6b;
  }
}

.session-create {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  padding-top: 16px;
}

.session-create__content {
  min-width: 0;

  strong {
    color: #344258;
    font-size: 13px;
  }

  p {
    margin-top: 4px;
    color: #7b8798;
    font-size: 12px;
    line-height: 20px;
  }
}

.session-area {
  display: grid;
  grid-template-columns: 126px minmax(0, 1fr);
  gap: 24px;
  padding-top: 16px;
}

.session-expired-recovery {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  padding-top: 16px;
}

.session-expired-recovery__content {
  display: flex;
  min-width: 0;
  align-items: flex-start;
  gap: 10px;

  > .ivu-icon {
    flex: 0 0 auto;
    margin-top: 1px;
    color: #c43d25;
    font-size: 20px;
  }

  strong {
    color: #9f351f;
    font-size: 13px;
  }

  p {
    margin-top: 4px;
    color: #7b8798;
    font-size: 12px;
    line-height: 20px;
  }
}

.session-expired-recovery__actions {
  flex: 0 0 auto;
  display: flex;
  align-items: flex-end;
  flex-direction: column;
  gap: 9px;
}

.data-correction-required {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 16px;
  border: 1px solid #ffd7c9;
  border-radius: 8px;
  color: #7b8798;
  background: #fff8f5;

  > .ivu-icon {
    flex: 0 0 auto;
    margin-top: 1px;
    color: #ed4014;
    font-size: 20px;
  }

  strong {
    color: #9f351f;
    font-size: 13px;
  }

  p {
    margin-top: 4px;
    font-size: 12px;
    line-height: 20px;
  }
}

.data-correction-required__tip {
  color: #596b84;
}

.data-correction-required.is-editable {
  align-items: center;
  justify-content: space-between;

  > .ivu-btn {
    flex: 0 0 auto;
    margin-left: 16px;
  }
}

.data-correction-required__content {
  min-width: 0;
  flex: 1;
}

.correction-modal__header {
  padding-right: 30px;

  h3 {
    color: #26364f;
    font-size: 16px;
    line-height: 24px;
  }

  p {
    margin-top: 3px;
    color: #7b8798;
    font-size: 12px;
    line-height: 20px;
  }
}

.correction-form__notice {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  margin-bottom: 18px;
  padding: 11px 13px;
  border: 1px solid #f5d6b4;
  border-radius: 6px;
  color: #875b27;
  background: #fffaf3;
  font-size: 12px;
  line-height: 20px;

  .ivu-icon {
    flex: 0 0 auto;
    margin-top: 2px;
    color: #ff9900;
    font-size: 16px;
  }
}

.correction-form__grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px 18px;
}

.correction-field {
  min-width: 0;

  > span {
    display: block;
    margin-bottom: 7px;
    color: #39485f;
    font-size: 13px;
    line-height: 20px;

    i {
      margin-right: 4px;
      color: #ed4014;
      font-style: normal;
    }
  }

  &.is-wide {
    grid-column: 1 / -1;
  }
}

.qr-preview {
  width: 126px;
  padding: 7px 7px 8px;
  border: 1px solid #dce4f2;
  border-radius: 8px;
  color: #58709a;
  background: #fff;
  cursor: pointer;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;

  &:hover,
  &:focus-visible {
    border-color: #2b5cd9;
    box-shadow: 0 0 0 3px rgba(43, 92, 217, 0.08);
    outline: none;
  }

  img {
    display: block;
    width: 110px;
    height: 110px;
  }

  > .ivu-icon {
    display: block;
    margin: 24px auto;
    font-size: 54px;
  }

  span {
    display: block;
    margin-top: 5px;
    font-size: 12px;
    line-height: 18px;
  }
}

.session-details {
  min-width: 0;

  strong {
    color: #28364c;
    font-size: 14px;
  }

  p {
    margin-top: 4px;
    color: #7b8798;
    font-size: 12px;
    line-height: 20px;
  }
}

.session-details__head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 20px;
}

.session-expiry {
  display: flex;
  flex: 0 0 auto;
  align-items: center;
  gap: 5px;
  margin-top: 0 !important;
  color: #4f6280 !important;
  white-space: nowrap;

  .ivu-icon {
    flex: 0 0 auto;
    color: #2b5cd9;
    font-size: 15px;
  }

  &.is-expired {
    color: #c43d25 !important;

    .ivu-icon {
      color: #c43d25;
    }
  }
}

.session-link {
  position: relative;
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
  margin-top: 12px;
  min-height: 42px;
  padding: 9px 124px 9px 11px;
  border: 1px solid #e4e9f2;
  border-radius: 6px;
  color: #4f6280;
  background: #f8fafc;
  font-size: 12px;

  .ivu-icon {
    flex: 0 0 auto;
    color: #2b5cd9;
    font-size: 16px;
  }

  .session-link__url {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}

.session-link__actions {
  position: absolute;
  top: 4px;
  right: 4px;
  bottom: 4px;
  display: flex;
  align-items: center;
  gap: 4px;
  padding-left: 12px;
  background: linear-gradient(90deg, rgba(248, 250, 252, 0), #f8fafc 14px);
}

.session-link__button {
  height: 32px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: 0 9px;
  border: 0;
  border-radius: 5px;
  color: #536784;
  background: #fff;
  box-shadow: 0 0 0 1px #dce4f0 inset;
  cursor: pointer;
  font-size: 12px;
  transition: color 0.2s ease, background-color 0.2s ease, box-shadow 0.2s ease;

  .ivu-icon {
    color: currentColor;
    font-size: 14px;
  }

  &:hover,
  &:focus-visible {
    color: #2b5cd9;
    box-shadow: 0 0 0 1px #2b5cd9 inset;
    outline: none;
  }

  &.is-primary {
    color: #fff;
    background: #2b5cd9;
    box-shadow: none;

    &:hover,
    &:focus-visible {
      color: #fff;
      background: #234fbe;
      box-shadow: none;
    }
  }

  &.is-icon {
    width: 32px;
    padding: 0;
  }
}

.qr-modal-content {
  padding: 8px 0 4px;
  text-align: center;

  > img {
    width: 320px;
    max-width: 100%;
    border: 1px solid #edf0f5;
    border-radius: 8px;
  }

  > p {
    margin: 12px auto 0;
    color: #6f7e93;
    font-size: 13px;
    line-height: 21px;
  }
}

.qr-modal-actions {
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-top: 18px;
}

@media (prefers-reduced-motion: reduce) {
  .person-card,
  .qr-preview {
    transition: none;
  }
}

@media (max-width: 768px) {
  .person-card {
    padding: 16px;
  }

  .person-card__head {
    align-items: flex-start;
    flex-direction: column;
    gap: 12px;
  }

  .person-card__status {
    align-self: stretch;
    justify-content: space-between;
  }

  .person-card__facts {
    grid-template-columns: 1fr;
  }

  .session-create {
    align-items: stretch;
    flex-direction: column;
  }

  .session-expired-recovery,
  .session-details__head {
    align-items: stretch;
    flex-direction: column;
  }

  .session-expired-recovery__actions {
    align-items: stretch;
  }

  .session-expiry {
    white-space: normal;
  }

  .session-area {
    grid-template-columns: 1fr;
  }

  .qr-preview {
    width: 126px;
  }
}
</style>
