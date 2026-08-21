<template>
  <div class="required-fields">
    <Row v-if="bin.physical" :gutter="20">
      <Col span="24">
        <div class="required-field-label">
          {{ $t('card.index.opening.cardType') }}<span class="required">*</span>
        </div>
        <FormItem prop="physical">
          <div class="card-type-selector">
            <button
              type="button"
              class="card-type-option"
              :class="{ 'card-type-selected': physical === 0 }"
              @click="physical = 0"
            >
              <span class="card-type-title">{{ $t('card.index.opening.virtualCard') }}</span>
              <Icon v-if="physical === 0" type="md-checkmark" class="card-type-check" />
            </button>
            <button
              type="button"
              class="card-type-option"
              :class="{ 'card-type-selected': physical === 1 }"
              @click="physical = 1"
            >
              <span class="card-type-title">{{ $t('card.index.opening.physicalCard') }}</span>
              <Icon v-if="physical === 1" type="md-checkmark" class="card-type-check" />
            </button>
          </div>
          <div class="card-type-desc">
            <span v-if="physical === 0">{{ $t('card.index.opening.virtualCardDescription') }}</span>
            <span v-else>{{ $t('card.index.opening.physicalCardDescription') }}</span>
          </div>
        </FormItem>
      </Col>
    </Row>

    <template v-if="showCardholderSelector">
      <div class="required-field-label cardholder-field-label">
        <span class="required">*</span> {{ $t('card.index.opening.selectCardholder') }}
        <Icon
          v-if="refreshingCardholders"
          type="ios-loading"
          size="16"
          class="refresh-icon demo-spin-icon-load"
          :title="$t('card.index.opening.refreshCardholders')"
        />
        <Icon
          v-else
          type="md-refresh"
          size="16"
          class="refresh-icon"
          :title="$t('card.index.opening.refreshCardholders')"
          @click="emit('refresh-cardholders')"
        />
        <a class="view-detail cardholder-manage" @click="emit('manage-cardholders')">
          <span class="underline">{{ $t('card.index.opening.viewDetails') }}</span>
          <Icon type="ios-arrow-forward" />
        </a>
      </div>
      <Row :gutter="20">
        <Col :xs="16" :sm="20">
          <FormItem prop="cardholderId">
            <Select
              v-model="cardholderId"
              :placeholder="$t('card.index.opening.selectCardholderPlaceholder')"
              filterable
              clearable
              @on-change="handleCardholderChange"
            >
              <Option
                v-for="item in cardholderList"
                :key="item.id"
                :value="item.id"
                :disabled="item.status !== 'Active'"
              >
                {{ item.first_name }} {{ item.last_name }}
                <span v-if="item.status !== 'Active'" class="cardholder-status">
                  ({{ getStatusText(item.status) }})
                </span>
              </Option>
            </Select>
          </FormItem>
        </Col>
        <Col :xs="8" :sm="4" class="add-cardholder-col">
          <a class="view-detail add-cardholder" @click="emit('add-cardholder')">
            {{ $t('card.index.opening.addCardholder') }}
            <Icon type="ios-arrow-forward" />
          </a>
        </Col>
      </Row>
    </template>

    <CardholderInfoForm
      v-model="applicantForm"
      :bin="bin"
      :disabled="showCardholderSelector"
    />
  </div>
</template>

<script setup>
import CardholderInfoForm from './CardholderInfoForm.vue'
import { computed } from 'vue'
import { t } from '@/utils'

const props = defineProps({
  modelValue: {
    type: Object,
    default: () => ({}),
  },
  bin: {
    type: Object,
    default: () => ({}),
  },
  userEmail: {
    type: String,
    default: '',
  },
  showCardholderSelector: {
    type: Boolean,
    default: false,
  },
  cardholderList: {
    type: Array,
    default: () => [],
  },
  refreshingCardholders: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits([
  'update:modelValue',
  'refresh-cardholders',
  'manage-cardholders',
  'add-cardholder',
])

const updateFields = (fields) => {
  emit('update:modelValue', {
    ...props.modelValue,
    ...fields,
  })
}

const applicantForm = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
})

const createFieldModel = (field) => computed({
  get: () => props.modelValue[field],
  set: (value) => updateFields({ [field]: value }),
})

const physical = createFieldModel('physical')
const cardholderId = createFieldModel('cardholderId')

const getStatusText = (status) => {
  const statusMap = {
    Active: t('card.index.opening.cardholderStatus.active'),
    Pending: t('card.index.opening.cardholderStatus.pending'),
    Inactive: t('card.index.opening.cardholderStatus.inactive'),
    PendingCheck: t('card.index.opening.cardholderStatus.pendingCheck'),
  }
  return statusMap[status] || status
}

const handleCardholderChange = (selectedId) => {
  if (!selectedId) {
    updateFields({
      cardholderId: null,
      firstName: '',
      lastName: '',
      email: props.userEmail,
      phone: null,
      phoneCode: '86',
    })
    return
  }

  const cardholder = props.cardholderList.find((item) => item.id === selectedId)
  if (!cardholder) return

  const fields = {
    cardholderId: selectedId,
    firstName: cardholder.first_name,
    lastName: cardholder.last_name,
    email: cardholder.email,
    phone: cardholder.phone_number,
    phoneCode: cardholder.phone_country_code,
  }

  const address = cardholder.kyc_data?.address
  if (address) {
    Object.assign(fields, {
      country: address.country,
      state: address.state,
      city: address.city,
      postalCode: address.postal_code,
      addressLine1: address.address_line1,
      addressLine2: address.address_line2,
    })
  }

  updateFields(fields)
}
</script>

<style scoped lang="less">
.required-fields {
  margin-top: 16px;

  > .ivu-row {
    row-gap: 18px;
  }

  :deep(.ivu-form-item) {
    margin-bottom: 0;
  }
}

.required-field-label {
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

.cardholder-field-label {
  margin-bottom: 10px;
}

.refresh-icon {
  margin-right: 12px;
  cursor: pointer;
}

.cardholder-manage {
  float: right;
  margin-right: 12px;
}

.cardholder-status {
  margin-left: 8px;
  color: var(--ui-color-neutral-550);
}

.add-cardholder-col {
  display: flex;
  align-items: center;
  padding-left: 10px;
}

.add-cardholder {
  width: 100%;
  justify-content: center;
  text-align: center;
}

.view-detail {
  display: flex;
  align-items: center;
  color: var(--primary-color);
  font-size: 13px;
  cursor: pointer;

  &:hover {
    text-decoration: underline;
  }
}

.card-type-selector {
  display: flex;
  gap: 10px;
  width: 100%;
  margin-bottom: 15px;
}

.card-type-option {
  position: relative;
  display: flex;
  flex-direction: column;
  width: 50%;
  padding: var(--ui-padding-10);
  border: 1px solid #e5e9f2;
  border-radius: var(--ui-radius-6);
  background: var(--ui-color-surface);
  box-shadow: var(--ui-shadow-card-form-subtle);
  color: var(--ui-color-text);
  font: inherit;
  text-align: left;
  cursor: pointer;
  transition: all .2s ease;

  &:hover,
  &.card-type-selected {
    border-color: #7367f0;
  }

  &.card-type-selected {
    background: #f5f8ff;

    .card-type-title {
      color: #7367f0;
    }
  }
}

.card-type-title {
  font-size: 13px;
  font-weight: 500;
}

.card-type-desc {
  color: var(--ui-color-notice);
  font-size: 13px;
  line-height: 1.4;
}

.card-type-check {
  position: absolute;
  top: 50%;
  right: 10px;
  color: #4caf50;
  font-size: 18px;
  transform: translateY(-50%);
}

.demo-spin-icon-load {
  animation: ani-demo-spin 1s linear infinite;
}

@keyframes ani-demo-spin {
  from { transform: rotate(0deg); }
  50% { transform: rotate(180deg); }
  to { transform: rotate(360deg); }
}

</style>
