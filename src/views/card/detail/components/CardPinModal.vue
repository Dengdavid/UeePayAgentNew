<template>
  <FormPupBox ref="pupRef" :pup="pup">
    <template #default="{ form }">
      <div class="list-b-16">
        <FormItemBox :label="$t('card.index.detail.pin.inputLabel')" prop="pin" isRequired>
          <FormInput v-model="form.pin" size="large" type="password" :maxlength="6" inputmode="numeric" :placeholder="$t('card.index.detail.pin.inputPlaceholder')" />
        </FormItemBox>
        <FormItemBox :label="$t('card.index.detail.pin.confirmLabel')" prop="repin" isRequired>
          <FormInput v-model="form.repin" size="large" type="password" :maxlength="6" inputmode="numeric" :placeholder="$t('card.index.detail.pin.confirmPlaceholder')" />
        </FormItemBox>
        <Alert type="warning" show-icon>
          <p>{{ $t('card.index.detail.pin.purpose') }}</p>
          <ul class="pin-tips">
            <li>{{ $t('card.index.detail.pin.digitsOnly') }}</li>
            <li>{{ $t('card.index.detail.pin.noSequential') }}</li>
            <li>{{ $t('card.index.detail.pin.noRepeated') }}</li>
          </ul>
        </Alert>
      </div>
    </template>
  </FormPupBox>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { cardApi } from '@/api'
import { message } from '@/utils/message.js'
import { t } from '@/utils'

const emit = defineEmits(['success'])
const pupRef = ref(null)
const cardId = ref('')
const defaultForm = () => ({ pin: '', repin: '' })

const validatePin = (rule, value) => new Promise((resolve, reject) => {
  if (!/^\d{6}$/.test(value || '')) {
    reject(t('card.index.detail.pin.invalidLength'))
  } else if (/012|123|234|345|456|567|678|789/.test(value)) {
    reject(t('card.index.detail.pin.sequentialError'))
  } else if (/(\d)\1{2}/.test(value)) {
    reject(t('card.index.detail.pin.repeatedError'))
  } else {
    resolve()
  }
})

const pup = reactive({
  status: false,
  title: t('card.index.detail.pin.title'),
  width: 440,
  labelPosition: 'top',
  form: defaultForm(),
  rules: {
    pin: [
      { required: true, message: t('card.index.detail.pin.required'), trigger: 'blur' },
      { asyncValidator: validatePin, trigger: 'blur' },
    ],
    repin: [
      { required: true, message: t('card.index.detail.pin.confirmRequired'), trigger: 'blur' },
      {
        validator: (rule, value, callback) => {
          value === pup.form.pin ? callback() : callback(new Error(t('card.index.detail.pin.mismatch')))
        },
        trigger: 'blur',
      },
    ],
  },
  actions: [
    {
      label: t('card.index.detail.pin.confirm'),
      click: async (currentPup) => {
        try {
          await cardApi.updatePin({ cardId: cardId.value, pin: currentPup.form.pin })
          message(t('card.index.detail.pin.success'))
          currentPup.status = false
          emit('success')
        } catch (error) {
          message(error?.msg || t('card.index.detail.pin.failed'), 'error')
        } finally {
          currentPup.loading = false
        }
      },
    },
  ],
})

const open = (card) => {
  if (!card?.id) return
  cardId.value = card.id
  pup.form = defaultForm()
  pup.status = true
}

const close = () => {
  pup.status = false
}

defineExpose({ open, close })
</script>

<style scoped lang="less">
.pin-tips {
  margin-top: 4px;
  padding-left: 18px;
  line-height: 22px;
}
</style>
