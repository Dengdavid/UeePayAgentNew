<template>
  <Select ref="selectRef" v-model="c_modelValue" :placeholder="placeholder" :disabled="disabled" :multiple="multiple" filterable clearable :events-enabled="true" transfer-class-name="form-select-box-dropdown" :style="{
      width: typeof width === 'number' ? width + 'px' : width,
    }" @on-change="handleChange" @on-query-change="handleQueryChange" @on-open-change="handleOpenChange">
      <Option
        v-for="item in toArray(options)"
        :key="item[valueKey]"
        :disabled="item.disabled"
        :value="item[valueKey]"
        :label="optionLabelKey ? item[optionLabelKey] : undefined"
      >
        <div class="optionItem">
          <img :src="images[item[imagesKey || valueKey]]"  v-if="images"/>
          <slot :row="item" v-if="$slots.default"></slot>
          <template v-else>
            <p>
              <template v-for="(part, index) in getHighlightParts(item[labelKey])" :key="index">
                <span v-if="part.matched" class="optionItem__match">{{ part.text }}</span>
                <span v-else>{{ part.text }}</span>
              </template>
            </p>
          </template>
        </div>
      </Option>
      <template #prefix v-if="$slots.prefix">
        <slot name="prefix"></slot>
      </template>
  </Select>
</template>

<script setup>
import {toArray} from '@/utils/dataInfo.js'
import { computed, defineEmits, getCurrentInstance, nextTick, ref } from 'vue'
const { proxy } = getCurrentInstance()
const props = defineProps({
  modelValue: {
    type:[Array,String,Number],
    default:''
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  options: {
    type: [Array, Object, String],
    default: [],
  },
  width:{
    type:[String,Number],
    default:'100%'
  },
  placeholder: {
    type: String,
    default: '请选择',
  },
  labelKey: {
    type: String,
    default: 'label',
  },
  valueKey: {
    type: String,
    default: 'value',
  },
  optionLabelKey: {
    type: String,
    default: '',
  },
  images:{
    type:Object,
  },
  imagesKey:{
    type: String,
  },
  multiple:{
    type: Boolean,
    default: false,
  }
})
const emits = defineEmits(['update:modelValue', 'update:label', 'on-change', 'noData'])
const selectRef = ref(null)
const isOpen = ref(false)
const searchQuery = ref('')
const c_modelValue = computed({
  get() {
    if(props.multiple){
      return Array.isArray(props.modelValue) ? [...props.modelValue] : props.modelValue ? String(props.modelValue).split(',') : []
    }
    return props.modelValue
  },
  set(value) {
    if(props.multiple){
       emits('update:modelValue', Array.isArray(props.modelValue) ? value || [] : value?.join(',') || '')
       return
    }
    emits('update:modelValue', value)
  },
})
const handleChange = (value) => {
  const options=toArray(props.options)
  const row=options.find(el=>el[props.valueKey]==value)
  emits('on-change', value,row || {})
}
const handleQueryChange = (query) => {
  searchQuery.value = isOpen.value ? String(query || '') : ''
}
const getHighlightParts = (value) => {
  const text = String(value ?? '')
  const query = searchQuery.value.trim()
  if (!query) return [{ text, matched: false }]

  const parts = []
  const lowerText = text.toLocaleLowerCase()
  const lowerQuery = query.toLocaleLowerCase()
  let start = 0
  let index = lowerText.indexOf(lowerQuery)
  while (index !== -1) {
    if (index > start) parts.push({ text: text.slice(start, index), matched: false })
    parts.push({ text: text.slice(index, index + query.length), matched: true })
    start = index + query.length
    index = lowerText.indexOf(lowerQuery, start)
  }
  if (start < text.length) parts.push({ text: text.slice(start), matched: false })
  return parts.length ? parts : [{ text, matched: false }]
}
const handleOpenChange = (status) => {
  isOpen.value = status
  searchQuery.value = ''
  if (props.multiple || !selectRef.value) return
  if (status) {
    nextTick(() => {
      const select = selectRef.value
      if (!select) return
      if (select.query) {
        select.preventRemoteCall = true
        select.query = ''
      }
      const selectHead = select.$refs?.selectHead
      if (selectHead?.query) {
        selectHead.preventRemoteCall = true
        selectHead.query = ''
      }
      select.filterQueryChange = false
      const input = selectHead?.$refs?.input
      if (input) input.placeholder = props.placeholder
    })
    return
  }
  const select = selectRef.value
  const [selectedOption] = select.values || []
  const query = String(selectedOption?.label || selectedOption?.value || '').trim()
  if (select.query !== query) {
    select.preventRemoteCall = true
    select.query = query
  }
  select.filterQueryChange = false
}
</script>
<style lang="less" scoped>
.optionItem{
  display: flex;
  align-items: center;
  gap: var(--ui-select-option-gap);
  img{
    max-width: var(--ui-select-option-image-size);
    max-height: var(--ui-select-option-image-size);
    box-shadow: var(--ui-shadow-image);
  }
  p{
    flex: 1;
    overflow: hidden;
  }
  &__match{
    color: var(--ui-color-primary);
    font-weight: var(--ui-font-weight-semibold);
  }
}
</style>
<style lang="less">
.form-select-box-dropdown{
  .ivu-select-not-found{
    box-sizing: border-box;
    min-height: var(--ui-line-height-3xl);
    padding: var(--ui-space-8) var(--ui-space-12);
    line-height: var(--ui-line-height-md);
  }
}
</style>
