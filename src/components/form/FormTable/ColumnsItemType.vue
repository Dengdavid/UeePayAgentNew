<template>
  <template v-if="data.type==='dot'">
    <FormDot v-model="row[data.key]" :options="data.options"/>
  </template>
  <template v-else-if="data.type==='text'">
    <FormOptionsText v-model="row[data.key]" :options="data.options"/>
  </template>
  <template v-else-if="data.type==='json'">
    <FormJson :data="row[data.key]"/>
  </template>
  <template v-else-if="data.type==='link'">
    <span v-if="row[data.key]">
        <a :href="`${data.url || ''}${row[data.key]}`" target="_blank">区块信息</a>
    </span>
    <span v-else>--</span>
  </template>
  <template v-else>
    {{ row[data.key] }}
  </template>
</template>

<script setup>
import { computed, getCurrentInstance, ref,onMounted,reactive } from 'vue'
const { proxy } = getCurrentInstance()
const props = defineProps({
  data: {
    type: Object,
  },
  row:{
    type: Object,
  },
  index:{
    type: Number,
  }
})
const emits=defineEmits(['search'])
const search=()=>{
  emits('search')
}
</script>
