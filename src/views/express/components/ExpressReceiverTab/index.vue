<template>
  <UiPage ref="pageRef" :data="tableData" row-key="uuid" :isSelect="isSelect" padding="0" isNotTitle @select="select">
    <template #pup>
      <DetailPup ref="detailPupRef" @onConfirm="init"/>
    </template>
  </UiPage>
</template>
<script setup>
import { ref, reactive, onMounted,computed } from 'vue';
import { getApi, postApi } from '@/utils/api';
import { confirmInput } from '@/utils/message';
import { t } from '@/utils/index.js';
import DetailPup from './components/DetailPup.vue'
const detailPupRef=ref(null)
const props = defineProps({
  isSelect: {
    type: Boolean,
    default:false
  },
})
// 状态选项
const statusOptions = [
    { label: t('express.status.auditPassed'), value: '1',type:'success' },
    { label: t('express.status.auditFailed'), value: '-1',type:'error'},
    { label: t('express.status.auditPending'), value: '0',type:'primary' },
];
// 币种列表 - 从API获取
const options = reactive({
  currency:[],
});
const tableData=computed(()=>({
  apiUrl:'/express/receiver/index',
  thead:[
    {
      label: t('express.table.tradeTime'),
      prop:'created_at',
      width: 180,
      wapType:'title',
    },
    {
      label: t('express.table.name'),
      prop: 'name',
      width: 120,
      align: 'left',
      value:(row)=>{
        return `${row.native_first_name} ${row.native_last_name}`
      }
    },
    {
      label: t('express.table.currency'),
      prop:'payout_currency',
      width: 100,
      align:'center',
    },
    {
      label: t('express.table.tag'),
      prop: 'label',
      width: 150,
      align: 'left',
      click:(row)=>{
        confirmInput(t('express.table.tag'),row.label).then(({ value, close }) => {
          postApi('/express/receiver/editLabel',{
            label:value,
            uuid:row.uuid
          }).then(()=>{
            row.label=value
          }).finally(()=>{
            close()
          })
        })
      }
    },
    {
      label: t('express.table.bankAccount'),
      prop: 'bank_account_number',
      minWidth: 180,
      align: 'left'
    },
    {
      label: t('express.table.mobile'),
      prop: 'mobile_number',
      width: 120,
      align: 'left'
    },
    {
      label: t('express.table.status'),
      prop:'status',
      width: 160,
      type:'dot',
      options:statusOptions,
      tipsShow:(row)=>{
        return row.remark
      },
      tips:(row)=>{
        return row.remark
      },
      wapType:'status',
    },
  ],
  actions:[
    {
      label: t('express.actions.detail'),
      click(row){
        detailPupRef.value.open(row)
      }
    },
  ],
  search:{
    status:props.isSelect?'success':''
  },
  searchThead:[
    {
      label: t('express.table.receiverFirstName'),
      prop:'first_name',
      type:'input',
      width:140,
    },
    {
      label: t('express.table.receiverLastName'),
      prop:'last_name',
      type:'input',
      width:140,
    },
    {
      label: t('express.table.currency'),
      prop:'payout_currency',
      type:'select',
      options:options.currency,
      width:140,
    },
    {
      label: t('express.table.tradeStatus'),
      prop:'status',
      type:'select',
      options:statusOptions,
      width:140,
    },
  ],
}))
//获取币种
const getCurrency=async ()=>{
  try {
    const response = await getApi('/express/currency')
    const currencies = response.map(item => item.payout_currency);
    const uniqueCurrencies = [...new Set(currencies)];
    options.currency = uniqueCurrencies.map((item) => {
      return {
        label: item,
        value: item,
      }
    })
  } catch (err) {
    message(err?.msg, 'error')
  } finally {
  }
}
const emit = defineEmits(['init','select'])
const init=()=>{
  pageRef.value.search()
  emit('init')
}
const select=(row,index)=>{
  emit('select',row,index)
}
onMounted(() => {
  getCurrency()
});

</script>

<style scoped>

</style>
