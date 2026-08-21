<template>
  <FormPupBox ref="pupRef" :pup="pup">
    <template #default="{ form }">
      <div class="list-b-16">
        <FormItemBox v-if="mode !== 'email'" :label="$t('card.index.detail.contact.phone')" prop="phone" isRequired>
          <PhoneInput v-model="form.phone" v-model:phoneCode="form.phoneCode" />
        </FormItemBox>
        <FormItemBox v-if="mode !== 'phone'" :label="$t('card.index.detail.contact.email')" prop="email" isRequired>
          <FormEmail v-model="form.email" size="large" :placeholder="$t('card.index.detail.contact.emailPlaceholder')" />
        </FormItemBox>
      </div>
    </template>
  </FormPupBox>
</template>

<script setup>
import { reactive, ref } from 'vue'
import PhoneInput from '@/components/utils/phone-input.vue'
import { cardApi } from '@/api'
import { message } from '@/utils/message.js'
import { t } from '@/utils'

const emit = defineEmits(['success'])
const pupRef = ref(null)
const cardId = ref('')
const mode = ref('all')
const defaultForm = () => ({ phoneCode: '86', phone: '', email: '' })

const pup = reactive({
  status: false,
  title: t('card.index.detail.contact.title'),
  width: 440,
  labelPosition: 'top',
  form: defaultForm(),
  rules: {
    phone: [
      { required: true, message: t('card.index.detail.contact.phoneRequired'), trigger: 'blur' },
      { pattern: /^[0-9-]*$/, message: t('card.index.detail.contact.phoneInvalid'), trigger: 'blur', transform: (value) => value?.trim() },
    ],
    email: [
      { required: true, message: t('card.index.detail.contact.emailRequired'), trigger: 'blur' },
      { type: 'email', message: t('card.index.detail.contact.emailInvalid'), trigger: 'blur' },
    ],
  },
  actions: [
    {
      label: t('card.index.detail.contact.confirm'),
      click: async (currentPup) => {
        const params = { cardId: cardId.value }
        if (mode.value !== 'email') {
          params.phone = currentPup.form.phone
          params.phoneCode = currentPup.form.phoneCode
        }
        if (mode.value !== 'phone') params.email = currentPup.form.email
        try {
          await cardApi.updateHolder(params)
          message(t('card.index.detail.contact.success'))
          currentPup.status = false
          emit('success')
        } catch (error) {
          message(error?.msg || t('card.index.detail.contact.failed'), 'error')
        } finally {
          currentPup.loading = false
        }
      },
    },
  ],
})

const open = (card, editMode = 'all') => {
  if (!card?.id) return
  cardId.value = card.id
  mode.value = editMode
  pup.title = editMode === 'phone' ? t('card.index.detail.contact.phoneTitle') : editMode === 'email' ? t('card.index.detail.contact.emailTitle') : t('card.index.detail.contact.title')
  pup.form = {
    phoneCode: card.holder_phone_code || '86',
    phone: card.holder_phone || '',
    email: card.holder_email || '',
  }
  pup.status = true
}

const close = () => {
  pup.status = false
}

defineExpose({ open, close })
</script>
