import i18n from '@/locales/index.js'
const t = i18n.global.t
import { reactive, ref } from 'vue'
import { Copy, Modal } from 'view-ui-plus'
import { confirmInput, message } from '@/utils/message.js'
import { postApi } from "@/utils/api.js";
import Decimal from 'decimal.js';
import { agentData } from '@/utils/agent.js'
const options = {
    switch: [
        { label: t('groupManagement.yes'), value: true,type:'success' },
        { label: t('groupManagement.no'), value: false,type:'error' }
    ],
    type:[
        { label: t('groupManagement.fee'), value: 'fee' },
        { label: t('groupManagement.fee_rate'), value: 'fee_rate' },
    ]
}

const data=reactive({
    list:[],
    loading:false
})

//删除定价
const deleteBtn=(row)=>{
    Modal.confirm({
        title: t('groupManagement.delete'),
        width: 340,
        content: '<p>'+t('groupManagement.deleteConfirm')+'</p>',
        okText: t('groupManagement.confirm'),
        cancelText: t('groupManagement.cancel'),
        onOk: () => {
            row.deleting = true
            postApi('/user/agentSite/groupDelete',{id:row.id})
                .then(() => {
                    message(t('groupManagement.success'))
                    getData()
                })
                .catch((err) => {
                    message(err?.msg || t('groupManagement.error'), 'error')
                }).finally(() => {
                    row.deleting = false
                })
        },
    })
}
//保存
const saveBtn=(form, row)=>{
    if (row) row.saving = true
    const urlApi=form.id?'/user/agentSite/groupEdit':'/user/agentSite/groupCreate'
    postApi(urlApi,{
        id: form.id ?? null,
        title:form.title,
        price:form.price,
        create_amount:form.create_amount.markup.fee,
        account_depost_fee:new Decimal(form.account_depost_fee.markup.fee_rate || 0).div(100).toNumber(),
        card_depost_fee:new Decimal(form.card_depost_fee.markup.fee_rate || 0).div(100).toNumber(),
        sort:form.sort,
        auth_fee_config:{
            fee:form.auth_fee_config.markup.fee,
            fee_rate:new Decimal(form.auth_fee_config.markup.fee_rate || 0).div(100).toNumber(),
        },
        foreign_fee_config:{
            fee:form.foreign_fee_config.markup.fee,
            fee_rate:new Decimal(form.foreign_fee_config.markup.fee_rate || 0).div(100).toNumber(),
        },
    })
        .then((res) => {
            message(t('groupManagement.success'))
            getData()
        }).catch((err) => {
            message(err?.msg || t('groupManagement.error'), 'error')
        }).finally(() => {
            if (row) row.saving = false
        })
}

const copyInviteCode=(row)=>{
    const {invite_code}=row
    if(!invite_code){
        message(t('groupManagement.invite_code_empty'), 'error')
        return
    }
    const {site_protocol,site_domain}=agentData() || {}
    Copy({
        text:`${site_protocol}://${site_domain}/login?invite_code=${invite_code || ''}`,
        success:()=>{
        },
        error:()=>{
        }
    })
}
//辅助
const isMax=ref(false)
const getNameInputOptions=(title)=>({
    title,
    maxlength:20,
    pattern:/^.{1,20}$/u,
    placeholder:t('groupManagement.pleaseInput'),
    msg:`${t('groupManagement.pleaseInput')}${title}`,
})
const copyBtn=(row)=>{
    if(isMax.value){
        message(t('groupManagement.maxNum'), 'error')
        return
    }
    const title=t('groupManagement.clone')
    confirmInput(title,row.title_alias || row.title,getNameInputOptions(title))
        .then(({value,close})=>{
            close()
            saveBtn({
                ...row.form,
                title:value,
                id:null,
                sort:data.list.length+1
            })
        })
}
//修改别名
const eidtName=(row)=>{
    const title=t('groupManagement.title_alias')
    confirmInput(title,row.title_alias || row.title,getNameInputOptions(title))
        .then(({value,close})=>{
            close()
            if(row.agent_site_id){
                saveBtn({
                    ...row.form,
                    title:value,
                })
            }else{
                postApi('/user/agentSite/groupAlias',{id:row.id,title_alias:value})
                .then(() => {
                    message(t('groupManagement.success'))
                    getData()
                }).catch((err) => {
                    message(err?.msg || t('groupManagement.error'), 'error')
                })
            }
        })
}
//是否显示
const groupVisible=(row)=>{
    const {id,is_visible}=row
    postApi('/user/agentSite/groupVisible',{
        id,
        is_visible:is_visible?1:0
    })
    .then((res)=>{
        message(t('groupManagement.success'))
        getData()
    }).catch((err)=>{
        message(err?.msg || t('groupManagement.error'), 'error')
    })
}
const getMarkup=(config)=>{
    const defaultValue={
        fee:0,
        fee_rate:0
    }
    if(!config || typeof config!=='object' || Array.isArray(config)){
        return defaultValue
    }
    const row=Object.values(config)[0]
    if(!row || typeof row!=='object'){
        return defaultValue
    }
    return {
        fee:row.fee || 0,
        fee_rate:new Decimal(row.fee_rate || 0).mul(100).toNumber()
    }
}

const editBtn=(row)=>{
   row.isEdit=true
   row.formCopy=JSON.parse(JSON.stringify(row.form))
}
const cancelBtn=(row)=>{
   row.isEdit=false
   row.form=JSON.parse(JSON.stringify(row.formCopy))
}
const priceList=[
    {
        key:'account_depost_fee',//账户充值费
        feeType:'fee_rate',
        destKey:'account_depost_fee_dest'
    },
    {
        key:'create_amount',//卡片激活费
        feeType:'fee',
        destKey:'create_amount_dest'
    },
    {
        key:'card_depost_fee',//卡片转入费
        feeType:'fee_rate',
        destKey:'card_depost_fee_dest'
    },
    {
        key:'auth_fee_config',//交易手续费
        feeType:null,
        destKey:'auth_fee_config_dest'
    },
    {
        key:'foreign_fee_config',//跨境手续费
        feeType:null,
        destKey:'foreign_fee_config_dest'
    }
]
const getCount=(item,key)=>{
    const systemValue=getMarkup(item?.[key]?.system)
    const markupValue=getMarkup(item?.[key]?.markup)
    return {
        system:systemValue,
        markup:markupValue,
    }
}
const sumCount=(item)=>{
    const systemValue=item?.system || {}
    const markupValue=item?.markup || {}
    return {
        fee:new Decimal(systemValue?.fee || 0).add(new Decimal(markupValue?.fee || 0)).toNumber(),
        fee_rate:new Decimal(systemValue?.fee_rate || 0).add(new Decimal(markupValue?.fee_rate || 0)).toNumber(),
    }
}
const toFormNumber=(value)=>{
    const decimalValue=new Decimal(value ?? 0)
    if(!decimalValue.isFinite()){
        throw new TypeError('group price must be a finite number')
    }
    return decimalValue.toNumber()
}
const getData=()=>{
    data.loading=true
    postApi('/user/agentSite/groupList')
    .then((res)=>{
        if(!Array.isArray(res)){
            throw new TypeError('groupList response must be an array')
        }
        data.list=res.map(el=>{
            const countObj={}
            priceList.forEach(item=>{
                countObj[item.key]=getCount(el,item.key)
            })
            return {
                ...el,
                form:{
                    id:el.id,
                    title:el.title_alias || el.title,
                    price:toFormNumber(el.price),
                    sort:el.sort,
                    ...countObj,
                },
            }
        })
        isMax.value=data.list.filter(el=>el.agent_site_id)?.length>=4
    }).catch((err)=>{
        message(err?.msg || t('groupManagement.error'), 'error')
    }).finally(()=>{
        data.loading=false
    })
}

const fee_rate_change=(row)=>{
    const {fee_rate}=row
    if(new Decimal(fee_rate || 0).greaterThanOrEqualTo(100)){
        message(t('groupManagement.fee_rate_max'), 'error')
        row.fee_rate=null
    }
}
const onDragEnd=()=>{
    // Handle the end of the drag if needed
    const list=data.list.map((item,index)=>({
        id:item.id,
        sort:index+1
    }))
    postApi('/user/agentSite/groupSort',list)
        .then((res) => {
            message(t('groupManagement.success'))
            getData()
        }).catch((err) => {
            message(err?.msg || t('groupManagement.error'), 'error')
        })
}
export {
    options,
    isMax,
    data,
    priceList,
    copyInviteCode,
    getData,
    groupVisible,
    eidtName,
    deleteBtn,
    copyBtn,
    onDragEnd,
    saveBtn,
    sumCount,
    editBtn,
    cancelBtn,
    fee_rate_change,
}
