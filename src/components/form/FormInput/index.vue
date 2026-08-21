<template>
  <Input ref="inputRef" v-model.trim="c_modelValue" placeholder="请输入" :search="search" :autocomplete="autocomplete"
    :data-1p-ignore="allowAutocomplete ? null : 'true'" :data-lpignore="allowAutocomplete ? null : 'true'"
    :data-bwignore="allowAutocomplete ? null : 'true'" :clearable="$attrs.maxlength || search ? false : clearable"
    :show-word-limit="$attrs.maxlength ? true : false" :style="{
      width: typeof width === 'number' ? width + 'px' : width,
    }" v-bind="$attrs" @on-blur="handleBlur" @on-clear="handleClear" @on-enter="handleEnter" @on-search="handleSearch" @on-change="handleInputChange">
    <template v-for="(_, name) in $slots" #[name]="{ row }">
      <slot :name="name" :row="row" />
    </template>
    <template #prepend v-if="options?.length>0">
      <Select v-model="c_select" style="width:90px">
        <Option :value="option.value" v-for="option in options">{{ option.label }}</Option>
      </Select>
    </template>
    <template #append v-if="$attrs.unit">
      {{ $attrs.unit }}
    </template>
  </Input>
</template>

<script setup>
import { computed, defineProps, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
const props = defineProps({
  modelValue: {
    type: [String, null],
    default: null,
  },
  select:{
    type:String,
    default:null
  },
  width: {
    type: [String, Number],
    default: '100%',
  },
  regex: {
    type: String,
  },
  regexType: {
    type: String,
  },
  search:{
    type:Boolean,
    default:false
  },
  clearable:{
    type:Boolean,
    default:true
  },
  autocomplete: {
    type: String,
    default: 'one-time-code',
  },
  changeDelay: {
    type: Number,
    default: 500
  },
  options:{
    type:Array,
    default:()=>[]
  }
})
const emits = defineEmits(['update:modelValue','update:select', 'on-change','on-enter'])
const allowAutocomplete = computed(() => ['username', 'current-password'].includes(props.autocomplete))
const inputRef = ref(null)

const setNativeAutofillAttributes = () => {
  if (allowAutocomplete.value) return
  const input = inputRef.value?.$el?.querySelector('input, textarea')
  input?.setAttribute('data-bwignore', 'true')
  input?.setAttribute('data-1p-ignore', 'true')
  input?.setAttribute('data-lpignore', 'true')
}
const c_modelValue = computed({
  get() {
    return props.modelValue
  },
  set(value) {
    emits('update:modelValue', value)
  },
})
const c_select = computed({
  get() {
    return props.select
  },
  set(value) {
    emits('update:select', value)
  },
})

let changeTimer = null

const getValue = (e) => {
  if (typeof e === 'string' || typeof e === 'number') {
    return String(e)
  }
  return e?.target?.value ?? c_modelValue.value ?? ''
}

const clearChangeTimer = () => {
  if (changeTimer) {
    clearTimeout(changeTimer)
    changeTimer = null
  }
}

const emitChange = (value) => {
  emits('on-change', value)
}

const handleInputChange = (e) => {
  const value = getValue(e)
  clearChangeTimer()
  if (props.changeDelay <= 0) {
    emitChange(value)
    return
  }
  changeTimer = setTimeout(() => {
    emitChange(value)
    changeTimer = null
  }, props.changeDelay)
}

const handleClear = () => {
  clearChangeTimer()
  emitChange('')
}

const handleSearch = (value) => {
  clearChangeTimer()
  emitChange(getValue(value))
}

const handleBlur = (e) => {
  if (!changeTimer) return
  clearChangeTimer()
  emitChange(getValue(e))
}

const handleEnter = (e) => {
  clearChangeTimer()
  const value = getValue(e)
  emits('on-enter', value)
}

onBeforeUnmount(() => {
  clearChangeTimer()
})

onMounted(() => nextTick(setNativeAutofillAttributes))

</script>
