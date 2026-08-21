<template>
  <UiPage ref="pageRef" isBack :data="data" :fallback="{
    name:'ucenter_express'
  }">
    <div class="express-box">
      <Alert show-icon>{{ $t('express.transferInfo.detailAlert') }}</Alert>
      <Form ref="formRef" :model="form" labelPosition="top"  class="list-b-32">
        <FormCell :title="$t('express.transferInfo.transferAmountTitle')" type="primary" isNotShow>
         <div class="express-list">
              <TransferFormItem :data="transferAmount" :form="form" isText/>
          </div>
        </FormCell>
        <FormCell :title="$t('express.transferInfo.tradeInfo')" type="primary">
          <div class="express-list">
              <TransferFormItem :data="formInfo" :form="form" isText/>
          </div>
        </FormCell>
        <template v-if="form.payoutCurrency && form.transferType && form.payoutMethod">
          <FormCell :title="$t('express.transferInfo.senderInfo')" type="primary">
            <div class="express-list">
              <TransferFormItem :data="formData?.sender" :payoutCurrency="form.payoutCurrency" isText :form="form.sender_detail" chilchKey="sender_detail" :notKeys="['payoutMethod','transferType','payoutCurrency']" v-if="isShowForm"/>
            </div>
          </FormCell>
          <FormCell :title="$t('express.transferInfo.receiverInfo')" type="primary">
            <div class="express-list">
              <TransferFormItem :data="formData?.receiver" :payoutCurrency="form.payoutCurrency" isText :form="form.receiver_detail" chilchKey="receiver_detail" :notKeys="['payoutMethod','transferType','payoutCurrency']" v-if="isShowForm"/>
            </div>
          </FormCell>
        </template>
        <FormCell :title="$t('express.transferInfo.transferConfig')" type="primary" isNotShow>
          <div class="express-list">
            <TransferFormItem :data="formData?.common" isText :form="form" :notKeys="['transferAmount']" v-if="isShowForm"/>
          </div>
        </FormCell>
      </Form>
    </div>
  </UiPage>
</template>

<script setup>
import { computed, ref,reactive,onMounted,nextTick, watch } from 'vue'
import { useUserStoreRefs } from '@/utils/store.js'
const { user } = useUserStoreRefs()
import { getApi,postApi } from '@/utils/api.js'
import { message,confirm } from '@/utils/message.js'
import { useRouteParams,useRouteQuery } from '@/utils/route.js'
import TransferInput from '../transfer/components/TransferInput.vue'
import TransferFormItem from '../transfer/components/TransferFormItem.vue'
import { toRoute } from '@/utils/route';
import { t } from '@/utils/index.js'
const props=defineProps({
  isDetail:{
    type:Boolean,
    default:false,
  }
})
const pageRef=ref(null)
const options=reactive({
  currency:[],
})
const USD_OPTION = {
    country: 'USA',
    country_code: 'US',
    country_name: t('express.transferInfo.usa'),
    exchange_rate: 1.00000000,
    max_quota: 1000,
    min_quota: 10,
    payoutCurrency: 'USD'
};
//交易信息
const formInfo=computed(()=>[
  {
    fieldTitle: t('express.transferInfo.tradeTime'),
    fieldName:'created_at',
  },
  {
    fieldTitle: t('express.transferInfo.orderNo'),
    fieldName:'merchant_order_no',
  },
  {
    fieldTitle: t('express.transferInfo.tradeStatus'),
    fieldName:'status_text',
  },
  {
    fieldTitle: t('express.transferInfo.tradeRemark'),
    fieldName:'sender_remark',
  },
  {
    fieldTitle: t('express.transferInfo.complianceStatus'),
    fieldName:'compliance_status_text',
  },
  {
    fieldTitle: t('express.transferInfo.complianceRemark'),
    fieldName:'compliance_remark',
  },
])
//金额信息
const transferAmount=computed(()=>[
  {
    fieldTitle: t('express.transferInfo.sendAmount'),
    fieldName:'sendAmount',
    value:(row)=>{
      return `${row?.sendAmount ?? 0} ${USD_OPTION.payoutCurrency}`
    }
  },
  {
    fieldTitle:t('express.transferInfo.currentRate'),
    fieldName:'transferAmount',
    value:(row)=>{
      return `${sendAmount.value?.rate ?? 0}`
    }
  },
  {
    fieldTitle: t('express.table.receiveAmount'),
    fieldName:'transferAmount',
    value:(row)=>{
      return `${row?.transferAmount ?? 0} ${row?.payoutCurrency}`
    }
  },
  {
    fieldTitle: t('express.transferInfo.fee'),
    fieldName:'transferAmount',
    value:(row)=>{
      return `$ ${sendAmount.value?.feePlatform ?? 0}`
    }
  },
  {
    fieldTitle: t('express.transferInfo.totalCost'),
    fieldName:'transferAmount',
    value:(row)=>{
      return `$ ${sendAmount.value?.costAmount ?? 0}`
    }
  },
])
//到账金额
const data=reactive({
  notPage:true,
  btns:[
    {
      label: t('express.actions.transferAgain'),
      type:'primary',
      click:()=>{
        toRoute('express_transfer',{id:form.merchant_order_no})
      }
    },
  ]
})
const formData=ref()
const form=reactive({
  receiver_uuid: '',// 收款人唯一标识 (可选)
  sender_uuid: '',// 汇款人唯一标识 (可选)
  payoutCurrency:'',// 交易币种 (可选)
  transferType: '', // 转账类型 (可选)
  payoutMethod: '', // 支付方式 (可选)
  purposeOfRemittance: '',// 汇款目的 (可选)
  transferAmount:null, // 支付金额 (可选)
  sendAmount: null, // 汇款金额 (可选)
  senderBeneficiaryRelationship: '',// 收款人关系 (可选)
  senderRemark: '',// 汇款备注 (可选)
  senderSourceOfFund: '', // 资金来源 (可选)
  verifyType: 1,// 验证码类型 (必需，1：邮箱，2：2FA)
  code: '', // 验证码 (必需)
  sender_detail:{},
  receiver_detail:{},
})
const getDetail=async (id,isDetail=false)=>{
  pageRef.value.loading=true
  if(!id){
    return
  }
  await getApi('/express/transactionInfo',{
      merchantOrderNo:id,//交易id
    }).then((res)=>{
      form.created_at=res.created_at//交易时间
      form.merchant_order_no=res.merchant_order_no//交易单号
      form.status_text=res.status_text//交易状态
      form.sender_remark=res.sender_remark || res.error//交易备注
      form.compliance_status_text=res.compliance_status_text//合规资料状态
      form.compliance_remark=res.compliance_remark//合规资料备注
      form.transferType=res.transfer_type_id//转账类型
      form.payoutMethod=res.payout_method_id//支付方式
      form.payoutCurrency=res.payout_currency//交易币种
      form.purposeOfRemittance=res.purpose_of_remittance//汇款目的
      form.transferAmount=res.transfer_amount//转账金额
      form.sendAmount=res.send_amount//汇款金额
      form.senderBeneficiaryRelationship=res.sender_beneficiary_relationship//收款人关系
      form.senderRemark=res.sender_remark//汇款备注
      form.senderSourceOfFund=res.sender_source_of_fund//资金来源
      form.sender_detail=res.sender_detail || {}
      form.receiver_detail=res.receiver_detail || {}
      form.sender_uuid=res.sender_id || res.sender?.uuid || res.sender_detail?.sender_id || ''//汇款人唯一标识
      form.receiver_uuid=res.receiver_id || res.receiver?.uuid || res.receiver_detail?.receiver_id || ''//收款人唯一标识
      sendAmount.value={
        rate:res.exchange_rate,
        feePlatform:res.fee_platform,
        costAmount:res.cost_amount,
      }
      fieldParams()
    }).catch((err)=>{
      message(err?.msg,'error')
      pageRef.value.loading=false
    }).finally(()=>{
    })
}

//获取动态表单参数
const isShowForm=ref(false)
const sortArr=(arr=[])=>{
  return arr.sort((a,b)=>(a.sorting-b.sorting))
}
const getInfo=async ()=>{
  await getDetail(useRouteParams()?.id,false)
  await getCurrency()
}
const fieldParams= ()=>{
  pageRef.value.loading=true
  isShowForm.value=false
  if(form.payoutCurrency && form.transferType && form.payoutMethod){
    getApi('/express/fieldParams',{
      payout_currency:form.payoutCurrency,//交易币种
      transfer_type_id:form.transferType,//转账类型
      payout_method_id:form.payoutMethod,//支付方式
    }).then((res)=>{
      formData.value={
        common:sortArr(res.common),
        receiver:sortArr(res.receiver),
        sender:sortArr(res.sender),
      }
      res.common.forEach(item=>{
        if(item.fieldType!=='select') return
        const oldValue=form[item.fieldName]
        const find=item.selectValues?.find(v=>v.valueId===oldValue)
        if(!oldValue || !find){
          form[item.fieldName]=item.selectValues?.[0]?.valueId || ''
        }
      })
    }).catch((err)=>{
      message(err?.msg,'error')
    }).finally(()=>{
      pageRef.value.loading=false
      isShowForm.value=true
    })
  } else {
    pageRef.value.loading=false
  }
}
//汇率和金额
const sendAmount=ref({})
const sendAmountLoading=ref(false)

const sendAmountRule = {
  validator: (rule, value, callback) => {
    const money = user.value?.money;
    if (value !== '' && value !== null && value !== undefined && money !== undefined && Number(value) > Number(money)) {
      callback(new Error(t('express.transferInfo.balanceNotEnough')));
    } else {
      callback();
    }
  },
  trigger: 'change,blur'
};
const transferTypeName=(type)=>{
  switch (type) {
    case 3:
      return t('express.transferInfo.c2c')
    case 2:
      return t('express.transferInfo.b2c')
    default:
      return type
  }
}
//获取币种
const getCurrency=async ()=>{
  pageRef.value.loading=true
  try {
    const res = await getApi('/express/currency')
    options.currency = res
      .filter((item) => item.country !== 'USA')
      .reduce((acc, item) => {
        const childObj = {
          label: transferTypeName(item.transfer_type_id),
          transfer_type_id: String(item.transfer_type_id),
          payout_method_id: String(item.payout_method_id),
          disabled:String(item.transfer_type_id)==='2' && user.value.auth_type!==1
        }
        const existing = acc.find(c => c.payout_currency === item.payout_currency)
        if (existing) {
          if(childObj.transfer_type_id!=='2'){
            existing.chilch.unshift(childObj)
          }else{
            existing.chilch.push(childObj)
          }
        } else {
          acc.push({ ...item, chilch: [childObj] })
        }
        return acc
      }, [])
    pageRef.value.loading = false
  } catch (err) {
    message(err?.msg, 'error')
    pageRef.value.loading = false
  } finally {
  }
}
onMounted(()=>{
  getInfo()
})
</script>

<style scoped lang="less">
.countryBox{
  display: flex;
  align-items: center;
  gap: 8px;
}
.express-footer {
  margin-top: 24px;
  min-height: 86px;
  .express-footer-info {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: var(--ui-padding-16-24);
    background: #ffffff;
    border-radius:var(--ui-radius-lg);
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.04);
    border: var(--ui-border-subtle);

    .left {
      display: flex;
      flex-direction: column;
      gap: 2px;

      .label {
        font-size: 13px;
        color: var(--ui-color-neutral-600);
        display: flex;
        align-items: center;
        gap: 6px;

        .detail-inline {
          font-size: 12px;
          font-weight: normal;
        }
      }

      .amount {
        color: var(--ui-color-error-strong);
        display: flex;
        align-items: baseline;

        .currency {
          font-size: 16px;
          font-weight: 600;
          margin-right: 4px;
        }

        .value {
          font-size: 28px;
          font-weight: 700;
          line-height: 1;
          font-family: 'Helvetica Neue', Helvetica, 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', Arial, sans-serif;
        }
      }
    }

    .right .submit-btn {
      width: var(--ui-size-160);
      height:var(--ui-size-42);
      border-radius: var(--ui-radius-24);
      font-size: 16px;
      font-weight: 600;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      border: none;
      box-shadow: 0 4px 12px rgba(45, 140, 240, 0.3);
      transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 16px rgba(45, 140, 240, 0.4);
      }

      &:active {
        transform: translateY(1px);
        box-shadow: 0 2px 8px rgba(45, 140, 240, 0.3);
      }
    }
  }
}
.mobile-only {
  display: none;
}

.express-amount-info{
  margin-top: 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  .left{
    display: flex;
    align-items: center;
  }
  .right{
    display: flex;
    align-items: center;
    gap: 8px;
  }
}
.sendAmountLoading{
  display: flex;
  align-items: center;
  gap: 4px;
}
.express-box{
  .express-list{
    padding:12px 0 0;
    display: grid;
    grid-template-columns: repeat(3,minmax(200px,1fr));
    gap:12px;
    &.not{
      padding: 0;
      gap:12px 28px;
    }
    >*{
      margin: 0;
      border-bottom: 1px #eee solid;
      padding-bottom:8px;
      :deep(.formTitle){
        color: var(--ui-color-text-secondary) !important;
      }
    }
    .tips{
      color: var(--ui-color-text-secondary);
      font-size: 12px;
    }
  }
  .express-amount{
    display: flex;
    align-items: center;
    gap:16px;
     >*{
      margin: 0;
    }
    .icon{
      width: var(--ui-size-32);
      height: var(--ui-size-32);
      border-radius: var(--ui-radius-circle);
      border: var(--ui-border-strong);
      display: flex;
      align-items: center;
      justify-content: center;
      margin-top:22px;
    }
    .ivu-form-item{
      flex: 1;
    }
  }
  @media (hover: hover) and (min-width: 769px) {

  }
  @media screen and (max-width: 768px) {
    .express-list {
      grid-template-columns: 1fr;
      gap:28px;
      padding-bottom: 16px;
    }
    .express-amount {
      flex-direction: column;
      align-items: stretch;
      gap: 0;
      .icon {
        margin:var(--ui-margin-12-auto);
        transform: rotate(90deg);
      }
    }
    .express-amount-info {
      flex-direction: column;
      align-items: flex-start;
      justify-content: flex-start;
      gap: 8px;
      .left {
        width: 100%;
        flex-direction: column;
        align-items: flex-start;
        justify-content: flex-start;
        gap: 6px;
        background: #f4f7ff;
        padding: var(--ui-padding-8);
        .ivu-divider{
          display: none;
        }
      }
    }
  }
}

@media screen and (max-width: 768px) {
  .express-footer {
    position: sticky;
    bottom: 0;
    z-index: 99;
    margin: var(--ui-margin-16-neg-16-0-neg-16);

    .express-footer-info {
      justify-content: space-between;
      padding: var(--ui-padding-12-16);
      border-radius: 0;
      background: rgba(255, 255, 255, 0.85);
      backdrop-filter: blur(10px);
      box-shadow: 0 -1px 6px rgba(0,0,0,0.05);
      gap: 12px;

      .left {
        flex: 1;
        min-width: 0;

        .label {
          margin-bottom: 2px;
        }

        .pc-only {
          display: none !important;
        }

        .mobile-only {
          display: block !important;
          font-size: 11px;
          color: var(--ui-color-neutral-600);
          margin-top: 2px;
        }

        .ui-text-error {
          font-size: 16px;
        }
      }

      .right {
        flex-shrink: 0;

        .ivu-btn {
          width: auto;
        }
      }
    }
  }
}

.currency-box {
  padding:var(--ui-padding-24-0);
  background: #fff;
  border-radius: var(--ui-radius-lg);
  text-align: center;

  h3 {
    margin-bottom: 32px;
    font-size: 20px;
    color: var(--ui-color-neutral-900);
    font-weight: 600;
  }

  .currency-list {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
    gap: 24px;
    text-align: left;

    .currency-item {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: var(--ui-padding-20);
      border: var(--ui-border-muted);
      border-radius: var(--ui-radius-2xl);
      cursor: pointer;
      transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);

      &:hover {
        border-color: #2d8cf0;
        box-shadow: 0 8px 24px rgba(45, 140, 240, 0.1);
        transform: translateY(-4px);
        background: #fff;
      }

      .info {
        display: flex;
        flex-direction: column;
        gap: 4px;

        .country {
          font-size: 18px;
          font-weight: 600;
          color: var(--ui-color-neutral-900);
          margin: 0;
          line-height: 1.2;
        }

        .country_name {
          font-size: 14px;
          color: var(--ui-color-neutral-600);
          margin: 0;
          line-height: 1.2;
        }
      }
    }
  }
}
</style>
