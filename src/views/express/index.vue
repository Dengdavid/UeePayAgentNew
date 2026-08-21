<template>
  <UiPage ref="pageRef" :data="tableData" row-key="merchant_order_no" isNotTitle  :isSelect="isSelect"  @select="select">
    <template #banner v-if="!isSelect">
      <div class="banner-image">
        <img
          class="banner-background"
          src="@/assets/images/express_list_bg.png"
          alt=""
          aria-hidden="true"
        />
        <div class="banner-copy">
          <h2 :title="$t('express.banner.title')">{{ $t('express.banner.title') }}</h2>
          <p :title="$t('express.banner.subtitle')">{{ $t('express.banner.subtitle') }}</p>
        </div>
      </div>
    </template>
  </UiPage>
</template>
<script setup>
import { ref, reactive, onMounted, computed } from 'vue';
import { toRoute } from '@/utils/route';
import { t } from '@/utils/index.js';
const props = defineProps({
  isSelect: {
    type: Boolean,
    default:false
  },
})
// 状态文本映射
const statusMaps = {
  wait_process:{
    label: t('express.status.wait_process'),
    type:'warning'
  },
  processing:{
    label: t('express.status.processing'),
    type:'primary'
  },
  success:{
    label: t('express.status.success'),
    type:'success'
  },
  fail:{
    label: t('express.status.fail'),
    type:'error'
  },
  partner_processing:{
    label: t('express.status.partner_processing'),
    type:'primary'
  },
  PendingSubmit:{
    label: t('express.status.PendingSubmit'),
    type:'primary'
  },
  SubmitFailed:{
    label: t('express.status.SubmitFailed'),
    type:'error'
  },
};
const statusList = [
  {
    label: t('express.status.all'),
    value: '',
  },
  ...Object.entries(statusMaps).map(([value, item]) => ({
    label: item.label,
    value,
  })),
]
const isCompliance=(row)=>{
  return ['processing', 'partner_processing'].includes(row.status) && ['pending_check', 'rejected'].includes(row.compliance_status)
}
const tableData=computed(()=>({
  apiUrl:'/express/transactionLists',
  statusKey:'status',
  status:statusList,
  thead:[
    {
      label: t('express.table.orderNo'),
      prop:'merchant_order_no',
      width:220,
      wapType:'title',
    },
    {
      label: t('express.table.tradeTime'),
      prop:'created_at',
      width: 180,
    },
    {
      label: t('express.table.currency'),
      prop:'currency',
      width: 100,
      align:'center',
      value:(row)=>{
        return `${row.payout_currency}`
      }
    },
    {
      label: t('express.table.sendAmount'),
      prop:'costAmount',
      width: 120,
      value:(row)=>{
        return `$ ${row.cost_amount}`
      }
    },
    {
      label: t('express.table.receiveAmount'),
      prop:'transferAmount',
      width: 140,
      value:(row)=>{
        return `${row.transfer_amount} ${row.payout_currency}`
      }
    },
    {
      label: t('express.table.type'),
      prop:'transfer_type_value',
      width:140,
      align:'center',
    },
    {
      label: t('express.table.sender'),
      prop: 'sender',
      width: 140,
      align: 'left',
      value:(row)=>{
        return `${row.sender_detail?.senderCorporateId || `${row.sender_detail?.senderFirstName} ${row.sender_detail?.senderLastName}`}`
      }
    },
    {
      label: t('express.table.receiver'),
      prop: 'receiver',
      width: 150,
      align: 'left',
      value:(row)=>{
        return `${row.receiver_detail?.receiverNativeFirstName || row.receiver_detail?.receiverFirstName || ''} ${row.receiver_detail?.receiverNativeLastName || row.receiver_detail?.receiverLastName || ''}`
      }
    },
    {
      label: t('express.table.status'),
      prop:'status',
      width: 160,
      type:'dot',
      options:statusMaps,
      tipsShow:(row)=>{
        return row.error && row.status === 'fail'
      },
      tips:(row)=>{
        return row.error
      },
      wapType:'status',
    },
    {
      label: t('express.table.complianceStatus'),
      prop: 'compliance_status_text',
      minWidth: 160,
      align: 'left',
      style:(row)=>{
        return {
            color:isCompliance(row)?'var(--ui-color-notice)':''
        }
      },
      value:(row)=>{
        return isCompliance(row)?t('express.table.supplementCompliance'):row.compliance_status_text
      }
    },
  ],
  actions:[
    {
      label: t('express.actions.detail'),
      click(row){
        toRoute('express_detail',{id:row.merchant_order_no},'params')
      }
    },
    {
      label: t('express.actions.expressTransfer'),
      disabled:(row)=>{
        return row.status!=='success'
      },
      click(row){
        toRoute('express_transfer',{id:row.merchant_order_no})
      }
    },
    // {
    //   disabled:(row)=>{
    //     return !isCompliance(row)
    //   },
    //   click(row){
    //     console.log('click',row);
    //   }
    // }
  ],
  search:{},
  searchThead:[
    {
      label: t('express.table.sender'),
      prop:'sender_name',
      type:'input',
      width:140,
    },
    {
      label: t('express.table.receiver'),
      prop:'receiver_name',
      type:'input',
      width:140,
    },
    {
      label: t('express.table.tradeDate'),
      type:'daterange',
      width:220,
    },
  ],
  btns:[
    {
      label: t('express.actions.initiateTransfer'),
      icon:'md-add',
      type:'primary',
      click:()=>{
        toRoute('express_transfer')
      }
    },
  ]
}))

const emit = defineEmits(['init','select'])
const init=()=>{
  emit('init')
}
const select=(row,index)=>{
  emit('select',row,index)
}
onMounted(() => {

});

</script>

<style scoped lang="less">
.banner-image {
  position: relative;
  min-height: 120px;
  overflow: hidden;
  border-radius: var(--ui-radius-lg);
  aspect-ratio: 25 / 3;
}

.banner-background {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.banner-copy {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  width: calc(100% - 150px);
  box-sizing: border-box;
  height: 100%;
  min-height: 120px;
  padding: 20px 40px;
  color: #8d4d00;

  h2,
  p {
    margin: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  h2 {
    font-size: 28px;
    font-weight: 700;
    line-height: 1.35;
  }

  p {
    margin-top: 6px;
    color: #b66d18;
    font-size: 15px;
    line-height: 1.6;
  }
}

@media screen and (max-width: 768px) {
  .banner-image {
    min-height: 112px;
    aspect-ratio: auto;
  }

  .banner-copy {
    width: calc(100% - 88px);
    min-height: 112px;
    padding: var(--ui-padding-16-20);

    h2 {
      font-size: 20px;
    }

    p {
      font-size: 13px;
      line-height: 1.45;
    }
  }
}
</style>
