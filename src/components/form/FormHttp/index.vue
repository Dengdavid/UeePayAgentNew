<template>
  <Input
    v-model.trim="urlValue"
    class="formHttp"
    placeholder="请输入域名"
    :style="{
      width: typeof width === 'number' ? width + 'px' : width,
    }"
    v-bind="$attrs"
    @on-enter="handleChange"
    @on-blur="handleChange"
    @input="handleInput"
  >
  <template #prepend>
    <Select v-model="httpValue" class="protocol-select" @on-change="handleChange">
      <Option :value="item.value" v-for="item in httpOptions" :key="item.value">{{ item.label }}</Option>
    </Select>
  </template>
  </Input>
</template>

<script setup>
import { isUrl } from '@/utils/regex.js'
import { message } from '@/utils/message.js'
import { ref, watch } from 'vue'

const props = defineProps({
  modelValue: {
    type: [String, null],
    default: '',
  },
  width: {
    type: [String, Number],
    default: '100%',
  },
  regex: {
    type: String,
    default: '',
  },
  regexType: {
    type: String,
    default: '',
  },
})
const emits = defineEmits(['update:modelValue', 'on-change'])
const urlValue = ref('')
const httpValue = ref('http')
const httpOptions = ref([
  {
    value: 'http',
    label: 'http://',
  },
  {
    value: 'https',
    label: 'https://',
  },
])

const getEventValue = (event) => {
  if (typeof event === 'string' || typeof event === 'number') return String(event)
  return event?.target?.value ?? ''
}

const normalizeProtocol = (protocol) => {
  const value = String(protocol || '').replace(/:$/, '').toLowerCase()
  return httpOptions.value.some((item) => item.value === value) ? value : 'http'
}

const stripProtocol = (value) => String(value || '').trim().replace(/^[a-z][a-z0-9+.-]*:\/\//i, '')

const getDisplayValue = (parsed) => {
  return [
    parsed.hostname,
    parsed.pathname === '/' ? '' : parsed.pathname,
    parsed.search,
    parsed.hash,
  ].join('')
}

const setHttp = (val) => {
  if (val === null || val === undefined || val === '') {
    urlValue.value = ''
    httpValue.value = 'http'
    return
  }
  let input = String(val).trim()
  if (!/^[a-z][a-z0-9+.-]*:\/\//i.test(input)) {
    input = 'http://' + input
  }
  try {
    const parsed = new URL(input)
    httpValue.value = normalizeProtocol(parsed.protocol)
    urlValue.value = getDisplayValue(parsed)
  } catch {
    urlValue.value = stripProtocol(val)
    httpValue.value = 'http'
  }
}

watch(
  () => props.modelValue,
  (val) => {
    setHttp(val)
  },
  {
    immediate: true
  }
)

const handleInput = (e) => {
  let value = getEventValue(e).trim()
  try {
    const parsed = new URL(value)
    httpValue.value = normalizeProtocol(parsed.protocol)
    value = getDisplayValue(parsed)
  } catch {
  }
  value = stripProtocol(value)
    .replace(/[^a-zA-Z0-9\-._~:/?#[\]@!$&'()*+,;=%]/g, '')

  urlValue.value = value
}
const buildFullUrl = () => {
  const domain = stripProtocol(urlValue.value)
  if (!domain) return ''
  return `${normalizeProtocol(httpValue.value)}://${domain}`
}
const validateAndEmit = () => {
  const fullUrl = buildFullUrl()
  if (fullUrl) {
    if (!isUrl(fullUrl)) {
      message('请输入正确的网站地址', 'error')
    }
    emits('update:modelValue', fullUrl)
    emits('on-change', fullUrl)
  } else {
    urlValue.value = ''
    emits('update:modelValue', '')
    emits('on-change', '')
  }
}
const handleChange = () => {
  validateAndEmit()
}
</script>
<style lang="less" scoped>
.formHttp {
  width: 100%;
  :deep(.protocol-select){
    width: var(--ui-size-100);
  }
}
</style>
