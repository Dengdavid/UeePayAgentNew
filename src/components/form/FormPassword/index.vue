<script setup>
import { computed, ref, watch } from 'vue'
import FormInput from '@/components/form/FormInput/index.vue'
import FormItemBox from '@/components/form/FormItemBox/index.vue'
import { t } from '@/utils'

defineOptions({ inheritAttrs: false })

const props = defineProps({
  modelValue: {
    type: [String, null],
    default: null,
  },
  label: {
    type: String,
    default: '',
  },
  prop: {
    type: String,
    default: 'pwd',
  },
  isRequired: {
    type: Boolean,
    default: true,
  },
  requiredMessage: {
    type: String,
    default: '',
  },
  lengthMessage: {
    type: String,
    default: '',
  },
  rules: {
    type: Array,
    default: () => [],
  },
})
const emits = defineEmits(['update:modelValue'])

const strengthScore = ref(null)
const strengthUnavailable = ref(false)
const modelValue = computed({
  get: () => props.modelValue,
  set: value => emits('update:modelValue', value),
})
const passwordRules = computed(() => [
  ...(props.isRequired && props.requiredMessage
    ? [{ required: true, message: props.requiredMessage, trigger: ['change', 'blur'] }]
    : []),
  { min: 6, max: 30, message: props.lengthMessage || t('security.password.length'), trigger: ['change', 'blur'] },
  { pattern: /^(?=[\s\S]*[A-Za-z])(?=[\s\S]*\d)[\s\S]+$/, message: t('security.password.lettersAndNumbers'), trigger: ['change', 'blur'] },
  ...props.rules,
])
// 两类字符最多弱、三类最多中、四类才可强；zxcvbn 用于降级，评分不影响提交。
const strengthLevel = computed(() => {
  const score = strengthScore.value
  if (score === null) return 0
  const password = props.modelValue || ''
  const characterTypes = [/[a-z]/, /[A-Z]/, /\d/, /[\p{P}\p{S}]/u]
    .filter(pattern => pattern.test(password)).length
  const estimatedLevel = score <= 1 ? 1 : score === 2 ? 2 : 3
  return Math.min(estimatedLevel, Math.max(1, characterTypes - 1))
})
const strengthText = computed(() => t({
  1: 'security.password.strengthWeak',
  2: 'security.password.strengthMedium',
  3: 'security.password.strengthStrong',
}[strengthLevel.value] || 'security.password.strengthWeak'))

// 输入变化或组件卸载后忽略旧评分，避免异步结果覆盖当前输入。
watch(() => props.modelValue, async (value, previousValue, onCleanup) => {
  strengthScore.value = null
  strengthUnavailable.value = false
  const password = value || ''
  const length = Array.from(password).length
  if (length < 6 || length > 30) return

  let active = true
  onCleanup(() => { active = false })
  try {
    const { default: estimator } = await import('./strength.js')
    if (active) strengthScore.value = estimator.check(password).score
  } catch {
    if (active) strengthUnavailable.value = true
  }
}, { immediate: true })
</script>

<template>
  <FormItemBox class="form-password" :label="label" :prop="prop" :is-required="isRequired && !requiredMessage" :rules="passwordRules">
    <FormInput v-bind="$attrs" v-model="modelValue" type="password" password :clearable="false" :show-word-limit="false">
      <template v-if="$slots.prefix" #prefix>
        <slot name="prefix" />
      </template>
    </FormInput>
    <div class="password-strength" :class="'level-' + strengthLevel">
      <div class="bars" aria-hidden="true">
        <span v-for="segment in 3" :key="segment" class="bar" :class="{ active: segment <= strengthLevel }" />
      </div>
      <div class="text" aria-live="polite">
        <template v-if="strengthLevel || strengthUnavailable">
          {{ strengthUnavailable ? $t('security.password.strengthUnavailable') : $t('security.password.strength', { level: strengthText }) }}
        </template>
      </div>
    </div>
  </FormItemBox>
</template>

<style scoped lang="less">
.password-strength {
  margin-top: var(--ui-space-6);

  .bars {
    display: flex;
    gap: var(--ui-space-4);

    .bar {
      flex: 1;
      height: var(--ui-size-4);
      border-radius: var(--ui-radius-full);
      background-color: var(--ui-color-border-default);
    }
  }

  .text {
    min-height: var(--ui-line-height-md);
    margin-top: var(--ui-space-4);
    color: var(--ui-form-helper-color);
    line-height: var(--ui-line-height-md);
  }

  &.level-1 .bar.active {
    background-color: var(--ui-color-error);
  }

  &.level-2 .bar.active {
    background-color: var(--ui-color-warning);
  }

  &.level-3 .bar.active {
    background-color: var(--ui-color-success);
  }
}

.form-password {
  margin-bottom: 0;

  :deep(.ivu-form-item-error-tip) {
    position: static;
    padding-top: var(--ui-space-4);
    line-height: var(--ui-line-height-md);
    opacity: 1;
    animation: none;

    &.fade-leave-active {
      display: none;
    }
  }

  &.ivu-form-item-error {
    .password-strength {
      .bar.active {
        background-color: var(--ui-color-border-default);
      }

      .text {
        display: none;
      }
    }
  }
}
</style>
