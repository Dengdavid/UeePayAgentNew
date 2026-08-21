<template>
  <template v-if="c_optionsArr.length > 0 || loadingOptions">
    <FormSelectBox
      v-model="c_modelValue"
      :options="c_optionsArr"
      :width="width"
      :multiple="multiple"
      :label-key="labelName"
      :value-key="valueName"
      :option-label-key="labelName"
      :transfer="transfer"
      v-bind="{
      ...$attrs,
      placeholder: loadingOptions ? '数据加载中' : placeholder,
      disabled: loadingOptions ? true : disabled,
    }"
      @on-change="handleChange"
    >
      <template #default="{ row }" v-if="$slots.default">
        <slot :row="row"></slot>
      </template>
    </FormSelectBox>
  </template>
  <template v-else>
    <FormInput v-model="c_modelTextValue"></FormInput>
  </template>

</template>

<script>
const remoteOptionsCache = {}
const remoteOptionsPending = {}
</script>

<script setup>
import { get, post } from '@/api/api.js'
import FormSelectBox from '../FormSelectBox/index.vue'
import { computed, defineEmits, ref, watch } from 'vue'
const props = defineProps({
  modelValue: {
    type: [Array, Number, String, null],
  },
  label: {
    type: String,
  },
  width: {
    type: [String, Number],
    default: '100%',
  },
  placeholder: {
    type: String,
    default: '请选择',
  },
  labelName: {
    type: String,
    default: 'label',
  },
  valueName: {
    type: String,
    default: 'value',
  },
  isArr: {
    type: Boolean,
    default: false,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  multiple: {
    type: Boolean,
    default: false,
  },
  transfer: {
    type: Boolean,
    default: false,
  },
  apiUrl: {
    type: String,
    default: '',
  },
  params: {
    type: Object,//请求参数
    default: () => ({}),
  },
  optionsObj: {
    type: Object,
  },
  optionsKey: {
    type: String,
  },
  optionsFilter: {
    type: [Array, String],
    default: () => [],
  },
  method: {
    type: String,
    default: 'get',
  },
  options: {
    type: [Array, Object, String],
    default: () => [],
  },
})
const emits = defineEmits(['update:modelValue', 'update:label', 'on-change', 'noData'])
const uniqueByValue = (list, getValue) => {
  const seen = new Set()
  return list.filter((item) => {
    const value = getValue(item)
    if (seen.has(value)) return false
    seen.add(value)
    return true
  })
}
const c_modelValue = computed({
  get() {
    if (props.multiple) {
      return Array.isArray(props.modelValue) ? [...props.modelValue] : props.modelValue ? String(props.modelValue).split(',') : []
    }
    return props.modelValue
  },
  set(val) {
    const values = uniqueByValue(Array.isArray(val) ? val : val || val === 0 ? [val] : [], item => item)
    if (values.length > 0) {
      if (props.multiple) {
        const arrList = uniqueByValue(
          c_optionsArr.value.filter(item => values.includes(item[props.valueName])),
          item => item[props.valueName]
        )
        const arrName = arrList.map(item => item[props.labelName])
        if (props.isArr) {
          emits('update:modelValue', values)
          emits('update:label', arrName)
        } else {
          emits('update:modelValue', values.join(','))
          emits('update:label', arrName.join(','))
        }
      } else {
        const value = values[0]
        emits('update:modelValue', value)
        emits('update:label', c_optionsArr.value.find(item => item[props.valueName] === value)?.[props.labelName])
      }
    } else {
      if (props.multiple && props.isArr) {
        emits('update:modelValue', [])
      } else {
        emits('update:modelValue', null)
      }
      emits('update:label', null)
    }

  },
})

const c_modelTextValue = computed({
  get() {
    return props.modelValue
  },
  set(val) {
    emits('update:modelValue', val)
  },
})
const c_options = ref([])
const localOptions = computed(() => setOptions(props.options))
const c_optionsArr = computed(() => {
  let arr = []
  if (Array.isArray(props.optionsFilter)) {
    arr = props.optionsFilter
  } else if (typeof props.optionsFilter === 'string') {
    arr = props.optionsFilter.split(',').map(item => item.trim())
  }
  const _options = localOptions.value.length > 0 ? localOptions.value : c_options.value
  const _newArr = _options.filter(item => !arr.includes(item[props.valueName]))
  return _newArr
})
const setOptions = (options = props.options) => {
  let arr = []
  if (Array.isArray(options)) {
    arr = options.map(item => {
      if (typeof item === 'object' && item !== null) {
        return item
      } else {
        return {
          [props.labelName]: item,
          [props.valueName]: item
        }
      }
    })
  } else if (typeof options === 'object' && options !== null) {
    for (const key in options) {
      if (Object.prototype.hasOwnProperty.call(options, key)) {
        const value = /^\d+$/.test(key) && (typeof props.modelValue === 'number' || props.modelValue === null)
          ? Number(key)
          : key
        arr.push({
          [props.labelName]: options[key],
          [props.valueName]: value,
        })
      }
    }
  } else if (typeof options === 'string') {
    const _strArr = options.split(',').map(s => s.trim()).filter(Boolean)
    if (_strArr.length > 0) {
      arr = _strArr.map(item => ({
        [props.labelName]: item,
        [props.valueName]: item
      }))
    }
  }
  return arr
}
const loadingOptions = ref(false)
const stableSerialize = (value) => {
  if (!value || typeof value !== 'object') return String(value ?? '')
  if (Array.isArray(value)) return `[${value.map(stableSerialize).join(',')}]`
  return `{${Object.keys(value).sort().map(key => `${key}:${stableSerialize(value[key])}`).join('|')}}`
}
const normalizeOptionsResponse = (res) => {
  if (Array.isArray(res)) return res
  if (Array.isArray(res?.data)) return res.data
  if (Array.isArray(res?.list)) return res.list
  return []
}
const requestKey = computed(() => {
  if (!props.apiUrl) return ''
  if (props.optionsKey) return props.optionsKey
  const params = props.params || {}
  const paramsKey = stableSerialize(params)
  return [(props.method || 'get').toLowerCase(), props.apiUrl, paramsKey].filter(Boolean).join('|')
})

const loadOptions = async () => {
  const key = requestKey.value
  if (props.optionsObj && key && Object.prototype.hasOwnProperty.call(props.optionsObj, key)) {
    c_options.value = Array.isArray(props.optionsObj[key]) ? props.optionsObj[key] : []
  } else if (key && Object.prototype.hasOwnProperty.call(remoteOptionsCache, key)) {
    c_options.value = remoteOptionsCache[key]
  } else if (props.apiUrl) {
    try {
      loadingOptions.value = true
      if (!remoteOptionsPending[key]) {
        remoteOptionsPending[key] = props.method?.toLowerCase() === 'post'
          ? post(props.apiUrl, props.params)
          : get(props.apiUrl, props.params)
      }
      const res = await remoteOptionsPending[key]
      if (key !== requestKey.value) return
      c_options.value = normalizeOptionsResponse(res)
      if (c_options.value.length === 0) {
        emits('noData')
      }
      if (key) {
        remoteOptionsCache[key] = c_options.value
      }
      if (props.optionsObj && key) {
        props.optionsObj[key] = c_options.value
      }
    } catch (error) {
      c_options.value = []
    } finally {
      if (key) {
        delete remoteOptionsPending[key]
      }
      if (key === requestKey.value) {
        loadingOptions.value = false
      }
    }
  } else {
    // 本地 options 处理逻辑（保持不变）
    c_options.value = localOptions.value
  }
}
watch(
  () => requestKey.value,
  () => loadOptions(),
  { immediate: true }
)


const handleChange = (value) => {
  emits('on-change', value)
}
</script>
