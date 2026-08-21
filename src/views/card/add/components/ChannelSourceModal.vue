<template>
  <Modal
    v-model="visible"
    :width="551"
    :closable="false"
    :mask-closable="true"
    :footer-hide="true"
    class="custom-modal-box"
    class-name="vertical-center-modal"
  >
    <template #header>
      <div class="custom-modal-header">
        <img src="@/assets/images/image.png" alt="" />
        <h3>{{ $t('card.index.opening.sourceChannel.title') }}</h3>
      </div>
    </template>

    <div class="channel-modal-body">
      <Spin v-if="loadingOptions" fix />
      <RadioGroup v-model="selectedChannel" vertical class="channel-radio-group">
        <Radio v-for="channel in channelOptions" :key="channel" :label="channel">
          {{ getChannelLabel(channel) }}
        </Radio>
      </RadioGroup>
      <Input
        v-if="selectedChannel === OTHER_CHANNEL"
        v-model="otherChannel"
        :placeholder="$t('card.index.opening.sourceChannel.otherPlaceholder')"
        type="textarea"
        :rows="5"
      />
      <p v-if="submitError" class="submit-error">{{ submitError }}</p>
    </div>

    <div class="custom-modal-footer">
      <Button
        type="primary"
        size="large"
        :loading="submitting"
        :disabled="isSubmitDisabled"
        @click="submit"
      >
        {{ $t('card.index.opening.sourceChannel.submit') }}
      </Button>
    </div>
  </Modal>
</template>

<script setup>
import { cardApi } from '@/api'
import { message } from '@/utils/message.js'
import { computed, ref, watch } from 'vue'
import { t } from '@/utils'

const OTHER_CHANNEL = '其他'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['update:modelValue', 'success'])

const visible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
})

const channelOptions = ref([])
const selectedChannel = ref('')
const otherChannel = ref('')
const loadingOptions = ref(false)
const submitting = ref(false)
const submitError = ref('')

const isSubmitDisabled = computed(() => {
  if (loadingOptions.value || submitting.value || !selectedChannel.value) return true
  return selectedChannel.value === OTHER_CHANNEL && !otherChannel.value.trim()
})

const getChannelLabel = (channel) => channel === OTHER_CHANNEL
  ? t('card.index.opening.sourceChannel.other')
  : channel

const loadChannelOptions = async () => {
  loadingOptions.value = true
  submitError.value = ''
  try {
    channelOptions.value = await cardApi.getSourceChannels() || []
  } catch (error) {
    channelOptions.value = []
    submitError.value = error?.msg || t('card.index.opening.sourceChannel.loadFailed')
  } finally {
    loadingOptions.value = false
  }
}

const reset = () => {
  selectedChannel.value = ''
  otherChannel.value = ''
  submitError.value = ''
}

const submit = async () => {
  if (isSubmitDisabled.value) return

  const sourceChannel = selectedChannel.value === OTHER_CHANNEL
    ? otherChannel.value.trim()
    : selectedChannel.value

  submitting.value = true
  submitError.value = ''
  try {
    await cardApi.sourceChannel({ sourceChannel })
    message(t('card.index.opening.sourceChannel.submitSuccess'))
    visible.value = false
    emit('success', sourceChannel)
  } catch (error) {
    submitError.value = error?.msg || t('card.index.opening.sourceChannel.submitFailed')
  } finally {
    submitting.value = false
  }
}

watch(
  () => props.modelValue,
  (value) => {
    if (value) {
      reset()
      loadChannelOptions()
    }
  },
)
</script>

<style scoped lang="less">
.custom-modal-header {
  position: relative;
  display: flex;
  align-items: center;
  gap: 6px;

  img {
    position: absolute;
    top: -36px;
    width: 71px;
    height: 71px;
    margin-left: 13px;
  }

  h3 {
    margin-left: 90px;
    color: var(--ui-color-text-inverse);
  }
}

.channel-modal-body {
  position: relative;
  min-height: 80px;
  padding: var(--ui-padding-10-0);
}

.channel-radio-group {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  margin-bottom: 10px;

  :deep(.ivu-radio-wrapper) {
    display: flex;
    align-items: center;
    gap: 16px;
  }

  :deep(.ivu-radio-inner) {
    border-color: var(--ui-color-border-strong);
  }

  :deep(.ivu-radio-wrapper-checked) {
    color: var(--ui-color-primary);
  }
}

.submit-error {
  margin-top: 8px;
  color: var(--ui-color-error-strong);
  font-size: 12px;
}

.custom-modal-footer {
  display: flex;
  justify-content: center;

  .ivu-btn {
    width: var(--ui-size-160);
  }
}

@media screen and (max-width: 576px) {
  .channel-radio-group {
    grid-template-columns: 1fr;
  }
}
</style>
