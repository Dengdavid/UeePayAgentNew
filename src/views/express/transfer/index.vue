<template>
  <UiPage ref="pageRef" isBack :fallback="{
    name:'ucenter_express'
  }" :data="data">
    <div class="express-box">
      <Alert show-icon  type="warning">{{ $t('express.transferInfo.transferAlert') }}</Alert>
      <Form ref="formRef" :model="form" labelPosition="top"  class="list-b-32">
        <FormCell :title="$t('express.transferInfo.transferConfig')" type="primary" isNotShow>
          <div class="express-list">
            <FormItemBox :label="$t('express.transferInfo.payoutCurrency')" prop="payoutCurrency" :desc="$t('express.transferInfo.payoutCurrencyDesc')" isRequired>
              <FormSelectBox v-model="form.payoutCurrency" :options="options.currency" labelKey="country" valueKey="payout_currency" :disabled="c_disabled"  :clearable="false" @on-change="changePayoutCurrency">
                <template #prefix>
                  <div class="p-x-4" v-if="form.payoutCurrency && currencyRow?.country_code">
                    <StateIcon :name="currencyRow?.country_code" size="small"/>
                  </div>
                </template>
                <template #default="{row}">
                  <div class="countryBox">
                    <StateIcon :name="row?.country_code" size="small"/>
                    <span>{{ row.country }}</span>
                    <span>{{ row.country_name }}</span>
                  </div>
                </template>
              </FormSelectBox>
            </FormItemBox>
            <FormItemBox :label="$t('express.transferInfo.transferType')" prop="transferType"  :desc="$t('express.transferInfo.transferTypeDesc')"  isRequired v-if="form.payoutCurrency">
              <FormSelectBox v-model="form.transferType" :options="currencyRow?.chilch || []" labelKey="label" valueKey="transfer_type_id" :disabled="c_disabled" :clearable="false"  @on-change="changeTransferType"></FormSelectBox>
            </FormItemBox>
            <TransferFormItem :data="formData?.common" :form="form" :notKeys="['transferType','transferAmount']" :disabled="c_disabled" v-if="isShowForm"/>
          </div>
        </FormCell>
        <FormCell :title="$t('express.transferInfo.transferAmountTitle')" type="primary" isNotShow>
          <template #btn>
            <div v-if="sendAmountLoading" class="sendAmountLoading">
              <Icon type="ios-loading" size="18" class="is-loading" />
              <span>{{ $t('express.transferInfo.calculating') }}</span>
            </div>
          </template>
          <div class="express-amount">
            <FormItemBox :label="$t('express.transferInfo.sendAmount')" prop="sendAmount" isRequired :rules="[sendAmountRule]">
              <TransferInput v-model="form.sendAmount" :country="USD_OPTION.payoutCurrency" :row="USD_OPTION" :max="Number(user?.money || 0)" :disabled="c_disabled" @on-change="exchangeAmountChange($event, 'send_amount')" @on-blur="exchangeAmount($event,'send_amount')"/>
            </FormItemBox>
            <Icon class="icon" type="ios-arrow-round-forward" size="26"/>
            <FormItemBox :label="$t('express.transferInfo.receiveAmount')" :labelSub="`(${currencyRow?.min_quota ?? 0} ~ ${currencyRow?.max_quota ?? $t('express.transferInfo.unlimited')} ${form.payoutCurrency})`" prop="transferAmount" isRequired :rules="[transferAmountRule]">
              <TransferInput v-model="form.transferAmount" v-model:country="form.payoutCurrency" :min="Number(currencyRow?.min_quota || 0)" :disabled="c_disabled" :max="currencyRow?.max_quota ? Number(currencyRow?.max_quota) : undefined" :row="currencyRow" @on-change="exchangeAmountChange($event, 'transfer_amount')" @on-blur="exchangeAmount($event,'transfer_amount')"/>
            </FormItemBox>
          </div>
          <div class="express-amount-info">
              <div class="left">
                <span>{{form.merchant_order_no ? $t('express.transferInfo.currentRate') : $t('express.transferInfo.realTimeRate')}}：1 {{ USD_OPTION.payoutCurrency }} = {{ sendAmount?.rate ?? currencyRow?.exchange_rate ?? '-' }} {{ form.payoutCurrency }}</span>
              </div>
              <div class="right">
                <span class="ui-text-primary">{{ $t('express.transferInfo.availableBalance') }} $ {{ user?.money || '0.000' }}</span>
              </div>
            </div>
        </FormCell>
        <template v-if="form.payoutCurrency && form.transferType && form.payoutMethod">
          <FormCell :title="$t('express.transferInfo.senderInfo')" type="primary">
            <div class="express-list">
              <TransferFormItem :data="formData?.sender" :payoutCurrency="form.payoutCurrency" @on-change="handleFormChange('sender')" :form="form.sender_detail" chilchKey="sender_detail" :disabled="c_disabled" :notKeys="['payoutMethod','transferType','payoutCurrency']" v-if="isShowForm"/>
            </div>
          </FormCell>
          <FormCell :title="$t('express.transferInfo.receiverInfo')" type="primary">
            <div class="express-list">
              <TransferFormItem :data="formData?.receiver" :payoutCurrency="form.payoutCurrency" @on-change="handleFormChange('receiver')" :form="form.receiver_detail" chilchKey="receiver_detail" :disabled="c_disabled" :notKeys="['payoutMethod','transferType','payoutCurrency']" v-if="isShowForm"/>
            </div>
          </FormCell>
        </template>
        <div class="express-footer" v-if="isShowForm && !isMobileKeyboardOpen">
          <Affix :offset-bottom="10">
            <div class="express-footer-info">
              <div class="left">
                <div class="label">
                  <span>{{ $t('express.transferInfo.totalAmount') }}</span>
                  <span class="detail-inline pc-only" v-if="sendAmount.costAmount">
                    ( {{ $t('express.transferInfo.remit') }} $ {{form.sendAmount || 0}} + {{ $t('express.transferInfo.fee') }} $ {{sendAmount.feePlatform ?? 0}} )
                  </span>
                </div>
                <div class="amount">
                  <span class="currency">$</span>
                  <span class="value">{{sendAmount.costAmount ?? 0}}</span>
                </div>
                <div class="detail-inline mobile-only" v-if="sendAmount.costAmount">
                  {{ $t('express.transferInfo.remit') }} $ {{form.sendAmount || 0}} + {{ $t('express.transferInfo.fee') }} $ {{sendAmount.feePlatform ?? 0}}
                </div>
              </div>
              <div class="right">
                <Button type="primary" :loading="submitLoading" class="submit-btn" @click="submit">
                  <span>{{ $t('express.transferInfo.remitNow') }}</span>
                  <Icon type="ios-arrow-forward" />
                </Button>
              </div>
            </div>
          </Affix>
        </div>
      </Form>
    </div>
    <template #pup>
      <UiTableSelect ref="tableSelectRef" @select="select"/>
    </template>
  </UiPage>
</template>

<script setup>
import { computed, ref,reactive,onMounted,onBeforeUnmount,nextTick, watch } from 'vue'
import { useUserStoreRefs } from '@/utils/store.js'
const { user } = useUserStoreRefs()
import { getApi,postApi } from '@/utils/api.js'
import { message,confirm } from '@/utils/message.js'
import { useRouteParams,useRouteQuery } from '@/utils/route.js'
import TransferInput from './components/TransferInput.vue'
import TransferFormItem from './components/TransferFormItem.vue'
import UiTableSelect from '@/components/uiForm/UiTableSelect/index.vue'
import StateIcon from '@/components/ui/state-icon.vue'
import { debounce } from "@/libs/tools.js"
import { toRoute } from '@/utils/route';
import { t } from '@/utils/index.js'
const pageRef=ref(null)
const setPageLoading = (value) => {
  if (!pageRef.value) return
  pageRef.value.loading = value
}
const options=reactive({
  currency:[],
})
const submitLoading=ref(false)
const isMobileKeyboardOpen = ref(false)
let keyboardStateTimer = null
let viewportBaselineHeight = 0

const isEditableElement = (element) => {
  return element instanceof HTMLElement && (
    ['INPUT', 'TEXTAREA'].includes(element.tagName) ||
    element.isContentEditable
  )
}

const updateMobileKeyboardState = () => {
  const isMobile = window.matchMedia('(max-width: 768px)').matches
  if (!isMobile) {
    isMobileKeyboardOpen.value = false
    return
  }

  const viewport = window.visualViewport
  const viewportHeight = viewport?.height || window.innerHeight
  if (!viewportBaselineHeight || viewportHeight > viewportBaselineHeight) {
    viewportBaselineHeight = viewportHeight
  }

  isMobileKeyboardOpen.value = viewport
    ? viewportBaselineHeight - viewportHeight > 120
    : isEditableElement(document.activeElement)
}

const handleFocusChange = () => {
  clearTimeout(keyboardStateTimer)
  keyboardStateTimer = setTimeout(updateMobileKeyboardState, 100)
}

const handleOrientationChange = () => {
  viewportBaselineHeight = 0
  clearTimeout(keyboardStateTimer)
  keyboardStateTimer = setTimeout(updateMobileKeyboardState, 300)
}

const c_disabled=computed(()=>{
  return submitLoading.value
})
const currencyRow=computed(()=>{
  const res=options.currency?.find((item)=>item.payout_currency === form.payoutCurrency)
  return res
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
    fieldType:'input',
  },
  {
    fieldTitle: t('express.transferInfo.orderNo'),
    fieldName:'merchant_order_no',
    fieldType:'input',
  },
  {
    fieldTitle: t('express.transferInfo.tradeStatus'),
    fieldName:'status_text',
    fieldType:'input',
  },
  {
    fieldTitle: t('express.transferInfo.tradeRemark'),
    fieldName:'sender_remark',
    fieldType:'input',
  },
  {
    fieldTitle: t('express.transferInfo.complianceStatus'),
    fieldName:'compliance_status_text',
    fieldType:'input',
  },
  {
    fieldTitle: t('express.transferInfo.complianceRemark'),
    fieldName:'compliance_remark',
    fieldType:'input',
  },
])
//到账金额
const payoutMoney=ref(null)
const tableSelectRef=ref(null)
const data=reactive({
  notPage:true,
  btns:[
    {
      label: t('express.transferInfo.selectHistory'),
      icon:'md-search',
      click:()=>{
        tableSelectRef.value?.open(t('express.transferInfo.selectHistory'))
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
const getDetail=async (id)=>{
  setPageLoading(true)
  if(!id){
    return
  }
  await getApi('/express/transactionInfo',{
      merchantOrderNo:id,//交易id
    }).then((res)=>{
      form.transferType=res.transfer_type_id//转账类型
      form.payoutMethod=res.payout_method_id//支付方式
      form.payoutCurrency=res.payout_currency//交易币种
      form.purposeOfRemittance=res.purpose_of_remittance//汇款目的
      form.transferAmount=null//转账金额
      form.sendAmount=null//汇款金额
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
      setPageLoading(false)
    }).finally(()=>{
    })
}

const select=(row)=>{
  getDetail(row.merchant_order_no)
}

const handleFormChange = (type) => {
  if (type === 'sender') form.sender_uuid = ''
  if (type === 'receiver') form.receiver_uuid = ''
}
//获取动态表单参数
const isShowForm=ref(false)
const sortArr=(arr=[])=>{
  return arr.sort((a,b)=>(a.sorting-b.sorting))
}
const getInfo=async ()=>{
  if(useRouteQuery()?.id){
    await getDetail(useRouteQuery()?.id,false)
  }else if(useRouteParams()?.id){
    await getDetail(useRouteParams()?.id,true)
  }
  await nextTick()
  await getCurrency()
}
const fieldParams= ()=>{
  setPageLoading(true)
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
      exchangeAmount(last_amount.value==='send_amount'?form.sendAmount || 0:form.transferAmount || 0,last_amount.value)
      if(form.transferType==='2'){
        if(user.value.auth_type!==1){
          message(t('express.transferInfo.corporateOnly'),'error')
        }else if(!form.sender_detail.senderCorporateId){
          getApi('/user/certifications/getFields').then((res)=>{
            form.sender_detail.senderCorporateId=res?.certification?.company_code || ""
          })
        }
      }
    }).catch((err)=>{
      message(err?.msg,'error')
    }).finally(()=>{
      setPageLoading(false)
      isShowForm.value=true
    })
  } else {
    setPageLoading(false)
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

const transferAmountRule = {
  validator: (rule, value, callback) => {
    const row = currencyRow.value;
    if (value !== '' && value !== null && value !== undefined) {
      if (row?.max_quota && Number(value) > Number(row.max_quota)) {
        callback(new Error(t('express.transferInfo.maxAmount', { max: row.max_quota, currency: form.payoutCurrency })));
      } else if (row?.min_quota && Number(value) < Number(row.min_quota)) {
        callback(new Error(t('express.transferInfo.minAmount', { min: row.min_quota, currency: form.payoutCurrency })));
      } else {
        callback();
      }
    } else {
      callback();
    }
  },
  trigger: 'change,blur'
};

let lastReqKey = ''
const debouncedExchangeAmount = debounce((key) => {
  const val = key === 'send_amount' ? form.sendAmount : form.transferAmount
  exchangeAmount(val, key)
}, 500)

//输入框改变
const exchangeAmountChange=(value,key)=>{
  sendAmountLoading.value=true
  debouncedExchangeAmount(key)
}
const last_amount=ref('transfer_amount')
//金额换算
const exchangeAmount=(value,key)=>{
    last_amount.value=key
    if(!value){
      if(key==='send_amount'){
        form.transferAmount=null
      }else if(key==='transfer_amount'){
        form.sendAmount=null
      }
      sendAmountLoading.value=false
      sendAmount.value.feePlatform=null
      sendAmount.value.costAmount=null
      lastReqKey = ''
      return
    }
    const currentReqKey = `${value}_${key}_${form.payoutCurrency}_${form.transferType}_${form.payoutMethod}`
    if(lastReqKey === currentReqKey) {
      sendAmountLoading.value=false
      return
    }
    sendAmountLoading.value=true
    lastReqKey = currentReqKey

    const formObj={
      payout_currency:form.payoutCurrency,//交易币种
      transfer_type:form.transferType,//转账类型
      payout_method:form.payoutMethod,//支付方式
      [key]:value
    }
     postApi('/express/exchangeAmount',formObj).then((res)=>{
      sendAmount.value={
          sendAmount:Number(res.sendAmount ?? 0),
          transferAmount:Number(res.transferAmount ?? 0),
          feePlatform:Number(res.feePlatform ?? 0),
          costAmount:Number(res.costAmount ?? 0),
          rate:Number(res.rate ?? 0)
      }
      if (key !== 'send_amount') form.sendAmount = Number(res.sendAmount ?? 0)
      if (key !== 'transfer_amount') form.transferAmount = Number(res.transferAmount ?? 0)
      sendAmountLoading.value=false
    }).catch((err)=>{
      message(err?.msg,'error')
      lastReqKey = ''
      sendAmountLoading.value=false
    }).finally(()=>{
    })
}
//获取转帐类型
const changeTransferType=(value,row)=>{
  if(!row) return
  form.transferType=row.transfer_type_id
  form.payoutMethod=row.payout_method_id
  fieldParams()
}
//改变币种
const changePayoutCurrency=(value,row)=>{
  if(!row) return
form.payoutCurrency=row.payout_currency
  changeTransferType('',row.chilch?.[0])
}
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
  setPageLoading(true)
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
    if(!form.payoutCurrency){
      const lastCurrency=localStorage.getItem("last_selected_currency")?JSON.parse(localStorage.getItem("last_selected_currency")) : {}
      const transferInfo=localStorage.getItem("transferInfo")?JSON.parse(localStorage.getItem("transferInfo")) : {}
      const express_form=localStorage.getItem("express_form")?JSON.parse(localStorage.getItem("express_form")) : {}
      if(lastCurrency.country){
        form.payoutCurrency=lastCurrency.payout_currency
        form.transferType=String(lastCurrency.transfer_type_id)
        form.payoutMethod=String(lastCurrency.payout_method_id)
        if(transferInfo?.amount){
          form.transferAmount=Number(transferInfo.amount)
          last_amount.value='transfer_amount'
        }
        localStorage.removeItem("last_selected_currency")
        localStorage.removeItem("transferInfo")
        fieldParams()
      }else if(express_form.payoutCurrency){
        //form重置下，不然会拿last
        Object.assign(form, express_form)
        fieldParams()
      }else{
        changePayoutCurrency(null,options.currency?.[0])
      }
    }else{
      setPageLoading(false)
    }
  } catch (err) {
    message(err?.msg, 'error')
    setPageLoading(false)
  } finally {
  }
}
//提交

const formRef=ref(null)
const setForm=(arr,key)=>{
  const obj={}
  arr.forEach(item=>{
    if(!['payoutMethod','transferType','payoutCurrency'].includes(item.fieldName)){
      if(key){
        obj[item.fieldName]=form[key][item.fieldName]
      }else{
        obj[item.fieldName]=form[item.fieldName]
      }
    }
  })
  return obj
}
const submit=()=>{
  formRef.value.validate(async (valid) => {
    if (!valid) return
    if(user.value?.money<sendAmount.value.costAmount){
      confirm(t('express.transferInfo.insufficientBalance'),{
        title:t('express.transferInfo.tips'),
        okText:t('express.transferInfo.goRecharge'),
      }).then(()=>{
        toRoute('ucenter_deposit')
      })
      return
    }
    submitLoading.value = true
    const {common,receiver,sender}=formData.value
    const newform={
      sender_detail: setForm(sender,'sender_detail'),
      receiver_detail: setForm(receiver,'receiver_detail'),
      ...setForm(common),
      receiver_uuid:form.receiver_uuid,
      sender_uuid:form.sender_uuid,
      payoutCurrency:form.payoutCurrency,
      transferType:form.transferType,
      payoutMethod:form.payoutMethod,
      sendAmount:String(form.sendAmount),
    }
    postApi('/express/transaction', newform)
      .then(res=>{
        localStorage.removeItem("express_form")
        message(t('express.transferInfo.submitSuccess'), 'success')
        toRoute('ucenter_express',{type:'history'})
      }).catch(err=>{
        message(err?.msg, 'error')
      }).finally(()=>{
        submitLoading.value = false
      })
  })
}
//保存表单数据到localStorage
watch(() => form, (newVal) => {
  if(newVal){
    localStorage.setItem('express_form',JSON.stringify(newVal))
  }
},{
  deep:true
});
onMounted(()=>{
  getInfo()
  viewportBaselineHeight = window.visualViewport?.height || window.innerHeight
  document.addEventListener('focusin', handleFocusChange)
  document.addEventListener('focusout', handleFocusChange)
  window.addEventListener('resize', updateMobileKeyboardState)
  window.addEventListener('orientationchange', handleOrientationChange)
  window.visualViewport?.addEventListener('resize', updateMobileKeyboardState)
})

onBeforeUnmount(() => {
  clearTimeout(keyboardStateTimer)
  document.removeEventListener('focusin', handleFocusChange)
  document.removeEventListener('focusout', handleFocusChange)
  window.removeEventListener('resize', updateMobileKeyboardState)
  window.removeEventListener('orientationchange', handleOrientationChange)
  window.visualViewport?.removeEventListener('resize', updateMobileKeyboardState)
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
    padding:8px 0 16px;
    display: grid;
    grid-template-columns: repeat(3,minmax(200px,1fr));
    gap:28px;
    &.not{
      padding: 0;
      gap:12px 28px;
    }
    >*{
      margin: 0;
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
