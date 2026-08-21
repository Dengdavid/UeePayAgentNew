<template>
  <UiPage v-if="isPhone" :fallback="{ name: 'card' }" :tabs="tabs" isNotTitle />
  <UiPage isBack isNotBg :fallback="{ name: 'card' }" v-else>
    <CardOverview
        :card="card"
        :loading="loading"
        @update:card="handleCardUpdate"
        @reload="handleOverviewReload"
    />
    <CardBox :title="$t('card.detail.billsTitle')" class="mt-20">
      <CardBillPage ref="billPageRef" :key="cardId" :card-id="cardId" @reload="handleCardReload" />
    </CardBox>
  </UiPage>
</template>

<script setup>
import { cardApi } from '@/api'
import CardBillPage from '@/views/card/detail/components/CardBillPage.vue'
import CardOverview from '@/views/card/detail/components/CardOverview.vue'
import { message } from '@/utils/message.js'
import { t } from '@/utils'
import { computed, onMounted, ref } from 'vue'
import { useRouteParams } from '@/utils/route.js'
import { isPhone } from '@/utils/device.js'
import { onBeforeRouteUpdate } from 'vue-router'

const routeParams = useRouteParams()
const cardId = ref(routeParams.id)
const loading = ref(true)
const card = ref({})
const billPageRef = ref(null)
let detailRequestId = 0

const handleCardUpdate = (value) => {
    card.value = value
}
const init = async () => {
    if (!cardId.value) {
        message(t('card.detail.cardIdMissing'), 'error')
        loading.value = false
        return
    }
    const requestId = ++detailRequestId
    loading.value = true
    try {
        const result = await cardApi.vccInfo({ cardId: cardId.value })
        if (requestId === detailRequestId) card.value = result || {}
    } catch (error) {
        if (requestId === detailRequestId) message(error?.msg || t('card.detail.loadFailed'), 'error')
    } finally {
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
        component: CardOverview,
        passActive: false,
        forwardInit: false,
        props: {
            card: card.value,
            loading: loading.value,
        },
        events: {
            'update:card': handleCardUpdate,
            reload: handleOverviewReload,
        },
    },
    {
        title: t('card.detail.billsTitle'),
        name: 'bill',
        component: CardBillPage,
        passActive: false,
        forwardInit: false,
        props: { cardId: cardId.value },
        events: { reload: handleCardReload },
    },
])

onMounted(init)
onBeforeRouteUpdate((to) => {
    cardId.value = to.params.id
    card.value = {}
    init()
})
</script>
