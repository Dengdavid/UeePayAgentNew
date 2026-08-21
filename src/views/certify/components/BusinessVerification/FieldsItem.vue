<template>
  <div class="fields_box list-b-16" v-if="data">
    <FormItemBox
      :label="data.label"
      :labelSub="labelSub"
      :tips="data.tips && data.field_type!=='upload' ? data.tips : ''"
      :prop="prop"
      :rules="rules"
      :isRequired="isRequired"
    >
      <template v-if="data.attrs?.is_add">
        <FormAddList
          v-model="data.field_value"
          :regex="data.attrs?.regex"
          :regexType="data.attrs?.regex_type"
          :title="data.label"
          :placeholder="data.attrs?.placeholder || placeholderText('input')"
          v-bind="data.attrs || {}"
          @on-change="onChange"
        />
      </template>
      <template v-else-if="['address_country_reg','address_country','address_province'].includes(data.field_type)">
        <FormSelect
          v-model="data.field_value"
          v-model:label="data.field_label"
          v-bind="data.attrs || {}"
          :apiUrl="remoteApiUrl"
          :method="data.remote_config?.method"
          :labelName="data.remote_config?.labelName || 'label'"
          :valueName="data.remote_config?.valueName || 'value'"
          :params="remoteParams"
          :options="disabledRemoteOptions"
          :optionsObj="optionsObj"
          :optionsKey="remoteOptionsKey"
          :placeholder="placeholderText('select')"
          :disabled="isDisabled"
          :transfer="useTransferredSelect"
          @on-change="onChange"
        />
      </template>
      <template v-else-if="['select'].includes(data.field_type)">
        <FormSelect
          v-model="data.field_value"
          v-model:label="data.field_label"
          v-bind="data.attrs || {}"
          :options="options"
          :placeholder="placeholderText('select')"
          :disabled="isDisabled"
          :transfer="useTransferredSelect"
          @on-change="onChange"
        />
      </template>
      <template v-else-if="['input','textarea'].includes(data.field_type)">
        <FormInput
          v-model="data.field_value"
          v-bind="data.attrs || {}"
          :type="data.field_type=== 'textarea' ? 'textarea' : 'text'"
          :autosize="{ minRows: 4, maxRows: 8 }"
          :placeholder="placeholderText('input')"
          @on-change="onChange"
        />
      </template>
      <template v-else-if="data.field_type === 'number'">
        <FormPercentageSlider
          v-model="data.field_value"
          v-bind="data.attrs || {}"
          @on-change="onChange"
        />
      </template>
      <template v-else-if="['radio'].includes(data.field_type)">
        <FormRadio v-model="data.field_value" :options="options" v-bind="data.attrs || {}"  @on-change="onChange"></FormRadio>
      </template>
      <template v-else-if="['checkbox'].includes(data.field_type)">
        <FormCheckbox v-model="data.field_value" :options="options" v-bind="data.attrs || {}" @on-change="onChange"></FormCheckbox>
      </template>
      <template v-else-if="['date'].includes(data.field_type)">
        <FormDateBox
          v-model="data.field_value"
          type="date"
          :placeholder="placeholderText('select')"
          :defaultDate="defaultDate"
          v-bind="data.attrs || {}"
          @on-change="onChange"
        ></FormDateBox>
      </template>
      <template v-else-if="['daterange'].includes(data.field_type)">
        <FormDateBox
          v-model="data.field_value"
          type="daterange"
          :isSring="true"
          :placeholder="placeholderText('select')"
          v-bind="data.attrs || {}"
          :notDateOptions="notDateOptions"
          :disableAfterToday="false"
          :maxMonths="0"
          @on-change="onChange"
        ></FormDateBox>
      </template>
      <template v-else-if="['upload'].includes(data.field_type)">
        <div class="fields_upload">
          <FormUploadFile
            v-model="data.field_value"
            v-model:url="data.field_value"
            type="drag"
            :width="260"
            :height="180"
            :tip="data.tips"
            :example="example"
            v-bind="data.attrs || {}"
            @update:url="onChange"
          ></FormUploadFile>
        </div>
      </template>
      <template v-else>
        {{ data.field_type }}
      </template>
    </FormItemBox>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { regexFun } from '@/utils/regex.js'
import { t } from '@/utils'
import FormPercentageSlider from '@/components/form/FormPercentageSlider/index.vue'
const props = defineProps({
  //详情数据
  data:{
    type:Object,
  },
  //父级
  parentData:{
    type:Array,
    default:()=>[],
  },
  group:{
    type:Object,
    default:()=>({}),
  },
  optionsObj:{
    type:Object,
    default:()=>({}),
  },
  prop:{
    type:String,
    default:'',
  },
  validateRequired:{
    type:Boolean,
    default:true,
  }
})
const emits = defineEmits(['on-change'])
const labelSub = computed(() => {
  if(props.data.is_required == 0){
    return t('certify.dynamicField.optional')
  }
  if(props.data?.attrs?.multiple){
    return t('certify.dynamicField.multiple')
  }
  return props.data.labelSub || ''
})
const getParent = (fieldKey) => {
  if (!fieldKey) return null
  const candidates = props.parentData.filter((item) => item.field_key === fieldKey)
  if (props.group?.group_key) {
    const sameGroup = candidates.find((item) => {
      return item.group_key === props.group.group_key && (item.front_key ?? 0) === (props.group.front_key ?? 0)
    })
    if (sameGroup) return sameGroup
  }
  return candidates.find((item) => (item.front_key ?? 0) === (props.group?.front_key ?? 0))
    || candidates.find((item) => !item.group_key)
    || candidates.find((item) => (item.front_key ?? 0) === 0)
    || null
}

const options = computed(() => {
  const parentKey = props.data?.attrs?.parent_field_key
  if (parentKey) {
    const parentValue = getParent(parentKey)?.field_value
    const optionMap = props.data?.options?.[0]
    if (!optionMap) return []
    if (parentValue && optionMap[parentValue]) return optionMap[parentValue]
    return optionMap.OTHER || []
  }
  return props.data?.options || []
})

const remoteParams = computed(() => {
  const paramsName = props.data?.attrs?.params || props.data?.remote_config?.params?.[0]
  const parentKey = props.data?.attrs?.parent_field_key
  const parentValue = getParent(parentKey)?.field_value
  if (!paramsName || !parentValue) return undefined
  return {
    [paramsName]: parentValue,
  }
})

const isDisabled = computed(() => {
  if (props.data?.attrs?.disabled) return true
  const parentKey = props.data?.attrs?.parent_field_key
  if (!parentKey) return false
  return !getParent(parentKey)?.field_value
})

const remoteApiUrl = computed(() => {
  if (!props.data?.remote_config?.apiUrl) return ''
  return isDisabled.value ? '' : props.data.remote_config.apiUrl
})

const remoteOptionsKey = computed(() => {
  if (!remoteApiUrl.value) return ''
  const params = remoteParams.value || {}
  const paramsKey = Object.keys(params).sort().map((key) => `${key}:${params[key]}`).join('|')
  return [props.data.remote_config?.method || 'get', remoteApiUrl.value, paramsKey].filter(Boolean).join('|')
})

const disabledRemoteOptions = computed(() => {
  if (!isDisabled.value) return []
  return [{
    [props.data?.remote_config?.labelName || 'label']: t('certify.dynamicField.selectParentFirst'),
    [props.data?.remote_config?.valueName || 'value']: '',
    disabled: true,
  }]
})

const example = computed(() => {
  const fieldExample = props.data?.field_example
  if (!fieldExample) return ''
  if (typeof fieldExample === 'string') return fieldExample
  const parentKey = fieldExample.parent_field_key
  const parentValue = getParent(parentKey)?.field_value
  if (parentValue && fieldExample.data?.[parentValue]) {
    return fieldExample.data[parentValue]
  }
  return fieldExample.data?.OTHER || ''
})

const placeholderText = (type) => t(
  type === 'select' ? 'certify.dynamicField.selectField' : 'certify.dynamicField.enterField',
  { field: props.data?.label || '' },
)
const defaultDate = computed(() => {
  return props.data?.field_key === 'director_dob' ? '2000-01-01' : props.data?.attrs?.defaultDate
})
const notDateOptions = computed(() => {
  return props.data?.attrs?.notDateOptions || props.data?.field_key === 'business_term_start_end'
})
const isRequired = computed(() => props.validateRequired && props.data?.is_required === 1)
const useTransferredSelect = computed(() => ['ubo_info', 'auth_director'].includes(props.group?.group_key))
const rules = computed(() => {
  const fieldRules = []
  if (props.data?.field_type === 'number') {
    fieldRules.push({
      validator: (rule, value, callback) => {
        if (value === null || value === undefined || value === '') {
          callback()
          return
        }
        const numberValue = Number(value)
        const min = Number(props.data?.attrs?.min ?? Number.NEGATIVE_INFINITY)
        const max = Number(props.data?.attrs?.max ?? Number.POSITIVE_INFINITY)
        if (!Number.isFinite(numberValue) || numberValue < min || numberValue > max) {
          callback(new Error(t('certify.percentageRangeInvalid', { min, max })))
          return
        }
        callback()
      },
      trigger: 'change,blur',
    })
  }
  const regexType = props.data?.attrs?.regex_type
  if (regexType) {
    fieldRules.push({
      validator: (rule, value, callback) => {
        if (!value && value !== 0) {
          callback()
          return
        }
        const isValid = regexFun(String(value).trim(), regexType, props.data?.attrs?.regex)
        if (isValid) {
          callback()
          return
        }
        callback(new Error(props.data?.attrs?.regex_error || t('certify.dynamicField.fieldFormatInvalid', { field: props.data?.label || '' })))
      },
      trigger: 'change,blur',
    })
  }
  return fieldRules
})

const onChange = () => {
  emits('on-change', props.data)
}
</script>

<style scoped lang="less">
.fields_box{
  :deep(.ivu-form-item){
    margin-bottom: 0;
  }
  :deep(.ivu-form-item-label){
    padding-bottom: 6px;
  }
  :deep(.formTitle){
    font-size: 14px;
    font-weight: 500;
    line-height: 22px;
    color: var(--ui-color-neutral-900);
  }
  :deep(.formTitle .icon-question){
    font-weight: 400;
  }
  :deep(.ivu-form-item-content){
    line-height: normal;
  }
  :deep(.ivu-form-item-error-tip){
    position: static;
    display: flex;
    align-items: center;
    width: fit-content;
    max-width: 100%;
    min-height: 20px;
    margin-top: 8px;
    padding: var(--ui-padding-2-8);
    color: var(--ui-color-red-550);
    background: #fff5f4;
    border: 1px solid #ffd3ce;
    border-radius: var(--ui-radius-sm);
    font-size: 12px;
    line-height: 16px;
    white-space: normal;
    overflow-wrap: anywhere;
  }
  :deep(.ivu-form-item-error > .ivu-form-item-content > .ivu-input-wrapper > .ivu-input),
  :deep(.ivu-form-item-error > .ivu-form-item-content > .ivu-select > .ivu-select-selection),
  :deep(.ivu-form-item-error > .ivu-form-item-content > .ivu-date-picker > .ivu-date-picker-rel .ivu-input){
    border-color: #f08a80;
    box-shadow: none;
  }
  :deep(.ivu-form-item-error > .ivu-form-item-content > .ivu-input-wrapper > .ivu-input:focus),
  :deep(.ivu-form-item-error > .ivu-form-item-content > .ivu-select-visible > .ivu-select-selection){
    border-color: #e04b3f;
    box-shadow: 0 0 0 2px rgba(224, 75, 63, 0.08);
  }
  :deep(.ivu-form-item-error .selectSeach .ivu-input),
  :deep(.ivu-form-item-error .selectSearch .ivu-input){
    border-color: #dcdee2 !important;
    box-shadow: none !important;
  }
  :deep(.ivu-form-item-error .selectSeach .ivu-input:focus),
  :deep(.ivu-form-item-error .selectSearch .ivu-input:focus){
    border-color: #57a3f3 !important;
    box-shadow: 0 0 0 2px rgba(45, 140, 240, 0.2) !important;
  }
  .fields_upload{
    display: flex;
    gap:12px;
    align-items:flex-start;
    flex-wrap: wrap;
    .fields_tips{
      min-width: 220px;
      flex: 1;
      color:var(--ui-color-text-subtle);
      font-size:12px;
      line-height:1.6;
    }
  }
}
@media (max-width: 768px) {
  .fields_box{
    min-width: 0;
    :deep(.formTitle){
      min-width: 0;
      max-width: 100%;
      flex-wrap: wrap;
      overflow-wrap: anywhere;
    }
    .fields_upload{
      width: 100%;
      display: block;
      :deep(.UploadImg),
      :deep(.UploadImgBox){
        width: 100%;
        min-width: 0;
      }
      :deep(.UploadImgBox){
        display: block;
      }
      :deep(.UploadImgBox > .ivu-upload),
      :deep(.UploadImgBox > .ivu-upload .ivu-upload),
      :deep(.UploadImgBox .bd){
        width: 100%;
        max-width: 100%;
      }
      :deep(.UploadImgBox .bd){
        margin-top: 8px;
        overflow-wrap: anywhere;
      }
      :deep(.ivu-upload),
      :deep(.dragUpload),
      :deep(.files-loading){
        width: 100% !important;
        max-width: 100%;
      }
      :deep(.dragUpload){
        aspect-ratio: 16 / 10;
      }
      :deep(.dragUpload .imgBox){
        width: 100%;
        min-height: 180px;
        align-items: center;
        justify-content: center;
      }
      :deep(.dragUpload .FormImg){
        width: 100% !important;
        height: 100% !important;
      }
      :deep(.dragUpload img),
      :deep(.dragUpload .ivu-image),
      :deep(.dragUpload .ivu-image-img){
        max-width: 100%;
      }
    }
  }
}
</style>
