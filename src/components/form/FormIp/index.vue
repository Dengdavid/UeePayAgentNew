<template>
  <div class="ip-input" :class="{
    isFocus: isFocus
  }">
    <template v-for="(item, index) in c_modelValue">
      <span v-if="index!==0">·</span>
      <InputNumber :ref="(el) => inputRefs[index] = el" :max="255" :min="0" v-model.trim="c_modelValue[index]" placeholder="0" :precision="0" :step="1"
        @on-change="handleChange($event, index)" @on-focus="setFocus(true)"  @on-blur="setFocus(false)"/>
    </template>
  </div>
</template>

<script setup>
import validator from 'validator';
import { computed, defineProps, getCurrentInstance, nextTick, onMounted, ref } from 'vue';
const { proxy } = getCurrentInstance()
const props = defineProps({
  modelValue: {
    type: String,
    default: null,
  },
  index: {
    type: Number,
  }
})
const emits = defineEmits(['update:modelValue', 'on-change'])
const c_modelValue = computed({
  get() {
    if (props.modelValue) {
      return props.modelValue.split('.').map((el) => el || el===0? Number(el):null)
    } else {
      return [null, null, null, null]
    }
  },
  set(value) {
  },
})
// 初始化 ref 数组（长度要匹配）
const inputRefs = ref([])

const isFocus = ref(false)
const setFocus = (isFocusValue) => {
  isFocus.value = isFocusValue
  const ip= c_modelValue.value.join('.')
  if (!isFocusValue && validator.isIP(ip)) {
    setIp(ip)
    nextTick(() => {
      emits('on-change', props.index)
    })
  }
}
const setIp = (ip) => {
  emits('update:modelValue', ip)
}
const handleChange = (value, index) => {
  if (value >= 100) {
    nextTick(() => {
      const input = inputRefs.value[index + 1]?.$el.querySelector('input')
      if (input) {
        input.focus()
        input.select()
      } else {
        inputRefs.value[index]?.$el.querySelector('input').blur()
      }
    })
  }
}
onMounted(() => {
})
</script>
<style lang="less">
  .ip-input{
    border: var(--ui-ip-input-border);
    border-radius: var(--ui-radius-sm);
    width: 100%;
    background-color: var(--ui-input-background);
    display: flex;
    align-items: end;
    padding:var(--ui-padding-0-16);
    gap: 16px;
    &:hover{
      border-color: var(--ui-ip-input-border-color-interactive);
    }
    &.isFocus {
      border-color: var(--ui-ip-input-border-color-interactive);
      outline: 0;
      box-shadow: var(--ui-shadow-focus-brand);
    }
    .ivu-input-number{
      flex: 1;
      border: none;
      box-shadow: none;
      .ivu-input-number-handler-wrap{
        display: none;
      }
      .ivu-input-number-input{
        text-align: center;
      }
    }
    span{
      line-height:32px;
    }
  }
</style>
