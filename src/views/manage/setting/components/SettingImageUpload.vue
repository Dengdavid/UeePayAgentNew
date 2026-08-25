<template>
  <div class="setting-image-upload" :style="uploadStyle">
    <FormUpload
      UploadType="img"
      width="100%"
      height="100%"
      :action="action"
      :format="format"
      :max-size="maxSize"
      @on-change="handleChange"
    >
      <div class="upload-content">
        <template v-if="modelValue">
          <button
            type="button"
            class="remove-button"
            :title="t('button.delete')"
            @click.stop="handleClose"
          >
            <Icon type="md-close" :size="18" />
          </button>
          <Image
            class="upload-image"
            :src="String(modelValue)"
            :alt="alt"
            fit="contain"
            lazy
          />
        </template>
        <div v-else class="upload-placeholder">
          <Icon type="md-camera" :size="32" />
          <span>{{ t('setting.uploadImage') }}</span>
        </div>
      </div>
    </FormUpload>
  </div>
  <p v-if="description" class="upload-description">{{ description }}</p>
</template>

<script setup>
import { computed } from 'vue'
import { t } from '@/utils'

const props = defineProps({
  modelValue: {
    type: [String, Number],
    default: '',
  },
  action: {
    type: String,
    default: '/user/agentSite/upload',
  },
  format: {
    type: Array,
    default: () => ['png', 'jpg'],
  },
  maxSize: {
    type: Number,
    default: 1024,
  },
  width: {
    type: [String, Number],
    default: '100%',
  },
  aspectRatio: {
    type: Number,
    default: 16 / 9,
  },
  alt: {
    type: String,
    default: '',
  },
  des: {
    type: Object,
    default: () => ({}),
  },
})

const emit = defineEmits(['update:modelValue'])

const uploadStyle = computed(() => ({
  width: typeof props.width === 'number' ? `${props.width}px` : props.width,
  aspectRatio: props.aspectRatio,
}))

const getSizeName = (size) => {
  if (size < 1024) return `${size}MB`
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(2)}GB`
  if (size < 1024 * 1024 * 1024) return `${(size / (1024 * 1024)).toFixed(2)}TB`
  return ''
}

const description = computed(() => {
  const { dimension, format, size } = props.des
  return `${
    dimension ? `${t('setting.fileDimension')}：${dimension}，` : ''
  }${
    format ? `${t('setting.uploadFormat')}：${format}，` : ''
  }${
    size ? `${t('setting.uploadSize')}：${getSizeName(size)}` : ''
  }`
})

const handleClose = () => {
  emit('update:modelValue', '')
}

const handleChange = (result = {}) => {
  const value = typeof result === 'string' || typeof result === 'number'
    ? result
    : result.fileFullUrl || result.url || ''
  emit('update:modelValue', value)
}
</script>

<style lang="less" scoped>
.setting-image-upload {
  overflow: hidden;
  background: var(--ui-color-surface-muted);
  border: var(--ui-border-subtle);
  border-radius: var(--ui-radius-sm);

  :deep(.ivu-upload),
  :deep(.ivu-upload-select) {
    width: 100%;
    height: 100%;
  }
}

.upload-content {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  cursor: pointer;
}

.upload-image {
  width: 100%;
  height: 100%;

  :deep(img) {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }
}

.remove-button {
  position: absolute;
  top: 8px;
  right: 8px;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  padding: 0;
  color: var(--ui-color-text-inverse);
  cursor: pointer;
  background: rgba(0, 0, 0, 0.75);
  border: 0;
  border-radius: var(--ui-radius-full);
}

.upload-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  padding: var(--ui-padding-16);
  color: var(--ui-color-text-secondary);
  gap: var(--ui-space-4);
}

.upload-description {
  margin-top: var(--ui-space-8);
  color: var(--ui-color-text-secondary);
  font-size: var(--ui-font-size-xs);
  line-height: var(--ui-line-height-md);
}
</style>
