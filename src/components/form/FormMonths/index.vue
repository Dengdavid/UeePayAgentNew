<template>
  <div class="formMonths">
    <DatePicker
      v-model="c_star"
      type="month"
      :placeholder="$t('datePicker.startMonth')"
      format="yyyy-MM"
      :options="starOptions"
      @on-change="handleChange($event, star)"
    />
    <span class="separator">–</span>
    <DatePicker
      ref="endDatePickerRef"
      v-model="c_end"
      type="month"
      :placeholder="$t('datePicker.endMonth')"
      format="yyyy-MM"
      :options="endOptions"
      @on-change="handleChange($event, end)"
    />
    <Icon
      v-if="hasValue"
      type="ios-close-circle"
      class="clear-icon"
      @click.stop="handleClear"
    />
    <Icon
      type="ios-calendar-outline"
      class="calendar-icon"
      :class="{ 'hide-on-hover': hasValue }"
    />
  </div>
</template>

<script setup>
import { ref, computed, getCurrentInstance, defineProps, nextTick } from 'vue'
const { proxy } = getCurrentInstance()
import { format } from 'date-fns'

const endDatePickerRef = ref(null)

const props = defineProps({
  data: {
    type: [Object],
    default: function () {
      return {}
    },
  },
  star: {
    type: [String],
    default: 'startTime',
  },
  end: {
    type: [String],
    default: 'endTime',
  },
  type: {
    type: [String],
    default: 'endTime',
  },
  disabledDate: {
    type: [String],
    default: '',
  },
})
const c_star=computed({
  get(){
    return props.data[props.star]
  },
  set(value){
    props.data[props.star]=value?format(new Date(value),'yyyy-MM'):''
  }
})
const c_end=computed({
  get(){
    return props.data[props.end]
  },
  set(value){
    props.data[props.end]=value?format(new Date(value),'yyyy-MM'):''
  }
})
const hasValue = computed(() => {
  return !!(props.data[props.star] || props.data[props.end])
})
const emits = defineEmits(['update:data', 'on-change'])
const starOptions = computed(() => {
  return {
    disabledDate(date) {
      if (date) {
        const now = new Date()
        const isFuture = date.getFullYear() > now.getFullYear() || (date.getFullYear() === now.getFullYear() && date.getMonth() > now.getMonth())
        if (isFuture) return true

        const end = props.data?.[props.end]
        if (end) {
          return (
            date.valueOf() > previousMonth(end, 0) ||
            date.valueOf() < previousMonth(props.disabledDate)
          )
        } else if (props.disabledDate) {
          return date.valueOf() < previousMonth(props.disabledDate)
        } else {
          return false
        }
      } else {
        return false
      }
    },
  }
})
const endOptions = computed(() => {
  return {
    disabledDate(date) {
      if (date) {
        const now = new Date()
        const isFuture = date.getFullYear() > now.getFullYear() || (date.getFullYear() === now.getFullYear() && date.getMonth() > now.getMonth())
        if (isFuture) return true

        const star = props.data?.[props.star]
        if (star) {
          return (
            date.valueOf() < previousMonth(star) ||
            date.valueOf() < previousMonth(props.disabledDate)
          )
        } else if (props.disabledDate) {
          return date.valueOf() < previousMonth(props.disabledDate)
        } else {
          return false
        }
      } else {
        return false
      }
    },
  }
})
const previousMonth = (dateValue, num = -1) => {
  if (!dateValue) return null

  // 创建新 Date 实例，避免修改原始值
  const date = new Date(dateValue)

  if (isNaN(date.getTime())) return null

  // 关键：直接减 1 个月
  date.setMonth(date.getMonth() + num)
  return new Date(date).valueOf()
}
const handleChange = (value, key) => {
  props.data[key] = value

  if (key === props.star && value) {
    nextTick(() => {
      if (endDatePickerRef.value) {
        // Find the input element and simulate click/focus to open the dropdown
        const input = endDatePickerRef.value.$el.querySelector('input')
        if (input) {
          input.focus()
          input.click()
        }
      }
    })
  }

  if ((props.data?.[props.star] && props.data?.[props.end]) || (!props.data?.[props.star] && !props.data?.[props.end])) {
    emits('on-change')
  }
}
const handleClear = () => {
  props.data[props.star] = ''
  props.data[props.end] = ''
  emits('on-change')
}
</script>
<style lang="less" scoped>
.formMonths {
  display: flex;
  align-items: center;
  width: 100%;
  border: 1px solid var(--ui-input-border-color);
  border-radius: var(--ui-input-radius);
  background-color: var(--ui-input-background);
  transition:
    border var(--ui-control-transition-duration) var(--ui-ease-standard),
    box-shadow var(--ui-control-transition-duration) var(--ui-ease-standard);
  padding: 0 var(--ui-space-4);
  position: relative;

  &:hover {
    border-color: var(--ui-input-border-color-hover);

    .hide-on-hover {
      display: none;
    }

    .clear-icon {
      display: inline-block;
    }
  }

  &:focus-within {
    border-color: var(--ui-input-border-color-focus);
    box-shadow: var(--ui-input-focus-shadow);
    outline: 0;
  }

  .separator {
    padding: 0 var(--ui-space-4);
    color: var(--ui-input-text-color);
    font-size: var(--ui-font-size-md);
    white-space: nowrap;
  }

  .calendar-icon, .clear-icon {
    font-size: var(--ui-font-size-lg);
    margin-right: var(--ui-space-4);
    margin-left: var(--ui-space-4);
  }

  .calendar-icon {
    color: var(--ui-input-text-muted-color);
  }

  .clear-icon {
    color: var(--ui-input-text-disabled-color);
    display: none; // Hidden by default
    cursor: pointer;

    &:hover {
      color: var(--ui-color-text-secondary);
    }
  }

  :deep(.ivu-date-picker) {
    flex: 1;
    overflow: hidden;

    .ivu-input {
      border: none !important;
      box-shadow: none !important;
      text-align: center;
      background: transparent;
      padding-right: var(--ui-space-8);
    }

    .ivu-input-suffix {
      display: none !important;
    }
  }
}
</style>
