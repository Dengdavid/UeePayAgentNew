<template>
  <Modal v-model="c_modelValue" :footer-hide="actions.length === 0" class-name="vertical-center-modal" :title="title" v-bind="$attrs">
    <slot></slot>
    <template #footer>
      <div class="footer">
        <div class="l"></div>
        <div class="r">
          <Button size="default"  @click="setValue(false)">取消</Button>
          <Button type="primary" size="default" :loading="loading" @click="handleOk(action)" v-for="action in actions">
            {{ action.label}}
          </Button>
        </div>
      </div>
    </template>
  </Modal>
</template>

<script setup>
import { computed, defineProps, getCurrentInstance } from 'vue'
const { proxy } = getCurrentInstance()
const props = defineProps({
  modelValue: {
    type: Boolean,
    default: null,
  },
  title: {
    type: String,
  },
  loading: {
    type: Boolean,
    default: false,
  },
  actions: {
    type: Array,
    default: () => [],
  },
})
const emits = defineEmits(['update:modelValue','update:loading', 'on-change'])
const c_modelValue = computed({
  get() {
    return props.modelValue
  },
  set(value) {
    setValue(value)
  },
})
const setValue = (value) => {
  emits('update:modelValue', value)
}
const cancel = () => {
  setValue(false)
}
const handleOk = (action) => {
  emits('update:loading', true)
  if(action.click && typeof action.click==='function') {
    action.click()
  }
  emits('on-change', action)
}
</script>
<style lang="less" scoped>
.footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  button+button{
    margin: 0;
  }
  >*{
    display: flex;
    align-items: center;
    gap: var(--ui-dialog-footer-gap);
  }
}
.vertical-center-modal {
  display: flex;
  align-items: center;
  justify-content: center;
  .ivu-modal {
    top: 0;
  }
}
</style>
