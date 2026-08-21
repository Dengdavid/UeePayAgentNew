<template>
  <template v-if="['input', 'textarea'].includes(item.type)">
    <FormInput v-model="data[item.key]" :type="item.type === 'input' ? 'text' : item.type" size="default" :placeholder="`请输入${item.title}`" v-bind="$attrs"
      @on-change="handleChange" />
  </template>
  <template v-else-if="['select'].includes(item.type)">
    <FormSelectBox v-model="data[item.key]" :options="item.options" size="default" :placeholder="`请选择${item.title}`" v-bind="$attrs"
      @on-change="handleChange" />
  </template>
  <template v-else-if="['monthrange'].includes(item.type) && item.key?.length===2">
    <FormMonths :data="data" :star="item.key[0]" :end="item.key[1]"  size="default" disabledDate="2025-10" :placeholder="`请选择${item.title}`" v-bind="$attrs"
      @on-change="handleChange" />
  </template>
  <template v-else-if="['daterange','date','month'].includes(item.type)">
    <template v-if="Array.isArray(item.key) && item.key?.length===2">
      <FormDateBox :data="data" :startKey="item.key[0]" :endKey="item.key[1]" size="default" :disableAfterToday="item.disableAfterToday" :type="item.type" @on-change="handleChange"/>
    </template>
    <template v-else>
      <FormDateBox v-model="data[item.key]" size="default" :type="item.type" :disableAfterToday="item.disableAfterToday" @on-change="handleChange"/>
    </template>
  </template>
  <template v-else>
   {{ item.type }}
  </template>
</template>

<script setup>
import { computed, defineProps, getCurrentInstance, onMounted } from 'vue'
import request from '@/api/request.js'
const { proxy } = getCurrentInstance()
const props = defineProps({
  data: {
    type: Object,
    default: () => {}
  },
  item: {
    type: Object,
    default: () => {}
  },
})
const emits = defineEmits(['update:modelValue', 'on-change'])
const c_modelValue = computed({
  get() {
    return props.modelValue
  },
  set(val) {
    emits('update:modelValue', val)
  },
})
const handleChange = (value) => {
  emits('on-change', value)
}

const initRemoteOptions = async () => {
  if (props.item?.type === 'select' && props.item?.url) {
    try {
      const res = await request({
        url: props.item.url,
        method: 'post',
        data: {}
      })
      if (Array.isArray(res)) {
        props.item.options = res.map(row => {
          return {
            label: row.bin || row.name || row.label || row[props.item.key],
            value: row.bin || row.value || row[props.item.key]
          }
        })
      }
    } catch (e) {
    }
  }
}

onMounted(() => {
  initRemoteOptions()
})
</script>
