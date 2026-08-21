<template>
  <section class="mailing-address">
    <div class="section-header">
      <h3>{{ $t('card.index.physical.mailingAddress') }}</h3>
      <p>{{ $t('card.index.physical.mailingDescription') }}</p>
    </div>

    <Form ref="formRef" :model="form" :rules="rules" label-position="top">
      <Row :gutter="12">
        <Col :xs="24" :sm="12">
          <FormItem :label="$t('card.index.physical.firstName')" prop="firstName">
            <Input v-model="form.firstName" :placeholder="$t('card.index.physical.enterFirstName')" />
          </FormItem>
        </Col>
        <Col :xs="24" :sm="12">
          <FormItem :label="$t('card.index.physical.lastName')" prop="lastName">
            <Input v-model="form.lastName" :placeholder="$t('card.index.physical.enterLastName')" />
          </FormItem>
        </Col>
      </Row>

      <FormItem :label="$t('card.index.physical.phone')" prop="phone">
        <PhoneInput v-model="form.phone" v-model:phoneCode="form.phoneCode" />
      </FormItem>

      <FormItem :label="$t('card.index.physical.email')" prop="email">
        <FormEmail v-model="form.email" :placeholder="$t('card.index.physical.enterEmail')" />
      </FormItem>

      <Row :gutter="12">
        <Col :xs="24" :sm="12">
          <FormItem :label="$t('card.index.physical.country')" prop="country" >
            <Select v-model="form.country" :placeholder="$t('card.index.physical.selectCountry')" filterable @on-change="handleCountryChange">
              <Option v-for="item in countries" :key="item.value" :value="item.value">
                {{ item.label }}（{{ item.value }}）
              </Option>
            </Select>
          </FormItem>
        </Col>
        <Col :xs="24" :sm="12">
          <FormItem :label="$t('card.index.physical.state')" prop="state">
            <Select v-model="form.state" :placeholder="$t('card.index.physical.selectState')" filterable>
              <Option v-for="item in provinces" :key="item" :value="item">{{ item }}</Option>
            </Select>
          </FormItem>
        </Col>
        <Col :xs="24" :sm="12">
          <FormItem :label="$t('card.index.physical.city')" prop="city">
            <Input v-model="form.city" :placeholder="$t('card.index.physical.enterCity')" />
          </FormItem>
        </Col>
        <Col :xs="24" :sm="12">
          <FormItem :label="$t('card.index.physical.postalCode')" prop="postalCode">
            <Input v-model="form.postalCode" :placeholder="$t('card.index.physical.enterPostalCode')" />
          </FormItem>
        </Col>
      </Row>

      <FormItem :label="$t('card.index.physical.addressLine1')" prop="addressLine1">
        <Input v-model="form.addressLine1" :placeholder="$t('card.index.physical.enterAddressLine1')" />
      </FormItem>

      <FormItem :label="$t('card.index.physical.addressLine2')">
        <Input v-model="form.addressLine2" :placeholder="$t('card.index.physical.enterAddressLine2')" />
      </FormItem>
    </Form>

    <div class="fee-summary">
      <div class="fee-title">
        <h4>{{ $t('card.index.physical.totalFees') }}</h4>
        <span>（{{ $t('cardTag.selectedCards', { count: selectedCount }) }}）</span>
      </div>
      <dl>
        <div>
          <dt>{{ $t('card.index.physical.cardProductionFee') }}</dt>
          <dd>{{ formatAmount(cardFee) }} USD</dd>
        </div>
        <div>
          <dt>{{ $t('card.index.physical.postageFee') }}</dt>
          <dd>{{ formatAmount(postageFee) }} USD</dd>
        </div>
        <div class="total">
          <dt>{{ $t('card.index.physical.totalExpense') }}</dt>
          <dd>{{ totalAmount }} USD</dd>
        </div>
      </dl>
      <Button
        long
        type="primary"
        class="submit-button"
        :loading="submitting"
        :disabled="submitDisabled || selectedCount <= 0"
        @click="handleSubmit"
      >
        {{ submitting ? $t('card.index.physical.submitting') : $t('card.index.physical.apply') }}
      </Button>
    </div>
  </section>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import Decimal from 'decimal.js'
import PhoneInput from '@/components/utils/phone-input.vue'
import { useAppStore } from '@/store/app.js'
import { t } from '@/utils'

const createDefaultForm = () => ({
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
  addressLine2: '',
})

const props = defineProps({
  modelValue: {
    type: Object,
    default: () => ({}),
  },
  selectedCount: {
    type: Number,
    default: 0,
  },
  cardFee: {
    type: [String, Number],
    default: 0,
  },
  postageFee: {
    type: [String, Number],
    default: 0,
  },
  total: {
    type: [String, Number],
    default: null,
  },
  submitting: {
    type: Boolean,
    default: false,
  },
  submitDisabled: {
    type: Boolean,
    default: false,
  },
})
const emit = defineEmits(['update:modelValue', 'submit'])

const appStore = useAppStore()
const { areaDatas, countries } = storeToRefs(appStore)
const formRef = ref(null)
const form = ref({
  ...createDefaultForm(),
  ...props.modelValue,
})

const rules = {
  firstName: [{ required: true, message: t('card.index.physical.recipientFirstNameRequired'), trigger: 'blur,change' }],
  lastName: [{ required: true, message: t('card.index.physical.recipientLastNameRequired'), trigger: 'blur,change' }],
  phone: [
    { required: true, message: t('card.index.physical.phoneRequired'), trigger: 'blur,change' },
    { pattern: /^[0-9-]*$/, message: t('card.index.physical.phoneInvalid'), trigger: 'blur,change' },
  ],
  email: [
    { required: true, message: t('card.index.physical.emailRequired'), trigger: 'blur,change' },
    { type: 'email', message: t('card.index.physical.emailInvalid'), trigger: 'blur,change' },
  ],
  country: [{ required: true, message: t('card.index.physical.countryRequired'), trigger: 'change' }],
  state: [{ required: true, message: t('card.index.physical.stateRequired'), trigger: 'change' }],
  city: [{ required: true, message: t('card.index.physical.cityRequired'), trigger: 'blur,change' }],
  postalCode: [{ required: true, message: t('card.index.physical.postalCodeRequired'), trigger: 'blur,change' }],
  addressLine1: [{ required: true, message: t('card.index.physical.addressRequired'), trigger: 'blur,change' }],
}

const provinces = computed(() => {
  const country = areaDatas.value.find((item) => item.value === form.value.country)
  return country?.state || []
})
const decimal = (value) => {
  try {
    const amount = new Decimal(value || 0)
    return amount.isFinite() ? amount : new Decimal(0)
  } catch {
    return new Decimal(0)
  }
}
const formatAmount = (value) => decimal(value).toFixed(2)
const totalAmount = computed(() => {
  if (props.total !== null && props.total !== undefined && props.total !== '') {
    return formatAmount(props.total)
  }
  return decimal(props.cardFee).plus(decimal(props.postageFee)).toFixed(2)
})

const handleCountryChange = () => {
  if (!provinces.value.includes(form.value.state)) {
    form.value.state = ''
  }
}

watch(form, (value) => {
  emit('update:modelValue', { ...value })
}, { deep: true })
watch(() => props.modelValue, (value) => {
  const nextValue = { ...createDefaultForm(), ...(value || {}) }
  const isSame = Object.keys(nextValue).every((key) => nextValue[key] === form.value[key])
  if (!isSame) {
    form.value = nextValue
  }
}, { deep: true })

const validate = () => formRef.value?.validate()
const getValue = () => ({ ...form.value })
const handleSubmit = () => {
  if (props.submitting || props.submitDisabled || props.selectedCount <= 0) return
  formRef.value?.validate((valid) => {
    if (valid) {
      emit('submit', getValue())
    }
  })
}
const reset = () => {
  formRef.value?.resetFields()
  form.value = createDefaultForm()
}

onMounted(() => {
  if (countries.value.length === 0) {
    appStore.getAreaDatas()
  }
})

defineExpose({ validate, getValue, reset })
</script>

<style scoped lang="less">
.section-header {
  margin-bottom: 20px;

  h3 {
    color: var(--ui-color-text);
    font-size: 18px;
    font-weight: 600;
  }

  p {
    margin-top: 4px;
    color: var(--ui-color-text-muted);
    font-size: 13px;
  }
}

.fee-summary {
  padding-top: 18px;
  border-top: 1px solid #edf1f6;

  dl {
    margin: 12px 0 18px;

    > div {
      display: flex;
      align-items: center;
      justify-content: space-between;
      color: var(--ui-color-neutral-800);
      font-size: 13px;
      line-height: 28px;
    }

    dd {
      font-variant-numeric: tabular-nums;
    }

    .total dd {
      color: var(--error-color);
      font-size: 18px;
    }
  }
}

.fee-title {
  display: flex;
  align-items: baseline;
  gap: 4px;

  h4 {
    color: var(--ui-color-text);
    font-size: 16px;
    font-weight: 600;
  }

  span {
    color: var(--ui-color-text-muted);
    font-size: 12px;
  }
}

.submit-button {
  height: var(--ui-size-40);
  border-color: transparent;
  background: linear-gradient(107deg, #ffc053 0%, #f98a14 100%);

  &:hover:not(:disabled) {
    border-color: transparent;
    background: linear-gradient(107deg, #ffb83d 0%, #f57f0d 100%);
  }

  &:disabled,
  &.ivu-btn-disabled {
    border-color: #e2e6ed;
    background: #e8ebf0;
    color: var(--ui-color-text-secondary);
    box-shadow: none;
    cursor: not-allowed;

    &:hover {
      border-color: #e2e6ed;
      background: #e8ebf0;
      color: var(--ui-color-text-secondary);
    }
  }
}

:deep(.ivu-form-item) {
  margin-bottom: 18px;
}

:deep(.ivu-form-item-label) {
  color: var(--ui-color-neutral-800);
  font-size: 13px;
  font-weight: 500;
}

@media screen and (max-width: 768px) {
  .mailing-address {
    padding: var(--ui-padding-16);
  }
}
</style>
