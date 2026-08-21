<template>
  <Form ref="formRef" :model="form" :rules="rules">
    <Row :gutter="20">
      <Col span="12">
        <div class="mb-10">持卡人姓名<span class="required">*</span>
          <Tooltip content="支持中文和拼音">
            <Icon custom="iconfont icon-question" color="#9e9e9e" class="ui-pointer"/>
          </Tooltip>
        </div>
        <FormItem prop="firstName">
          <Input v-model="form.firstName" placeholder="名字/First Name"/>
        </FormItem>
      </Col>
      <Col span="12">
        <div class="mb-10">&nbsp;
          <span style="float: right;">
            <span class="ui-text-gray" style="cursor: pointer;" @click="generateRandomName">快速生成</span>
          </span>
        </div>
        <FormItem prop="lastName">
          <Input v-model="form.lastName" placeholder="姓氏/Last Name"/>
        </FormItem>
      </Col>
    </Row>

    <Row :gutter="20">
      <Col span="12">
        <div class="mb-10">手机&邮箱<span class="required">*</span></div>
        <FormItem prop="phone">
          <PhoneInput v-model="form.phone" v-model:phoneCode="form.phoneCode"></PhoneInput>
        </FormItem>
      </Col>
      <Col span="12">
        <div class="mb-10">&nbsp;</div>
        <FormItem prop="email">
          <Input v-model="form.email" type="email" placeholder="邮箱/Email"/>
        </FormItem>
      </Col>
    </Row>

    <Row :gutter="20">
      <Col span="12">
        <FormItem prop="country">
          <Select placeholder="国家/Country" v-model="form.country" filterable clearable>
            <Option v-for="item in countriesData" :key="item.alpha3" :value="item.code">
              {{ countryName(item) }}（<span class="ui-text-grey">{{ item.alpha3 }}</span>）
            </Option>
          </Select>
        </FormItem>
      </Col>
      <Col span="12">
        <FormItem prop="state">
          <Select placeholder="州省/State" v-model="form.state" filterable clearable>
            <Option v-for="(item, key) in statesData" :key="key" :value="item">{{ key }}</Option>
          </Select>
        </FormItem>
      </Col>
      <Col span="12">
        <FormItem prop="city">
          <Input v-model="form.city" placeholder="城市/City"/>
        </FormItem>
      </Col>
      <Col span="12">
        <FormItem prop="postalCode">
          <Input v-model="form.postalCode" placeholder="邮编/Postal Code（Zip）"/>
        </FormItem>
      </Col>
      <Col span="12">
        <FormItem prop="addressLine1">
          <Input v-model="form.addressLine1" placeholder="详细地址1/Address Line1"/>
        </FormItem>
      </Col>
      <Col span="12">
        <FormItem prop="addressLine2">
          <Input v-model="form.addressLine2" placeholder="详细地址2/Address Line2"/>
        </FormItem>
      </Col>
    </Row>
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
const countryName = item => t(item.name_key) || item.name

// 需要添加 statesData，或者从其他地方导入
const statesData = ref({})

const emit = defineEmits(['on-success', 'on-error'])

const formRef = ref()
const submiting = ref(false)
const form = ref({
  firstName: '',
  lastName: '',
  phoneCode: '86',
  phone: '',
  email: '',
  country: '',
  state: '',
  city: '',
  postalCode: '',
  addressLine1: '',
  addressLine2: ''
})

const rules = {
  firstName: [
    { required: true, message: '持卡人名字必填', trigger: 'blur' }
  ],
  lastName: [
    { required: true, message: '持卡人姓氏必填', trigger: 'blur' }
  ],
  phone: [
    { required: true, message: '手机号必填', trigger: 'blur' },
    { pattern: /^[0-9-]*$/, message: '手机号格式错误', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '邮箱必填', trigger: 'blur' },
    { type: 'email', message: '邮箱格式错误', trigger: 'blur' }
  ]
}

// 生成随机姓名
const generateRandomName = () => {
  const randomName = generateName()
  form.value.firstName = randomName.firstName
  form.value.lastName = randomName.lastName
}

// 提交保存
const submit = async () => {
  if (submiting.value) return false
  
  return new Promise((resolve, reject) => {
    formRef.value.validate(async (valid) => {
      if (!valid) {
        reject(new Error('表单验证失败'))
        return
      }
      
      try {
        submiting.value = true
        
        const params = {
          cardholder: {
            firstName: form.value.firstName,
            lastName: form.value.lastName,
            email: form.value.email,
            phoneCode: form.value.phoneCode,
            phone: form.value.phone,
            address: {
              country: form.value.country,
              state: form.value.state,
              city: form.value.city,
              postalCode: form.value.postalCode,
              addressLine1: form.value.addressLine1,
              addressLine2: form.value.addressLine2
            }
          }
        }
        
        const res = await cardApi.createCardholder(params)
        
        message('持卡人添加成功')
        resetForm()
        emit('on-success', res)
        resolve(res)
        
      } catch (err) {
        const errorMsg = err.msg || '添加失败'
        message(errorMsg, 'error')
        emit('on-error', err)
        reject(err)
      } finally {
        submiting.value = false
      }
    })
  })
}

// 重置表单
const resetForm = () => {
  form.value = {
    firstName: '',
    lastName: '',
    phoneCode: '86',
    phone: '',
    email: '',
    country: '',
    state: '',
    city: '',
    postalCode: '',
    addressLine1: '',
    addressLine2: ''
  }
  formRef.value?.resetFields()
}

// 暴露方法和状态
defineExpose({
  submit,
  resetForm,
  submiting,
  form
})
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
</style>
