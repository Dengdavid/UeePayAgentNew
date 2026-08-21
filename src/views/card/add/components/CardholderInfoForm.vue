<template>
  <Row :gutter="20" class="cardholder-info-form">
    <Col :xs="24" :sm="12">
      <div class="field-label">
        <span class="required">*</span> {{ $t('card.index.opening.cardholderName') }}
        <Tooltip :content="$t('card.index.opening.nameTip')" :max-width="240">
          <Icon custom="iconfont icon-question" color="#9e9e9e" class="ui-pointer" />
        </Tooltip>
      </div>
      <FormItem prop="firstName">
        <FormInput v-model="firstName" :placeholder="$t('card.index.opening.firstNamePlaceholder')" :disabled="disabled" />
      </FormItem>
    </Col>

    <Col :xs="24" :sm="12">
      <div class="field-label is-hidden-mobile">&nbsp;</div>
      <FormItem prop="lastName">
        <FormInput v-model="lastName" :placeholder="$t('card.index.opening.lastNamePlaceholder')" :disabled="disabled" />
      </FormItem>
    </Col>

    <Col :xs="24" :sm="12">
      <div class="field-label">
        {{ $t('card.index.opening.phoneAndEmail') }}<span v-if="bin['3ds']" class="required">*</span>
      </div>
      <FormItem prop="phone">
        <PhoneInput
          v-model="phone"
          v-model:phoneCode="phoneCode"
          :placeholder="$t('card.index.opening.page.phoneRequired')"
          :disabled="disabled"
        />
      </FormItem>
    </Col>

    <Col :xs="24" :sm="12">
      <div class="field-label is-hidden-mobile">&nbsp;</div>
      <FormItem prop="email">
        <FormEmail
          :data="emailData"
          data-name="email"
          :placeholder="$t('card.index.opening.emailPlaceholder')"
          :disabled="disabled"
        />
      </FormItem>
    </Col>
  </Row>
</template>

<script setup>
import FormEmail from '@/components/form/FormEmail/index.vue'
import PhoneInput from '@/components/utils/phone-input.vue'
import { computed, reactive, watch } from 'vue'

const props = defineProps({
  modelValue: {
    type: Object,
    default: () => ({}),
  },
  bin: {
    type: Object,
    default: () => ({}),
  },
  disabled: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['update:modelValue'])

// 仅更新当前字段，保留开卡表单中的其他申请数据。
const updateField = (field, value) => {
  emit('update:modelValue', {
    ...props.modelValue,
    [field]: value,
  })
}

const createFieldModel = (field) => computed({
  get: () => props.modelValue[field],
  set: (value) => updateField(field, value),
})

const firstName = createFieldModel('firstName')
const lastName = createFieldModel('lastName')
const phone = createFieldModel('phone')
const phoneCode = createFieldModel('phoneCode')

// FormEmail 使用 data + dataName 契约，通过局部对象隔离对子组件 props 的修改。
const emailData = reactive({ email: '' })

watch(
  () => props.modelValue.email,
  (email) => {
    emailData.email = email ?? ''
  },
  { immediate: true },
)

watch(
  () => emailData.email,
  (email) => {
    if (email !== props.modelValue.email) updateField('email', email)
  },
)
</script>

<style scoped lang="less">
.cardholder-info-form {
  row-gap: 18px;

  :deep(.ivu-form-item) {
    margin-bottom: 0;
  }
}

.field-label {
  min-height: 20px;
  margin-bottom: 8px;
  color: var(--ui-color-text);
  font-size: 13px;
  line-height: 20px;
}

.required {
  margin-left: 3px;
  color: var(--error-color);
}

@media screen and (max-width: 768px) {
  .is-hidden-mobile {
    display: none;
  }
}
</style>
