<template>
  <Page :total="data.total" :model-value="data.page.page" :page-size="data.page.limit" show-total  show-elevator show-sizer @on-change="pageSize" @on-page-size-change="limitSize" v-if="data"/>
</template>
<script setup>
import { computed, ref } from 'vue'
const props = defineProps({
  data: {
    type:Object,
    default:()=>{
      return {
        total:0,
        page:{
          page:1,
          limit:10
        }
      }
    }
  },
})
const current=ref(0)
const emits=defineEmits(['search'])
const search=()=>{
  emits('search')
}
const pageSize=(page)=>{
  props.data.page.page=page
  search()
}
const limitSize=(limit)=>{
  props.data.page.page=1
  props.data.page.limit=limit
  search()
}
</script>
