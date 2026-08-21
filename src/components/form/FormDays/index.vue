<template>
  <DatePicker v-model="c_modelValue" :options="c_options" separator=" ~ " :type="type" :format="c_format" :style="{
    width: typeof width === 'number' ? width + 'px' : width,
  }" :placeholder="type === 'daterange' ? '开始日期 ~ 结束日期' : '选择日期'" v-bind="$attrs" @on-change="handleChange" />
</template>

<script setup>
import { format, isValid, subMonths } from 'date-fns'
import { computed, defineProps, getCurrentInstance, onMounted } from 'vue'

const { proxy } = getCurrentInstance()
const props = defineProps({
  modelValue: {
    type: [Array, Object, String, null],
  },
  dataName: {
    type: [String, Array],
    default: '',
  },
  type: {
    type: String,
    default: 'daterange',
  },
  min: {
    type: String,
    default: 'startTime',
  },
  max: {
    type: String,
    default: 'endTime',
  },
  months: {
    type: Number,
  },
  disableAfterToday: {
    type: Boolean,//禁用当天之后的日期
    default: false,
  },
  width: {
    type: [String, Number],
    default: '100%',
  },
})
const c_format = computed(() => {
  if (['daterange', 'date'].includes(props.type)) {
    return 'yyyy-MM-dd'
  } else if (['datetimerange', 'datetime'].includes(props.type)) {
    return 'yyyy-MM-dd HH:mm:ss'
  }
})
const setQuickDate = (number, type) => {
  const now = new Date()
  const _format = c_format.value
  if (type === 'month') {
    const start = subMonths(now, number)
    return [format(start, _format), format(now, _format)]
  }
  return []
}
const c_options = computed(() => {
  const ONE_DAY_MS = 24 * 60 * 60 * 1000 // 一天的毫秒数
  const disabledDate = (date) => {
    if (props.disableAfterToday) {
      return date && date.valueOf() > Date.now() + ONE_DAY_MS
    } else {
      return false
    }
  }
  if (props.type === 'daterange') {
    return {
      disabledDate,
      // shortcuts: [
      //   { text: '近1个月', value: () => setQuickDate(1, 'month') },
      //   { text: '近3个月', value: () => setQuickDate(3, 'month') },
      //   { text: '近6个月', value: () => setQuickDate(6, 'month') },
      // ],
    }
  } else if (props.type === 'date') {
    return {
      disabledDate,
      // shortcuts: [
      //   { text: '昨天', value: () => format(addDays(new Date(), -1), c_format.value) },
      //   { text: '前天', value: () => format(addDays(new Date(), -2), c_format.value) },
      //   { text: '7天前', value: () => format(addDays(new Date(), -7), c_format.value) },
      // ],
    }
  }
  return null
})
const setValue = (value) => {
  const _format = c_format.value
  const formatDateSafe = (d) => {
    if (!d) return ''
    // 如果 d 已经是字符串（如 '2025-12-29'），直接返回
    if (typeof d === 'string') return d
    // 否则假设是 Date 对象
    return isValid(d) ? format(d, _format) : ''
  }

  if (['daterange', 'datetimerange'].includes(props.type)) {
    if (Array.isArray(props.modelValue)) {
      emits('update:modelValue', value ? [formatDateSafe(value?.[0]), formatDateSafe(value?.[1])] : [])
    } else if (isPlainObject(props.modelValue) && props.min && props.max) {
      props.modelValue[props.min] = formatDateSafe(value?.[0])
      props.modelValue[props.max] = formatDateSafe(value?.[1])
    } else {
      emits('update:modelValue', value ? `${formatDateSafe(value?.[0])},${formatDateSafe(value?.[1])}` : '')
    }
  } else {
    emits('update:modelValue', formatDateSafe(value))
  }
}
const isPlainObject = (val) => {
  return val !== null &&
    typeof val === 'object' &&
    val.constructor === Object;
}
const emits = defineEmits(['update:modelValue', 'on-change'])
const c_modelValue = computed({
  get() {
    if (['daterange', 'datetimerange'].includes(props.type)) {
      if (!props.modelValue) {
        return []
      } else if (typeof props.modelValue === 'string') {
        const dateArr = props.modelValue.split(',')
        return [dateArr?.[0] || null, dateArr?.[1] || null]
      } else if (typeof props.modelValue === 'object' && props.min && props.max) {
        return [
          props.modelValue[props.min] || null,
          props.modelValue[props.max] || null
        ]
      } else {
        return props.modelValue || []
      }
    } else {
      return props.modelValue || null
    }
  },
  set(value) {
    setValue(value)
  },
})

const handleChange = (value) => {
  emits('on-change', value)
}
const defaultMonths = () => {
  if (props.months) {
    if (['daterange', 'datetimerange'].includes(props.type)) {
      setValue(setQuickDate(props.months, 'month'))
    }
  }
}
onMounted(() => {
  defaultMonths()
})
</script>
