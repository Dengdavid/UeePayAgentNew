<template>
  <UiPage v-if="can('view')" :padding="0" isNotTitle>
    <div class="card-layout" :class="{ 'is-shared': shared }">
        <div class="card-left">
            <div class="card-preview">
                <BankCard
                    :card="displayCard"
                    :masked="!isPrivateVisible"
                    :private-loading="privateLoading"
                    :can-view-private="can('private')"
                    @toggle-private="handleTogglePrivate"
                />
                <div v-if="statusMeta" class="card-status-floating">
                    <UITag
                        solid
                        :title="statusMeta.label"
                        :type="statusMeta.type"
                        :class="{ 'is-processing': statusMeta.processing }"
                        role="status"
                    />
                </div>
            </div>
            <div
                class="card-action"
                :class="{ 'is-keyboard-open': isKeyboardOpen, 'is-shared': shared }"
                :style="{ '--keyboard-offset': `${keyboardOffset}px` }"
            >
                <Tooltip v-if="shared" class="action-tooltip" :disabled="canWallet('transfer')" :content="$t('counts.noPermission')" placement="top" transfer>
                    <div class="btn btn-into" :class="{ disabled: !canWallet('transfer') || walletActionsDisabled }" @click="handleOpenWallet('transfer')" :aria-disabled="!canWallet('transfer') || walletActionsDisabled">
                        <Icon custom="iconfont icon-recharge" :size="24" />
                        <div class="text">{{ $t('card.index.sharedManagement.transfer') }}</div>
                    </div>
                </Tooltip>
                <Tooltip v-if="shared" class="action-tooltip" :disabled="canWallet('collect')" :content="$t('counts.noPermission')" placement="top" transfer>
                    <div class="btn btn-out ui-text-warning" :class="{ disabled: !canWallet('collect') || walletActionsDisabled }" @click="handleOpenWallet('collect')" :aria-disabled="!canWallet('collect') || walletActionsDisabled">
                        <Icon custom="iconfont icon-withdraw" :size="24" />
                        <div class="text">{{ $t('card.index.sharedManagement.collect') }}</div>
                    </div>
                </Tooltip>
                <Tooltip v-if="!shared" class="action-tooltip" :disabled="can('recharge')" :content="$t('counts.noPermission')" placement="top" transfer>
                    <div class="btn btn-into" :class="{ disabled: actionDisabled('into') }" :aria-label="intoActionText" @click="handleOpenInto" :aria-disabled="actionDisabled('into')">
                        <Icon custom="iconfont icon-recharge" :size="24" />
                        <div class="text">{{ intoActionText }}</div>
                    </div>
                </Tooltip>
                <Tooltip v-if="!shared" class="action-tooltip" :disabled="can('withdraw')" :content="$t('counts.noPermission')" placement="top" transfer>
                    <div class="btn btn-out ui-text-warning" :class="{ disabled: actionDisabled('out') }" :aria-label="outActionText" @click="handleOpenOut" :aria-disabled="actionDisabled('out')">
                        <Icon custom="iconfont icon-withdraw" :size="24" />
                        <div class="text">{{ outActionText }}</div>
                    </div>
                </Tooltip>
                <Tooltip class="action-tooltip" :disabled="can(Number(card.account_status) === 0 ? 'suspend' : 'enable')" :content="$t('counts.noPermission')" placement="top" transfer>
                    <div class="btn btn-freeze ui-text-dot" :class="{ disabled: actionDisabled('frozen') }" :aria-label="frozenActionText" @click="handleFrozen" :aria-disabled="actionDisabled('frozen')">
                        <Icon custom="iconfont icon-freeze" :size="24" />
                        <div class="text">{{ frozenActionText }}</div>
                    </div>
                </Tooltip>
                <Tooltip class="action-tooltip" :disabled="can('destroy')" :content="$t('counts.noPermission')" placement="top" transfer>
                    <div class="btn btn-write-off ui-text-error" :class="{ disabled: actionDisabled('writeOff') }" :aria-label="writeOffActionText" @click="handleWriteOff" :aria-disabled="actionDisabled('writeOff')">
                        <Icon custom="iconfont icon-write-off" :size="24" />
                        <div class="text">{{ writeOffActionText }}</div>
                    </div>
                </Tooltip>
            </div>
        </div>

        <div class="card-right">
            <div class="card-tools">
                <div class="card-tools-actions">
                    <Button class="tool-btn tool-btn--secondary" size="default" icon="md-card" :title="$t('card.index.detail.overview.paymentExample')" @click="exampleModalRef.open()">{{ $t('card.index.detail.overview.paymentExample') }}</Button>
                    <Button v-if="!shared && can('update')" class="tool-btn tool-btn--secondary" type="default" icon="md-settings" :title="$t('card.index.detail.overview.messageSettings')" @click="openPupMessage(card)">{{ $t('card.index.detail.overview.messageSettings') }}</Button>
                    <Button v-if="isPrivateVisible" class="tool-btn tool-btn--secondary" size="default" custom-icon="iconfont icon-fuzhi" :title="$t('card.index.detail.overview.copyCardInfo')" @click="handleCopyCard">{{ $t('card.index.detail.overview.copyCardInfo') }}</Button>
                    <div v-if="!shared && can('update') && card.physical" class="physical-actions">
                        <Button v-if="card.deliver_status === 0" class="tool-btn physical-btn" type="primary" shape="circle" :title="$t('card.index.detail.overview.applyPhysicalCard')" @click="handleGoPhysical">{{ $t('card.index.detail.overview.applyPhysicalCard') }}</Button>
                        <Button v-if="card.deliver_status > 1 && card.physical_status !== 2" class="tool-btn physical-btn" type="primary" shape="circle" :title="$t('card.index.detail.overview.activatePhysicalCard')" @click="handleGoActivation">{{ $t('card.index.detail.overview.activatePhysicalCard') }}</Button>
                        <Button v-if="card.deliver_status === 1 || card.deliver_status === 2" class="tool-btn physical-btn" type="primary" shape="circle" :title="$t('card.index.detail.overview.cardProduction')" disabled>{{ $t('card.index.detail.overview.cardProduction') }}</Button>
                        <Button v-if="card.deliver_status === 3 && card.physical_status !== 2" class="tool-btn physical-btn" type="info" shape="circle" :title="$t('card.index.detail.overview.viewDelivery')" @click="deliverModalRef.open(card)">{{ $t('card.index.detail.overview.viewDelivery') }}</Button>
                        <Button class="tool-btn physical-btn" type="primary" shape="circle" :title="$t('card.index.detail.overview.setPin')" @click="pinModalRef.open(card)">{{ $t('card.index.detail.overview.setPin') }}</Button>
                    </div>
                </div>
                <div class="card-tools-meta">
                    <span class="card-type">
                        <span class="card-type-icon" aria-hidden="true">
                            <Icon v-if="shared" custom="iconfont icon-feiyong" :size="12" />
                            <Icon v-else custom="iconfont icon-yinhangka-m" :size="12" />
                        </span>
                        <span class="card-type-name">{{ shared ? $t('card.index.sharedCard') : $t('card.index.regularCard') }}</span>
                    </span>
                </div>
            </div>

            <div class="card-summary-panel">
                <CardTotal ref="cardTotalRef" :card="card" :shared="shared" :refreshing="balanceLoading || balanceSyncing" @refresh="handleRefreshBalance" />
                <div class="cardholder-info">
                    <div class="cardholder-info-grid">
                        <div class="info-row info-row--primary">
                            <div class="info-item">
                                <div class="info-label">{{ $t('card.index.detail.overview.cardholderName') }}</div>
                                <div class="info-value">
                                    <span class="info-text">{{ card.holder_username || '--' }}</span>
                                    <button v-if="card.holder_username" class="info-action" type="button" @click="copy(card.holder_username)">{{ $t('card.index.detail.overview.copy') }}</button>
                                </div>
                            </div>
                            <div class="info-item">
                                <div class="info-label">{{ $t('card.index.detail.overview.cardLabel') }}</div>
                                <div class="info-value">
                                    <span class="info-text">{{ card.label || '--' }}</span>
                                    <Tooltip v-if="card.id && card.status !== -1" :disabled="can('update')" :content="$t('counts.noPermission')" placement="top" transfer>
                                        <span class="edit-tooltip-trigger" :tabindex="can('update') ? undefined : 0" :aria-label="can('update') ? undefined : $t('counts.noPermission')">
                                            <button class="info-action" type="button" :disabled="!can('update')" @click="handleEdit">{{ $t('card.index.detail.overview.edit') }}</button>
                                        </span>
                                    </Tooltip>
                                </div>
                            </div>
                            <div class="info-item info-item--scene">
                                <div class="info-label">{{ $t('card.index.detail.overview.usageScenario') }}</div>
                                <div class="info-value info-value--scene">
                                    <SceneBox :shared="shared" :card="card" @onConfirm="emit('reload')" />
                                </div>
                            </div>
                        </div>
                        <div v-if="card.physical" class="info-row info-row--secondary">
                            <div class="info-item">
                                <div class="info-label">{{ $t('card.index.detail.overview.phone') }}</div>
                                <div class="info-value">
                                    <span class="info-text">{{ card.holder_phone ? `+${card.holder_phone_code} ${phoneText}` : '--' }}</span>
                                    <button v-if="can('update')" class="info-action" type="button" @click="contactModalRef.open(card, 'phone')">{{ $t('card.index.detail.overview.edit') }}</button>
                                </div>
                            </div>
                            <div class="info-item">
                                <div class="info-label">{{ $t('card.index.detail.overview.email') }}</div>
                                <div class="info-value">
                                    <span class="info-text">{{ card.holder_email || '--' }}</span>
                                    <button v-if="card.id && can('update')" class="info-action" type="button" @click="contactModalRef.open(card, 'email')">{{ $t('card.index.detail.overview.edit') }}</button>
                                </div>
                            </div>
                        </div>
                        <div v-else class="info-row info-row--address">
                            <div class="info-item">
                                <div class="info-label">{{ $t('card.index.detail.overview.billingAddress') }}</div>
                                <div class="info-value info-value--address">
                                    <span class="info-text">{{ address || '--' }}</span>
                                    <button v-if="address" class="info-action" type="button" @click="copy(address)">{{ $t('card.index.detail.overview.copy') }}</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div v-if="loading" class="card-loading"><UiLoading /></div>
    </div>
  </UiPage>

    <IntoModal v-if="can('recharge')" ref="intoModalRef" @on-update="handleTransferUpdate('transferIn', $event)" />
    <OutModal v-if="can('withdraw')" ref="outModalRef" @on-update="handleTransferUpdate('transferOut', $event)" />
    <WalletCollectModal v-if="canWallet('collect')" ref="walletCollectRef" v-model:busy="walletBusy" @success="emit('reload')" />
    <WalletTransferModal v-if="canWallet('transfer')" ref="walletTransferRef" v-model:busy="walletBusy" @success="emit('reload')" />
    <PaymentExampleModal ref="exampleModalRef" />
    <CardPinModal v-if="!shared && can('update')" ref="pinModalRef" @success="emit('reload')" />
    <CardDeliverModal ref="deliverModalRef" />
    <CardContactModal :shared="shared" v-if="can('update')" ref="contactModalRef" @success="emit('reload')" />
    <PupMessage v-if="can('update')" ref="messageModalRef" @confirm="emit('reload')" />
</template>

<script setup>
import UiLoading from '@/components/layout/UiLoading.vue'
import BankCard from '@/components/ui/bank-card.vue'
import CardTotal from '@/views/card/detail/components/CardTotal.vue'
import SceneBox from '@/views/card/detail/components/SceneBox.vue'
import CardContactModal from '@/views/card/detail/components/CardContactModal.vue'
import CardDeliverModal from '@/views/card/detail/components/CardDeliverModal.vue'
import CardPinModal from '@/views/card/detail/components/CardPinModal.vue'
import PaymentExampleModal from '@/views/card/detail/components/PaymentExampleModal.vue'
import IntoModal from '@/views/card/prepaid/components/IntoModal.vue'
import OutModal from '@/views/card/prepaid/components/OutModal.vue'
import WalletCollectModal from '@/views/card/share/wallet/components/WalletCollectModal.vue'
import WalletTransferModal from '@/views/card/share/wallet/components/WalletTransferModal.vue'
import { getApi } from '@/utils/api.js'
import PupMessage from '@/views/ucenter/components/PupMessage.vue'
import { cardApi } from '@/api'
import { confirm, confirmInput, message, showRequestError } from '@/utils/message.js'
import { toRoute } from '@/utils/route.js'
import { useKeyboardViewportOffset } from '@/composables/useKeyboardViewportOffset.js'
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { Copy, Message } from 'view-ui-plus'
import Decimal from 'decimal.js'
import { hasCardPermission, hasPermission } from '@/utils/permission'
import { t } from '@/utils'

const props = defineProps({
    card: { type: Object, default: () => ({}) },
    shared: { type: Boolean, default: false },
    loading: { type: Boolean, default: false }
})
const can = action => hasCardPermission(action, props.shared)
const canWallet = action => props.shared && can('view') && hasPermission('shared_wallet.view') && hasPermission(`shared_wallet.${action}`)
const emit = defineEmits(['update:card', 'reload'])

const walletCollectRef = ref(null)
const walletTransferRef = ref(null)
const walletBusy = ref(false)
const walletOpening = ref(false)
const walletActionsDisabled = computed(() => props.loading || walletOpening.value || walletBusy.value || submitting.value || Boolean(pendingAction.value) || !props.card.id || !props.card.shared_wallet_id)
const intoModalRef = ref(null)
const outModalRef = ref(null)
const exampleModalRef = ref(null)
const pinModalRef = ref(null)
const deliverModalRef = ref(null)
const contactModalRef = ref(null)
const messageModalRef = ref(null)
const cardTotalRef = ref(null)
const { isKeyboardOpen, keyboardOffset } = useKeyboardViewportOffset()
const privateCardInfo = ref({})
const privateLoading = ref(false)
const isPrivateVisible = ref(false)
const submitting = ref(false)
const balanceLoading = ref(false)
const balanceSyncing = ref(false)
const pendingAction = ref(null)
const STATUS_POLL_INTERVAL = 3000
const STATUS_POLL_MAX_ATTEMPTS = 20
const STATUS_STABLE_COUNT = 2
const BALANCE_POLL_INTERVAL = 4000
const BALANCE_POLL_MAX_ATTEMPTS = 15
let statusTransitionToken = 0
let statusPollingTimer = null
let statusPollingResolve = null
let activeStatusLoadingCloser = null
let privateRequestId = 0
let balanceRequestId = 0
let unmounted = false
const cardStatusMap = {
    '-1': { label: t('card.index.detail.overview.status.locked'), type: 'error' },
    0: { label: t('card.index.detail.overview.status.active'), type: 'success' },
    1: { label: t('card.index.detail.overview.status.frozen'), type: 'warning' },
    2: { label: t('card.index.detail.overview.status.closed'), type: 'error' },
    3: { label: t('card.index.detail.overview.status.closing'), type: 'warning' },
    4: { label: t('card.index.detail.overview.status.blocked'), type: 'error' }
}
const statusMeta = computed(() => pendingAction.value?.statusLabel
    ? { label: pendingAction.value.statusLabel, type: 'warning', processing: true }
    : cardStatusMap[props.card.account_status] || null)
const intoActionText = computed(() => pendingAction.value?.key === 'transferIn' ? t('card.index.detail.overview.transferInSyncing') : t('card.index.detail.overview.transferIn'))
const outActionText = computed(() => pendingAction.value?.key === 'transferOut' ? t('card.index.detail.overview.transferOutSyncing') : t('card.index.detail.overview.transferOut'))
const frozenActionText = computed(() => {
    if (pendingAction.value?.key === 'freeze') return t('card.index.detail.overview.freezing')
    if (pendingAction.value?.key === 'unfreeze') return t('card.index.detail.overview.unfreezing')
    return Number(props.card.account_status) === 1 ? t('card.index.detail.overview.unfreeze') : t('card.index.detail.overview.freeze')
})
const writeOffActionText = computed(() => pendingAction.value?.key === 'writeOff' ? t('card.index.detail.overview.closing') : t('card.index.detail.overview.close'))
const displayCard = computed(() => isPrivateVisible.value
    ? { ...props.card, ...privateCardInfo.value }
    : props.card)

const addressFields = [
    ['addressLine1', 'address_line1'], ['addressLine2', 'address_line2'], ['state'],
    ['city'], ['country'], ['postalCode', 'postal_code']
]
const address = computed(() => {
    const holderAddress = props.card.holder_address
    if (!holderAddress) return ''
    return addressFields
        .map((names) => names.reduce((value, key) => value ?? holderAddress[key], undefined))
        .filter(Boolean)
        .join(', ')
})
const phoneText = computed(() => (props.card.holder_phone || '').replace(/(\d{4})(?=\d)/g, '$1 '))
const copy = (text) => Copy({ text })
const isSameCard = (cardId) => Boolean(cardId) && String(cardId) === String(props.card.id)
const actionDisabled = (type) => {
    const permission = { into: 'recharge', out: 'withdraw', frozen: Number(props.card.account_status) === 0 ? 'suspend' : 'enable', writeOff: 'destroy' }[type]
    if (!can(permission) || submitting.value || pendingAction.value || walletOpening.value || walletBusy.value) return true
    const accountStatus = Number(props.card.account_status)
    if (!props.card.id || !Number.isFinite(accountStatus)) return true
    if (accountStatus < 0) return true
    if (type === 'writeOff') return accountStatus !== 0
    if (type === 'frozen') return accountStatus > 1
    return accountStatus > 0
}

const updateCard = (patch, cardId = props.card.id) => {
    if (!isSameCard(cardId)) return false
    emit('update:card', { ...props.card, ...patch })
    return true
}
const openPupMessage = (card) => can('update') && messageModalRef.value?.open?.([card])
const handleOpenInto = () => {
    if (!actionDisabled('into')) intoModalRef.value?.open?.(props.card)
}
const handleOpenOut = () => {
    if (!actionDisabled('out')) outModalRef.value?.open?.(props.card)
}
const handleOpenWallet = async (action) => {
    if (!canWallet(action) || walletActionsDisabled.value) return
    const cardId = props.card.id
    const walletId = String(props.card.shared_wallet_id)
    const isCurrent = () => !unmounted && isSameCard(cardId) && String(props.card.shared_wallet_id) === walletId && canWallet(action)
    walletOpening.value = true
    try {
        const wallet = await getApi('/vcc/SharedWallet/detail', { shared_wallet_id: walletId })
        if (!isCurrent()) return
        const walletStatus = wallet?.status == null ? null : Number(wallet.status)
        const errorKey = !wallet ? 'walletDetailMissing'
            : String(wallet.id) !== walletId ? 'walletMismatch'
            : walletStatus === 1 ? 'walletDisabledAction'
            : walletStatus === 2 ? 'walletLockedAction'
            : walletStatus !== 0 ? 'walletStatusInvalid' : null
        if (errorKey) {
            message(t(`card.index.sharedManagement.${errorKey}`, { name: wallet?.name == null || wallet.name === '' ? '-' : wallet.name, action: t(`card.index.sharedManagement.${action}`) }), 'error')
            return
        }
        const modal = action === 'collect' ? walletCollectRef : walletTransferRef
        await modal.value?.open({ ...wallet, id: walletId })
    } catch (error) { showRequestError(error) } finally {
        walletOpening.value = false
    }
}
const waitForStatusPoll = (interval = STATUS_POLL_INTERVAL) => new Promise((resolve) => {
    statusPollingResolve = resolve
    statusPollingTimer = window.setTimeout(() => {
        statusPollingTimer = null
        statusPollingResolve = null
        resolve()
    }, interval)
})
const cancelStatusTransition = () => {
    statusTransitionToken += 1
    activeStatusLoadingCloser?.()
    activeStatusLoadingCloser = null
    if (statusPollingTimer) window.clearTimeout(statusPollingTimer)
    statusPollingTimer = null
    statusPollingResolve?.()
    statusPollingResolve = null
    pendingAction.value = null
    submitting.value = false
    balanceSyncing.value = false
}
const waitForCardStatus = async (cardId, targetStatus, transitionToken) => {
    let stableCount = 0
    for (let attempt = 0; attempt < STATUS_POLL_MAX_ATTEMPTS; attempt += 1) {
        await waitForStatusPoll()
        if (transitionToken !== statusTransitionToken) return null
        try {
            const result = await (props.shared ? cardApi.sharedCardInfo : cardApi.vccInfo)({ cardId })
            if (transitionToken !== statusTransitionToken) return null
            const accountStatusMatched = Number(result?.account_status) === targetStatus
            const cardStatusMatched = result?.status == null || Number(result.status) === targetStatus
            if (accountStatusMatched && cardStatusMatched) {
                stableCount += 1
                if (stableCount >= STATUS_STABLE_COUNT) return result
            } else {
                stableCount = 0
            }
        } catch (error) {
            if (transitionToken !== statusTransitionToken) return null
            showRequestError(error)
            stableCount = 0
        }
    }
    return null
}
const decimalBalance = (value) => {
    try {
        const balance = new Decimal(String(value ?? 0).replace(/,/g, ''))
        return balance.isFinite() ? balance : new Decimal(0)
    } catch {
        return new Decimal(0)
    }
}
const waitForBalanceChange = async (cardId, initialAvailable, transitionToken) => {
    const initialBalance = decimalBalance(initialAvailable)
    let stableBalance = null
    let stableCount = 0
    for (let attempt = 0; attempt < BALANCE_POLL_MAX_ATTEMPTS; attempt += 1) {
        if (attempt > 0) await waitForStatusPoll(BALANCE_POLL_INTERVAL)
        if (transitionToken !== statusTransitionToken) return null
        try {
            const result = await (props.shared ? cardApi.sharedCardInfo : cardApi.vccBalance)({ cardId })
            if (transitionToken !== statusTransitionToken) return null
            const currentBalance = decimalBalance(result?.available)
            if (currentBalance.equals(initialBalance)) {
                stableBalance = null
                stableCount = 0
                continue
            }
            if (stableBalance?.equals(currentBalance)) {
                stableCount += 1
            } else {
                stableBalance = currentBalance
                stableCount = 1
            }
            if (stableCount >= STATUS_STABLE_COUNT) return result
        } catch (error) {
            if (transitionToken !== statusTransitionToken) return null
            showRequestError(error)
            stableBalance = null
            stableCount = 0
        }
    }
    return null
}
const runStatusTransition = async ({
    cardId,
    key,
    statusLabel,
    loadingText,
    targetStatus,
    request
}) => {
    const transitionToken = ++statusTransitionToken
    pendingAction.value = { key, statusLabel }
    submitting.value = true
    let closeLoading = Message.loading({ content: loadingText, duration: 0 })
    activeStatusLoadingCloser = closeLoading
    const closeRequestLoading = () => {
        if (!closeLoading) return
        closeLoading()
        if (activeStatusLoadingCloser === closeLoading) activeStatusLoadingCloser = null
        closeLoading = null
    }
    try {
        await request()
        closeRequestLoading()
        const nextCard = await waitForCardStatus(cardId, targetStatus, transitionToken)
        if (transitionToken !== statusTransitionToken || unmounted) return
        if (!nextCard) {
            message(t('card.index.detail.overview.statusProcessing'), 'warning')
            emit('reload')
            return
        }
        if (!updateCard(nextCard, cardId)) return
        emit('reload', { detail: false })
    } catch (error) { showRequestError(error) } finally {
        closeRequestLoading()
        if (transitionToken === statusTransitionToken) {
            pendingAction.value = null
            submitting.value = false
        }
    }
}
const handleTransferUpdate = async (key, cardId) => {
    if (!isSameCard(cardId) || pendingAction.value) return
    const transitionToken = ++statusTransitionToken
    const initialAvailable = props.card.available
    pendingAction.value = { key }
    submitting.value = true
    balanceSyncing.value = true
    try {
        const result = await waitForBalanceChange(cardId, initialAvailable, transitionToken)
        if (transitionToken !== statusTransitionToken || unmounted) return
        if (!result) {
            message(t('card.index.detail.overview.balanceSyncing'), 'warning')
            emit('reload')
            return
        }
        if (!updateCard({ available: result.available }, cardId)) return
        await cardTotalRef.value?.refresh?.()
        emit('reload', { detail: false })
    } finally {
        if (transitionToken === statusTransitionToken) {
            pendingAction.value = null
            submitting.value = false
            balanceSyncing.value = false
        }
    }
}
const handleFrozen = async () => {
    if (submitting.value || actionDisabled('frozen')) return
    const { id } = props.card
    const accountStatus = Number(props.card.account_status)
    const freezing = accountStatus === 0
    const confirmed = await confirm(
        freezing
            ? `<p>${t(props.shared ? 'card.index.detail.overview.sharedFreezeWarning' : 'card.index.detail.overview.freezeWarning')}</p>`
            : `<p>${t('card.index.detail.overview.unfreezeNotice')}</p>`,
        freezing
            ? { title: t('card.index.detail.overview.confirmFreeze'), okText: t('card.index.detail.overview.reconsider'), cancelText: t('card.index.detail.overview.continueFreeze'), resolveCancel: true }
            : { title: t('card.index.detail.overview.confirmUnfreeze'), okText: t('card.index.detail.overview.confirm'), cancelText: t('card.index.detail.overview.cancel') }
    )
    if (freezing ? confirmed : !confirmed) return
    if (!can(freezing ? 'suspend' : 'enable') || !isSameCard(id)) return

    await runStatusTransition({
        cardId: id,
        key: freezing ? 'freeze' : 'unfreeze',
        statusLabel: freezing ? t('card.index.detail.overview.freezeProcessing') : t('card.index.detail.overview.unfreezeProcessing'),
        loadingText: freezing ? t('card.index.detail.overview.submittingFreeze') : t('card.index.detail.overview.submittingUnfreeze'),
        targetStatus: freezing ? 1 : 0,
        request: () => freezing
            ? (props.shared ? cardApi.sharedCardSuspend : cardApi.vccSuspend)({ cardId: id })
            : (props.shared ? cardApi.sharedCardEnable : cardApi.vccEnable)({ cardId: id })
    })
}
const handleWriteOff = async () => {
    if (submitting.value || actionDisabled('writeOff')) return
    const cardId = props.card.id
    const confirmed = await confirm(
        `<div class="list-b-4"><p class="ui-text-error">${t('card.index.detail.overview.closeRisk')}</p><p class="ui-text-primary">${t('card.index.detail.overview.closeNotice')}</p></div>`,
        { title: t('card.index.detail.overview.confirmClose'), okText: t('card.index.detail.overview.reconsider'), cancelText: t('card.index.detail.overview.confirmClosing'), resolveCancel: true }
    )
    if (confirmed) return
    if (!can('destroy') || !isSameCard(cardId)) return
    await runStatusTransition({
        cardId,
        key: 'writeOff',
        statusLabel: t('card.index.detail.overview.closeProcessing'),
        loadingText: t('card.index.detail.overview.submittingClose'),
        targetStatus: 2,
        request: () => (props.shared ? cardApi.sharedCardDestroy : cardApi.vccDestroy)({ cardId })
    })
}
const handleEdit = () => {
    if (!can('update') || !props.card.id) return
    const cardId = props.card.id
    confirmInput(t('card.index.detail.overview.label'), props.card.label || '', { allowEmpty: true }).then(async ({ value, close }) => {
        try {
            if (!can('update') || !isSameCard(cardId)) return
            await (props.shared ? cardApi.sharedCardLabel : cardApi.vccLabel)({ cardId, label: value })
            if (!updateCard({ label: value }, cardId)) {
                close()
                return
            }
            message(t('card.index.detail.overview.editSuccess'))
            close()
        } catch (error) { showRequestError(error) }
    })
}
const clearPrivateInfo = () => {
    privateRequestId += 1
    privateLoading.value = false
    isPrivateVisible.value = false
    privateCardInfo.value = {}
}
const clearClipboard = async () => {
    try {
        if (globalThis.navigator?.clipboard?.writeText) {
            await globalThis.navigator.clipboard.writeText('')
            return true
        }
    } catch {
        // Clipboard API 被拒绝时，继续使用兼容方案。
    }

    return new Promise((resolve) => {
        Copy({
            text: '',
            showTip: false,
            success: () => resolve(true),
            error: () => resolve(false)
        })
    })
}
const handleTogglePrivate = async () => {
    if (!can('private') || !props.card.id || privateLoading.value) return
    if (isPrivateVisible.value) {
        clearPrivateInfo()
        const cleared = await clearClipboard()
        if (!cleared) message(t('card.index.detail.overview.clipboardWarning'), 'warning')
        return
    }
    const cardId = props.card.id
    const requestId = ++privateRequestId
    privateLoading.value = true
    try {
        const result = await (props.shared ? cardApi.sharedCardPrivate : cardApi.vccPrivate)({ cardId })
        if (!can('private') || requestId !== privateRequestId || !isSameCard(cardId)) return
        privateCardInfo.value = result || {}
        isPrivateVisible.value = true
    } catch (error) {
        if (requestId === privateRequestId && isSameCard(cardId)) {
            clearPrivateInfo()
            showRequestError(error)
        }
    } finally {
        if (requestId === privateRequestId) privateLoading.value = false
    }
}
const handleCopyCard = () => {
    if (!can('private') || !isPrivateVisible.value) return
    const { card_no, expire_date, cvv } = privateCardInfo.value
    copy([
        `${t('card.index.detail.overview.cardNumber')}: ${card_no || '--'}`,
        `${t('card.index.detail.overview.expiryDate')}: ${expire_date || '--'}`,
        `CVV：${cvv || '--'}`,
        `${t('card.index.detail.overview.billingAddress')}: ${address.value || '--'}`
    ].join('\n'))
}
const handleRefreshBalance = async () => {
    if (!can('view') || !props.card.id || balanceLoading.value || balanceSyncing.value || pendingAction.value) return
    const cardId = props.card.id
    const requestId = ++balanceRequestId
    balanceLoading.value = true
    try {
        const result = await (props.shared ? cardApi.sharedCardInfo : cardApi.vccBalance)({ cardId })
        if (requestId !== balanceRequestId || !isSameCard(cardId)) return
        updateCard(props.shared ? { sharedWallet: result.sharedWallet } : { available: result.available }, cardId)
        await cardTotalRef.value?.refresh?.()
    } catch (error) { showRequestError(error) } finally {
        if (requestId === balanceRequestId) balanceLoading.value = false
    }
}
const handleGoPhysical = () => toRoute('cardPhysical', { bin: props.card.card_bin, id: props.card.id })
const handleGoActivation = () => toRoute('cardActivation', { id: props.card.id })

onBeforeUnmount(() => {
    unmounted = true
    privateRequestId += 1
    balanceRequestId += 1
    cancelStatusTransition()
    clearPrivateInfo()
})
watch(() => props.card, clearPrivateInfo)
watch(() => can('private'), allowed => { if (!allowed) clearPrivateInfo() }, { flush: 'sync' })
watch(() => props.card.id, (cardId, previousCardId) => {
    if (previousCardId && cardId !== previousCardId) {
        balanceRequestId += 1
        balanceLoading.value = false
        cancelStatusTransition()
    }
})
</script>

<style scoped lang="less">
.edit-tooltip-trigger {
    display: inline-flex;
    :deep(button:disabled) { pointer-events: none; }
}

.card-layout {
    position: relative;
    display: flex;
    padding: var(--ui-space-16);
    background: var(--ui-color-surface);

    &.is-shared {
        .card-type {
            color: #9254de;
            background: color-mix(in srgb, #9254de 12%, var(--ui-color-surface));
        }
        .card-type-icon { background: var(--ui-gradient-purple-blue); }
    }
}
.card-type {
    display: flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    align-self: flex-start;
    box-sizing: border-box;
    min-height: 26px;
    overflow: hidden;
    border-end-start-radius: var(--ui-radius-md);
    color: color-mix(in srgb, var(--ui-color-orange-500) 55%, var(--ui-color-text));
    background: color-mix(in srgb, var(--ui-color-orange-500) 14%, var(--ui-color-surface));
    font-size: 12px;
    font-weight: 600;
    line-height: 20px;
    text-align: center;
    white-space: nowrap;

    &-icon {
        display: flex;
        flex-shrink: 0;
        width: 26px;
        align-self: stretch;
        align-items: center;
        justify-content: center;
        color: var(--ui-color-text-inverse);
        background: var(--ui-gradient-warning-wide);
    }
    &-name {
        flex-shrink: 0;
        padding: 3px 10px;
    }
}
.card-left {
    display: flex;
    flex-direction: column;
    flex-shrink: 0;
    width: var(--ui-size-397);
    margin-right: 20px;
}
.card-preview {
    position: relative;
    flex-shrink: 0;
    width: var(--ui-size-397);
    height: var(--ui-size-249);
    border-radius: var(--ui-radius-xl);
    background: #f5f6f8;
    overflow: hidden;
}
.card-status-floating {
    position: absolute;
    top: 10px;
    right: 10px;
    z-index: 2;
    display: block;

    :deep(.is-processing::before) {
        animation: status-pill-pulse 1.2s ease-in-out infinite;
    }

    @media (prefers-reduced-motion: reduce) {
        :deep(.is-processing::before) {
            animation: none;
        }
    }
}
@keyframes status-pill-pulse {
    0%, 100% { opacity: .55; transform: scale(.85); }
    50% { opacity: 1; transform: scale(1.15); }
}
.card-right {
    display: flex;
    flex: 1;
    flex-direction: column;
    min-width: 1px;
}
.card-tools {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;

    &-actions,
    &-meta,
    .physical-actions {
        display: flex;
        align-items: center;
        gap: 8px;
    }
    &-actions { flex: 1; flex-wrap: wrap; min-width: 0; }
    &-meta {
        position: relative;
        top: calc(-1 * var(--ui-space-16));
        inset-inline-end: calc(-1 * var(--ui-space-16));
        align-self: flex-start;
        flex-shrink: 0;
        gap: 24px;
        margin-inline-start: auto;
    }
    .tool-btn--secondary {
        min-height: 34px;
        padding: var(--ui-padding-0-14);
        border-color: transparent;
        border-radius: var(--ui-radius-6);
        color: var(--ui-color-neutral-800);
        background: #f7f8fa;
        box-shadow: none;
        transition: color .18s ease, background-color .18s ease, transform .18s ease;

        &:hover,
        &:focus-visible {
            border-color: transparent;
            color: var(--primary-color);
            background: #f0f4ff;
        }
        &:active { transform: scale(.98); }
        :deep(.ivu-icon) {
            display: inline-flex;
            width: var(--ui-size-16);
            align-items: center;
            justify-content: center;
            color: var(--primary-color);
            font-size: 16px;
            line-height: 1;
            vertical-align: -2px;
        }
    }
}
.card-loading {
    position: absolute;
    inset: 0;
    z-index: 950;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(255, 255, 255, .9);
    pointer-events: auto;
}
.card-action {
    .action-tooltip {
        width: 94px;
        min-width: 0;

        :deep(.ivu-tooltip-rel) { display: block; height: 100%; }
        .btn { width: 100%; }
    }

    display: flex;
    flex: 1;
    align-items: stretch;
    justify-content: space-between;
    margin-top: 10px;

    &.is-shared {
        gap: 10px;

        .action-tooltip { flex: 1; width: auto; }

        .btn {
            flex: 1;
            min-width: 0;
            width: auto;
        }
    }

    .btn {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        box-sizing: border-box;
        width: 94px;
        height: 74px;
        min-height: 74px;
        padding: var(--ui-padding-6-8);
        border: var(--ui-border-transparent);
        border-radius: var(--ui-radius-md);
        cursor: pointer;
        user-select: none;
        transition: opacity .3s;

        &:hover { opacity: .8; }
        &.btn-into { color: var(--ui-color-text-inverse); border-color: var(--primary-color); background: var(--primary-color); }
        &.btn-out { border-color: #fff1e6; }
        &.btn-freeze { border-color: #fff2db; }
        &.btn-write-off { border-color: #fdefef; }
        &.disabled { opacity: .2; cursor: not-allowed; }
        .text {
            width: 100%;
            overflow: hidden;
            margin-top: 5px;
            line-height: 24px;
            text-align: center;
            text-overflow: ellipsis;
            white-space: nowrap;
        }
    }
}
.card-summary-panel {
    display: flex;
    flex: 1;
    flex-direction: column;
    margin-top: 10px;
    overflow: hidden;
    border-radius: var(--ui-radius-6);
    background: #fafafa;

    :deep(.card-account-box) { flex-shrink: 0; border: 0; border-radius: 0; }
}
.cardholder-info {
    flex: 1;
    margin: var(--ui-margin-0-6-6);
    padding: var(--ui-padding-10-12);
    border-radius: var(--ui-radius-sm);
    background: #fff;

    &-grid { display: flex; flex-direction: column; gap: 8px; }
    .info-row { display: grid; column-gap: 24px; row-gap: 8px; }
    .info-row--primary { grid-template-columns: minmax(150px, .9fr) minmax(120px, .7fr) minmax(220px, 1.4fr); }
    .info-row--secondary { grid-template-columns: repeat(2, minmax(0, 1fr)); }
    .info-row--address { grid-template-columns: 1fr; }
    .info-item { min-width: 0; }
    .info-label { margin-bottom: 3px; color: var(--ui-color-text-muted); font-size: 12px; line-height: 18px; }
    .info-value { display: flex; align-items: center; gap: 8px; min-width: 0; min-height: 24px; color: var(--ui-color-text); font-size: 13px; line-height: 20px; }
    .info-value--scene, .info-value--address { align-items: flex-start; }
    .info-text { min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .info-value--address .info-text { overflow: visible; text-overflow: clip; white-space: normal; overflow-wrap: anywhere; }
    .info-action:disabled { color: var(--ui-color-text-muted); cursor: not-allowed; }
    .info-action { flex-shrink: 0; padding: 0; border: 0; color: var(--primary-color); font: inherit; line-height: 20px; background: transparent; cursor: pointer; }
    .info-action:not(:disabled):hover, .info-action:not(:disabled):focus-visible { color: var(--ui-color-primary); text-decoration: underline; outline: none; }
}
.physical-btn {
    border: 0;
    color: var(--ui-color-text-inverse);
    background: var(--ui-gradient-warning-wide);
}
.physical-btn:hover { color: var(--ui-color-text-inverse); opacity: .8; }

@media (max-width: 768px) {
    .card-layout {
        flex-direction: column;
        padding: 40px 8px calc(100px + env(safe-area-inset-bottom));
    }
    .card-type {
        position: absolute;
        top: 0;
        inset-inline-end: 0;
        max-width: 100%;
        margin: 0;
    }
    .card-tools-meta {
        position: static;
        top: auto;
        inset-inline-end: auto;
    }
    .card-left { flex: none; width: 100%; margin-right: 0; }
    .card-preview { width: 100%; height: auto; aspect-ratio: 397 / 249; }
    .card-preview :deep(.debit-card) { width: 100%; height: 100%; }
    .card-action {
        position: fixed;
        right: auto;
        bottom: calc(10px + env(safe-area-inset-bottom) + var(--keyboard-offset, 0px));
        left: 50%;
        z-index: 900;
        flex: none;
        width: min(calc(100% - 24px), 480px);
        gap: 4px;
        box-sizing: border-box;
        margin: 0;
        padding: var(--ui-padding-6);
        transform: translateX(-50%);
        overflow: hidden;
        border: var(--ui-border-on-dark-muted);
        border-radius: var(--ui-radius-14);
        background: linear-gradient(
            135deg,
            rgba(255, 255, 255, .76) 0%,
            rgba(238, 244, 255, .58) 52%,
            rgba(255, 255, 255, .66) 100%
        );
        box-shadow: var(--ui-shadow-card-visual);
        -webkit-backdrop-filter: blur(9px) saturate(165%);
        backdrop-filter: blur(9px) saturate(165%);
        touch-action: manipulation;
        transition: opacity .18s ease, transform .18s ease, visibility .18s ease;

        &.is-keyboard-open {
            transform: translate(-50%, calc(100% + 24px));
            visibility: hidden;
            opacity: 0;
            pointer-events: none;
        }

        &::before {
            position: absolute;
            inset: 0;
            border-radius: inherit;
            background:
                radial-gradient(circle at 18% 0, rgba(255, 255, 255, .72), transparent 34%),
                linear-gradient(180deg, rgba(255, 255, 255, .24), transparent 54%);
            content: '';
            pointer-events: none;
        }

        .action-tooltip { flex: 1; width: auto; }

        .btn {
            position: relative;
            z-index: 1;
            flex: 1;
            width: auto;
            height: var(--ui-size-56);
            min-width: 0;
            min-height: 56px;
            padding: 4px 2px;
            border: 0;
            border-radius: var(--ui-radius-xl);
            color: var(--ui-color-text);
            background: transparent;
            transition: color .18s ease, background-color .18s ease, opacity .18s ease, transform .18s ease;

            &.btn-into { color: var(--primary-color); background: transparent; }
            &.btn-out { color: var(--ui-color-warning); background: transparent; }
            &.btn-freeze { color: #e99a00; background: transparent; }
            &.btn-write-off { color: var(--ui-color-error-strong); background: transparent; }
            &:active:not(.disabled) {
                transform: scale(.96);
                background: #f7f8fa;
            }
            &.disabled { opacity: .38; }
            :deep(.ivu-icon) {
                display: inline-flex;
                width: var(--ui-size-32);
                height: var(--ui-size-32);
                align-items: center;
                justify-content: center;
                border-radius: var(--ui-radius-circle);
                background: #eaf0ff;
            }
            &:nth-child(2) :deep(.ivu-icon) { background: #fff0e6; }
            &:nth-child(3) :deep(.ivu-icon) { background: #fff5d9; }
            &:nth-child(4) :deep(.ivu-icon) { background: #ffebeb; }
            .text { margin-top: 2px; font-size: 12px; font-weight: 500; line-height: 20px; }
        }
    }
    .card-right { width: 100%; margin-top: 8px; }
    .card-tools {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(88px, 1fr));
        align-items: center;
        gap: 6px;
        padding: 0 2px;
        background: transparent;

        &-actions,
        .physical-actions { display: contents; }
        &-meta {
            grid-column: 1 / -1;
            flex-wrap: wrap;
            justify-content: flex-end;
            min-width: 0;
            margin-inline-start: 0;

            .tool-btn { width: auto; }
            &:not(:has(.tool-btn)) { display: contents; }
        }
        .tool-btn {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            width: 100%;
            min-width: 0;
            min-height: 44px;
            margin: 0;
            padding: var(--ui-padding-0-6);
            border-radius: var(--ui-radius-md);
            font-size: 12px;
            box-shadow: none;
            white-space: normal;

            :deep(span) {
                min-width: 0;
                line-height: 18px;
                overflow-wrap: anywhere;
                white-space: normal;
            }

            :deep(.ivu-icon) {
                flex-shrink: 0;
            }
        }
        .tool-btn {
            border-color: transparent;
            color: var(--ui-color-neutral-800);
            background: #f7f8fa;

            :deep(.ivu-icon) { color: var(--primary-color); }
        }
        .tool-btn--secondary {
            border-radius: var(--ui-radius-lg);
            font-weight: 400;

            &:hover,
            &:focus-visible { background: #f0f4ff; }
            &:active { transform: scale(.97); }
            :deep(.ivu-icon) {
                margin-right: 4px;
                font-size: 16px;
            }
        }
    }
    .cardholder-info { margin: var(--ui-margin-0-6-6); padding: var(--ui-padding-10-12); }
    .cardholder-info-grid { gap: 10px; }
    .cardholder-info .info-row--primary,
    .cardholder-info .info-row--secondary { grid-template-columns: 1fr; gap: 10px; }
}

@media (prefers-reduced-motion: reduce) {
    .card-action .btn,
    .card-tools .tool-btn--secondary { transition: none; }
}

@media (max-width: 768px) and (prefers-reduced-transparency: reduce) {
    .card-action {
        background: #fff;
        -webkit-backdrop-filter: none;
        backdrop-filter: none;
    }
}
</style>
