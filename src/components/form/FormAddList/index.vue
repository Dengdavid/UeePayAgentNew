<template>
  <div class="formAddList list-b-8">
    <div
      class="formAddItem"
      :class="{ 'is-item-error': isItemError(item) }"
      v-for="(item, index) in list"
      :key="index"
    >
      <template v-if="typeName === 'input'">
        <template v-if="regexType === 'website'">
          <FormHttp
            v-model="list[index]"
            :regex="regex"
            :regexType="regexType"
            v-bind="attrs"
            @on-change="onChange($event, index)"
          >
          </FormHttp>
        </template>
        <template v-else>
          <FormInput
            v-model="list[index]"
            :regex="regex"
            :regexType="regexType"
            v-bind="attrs"
            @on-change="onChange($event, index)"
          >
          </FormInput>
        </template>
        <Icon class="deleteIcon" type="md-trash" @click="removeBtn(index)" />
      </template>
      <template v-else>
        {{ typeName }}
      </template>
    </div>
    <Button type="text" icon="md-add" @click="addBtn" :disabled="Array.isArray(list) && list.some(item => item === '')">
      {{ `添加${title}` }}
    </Button>
    <FormInput v-model="c_modelValue" v-show="false" />
  </div>
</template>

<script setup>
import { message } from '@/utils/message.js'
import { regexFun } from '@/utils/regex.js'
import { computed, defineProps, nextTick, onMounted, ref, useAttrs, watch } from 'vue'
defineOptions({
  inheritAttrs: false,
})
const attrs = useAttrs()
const props = defineProps({
  modelValue: {
    type: [String, Array],
    default: '',
  },
  title: {
    type: String,
    default: '',
  },
  typeName: {
    type: String,
    default: 'input',
  },
  regex: {
    type: String,
  },
  regexType: {
    type: String,
  },
})
const emits = defineEmits(['update:modelValue', 'on-change'])
const list = ref([])
watch(
  () => list.value,
  (arr) => {
    const arry = Array.isArray(arr) ? arr.map((item) => item.trim()).filter((item) => item !== '') : [];
    const value = Array.isArray(arry) ? arry.join(',') : '';
    emits('update:modelValue', value);
    emits('on-change', value);
  },
  { deep: true }
);
const c_modelValue = computed({
  get() {
    return props.modelValue
  },
  set(value) {
    emits('update:modelValue', value)
  },
})
const getList = () => {
  let arr = []
  if (props.modelValue) {
    if (Array.isArray(props.modelValue)) {
      arr = props.modelValue
    } else if (typeof props.modelValue === 'string') {
      arr = props.modelValue.split(',')
    }
  }
  list.value = arr
  addBtn()
}
const addBtn = () => {
  if (list.value.length > 0) {
    if (list.value.some((item) => item !== '')) {
      list.value.push('')
    }
  } else {
    list.value.push('')
  }

}
const isItemError = (value) => {
  const text = String(value || '').trim()
  if (!text || !props.regexType) return false
  return !regexFun(text, props.regexType, props.regex)
}
const onChange = (value, index, event) => {
  nextTick(() => {
    const hasDuplicate = list.value.some((item, i) => i !== index && item === value);
    if (hasDuplicate) {
      list.value[index] = '';
      // 重新聚焦（可选）
      nextTick(() => {
        event?.target?.focus();
      });
      message('该值已存在，请输入不同的值', 'error')
    }
  })
}
const removeBtn = (index) => {
  list.value.splice(index, 1)
  if (!list.value.length) {
    addBtn()
  }
}
onMounted(() => {
  getList()
})
</script>
<style lang="less" scoped>
.formAddList {
  .formAddItem {
    margin-bottom: 8px;
    display: flex;
    &:not(.is-item-error){
      :deep(.ivu-input),
      :deep(.ivu-input-group-prepend){
        border-color: var(--ui-input-border-color) !important;
        box-shadow: none !important;
      }
      :deep(.ivu-input){
        background: var(--ui-input-background) !important;
      }
      :deep(.ivu-input-group-prepend){
        background: var(--ui-input-addon-background) !important;
        color: var(--ui-color-control-text) !important;
      }
      :deep(.ivu-input-group-prepend .ivu-select-selection){
        border-color: transparent !important;
        box-shadow: none !important;
        background: transparent !important;
        color: var(--ui-color-control-text) !important;
      }
      :deep(.ivu-select-arrow){
        color: var(--ui-color-control-text-muted) !important;
      }
      :deep(.ivu-input:focus),
      :deep(.ivu-input-wrapper-focused .ivu-input){
        border-color: var(--ui-input-border-color-hover) !important;
        box-shadow: var(--ui-input-focus-shadow) !important;
      }
    }
    &.is-item-error{
      :deep(.ivu-input),
      :deep(.ivu-input-group-prepend){
        border-color: var(--ui-input-error-border-color) !important;
        box-shadow: none !important;
      }
      :deep(.ivu-input){
        background: var(--ui-input-background) !important;
      }
      :deep(.ivu-input-group-prepend){
        background: var(--ui-input-error-background) !important;
      }
      :deep(.ivu-input-group-prepend .ivu-select-selection){
        border-color: transparent !important;
        box-shadow: none !important;
        background: transparent !important;
      }
      :deep(.ivu-select-arrow){
        color: var(--ui-color-red-550) !important;
      }
      :deep(.ivu-input:focus),
      :deep(.ivu-input-wrapper-focused .ivu-input){
        border-color: var(--ui-input-error-border-color-focus) !important;
        box-shadow: var(--ui-shadow-focus-error) !important;
      }
    }
  }

  .link {
    display: flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;
  }

  .deleteIcon {
    cursor: pointer;
    width:var(--ui-size-32);
    height:var(--ui-size-32);
    border: var(--ui-border-strong);
    margin-left: 8px;
    border-radius: var(--ui-radius-sm);
    display: flex;
    align-items: center;
    justify-content: center;

    &:hover {
      color: var(--ui-color-error-strong);
      border-color: var(--ui-color-error-strong);
    }
  }
}
</style>
