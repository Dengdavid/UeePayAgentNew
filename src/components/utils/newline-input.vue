<template>
  <div class="ip-list-wrapper">
    <div v-for="(ip, index) in ipList" :key="index" class="ivu-flex">
      <div class="flexAuto">
        <FormIp v-model.trim="ipList[index]" :index="index" @on-change="onChange(ipList, index)"/>
      </div>
      <Icon type="ios-trash" size="20" class="c-btn delete-btn" @click="removeItem(index)" />
    </div>
    <div
      class="c-add-btn"
      :class="{ disabled: isDisabled }"
      @click="addItem"
    >
      <Icon type="md-add" size="13" />
      <span>{{ $t('security.loginRecords.ipAddress') }}</span>
    </div>
  </div>
</template>

<script setup>
import FormIp from '@/components/form/FormIp/index.vue'
import { Message } from 'view-ui-plus'
import { message } from '@/utils/message.js'
import { computed, nextTick, onMounted, ref, watch } from 'vue'
const props = defineProps({
  modelValue: { type: String, default: '' },
  placeholder: { type: String, default: '请输入IP地址' },
  min: { type: Number },
})

const emit = defineEmits(['update:modelValue'])

const ipList = ref([])
const onChange = (arr,index) => {
  if (Array.isArray(arr) && new Set(arr).size !== arr.length) {
    message('IP不能重复', 'warning');
    ipList.value[index] = ''
    nextTick(() => {
      const inputs = document.querySelectorAll('.ivu-input-number-input-wrap input')
      inputs[index*4]?.focus()
    })
  } else {
    addItem()
  }
}
const isDisabled = computed(() => {
  return ipList.value.length >= 5 || (ipList.value.length > 0 && !isValidIP(ipList.value[ipList.value.length - 1]))
})
const isValidIP = (ip) => {
  if (typeof ip !== 'string') return false;

  const parts = ip.split('.');

  // 必须是 4 段
  if (parts.length !== 4) return false;

  for (const part of parts) {
    // 不能为空
    if (part === '') return false;

    // 必须是纯数字（且不能有前导零，除非就是 "0"）
    if (!/^\d+$/.test(part)) return false;

    // 检查前导零（例如 "01" 不合法）
    if (part.length > 1 && part[0] === '0') return false;

    const num = parseInt(part, 10);
    if (num < 0 || num > 255) return false;
  }

  return true;
}
const addItem = () => {
  if (isDisabled.value) return
  ipList.value.push('')
  nextTick(() => {
    const inputs = document.querySelectorAll('.ivu-input-number-input-wrap input')
    inputs[inputs.length - 4]?.focus()
  })
}

const removeItem = (index) => {
  if (props.min && ipList.value.length <= props.min) {
    message('IP白名单不能为空', 'warning');
    return
  }
  ipList.value.splice(index, 1)
  if(ipList.value.length===0){
    addItem()
  }
}
watch(
  ipList,
  (newList) => {
    const validList = newList
      .map(s => s.trim())
      .filter(s => s.length > 0)

    const result = validList.length > 0 ? validList.join('\n') : ''
    emit('update:modelValue', result)
  },
  { deep: true }
)

const info = () => {
  const arr = props.modelValue
    ? props.modelValue.split('\n').map(s => s.trim()).filter(s => s.length > 0)
    : []
  const currentValidList = ipList.value
    .map(s => s.trim())
    .filter(s => s.length > 0)
  if (arr.join('|||') !== currentValidList.join('|||')) {
    ipList.value = arr
  }
  nextTick(() => {
    addItem()
  })
}
onMounted(() => {
  info()
})
</script>

<style scoped lang="less">
.ip-list-wrapper {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.ivu-flex {
  display: flex;
  align-items: center;
  gap: 8px;
}

.ivu-Input {
  flex: 1;
}

.c-btn.delete-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--ui-color-control-text-muted);
  cursor: pointer;
  flex-shrink: 0;
  &:hover {
    color: var(--ui-color-error-strong);
    opacity: 0.8;
  }
}

.c-add-btn {
  display: flex;
  align-items: center;
  color: var(--ui-color-primary);
  font-size: 13px;
  cursor: pointer;
  align-self: flex-start;

  &:hover {
    opacity: 0.8;
  }

  &.disabled {
    color: var(--ui-color-control-text-disabled);
    cursor: not-allowed;
    pointer-events: none;
  }
}
</style>
