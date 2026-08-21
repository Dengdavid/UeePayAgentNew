<template>
  <Form ref="formRef" :model="form" :rules="rules">
    <Row :gutter="20" class="form-row">
      <Col span="12">
        <div class="mb-10"><span class="required">*</span>{{ $t('card.index.cardholder.basicInfo') }}
          <Tooltip :content="$t('card.index.cardholder.nameTip')">
            <Icon custom="iconfont icon-question" color="#9e9e9e" class="ui-pointer"/>
          </Tooltip>
        </div>
        <FormItem prop="first_name">
          <Input v-model="form.first_name" :placeholder="$t('card.index.cardholder.firstNamePlaceholder')"/>
        </FormItem>
      </Col>
      <Col span="12">
        <div class="mb-10">&nbsp;
          <span style="float: right;">
          </span>
        </div>
        <FormItem prop="last_name">
          <Input v-model="form.last_name" :placeholder="$t('card.index.cardholder.lastNamePlaceholder')"/>
        </FormItem>
      </Col>
    </Row>

    <Row :gutter="20" class="form-row">
      <Col span="12">
        <div class="mb-10"><span class="required">*</span>{{ $t('card.index.cardholder.contactInfo') }}</div>
        <FormItem prop="phone_number">
          <PhoneInput v-model="form.phone_number" v-model:phoneCode="form.phone_country_code"></PhoneInput>
        </FormItem>
      </Col>
      <Col span="12">
        <div class="mb-10">&nbsp;</div>
        <FormItem prop="email">
          <Input v-model="form.email" type="email" :placeholder="$t('card.index.cardholder.emailPlaceholder')"/>
        </FormItem>
      </Col>
    </Row>
    
    <!-- 移除地址信息和出生日期部分 -->
  </Form>
</template>

<script setup>
import { ref, defineEmits, defineExpose } from 'vue'
import { cardApi } from '@/api'
import { Message } from 'view-ui-plus'
import { message } from '@/utils/message.js'
import { generateRandomName as generateName } from '@/libs/nameGenerator.js'
import PhoneInput from '@/components/utils/phone-input.vue'
import countriesJson from '@/config/countries.json'
import { t } from '@/utils'

const countriesData = countriesJson
const statesData = ref({})

const emit = defineEmits(['on-success', 'on-error'])

const formRef = ref()
const submiting = ref(false)
const form = ref({
  first_name: '',
  last_name: '',
  phone_country_code: '86',
  phone_number: '',
  email: ''
})

const rules = {
  first_name: [
    { required: true, message: t('card.index.cardholder.firstNameRequired'), trigger: 'blur' }
  ],
  last_name: [
    { required: true, message: t('card.index.cardholder.lastNameRequired'), trigger: 'blur' }
  ],
  phone_number: [
    { required: true, message: t('card.index.cardholder.phoneRequired'), trigger: 'blur' },
    { pattern: /^[0-9-]*$/, message: t('card.index.cardholder.phoneInvalid'), trigger: 'blur' }
  ],
  email: [
    { required: true, message: t('card.index.cardholder.emailRequired'), trigger: 'blur' },
    { type: 'email', message: t('card.index.cardholder.emailInvalid'), trigger: 'blur' }
  ]
}

const generateRandomName = () => {
  const randomName = generateName()
  form.value.first_name = randomName.firstName
  form.value.last_name = randomName.lastName
}

const submit = async () => {
  if (submiting.value) return false
  
  return new Promise((resolve, reject) => {
    formRef.value.validate(async (valid) => {
      if (!valid) {
        reject(new Error(t('card.index.cardholder.validationFailed')))
        return
      }
      
      try {
        submiting.value = true
        
        const params = {
          cardholder: {
            first_name: form.value.first_name,
            last_name: form.value.last_name,
            date_of_birth: form.value.date_of_birth ? new Date(form.value.date_of_birth).toISOString().split('T')[0] : '',
            email: form.value.email,
            phone_country_code: form.value.phone_country_code,
            phone_number: form.value.phone_number,
            address: {
              country: form.value.country,
              state: form.value.state,
              city: form.value.city,
              postal_code: form.value.postal_code,
              address_line1: form.value.address_line1,
              address_line2: form.value.address_line2
            }
          }
        }
        
        const res = await cardApi.createCardholder(params)
        
        message(t('card.index.cardholder.addSuccess'))
        resetForm()
        emit('on-success', res)
        resolve(res)
        
      } catch (err) {
        const errorMsg = err.msg || t('card.index.cardholder.addFailed')
        message(errorMsg, 'error', {
            duration: 5
        });
        emit('on-error', err)
        reject(err)
      } finally {
        submiting.value = false
      }
    })
  })
}

const resetForm = () => {
  form.value = {
    first_name: '',
    last_name: '',
    phone_country_code: '86',
    phone_number: '',
    email: ''
  }
  formRef.value?.resetFields()
}

defineExpose({
  submit,
  resetForm,
  submiting,
  form
})

// 移除 handleCancel 和 handleSubmit 方法
// 只保留 submit 方法供外部调用
</script>

<style scoped>
.mb-10 {
  margin-bottom: 10px;
}
.required {
  color: var(--ui-color-error-strong);
}
.ui-text-gray {
  color: var(--ui-color-neutral-550);
}
.ui-text-grey {
  color: var(--ui-color-neutral-550);
}
.ui-pointer {
  cursor: pointer;
}
.mt-20 {
  margin-top: 20px;
}
.ui-render-input {
    display: flex;
}
.ui-render-input .ui-render-actions {
    flex-shrink: 0;
    margin-left: 20px;
    padding-top: 12px;
    line-height: 16px;
}
.cardholder-footer {
  position: sticky;
  bottom: 0;
  margin-top: 30px;
  padding: 15px 0;
  background: #fff;
  border-top: 1px solid #e8eaec;
  display: flex;
  justify-content: flex-end;
  align-items: center;
}
.mr-10 {
  margin-right: 10px;
}
.form-row {
  margin-bottom: 20px;
}

.form-row:last-of-type {
  margin-bottom: 40px; /* 最后一行与按钮区域保持更大间距 */
}
</style>
