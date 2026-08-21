<template>
  <div class="percentage-slider" :class="{ 'is-empty': !hasValue }">
    <div class="percentage-slider__control">
      <Slider
        class="percentage-slider__range"
        :model-value="sliderValue"
        :min="resolvedMin"
        :max="resolvedMax"
        :step="resolvedStep"
        :disabled="disabled"
        :tip-format="formatPercent"
        @on-input="handleSliderInput"
        @on-change="handleSliderChange"
      />
      <div class="percentage-slider__input">
        <FormNumber
          v-model="inputValue"
          :min="resolvedMin"
          :max="resolvedMax"
          :step="resolvedStep"
          :precision="resolvedPrecision"
          :active-change="false"
          :disabled="disabled"
          @on-change="handleNumberChange"
        />
        <span>%</span>
      </div>
    </div>
    <p class="percentage-slider__tip">
      {{ t('certify.percentageSliderTip', { min: formatNumber(resolvedMin), max: formatNumber(resolvedMax) }) }}
    </p>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { Slider } from 'view-ui-plus'
import FormNumber from '@/components/form/FormNumber/index.vue'
import { t } from '@/utils'

const props = defineProps({
  modelValue: {
    type: [Number, String, null],
    default: null,
  },
  min: {
    type: [Number, String],
    default: 0,
  },
  max: {
    type: [Number, String],
    default: 100,
  },
  step: {
    type: [Number, String],
    default: 0.01,
  },
  precision: {
    type: [Number, String],
    default: 2,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
})

const emits = defineEmits(['update:modelValue', 'on-change'])
const resolvedMin = computed(() => Number(props.min ?? 0))
const resolvedMax = computed(() => Number(props.max ?? 100))
const resolvedStep = computed(() => Number(props.step ?? 0.01))
const resolvedPrecision = computed(() => Number(props.precision ?? 2))
const hasValue = computed(() => props.modelValue !== null && props.modelValue !== undefined && props.modelValue !== '')

const normalize = (value, clamp = true) => {
  if (value === null || value === undefined || value === '' || Number.isNaN(Number(value))) return null
  let result = Number(Number(value).toFixed(resolvedPrecision.value))
  if (clamp) {
    result = Math.min(resolvedMax.value, Math.max(resolvedMin.value, result))
  }
  return result
}

const inputValue = computed({
  get: () => (hasValue.value ? Number(props.modelValue) : null),
  set: (value) => emits('update:modelValue', normalize(value, false)),
})
const sliderValue = computed(() => normalize(props.modelValue) ?? resolvedMin.value)
const formatNumber = (value) => Number(value).toFixed(resolvedPrecision.value)
const formatPercent = (value) => `${formatNumber(value)}%`

const handleSliderInput = (value) => {
  emits('update:modelValue', normalize(value))
}
const handleSliderChange = (value) => {
  const normalized = normalize(value)
  emits('update:modelValue', normalized)
  emits('on-change', normalized)
}
const handleNumberChange = (value) => {
  const normalized = normalize(value)
  emits('update:modelValue', normalized)
  emits('on-change', normalized)
}
</script>

<style scoped lang="less">
.percentage-slider{
  width: 100%;
  padding: 14px 16px 10px;
  border: 1px solid #e6e8eb;
  border-radius: 5px;
  background: #fafbfc;
  transition: border-color .2s ease, background-color .2s ease;

  &:focus-within{
    border-color: var(--primary-color);
    background: #fff;
  }

  &.is-empty{
    :deep(.ivu-slider-bar){
      opacity: .4;
    }
  }
}

.percentage-slider__control{
  display: flex;
  align-items: center;
  gap: 20px;
}

.percentage-slider__range{
  flex: 1;
  min-width: 0;
}

.percentage-slider__input{
  width: 112px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 8px;
  color: #596579;

  :deep(.ivu-input-number){
    width: 96px !important;
  }
}

.percentage-slider__tip{
  margin-top: 8px;
  color: #8c95a3;
  font-size: 12px;
  line-height: 18px;
}
</style>
