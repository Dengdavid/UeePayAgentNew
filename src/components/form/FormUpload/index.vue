<template>
  <Upload :type="type" name="files" :show-upload-list="false" :headers="headers" :accept="c_accept"
    :on-progress="handleProgress" :on-success="handleSuccess" :on-format-error="handleFormatError"
    :on-exceeded-size="handleMaxSize" :max-size="maxSize" :on-error="handleError" :disabled="loading" :before-upload="handleBeforeUpload"
    :action="baseURL + props.action" v-bind="$attrs" :style="{
      width: sizeNum(width, '100%'),
      height: sizeNum(height, width),
    }">
    <div class="files-loading" :style="{
      width: sizeNum(width, '100%'),
      height: sizeNum(height, width),
    }" v-if="loading && !isNotProgress">
      <Progress class="upload-progress" :percent="progress" hide-info></Progress>
      <span class="text-sm">{{ `${c_typeName}上传中...` }}</span>
    </div>
    <slot :loading="loading" v-else-if="$slots.default"></slot>
    <template v-else>
      <Button icon="ios-cloud-upload-outline">
        {{ `上传${c_typeName}` }}
      </Button>
    </template>
  </Upload>
</template>

<script setup>
import { host } from '@/config/index';
import Cookies from 'js-cookie';
import { computed, defineProps, getCurrentInstance, ref } from 'vue';
import { Message } from 'view-ui-plus';
import { message } from '@/utils/message.js'
import { tokenName,baseURL } from "@systemConfig";
const { proxy } = getCurrentInstance()
const props = defineProps({
  modelValue: {
    type: String,
    default: null,
  },
  type: {
    type: String,
    default: 'select',//可选值为 select（点击选择），drag（支持拖拽）
  },
  UploadType: {
    type: String,//可选值为 img(图片上传),file(文件上传)
  },
  width: {
    type: [String, Number],
  },
  height: {
    type: [String, Number],
  },
  format: {
    type: Array,
    default: () => [],
  },
  action: {
    type: String,
    default: '/user/Certifications/upload',
  },
  maxSize: {
    type: Number,
  },
  isNotProgress:{
    type:Boolean,
    default:false
  }
})
const c_accept = computed(() => {
  if (!props.format) return
  const formats = props.format.map(item => '.' + item);
  return formats.join(',');
})
const loading = ref(false)
const progress = ref(0);
const c_typeName = computed(() => {
  if (props.UploadType === 'img') {
    return '图片'
  }
  return '文件'
})
const headers = {
  token: Cookies.get(tokenName)
}
const sizeNum = (val, defaultValue) => {
  let v = val ?? defaultValue

  // 如果是字符串，尝试识别为数字
  if (typeof v === 'string') {
    const trimmed = v.trim()
    // 只匹配标准十进制数（整数或小数），不支持 .5 或 12.
    if (/^-?\d+(\.\d+)?$/.test(trimmed)) {
      const num = parseFloat(trimmed)
      if (!isNaN(num)) {
        return num + 'px'
      }
    }
    return trimmed // 返回原始字符串（如 '100%', 'auto'）
  }

  // 如果是数字
  if (typeof v === 'number' && !isNaN(v)) {
    return v + 'px'
  }

  // 兜底：转字符串或返回默认
  return v != null ? String(v) : defaultValue
}
const emits = defineEmits(['update:modelValue', 'update:url', 'update:id', 'on-change'])
//文件上传时的钩子
const handleProgress = (res, file) => {
  progress.value =Math.floor(res.percent);
  loading.value = true
}
//
const handleChange = (value) => {
  loading.value = false
  emits('on-change', value)
}
//文件上传成功时的钩子
const handleSuccess = (res, file) => {
  progress.value = 0;
  if (res.code === 1 || res.code === 200) {
    // 上传成功
    handleChange(res.data)
  } else {
    loading.value = false
    message(res.msg || '上传失败', 'error')
  }
}
//上传文件失败时的钩子
const handleError = (error, file) => {
  loading.value = false
  message('网络错误或上传失败', 'error')
}
//文件格式验证失败时的钩子
const handleFormatError = (file) => {
  // 文件格式验证失败
  loading.value = false
  message(`${file.name} 格式不正确`, 'warning')
}
const getFileSize = (sizeKb) => {
  // 建议增加非数字或负数的防御性检查
  if (typeof sizeKb !== 'number' || sizeKb < 0 || !Number.isFinite(sizeKb)) {
    return '0B';
  }
  // 1. 如果小于 1 KB (即输入值 < 1)，通常显示为 B
  // 注意：因为输入是 KB，所以 1 KB = 1024 B
  if (sizeKb < 1) {
    // 转换为 B，并向上取整或保留小数，这里保持原风格直接乘
    return (sizeKb * 1024).toFixed(0) + 'B';
  }
  // 2. 如果小于 1 MB (即输入值 < 1024 KB)
  else if (sizeKb < 1024) {
    return sizeKb.toFixed(2) + 'KB';
  }
  // 3. 如果小于 1 GB (即输入值 < 1024 * 1024 KB)
  else if (sizeKb < 1024 * 1024) {
    return (sizeKb / 1024).toFixed(2) + 'MB';
  }
  // 4. 大于等于 1 GB
  else {
    return (sizeKb / (1024 * 1024)).toFixed(2) + 'GB';
  }
}
//文件超出指定大小限制时的钩
const handleMaxSize = (file) => {
  // 文件超出指定大小限制
  loading.value = false
  const fileMaxSize = getFileSize(props.maxSize ?? 0)
  message(`${file.name} 文件太大，超出${fileMaxSize}大小限制`, 'warning')
}
//上传文件之前的钩子，参数为上传的文件，若返回 false 或者 Promise 则停止上传
const handleBeforeUpload = (file) => {
  loading.value = true
  return true
}
</script>
<style lang="less" scoped>
.files-loading{
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  line-height: 1;
  gap: var(--ui-upload-content-gap);
}

.upload-progress{
  width: calc(100% - var(--ui-space-32));
}
</style>
