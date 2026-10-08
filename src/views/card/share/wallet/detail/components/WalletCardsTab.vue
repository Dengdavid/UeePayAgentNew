<template>
  <CardList v-if="canView" :key="walletId" shared api-url="/vcc/SharedWallet/cards"
    :search-params="{ shared_wallet_id: walletId, card_bin: '', card_no: '', startTime: '', endTime: '' }"
    status-key="status" bin-key="card_bin" :bin-options="bins" :view-allowed="canView" :show-create="false" :show-shared-wallet="false"
    detail-permission="shared_card.view" :private-request="cardApi.sharedCardPrivate" :label-request="cardApi.sharedCardLabel"
    :padding="isPhone ? 16 : 0" />
</template>

<script setup>
import { showRequestError } from '@/utils/message.js'
import { computed, onMounted, ref } from 'vue'
import { cardApi } from '@/api'
import { hasPermission } from '@/utils/permission'
import { t } from '@/utils'
import { isPhone } from '@/utils/device.js'
import CardList from '@/views/card/components/CardList.vue'

defineProps({ walletId: { type: String, required: true } })
const canView = computed(() => hasPermission('shared_wallet.view') && hasPermission('shared_wallet.cards'))
const bins = ref([])
onMounted(async () => {
  if (!canView.value) return
  try {
    const result = await cardApi.sharedCardBins()
    bins.value = Array.isArray(result) ? result : []
  } catch (error) { showRequestError(error) }
})
</script>
