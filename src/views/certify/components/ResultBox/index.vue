<template>
  <div class="result-page">
    <div
      class="result-card"
      :class="[
        `is-${resultType}`,
        {
          'has-personnel': isPersonnelReview,
          'has-rejected-edit': showRejectedEnterpriseEdit,
        },
      ]"
    >
      <div class="result-visual">
        <div class="status-ring">
          <div class="status-icon">
            <Icon v-if="isPersonnelReview" type="ios-people" />
            <span v-else class="iconfont" :class="statusIcon"></span>
          </div>
        </div>
      </div>

      <div class="result-head list-b-8">
        <div class="result-title-row">
          <h2>{{ resultTitle }}</h2>
          <Button
            v-if="isPersonnelReview"
            size="small"
            shape="circle"
            class="result-refresh"
            icon="ios-refresh"
            :title="$t('certify.refreshStatus')"
            :aria-label="$t('certify.refreshStatus')"
            @click="refreshStatus"
          />
        </div>
        <p>{{ resultDesc }}</p>
      </div>

      <div
        class="result-panel"
        :class="{ 'has-edit-action': showRejectedEnterpriseEdit }"
        v-if="panelItems.length || panelTitle"
      >
        <div class="panel-content">
          <div class="panel-title" v-if="panelTitle">{{ panelTitle }}</div>
          <ul class="panel-list" v-if="panelItems.length">
            <li v-for="value in panelItems" :key="value">
              <Icon :type="panelIcon" />
              <span>{{ value }}</span>
            </li>
          </ul>
        </div>
      </div>

      <div class="personnel-panel" v-if="isPersonnelReview">
        <div class="personnel-head">
          <div>
            <h3>{{ $t('certify.personnelTitle') }}</h3>
          </div>
          <span class="personnel-progress">
            {{ $t('certify.personnelProgress', personnelProgress) }}
          </span>
        </div>
        <div class="personnel-list">
          <PersonnelVerificationCard
            v-for="person in personnel"
            :key="person.id"
            :person="person"
            :session-url="personSessionUrl(person)"
            :session-expires-at="personSessionExpiresAt(person)"
            :session-status="personSessionStatus(person)"
            :loading="personLoadingId === person.id"
            @create="createPersonSession"
            @correct="correctPerson"
          />
        </div>
      </div>

      <div class="result-actions">
        <Button
          v-if="showRejectedEnterpriseEdit"
          type="primary"
          size="large"
          icon="ios-create-outline"
          :loading="reopenLoading"
          :disabled="reopenLoading"
          @click="reopenRejectedCertification"
        >
          {{ $t('certify.modifyCertificationInfo') }}
        </Button>
        <template v-if="showCustomerButton">
          <Button
            :type="isPersonnelReview ? 'default' : 'primary'"
            size="large"
            @click="handlGoCustomer"
          >
            {{ $t('button.contactService') }}
          </Button>
           <Button
            size="large"
            @click="refreshStatus"
          >
            {{ $t('certify.refreshStatus') }}
          </Button>
        </template>
        <Button
          v-if="showRecertificationButton"
          type="primary"
          size="large"
          @click="recertification"
        >
          {{ actionText }}
        </Button>
        <Button
          v-if="showRenewalButton"
          type="primary"
          size="large"
          @click="recertification"
        >
          {{ $t('certify.startRenewal') }}
        </Button>
        <Button v-if="isSuccess" class="ui-button-shine" type="primary" size="large" @click="toRoute('cardAdd')" :loading="buttonLoading">
            {{ $t('button.openCardNow') }}
        </Button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, reactive, ref } from 'vue'
import { authLevel, levelMap } from '@/utils/level.js'
import { message, postApi, t } from '@/utils'
import { useAppStoreRefs } from '@/utils/store'
import { toRoute } from '@/utils/route'
import PersonnelVerificationCard from './PersonnelVerificationCard.vue'

const props = defineProps({
  data: {
    type: Object,
    default: () => ({}),
  },
  buttonLoading: {
    type: Boolean,
    default: false,
  },
})

const emits = defineEmits(['recertification', 'setLevel','refreshStatus'])
const { customerUrl } = useAppStoreRefs()
const personSessionUrls = reactive({})
const personSessionExpiries = reactive({})
const personSessionStatuses = reactive({})
const personLoadingId = ref('')
const reopenLoading = ref(false)

const userLevel = computed(() => props.data?.level || authLevel())
const typeName = computed(() => {
  switch (props.data.type) {
    case 0:
      return levelMap.value[userLevel.value]?.label ? `${t('certify.personal')}(${levelMap.value[userLevel.value]?.label})` : t('certify.personal')
    case 1:
      return t('certify.enterprise')
    default:
      return t('certify.enterprise')
  }
})
const refreshStatus=()=>{
  emits('refreshStatus')
}
const status = computed(() => props.data?.status || '')
const isPersonnelReview = computed(() => status.value === 'PersonnelReview')
const isPending = computed(() => ['Pending', 'PendingUeepay', 'In Review', 'ChannelReviewing', 'PersonnelReview'].includes(status.value))
const isSupplement = computed(() => ['PendingCheck'].includes(status.value))
const isRejected = computed(() => ['Inactive'].includes(status.value))
const isDenied = computed(() => ['Declined'].includes(status.value))
const isSuccess = computed(() => ['Active'].includes(status.value))
const isExpired = computed(() => status.value === 'Expired')
const isExpiring = computed(() => isSuccess.value && Boolean(props.data?.is_expiring))
const personnel = computed(() => props.data?.persons || [])
const personnelProgress = computed(() => {
  const required = personnel.value.filter((person) => Boolean(person.verification_required))
  return {
    completed: required.filter((person) => person.status === 'Approved').length,
    total: required.length,
  }
})
const needsCorrection = computed(() => isSupplement.value || isRejected.value || isDenied.value)
const remarkItems = computed(() => {
  return String(props.data?.remark || '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
})

const resultType = computed(() => {
  if (isSuccess.value) return 'success'
  if (isRejected.value || isDenied.value || isExpired.value) return 'error'
  if (isSupplement.value) return 'reject'
  return 'pending'
})
const statusIcon = computed(() => {
  if (isSuccess.value) return 'icon-mti-queding'
  if (isRejected.value || isDenied.value) return 'icon-shenhejujue'
  if (isExpired.value) return 'icon-a-buchongziliaoicon3x'
  if (isSupplement.value) return 'icon-a-buchongziliaoicon3x'
  return 'icon-shenhe'
})
const resultTitle = computed(() => {
  if (isPersonnelReview.value) return t('certify.personnelReviewTitle')
  if (isPending.value) return t('certify.pendingTitle', { type: typeName.value })
  if (isSupplement.value) return t('certify.supplementTitle', { type: typeName.value })
  if (isRejected.value || isDenied.value) return t('certify.rejectTitle', { type: typeName.value })
  if (isExpired.value) return t('certify.expiredTitle')
  if (isSuccess.value) return t('certify.successTitle', { type: typeName.value })
  return `${t('certify.statusUnknown')}${status.value}`
})
const resultDesc = computed(() => {
  if (isPersonnelReview.value) return t('certify.personnelTip')
  if (isPending.value) return props.data.type === 0 ? t('certify.pendingDesc3') : t('certify.pendingDesc2')
  if (isSupplement.value) return t('certify.supplementTip')
  if (isRejected.value || isDenied.value) return t('certify.rejectTip')
  if (isExpired.value) return t('certify.expiredTip')
  if (isSuccess.value) return t('certify.successDesc1', { type: typeName.value })
  return ''
})
const panelTitle = computed(() => {
  if (isSupplement.value) return t('certify.supplementDesc2')
  if (isRejected.value || isDenied.value) return t('certify.rejectReason')
  if (isExpiring.value) return t('certify.expiringTitle')
  return ''
})
const panelItems = computed(() => {
  if (needsCorrection.value) return remarkItems.value
  if (isExpiring.value) {
    return [t('certify.expiringTip', { date: props.data?.company_expiry_date || '-' })]
  }
  return []
})
const panelIcon = computed(() => {
  if (isSuccess.value) return 'ios-checkmark-circle-outline'
  if (isPending.value) return 'ios-information-circle-outline'
  return 'ios-close-circle-outline'
})
const showCustomerButton = computed(() => (
  isPending.value && !isPersonnelReview.value && !!customerUrl.value
))
const showRecertificationButton = computed(() => {
  return needsCorrection.value
    && (props.data?.type !== 1 || Boolean(props.data?.can_renew))
})
const showRejectedEnterpriseEdit = computed(() => (
  props.data?.type === 1 && isRejected.value
))
const showRenewalButton = computed(() => {
  return props.data?.type === 1
    && Boolean(props.data?.can_renew)
    && (isSuccess.value || isExpired.value)
})
const actionText = computed(() => {
  if (props.data?.type === 1) return t('certify.restartRenewal')
  return isSupplement.value ? t('certify.improveInfo') : t('certify.reCertify')
})

const personSessionUrl = (person) => (
  String(personSessionUrls[person.id] || person.verification_url || '').trim()
)
const personSessionExpiresAt = (person) => (
  String(personSessionExpiries[person.id] || person.verification_expires_at || '').trim()
)
const personSessionStatus = (person) => (
  String(personSessionStatuses[person.id] || person.verification_session_status || '').trim()
)
const createPersonSession = async (person) => {
  personLoadingId.value = person.id
  try {
    const res = await postApi('/user/certifications/createCompanyPersonSession', {
      person_id: person.id,
      redirect_url: `${window.location.origin}/certify`,
    })
    const url = String(res?.url || '').trim()
    if (!url) {
      throw new Error(t('certify.personnelSessionUrlMissing'))
    }
    personSessionUrls[person.id] = url
    personSessionExpiries[person.id] = String(res?.expires_at || '').trim()
    personSessionStatuses[person.id] = String(res?.status || 'Not Started').trim()
    message(t('certify.personnelSessionCreated'))
    emits('refreshStatus')
  } catch (err) {
    message(err?.msg || err?.message || err || t('certify.operationFailed'), 'error')
  } finally {
    personLoadingId.value = ''
  }
}

const correctPerson = async ({ person, data, onSuccess }) => {
  personLoadingId.value = person.id
  try {
    await postApi('/user/certifications/correctCompanyPerson', {
      person_id: person.id,
      ...data,
    })
    delete personSessionUrls[person.id]
    delete personSessionExpiries[person.id]
    delete personSessionStatuses[person.id]
    onSuccess?.()
    message(t('certify.personnelCorrectionSubmitted'))
    emits('refreshStatus')
  } catch (err) {
    message(err?.msg || err?.message || err || t('certify.operationFailed'), 'error')
  } finally {
    personLoadingId.value = ''
  }
}

const reopenRejectedCertification = async () => {
  if (reopenLoading.value) return
  reopenLoading.value = true
  try {
    await postApi('/user/certifications/reopenRejectedCertification', {})
    emits('refreshStatus')
  } catch (err) {
    message(err?.msg || err?.message || err || t('certify.operationFailed'), 'error')
  } finally {
    reopenLoading.value = false
  }
}

const recertification = () => {
  emits('recertification', props.data.type)
  if (props.data.type !== 1) {
    setLevel(props.data.level)
  }
}
const setLevel = (level) => {
  emits('setLevel', level)
}
const handlGoCustomer = () => {
  if (customerUrl.value) {
    window.open(customerUrl.value, '_blank')
  }
}
</script>

<style scoped lang="less">
.result-page{
  min-height:100%;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  box-sizing: border-box;
  padding: var(--ui-padding-48-24);
  width: 100%;
}
.result-card{
  position: relative;
  text-align: center;
  width: 100%;
  max-width:500px;
}
.result-card.has-rejected-edit{
  max-width: 760px;
}
.result-card.has-rejected-edit .result-visual{
  width: 112px;
  height: 112px;
  margin-bottom: 22px;
}
.result-card.has-rejected-edit .status-ring{
  width: 100px;
  height: 100px;
}
.result-card.has-rejected-edit .status-icon{
  width: 78px;
  height: 78px;
  box-shadow: 0 10px 24px rgba(237, 64, 20, 0.2);
  .iconfont{
    font-size: 34px;
  }
}
.result-card.has-rejected-edit .result-head{
  h2{
    font-weight: 600;
    line-height: 38px;
  }
  p{
    margin-top: 10px;
    color: #68778d;
    line-height: 26px;
  }
}
.result-card.has-personnel{
  max-width: 100%;
}
.result-card.has-personnel .result-visual{
  width: 88px;
  height: 88px;
  margin-bottom: 14px;
}
.result-card.has-personnel .result-head{
  max-width: 920px;
}
.result-card.has-personnel .result-title-row{
  grid-template-columns: minmax(0, 1fr) auto auto minmax(0, 1fr);
  column-gap: 12px;
}
.result-card.has-personnel .result-refresh{
  grid-column: 3;
  justify-self: start;
}
.result-visual{
  position: relative;
  z-index: 1;
  width: var(--ui-size-96);
  height: var(--ui-size-96);
  margin: 0 auto 20px;
}
.status-ring{
  width: var(--ui-size-84);
  height: 84px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--ui-radius-circle);
  background: rgba(43, 92, 217, 0.05);
}
.status-icon{
  width: 66px;
  height: 66px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--ui-radius-circle);
  color: var(--ui-color-text-inverse);
  line-height: 1;
  background: var(--ui-color-primary);
  box-shadow: 0 6px 12px rgba(43, 92, 217, 0.14);
  .iconfont{
    font-size: 30px;
  }
  .ivu-icon{
    font-size: 45px;
  }
}
.is-error .status-icon{
  background: #ed4014;
  box-shadow: 0 6px 12px rgba(237, 64, 20, 0.14);
}
.is-error .status-ring{
  background: #fff2ee;
}
.is-success .status-icon{
  background: var(--ui-color-success);
  box-shadow: 0 6px 12px rgba(25, 190, 107, 0.14);
}
.is-success .status-ring{
  background: #effaf4;
}
.is-pending .status-icon{
  background: var(--ui-color-primary);
  box-shadow: 0 6px 12px rgba(43, 92, 217, 0.14);
}
.is-pending .status-ring{
  background: rgba(43, 92, 217, 0.06);
}
.is-reject .status-icon{
  background: #ff9900;
  box-shadow: 0 6px 12px rgba(255, 153, 0, 0.14);
}
.is-reject .status-ring{
  background: #fff7e8;
}
.result-head{
  position: relative;
  z-index: 1;
  max-width: 640px;
  margin: 0 auto;
  h2{
    color: #222b3a;
    font-size: 22px;
    font-weight: 600;
    line-height: 30px;
  }
  p{
    margin-top: 6px;
    color: #7b8798;
    font-size: 14px;
    line-height: 22px;
  }
}
.result-title-row{
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr);
  align-items: center;
  width: 100%;
  h2{
    grid-column: 2;
  }
}
.result-refresh{
  grid-column: 3;
  justify-self: end;
  flex: 0 0 auto;
  width: 32px;
  height: 32px;
  padding: 0 !important;
  color: #2456cd !important;
  line-height: 30px;
  background: #edf3ff !important;
  border: 1px solid #b8caf2 !important;
  border-radius: 50% !important;
  box-shadow: 0 3px 10px rgba(43, 92, 217, 0.1);
  transition: color 0.2s ease, background-color 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease;
  :deep(.ivu-icon){
    margin: 0;
    font-size: 16px;
  }
  &:hover,
  &:focus{
    color: #1746b4 !important;
    background: #e2ebff !important;
    border-color: #8facf0 !important;
    box-shadow: 0 4px 12px rgba(43, 92, 217, 0.16);
  }
  &:focus-visible{
    box-shadow: 0 0 0 3px rgba(43, 92, 217, 0.14);
  }
}
.result-panel{
  position: relative;
  z-index: 1;
  margin: 26px auto 28px;
  padding: var(--ui-padding-14-18);
  text-align: left;
  background: #fff;
  border-radius: var(--ui-radius-6);
}
.result-panel.has-edit-action{
  margin: 32px auto 24px;
  padding: 18px 20px;
  border: 1px solid #ffd9cf;
  border-radius: 10px;
  background: #fff8f6;
}
.panel-content{
  min-width: 0;
  flex: 1;
}
.result-panel.has-edit-action .panel-title{
  margin-bottom: 10px;
  color: #26354a;
  font-size: 14px;
  font-weight: 600;
  line-height: 22px;
}
.result-panel.has-edit-action .panel-list li{
  gap: 8px;
  color: #34445a;
  font-size: 14px;
  line-height: 22px;
  span{
    min-width: 0;
    overflow-wrap: anywhere;
  }
  .ivu-icon{
    margin-top: 4px;
    font-size: 14px;
  }
}
.panel-title{
  margin-bottom: 10px;
  color: #2f3a4a;
  font-size: 14px;
  font-weight: 500;
  line-height: 22px;
}
.panel-list{
  margin: 0;
  padding: 0;
  list-style: none;
  li{
    display: flex;
    align-items: flex-start;
    gap: 8px;
    color: #3d4a5c;
    font-size: 14px;
    line-height: 22px;
    &:not(:last-child){
      margin-bottom: 8px;
    }
    .ivu-icon{
      flex: 0 0 auto;
      margin-top: 4px;
      font-size: 14px;
    }
  }
}
.is-error .panel-list .ivu-icon{
  color: var(--ui-color-error-strong);
}
.is-reject .panel-list .ivu-icon{
  color: #ff9900;
}
.is-success .panel-list .ivu-icon{
  color: var(--ui-color-success);
}
.is-pending .panel-list .ivu-icon{
  color: var(--ui-color-primary);
}
.personnel-panel{
  margin: 24px auto 28px;
  padding: 20px;
  text-align: left;
  border: 1px solid #dfe6f2;
  border-radius: 8px;
  background: #f8faff;
}
.personnel-head{
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 16px;
  padding: 0 2px;
  h3{
    color: #222b3a;
    font-size: 15px;
    line-height: 22px;
  }
  p{
    margin-top: 4px;
    color: #7b8798;
    font-size: 12px;
    line-height: 20px;
  }
}
.personnel-progress{
  flex: 0 0 auto;
  display: inline-flex;
  align-items: center;
  height: 28px;
  padding: 0 11px;
  border-radius: 14px;
  color: #315ead;
  background: #edf3ff;
  font-size: 12px;
  font-weight: 500;
}
.result-actions{
  position: relative;
  z-index: 1;
  display: flex;
  justify-content: center;
  gap: 10px;
  flex-wrap: wrap;
  margin-top: 4px;
  :deep(.ivu-btn){
    min-width: 128px;
    border-radius: var(--ui-radius-3xl);
    font-size: 14px;
    font-weight: 500;
    box-shadow: 0 8px 16px rgba(43, 92, 217, 0.16);
  }
  :deep(.ivu-btn-ghost){
    box-shadow: none;
  }
}
.result-head + .result-actions{
  margin-top: 24px;
}

@media (max-width: 768px) {
  .result-page{
    min-height: auto;
    padding: 20px 12px 32px;
    align-items: flex-start;
  }
  .result-card{
    padding: 42px 0 24px;
  }
  .personnel-head{
    flex-direction: column;
    align-items: flex-start;
  }
  .personnel-panel{
    padding: 12px;
  }
  .result-card.has-personnel .result-title-row{
    grid-template-columns: auto auto;
    justify-content: center;
    row-gap: 0;
  }
  .result-card.has-personnel .result-title-row h2{
    grid-column: 1;
  }
  .result-card.has-personnel .result-refresh{
    grid-column: 2;
    justify-self: start;
  }
  .result-visual{
    width: var(--ui-size-86);
    height: var(--ui-size-86);
    margin-bottom: 16px;
  }
  .status-ring{
    width: 78px;
    height: 78px;
  }
  .status-icon{
    width: 62px;
    height: 62px;
    .iconfont{
      font-size: 28px;
    }
  }
  .result-head{
    h2{
      font-size: 22px;
      line-height: 30px;
    }
    p{
      font-size: 14px;
      line-height: 22px;
    }
  }
  .result-panel{
    max-width: 100%;
    margin: 24px auto 26px;
    padding: var(--ui-padding-14-16);
  }
  .result-panel.has-edit-action{
    padding: var(--ui-padding-16);
  }
  .result-actions{
    :deep(.ivu-btn),
    a{
      width: 100%;
    }
    :deep(.ivu-btn){
      min-width: 0;
      border-radius: var(--ui-radius-3xl);
      font-size: 14px;
    }
  }
}
</style>
