<template>
  <div class="autoCompleteBox" @keydown.capture="handleSuggestionKeydown">
    <AutoComplete
      ref="autoCompleteRef"
      v-model="c_modelValue"
      :data="optionArr"
      :class="{
        isIconLeft:$slots.prefix
      }"
      name="ueepay-email-input"
      autocomplete="one-time-code"
      data-1p-ignore="true"
      data-lpignore="true"
      data-bwignore="true"
      placeholder="邮箱/Email"
      placement="bottom-start"
      clearable
      v-bind="$attrs"
      v-if="isShow"
      @on-search="handleSearch"
      @on-change="handleChange"
    >
    </AutoComplete>
    <div class="icon" v-if="$slots.prefix">
      <slot name="prefix"/>
    </div>
  </div>
</template>

<script setup>
import { useAppStore } from '@/store/app.js'
import { storeToRefs } from 'pinia'
import { computed, defineProps, nextTick, onMounted, ref } from 'vue'
const appStore = useAppStore()
const { configDatas } = storeToRefs(appStore)
const props = defineProps({
  data: {
    type: [Object, String],
    default: function () {
      return {}
    },
  },
  dataName: {
    type: [String, Array],
    default: '',
  },
  options: {
    type: Object,
    default: [],
  },
  isIconLeft:{
    type:Boolean,
    default:false
  }
})
const isShow = ref(true)
const autoCompleteRef = ref(null)
const optionArr = ref([])
const c_modelValue = computed({
  get() {
    if (props.dataName) {
      return props.data[props.dataName]
    } else {
      return props.data
    }
  },
  set(value) {
    if (props.dataName) {
      props.data[props.dataName] = value
    } else {
      emits('update:data', value)
    }
  },
})
const emits = defineEmits(['update:data', 'on-change'])

//匹配规则
const generateEmailSuggestions = (value, suffixList) => {
  if (!value) return []

  const atIndex = value.indexOf('@')
  const atLastIndex = value.lastIndexOf('@')

  // 多个 @，视为非法
  if (atIndex !== atLastIndex) {
    return []
  }

  // 没有 @：拼接所有后缀
  if (atIndex === -1) {
    return suffixList.map((suffix) => value + suffix)
  }

  // 有一个 @
  const username = value.slice(0, atIndex)
  const inputDomain = value.slice(atIndex + 1)

  // @ 后为空，推荐全部
  if (inputDomain === '') {
    return suffixList.map((suffix) => username + suffix)
  }

  // 模糊匹配：inputDomain 中的每个字符都必须出现在 suffix 的域名部分中
  const inputChars = inputDomain.split('')
  const matchedSuffixes = suffixList.filter((suffix) => {
    // 确保 suffix 是字符串，并标准化（比如统一小写可选）
    const target = suffix // 假设 suffix 如 "@gmail.com"
    return inputChars.every((char) => target.includes(char))
  })

  return matchedSuffixes.map((suffix) => username + suffix)
}
const handleSearch = (value) => {
  const _arr = configDatas.value.email_format || []
  optionArr.value = generateEmailSuggestions(value, _arr)
}
const handleChange = (value) => {
  emits('on-change', value)
}
const scrollActiveSuggestionIntoView = () => {
  const select = autoCompleteRef.value?.$refs?.select
  const dropdown = select?.$refs?.dropdown?.$refs?.drop
  const option = dropdown?.querySelector('.ivu-select-item-focus')
  if (!option) return

  const optionRect = option.getBoundingClientRect()
  const dropdownRect = dropdown.getBoundingClientRect()
  if (optionRect.bottom > dropdownRect.bottom) {
    dropdown.scrollTop += optionRect.bottom - dropdownRect.bottom
  } else if (optionRect.top < dropdownRect.top) {
    dropdown.scrollTop += optionRect.top - dropdownRect.top
  }
}
const handleSuggestionKeydown = (event) => {
  if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
    requestAnimationFrame(scrollActiveSuggestionIntoView)
    return
  }
  if (event.key !== 'Enter') return

  const select = autoCompleteRef.value?.$refs?.select
  const value = optionArr.value[select?.focusIndex]
  if (!value) return

  const index = select?.slotOptions?.findIndex((item) => item?.props?.value === value)
  if (index >= 0) select.focusIndex = index
}

onMounted(() => nextTick(() => {
  const input = autoCompleteRef.value?.$el?.querySelector('input')
  input?.setAttribute('data-bwignore', 'true')
  input?.setAttribute('data-1p-ignore', 'true')
  input?.setAttribute('data-lpignore', 'true')
}))
</script>

<style scoped lang="less">
.autoCompleteBox{
  position: relative;
  :deep(.ivu-auto-complete .ivu-icon-ios-close-circle){
    font-size: 18px;
  }
  :deep(.isIconLeft){
    .ivu-input{
      padding-left: 32px;
    }
  }
  .icon{
    position: absolute;
    left: 0;
    top: 0;
    width: var(--ui-size-32);
    height: 100%;
    text-align: center;
    position: absolute;
    z-index: 1;
    font-size: 18px;
    line-height: 40px;
    color: var(--ui-color-text-muted);
  }
}
</style>
