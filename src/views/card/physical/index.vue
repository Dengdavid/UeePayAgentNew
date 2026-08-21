<template>
	<UiPage ref="pageRef" :fallback="{name:'card'}" isBack :pageRightStyle="pageRightStyle" >
    <div class="card-wrap list-b-8 building-wrap">
      <img src="@/assets/images/empty.png" alt="building" class="building-img" />
      <div class="building-text">{{ $t('card.index.physical.underConstruction') }}</div>
    </div>
    <!-- <template #pageRight v-if="!isPhone">
      <MailingAddress/>
    </template> -->
  </UiPage>
</template>

<script setup>
import MailingAddress from "./components/MailingAddress.vue";
import { ref,onMounted,reactive } from "vue";
import { postApi } from "@/utils/api";
import { message } from "@/utils/message";
import { isPhone } from '@/utils/device'
const pageRightStyle=ref({
  width:'350px',
  minHeight:'800px',
  background: 'linear-gradient(180deg, #fff2db, #fff5e300 80px), #fff',

})
const pageRef=ref(null)
const bins=ref([])
const loading=ref(false)
const tableData=reactive({
  tbody:[]
})
const getBins=()=>{
  pageRef.value.loading=true
  postApi('/vcc/bins').then((res)=>{
    bins.value=res
  }).catch((err)=>{
    message(err?.msg,'error')
  }).finally(()=>{
    pageRef.value.loading=false
  })
}
onMounted(()=>{
  getBins()
})
</script>

<style lang="less" scoped>
.card-wrap{
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  .title{
    font-size:20px;
    font-weight: 700;
  }
  .desc{
    color: var(--grey-color);
  }
}
.building-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 120px 0;

  .building-img {
    width: var(--ui-size-240);
    margin-bottom: 24px;
  }
  .building-text {
    color: var(--grey-color);
  }
}
</style>
