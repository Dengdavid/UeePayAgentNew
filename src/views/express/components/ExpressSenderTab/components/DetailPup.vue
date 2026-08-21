<template>
  <FormPupBox :pup="pup" :inner="false">
    <template #default="{form}">
      <div class="form-column list-b-22">
         <template v-for="item in fields">
          <FormItemBox :label="item.fieldTitle" :prop="item.fieldName" :tips="item.fieldDescription"  :rules="rulesArr(item)" :isRequired="item.required" v-if="!['payoutMethod','transferType','payoutCurrency'].includes(item.fieldName)">
            <UiFormItem :label='item.fieldTitle' :prop="item.fieldName" :row="form" :item="item" :type="item.fieldType" :options="item.selectValues" :disabled="true"  labelKey="value" valueKey="valueId"/>
          </FormItemBox>
        </template>
      </div>
    </template>
  </FormPupBox>
</template>

<script setup>
  import { ref, reactive, computed,onMounted,nextTick } from 'vue'
  import { message,confirm } from '@/utils/message'
  import { getApi } from '@/utils/api'
  import { t } from '@/utils/index.js'

  const emit = defineEmits(['onConfirm']);
  const pup = reactive({
    status: false,
    title: t('express.detail.senderDetail'),
    isNotFooter:true,
    labelPosition: 'top',
    width:400,
    form: {

    },
    //操作
    actions: [
      {
        label: t('card.detail.sceneBox.confirm'),
        permission:'',
        click: (pup) => {
          emit('onConfirm',pup.form)
        }
      },
    ]
  })
  const fields=ref([])
  const rulesArr=(item)=>{
  const rules=[]
    //需要新增验证规则
    if(item.regex){
      rules.push({
        pattern: item.regex,
        message: item.regexMessage || t('express.transfer.formatError', { field: item.fieldTitle }),
        trigger: 'blur',
      })
    }
    return rules
  }
  const close=()=>{
    pup.status = false
    pup.buttonLoading = false
  }
  const buttonLoading=()=>{
    pup.buttonLoading = false
    pup.loading = false
  }
  const open = async (row)=>{
    pup.loading=true
    pup.status=true
    getApi('/express/sender/info',{
      uuid:row.uuid
    }).then((res)=>{
      pup.row=row
      fields.value=res.fields.sort((a,b)=>a.sorting-b.sorting)
      res.fields.forEach(item=>{
        pup.form[item.fieldName]=item.fieldValue
      })
      pup.loading=false
    }).catch((err)=>{
      message(err?.msg || err,'error')
      close()
    }).finally(()=>{
    })
  }
  defineExpose({ open,close,buttonLoading });
  onMounted(() => {

  });
</script>

<style scoped lang="less">
.form-column{
  padding: var(--ui-padding-0-0-8);
}
</style>
