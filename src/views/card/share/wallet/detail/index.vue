<template>
  <template v-if="canAccess">
    <UiPage v-if="isPhone" :key="route.params.id" :tabs="mobileTabs" isNotTitle :fallback="{ name: 'cardSharedWallets' }" />
    <div v-else class="ui-layout">
      <UiPage ref="pageRef" isBack isNotBg :title="t('card.index.sharedManagement.detailTitle')" :fallback="{ name: 'cardSharedWallets' }">
        <WalletOverview v-bind="overviewProps" v-on="overviewEvents" />
        <UiPage v-if="can('shared_wallet.cards') || can('shared_wallet.transaction')" :key="route.params.id" :tabs="tabs" class="mt-20" isNotTitle />
      </UiPage>
    </div>
    <WalletTransferModal :key="`transfer-${route.params.id}`" ref="transferRef" v-model:busy="fundsBusy" @success="handleFundsSuccess" />
    <WalletCollectModal :key="`collect-${route.params.id}`" ref="collectRef" v-model:busy="fundsBusy" @success="handleFundsSuccess" />
  </template>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue'
import { isPhone } from '@/utils/device.js'
import WalletOverview from './components/WalletOverview.vue'
import WalletCardsTab from './components/WalletCardsTab.vue'
import WalletTransactionsTab from './components/WalletTransactionsTab.vue'
import { cardApi } from '@/api'
import { hasPermission, hasCardPermission } from '@/utils/permission'
import { confirm, message, showRequestError } from '@/utils/message'
import { escapeHtml } from '@/utils/text'
import { copyText } from '@/utils/dataInfo.js'
import WalletTransferModal from '../components/WalletTransferModal.vue'
import WalletCollectModal from '../components/WalletCollectModal.vue'
import { getApi } from '@/utils/api.js'
import { t } from '@/utils'
import { toRoute, useRoute } from '@/utils/route'
const pageRef=ref(null)
const detail=ref({})
const route = useRoute()
const transferRef = ref(null)
const collectRef = ref(null)
const fundsBusy = ref(false)
const changingStatus = ref(false)
const loadingDetail = ref(true)
const transactionsRefreshKey = ref(0)
const canAccess = computed(() => hasPermission('shared_wallet.view'))
const actionsDisabled = computed(() => loadingDetail.value || fundsBusy.value || changingStatus.value || Number(detail.value.status) === 2 || !detail.value.id || String(detail.value.id) !== route.params.id)
const can = code => canAccess.value && hasPermission(code)
let alive = true
let loadVersion = 0
const copyId = () => {
  if (!canAccess.value || loadingDetail.value || !detail.value.id || String(detail.value.id) !== route.params.id) return
  copyText(String(detail.value.id), t('card.index.sharedManagement.idCopied'), t('card.index.bills.copyFailed'))
}
/** 加载当前账户详情，忽略路由切换前的旧响应。 */
const getDetail = async () => {
  if (!canAccess.value || !route.params.id) return
  const id = route.params.id
  const version = ++loadVersion
  loadingDetail.value = true
  await nextTick()
  if (!alive || version !== loadVersion) return
  if (pageRef.value) pageRef.value.loading = true
  try {
    const result = await getApi('/vcc/SharedWallet/detail', { shared_wallet_id: id })
    if (!alive || version !== loadVersion || !canAccess.value || route.params.id !== id) return
    if (!result || String(result.id) !== id) throw new Error('Invalid wallet detail')
    detail.value = result
  } catch (error) {
    if (alive && version === loadVersion) {
      detail.value = {}
      showRequestError(error)
    }
  } finally {
    if (alive && version === loadVersion) {
      loadingDetail.value = false
      if (pageRef.value) pageRef.value.loading = false
    }
  }
}

const handleFundsSuccess = () => {
  if (!alive || !canAccess.value) return
  transactionsRefreshKey.value++
  getDetail()
}

/** 打开当前账户的划转弹窗。 */
const openTransfer = () => {
  if (actionsDisabled.value || !can('shared_wallet.transfer') || detail.value.status == null || Number(detail.value.status) !== 0) return
  transferRef.value?.open({ ...detail.value, id: String(detail.value.id) })
}

/** 打开当前账户的归集弹窗。 */
const openCollect = () => {
  if (actionsDisabled.value || !can('shared_wallet.collect') || detail.value.status == null || Number(detail.value.status) !== 0) return
  collectRef.value?.open({ ...detail.value, id: String(detail.value.id) })
}

/** 正常状态的账户进入现有编辑页面。 */
const edit = () => {
  if (actionsDisabled.value || !can('shared_wallet.update') || detail.value.status == null || Number(detail.value.status) !== 0) return
  toRoute('cardSharedWalletEdit', { id: String(detail.value.id) }, 'params')
}

/** 确认后切换账户启停状态，成功后刷新详情。 */
const changeStatus = async () => {
  if (actionsDisabled.value || !can(Number(detail.value.status) === 0 ? 'shared_wallet.disable' : 'shared_wallet.enable') || detail.value.status == null || ![0, 1].includes(Number(detail.value.status))) return
  const id = String(detail.value.id)
  const status = Number(detail.value.status) === 0 ? 1 : 0
  changingStatus.value = true
  try {
    const confirmed = await confirm(escapeHtml(t(`card.index.sharedManagement.${status ? 'disableConfirm' : 'enableConfirm'}`, { name: detail.value.name })), { resolveCancel: true })
    if (!confirmed || !alive || !can(status === 1 ? 'shared_wallet.disable' : 'shared_wallet.enable') || route.params.id !== id) return
    await cardApi.setSharedWalletStatus({ shared_wallet_id: id, status })
    if (!alive || route.params.id !== id || !canAccess.value) return
    message(t('card.index.sharedManagement.statusSuccess'))
    await getDetail()
  } catch (error) { showRequestError(error) } finally {
    changingStatus.value = false
  }
}

const overviewProps = computed(() => ({
  detail: detail.value,
  loadingDetail: loadingDetail.value,
  actionsDisabled: actionsDisabled.value,
  changingStatus: changingStatus.value,
  can,
}))
const openCard = () => {
  if (!canAccess.value || !hasCardPermission('create', true) || actionsDisabled.value || detail.value.status == null || Number(detail.value.status) !== 0) return
  toRoute('sharedCardAdd', { shared_wallet_id: String(detail.value.id) })
}
const overviewEvents = { copy: copyId, transfer: openTransfer, collect: openCollect, edit, status: changeStatus, openCard, refresh: () => { if (!loadingDetail.value) getDetail() } }
const tabs = computed(() => [
  { title: t('card.index.sharedManagement.managementTitle'), name: 'transactions', permission: ['shared_wallet.view', 'shared_wallet.transaction'], component: WalletTransactionsTab, passActive: false, forwardInit: false, props: { walletId: route.params.id, refreshKey: transactionsRefreshKey.value } },
  { title: t('card.index.sharedManagement.relatedCards'), name: 'cards', permission: ['shared_wallet.view', 'shared_wallet.cards'], component: WalletCardsTab, passActive: false, forwardInit: false, props: { walletId: route.params.id } },
])
const mobileTabs = computed(() => [
  { title: t('card.index.sharedManagement.basicInfo'), name: 'detail', component: WalletOverview, passActive: false, forwardInit: false, props: overviewProps.value, events: overviewEvents },
  ...tabs.value,
])

watch([() => route.params.id, canAccess], ([id, allowed]) => {
  if (!allowed) {
    ++loadVersion
    detail.value = {}
    toRoute('error_403', {}, 'query', { replace: true })
    return
  }
  detail.value = {}
  if (id) getDetail()
}, { immediate: true })

onBeforeUnmount(() => { alive = false })
</script>
