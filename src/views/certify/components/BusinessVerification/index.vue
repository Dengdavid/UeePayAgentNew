<template>
  <div
    ref="enterpriseRef"
    class="enterprise"
    v-if="stepData.length"
  >
    <div class="mobile-progress">
      <div class="mobile-progress-head">
        <div class="mobile-progress-title">
          <span>{{ $t('certify.typeCertify', { type: $t('certify.enterprise') }) }}</span>
          <button v-if="canChangeCertificationType" type="button" class="mobile-reset-text" @click="handleReset">
            {{ $t('certify.changeCertificationType') }}
          </button>
        </div>
        <span>{{ progressPercent }}%</span>
      </div>
      <Progress :percent="progressPercent" :stroke-width="8" hide-info/>
    </div>
    <div class="left list-b-16">
      <div class="thead">
        <h3>{{ $t('certify.typeCertify', { type: $t('certify.enterprise') }) }}</h3>
        <p>{{ $t('certify.businessInstructions') }}</p>
      </div>
      <div class="progress-box list-b-4">
        <p>{{ $t('certify.overallProgress') }}</p>
        <Progress :percent="progressPercent" :stroke-width="18" text-inside/>
      </div>
      <div class="p-t-12">
        <Steps :current="stepValue" direction="vertical">
          <Step
            :title="step.step_label"
            :status="stepStatus(step, index)"
            :class="{
              'is-active-step': index === stepValue,
              'is-step-locked': !isDocumentStep(step) && !canAccessLaterSteps,
            }"
            v-for="(step, index) in stepData"
            :key="step.step_key || index"
            @click="handleStepClick(index)"
          >
            <template #content>
              <div class="step-tips" :class="{ complete: stepStats(step).isComplete }">
                {{ stepTips(step) }}
              </div>
            </template>
          </Step>
        </Steps>
      </div>
      <Button v-if="canChangeCertificationType" long ghost type="primary" @click="handleReset">
        {{ $t('certify.changeCertificationType') }}
      </Button>
    </div>
    <Form
      ref="formRef"
      :model="formModel"
      label-position="top"
      class="center list-b-16"
      :aria-busy="submitting"
    >
      <Spin v-if="submitting" fix size="large" />
      <Spin v-if="countrySwitching" fix>
        <Icon type="ios-loading" size="24" class="spin-icon-load" />
        <div>{{ $t('certify.countryRulesUpdating') }}</div>
      </Spin>
      <Alert type="warning" show-icon v-if="isRenewal">
        <div>{{ $t('certify.renewalDraftTip', { date: data?.certification?.company_expiry_date || '-' }) }}</div>
      </Alert>
      <Alert type="warning" show-icon v-if="data?.certification?.remark">
        {{ data.certification.remark }}
      </Alert>
      <button
        v-if="recognitionGateVisible"
        type="button"
        class="recognition-documents-summary"
        :aria-expanded="!recognitionDocumentsCollapsed"
        @click.stop="toggleRecognitionDocuments"
      >
        <span class="recognition-documents-summary__icon">
          <Icon type="ios-folder-open-outline" aria-hidden="true" />
        </span>
        <span class="recognition-documents-summary__content">
          <strong>{{ documentStep?.step_label || $t('certify.companyDocuments') }}</strong>
          <small>{{ $t('certify.recognitionDocumentsSubmitted', { count: recognition?.summary?.file_count || recognition?.files?.length || documentFileCount }) }}</small>
        </span>
        <span class="recognition-documents-summary__action">
          {{ $t(recognitionDocumentsCollapsed ? 'certify.recognitionExpandDocuments' : 'certify.recognitionCollapseDocuments') }}
          <Icon :type="recognitionDocumentsCollapsed ? 'ios-arrow-down' : 'ios-arrow-up'" aria-hidden="true" />
        </span>
      </button>
      <template v-for="(step, index) in stepData" :key="step.step_key || index">
        <template v-if="index === renderedStepIndex">
          <div
            v-show="!recognitionGateVisible || !recognitionDocumentsCollapsed"
            class="step-form-content"
            :class="{ 'is-recognition-readonly': recognitionGateVisible }"
          >
          <template v-if="isRepresentativeStep(step)">
            <div
              v-for="(person, personIndex) in representativePeople(step)"
              :key="person.key"
              class="groups-box is-representative-group"
              :class="{ 'is-collapsed': Boolean(person.primaryGroup.hidden) }"
            >
              <div class="hd representative-person-header">
                <button
                  type="button"
                  class="representative-header-toggle"
                  :aria-expanded="!person.primaryGroup.hidden"
                  @click="setRepresentativePersonCollapsed(person, !person.primaryGroup.hidden)"
                >
                  <span class="group-heading">
                    <span class="group-order" aria-hidden="true">{{ personIndex + 1 }}</span>
                    <span class="groups-item">{{ $t('certify.recognitionPersons') }}</span>
                  </span>
                  <span class="group-toggle">
                    <span>{{ $t(person.primaryGroup.hidden ? 'button.expand' : 'button.collapse') }}</span>
                    <Icon :type="person.primaryGroup.hidden ? 'ios-arrow-down' : 'ios-arrow-up'" />
                  </span>
                </button>
                <button
                  v-if="representativePeople(step).length > 1"
                  type="button"
                  class="representative-delete"
                  :title="$t('button.delete')"
                  :aria-label="$t('button.delete')"
                  @click.stop="deleteRepresentativePerson(step, person)"
                >
                  <Icon type="ios-trash-outline" aria-hidden="true" />
                </button>
              </div>
              <div v-if="!person.primaryGroup.hidden" class="bd list-b-16 border">
                <div class="representative-role-field">
                  <div class="representative-role-field__label">
                    <span class="representative-role-field__required" aria-hidden="true">*</span>
                    <span>{{ $t('certify.personnelRolesLabel') }}</span>
                  </div>
                  <div
                    class="representative-role-switcher"
                    role="group"
                    :aria-label="$t('certify.personnelRolesLabel')"
                  >
                    <button
                      v-for="role in representativeRoleOptions()"
                      :key="role.name"
                      type="button"
                      role="checkbox"
                      class="representative-role"
                      :class="{ 'is-active': person.roles.includes(role.name) }"
                      :aria-checked="person.roles.includes(role.name)"
                      @click="toggleRepresentativeRole(step, person, role.name)"
                    >
                      <span class="representative-role__icon" aria-hidden="true">
                        <Icon :type="role.icon" />
                      </span>
                      <span class="representative-role__content">
                        <span class="representative-role__title">
                          <strong>{{ role.label }}</strong>
                        </span>
                        <span class="representative-role__description" :title="role.description">
                          {{ role.description }}
                        </span>
                      </span>
                      <Icon
                        class="representative-role__state"
                        :type="person.roles.includes(role.name) ? 'md-checkbox' : 'md-square-outline'"
                        aria-hidden="true"
                      />
                    </button>
                  </div>
                </div>
                <template
                  v-for="(field, fieldIndex) in person.primaryGroup.fields"
                  :key="`${field.field_key}-${fieldIndex}`"
                >
                  <FieldsItem
                    v-if="isVisible(field, person.primaryGroup)"
                    :data="field"
                    :group="person.primaryGroup"
                    :parentData="fieldRows"
                    :prop="representativeFieldProp(index, step, person.primaryGroup, fieldIndex)"
                    :validateRequired="validateRequired"
                    @on-change="handleFieldChange(field, person.primaryGroup)"
                  />
                </template>
              </div>
            </div>
            <div v-if="canShowAddRepresentativePerson(step)" class="group-actions representative-add-person">
              <Button
                type="primary"
                ghost
                long
                icon="md-add"
                :disabled="!canAddRepresentativePerson(step)"
                :title="canAddRepresentativePerson(step) ? '' : $t('certify.personnelCorrectionRequired')"
                @click="addRepresentativePerson(step)"
              >
                {{ $t('certify.addGroup', { group: $t('certify.recognitionPersons') }) }}
              </Button>
            </div>
          </template>
          <template
            v-for="(group, groupIndex) in step.groups"
            :key="`${group.group_key || 'group'}-${group.front_key ?? groupIndex}`"
          >
            <div
              v-if="!isRepresentativeStep(step) && isVisible(group, group)"
              class="groups-box list-b-16"
              :class="{
                'is-collapsed': Boolean(group.hidden),
              }"
            >
              <button
                class="hd"
                v-if="group.group_title"
                type="button"
                :aria-expanded="!group.hidden"
                @click="group.hidden = !group.hidden"
              >
                <span class="group-heading">
                  <span class="groups-item">
                    {{ groupTitle(group) }}
                  </span>
                </span>
                <span class="group-toggle">
                  <span>{{ $t(group.hidden ? 'button.expand' : 'button.collapse') }}</span>
                  <Icon :type="group.hidden ? 'ios-arrow-down' : 'ios-arrow-up'" />
                </span>
              </button>
              <div
                class="bd list-b-16"
                :class="{ border:group.group_title }"
              >
                <template v-if="group.group_title && group.hidden">
                  <div class="group-toggle-action is-empty" @click="group.hidden = false">
                    {{ $t('button.expand') }}
                    <Icon type="ios-arrow-down" />
                  </div>
                </template>
                <template v-else>
                  <template v-for="(field, fieldIndex) in group.fields" :key="`${field.field_key}-${fieldIndex}`">
                    <FieldsItem
                      v-if="isVisible(field, group)"
                      :data="field"
                      :group="group"
                      :parentData="fieldRows"
                      :prop="fieldProp(index, groupIndex, fieldIndex)"
                      :validateRequired="validateRequired"
                      @on-change="handleFieldChange(field, group)"
                    />
                  </template>
                  <div
                    class="group-toggle-action"
                    v-if="group.group_title"
                    @click="group.hidden = true"
                  >
                    {{ $t('button.collapse') }}
                    <Icon type="ios-arrow-up" />
                  </div>
                </template>
              </div>
              <div class="group-actions" v-if="showGroupActions(step.groups, group) && !group.hidden">
                <Button type="primary" ghost long icon="md-add" @click="addGroup(step.groups, group, groupIndex)">
                  {{ $t('certify.addGroup', { group: group.group_title }) }}
                </Button>
                <Button icon="md-trash" v-if="Number(group.front_key || 0) !== 0" @click="deleteGroup(step.groups, groupIndex)">
                  {{ $t('button.delete') }}
                </Button>
              </div>
            </div>
          </template>
          <Divider />
          <div class="footer">
            <Button :disabled="loading || stepValue === 0" @click="changeStep(stepValue - 1, false)">{{ $t('button.prevStep') }}</Button>
            <div class="footer-actions">
              <Button :loading="loading" @click="saveCurrentStep">{{ $t('certify.saveDraft') }}</Button>
              <Button
                v-if="isDocumentStep(step) && recognitionFillMode === 'Manual'"
                type="primary"
                ghost
                icon="ios-refresh"
                :loading="recognitionActionLoading || loading"
                @click="enableRecognition(step)"
              >
                {{ $t('certify.recognitionRestart') }}
              </Button>
              <Button
                v-if="stepValue < stepData.length - 1"
                type="primary"
                :loading="loading"
                @click="changeStep(stepValue + 1, true)"
              >
                {{ $t('button.nextStep') }}
              </Button>
              <Button v-else type="primary" :loading="loading || submitting" @click="submitCertification">{{ $t('certify.submitCertification') }}</Button>
            </div>
          </div>
          </div>
        </template>
      </template>
      <SystemRecognitionPanel
        v-if="recognitionGateVisible"
        :recognition="recognition"
        :action-loading="recognitionActionLoading"
        @back="backToDocuments"
        @retry="retryRecognition"
        @skip="skipRecognition"
        @continue="continueFromRecognition"
      />
    </Form>
  </div>
</template>

<script>
const businessVerificationCache = {}
</script>

<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { confirm, getApi, message, postApi, t } from '@/utils'
import { regexFun } from '@/utils/regex.js'
import FieldsItem from './FieldsItem.vue'
import SystemRecognitionPanel from './SystemRecognitionPanel.vue'
import { Form } from 'view-ui-plus'
const props = defineProps({
  //企业认证数据结构
  data:{
    type:Object,
  }
})
const loading = ref(false)
const submitting = ref(false)
const stepData=ref([])
const stepValue=ref(0)
const deletedFields = ref([])
const stepDraftSnapshots = ref({})
const submitFieldsPending = {}
const enterpriseRef = ref(null)
const formRef = ref(null)
const validateRequired = ref(true)
const fieldValueSnapshots = ref({})
const currentServerVersion = ref('')
const currentConfigVersion = ref('')
const countrySwitching = ref(false)
const recognition = ref({})
const recognitionGateVisible = ref(false)
const recognitionDocumentsCollapsed = ref(true)
const recognitionActionLoading = ref(false)
const recognitionDismissedRequestId = ref('')
const acknowledgedRecognitionRequestId = ref('')
let mobileMedia = null
let cacheTimer = null
let cacheEnabled = true
let recognitionPollTimer = null
let recognitionPolling = false
let recognitionPollingActive = true
let representativeGroupTemplates = {}
let representativePersonSequence = 0
const emits = defineEmits(['handleReset','resetForm','handleSubmit', 'on-change'])

const SUPPORTING_DOCUMENTS_STEP_KEY = 'SupportingDocuments'
const BUSINESS_VERIFICATION_CACHE_SCHEMA = 3
const cloneData = (data) => JSON.parse(JSON.stringify(data || []))
const cloneFieldValue = (value) => {
  if (value === null || value === undefined) return value
  return JSON.parse(JSON.stringify(value))
}
const configuredFieldDefault = (field) => {
  if (field?.field_key === 'ubo_ownership_percentage') return 25
  if (field?.field_key === 'director_ownership_percentage') return 25
  const attrs = field?.attrs || {}
  if (Object.prototype.hasOwnProperty.call(attrs, 'default')) {
    return cloneFieldValue(attrs.default)
  }
  return undefined
}
const applyConfiguredFieldDefaults = (steps) => {
  steps.forEach((step) => {
    step.groups?.forEach((group) => {
      group.fields?.forEach((field) => {
        const isEmpty = field.field_value === null || field.field_value === undefined || field.field_value === ''
        const defaultValue = configuredFieldDefault(field)
        if (isEmpty && defaultValue !== undefined) {
          field.field_value = defaultValue
        }
      })
    })
  })
}
const stableStringify = (data) => JSON.stringify(data || [])
const formModel = computed(() => ({ steps: stepData.value }))
const documentStepIndex = computed(() => {
  const index = stepData.value.findIndex((step) => step?.step_key === SUPPORTING_DOCUMENTS_STEP_KEY)
  // 旧草稿缓存可能没有 step_key；固定四步流程的首步仍然是公司资料。
  return index >= 0 ? index : (stepData.value.length > 0 ? 0 : -1)
})
const documentStep = computed(() => documentStepIndex.value >= 0
  ? stepData.value[documentStepIndex.value] || null
  : null)
const renderedStepIndex = computed(() => recognitionGateVisible.value
  ? documentStepIndex.value
  : stepValue.value)
const nextStepAfterDocumentsIndex = computed(() => {
  const index = documentStepIndex.value
  return index >= 0 ? Math.min(index + 1, Math.max(stepData.value.length - 1, 0)) : 0
})
const isDocumentStep = (step) => step?.step_key === SUPPORTING_DOCUMENTS_STEP_KEY
  || step === documentStep.value
const activateDocumentStep = () => {
  const index = documentStepIndex.value
  if (index < 0) return false
  stepValue.value = index
  return true
}
const toggleRecognitionDocuments = async () => {
  if (!activateDocumentStep()) return
  const willExpand = recognitionDocumentsCollapsed.value
  recognitionDocumentsCollapsed.value = !recognitionDocumentsCollapsed.value
  if (willExpand) {
    documentStep.value?.groups?.forEach((group) => {
      group.hidden = false
    })
  }
  await nextTick()
}
const documentFileCount = computed(() => {
  let count = 0
  documentStep.value?.groups?.forEach((group) => {
    group.fields?.forEach((field) => {
      if (!['upload', 'uploads'].includes(field?.field_type) || !hasValue(field?.field_value)) return
      if (Array.isArray(field.field_value)) {
        count += field.field_value.filter(Boolean).length
      } else {
        count += String(field.field_value).split(',').filter((value) => value.trim() !== '').length
      }
    })
  })
  return count
})
const isRenewal = computed(() => Boolean(props.data?.certification?.renewal_required))
const canChangeCertificationType = computed(() => {
  const certification = props.data?.certification || {}
  const status = certification.application_status || certification.status || 'Draft'
  return !isRenewal.value && status === 'Draft' && !Boolean(certification.is_locked)
})
const recognitionRequestId = computed(() => recognition.value?.request_id || '')
const recognitionStatus = computed(() => recognition.value?.status || 'NotStarted')
const recognitionFillMode = computed(() => recognition.value?.fill_mode || 'Auto')
const recognitionBusinessBlocked = computed(
  () => Boolean(recognition.value?.business_validation?.blocking),
)
const getRecognitionAckKey = () => `business-recognition-ack:${getCacheKey()}`
const getAcknowledgedRecognitionId = () => {
  try {
    return sessionStorage.getItem(getRecognitionAckKey()) || ''
  } catch {
    return ''
  }
}
const acknowledgeRecognition = (requestId) => {
  if (!requestId) return
  acknowledgedRecognitionRequestId.value = requestId
  try {
    sessionStorage.setItem(getRecognitionAckKey(), requestId)
  } catch {
  }
}
const isRecognitionAcknowledged = computed(() => {
  return recognitionRequestId.value !== ''
    && acknowledgedRecognitionRequestId.value === recognitionRequestId.value
})
const canAccessLaterSteps = computed(() => {
  if (recognitionFillMode.value === 'Manual') return true
  return !recognitionBusinessBlocked.value
    && recognitionStatus.value === 'Completed'
    && isRecognitionAcknowledged.value
})
const recognitionStepLockedMessage = computed(() => (
  recognitionStatus.value === 'Completed' && !recognitionBusinessBlocked.value
    ? t('certify.recognitionStageReviewTip')
    : t('certify.recognitionStepLocked')
))
const isRepresentativeStep = (step) => step?.step_key === 'CompanyRepresentative'
const REPRESENTATIVE_ROLE_ORDER = ['ubo_info', 'auth_director']
const createRepresentativePersonKey = () => {
  representativePersonSequence += 1
  return `representative-person-${Date.now()}-${representativePersonSequence}`
}
const representativeRoleOptions = () => REPRESENTATIVE_ROLE_ORDER.map((name) => ({
  name,
  label: name === 'ubo_info' ? t('certify.personRoleUbo') : t('certify.personRoleDirector'),
  description: name === 'ubo_info'
    ? t('certify.personRoleUboDescription')
    : t('certify.personRoleDirectorDescription'),
  icon: name === 'ubo_info' ? 'ios-people' : 'ios-person',
}))
const representativeFieldSuffix = (fieldKey = '') => String(fieldKey).replace(/^(ubo|director)_/, '')
const representativeField = (group, suffix) => group?.fields?.find(
  (field) => representativeFieldSuffix(field.field_key) === suffix,
)
const representativeIdentity = (group) => {
  const value = (suffix) => String(representativeField(group, suffix)?.field_value ?? '').trim().toLocaleLowerCase()
  const document = [value('country'), value('cert_type'), value('id_no')]
  if (document[1] && document[2]) return `document:${document.join('|')}`
  const person = [value('country'), value('first_name'), value('last_name')]
  if (person[1] && person[2]) return `name:${person.join('|')}`
  return ''
}
const representativeGroupsMatch = (left, right) => {
  const leftPersonKey = left?.__representativePersonKey || ''
  const rightPersonKey = right?.__representativePersonKey || ''
  if (leftPersonKey || rightPersonKey) {
    return leftPersonKey !== '' && leftPersonKey === rightPersonKey
  }
  const leftIdentity = representativeIdentity(left)
  const rightIdentity = representativeIdentity(right)
  if (leftIdentity || rightIdentity) return leftIdentity !== '' && leftIdentity === rightIdentity
  return Number(left?.front_key || 0) === Number(right?.front_key || 0)
}
const representativePersonOrder = (person, fallback = Number.MAX_SAFE_INTEGER) => {
  const orders = Object.values(person?.groups || {})
    .map((group) => Number(group.__representativeOrder))
    .filter((order) => Number.isInteger(order) && order >= 0)
  return orders.length > 0 ? Math.min(...orders) : fallback
}
const representativeGroupHasData = (group) => group?.fields?.some((field) => {
  const value = field?.field_value
  // 持股比例存在默认值，不能单独作为扫描出一名人员的判断依据。
  if (representativeFieldSuffix(field?.field_key) === 'ownership_percentage') return false
  return Array.isArray(value)
    ? value.some((item) => item !== null && item !== undefined && String(item).trim() !== '')
    : value !== null && value !== undefined && String(value).trim() !== ''
})
const representativePeople = (step) => {
  if (!isRepresentativeStep(step)) return []
  const allUboGroups = (step.groups || []).filter((group) => group.group_key === 'ubo_info')
  const allDirectorGroups = (step.groups || []).filter((group) => group.group_key === 'auth_director')
  const hasEnteredPerson = [...allUboGroups, ...allDirectorGroups].some(representativeGroupHasData)
  const hasExplicitSelection = [...allUboGroups, ...allDirectorGroups].some(
    (group) => Boolean(group.__representativeSelected),
  )
  const isDisplayGroup = (group) => Boolean(group.__representativeSelected)
    || representativeGroupHasData(group)
    || Number(group.front_key || 0) > 0
  const hasActivePerson = hasEnteredPerson || hasExplicitSelection
  const uboGroups = hasActivePerson
    ? allUboGroups.filter(isDisplayGroup)
    : (allUboGroups.length > 0 ? allUboGroups : [])
  const directorGroups = hasActivePerson
    ? allDirectorGroups.filter(isDisplayGroup)
    : (allUboGroups.length > 0 ? [] : allDirectorGroups)
  const matchedDirectors = new Set()
  const people = uboGroups.map((uboGroup, index) => {
    const directorGroup = directorGroups.find((group) => (
      !matchedDirectors.has(group) && representativeGroupsMatch(uboGroup, group)
    ))
    if (directorGroup) matchedDirectors.add(directorGroup)
    const groups = { ubo_info: uboGroup }
    if (directorGroup) groups.auth_director = directorGroup
    return {
      key: uboGroup.__representativePersonKey
        || directorGroup?.__representativePersonKey
        || `ubo-${uboGroup.front_key ?? index}-${directorGroup?.front_key ?? 'none'}`,
      groups,
      roles: REPRESENTATIVE_ROLE_ORDER.filter((role) => Boolean(groups[role])),
      primaryGroup: uboGroup,
    }
  })
  directorGroups.forEach((directorGroup, index) => {
    if (matchedDirectors.has(directorGroup)) return
    people.push({
      key: directorGroup.__representativePersonKey || `director-${directorGroup.front_key ?? index}`,
      groups: { auth_director: directorGroup },
      roles: ['auth_director'],
      primaryGroup: directorGroup,
    })
  })
  return people
    .map((person, index) => ({ person, index }))
    .sort((left, right) => {
      const orderDifference = representativePersonOrder(left.person) - representativePersonOrder(right.person)
      return orderDifference === 0 ? left.index - right.index : orderDifference
    })
    .map(({ person }) => person)
}
const ensureRepresentativePersonKeys = (steps) => {
  ;(steps || []).forEach((step) => {
    if (!isRepresentativeStep(step)) return
    const hadClientPersonKeys = step.groups?.some((group) => group.__representativePersonKey)
    const groupsByPersonKey = new Map()
    step.groups?.forEach((group) => {
      const personKey = group.__representativePersonKey
      if (!personKey) return
      const groups = groupsByPersonKey.get(personKey) || []
      groups.push(group)
      groupsByPersonKey.set(personKey, groups)
    })
    groupsByPersonKey.forEach((groups) => {
      const roles = new Set(groups.map((group) => group.group_key))
      if (roles.size === groups.length) return
      groups.forEach((group) => {
        delete group.__representativePersonKey
      })
    })
    const people = representativePeople(step)
    people.forEach((person, personIndex) => {
      const personKey = Object.values(person.groups).find(
        (group) => group.__representativePersonKey,
      )?.__representativePersonKey || createRepresentativePersonKey()
      const groupIndexes = Object.values(person.groups)
        .map((group) => step.groups.indexOf(group))
        .filter((index) => index >= 0)
      const fallbackOrder = hadClientPersonKeys && groupIndexes.length > 0
        ? Math.min(...groupIndexes)
        : personIndex
      const personOrder = representativePersonOrder(person, fallbackOrder)
      Object.values(person.groups).forEach((group) => {
        group.__representativePersonKey = personKey
        group.__representativeOrder = personOrder
      })
    })
  })
}
const isSelectedRepresentativeGroup = (step, group) => {
  if (!isRepresentativeStep(step)) return true
  return representativePeople(step).some((person) => Object.values(person.groups).includes(group))
}
const syncRepresentativeGroupTemplates = (steps, fallbackSteps = []) => {
  representativeGroupTemplates = {}
  ;[...(steps || []), ...(fallbackSteps || [])].forEach((step) => {
    if (!isRepresentativeStep(step)) return
    step.groups?.forEach((group) => {
      if (!REPRESENTATIVE_ROLE_ORDER.includes(group.group_key) || representativeGroupTemplates[group.group_key]) return
      representativeGroupTemplates[group.group_key] = cloneData(group)
    })
  })
}
const setRepresentativePersonCollapsed = (person, hidden) => {
  Object.values(person.groups).forEach((group) => {
    group.hidden = hidden
  })
}
const representativeFieldProp = (stepIndex, step, group, fieldIndex) => (
  fieldProp(stepIndex, step.groups.indexOf(group), fieldIndex)
)
const syncRepresentativePersonFields = (person) => {
  if (person.roles.length < 2) return
  const source = person.primaryGroup
  Object.values(person.groups).forEach((group) => {
    if (group === source) return
    group.fields?.forEach((targetField) => {
      const sourceField = representativeField(source, representativeFieldSuffix(targetField.field_key))
      if (!sourceField) return
      const isUboOwnership = targetField.field_key === 'ubo_ownership_percentage'
      const sourceOwnershipMissing = sourceField.field_value === null
        || sourceField.field_value === undefined
        || sourceField.field_value === ''
        || Number(sourceField.field_value) === 0
      targetField.field_value = isUboOwnership && sourceOwnershipMissing
        ? 25
        : cloneFieldValue(sourceField.field_value)
      targetField.field_label = cloneFieldValue(sourceField.field_label)
    })
  })
}
const syncRepresentativeStepFields = (step) => {
  representativePeople(step).forEach(syncRepresentativePersonFields)
}
const nextRepresentativeFrontKey = (step, role, preferredFrontKey) => {
  const keys = (step.groups || [])
    .filter((group) => group.group_key === role)
    .map((group) => Number(group.front_key || 0))
  const preferred = Number(preferredFrontKey)
  if (Number.isInteger(preferred) && preferred >= 0 && !keys.includes(preferred)) {
    return preferred
  }
  return keys.length > 0 ? Math.max(...keys) + 1 : 0
}
const nextRepresentativePersonOrder = (step) => {
  const orders = (step.groups || [])
    .map((group) => Number(group.__representativeOrder))
    .filter((order) => Number.isInteger(order) && order >= 0)
  return orders.length > 0 ? Math.max(...orders) + 1 : representativePeople(step).length
}
const createRepresentativeGroup = (step, role, sourceGroup, preferredFrontKey, copyValues = true) => {
  const liveTemplate = step.groups?.find((group) => group.group_key === role)
  const template = liveTemplate || representativeGroupTemplates[role]
  if (!template) return null
  const newGroup = cloneData(template)
  delete newGroup.__representativePersonKey
  delete newGroup.__representativeOrder
  newGroup.front_key = nextRepresentativeFrontKey(step, role, preferredFrontKey)
  newGroup.hidden = false
  newGroup.__representativeSelected = true
  newGroup.fields = newGroup.fields.map((field) => {
    const sourceField = copyValues
      ? representativeField(sourceGroup, representativeFieldSuffix(field.field_key))
      : null
    const defaultValue = configuredFieldDefault(field)
    const sourceIsEmpty = sourceField?.field_value === null
      || sourceField?.field_value === undefined
      || sourceField?.field_value === ''
      || (field.field_key === 'ubo_ownership_percentage' && Number(sourceField?.field_value) === 0)
    return {
      ...field,
      field_value: sourceField && !sourceIsEmpty
        ? cloneFieldValue(sourceField.field_value)
        : (defaultValue === undefined ? null : defaultValue),
      field_label: sourceField ? cloneFieldValue(sourceField.field_label) : null,
    }
  })
  const reusedSlots = new Set(newGroup.fields.map((field) => getFieldSlotKey({
    field_key: field.field_key,
    front_key: newGroup.front_key,
  })))
  deletedFields.value = deletedFields.value.filter((field) => !reusedSlots.has(getFieldSlotKey(field)))
  return newGroup
}
const removeRepresentativeGroup = (step, group) => {
  group.fields?.forEach((field) => {
    deletedFields.value.push(getFieldData(field, group, false))
  })
  const index = step.groups.indexOf(group)
  if (index >= 0) step.groups.splice(index, 1)
}
const toggleRepresentativeRole = async (step, person, role) => {
  if (person.roles.includes(role)) {
    if (person.roles.length === 1) {
      message(t('validate.required', { field: t('certify.personnelRolesLabel') }), 'warning')
      return
    }
    Object.entries(person.groups).forEach(([personRole, group]) => {
      if (personRole !== role) group.__representativeSelected = true
    })
    removeRepresentativeGroup(step, person.groups[role])
  } else {
    const personKey = Object.values(person.groups).find(
      (group) => group.__representativePersonKey,
    )?.__representativePersonKey || createRepresentativePersonKey()
    const personOrder = representativePersonOrder(person)
    Object.values(person.groups).forEach((group) => {
      group.__representativeSelected = true
      group.__representativePersonKey = personKey
      group.__representativeOrder = personOrder
    })
    const newGroup = createRepresentativeGroup(
      step,
      role,
      person.primaryGroup,
      person.primaryGroup.front_key,
    )
    if (!newGroup) {
      message(t('certify.operationFailed'), 'error')
      return
    }
    newGroup.__representativePersonKey = personKey
    newGroup.__representativeOrder = personOrder
    const sourceIndex = step.groups.indexOf(person.primaryGroup)
    step.groups.splice(sourceIndex + 1, 0, newGroup)
  }
  syncRepresentativeStepFields(step)
  syncFieldSnapshots()
  cacheCurrentState()
  await nextTick()
  formRef.value?.clearValidate?.()
}
const canShowAddRepresentativePerson = (step) => {
  return (step.groups || []).some((group) => (
    REPRESENTATIVE_ROLE_ORDER.includes(group.group_key) && group.is_add
  ))
}
const isRepresentativePersonComplete = (person) => {
  if (!person?.roles?.length) return false
  return (person.primaryGroup?.fields || []).every((field) => {
    if (!isVisible(field, person.primaryGroup)) return true
    if (field.is_required === 1 && !hasValue(field.field_value)) return false
    return isFieldFormatValid(field)
  })
}
const canAddRepresentativePerson = (step) => {
  const people = representativePeople(step)
  return people.length > 0 && people.every(isRepresentativePersonComplete)
}
const addRepresentativePerson = (step) => {
  if (!canAddRepresentativePerson(step)) {
    message(t('certify.personnelCorrectionRequired'), 'warning')
    return
  }
  const people = representativePeople(step)
  people.forEach((person) => {
    Object.values(person.groups).forEach((group) => {
      group.__representativeSelected = true
    })
  })
  const lastPerson = people[people.length - 1]
  const preferredRole = lastPerson?.roles?.[0] || 'ubo_info'
  const sourceGroup = lastPerson?.groups?.[preferredRole]
    || step.groups?.find((group) => group.group_key === preferredRole)
  const frontKeys = (step.groups || [])
    .filter((group) => REPRESENTATIVE_ROLE_ORDER.includes(group.group_key))
    .map((group) => Number(group.front_key || 0))
  const preferredFrontKey = frontKeys.length > 0 ? Math.max(...frontKeys) + 1 : 0
  const personOrder = nextRepresentativePersonOrder(step)
  const newGroup = createRepresentativeGroup(step, preferredRole, sourceGroup, preferredFrontKey, false)
  if (!newGroup) {
    message(t('certify.operationFailed'), 'error')
    return
  }
  newGroup.__representativePersonKey = createRepresentativePersonKey()
  newGroup.__representativeOrder = personOrder
  step.groups.push(newGroup)
  syncFieldSnapshots()
  cacheCurrentState()
}
const deleteRepresentativePerson = (step, person) => {
  Object.values(person.groups).forEach((group) => removeRepresentativeGroup(step, group))
  syncFieldSnapshots()
  cacheCurrentState()
}
const getFieldSnapshotKey = (field, group) => {
  return [
    group?.group_key || '',
    group?.front_key ?? 0,
    field?.field_key || '',
  ].join('|')
}
const getFieldSnapshot = (field) => ({
  field_value: cloneFieldValue(field?.field_value),
  field_label: cloneFieldValue(field?.field_label),
})
const applyFieldSnapshot = (field, snapshot) => {
  if (!field || !snapshot) return
  field.field_value = cloneFieldValue(snapshot.field_value)
  field.field_label = cloneFieldValue(snapshot.field_label)
}
const restoreFieldSnapshot = (field, group) => {
  const snapshot = fieldValueSnapshots.value[getFieldSnapshotKey(field, group)]
  if (!snapshot) return
  applyFieldSnapshot(field, snapshot)
}
const restoreFieldSnapshots = (items) => {
  items.forEach(({ child, group }) => {
    restoreFieldSnapshot(child, group)
  })
}
const syncFieldSnapshots = () => {
  const snapshots = {}
  stepData.value.forEach((step) => {
    step.groups?.forEach((group) => {
      group.fields?.forEach((field) => {
        snapshots[getFieldSnapshotKey(field, group)] = getFieldSnapshot(field)
      })
    })
  })
  fieldValueSnapshots.value = snapshots
}

const isMobileLayout = () => mobileMedia?.matches ?? window.innerWidth <= 768

const getCacheKey = () => {
  const certification = props.data?.certification || {}
  return certification.id || certification.uid || 'business-verification-draft'
}

const getServerVersion = (data = props.data) => {
  const certification = data?.certification || {}
  // 服务端版本用于识别跨设备或其他页面的草稿更新，优先兼容后端可能返回的 version/revision。
  return certification.version || certification.revision || certification.updated_at || ''
}

const getCacheFingerprint = (serverVersion = currentServerVersion.value || getServerVersion()) => {
  const certification = props.data?.certification || {}
  return [
    certification.id || '',
    certification.uid || '',
    certification.status || '',
    certification.application_status || '',
    certification.renewal_started_at || '',
    certification.created_at || '',
    serverVersion,
  ].join('|')
}

const getResponseServerVersion = (res) => {
  const certification = res?.certification || {}
  return res?.version || res?.revision || res?.updated_at || certification.version || certification.revision || certification.updated_at || ''
}

const getCacheStorageKey = () => `business-verification-cache:${getCacheKey()}`

const readStorageCache = () => {
  try {
    const cache = sessionStorage.getItem(getCacheStorageKey())
    return cache ? JSON.parse(cache) : null
  } catch {
    return null
  }
}

const writeStorageCache = (cache) => {
  try {
    sessionStorage.setItem(getCacheStorageKey(), JSON.stringify(cache))
  } catch {
  }
}

const clearStorageCache = () => {
  try {
    sessionStorage.removeItem(getCacheStorageKey())
  } catch {
  }
}

const cacheCurrentState = () => {
  if (!cacheEnabled) return
  if (!stepData.value.length) return
  const cache = {
    schemaVersion: BUSINESS_VERIFICATION_CACHE_SCHEMA,
    fingerprint: getCacheFingerprint(),
    serverVersion: currentServerVersion.value || getServerVersion(),
    stepValue: stepValue.value,
    // 上传文件的签名 URL 也需要缓存，避免当前页面恢复草稿后上传预览丢失。
    stepData: cloneData(stepData.value),
    deletedFields: cloneData(deletedFields.value),
    stepDraftSnapshots: cloneData(stepDraftSnapshots.value),
  }
  businessVerificationCache[getCacheKey()] = cache
  writeStorageCache(cache)
}

const clearCurrentCache = () => {
  cacheEnabled = false
  delete businessVerificationCache[getCacheKey()]
  clearStorageCache()
}

const dropCurrentCache = () => {
  delete businessVerificationCache[getCacheKey()]
  clearStorageCache()
}

const isCurrentServerCache = (cache) => {
  // 只有缓存版本与当前接口版本完全一致时才恢复缓存，避免跨设备旧草稿覆盖服务端最新数据。
  return Boolean(
    cache?.schemaVersion === BUSINESS_VERIFICATION_CACHE_SCHEMA
    && cache?.stepData?.length
    && cache.serverVersion === currentServerVersion.value
    && cache.fingerprint === getCacheFingerprint(currentServerVersion.value)
  )
}

const scheduleCacheCurrentState = () => {
  if (!cacheEnabled) return
  if (!stepData.value.length) return
  if (cacheTimer) {
    clearTimeout(cacheTimer)
  }
  cacheTimer = setTimeout(() => {
    cacheCurrentState()
    cacheTimer = null
  }, 100)
}

const normalizeRecognition = (source = {}) => {
  const certification = props.data?.certification || {}
  return {
    request_id: source.request_id || certification.ai_extraction_request_id || '',
    status: source.status || certification.ai_extraction_status || 'NotStarted',
    fill_mode: source.fill_mode || certification.ai_extraction_fill_mode || 'Auto',
    files: Array.isArray(source.files) ? source.files : [],
    summary: source.summary || {
      file_count: 0,
      field_count: 0,
      person_count: 0,
    },
    error: source.error || null,
    business_validation: source.business_validation || null,
    extracted_at: source.extracted_at || certification.ai_extracted_at || '',
    skipped_at: source.skipped_at || certification.ai_extraction_skipped_at || '',
    can_continue: Boolean(source.can_continue),
  }
}

const stopRecognitionPolling = () => {
  if (recognitionPollTimer) {
    clearTimeout(recognitionPollTimer)
    recognitionPollTimer = null
  }
  recognitionPolling = false
}

const shouldPollRecognition = () => {
  return recognitionPollingActive
    && recognitionGateVisible.value
    && recognitionFillMode.value === 'Auto'
    && ['Pending', 'Processing', 'Normalizing'].includes(recognitionStatus.value)
}

const pollRecognitionStatus = async () => {
  if (recognitionPolling || !shouldPollRecognition()) return
  recognitionPolling = true
  try {
    const res = await getApi('/user/certifications/getCompanyExtractionStatus')
    recognition.value = normalizeRecognition(res)
  } catch {
    // A transient polling failure must not eject the user from the recognition
    // page. The next poll can recover without showing repeated toast errors.
  } finally {
    recognitionPolling = false
  }
  if (shouldPollRecognition()) {
    recognitionPollTimer = setTimeout(pollRecognitionStatus, 2500)
  } else {
    stopRecognitionPolling()
  }
}

const startRecognitionPolling = () => {
  stopRecognitionPolling()
  if (shouldPollRecognition()) {
    recognitionPollTimer = setTimeout(pollRecognitionStatus, 600)
  }
}

const syncRecognitionState = () => {
  const nextRecognition = normalizeRecognition(props.data?.recognition || {})
  acknowledgedRecognitionRequestId.value = getAcknowledgedRecognitionId()
  if (nextRecognition.request_id !== recognition.value?.request_id) {
    recognitionDismissedRequestId.value = ''
  }
  recognition.value = nextRecognition
  const active = ['Pending', 'Processing', 'Normalizing'].includes(nextRecognition.status)
  const failed = nextRecognition.status === 'Failed'
  const completedNeedsReview = nextRecognition.status === 'Completed'
    && nextRecognition.fill_mode === 'Auto'
    && (
      Boolean(nextRecognition.business_validation?.blocking)
      || acknowledgedRecognitionRequestId.value !== nextRecognition.request_id
    )
  const dismissed = nextRecognition.request_id !== ''
    && recognitionDismissedRequestId.value === nextRecognition.request_id
  recognitionGateVisible.value = nextRecognition.fill_mode === 'Auto'
    && !dismissed
    && (active || failed || completedNeedsReview)
  if (recognitionGateVisible.value) {
    stepValue.value = Math.max(documentStepIndex.value, 0)
    recognitionDocumentsCollapsed.value = true
    startRecognitionPolling()
  } else {
    stopRecognitionPolling()
  }
}

const getInfo = () => {
  cacheEnabled = true
  loading.value = true
  currentServerVersion.value = getServerVersion()
  currentConfigVersion.value = props.data?.config_version_id || ''
  const cache = businessVerificationCache[getCacheKey()] || readStorageCache()
  if (isCurrentServerCache(cache)) {
    stepData.value = cloneData(cache.stepData)
    applyConfiguredFieldDefaults(stepData.value)
    deletedFields.value = cloneData(cache.deletedFields)
    stepDraftSnapshots.value = cloneData(cache.stepDraftSnapshots)
    stepValue.value = Number(cache.stepValue || 0)
  } else {
    // 版本不一致说明其他设备或页面已保存过，丢弃本地缓存并以接口数据为准。
    dropCurrentCache()
    stepData.value = cloneData(props.data?.steps)
    applyConfiguredFieldDefaults(stepData.value)
    deletedFields.value = []
    stepDraftSnapshots.value = {}
    stepData.value.forEach((step) => {
      setStepDraftSnapshot(step)
    })
  }
  syncRepresentativeGroupTemplates(stepData.value, props.data?.steps)
  ensureRepresentativePersonKeys(stepData.value)
  syncFieldSnapshots()
  if (stepValue.value > stepData.value.length - 1) {
    stepValue.value = 0
  }
  const preferredStepKey = props.data?.preferred_step_key
  if (preferredStepKey) {
    const preferredIndex = stepData.value.findIndex((step) => step.step_key === preferredStepKey)
    if (preferredIndex >= 0) {
      stepValue.value = preferredIndex
    }
  }
  syncRecognitionState()
  cacheCurrentState()
  loading.value = false
}

const fieldRows = computed(() => {
  const rows = []
  stepData.value.forEach((step) => {
    step.groups?.forEach((group) => {
      group.fields?.forEach((field) => {
        rows.push({
          ...field,
          front_key: group.front_key ?? 0,
          group_key: group.group_key,
        })
      })
    })
  })
  return rows
})

const getParentField = (row, group) => {
  if (!row?.relation_id) return null
  return fieldRows.value.find((field) => {
    if (field.id !== row.relation_id) return false
    if ((field.front_key ?? 0) === (group?.front_key ?? 0)) return true
    return (field.front_key ?? 0) === 0
  })
}

const matchRelationValue = (parentValue, relationValue) => {
  if (relationValue === null || relationValue === undefined || relationValue === '') return true
  const values = String(relationValue).split(',').map((item) => item.trim())
  if (Array.isArray(parentValue)) {
    return parentValue.some((item) => values.includes(String(item)))
  }
  return values.includes(String(parentValue ?? ''))
}

const isVisible = (row, group) => {
  if (!row?.relation_id || Number(row.relation_id) <= 0) return true
  const parent = getParentField(row, group)
  if (!parent) return true
  return matchRelationValue(parent.field_value, row.option_relation_value)
}

const getVisibleFields = (step) => {
  const fields = []
  step.groups?.forEach((group) => {
    if (!isSelectedRepresentativeGroup(step, group)) return
    if (!isVisible(group, group)) return
    group.fields?.forEach((field) => {
      if (isVisible(field, group)) {
        fields.push(field)
      }
    })
  })
  return fields
}

const hasValue = (value) => {
  if (Array.isArray(value)) {
    return value.length > 0 && value.every((item) => item !== null && item !== undefined && String(item).trim() !== '')
  }
  return value !== null && value !== undefined && String(value).trim() !== ''
}

const isFieldFormatValid = (field) => {
  const value = field?.field_value
  if (!hasValue(value)) return true
  if (field?.field_type === 'number') {
    const numericValue = Number(value)
    const min = Number(field?.attrs?.min ?? Number.NEGATIVE_INFINITY)
    const max = Number(field?.attrs?.max ?? Number.POSITIVE_INFINITY)
    if (!Number.isFinite(numericValue) || numericValue < min || numericValue > max) {
      return false
    }
  }
  const regexType = field?.attrs?.regex_type
  if (!regexType) return true
  return regexFun(String(value).trim(), regexType, field?.attrs?.regex)
}

const stepStats = (step) => {
  const visibleFields = getVisibleFields(step)
  const requiredFields = visibleFields.filter((field) => field.is_required === 1)
  const completedCount = requiredFields.filter((field) => hasValue(field.field_value)).length
  const hasInvalidField = visibleFields.some((field) => !isFieldFormatValid(field))
  return {
    requiredCount: requiredFields.length,
    completedCount,
    isComplete: requiredFields.length === completedCount && !hasInvalidField,
  }
}

const stepTips = (step) => {
  const stats = stepStats(step)
  if (stats.isComplete) return t('certify.stepCompleted')
  return `${stats.completedCount}/${stats.requiredCount}`
}

const stepStatus = (step, index) => {
  if (stepStats(step).isComplete) return 'finish'
  return index === stepValue.value ? 'process' : 'wait'
}

const progressPercent = computed(() => {
  const stats = stepData.value.reduce((res, step) => {
    const item = stepStats(step)
    res.requiredCount += item.requiredCount
    res.completedCount += item.completedCount
    return res
  }, { requiredCount: 0, completedCount: 0 })
  if (!stats.requiredCount) return 0
  return Math.round((stats.completedCount / stats.requiredCount) * 100)
})

const groupTitle = (group) => {
  const frontKey = Number(group.front_key || 0)
  return frontKey > 0 ? `${group.group_title} ${frontKey + 1}` : group.group_title
}

const getFieldData = (field, group, visible = true) => ({
  field_key: field.field_key,
  field_value: visible ? field.field_value : null,
  field_label: visible ? field.field_label : null,
  front_key: group.front_key ?? 0,
})

const getFieldSlotKey = (field) => `${field?.field_key || ''}:${Number(field?.front_key || 0)}`

const appendEffectiveDeletedFields = (fields) => {
  const liveSlots = new Set(fields.map(getFieldSlotKey))
  return fields.concat(
    deletedFields.value.filter((field) => !liveSlots.has(getFieldSlotKey(field)))
  )
}

const collectStepFields = (step, includeDeleted = true) => {
  if (isRepresentativeStep(step)) syncRepresentativeStepFields(step)
  const data = []
  step.groups?.forEach((group) => {
    const groupVisible = (!isRepresentativeStep(step) || isSelectedRepresentativeGroup(step, group))
      && isVisible(group, group)
    group.fields?.forEach((field) => {
      data.push(getFieldData(field, group, groupVisible && isVisible(field, group)))
    })
  })
  return includeDeleted ? appendEffectiveDeletedFields(data) : data
}

const collectAllFields = () => appendEffectiveDeletedFields(
  stepData.value.flatMap((step) => collectStepFields(step, false))
)

const getStepSnapshotKey = (step) => step?.step_key || ''

const setStepDraftSnapshot = (step) => {
  const key = getStepSnapshotKey(step)
  if (!key) return
  stepDraftSnapshots.value[key] = stableStringify(collectStepFields(step, false))
}

const setStepDraftSnapshotFromData = (step, data) => {
  const key = getStepSnapshotKey(step)
  if (!key) return
  stepDraftSnapshots.value[key] = stableStringify(data || [])
}

const hasStepChanged = (step) => {
  const key = getStepSnapshotKey(step)
  if (!key) return true
  if (deletedFields.value.length > 0) return true
  return stepDraftSnapshots.value[key] !== stableStringify(collectStepFields(step, false))
}

const fieldProp = (stepIndex, groupIndex, fieldIndex) => {
  return `steps.${stepIndex}.groups.${groupIndex}.fields.${fieldIndex}.field_value`
}

const scrollToFirstError = async () => {
  await nextTick()
  const errorItem = enterpriseRef.value?.querySelector('.ivu-form-item-error')
  if (!errorItem) return
  errorItem.scrollIntoView({
    behavior: 'smooth',
    block: 'center',
  })
  const focusTarget = errorItem.querySelector(
    'input:not([disabled]), textarea:not([disabled]), button:not([disabled]), [tabindex]:not([tabindex="-1"])'
  )
  focusTarget?.focus({ preventScroll: true })
}

const scrollToStepTop = async () => {
  if (!isMobileLayout()) return
  await nextTick()
  const scrollContainer = enterpriseRef.value?.closest('.app-phone-body')
  scrollContainer?.scrollTo({
    top: 0,
    behavior: 'smooth',
  })
}

const validateCurrentForm = async (required = true) => {
  validateRequired.value = required
  const currentStep = stepData.value[stepValue.value]
  if (isRepresentativeStep(currentStep)) syncRepresentativeStepFields(currentStep)
  if (required && isRepresentativeStep(currentStep)) {
    const incompleteGroup = currentStep.groups?.find((group) => {
      if (!isSelectedRepresentativeGroup(currentStep, group)) return false
      if (!isVisible(group, group)) return false
      return group.fields?.some((field) => {
        if (!isVisible(field, group)) return false
        return (field.is_required === 1 && !hasValue(field.field_value)) || !isFieldFormatValid(field)
      })
    })
    const person = representativePeople(currentStep).find((item) => (
      Object.values(item.groups).includes(incompleteGroup)
    ))
    if (person) setRepresentativePersonCollapsed(person, false)
  }
  await nextTick()
  const valid = formRef.value ? await formRef.value.validate() : true
  validateRequired.value = true
  if (!valid) {
    scrollToFirstError()
  }
  return valid
}

const firstIncompleteField = (step) => {
  for (const group of step?.groups || []) {
    if (!isSelectedRepresentativeGroup(step, group)) continue
    if (!isVisible(group, group)) continue
    const field = group.fields?.find((item) => {
      if (!isVisible(item, group)) return false
      return (item.is_required === 1 && !hasValue(item.field_value)) || !isFieldFormatValid(item)
    })
    if (field) return { group, field }
  }
  return null
}

const firstIncompleteStepIndex = () => stepData.value.findIndex((step) => (
  !isDocumentStep(step) && Boolean(firstIncompleteField(step))
))

const revealIncompleteField = (step) => {
  const incomplete = firstIncompleteField(step)
  if (!incomplete) return false
  incomplete.group.hidden = false
  if (isRepresentativeStep(step)) {
    const person = representativePeople(step).find((item) => (
      Object.values(item.groups).includes(incomplete.group)
    ))
    if (person) setRepresentativePersonCollapsed(person, false)
  }
  return true
}

const postSubmitFields = async (step, certificationStatus = 'Draft', data, options = {}) => {
  const pendingKey = `${step?.step_key || ''}_${certificationStatus}_${options.triggerExtraction ? 'recognition' : 'save'}`
  if (submitFieldsPending[pendingKey]) {
    return submitFieldsPending[pendingKey]
  }
  const submittedData = data || collectStepFields(step)
  const submittedSnapshotData = collectStepFields(step, false)
  loading.value = true
  submitFieldsPending[pendingKey] = (async () => {
    try {
      const res = await postApi('/user/certifications/submitFields', {
        data: submittedData,
        step_key: step?.step_key,
        certificationStatus,
        config_version_id: currentConfigVersion.value || props.data?.config_version_id,
        serverVersion: currentServerVersion.value || getServerVersion(),
        trigger_extraction: Boolean(options.triggerExtraction),
      })
      currentServerVersion.value = getResponseServerVersion(res) || currentServerVersion.value
      deletedFields.value = []
      setStepDraftSnapshotFromData(step, submittedSnapshotData)
      if (certificationStatus === 'Pending') {
        clearCurrentCache()
      } else {
        cacheCurrentState()
      }
      return res
    } catch (err) {
      message(err?.msg || err || t('certify.operationFailed'), 'error')
      return false
    } finally {
      delete submitFieldsPending[pendingKey]
      loading.value = Object.keys(submitFieldsPending).length > 0
    }
  })()
  return submitFieldsPending[pendingKey]
}

const startRecognition = async (step) => {
  const res = await postSubmitFields(step, 'Draft', undefined, { triggerExtraction: true })
  if (!res) return false
  recognitionDismissedRequestId.value = ''
  recognition.value = normalizeRecognition(res.recognition || {})
  recognitionGateVisible.value = true
  recognitionDocumentsCollapsed.value = true
  stepValue.value = Math.max(documentStepIndex.value, 0)
  cacheCurrentState()
  startRecognitionPolling()
  await scrollToStepTop()
  return true
}

const backToDocuments = async () => {
  recognitionDismissedRequestId.value = recognitionRequestId.value
  stopRecognitionPolling()
  recognitionGateVisible.value = false
  recognitionDocumentsCollapsed.value = false
  if (!activateDocumentStep()) {
    recognitionGateVisible.value = true
    recognitionDocumentsCollapsed.value = true
    startRecognitionPolling()
    message(t('certify.companyDocumentsUnavailable'), 'error')
    return
  }
  cacheCurrentState()
  await nextTick()
  await scrollToStepTop()
}

const retryRecognition = async () => {
  recognitionActionLoading.value = true
  try {
    const res = await postApi('/user/certifications/retryCompanyExtraction')
    recognitionDismissedRequestId.value = ''
    recognition.value = normalizeRecognition(res)
    recognitionGateVisible.value = true
    recognitionDocumentsCollapsed.value = true
    startRecognitionPolling()
  } catch (err) {
    message(err?.msg || err || t('certify.operationFailed'), 'error')
  } finally {
    recognitionActionLoading.value = false
  }
}

const enableRecognition = async (step) => {
  if (!isDocumentStep(step) || recognitionActionLoading.value || loading.value) return
  if (!await validateCurrentForm(true)) return
  const confirmed = await confirm(t('certify.recognitionRestartConfirmContent'), {
    title: t('certify.recognitionRestartConfirmTitle'),
    okText: t('certify.recognitionRestartConfirm'),
    cancelText: t('button.cancel'),
    resolveCancel: true,
  })
  if (!confirmed) return
  recognitionActionLoading.value = true
  try {
    if (await startRecognition(step)) {
      message(t('certify.recognitionRestarted'))
    }
  } finally {
    recognitionActionLoading.value = false
  }
}

const skipRecognition = async () => {
  const confirmed = await confirm(t('certify.recognitionSkipConfirmContent'), {
    title: t('certify.recognitionSkipConfirmTitle'),
    okText: t('certify.recognitionConfirmSkip'),
    cancelText: t('certify.recognitionKeepWaiting'),
    resolveCancel: true,
  })
  if (!confirmed) return
  recognitionActionLoading.value = true
  try {
    const res = await postApi('/user/certifications/skipCompanyExtraction')
    recognition.value = normalizeRecognition(res)
    recognitionGateVisible.value = false
    stopRecognitionPolling()
    stepValue.value = nextStepAfterDocumentsIndex.value
    cacheCurrentState()
    message(t('certify.recognitionManualModeEnabled'))
    await scrollToStepTop()
  } catch (err) {
    message(err?.msg || err || t('certify.operationFailed'), 'error')
  } finally {
    recognitionActionLoading.value = false
  }
}

const continueFromRecognition = async () => {
  if (recognitionStatus.value !== 'Completed' || recognitionBusinessBlocked.value) return
  recognitionActionLoading.value = true
  try {
    const nextStepKey = stepData.value[nextStepAfterDocumentsIndex.value]?.step_key || ''
    const res = await getApi('/user/certifications/getFields')
    acknowledgeRecognition(recognitionRequestId.value)
    recognition.value = normalizeRecognition(res?.recognition || recognition.value)
    recognitionGateVisible.value = false
    stopRecognitionPolling()
    replaceResolvedSteps(res, nextStepKey)
    const incompleteStepIndex = firstIncompleteStepIndex()
    stepValue.value = incompleteStepIndex >= 0
      ? incompleteStepIndex
      : nextStepAfterDocumentsIndex.value
    const hasIncompleteField = revealIncompleteField(stepData.value[stepValue.value])
    cacheCurrentState()
    message(t('certify.recognitionResultFilled'))
    if (hasIncompleteField) {
      await nextTick()
      await validateCurrentForm(true)
    } else {
      await scrollToStepTop()
    }
  } catch (err) {
    message(err?.msg || err || t('certify.operationFailed'), 'error')
  } finally {
    recognitionActionLoading.value = false
  }
}

const saveCurrentStep = async () => {
  const step = stepData.value[stepValue.value]
  if (!step) return
  if (!await validateCurrentForm(false)) return
  const success = await postSubmitFields(step)
  if (success) {
    message(t('certify.draftSaved'))
    emits('handleSubmit', { preserveStepKey: step.step_key })
  }
}

const changeStep = async (index, needValidate = true) => {
  if (index < 0 || index > stepData.value.length - 1 || index === stepValue.value) return
  const currentStep = stepData.value[stepValue.value]
  const targetStep = stepData.value[index]
  if (recognitionGateVisible.value && !isDocumentStep(targetStep)) {
    message(recognitionStepLockedMessage.value, 'warning')
    return
  }
  if (isDocumentStep(currentStep) && !isDocumentStep(targetStep)) {
    if (needValidate && currentStep && !await validateCurrentForm(true)) return
    if (recognitionFillMode.value !== 'Manual') {
      if (hasStepChanged(currentStep)) {
        await startRecognition(currentStep)
        return
      }
      if (recognitionStatus.value === 'Completed' && !canAccessLaterSteps.value) {
        recognitionDismissedRequestId.value = ''
        recognitionGateVisible.value = true
        recognitionDocumentsCollapsed.value = true
        cacheCurrentState()
        await scrollToStepTop()
        return
      }
      if (!canAccessLaterSteps.value) {
        await startRecognition(currentStep)
        return
      }
    }
  } else if (!isDocumentStep(targetStep) && !canAccessLaterSteps.value) {
    message(recognitionStepLockedMessage.value, 'warning')
    return
  }
  let saved = false
  if (needValidate && !isDocumentStep(currentStep) && currentStep && !await validateCurrentForm(true)) return
  if (currentStep && hasStepChanged(currentStep)) {
    const success = await postSubmitFields(currentStep)
    if (!success) return
    saved = true
  }
  stepValue.value = index
  cacheCurrentState()
  if (saved) {
    emits('handleSubmit', { preserveStepKey: stepData.value[index]?.step_key })
  }
  await scrollToStepTop()
}

const handleStepClick = (index) => {
  const targetStep = stepData.value[index]
  if (recognitionGateVisible.value && !isDocumentStep(targetStep)) {
    message(recognitionStepLockedMessage.value, 'warning')
    return
  }
  changeStep(index, index > stepValue.value)
}

const getResolvedRulesSignature = (steps = stepData.value) => {
  const rules = []
  steps.forEach((step) => {
    step.groups?.forEach((group) => {
      group.fields?.forEach((field) => {
        rules.push([
          step.step_key || '',
          group.group_key || '',
          group.front_key ?? 0,
          field.id || '',
          field.field_key || '',
          Number(field.is_required || 0),
          field.relation_id || '',
          field.option_relation_value ?? '',
        ].join('|'))
      })
    })
  })
  return rules.sort().join('\n')
}

const replaceResolvedSteps = (res, preferredStepKey = '') => {
  stepData.value = cloneData(res?.steps)
  applyConfiguredFieldDefaults(stepData.value)
  currentServerVersion.value = getResponseServerVersion(res) || currentServerVersion.value
  currentConfigVersion.value = res?.config_version_id || currentConfigVersion.value
  deletedFields.value = []
  stepDraftSnapshots.value = {}
  stepData.value.forEach((step) => {
    setStepDraftSnapshot(step)
  })
  syncRepresentativeGroupTemplates(stepData.value, res?.steps)
  ensureRepresentativePersonKeys(stepData.value)
  syncFieldSnapshots()
  const preferredIndex = stepData.value.findIndex((step) => step.step_key === preferredStepKey)
  stepValue.value = preferredIndex >= 0 ? preferredIndex : Math.min(stepValue.value, Math.max(stepData.value.length - 1, 0))
  cacheCurrentState()
}

const refreshDynamicRulesBeforeSubmit = async () => {
  const currentStep = stepData.value[stepValue.value]
  const preferredStepKey = currentStep?.step_key || ''
  const previousRules = getResolvedRulesSignature()
  const saved = await postSubmitFields(currentStep, 'Draft', collectAllFields())
  if (!saved) return false

  loading.value = true
  try {
    const res = await getApi('/user/certifications/getFields')
    const latestSteps = cloneData(res?.steps)
    const rulesChanged = previousRules !== getResolvedRulesSignature(latestSteps)
    replaceResolvedSteps(res, preferredStepKey)
    if (!rulesChanged) return true

    const incompleteIndex = stepData.value.findIndex((step) => !stepStats(step).isComplete)
    if (incompleteIndex >= 0) {
      stepValue.value = incompleteIndex
      message(t(isRenewal.value ? 'certify.renewalRulesUpdated' : 'certify.complianceRulesUpdated'), 'warning')
      await scrollToStepTop()
      return false
    }
    return true
  } catch (err) {
    message(err?.msg || err || t('certify.operationFailed'), 'error')
    return false
  } finally {
    loading.value = false
  }
}

const submitCertification = async () => {
  if (submitting.value) return
  for (let index = 0; index < stepData.value.length; index += 1) {
    stepValue.value = index
    await nextTick()
    if (!await validateCurrentForm(true)) return
  }
  if (!await refreshDynamicRulesBeforeSubmit()) return
  const confirmed = await confirm(t('certify.submitBusinessConfirm'), {
    title: t('certify.submitCertification'),
    resolveCancel: true,
  })
  if (!confirmed) return

  const submissionData = collectAllFields()
  submitting.value = true
  await nextTick()
  try {
    const success = await postSubmitFields(stepData.value[stepValue.value], 'Pending', submissionData)
    if (success) {
      message(t('certify.certificationSubmitted'))
      emits('handleSubmit')
    }
  } finally {
    submitting.value = false
  }
}

const resetChildren = (field, group) => {
  const children = getResettableChildren(field, group)
  children.forEach(({ child }) => {
    child.field_value = null
    child.field_label = null
  })
}

const getResettableChildren = (field, group) => {
  const childKeys = field.attrs?.children_field_key
  if (!childKeys) return []
  const keys = childKeys.split(',').map((item) => item.trim()).filter(Boolean)
  const children = []
  stepData.value.forEach((step) => {
    step.groups?.forEach((item) => {
      item.fields?.forEach((child) => {
        if (!keys.includes(child.field_key)) return
        if (item.group_key && group.group_key && item.group_key !== group.group_key) return
        if ((item.front_key ?? 0) !== (group.front_key ?? 0) && item.group_key === group.group_key) return
        children.push({ child, group: item })
      })
    })
  })
  return children
}

const getFilledResettableChildren = (field, group) => {
  return getResettableChildren(field, group).filter(({ child }) => {
    return hasValue(child.field_value) || hasValue(child.field_label)
  })
}

const getResetChildrenText = (children) => {
  const names = [...new Set(children.map(({ child }) => child.label || child.field_label || child.field_key).filter(Boolean))]
  if (names.length === 0) return t('certify.relatedInformation')
  const visibleNames = names.slice(0, 8)
  const moreText = names.length > visibleNames.length ? t('certify.moreItems', { count: names.length }) : ''
  return `${visibleNames.join(t('certify.fieldListSeparator'))}${moreText ? ` ${moreText}` : ''}`
}

const confirmResetChildren = (children) => {
  const resetText = getResetChildrenText(children)
  return confirm(t('certify.changeOptionResetConfirm', {
    fields: `<span class='text-msg'>${resetText}</span>`,
  }), {
    title: t('certify.changeOptionConfirmTitle'),
    okText: t('certify.continueChange'),
    cancelText: t('button.cancel'),
    resolveCancel: true,
  })
}

const switchRegistrationCountry = async (field, group, resetItems = []) => {
  const previousSnapshot = fieldValueSnapshots.value[getFieldSnapshotKey(field, group)]
  countrySwitching.value = true
  loading.value = true
  dropCurrentCache()
  try {
    const saveResult = await postApi('/user/certifications/submitFields', {
      data: [getFieldData(field, group, true)],
      step_key: 'SupportingDocuments',
      certificationStatus: 'Draft',
      config_version_id: currentConfigVersion.value || props.data?.config_version_id,
      serverVersion: currentServerVersion.value || getServerVersion(),
    })
    currentServerVersion.value = getResponseServerVersion(saveResult) || currentServerVersion.value
    const resolved = await getApi('/user/certifications/getFields')
    replaceResolvedSteps(resolved, 'SupportingDocuments')
    message(t('certify.countryRulesUpdated'))
    return true
  } catch (err) {
    applyFieldSnapshot(field, previousSnapshot)
    restoreFieldSnapshots(resetItems)
    syncFieldSnapshots()
    cacheCurrentState()
    message(err?.msg || err || t('certify.operationFailed'), 'error')
    return false
  } finally {
    countrySwitching.value = false
    loading.value = false
  }
}

const handleFieldChange = async (field, group) => {
  const filledChildren = getFilledResettableChildren(field, group)
  if (filledChildren.length > 0) {
    const pendingFieldSnapshot = getFieldSnapshot(field)
    restoreFieldSnapshot(field, group)
    restoreFieldSnapshots(filledChildren)
    await nextTick()
    const confirmed = await confirmResetChildren(filledChildren)
    if (!confirmed) {
      cacheCurrentState()
      return
    }
    applyFieldSnapshot(field, pendingFieldSnapshot)
  }
  resetChildren(field, group)
  const representativeStep = stepData.value.find((step) => isRepresentativeStep(step) && step.groups?.includes(group))
  if (representativeStep) {
    const person = representativePeople(representativeStep).find((item) => Object.values(item.groups).includes(group))
    if (person) syncRepresentativePersonFields(person, group)
  }
  if (field.field_key === 'reg_country') {
    const switched = await switchRegistrationCountry(field, group, filledChildren)
    if (!switched) return
    emits('on-change', field, group)
    return
  }
  syncFieldSnapshots()
  cacheCurrentState()
  emits('on-change', field, group)
}

const showGroupActions = (groups, group) => {
  if (!group.is_add) return false
  const sameGroups = groups.filter((item) => item.group_key === group.group_key)
  return sameGroups[sameGroups.length - 1] === group
}

const addGroup = (groups, group, groupIndex) => {
  const sameGroups = groups.filter((item) => item.group_key === group.group_key)
  const nextFrontKey = Math.max(...sameGroups.map((item) => Number(item.front_key || 0))) + 1
  const newGroup = cloneData(group)
  newGroup.front_key = nextFrontKey
  newGroup.hidden = false
  newGroup.fields = newGroup.fields.map((field) => {
    const defaultValue = configuredFieldDefault(field)
    return {
      ...field,
      field_value: defaultValue === undefined ? null : defaultValue,
      field_label: null,
    }
  })
  const reusedSlots = new Set(
    newGroup.fields.map((field) => getFieldSlotKey({
      field_key: field.field_key,
      front_key: nextFrontKey,
    }))
  )
  deletedFields.value = deletedFields.value.filter(
    (field) => !reusedSlots.has(getFieldSlotKey(field))
  )
  groups.splice(groupIndex + 1, 0, newGroup)
  cacheCurrentState()
}

const deleteGroup = (groups, groupIndex) => {
  const group = groups[groupIndex]
  group.fields?.forEach((field) => {
    deletedFields.value.push(getFieldData(field, group, false))
  })
  groups.splice(groupIndex, 1)
  cacheCurrentState()
}

const handleReset = () => {
  if (!canChangeCertificationType.value) return
  emits('handleReset')
}

defineExpose({
  clearCurrentCache,
})

watch(() => props.data, () => {
  getInfo()
},{
  deep:true,
  immediate:true
})

watch(stepData, () => {
  scheduleCacheCurrentState()
}, {
  deep: true,
})

onMounted(() => {
  mobileMedia = window.matchMedia('(max-width: 768px)')
})

onBeforeUnmount(() => {
  recognitionPollingActive = false
  stopRecognitionPolling()
  if (cacheTimer) {
    clearTimeout(cacheTimer)
    cacheTimer = null
  }
  cacheCurrentState()
})
</script>

<style scoped lang="less">
.enterprise{
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
  margin:var(--ui-margin-16-auto);
  flex: 1;
  min-height: 100%;
  overflow: visible;
  display: flex;
  align-items: flex-start;
  gap:16px;
  :deep(.form-select-box-dropdown){
    z-index: calc(var(--ui-layer-tooltip) + 1);
  }
  >*{
    box-sizing: border-box;
    background: #fff;
    border-radius: var(--ui-radius-lg);
    padding: var(--ui-padding-16);
    border: 1px #eee solid;
  }
  .left{
    width: var(--ui-size-240);
    flex-shrink: 0;
    position: sticky;
    top: var(--ui-space-16);
    max-height: calc(100vh - var(--sticky-header-height, 0px) - var(--ui-space-32));
    overflow: auto;
    .thead{
      p{
        margin-top:4px;
        color: var(--ui-color-neutral-550);
        font-size: 12px;
      }
    }
    .progress-box{
      p{
        font-weight: 600;
        font-size: 12px;
      }
    }
  }
  .center{
    flex: 1;
    overflow: visible;
    min-width: 0;
    width: 100%;
    position: relative;
    .recognition-documents-summary{
      width: 100%;
      min-height: 72px;
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 16px;
      padding: 14px 16px;
      color: #1f2329;
      text-align: left;
      border: 1px solid #dfe6f3;
      border-radius: 8px;
      background: #f8faff;
      cursor: pointer;
      transition: border-color .2s ease, background-color .2s ease;

      &:hover{
        border-color: #b7c9f5;
        background: #f4f7ff;
      }

      &__icon{
        display: grid;
        place-items: center;
        flex: 0 0 40px;
        width: 40px;
        height: 40px;
        color: var(--primary-color);
        border-radius: 8px;
        background: #eaf0ff;
        font-size: 22px;
      }

      &__content{
        min-width: 0;
        flex: 1;

        strong,
        small{
          display: block;
        }

        strong{
          font-size: 14px;
        }

        small{
          margin-top: 5px;
          color: #808695;
          font-size: 12px;
        }
      }

      &__action{
        display: inline-flex;
        align-items: center;
        gap: 5px;
        flex-shrink: 0;
        color: var(--primary-color);
        font-size: 12px;
      }
    }

    .step-form-content.is-recognition-readonly{
      position: relative;
      margin-bottom: 16px;
      padding: 16px;
      border: 1px solid #e7ebf2;
      border-radius: 8px;
      background: #fff;

      &::after{
        position: absolute;
        inset: 0;
        z-index: 10;
        border-radius: inherit;
        background: rgba(255, 255, 255, .05);
        content: '';
      }

      :deep(.UploadImg .action){
        z-index: 11;
      }

      :deep(.UploadImg .action > .ivu-tooltip){
        display: none;
      }

      .footer{
        display: none;
      }
    }
    .representative-role-field{
      padding-bottom: 16px;
      border-bottom: var(--ui-border-subtle);
    }
    .representative-role-label{
      margin-bottom: 8px;
      color: var(--ui-color-text);
      font-size: 14px;
      font-weight: 600;
    }
    .representative-role-required{
      margin-right: 4px;
      color: var(--ui-color-error);
    }
    .representative-role-switcher{
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 12px;
    }
    .representative-role{
      position: relative;
      width: 100%;
      min-width: 0;
      min-height: 62px;
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 9px 12px;
      overflow: hidden;
      border: 1px solid #dfe5ef;
      border-radius: 7px;
      background: #fff;
      color: #1f2329;
      font: inherit;
      text-align: left;
      cursor: pointer;
      appearance: none;
      transition: border-color .18s ease, background-color .18s ease, box-shadow .18s ease;

      &::before{
        content: '';
        position: absolute;
        top: 0;
        bottom: 0;
        left: 0;
        width: 3px;
        background: transparent;
        transition: background-color .18s ease;
      }
      &:hover{
        border-color: #aebde2;
        background: #fbfcff;
      }
      &:focus-visible{
        outline: 3px solid rgba(43, 92, 217, .18);
        outline-offset: 2px;
      }
      &.is-active{
        border-color: var(--primary-color);
        background: #f3f6ff;
        box-shadow: 0 0 0 1px rgba(43, 92, 217, .06);

        &::before{
          background: var(--primary-color);
        }
        .representative-role__icon{
          background: var(--primary-color);
          color: #fff;
        }
        .representative-role__state{
          color: var(--primary-color);
        }
      }
      &__icon{
        width: 38px;
        height: 38px;
        flex: 0 0 38px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
        background: #eef2f8;
        color: #66748b;
        font-size: 20px;
        transition: color .18s ease, background-color .18s ease;
      }
      &__content{
        min-width: 0;
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 3px;
      }
      &__title{
        display: flex;
        align-items: center;
        gap: 7px;
        line-height: 22px;

        strong{
          font-size: 14px;
          font-weight: 600;
        }
      }
      &__required{
        margin-right: -3px;
        color: #ed4014;
        font-size: 14px;
        line-height: 1;
      }
      &__count{
        min-width: 20px;
        height: 20px;
        padding: 0 6px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        border-radius: 10px;
        background: #e8edf5;
        color: #596579;
        font-size: 12px;
        line-height: 20px;
      }
      &__description{
        overflow: hidden;
        color: #6f7b8f;
        font-size: 12px;
        line-height: 20px;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      &__state{
        flex: 0 0 auto;
        color: #9aa5b5;
        font-size: 20px;
      }
    }
    .representative-add-person{
      margin-top: 16px;
    }
    .groups-box{
      & + .groups-box{
        margin-top: 16px;
      }
      .bd{
        display: flex;
        flex-direction: column;
        gap: 16px;
      }
      .hd{
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 16px;
        padding: 0;
        border: 0;
        background: transparent;
        color: inherit;
        font: inherit;
        text-align: left;
        cursor: pointer;
        appearance: none;

        &:focus-visible{
          outline: 3px solid rgba(43, 92, 217, .18);
          outline-offset: 2px;
          border-radius: 4px;
        }
      }
      .group-heading,
      .group-toggle{
        display: flex;
        align-items: center;
      }
      .group-heading{
        min-width: 0;
        gap: 10px;
      }
      .group-toggle{
        flex-shrink: 0;
        gap: 4px;
        color: #6f7b8f;
        font-size: 12px;
        font-weight: 400;
      }
      .groups-item{
        font-size: 14px;
        font-weight: 600;
        line-height: 22px;
        color: var(--ui-color-neutral-900);
      }
      .border{
        border: var(--ui-border-subtle);
        padding:var(--ui-padding-16);
        border-radius:var(--ui-radius-md);
        :deep(.formTitle){
          font-weight: 400;
        }
      }
      .group-toggle-action{
        max-width: 100%;
        margin: 8px auto 0;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 2px;
        color: var(--primary-color);
        font-size: 12px;
        line-height: 20px;
        cursor: pointer;
        user-select: none;
        &.is-empty{
          width: 100%;
          min-height: 42px;
          margin: 0;
        }
        &:hover{
          color: #1746b8;
        }
      }
      &.is-representative-group{
        position: relative;
        z-index: 0;
        margin-bottom: 16px;
        overflow: visible;
        border: 1px solid #e3e8f2;
        border-radius: 8px;
        background: #fff;

        &:focus-within{
          z-index: 2;
        }
        .hd.representative-person-header{
          min-height: 56px;
          gap: 0;
          padding: 0 10px 0 0;
          border-radius: 7px 7px 0 0;
          border-bottom: 1px solid #edf0f5;
          background: #fafbfd;
          transition: background-color .18s ease;

          &:hover{
            background: #f6f8fc;
          }
        }
        .representative-header-toggle{
          min-width: 0;
          min-height: 56px;
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          padding: 12px 8px 12px 18px;
          border: 0;
          background: transparent;
          color: inherit;
          font: inherit;
          text-align: left;
          cursor: pointer;
          appearance: none;

          &:focus-visible{
            outline: var(--ui-outline-primary);
            outline-offset: -2px;
          }
        }
        .representative-delete{
          width: 32px;
          height: 32px;
          flex: 0 0 32px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 0;
          border: 0;
          border-radius: var(--ui-radius-sm);
          background: transparent;
          color: var(--ui-color-text-muted);
          font-size: 17px;
          cursor: pointer;

          &:hover{
            background: var(--ui-color-surface-danger-soft);
            color: var(--ui-color-error);
          }
          &:focus-visible{
            outline: var(--ui-outline-primary);
          }
        }
        .group-order{
          width: 28px;
          height: 28px;
          flex: 0 0 28px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          background: #eaf0ff;
          color: var(--primary-color);
          font-size: 12px;
          font-weight: 600;
        }
        .bd.border{
          margin: 0;
          padding: 20px;
          border: 0;
          border-radius: 0;
        }
        .group-actions{
          padding: 0 20px 20px;
        }
        &.is-collapsed{
          overflow: hidden;
          .hd{
            border-radius: 7px;
            border-bottom-color: transparent;
          }
        }
      }
    }
  }
  .step-tips{
    color:var(--ui-color-neutral-550);
    font-size:12px;
    &.complete{
      color: var(--ui-color-success);
    }
  }
  :deep(.ivu-steps-title){
    color: var(--ui-color-neutral-900);
  }
  :deep(.ivu-steps-item.is-active-step .ivu-steps-title){
    color: var(--primary-color);
  }
  :deep(.ivu-steps-item.is-active-step .ivu-steps-head-inner){
    background: var(--primary-color);
    border-color: var(--primary-color);
    color: var(--ui-color-text-inverse);
  }
  :deep(.ivu-steps-item.is-active-step .ivu-steps-head-inner .ivu-steps-icon),
  :deep(.ivu-steps-item.is-active-step .ivu-steps-head-inner .ivu-icon){
    color: var(--ui-color-text-inverse);
  }
  :deep(.ivu-steps-item){
    cursor: pointer;
  }
  :deep(.ivu-steps-item.is-step-locked){
    cursor: not-allowed;
    opacity: .58;
  }
  .group-actions,
  .footer,
  .footer-actions{
    display:flex;
    align-items:center;
    gap:8px;
  }
  .footer{
    justify-content:space-between;
  }
  .spin-icon-load{
    animation: spin-load 1s linear infinite;
  }
}
@keyframes spin-load {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
@media (max-width: 768px) {
  .enterprise{
    flex-direction: column;
    margin: 8px auto;
    padding-top: 74px;
    .left{
      display: none;
    }
    .center{
      max-width: 100%;
    }
    .mobile-progress{
      position: fixed;
      top: var(--app-phone-sticky-top, 58px);
      left: 8px;
      right: 8px;
      width: auto;
      z-index: 90;
      padding: var(--ui-padding-10-12);
      background: rgba(255, 255, 255, 0.9);
      backdrop-filter: blur(10px);
      border-radius: var(--ui-radius-lg);
      box-shadow: 0 4px 14px rgba(31, 35, 41, 0.06);
      .mobile-progress-head{
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 6px;
        color: var(--ui-color-neutral-900);
        font-size: 13px;
        font-weight: 500;
      }
      .mobile-progress-title{
        display: flex;
        align-items: center;
        gap: 8px;
      }
      .mobile-reset-text{
        margin: 0;
        padding: 0;
        border: 0;
        background: transparent;
        color: var(--primary-color);
        font: inherit;
        font-size: 12px;
        font-weight: 400;
        line-height: 20px;
        cursor: pointer;
      }
      :deep(.ivu-progress-inner){
        background-color: #eef1f5;
      }
    }
    .footer{
      align-items: center;
      flex-direction: row;
      gap: 8px;
      .ivu-btn{
        padding-left: 8px;
        padding-right: 8px;
      }
      > .ivu-btn{
        flex: 1;
        min-width: 0;
      }
      .footer-actions{
        flex: 2;
        min-width: 0;
        justify-content: stretch;
        .ivu-btn{
          flex: 1;
          min-width: 0;
        }
      }
    }
  }
}
@media (min-width: 769px) {
  .mobile-progress{
    display: none;
  }
}
</style>
