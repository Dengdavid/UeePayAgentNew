<template>
  <FormPupBox ref="pupRef" :pup="pup">
    <div class="deliver-info">
      <img src="@/assets/images/deliver.jpg" :alt="$t('card.index.detail.delivery.imageAlt')" />
      <div class="deliver-content">
        <div class="deliver-item">
          <span>{{ $t('card.index.detail.delivery.company') }}</span>
          <strong>{{ pup.form.platform_waybill_company || '--' }}</strong>
        </div>
        <div class="deliver-item">
          <span>{{ $t('card.index.detail.delivery.trackingNumber') }}</span>
          <div class="deliver-number">
            <strong>{{ pup.form.platform_waybill_number || '--' }}</strong>
            <Button v-if="pup.form.platform_waybill_number" type="text" @click="copyWaybill">{{ $t('card.index.detail.delivery.copy') }}</Button>
          </div>
        </div>
      </div>
    </div>
  </FormPupBox>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { Copy } from 'view-ui-plus'
import { cardApi } from '@/api'
import { message } from '@/utils/message.js'
import { t } from '@/utils'

const pupRef = ref(null)
const defaultForm = () => ({
  platform_waybill_number: '',
  platform_waybill_company: '',
})
const pup = reactive({
  status: false,
  title: t('card.index.detail.delivery.title'),
  width: 440,
  isNotFooter: true,
  form: defaultForm(),
  actions: [],
})

const open = async (card) => {
  if (!card?.id) return
  pup.form = defaultForm()
  pup.status = true
  pup.loading = true
  try {
    pup.form = await cardApi.vccDeliverInfo({ cardId: card.id }) || defaultForm()
  } catch (error) {
    pup.status = false
    message(error?.msg || t('card.index.detail.delivery.queryFailed'), 'error')
  } finally {
    pup.loading = false
  }
}

const close = () => {
  pup.status = false
}

const copyWaybill = () => {
  if (!pup.form.platform_waybill_number) return
  Copy({ text: pup.form.platform_waybill_number })
}

defineExpose({ open, close })
</script>

<style scoped lang="less">
.deliver-info {
  display: flex;
  align-items: center;
  gap: 18px;
  padding: var(--ui-padding-14);
  background: #f7f9fc;
  border-radius: var(--ui-radius-6);

  > img {
    width: var(--ui-size-88);
    height: 88px;
    flex-shrink: 0;
    object-fit: cover;
    border-radius: var(--ui-radius-6);
  }
}

.deliver-content {
  flex: 1;
  min-width: 0;
}

.deliver-item {
  & + & {
    margin-top: 14px;
  }

  > span {
    display: block;
    margin-bottom: 4px;
    color: var(--ui-color-text-muted);
    font-size: 12px;
  }

  strong {
    color: var(--ui-color-text);
    font-size: 13px;
    overflow-wrap: anywhere;
  }
}

.deliver-number {
  display: flex;
  align-items: center;
  gap: 8px;

  strong {
    flex: 1;
    min-width: 0;
  }
}
</style>
