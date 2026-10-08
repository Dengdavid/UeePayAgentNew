<template>
  <template v-if="canAccess">
  <UiPage :key="`${shared}:${cardId}`" v-if="isPhone" :fallback="{ name: shared ? 'sharedCard' : 'card' }" :tabs="tabs" isNotTitle />
  <UiPage isBack isNotBg :fallback="{ name: shared ? 'sharedCard' : 'card' }" v-else>
    <CardOverview
        :key="`${shared}:${cardId}`"
        :card="card"
        :shared="shared"
        :loading="loading"
        @update:card="handleCardUpdate"
        @reload="handleOverviewReload"
    />
    <CardBox v-if="hasCardPermission('transaction', shared) && (!shared || card.shared_wallet_id)" :title="$t('card.detail.billsTitle')" class="mt-20">
      <CardBillPage ref="billPageRef" :key="`${shared}:${cardId}:${card.shared_wallet_id}`" :card-id="cardId" :shared="shared" :shared-wallet-id="card.shared_wallet_id" @reload="handleCardReload" />
    </CardBox>
  </UiPage>
  </template>
</template>

<script setup>
import { cardApi } from '@/api'
import CardBillPage from '@/views/card/detail/components/CardBillPage.vue'
import CardOverview from '@/views/card/detail/components/CardOverview.vue'
import { message, showRequestError } from '@/utils/message.js'
import { t } from '@/utils'
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { useRoute, toRoute } from '@/utils/route.js'
import { hasCardPermission } from '@/utils/permission'
import { isPhone } from '@/utils/device.js'
import { useCardStore, useUserStoreRefs } from '@/utils/store'

const route = useRoute()
const isDetailRoute = () => ['cardDetail', 'sharedCardDetail'].includes(route.name)
const shared = computed(() => route.meta.cardType === 'share')
const canAccess = computed(() => hasCardPermission('view', shared.value))
const cardId = computed(() => route.params.id)
const cardStore = useCardStore()
const { user } = useUserStoreRefs()
watch([() => route.name === 'cardDetail', () => user.value?.id, canAccess], async ([needsBins, userId, allowed], _, onCleanup) => {
    let active = true
    onCleanup(() => { active = false })
    if (!needsBins) return
    cardStore.bins = []
    if (!needsBins || !userId || !allowed) return
    try {
        const bins = await cardApi.getBinList()
        if (active) cardStore.bins = Array.isArray(bins) ? bins : []
    } catch (error) { showRequestError(error) }
}, { immediate: true, flush: 'sync' })
const loading = ref(true)
const card = ref({})
const billPageRef = ref(null)
let detailRequestId = 0

const handleCardUpdate = (value) => {
    card.value = value
}
const init = async () => {
    if (!isDetailRoute() || !canAccess.value) return
    if (!cardId.value) {
        message(t('card.detail.cardIdMissing'), 'error')
        loading.value = false
        return
    }
    const requestId = ++detailRequestId
    loading.value = true
    try {
        const result = await (shared.value ? cardApi.sharedCardInfo : cardApi.vccInfo)({ cardId: cardId.value })
        if (requestId === detailRequestId && canAccess.value) card.value = result || {}
    } catch (error) { showRequestError(error) } finally {
        if (requestId === detailRequestId) loading.value = false
    }
}
const handleOverviewReload = (options = {}) => {
    if (options.detail !== false) init()
    billPageRef.value?.reset?.()
}
const handleCardReload = () => init()
const tabs = computed(() => [
    {
        title: t('card.detail.title'),
        name: 'detail',
        permission: shared.value ? 'shared_card.view' : 'card.view',
        component: CardOverview,
        passActive: false,
        forwardInit: false,
        props: {
            card: card.value,
            shared: shared.value,
            loading: loading.value,
        },
        events: {
            'update:card': handleCardUpdate,
            reload: handleOverviewReload,
        },
    },
    ...(hasCardPermission('transaction', shared.value) && (!shared.value || card.value.shared_wallet_id) ? [{
        title: t('card.detail.billsTitle'),
        name: 'bill',
        component: CardBillPage,
        passActive: false,
        forwardInit: false,
        props: { cardId: cardId.value, shared: shared.value, sharedWalletId: card.value.shared_wallet_id },
        events: { reload: handleCardReload },
    }] : []),
])

watch([() => route.name, cardId, shared, canAccess], () => {
    ++detailRequestId
    card.value = {}
    if (!isDetailRoute()) return
    if (!canAccess.value) {
        toRoute('error_403', {}, 'query', { replace: true })
        return
    }
    init()
}, { immediate: true, flush: 'sync' })
onBeforeUnmount(() => { ++detailRequestId })
</script>
