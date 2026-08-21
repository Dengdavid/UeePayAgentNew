<template>
  <section
    class="recognition-panel"
    :class="`is-${normalizedStatus.toLowerCase()}`"
    :aria-busy="isRunning"
  >
    <div class="recognition-panel__canvas">
      <div class="recognition-panel__grid" aria-hidden="true"></div>
      <div class="recognition-panel__glow" aria-hidden="true"></div>

      <div class="recognition-panel__heading">
        <div>
          <span class="recognition-panel__eyebrow">{{ $t('certify.recognitionEyebrow') }}</span>
          <h2>{{ panelTitle }}</h2>
          <p>{{ panelDescription }}</p>
        </div>
        <span v-if="normalizedStatus !== 'Completed'" class="recognition-panel__secure">
          <Icon type="ios-lock" aria-hidden="true" />
          {{ $t('certify.recognitionSecureTip') }}
        </span>
      </div>

      <div class="recognition-panel__body">
        <div class="document-scanner" aria-hidden="true">
          <div class="document-scanner__back"></div>
          <div class="document-scanner__paper">
            <Icon type="ios-document-outline" />
            <span></span>
            <span></span>
            <span class="is-short"></span>
            <i v-if="isRunning" class="document-scanner__beam"></i>
            <b v-else-if="normalizedStatus === 'Completed'" class="document-scanner__result is-success">
              <Icon type="ios-checkmark" />
            </b>
            <b v-else-if="normalizedStatus === 'Failed'" class="document-scanner__result is-error">
              <Icon type="ios-alert" />
            </b>
          </div>
          <div v-if="isRunning" class="document-scanner__orbit"></div>
        </div>

        <ol class="recognition-stages" :aria-label="$t('certify.recognitionProgress')">
          <li
            v-for="(stage, index) in stages"
            :key="stage.key"
            :class="stageClass(index)"
          >
            <span class="recognition-stages__marker">
              <Icon v-if="index < currentStage || normalizedStatus === 'Completed'" type="ios-checkmark" />
              <span v-else>{{ index + 1 }}</span>
            </span>
            <span>
              <strong>{{ stage.title }}</strong>
              <small>{{ stage.description }}</small>
            </span>
          </li>
        </ol>
      </div>

      <div
        v-if="normalizedStatus === 'Failed'"
        class="recognition-error"
        role="alert"
        aria-live="assertive"
      >
        <div class="recognition-error__title">
          <Icon type="ios-alert" aria-hidden="true" />
          <div>
            <strong>{{ $t('certify.recognitionFailedTitle') }}</strong>
            <p>
              {{ fileIssues.length
                ? $t('certify.recognitionAffectedFilesTip', { count: fileIssues.length })
                : recognition.error?.message || $t('certify.recognitionFailedDefault') }}
            </p>
          </div>
        </div>
        <ul v-if="fileIssues.length">
          <li v-for="issue in fileIssues" :key="issue.key">
            <Icon type="ios-document-outline" aria-hidden="true" />
            <div>
              <strong>{{ issue.name }}</strong>
              <p>{{ issue.message }}</p>
            </div>
          </li>
        </ul>
        <div v-else class="recognition-error__unlocated">
          <Icon type="ios-information-circle-outline" aria-hidden="true" />
          <span>{{ $t('certify.recognitionUnlocatedFileError') }}</span>
        </div>
      </div>

      <div v-else class="recognition-event" role="status" aria-live="polite">
        <span class="recognition-event__pulse" aria-hidden="true"></span>
        <span>{{ liveEvent }}</span>
      </div>
    </div>

    <div v-if="businessBlocked" class="recognition-error is-business" role="alert">
      <div class="recognition-error__title">
        <Icon type="ios-alert" aria-hidden="true" />
        <div>
          <strong>{{ $t('certify.companyIdentityConflictTitle') }}</strong>
          <p>{{ businessValidation.message || $t('certify.companyIdentityConflictMessage') }}</p>
        </div>
      </div>
      <div class="recognition-error__unlocated">
        <Icon type="ios-information-circle-outline" aria-hidden="true" />
        <span>{{ $t('certify.companyIdentityConflictAction') }}</span>
      </div>
    </div>

    <div v-else-if="normalizedStatus === 'Completed'" class="recognition-summary">
      <div class="recognition-summary__title">
        <Icon type="ios-checkmark-circle" aria-hidden="true" />
        <div>
          <strong>{{ $t('certify.recognitionCompletedTitle') }}</strong>
          <p>{{ $t('certify.recognitionCompletedTip') }}</p>
        </div>
      </div>
      <div class="recognition-summary__metrics">
        <div>
          <strong>{{ summary.file_count || 0 }}</strong>
          <span>{{ $t('certify.recognitionFiles') }}</span>
        </div>
        <div>
          <strong>{{ summary.field_count || 0 }}</strong>
          <span>{{ $t('certify.recognitionFields') }}</span>
        </div>
        <div>
          <strong>{{ summary.person_count || 0 }}</strong>
          <span>{{ $t('certify.recognitionPersons') }}</span>
        </div>
      </div>
      <div v-if="errorFiles.length" class="recognition-summary__warning">
        <Icon type="ios-information-circle-outline" aria-hidden="true" />
        <span>{{ $t('certify.recognitionPartialFiles', { files: errorFiles.join('、') }) }}</span>
      </div>
      <div v-if="hasNoRecognizedPersons" class="recognition-summary__warning is-person-empty">
        <Icon type="ios-information-circle-outline" aria-hidden="true" />
        <span>{{ $t('certify.recognitionNoPersonsTip') }}</span>
      </div>
    </div>

    <div v-else-if="normalizedStatus !== 'Failed' && files.length" class="recognition-files">
      <span>{{ $t('certify.recognitionFilesReady', { count: files.length }) }}</span>
      <span class="recognition-files__names">{{ fileNames }}</span>
    </div>

    <div class="recognition-actions">
      <div>
        <Button
          v-if="['Failed', 'Completed'].includes(normalizedStatus)"
          @click="$emit('back')"
        >
          {{ $t(normalizedStatus === 'Completed'
            ? 'certify.recognitionReviewDocuments'
            : 'certify.recognitionReplaceFiles') }}
        </Button>
        <Button
          v-if="normalizedStatus === 'Failed'"
          type="primary"
          :loading="actionLoading"
          @click="$emit('retry')"
        >
          {{ $t('certify.recognitionRetry') }}
        </Button>
        <Button
          v-if="normalizedStatus === 'Completed' && !businessBlocked"
          type="primary"
          :loading="actionLoading"
          @click="$emit('continue')"
        >
          {{ $t('certify.recognitionReviewResult') }}
        </Button>
      </div>
      <button
        v-if="normalizedStatus !== 'Completed'"
        type="button"
        class="recognition-actions__skip"
        :disabled="actionLoading"
        @click="$emit('skip')"
      >
        {{ $t('certify.recognitionSkip') }}
        <Icon type="ios-arrow-forward" aria-hidden="true" />
      </button>
    </div>
  </section>
</template>

<script setup>
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { t } from '@/utils'

const props = defineProps({
  recognition: {
    type: Object,
    default: () => ({}),
  },
  actionLoading: {
    type: Boolean,
    default: false,
  },
})

defineEmits(['back', 'retry', 'skip', 'continue'])

const actualStatus = computed(() => {
  const status = props.recognition?.status || 'Pending'
  return ['Pending', 'Processing', 'Normalizing', 'Completed', 'Failed'].includes(status)
    ? status
    : 'Pending'
})
const MIN_NORMALIZING_VISIBLE_MS = 900
const normalizedStatus = ref(actualStatus.value)
let displayStatusStartedAt = Date.now()
let completedDisplayTimer = null
const clearCompletedDisplayTimer = () => {
  if (!completedDisplayTimer) return
  clearTimeout(completedDisplayTimer)
  completedDisplayTimer = null
}
const setDisplayStatus = (status) => {
  if (normalizedStatus.value === status) return
  normalizedStatus.value = status
  displayStatusStartedAt = Date.now()
}
watch(actualStatus, (status, previousStatus) => {
  clearCompletedDisplayTimer()
  if (status !== 'Completed') {
    setDisplayStatus(status)
    return
  }
  if (!['Pending', 'Processing', 'Normalizing'].includes(previousStatus)
    && !['Pending', 'Processing', 'Normalizing'].includes(normalizedStatus.value)) {
    setDisplayStatus(status)
    return
  }
  if (normalizedStatus.value !== 'Normalizing') {
    setDisplayStatus('Normalizing')
  }
  const remaining = Math.max(
    MIN_NORMALIZING_VISIBLE_MS - (Date.now() - displayStatusStartedAt),
    0,
  )
  completedDisplayTimer = setTimeout(() => {
    setDisplayStatus('Completed')
    completedDisplayTimer = null
  }, remaining)
})
onBeforeUnmount(clearCompletedDisplayTimer)
const isRunning = computed(() => ['Pending', 'Processing', 'Normalizing'].includes(normalizedStatus.value))
const files = computed(() => Array.isArray(props.recognition?.files) ? props.recognition.files : [])
const summary = computed(() => props.recognition?.summary || {})
const businessValidation = computed(() => props.recognition?.business_validation || {})
const businessBlocked = computed(() => Boolean(businessValidation.value?.blocking))
const hasNoRecognizedPersons = computed(() => normalizedStatus.value === 'Completed'
  && Number(summary.value?.person_count || 0) === 0)
const cleanLegacyFileName = (name) => String(name || '')
  .replace(/\s*[（(][a-f0-9_-]{16,}\.(?:pdf|png|jpe?g|webp|gif)[）)]\s*$/i, '')
  .trim()
const fileDisplayName = (file, index) => {
  return String(file?.field_label || cleanLegacyFileName(file?.name) || t('certify.recognitionDocumentNumber', {
    number: index + 1,
  }))
}
const hasLegacyGlobalFileErrors = computed(() => {
  const globalError = props.recognition?.error
  const globalFiles = Array.isArray(globalError?.files) ? globalError.files.filter(Boolean) : []
  if (!globalError?.code || !files.value.length || globalFiles.length !== files.value.length) return false
  return files.value.every((file) => {
    const nestedFiles = Array.isArray(file?.error?.files) ? file.error.files.filter(Boolean) : []
    return file?.status === 'Failed'
      && file?.error?.code === globalError.code
      && nestedFiles.length === globalFiles.length
  })
})
const fileIssues = computed(() => {
  if (hasLegacyGlobalFileErrors.value) return []
  const seen = new Set()
  return files.value.reduce((issues, file, index) => {
    if (file?.status !== 'Failed' && !file?.error) return issues
    const key = `${file?.field_key || 'file'}:${file?.front_key || 0}:${file?.index ?? index}`
    if (seen.has(key)) return issues
    seen.add(key)
    issues.push({
      key,
      name: fileDisplayName(file, index),
      message: file?.error?.message
        || props.recognition?.error?.message
        || t('certify.recognitionFailedDefault'),
    })
    return issues
  }, [])
})
const errorFiles = computed(() => fileIssues.value.map((issue) => issue.name))
const fileNames = computed(() => {
  const names = files.value.map((file, index) => fileDisplayName(file, index)).filter(Boolean)
  if (names.length <= 3) return names.join('、')
  return `${names.slice(0, 3).join('、')} ${t('certify.recognitionMoreFiles', { count: names.length - 3 })}`
})
const stages = computed(() => [
  {
    key: 'files',
    title: t('certify.recognitionStageFiles'),
    description: t('certify.recognitionStageFilesTip'),
  },
  {
    key: 'recognize',
    title: t('certify.recognitionStageReading'),
    description: t('certify.recognitionStageReadingTip'),
  },
  {
    key: 'normalize',
    title: t('certify.recognitionStageOrganizing'),
    description: t('certify.recognitionStageOrganizingTip'),
  },
  {
    key: 'review',
    title: t('certify.recognitionStageReview'),
    description: t('certify.recognitionStageReviewTip'),
  },
])
const currentStage = computed(() => ({
  Pending: 0,
  Processing: 1,
  Normalizing: 2,
  Completed: 3,
  Failed: 1,
}[normalizedStatus.value] ?? 0))
const panelTitle = computed(() => businessBlocked.value
  ? t('certify.companyIdentityConflictHeading')
  : normalizedStatus.value === 'Failed'
  ? t('certify.recognitionFailedHeading')
  : normalizedStatus.value === 'Completed'
    ? t('certify.recognitionReadyHeading')
    : t('certify.recognitionHeading'))
const panelDescription = computed(() => businessBlocked.value
  ? t('certify.companyIdentityConflictDescription')
  : normalizedStatus.value === 'Failed'
  ? t('certify.recognitionFailedDescription')
  : normalizedStatus.value === 'Completed'
    ? t('certify.recognitionReadyDescription')
    : t('certify.recognitionDescription'))
const liveEvent = computed(() => ({
  Pending: t('certify.recognitionEventPending', { count: files.value.length }),
  Processing: t('certify.recognitionEventProcessing'),
  Normalizing: t('certify.recognitionEventNormalizing'),
  Completed: t('certify.recognitionEventCompleted'),
  Failed: t('certify.recognitionEventFailed'),
}[normalizedStatus.value]))
const stageClass = (index) => ({
  'is-complete': normalizedStatus.value === 'Completed' || index < currentStage.value,
  'is-active': !['Failed', 'Completed'].includes(normalizedStatus.value) && index === currentStage.value,
  'is-error': normalizedStatus.value === 'Failed' && index === currentStage.value,
})
</script>

<style scoped lang="less">
.recognition-panel {
  width: 100%;
  color: #17233d;

  &__canvas {
    position: relative;
    overflow: hidden;
    min-height: 430px;
    padding: 32px;
    color: #17233d;
    border: 1px solid #dce6fa;
    border-radius: 12px;
    background:
      radial-gradient(circle at 80% 18%, rgba(78, 128, 238, .12), transparent 35%),
      linear-gradient(145deg, #fbfdff 0%, #f4f8ff 58%, #f8faff 100%);
    box-shadow: 0 12px 30px rgba(43, 92, 217, .08);
  }

  &__grid {
    position: absolute;
    inset: 0;
    opacity: .48;
    background-image:
      linear-gradient(rgba(122, 158, 234, .12) 1px, transparent 1px),
      linear-gradient(90deg, rgba(122, 158, 234, .12) 1px, transparent 1px);
    background-size: 32px 32px;
    mask-image: linear-gradient(to bottom, #000 30%, transparent 94%);
  }

  &__glow {
    position: absolute;
    width: 260px;
    height: 260px;
    right: 8%;
    top: 32%;
    border-radius: 50%;
    background: rgba(81, 131, 239, .14);
    filter: blur(72px);
  }

  &__heading,
  &__body,
  .recognition-event {
    position: relative;
    z-index: 1;
  }

  &__heading {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 24px;

    h2 {
      margin: 7px 0 8px;
      color: #17233d;
      font-size: 24px;
      line-height: 1.35;
    }

    p {
      max-width: 650px;
      color: #6f7b8f;
      line-height: 1.75;
    }
  }

  &__eyebrow {
    color: #2b5cd9;
    font-size: 12px;
    font-weight: 600;
    letter-spacing: .14em;
  }

  &__secure {
    display: inline-flex;
    align-items: center;
    flex-shrink: 0;
    gap: 6px;
    min-height: 32px;
    padding: 0 12px;
    color: #536b9f;
    border: 1px solid #d8e3f8;
    border-radius: 16px;
    background: rgba(255, 255, 255, .78);
    font-size: 12px;
  }

  &__body {
    display: grid;
    grid-template-columns: minmax(250px, .78fr) minmax(360px, 1.22fr);
    align-items: center;
    gap: 56px;
    min-height: 270px;
    margin-top: 22px;
  }
}

.document-scanner {
  position: relative;
  width: 196px;
  height: 220px;
  margin: 0 auto;

  &__back,
  &__paper {
    position: absolute;
    width: 148px;
    height: 188px;
    border-radius: 8px;
  }

  &__back {
    left: 19px;
    top: 18px;
    border: 1px solid #cbd9f6;
    background: #eaf0fd;
    transform: rotate(-7deg);
  }

  &__paper {
    left: 28px;
    top: 8px;
    overflow: hidden;
    padding: 28px 22px;
    color: #2b5cd9;
    border: 1px solid #b9ccef;
    background: linear-gradient(155deg, rgba(255, 255, 255, .98), rgba(237, 243, 255, .94));
    box-shadow: 0 18px 34px rgba(43, 92, 217, .14);

    > .ivu-icon {
      margin-bottom: 25px;
      font-size: 36px;
    }

    > span {
      display: block;
      width: 100%;
      height: 5px;
      margin-top: 12px;
      border-radius: 3px;
      background: #d9e3f6;
    }

    > span.is-short {
      width: 62%;
    }
  }

  &__beam {
    position: absolute;
    left: 0;
    right: 0;
    top: 10px;
    height: 2px;
    background: #4b82ef;
    box-shadow: 0 0 13px 4px rgba(75, 130, 239, .28);
    animation: recognition-scan 2.6s ease-in-out infinite;
  }

  &__orbit {
    position: absolute;
    inset: 0;
    border: 1px solid rgba(83, 129, 225, .22);
    border-radius: 50%;
    animation: recognition-orbit 8s linear infinite;

    &::after {
      position: absolute;
      top: 20px;
      right: 22px;
      width: 7px;
      height: 7px;
      border-radius: 50%;
      background: #4b82ef;
      box-shadow: 0 0 14px rgba(75, 130, 239, .7);
      content: '';
    }
  }

  &__result {
    position: absolute;
    right: 14px;
    bottom: 14px;
    display: grid;
    place-items: center;
    width: 46px;
    height: 46px;
    border-radius: 50%;

    .ivu-icon {
      font-size: 45px;
    }

    &.is-success {
      color: #fff;
      background: #19be6b;
    }

    &.is-error {
      color: #fff;
      background: #ed4014;
    }
  }
}

.recognition-stages {
  margin: 0;
  padding: 0;
  list-style: none;

  li {
    position: relative;
    display: flex;
    gap: 16px;
    min-height: 82px;
    color: #a0a8b8;

    &:not(:last-child)::after {
      position: absolute;
      left: 22px;
      top: 51px;
      width: 1px;
      height: 26px;
      background: #dce5f5;
      content: '';
    }

    strong,
    small {
      display: block;
    }

    strong {
      margin-top: 2px;
      color: inherit;
      font-size: 14px;
    }

    small {
      margin-top: 4px;
      color: inherit;
      font-size: 12px;
      line-height: 1.5;
    }

    &.is-complete {
      color: #66758f;
    }

    &.is-active {
      color: #17233d;

      &:not(:last-child)::after {
        background: linear-gradient(to bottom, #2b5cd9 0 25%, #dce5f5 25% 100%);
        background-size: 100% 200%;
        animation: recognition-flow-line 1.5s linear infinite;
      }

      .recognition-stages__marker {
        color: #fff;
        border-color: #7da4ff;
        background: #2b5cd9;

        &::after {
          position: absolute;
          inset: -6px;
          border: 2px solid rgba(43, 92, 217, .16);
          border-top-color: #2b5cd9;
          border-right-color: #2b5cd9;
          border-radius: 50%;
          content: '';
          animation: recognition-stage-ring 1s linear infinite;
        }
      }
    }

    &.is-error {
      color: #17233d;

      .recognition-stages__marker {
        color: #fff;
        border-color: #ed4014;
        background: #ed4014;
      }
    }
  }

  &__marker {
    position: relative;
    z-index: 1;
    display: grid;
    place-items: center;
    flex: 0 0 46px;
    width: 46px;
    height: 46px;
    color: #8490a5;
    border: 1px solid #ccd8ed;
    border-radius: 50%;
    background: #f4f7fc;
    font-size: 15px;

    .ivu-icon {
      font-size: 45px;
    }
  }

  .is-complete &__marker {
    color: #fff;
    border-color: rgba(25, 190, 107, .8);
    background: #19be6b;
  }
}

.recognition-event {
  display: flex;
  align-items: center;
  gap: 10px;
  min-height: 42px;
  padding: 0 14px;
  color: #53627a;
  border: 1px solid #dbe5f7;
  border-radius: 7px;
  background: rgba(255, 255, 255, .82);
  font-size: 12px;

  &__pulse {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: #4b82ef;
    box-shadow: 0 0 0 0 rgba(75, 130, 239, .42);
    animation: recognition-pulse 1.8s infinite;
  }
}

.recognition-summary,
.recognition-error,
.recognition-files {
  margin-top: 16px;
  padding: 20px 24px;
  border: 1px solid #e6eaf2;
  border-radius: 10px;
  background: #fff;
}

.recognition-summary {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  flex-wrap: wrap;

  &__title,
  &__metrics {
    display: flex;
    align-items: center;
  }

  &__title {
    gap: 12px;

    > .ivu-icon {
      color: #19be6b;
      font-size: 45px;
    }

    p {
      margin-top: 4px;
      color: #808695;
      font-size: 12px;
    }
  }

  &__metrics {
    gap: 30px;

    > div {
      min-width: 72px;
      text-align: center;
    }

    strong,
    span {
      display: block;
    }

    strong {
      color: #2b5cd9;
      font-size: 22px;
    }

    span {
      margin-top: 2px;
      color: #808695;
      font-size: 12px;
    }
  }

  &__warning {
    display: flex;
    align-items: flex-start;
    gap: 7px;
    width: 100%;
    padding-top: 12px;
    color: #9a6a18;
    border-top: 1px solid #edf0f5;
    font-size: 12px;
    line-height: 1.6;

    .ivu-icon {
      flex-shrink: 0;
      margin-top: 2px;
      font-size: 16px;
    }

    &.is-person-empty {
      padding: 12px 14px;
      color: #7a5d18;
      border: 1px solid #f1dfad;
      border-radius: 7px;
      background: #fffaf0;
    }
  }
}

.recognition-error {
  position: relative;
  z-index: 1;
  margin-top: 16px;
  padding: 18px 20px;
  border-color: #ffd3c7;
  background: #fff8f6;

  &__title {
    display: flex;
    gap: 12px;

    > .ivu-icon {
      flex-shrink: 0;
      color: #ed4014;
      font-size: 26px;
    }

    p {
      margin-top: 5px;
      color: #515a6e;
      line-height: 1.6;
    }
  }

  ul {
    margin: 14px 0 0 38px;
    padding: 0;
    list-style: none;
  }

  li {
    display: flex;
    align-items: flex-start;
    gap: 9px;
    padding: 10px 0;
    color: #515a6e;
    border-top: 1px solid #ffe2da;
    word-break: break-word;

    > .ivu-icon {
      flex-shrink: 0;
      margin-top: 2px;
      color: #ed4014;
      font-size: 16px;
    }

    strong,
    p {
      display: block;
    }

    strong {
      color: #2b2f36;
      font-size: 13px;
      font-weight: 600;
    }

    p {
      margin-top: 3px;
      color: #6f5f5a;
      font-size: 12px;
      line-height: 1.6;
    }
  }

  &__unlocated {
    display: flex;
    align-items: flex-start;
    gap: 7px;
    margin: 14px 0 0 38px;
    padding-top: 12px;
    color: #6f5f5a;
    border-top: 1px solid #ffe2da;
    font-size: 12px;
    line-height: 1.6;

    .ivu-icon {
      flex-shrink: 0;
      margin-top: 2px;
      font-size: 16px;
    }
  }
}

.recognition-files {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  color: #515a6e;
  font-size: 12px;

  > span:first-child {
    flex-shrink: 0;
    color: #2b5cd9;
    font-weight: 600;
  }

  &__names {
    min-width: 0;
    color: #808695;
    word-break: break-all;
  }
}

.recognition-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18px;
  min-height: 58px;
  margin-top: 14px;

  > div {
    display: flex;
    gap: 10px;
  }

  &__skip {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 4px;
    min-height: 44px;
    padding: 0 4px;
    color: #808695;
    border: 0;
    background: transparent;
    cursor: pointer;

    &:hover {
      color: #2b5cd9;
    }

    &:disabled {
      cursor: not-allowed;
      opacity: .55;
    }
  }
}

@keyframes recognition-scan {
  0%, 100% { transform: translateY(0); opacity: .5; }
  50% { transform: translateY(162px); opacity: 1; }
}

@keyframes recognition-orbit {
  to { transform: rotate(360deg); }
}

@keyframes recognition-pulse {
  70% { box-shadow: 0 0 0 7px rgba(75, 130, 239, 0); }
  100% { box-shadow: 0 0 0 0 rgba(75, 130, 239, 0); }
}

@keyframes recognition-stage-ring {
  to { transform: rotate(360deg); }
}

@keyframes recognition-flow-line {
  to { background-position: 0 200%; }
}

@media (prefers-reduced-motion: reduce) {
  .document-scanner__beam,
  .document-scanner__orbit,
  .recognition-event__pulse,
  .recognition-stages li.is-active::after,
  .recognition-stages li.is-active .recognition-stages__marker::after {
    animation: none;
  }
}

@media (max-width: 900px) {
  .recognition-panel {
    &__canvas {
      padding: 24px;
    }

    &__body {
      grid-template-columns: 1fr;
      gap: 16px;
    }
  }

  .recognition-summary {
    align-items: flex-start;
    flex-direction: column;
  }
}
</style>
