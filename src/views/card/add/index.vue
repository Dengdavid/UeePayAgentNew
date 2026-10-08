<template>
  <UiPage v-if="canCreate" :fallback="{ name: cradType === 'share' ? 'sharedCard' : 'card' }" isBack :pageRightStyle="pageRightStyle" :page-right-title="$t('card.index.sceneMatchingTool')">
    <div class="add-main list-b-16" :inert="restoringDraft" :aria-busy="restoringDraft">
        <UiCell v-if="cardTypes.length > 1" :title="$t('card.index.opening.page.selectCardType')">
          <div class="card-type">
            <dl class="card-type-item" :class="{ active: cradType == item.value }" v-for="item in cardTypes" :key="item.value" role="button" tabindex="0" :aria-pressed="cradType === item.value" @click="cradType = item.value" @keydown.enter="cradType = item.value" @keydown.space.prevent="cradType = item.value">
              <dt class="iconfont" :class="item.icon" aria-hidden="true"></dt>
              <dd>
                <h3>{{ item.label }}</h3>
                <p>{{ t(item.dose) }}</p>
              </dd>
            </dl>
          </div>
        </UiCell>
        <UiCell  :title="$t('card.index.opening.page.selectBin')">
          <div class="list-b-16">
            <div class="card-tags">
              <Select size="large" v-model="filterForm.network" clearable :placeholder="$t('card.index.opening.page.cardNetwork')">
                <Option v-for="item in cardNetworks" :key="item" :value="item"></Option>
              </Select>
              <Select size="large" v-model="filterForm.country" clearable :placeholder="$t('card.index.opening.binInfo.issuerCountry')">
                <Option v-for="item in countries" :value="item" :key="item"></Option>
              </Select>
              <Select size="large" v-model="filterForm.avs" clearable :placeholder="$t('card.index.opening.page.avsFilter')">
                <Option value="1">{{ $t('card.index.opening.page.avsSupported') }}</Option>
                <Option value="0">{{ $t('card.index.opening.page.avsUnsupported') }}</Option>
              </Select>
              <Select size="large" v-model="filterForm.ds3" clearable :placeholder="$t('card.index.opening.page.threeDsFilter')">
                <Option value="1">{{ $t('card.index.opening.page.threeDsSupported') }}</Option>
                <Option value="0">{{ $t('card.index.opening.page.threeDsUnsupported') }}</Option>
              </Select>
            </div>
            <div v-if="binsLoading" class="card-tags card-tags-2" role="status" aria-busy="true" :aria-label="$t('remoteSelect.loading')">
              <div v-for="index in binsPlaceholderCount" :key="index" class="bin-skeleton" aria-hidden="true">
                <span class="bin-skeleton-radio"></span>
                <div class="bin-skeleton-content">
                  <span class="bin-skeleton-title"></span>
                  <span class="bin-skeleton-description"></span>
                </div>
              </div>
            </div>
            <div v-else-if="!showBins.length" class="bins-empty" role="status">
              <div class="bins-empty-art" aria-hidden="true">
                <div class="bins-empty-card"><i class="iconfont icon-sim"></i><span></span></div>
              </div>
              <div class="bins-empty-copy">
                <h3>{{ $t('card.index.opening.page.binsEmpty') }}</h3>
                <p>{{ $t('card.index.opening.page.binsEmptyHelp') }}</p>
              </div>
            </div>
            <div v-else class="card-tags card-tags-2">
              <CardTag v-for="item in showBins" :key="item.id" :item="item" :checked="item.id === form.binId"
                @on-click="form.binId = item.id">
              </CardTag>
            </div>
            <Divider v-if="useBins.length > binLeight"><a class="expand-btn" @click="isExpandBin = !isExpandBin">{{
              isExpandBin ? $t('card.index.opening.page.collapseBins') : $t('card.index.opening.page.expandBins', { count: collapsedBinCount })
                }}</a></Divider>
            <CardBinInfo v-if="selectBin.id" :bin="selectBin" class="card-bin-section" />
          </div>
        </UiCell>
        <Form v-if="selectBin.id" ref="formRef" :model="form" :rules="rules" autocomplete="off">
          <div class="required-info-section">
            <div class="required-info-title ui-flex ui-flex-align-center ui-flex-justify-between">
              <div class="ui-flex ui-flex-align-center">
                <h3>{{ $t('card.index.opening.page.requiredInformation') }}</h3>
              </div>
            </div>
            <AuthStatusCard :status="user.auth_status" @action="goAuth" />
            <CardApplicantForm
              v-model="form"
              :bin="selectBin"
              :user-email="user.email"
            />
          </div>
        </Form>
       <CardFeeSection
            class="fee-section"
            v-model:number="form.number"
            v-model:amount="form.amount"
            :bin="selectBin"
            :balance="cardStats.money"
            :max-num="maxNum"
            :cradType="cradType"
            :recharge-limit="rechargeLimit"
            :used-capacity="user.used_capacity"
            :free-cards-nums="user.free_cards_nums"
            @expense-change="c_expenseDetails = $event"
          >
            <template #default>
              <UiCell :title="$t('card.index.sharedManagement.title')" v-if="selectBin.id && cradType === 'share'">
                <template #btn>
                  <template v-if="hasPermission('shared_wallet.view')">
                    <Tooltip v-if="hasPermission('shared_wallet.create')" :disabled="!walletLimitReached" :content="$t('card.index.sharedForm.walletLimitReached')" transfer>
                      <span>
                        <Button class="shared-wallet-link" type="text" size="small" :loading="walletQuotaLoading" :disabled="submiting || walletCreationDisabled" @click="openWalletPage('cardSharedWalletAdd')">{{ $t('card.index.sharedOverview.createWallet') }}</Button>
                      </span>
                    </Tooltip>
                    <Divider v-if="hasPermission('shared_wallet.create')" type="vertical" style="margin: 0" />
                    <Button class="shared-wallet-link" type="text" size="small" :disabled="submiting" @click="openWalletPage('cardSharedWallets')">{{ $t('card.index.sharedOverview.manageWallet') }}</Button>
                  </template>
                </template>
                <FormRemoteSelect
                  ref="sharedWalletSelectRef"
                  class="shared-wallet-select"
                  v-model="sharedWalletId"
                  apiUrl="/vcc/SharedWallet/dataList"
                  :page-size="20"
                  :params="{ status: 0 }"
                  :selected-options="sharedWalletOptions"
                  :multiple="false"
                  :active="cradType === 'share'"
                  :disabled="submiting || sharedWalletLoading"
                  @options-loaded="handleSharedWalletOptions"
                >
                  <template #default="{ row }">
                    <div class="shared-wallet-option">
                      <div class="shared-wallet-option-heading">
                        <span>{{ row.name }}</span>
                        <span>{{ $t('card.index.sharedManagement.available') }} {{ formatSharedWalletAmount(row.amount, row.currency) }}</span>
                      </div>
                    </div>
                  </template>
                </FormRemoteSelect>
                <section v-if="selectedSharedWallet" class="shared-wallet-summary">
                  <header>
                    <span class="shared-wallet-symbol" aria-hidden="true"><i class="iconfont icon-CRMEB-zichan-mianxing"></i></span>
                    <div class="shared-wallet-identity">
                      <div class="shared-wallet-heading">
                        <h3 :title="selectedSharedWallet.name">{{ selectedSharedWallet.name || '—' }}</h3>
                      </div>
                      <p v-if="selectedSharedWallet.remark" class="shared-wallet-remark" :title="selectedSharedWallet.remark">{{ selectedSharedWallet.remark }}</p>
                    </div>
                  </header>
                  <dl class="shared-wallet-card-count">
                    <dt>{{ $t('card.index.sharedManagement.cardCount') }}</dt>
                    <dd>{{ selectedSharedWallet.card_count ?? '—' }} <span v-if="selectedSharedWallet.card_count != null">{{ $t('card.index.opening.feeInfo.cardUnit') }}</span></dd>
                  </dl>
                  <dl class="shared-wallet-balance">
                    <dt>{{ $t('card.index.sharedManagement.available') }}</dt>
                    <dd>{{ formatSharedWalletAmount(selectedSharedWallet.amount, selectedSharedWallet.currency) }}</dd>
                  </dl>
                </section>
              </UiCell>
            </template>
            <template #status>
              <UiNotice
                v-if="displayError"
                class="order-submit-error"
                role="alert"
                aria-live="polite"
                showIcon
              >
                <span>{{ displayError }}</span>
                <Button v-if="cardStatsFailed" type="text" @click="loadCardStats">{{ $t('remoteSelect.retry') }}</Button>
                <span
                  v-if="isBalanceInsufficient"
                  class="link"
                  @click="toRoute('ucenter_deposit')"
                >{{ $t('header.rechargeNow') }}</span>
                <span
                  v-else-if="user.auth_status !== 1"
                  class="link"
                  @click="toRoute('certify')"
                >{{ $t('certify.authNow') }}</span>
              </UiNotice>
            </template>
            <template #actions>
              <div class="fee-submit-area">
                <Button
                  type="primary"
                  size="large"
                  :disabled="isFormDisabled"
                  :loading="submiting"
                  class="fee-submit-button"
                  @click="handleSubmitValid"
                >
                  <span
                    class="fee-submit-label"
                    :title="submiting ? $t('card.index.opening.page.submitting') : $t('card.index.opening.page.submit')"
                  >
                    {{ submiting ? $t('card.index.opening.page.submitting') : $t('card.index.opening.page.submit') }}
                  </span>
                  <Icon v-if="!submiting" type="ios-arrow-forward" />
                </Button>
              </div>
            </template>
          </CardFeeSection>
        <CardFailureTips class="failure-section" />
    </div>
    <template #pageRight>
      <div class="recom-wrap" :inert="restoringDraft">
        <RecomWrap :key="cradType" ref="recomRef" :shared="cradType === 'share'" :bins="useBins" :selectBin="selectBin" @on-bin="handleCheckSearch"/>
      </div>
    </template>
    <ChannelSourceModal v-model="displayChannelModal" @success="handleChannelSourceSuccess" />
  </UiPage>
</template>

<script>
// 仅在钱包操作往返期间通过内存保留本页草稿。
let walletReturnDraft = null
let disposeWalletDraft = null
const clearWalletDraft = () => {
  walletReturnDraft = null
  disposeWalletDraft?.()
  disposeWalletDraft = null
}
</script>

<script setup>
import { cardApi, userApi } from '@/api'
import FormRemoteSelect from '@/components/form/FormRemoteSelect/index.vue'
import RecomWrap from './components/RecomWrap.vue'
import CardBinInfo from './components/CardBinInfo.vue'
import ChannelSourceModal from './components/ChannelSourceModal.vue'
import AuthStatusCard from './components/AuthStatusCard.vue'
import CardFeeSection from './components/CardFeeSection.vue'
import CardApplicantForm from './components/CardApplicantForm.vue'
import CardFailureTips from './components/CardFailureTips.vue'
import CardTag from './components/card-tag.vue'
import { cardNetworks } from '@/config/data.js'
import Decimal from 'decimal.js'
import { useUserStore } from '@/store/user.js'
import { storeToRefs } from 'pinia'
import { confirm, message, showRequestError } from '@/utils/message.js'
import { t } from '@/utils'
import { computed, effectScope, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { toRoute, useRoute } from '@/utils/route.js'
import { hasCardPermission, hasPermission } from '@/utils/permission'
const router = useRouter()
const route = useRoute()

// 右侧场景推荐栏保持固定宽度，移动端由 UiPage 自动切换布局。
const pageRightStyle = ref({
  width: '390px',
})
const restoringDraft = ref(false)
const recomRef = ref(null)
const restoredSharedWalletId = ref(null)
let alive = true
let restoreScrollTimer = null
const sharedWalletId = ref('')
const sharedWalletOptions = ref([])
const sharedWalletLoading = ref(false)
const sharedWalletSelectRef = ref(null)
const handleSharedWalletOptions = ({ options, hasMore, query }) => {
  if (query || hasMore || options.length !== 1 || options[0].disabled || String(options[0].status) !== '0') return
  if (submiting.value || sharedWalletLoading.value || cradType.value !== 'share') return
  if (sharedWalletId.value === '') sharedWalletId.value = options[0].id
}
const selectedSharedWallet = computed(() => sharedWalletSelectRef.value?.getSelectedOptions().find(wallet => wallet.id === sharedWalletId.value) || null)
const formatSharedWalletAmount = (value, currency) => {
  if (value == null || value === '') return '—'
  try {
    const amount = new Decimal(value)
    if (!amount.isFinite()) return '—'
    const formatted = amount.toFixed(2)
    return currency === 'USD' ? formatted.startsWith('-') ? `-$${formatted.slice(1)}` : `$${formatted}` : `${formatted} ${currency || ''}`.trim()
  } catch {
    return '—'
  }
}
//卡片类型
const cradType = computed({
  get: () => route.query.type || cardTypes.value[0]?.value || 'prepaid',
  set: value => {
    if (!submiting.value && !restoringDraft.value && value !== cradType.value) toRoute('cardAdd', { type: value }, 'query', { replace: true })
  },
})
const cardTypes=computed(() => [
  {
    label:t('card.index.regularCard'),
    value:'prepaid',
    icon:'icon-yinhangka-m',
    dose:'card.index.opening.page.prepaidDescription',
  },
  {
    label:t('card.index.sharedCard'),
    value:'share',
    icon:'icon-feiyong',
    dose:'card.index.opening.page.sharedDescription',
  },
].filter(item => hasCardPermission('create', item.value === 'share')))
const canCreate = computed(() => cardTypes.value.some(item => item.value === cradType.value))
watch(canCreate, allowed => {
  if (route.name === 'cardAdd' && !allowed) toRoute('error_403', {}, 'query', { replace: true })
}, { immediate: true, flush: 'sync' })
// 当前类型的卡段仅用于本页，不覆盖全局卡段映射。
const bins = ref([])
const binsLoading = ref(false)
const binsPlaceholderCount = ref(6)
let binsRequestId = 0
const userStore = useUserStore()
const { user } = storeToRefs(userStore)
const walletCount = ref(null)
const walletQuotaLoading = ref(false)
const walletLimitReached = computed(() => {
  const limit = String(user.value?.shared_wallet_limit)
  return !walletQuotaLoading.value && /^\d+$/.test(limit) && walletCount.value != null && new Decimal(walletCount.value).gte(limit)
})
const walletCreationDisabled = computed(() => {
  if (walletQuotaLoading.value) return true
  const limit = String(user.value?.shared_wallet_limit)
  if (limit === '-1') return false
  if (!/^\d+$/.test(limit) || walletCount.value == null) return true
  return new Decimal(walletCount.value).gte(limit)
})
watch(
  [cradType, canCreate, () => hasPermission('shared_wallet.view') && hasPermission('shared_wallet.create')],
  async ([type, allowed, canCreateWallet], _, onCleanup) => {
    const controller = new AbortController()
    onCleanup(() => controller.abort())
    walletCount.value = null
    walletQuotaLoading.value = false
    if (type !== 'share' || !allowed || !canCreateWallet) return
    walletQuotaLoading.value = true
    try {
      const statistics = await cardApi.getSharedWalletStatistics({ signal: controller.signal })
      if (!controller.signal.aborted && /^\d+$/.test(String(statistics?.wallet_count))) walletCount.value = statistics.wallet_count
    } catch (error) { showRequestError(error) } finally {
      if (!controller.signal.aborted) walletQuotaLoading.value = false
    }
  },
  { immediate: true, flush: 'sync' },
)
// 首次开卡且用户未登记来源渠道时显示。
const displayChannelModal = ref(false)
// CardFeeSection 回传的前端费用预览，仅用于展示和提交前余额提示。
const c_expenseDetails = ref({})

// 提交状态和服务端返回的业务错误。
const submiting = ref(false)
const errTip = ref('')

// 卡段筛选条件，值类型与接口字段可能为 string/number，筛选时兼容比较。
const filterForm = ref({
  network: '',
  country: '',
  ds3: '',
  avs: '',
})
const cardStats = ref({})
const cardStatsReady = ref(false)
const cardStatsFailed = ref(false)
let statsRequestId = 0

// 开卡申请表单及 View UI Plus 校验引用。
const formRef = ref()
const form = ref({
  binId: null,
  cardholderId: null, // 新增
  number: 1,
  amount: null,
  firstName: '',
  lastName: '',
  phoneCode: '86',
  phone: null,
  email: user.value.email ?? '',
  physical: 0,
})

const rules = computed(() => ({
  binId: {
    required: true,
    message: t('card.index.opening.page.selectBinRequired'),
    trigger: 'blur',
  },
  firstName: {
    required: true,
    message: t('card.index.opening.page.firstNameRequired'),
    trigger: 'blur',
  },
  lastName: {
    required: true,
    message: t('card.index.opening.page.lastNameRequired'),
    trigger: 'blur',
  },
  phone: {
    required: true,
    message: t('card.index.opening.page.phoneRequired'),
    trigger: 'blur',
  },
  email: {
    type: 'email',
    required: true,
    message: t('card.index.opening.page.emailInvalid'),
    trigger: 'blur',
  },
  number: {
    required: true,
    type: 'number',
    message: t('card.index.opening.page.cardQuantityRequired'),
    trigger: 'blur',
  },
  amount: {
    required: cradType.value === 'prepaid',
    type: 'number',
    message: t('card.index.opening.page.transferAmountRequired'),
    trigger: 'blur',
  },
}))

// 使用 Decimal 比较资金，避免原生浮点数和非法字符串导致余额判断失真。
const balanceState = computed(() => {
  if (cradType.value === 'share') {
    const available = selectedSharedWallet.value?.amount
    const expenses = c_expenseDetails.value.totalExpenses
    if (sharedWalletLoading.value || available == null || expenses == null) {
      return { valid: false, insufficient: false }
    }
    try {
      const balance = new Decimal(available)
      const totalExpenses = new Decimal(expenses)
      if (!balance.isFinite() || !totalExpenses.isFinite() || totalExpenses.isNegative()) {
        return { valid: false, insufficient: false }
      }
      return { valid: true, insufficient: balance.lt(totalExpenses) }
    } catch {
      return { valid: false, insufficient: false }
    }
  }
  if (!cardStatsReady.value || cardStats.value.money == null) {
    return { valid: false, insufficient: false }
  }
  try {
    const balance = new Decimal(cardStats.value.money ?? 0)
    const totalExpenses = new Decimal(c_expenseDetails.value.totalExpenses ?? 0)
    return {
      valid: true,
      insufficient: balance.lt(totalExpenses),
    }
  } catch {
    return {
      valid: false,
      insufficient: false,
    }
  }
})

// 是否展开全部可用卡段。
const isExpandBin = ref(false)

// 按顶部筛选条件得到基础卡段集合。
const useBins = computed(() => {
  const { network, avs, country, ds3 } = filterForm.value
  return bins.value.filter((item) => {
    if (network && item.network != network) return false
    if (country && item.country != country) return false
    if (avs && item.avs != avs) return false
    if (ds3 && item['3ds'] != ds3) return false
    return true
  })
})
const binLeight = 2 * 5

// 当前筛选结果中默认两行以外、处于折叠状态的卡段数量。
const collapsedBinCount = computed(() => Math.max(useBins.value.length - binLeight, 0))

// 默认只展示两行卡段，用户可手动展开。
const showBins = computed(() => {
  const arr=useBins.value
  if (arr.length === 0) return []
  if (!isExpandBin.value) return arr.slice(0, binLeight)
  return arr
})

// 从完整卡段列表生成去重后的发卡国家选项。
const countries = computed(() => {
  return [...new Set(bins.value.map((item) => item.country).filter(Boolean))]
})

// 当前选择的卡段必须仍存在于基础筛选结果中。
const selectBin = computed(() => {
  return useBins.value.find((item) => item.id === form.value.binId) || {}
})

// 用户剩余可开卡数量；负数表示不设上限。
const maxNum = computed(() => {
  const capacity = Number(cardStats.value.available_capacity)
  if (!Number.isFinite(capacity)) return 0
  return capacity < 0 ? Infinity : capacity
})

// 当前卡段首充金额上下限，最高为 0 时沿用“不设上限”的业务约定。
const rechargeLimit = computed(() => {
  if (!selectBin.value.id) return { max: Infinity, min: 0 }
  const { create_max_amount, create_min_amount } = selectBin.value
  const max = Number(create_max_amount)
  const min = Number(create_min_amount)
  return {
    max: max === 0 || !Number.isFinite(max) ? Infinity : max,
    min: min === 0 || !Number.isFinite(min) ? 0 : min,
  }
})

// 结合用户容量、卡段剩余数量和单次上限计算本次最多开卡数量。
const allowedCardCount = computed(() => Math.min(
  maxNum.value,
  selectBin.value.allow_create_count >= 0
    ? Number(selectBin.value.allow_create_count)
    : Infinity,
  100,
))

// 使用 Decimal 校验转入金额区间，并识别服务端上下限配置异常。
const rechargeAmountState = computed(() => {
  try {
    const min = new Decimal(rechargeLimit.value.min)
    const max = rechargeLimit.value.max === Infinity
      ? null
      : new Decimal(rechargeLimit.value.max)
    if (max && max.lt(min)) return { valid: false, withinLimit: false }
    const amount = new Decimal(form.value.amount ?? 0)
    return {
      valid: true,
      withinLimit: amount.gte(min) && (!max || amount.lte(max)),
    }
  } catch {
    return { valid: false, withinLimit: false }
  }
})

// 纯计算当前表单的首个阻断原因，不在 computed 内修改其他响应式状态。
const formError = computed(() => {
  const _form = form.value
  if (user.value.auth_status !== 1) return t('card.index.opening.page.verificationRequired')
  if (!cardStatsReady.value) return t(cardStatsFailed.value ? 'uiCommon.loadFailed' : 'remoteSelect.loading')
  if (!_form.binId || !selectBin.value.id) return t('card.index.opening.page.selectBinRequired')
  if (!_form.firstName) return t('card.index.opening.page.firstNameEmpty')
  if (!_form.lastName) return t('card.index.opening.page.lastNameEmpty')
  if (!_form.phone) return t('card.index.opening.page.phoneEmpty')
  if (!_form.email) return t('card.index.opening.page.emailEmpty')
  if (!_form.number || _form.number <= 0) return t('card.index.opening.page.cardQuantityEmpty')
  if (cradType.value === 'share' && !sharedWalletId.value) return t('ucenterAccount.sharedWalletBatch.select')
  if (cradType.value === 'prepaid' && (!_form.amount || _form.amount <= 0)) return t('card.index.opening.page.transferAmountEmpty')
  if (!balanceState.value.valid) return cradType.value === 'share'
    ? t('card.index.opening.page.sharedWalletBalanceUnavailable') || t('card.index.opening.page.balanceUnavailable')
    : t('card.index.opening.page.balanceUnavailable')
  if (_form.number > allowedCardCount.value) return t('card.index.opening.page.quantityExceedsLimit')
  if (cradType.value === 'prepaid' && !rechargeAmountState.value.valid) return t('card.index.opening.page.transferConfigInvalid')
  if (cradType.value === 'prepaid' && !rechargeAmountState.value.withinLimit) return t('card.index.opening.page.transferOutsideLimit')
  if (balanceState.value.insufficient) return cradType.value === 'share'
    ? t('card.index.opening.page.sharedWalletInsufficientBalance') || t('card.index.opening.page.insufficientBalance')
    : t('card.index.opening.page.insufficientBalance')
  return ''
})

// 表单阻断原因优先展示，表单有效时再展示最近一次服务端错误。
const displayError = computed(() => formError.value || errTip.value)
const isBalanceInsufficient = computed(() => cradType.value !== 'share' && balanceState.value.insufficient && formError.value === t('card.index.opening.page.insufficientBalance'))
// 提交中必须保持禁用，防止重复创建卡片。
const isFormDisabled = computed(() => !canCreate.value || submiting.value || !balanceState.value.valid || balanceState.value.insufficient || Boolean(formError.value))


// 只在钱包操作往返草稿中保留当前联系字段。
const holderFields = ['firstName', 'lastName', 'phoneCode', 'phone', 'email']

// 钱包入口只保存本页输入，不缓存接口响应、余额或费用。
const openWalletPage = async (name) => {
  if (submiting.value || restoringDraft.value || !hasPermission('shared_wallet.view')) return
  if (name === 'cardSharedWalletAdd' && (!hasPermission('shared_wallet.create') || walletCreationDisabled.value)) return
  clearWalletDraft()
  walletReturnDraft = {
    userId: user.value.id,
    form: Object.fromEntries([...holderFields, 'binId', 'cardholderId', 'number', 'amount', 'physical'].map(field => [field, form.value[field]])),
    filters: { ...filterForm.value },
    expanded: isExpandBin.value,
    walletId: sharedWalletId.value,
    scene: recomRef.value?.getSelection(),
    scrollTop: window.scrollY,
  }
  // 脱离当前组件生命周期，返回消费或离开钱包流程时统一停止监听。
  const scope = effectScope(true)
  scope.run(() => watch(() => userStore.user?.id, () => clearWalletDraft(), { flush: 'sync' }))
  const removeRouteHook = router.afterEach((to, from, failure) => {
    if (!failure && !(to.name === 'cardAdd' && to.query.type === 'share') && !['cardSharedWallets', 'cardSharedWalletAdd', 'cardSharedWalletDetail', 'cardSharedWalletEdit'].includes(to.name)) clearWalletDraft()
  })
  disposeWalletDraft = () => { scope.stop(); removeRouteHook() }
  try {
    const failure = await toRoute(name)
    if (failure) clearWalletDraft()
  } catch {
    clearWalletDraft()
  }
}

// 切换类型后清空旧卡段和筛选，只接收最新请求的结果。
const loadBins = async () => {
  const requestId = ++binsRequestId
  binsPlaceholderCount.value = showBins.value.length || binsPlaceholderCount.value
  bins.value = []
  form.value.binId = null
  filterForm.value = { network: '', country: '', ds3: '', avs: '' }
  isExpandBin.value = false
  if (!canCreate.value) {
    binsLoading.value = false
    return
  }
  binsLoading.value = true
  try {
    const result = await (cradType.value === 'share' ? cardApi.sharedCardBins() : cardApi.getBinList())
    if (!alive || requestId !== binsRequestId || !canCreate.value) return
    bins.value = Array.isArray(result) ? result : []
    return true
  } catch (error) { showRequestError(error) } finally {
    if (requestId === binsRequestId) binsLoading.value = false
  }
}
const loadCardStats = async () => {
  const requestId = ++statsRequestId
  cardStats.value = {}
  cardStatsReady.value = false
  cardStatsFailed.value = false
  if (!canCreate.value) return
  try {
    const result = await cardApi.vccStatistics()
    if (!alive || requestId !== statsRequestId || !canCreate.value) return
    cardStats.value = result || {}
    cardStatsReady.value = true
  } catch {
    if (alive && requestId === statsRequestId && canCreate.value) cardStatsFailed.value = true
  }
}
watch(cradType, () => {
  if (route.name !== 'cardAdd') return
  form.value.amount = null
  restoredSharedWalletId.value = null
  clearWalletDraft()
  loadCardStats()
  loadBins()
}, { flush: 'sync' })
watch([cradType, () => restoredSharedWalletId.value ?? route.query.shared_wallet_id, canCreate], async ([type, id, allowed], _, onCleanup) => {
  const controller = new AbortController()
  onCleanup(() => controller.abort())
  sharedWalletId.value = ''
  sharedWalletOptions.value = []
  sharedWalletLoading.value = false
  if (type !== 'share' || !allowed || typeof id !== 'string' || !id.trim()) return
  sharedWalletLoading.value = true
  try {
    const wallet = await userApi.getSharedWalletDetail({ shared_wallet_id: id }, { signal: controller.signal })
    if (controller.signal.aborted) return
    if (!wallet || String(wallet.id) !== id || String(wallet.status) !== '0') {
      message(t('card.index.sharedManagement.loadFailed'), 'error')
      return
    }
    sharedWalletOptions.value = [{ ...wallet, id }]
    sharedWalletId.value = id
  } catch (error) { showRequestError(error) } finally {
    if (!controller.signal.aborted) sharedWalletLoading.value = false
  }
}, { immediate: true, flush: 'sync' })
onBeforeUnmount(() => { alive = false; binsRequestId += 1; clearTimeout(restoreScrollTimer) })

// 初始化卡片统计、卡段列表及钱包往返草稿。
const init = async () => {
  if (!canCreate.value) return
  const draft = cradType.value === 'share' && walletReturnDraft?.userId === user.value.id ? walletReturnDraft : null
  if (!draft) clearWalletDraft()
  restoringDraft.value = Boolean(draft)
  try {
    const [, binsResult] = await Promise.allSettled([
      loadCardStats(),
      loadBins(),
    ])
    if (!alive || !canCreate.value) return
    if (binsResult.status !== 'fulfilled' || binsResult.value !== true || !draft || cradType.value !== 'share' || draft.userId !== user.value.id) return
    filterForm.value = draft.filters
    await nextTick()
    await recomRef.value?.restoreSelection(draft.scene)
    await nextTick()
    if (!alive || cradType.value !== 'share' || draft.userId !== user.value.id || !canCreate.value) return
    form.value = { ...form.value, ...draft.form, binId: useBins.value.some(bin => bin.id === draft.form.binId) ? draft.form.binId : null }
    isExpandBin.value = draft.expanded
    restoredSharedWalletId.value = draft.walletId
    await nextTick()
    restoreScrollTimer = setTimeout(() => {
      if (!alive || route.name !== 'cardAdd' || cradType.value !== 'share' || draft.userId !== user.value.id || !canCreate.value || walletReturnDraft !== draft) return
      window.scrollTo({ top: draft.scrollTop ?? 0, behavior: 'instant' })
      clearWalletDraft()
    }, 300)
  } finally {
    restoringDraft.value = false
  }
}

// 刷新用户余额及来源渠道等资料，刷新失败不影响已完成的开卡请求。
const refreshUserInfo = () => {
  try {
    Promise.resolve(userStore.getUserInfo()).catch(() => {})
  } catch {
    // 页面即将跳转时刷新失败不阻断主流程。
  }
}

// 渠道来源登记成功后刷新用户资料，并继续原开卡提交。
const handleChannelSourceSuccess = () => {
  refreshUserInfo()
  if (formError.value) return
  handleSubmit()
}

// 执行表单组件校验和认证/渠道前置检查。
const handleSubmitValid = () =>{
  errTip.value = ''
  if (!canCreate.value || !formRef.value || submiting.value || !balanceState.value.valid || balanceState.value.insufficient) return
  formRef.value.validate((valid) => {
    if (!valid)  return

    if (user.value.auth_status !== 1) {
      confirm(t('card.index.cardholder.verificationContent'), {
        title: t('card.index.cardholder.verificationTitle'),
        okText: t('card.index.cardholder.verifyNow'),
        cancelText: t('button.cancel'),
      }).then(() => {
        toRoute('certify')
      })
      return
    }

    const sourceChannel = user.value.source_channel || ''

    if (!sourceChannel) {
      displayChannelModal.value = true
      return
    }
    handleSubmit()
  })
}

// 统一处理开卡接口失败及需要跳转处理的业务错误码。
const handleSubmitError = (error) => {
  const normalizedError = error && typeof error === 'object' ? error : {}
  const errorCode = Number(normalizedError.code)
  submiting.value = false
  errTip.value = normalizedError.msg || t('card.index.opening.page.submitFailed')
  if (errorCode === -424) {
    confirm(errTip.value, {
      title: t('card.index.opening.page.securityNotice'),
      okText: t('card.index.opening.page.goNow'),
      cancelText: t('button.cancel'),
    }).then(() => {
      toRoute('ucenter_security')
    })
  } else if (errorCode === -425 && cradType.value !== 'share') {
    confirm(errTip.value, {
      title: t('card.index.opening.page.insufficientBalanceTitle'),
      okText: t('header.rechargeNow'),
      cancelText: t('button.cancel'),
    }).then(() => {
      toRoute('ucenter_deposit')
    })
  }
}

// 提交开卡请求；入口增加锁，避免弹窗回调或连续点击造成重复提交。
const handleSubmit = async () => {
  if (!canCreate.value || submiting.value || !balanceState.value.valid || balanceState.value.insufficient || formError.value) return
  const _form = form.value
  const _holder = {
    firstName: _form.firstName,
    lastName: _form.lastName,
    phoneCode: _form.phoneCode,
    phone: _form.phone,
    email: _form.email,
  }
  const params = {
    binId: _form.binId,
    cardholderId: _form.cardholderId, // 添加持卡人ID
    number: _form.number,
    ...(cradType.value === 'share' ? { shared_wallet_id: sharedWalletId.value } : { amount: _form.amount }),
    physical: _form.physical,
    holder: _holder,
  }
  submiting.value = true
  errTip.value = ''
  try {
    if (cradType.value === 'share') await cardApi.sharedCardCreate(params)
    else await cardApi.vccCreate(params)
  } catch (error) {
    handleSubmitError(error)
    return
  }

  message(t('card.index.opening.page.submitSuccess'))
  refreshUserInfo()
  toRoute(cradType.value === 'share' ? 'sharedCard' : 'card', { type: 'record' }, 'query', { replace: true }).catch(() => {
    submiting.value = false
  })
}

// 从场景推荐结果定位卡段，必要时自动展开卡段列表。
const handleCheckSearch =  (bin)=> {
  const index = useBins.value.findIndex((item) => item.bin === bin)
  const res = useBins.value[index] || {}
  if(index>=binLeight){
    isExpandBin.value=true
  }
  if (res.id) {
    form.value.binId = res.id
  } else {
    message(t('card.index.opening.page.relatedBinNotFound'), 'error')
  }
}
// 跳转到实名认证页面。
const goAuth = function () {
  toRoute('certify')
}

// 卡段被清空时同步清除上一卡段的费用预览和服务端错误。
watch(
  () => selectBin.value.id,
  (binId) => {
    errTip.value = ''
    if (!binId) c_expenseDetails.value = {}
  },
)

// 用户修改任一申请字段后清除旧的服务端错误，避免展示过期提示。
watch(
  form,
  () => {
    errTip.value = ''
  },
  { deep: true },
)

// 页面挂载后加载开卡所需数据。
onMounted(() => {
  try { localStorage.removeItem('CARDHOLDER') } catch {}
  if (!canCreate.value) return
  // 认证审核结果可能已在其他页面更新，进入开卡页时重新获取用户状态。
  void userStore.getUserInfo()
  void init()
})

</script>

<style scoped lang="less">
.shared-wallet-select :deep(.ivu-select-input) {
  vertical-align: top;
}

.shared-wallet-option {
  white-space: normal;
  overflow-wrap: anywhere;

  .shared-wallet-option-heading {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    gap: var(--ui-space-4) var(--ui-space-12);
    span:last-child { font-variant-numeric: tabular-nums; }
  }
}

.shared-wallet-link {
  padding-inline: 0;
  &:not([disabled]) { color: var(--primary-color); }
}

.shared-wallet-summary {
  display: grid;
  grid-template-columns: minmax(0, 1.6fr) minmax(0, 0.8fr) minmax(0, 1.2fr);
  grid-template-areas: 'identity cards balance';
  align-items: center;
  gap: var(--ui-space-8) var(--ui-space-12);
  margin-top: var(--ui-space-8);
  padding: var(--ui-space-12);
  border: var(--ui-border-subtle);
  border-radius: var(--ui-radius-lg);
  background: linear-gradient(110deg, var(--ui-color-surface) 35%, var(--ui-color-surface-navigation) 75%, var(--ui-color-surface-selected));
  overflow: hidden;
  font-size: var(--ui-font-size-xs);
  overflow-wrap: anywhere;

  header {
    grid-area: identity;
    display: flex;
    align-items: center;
    gap: var(--ui-space-8);
    min-width: 0;
  }
  h3 {
    margin: 0;
    font-size: var(--ui-font-size-lg);
    font-weight: var(--ui-font-weight-semibold);
    line-height: var(--ui-line-height-md);
  }
  p, dt { color: var(--ui-color-text-secondary); }
  .shared-wallet-symbol {
    display: grid;
    place-items: center;
    flex-shrink: 0;
    width: var(--ui-size-40);
    height: var(--ui-size-40);
    border-radius: var(--ui-radius-lg);
    background: var(--ui-color-surface-selected);
    color: var(--ui-color-primary);
    .iconfont { font-size: var(--ui-space-24); line-height: 1; }
  }
  .shared-wallet-identity { flex: 1; min-width: 0; }
  h3, .shared-wallet-remark {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .shared-wallet-remark {
    margin-top: var(--ui-space-2);
    line-height: var(--ui-line-height-md);
  }
  dd { margin: 0; font-variant-numeric: lining-nums tabular-nums; }
  .shared-wallet-card-count {
    grid-area: cards;
    min-width: 0;
    dt { line-height: var(--ui-line-height-md); }
    dd { margin-top: var(--ui-space-2); font-size: var(--ui-space-24); line-height: 1.2; font-weight: var(--ui-font-weight-semibold); }
    span { font-size: var(--ui-font-size-xs); font-weight: var(--ui-font-weight-regular); color: var(--ui-color-text-secondary); }
  }
  .shared-wallet-balance {
    grid-area: balance;
    min-width: 0;
    align-content: center;
    text-align: start;
    dt { line-height: var(--ui-line-height-md); }
    dd {
      margin-top: var(--ui-space-2);
      color: var(--ui-color-primary);
      font-size: var(--ui-space-24);
      font-weight: var(--ui-font-weight-semibold);
      line-height: 1.2;
    }
  }
  @media (max-width: 480px) {
    grid-template-columns: minmax(0, 0.8fr) minmax(0, 1.2fr);
    grid-template-areas: 'identity identity' 'cards balance';
    gap: var(--ui-space-8);
    padding: var(--ui-space-10);
    header { gap: var(--ui-space-8); }
    .shared-wallet-symbol { width: var(--ui-size-40); height: var(--ui-size-40); }
    .shared-wallet-card-count dd { margin-top: var(--ui-space-2); font-size: var(--ui-font-size-3xl); }
    .shared-wallet-balance {
      text-align: start;
      dd { margin-top: var(--ui-space-2); font-size: var(--ui-font-size-3xl); }
    }
  }
}
.add-main {
  flex: 1;
  min-width: 0;

  :deep(.ivu-form-item-error-tip) {
    color: var(--error-color);
  }
}
.bins-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--ui-space-20);
  padding: var(--ui-space-32) var(--ui-space-24) var(--ui-space-24);
  border: var(--ui-border-subtle);
  border-radius: var(--ui-radius-3);
  background: linear-gradient(135deg, var(--ui-color-surface), var(--ui-color-surface-muted));
  text-align: center;
  &-art {
    position: relative;
    width: 88px;
    height: 64px;
    &::before {
      content: '';
      position: absolute;
      inset: 0 8px 12px 0;
      border: var(--ui-border-subtle);
      border-radius: var(--ui-radius-3);
      background: var(--ui-color-surface-selected);
      transform: rotate(-10deg);
    }
  }
  &-card {
    position: absolute;
    inset: 10px 0 0 8px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    padding: var(--ui-space-10);
    border: var(--ui-border-subtle);
    border-radius: var(--ui-radius-3);
    background: var(--ui-color-surface);
    box-shadow: var(--ui-shadow-neutral-card);
    text-align: start;
    .iconfont {
      font-size: var(--ui-font-size-xl);
      line-height: 1;
      color: var(--ui-color-primary);
    }
    span {
      width: var(--ui-size-32);
      height: var(--ui-size-4);
      border-radius: var(--ui-radius-3);
      background: var(--ui-color-surface-selected-strong);
    }
  }
  h3 {
    margin: 0;
    font-size: var(--ui-font-size-md);
    font-weight: var(--ui-font-weight-semibold);
    line-height: var(--ui-line-height-md);
    color: var(--ui-color-text-primary);
  }
  p {
    margin: var(--ui-space-2) 0 0;
    font-size: var(--ui-font-size-xs);
    line-height: var(--ui-line-height-md);
    color: var(--ui-color-text-subtle);
  }
}
.card-type {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
  .card-type-item {
    min-width: 0;
    border: var(--ui-border-subtle);
    border-radius: 8px;
    padding: 12px;
    background: var(--ui-color-surface);
    cursor: pointer;
    transition: border-color .2s ease, background-color .2s ease;
    display: flex;
    align-items: center;
    gap: 12px;
    dd { min-width: 0; }
    h3 {
      font-size: 14px;
      font-weight: 600;
      color: var(--ui-color-text-primary);
    }
    p {
      margin-top: 4px;
      font-size: 12px;
      line-height: 1.6;
      color: var(--ui-color-text-secondary);
      overflow-wrap: anywhere;
    }
    .iconfont {
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      width: 32px;
      height: 32px;
      border-radius: 6px;
      background: var(--ui-color-surface-muted);
      color: var(--ui-color-text-secondary);
      font-size: 18px;
    }
    &:hover { border-color: var(--ui-color-primary); }
    &:focus-visible { outline: 2px solid var(--ui-color-primary); outline-offset: 3px; }
    &.active {
      border-color: var(--ui-color-primary);
      background: color-mix(in srgb, var(--ui-color-primary) 5%, var(--ui-color-surface));
      h3, .iconfont { color: var(--ui-color-primary); }
      .iconfont { background: color-mix(in srgb, var(--ui-color-primary) 10%, var(--ui-color-surface)); }
    }
  }
  @media (max-width: 600px) {
    grid-template-columns: minmax(0, 1fr);
  }
}
.mb-40 {
  margin-bottom: 40px;
}

.expand-btn {
  color: var(--ui-color-text-muted);
}

.recom-wrap {
  width: 100%;
}

.card-tags {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 10px;

  > :deep(.ivu-select) {
    width: 100%;
    min-width: 0;
  }

  &.card-tags-2{
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  @media screen and (max-width: 768px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    &.card-tags-2 {
      grid-template-columns: minmax(0, 1fr);
    }
  }
}

.bin-skeleton {
  display: flex;
  align-items: center;
  gap: 12px;
  min-height: 60px;
  padding: 12px;
  border: var(--ui-border-subtle);
  border-radius: 6px;
  background: var(--ui-color-surface);

  span {
    display: block;
    background: var(--ui-color-surface-muted);
    animation: bin-skeleton-pulse 1.4s ease-in-out infinite;
  }
  .bin-skeleton-radio { width: 14px; height: 14px; flex-shrink: 0; border-radius: 50%; }
  .bin-skeleton-content { flex: 1; min-width: 0; }
  .bin-skeleton-title { width: 42%; height: 14px; border-radius: 4px; }
  .bin-skeleton-description { width: 86%; height: 10px; margin-top: 8px; border-radius: 4px; }
  @media (prefers-reduced-motion: reduce) {
    span { animation: none; }
  }
}
@keyframes bin-skeleton-pulse {
  50% { opacity: .45; }
}

@media screen and (max-width: 768px) {
  .add-main {
    padding-bottom: calc(172px + env(safe-area-inset-bottom));
  }

  .fee-section {
    padding-top: 0;
    padding-bottom: 0;

    :deep(.fee-input-section:empty) {
      display: none;
      margin: 0;
    }
  }

  :deep(.ui-page-flex) {
    flex: 1;
    flex-direction: column;
    gap: 8px;
    overflow-y: auto;

    .ui-page-left,
    .ui-page-right {
      width: 100% !important;
      flex: none;
      padding: var(--ui-padding-12);
    }
  }

}

.required-info-section {
  margin-bottom: 24px;

  .required-info-title {
    margin-bottom: 16px;
  }

  > :deep(.ivu-divider-horizontal) {
    margin: var(--ui-margin-24-0);
  }
}
.fee-section {
  padding: 0 0 16px;
  background: rgba(255, 255, 255, 0.6);
  backdrop-filter: blur(4px);
  :deep(.fee-input-section) {
    margin-bottom: 16px;

    > h3 {
      margin-bottom: 16px;
    }
  }

  :deep(.fee-detail-section) {
    margin-bottom: 0;
  }
}

.failure-section {
  margin-top: 0;
}

.order-submit-error .link {
  margin-left: var(--ui-space-8);
}

.fee-submit-area {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 10px;
}

.fee-submit-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 178px;
  height: var(--ui-size-44);
  border-radius: var(--ui-radius-lg);
  font-weight: 600;
  box-shadow: 0 2px 6px rgba(43, 92, 217, 0.16);
  transition: opacity 180ms ease, box-shadow 180ms ease;

  .fee-submit-label {
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &.ivu-btn-disabled,
  &:disabled {
    opacity: 0.56;
    box-shadow: none;
    cursor: not-allowed;
    color: #8995a8 !important;
    border-color: #d5dce8 !important;
    background: #dce3ed !important;
  }

  :deep(.ivu-icon) {
    flex-shrink: 0;
    margin-left: 8px;
    font-size: 16px;
  }
}

@media screen and (max-width: 768px) {
  .required-info-section {
    margin-bottom: 16px;
  }

  .fee-section {
    margin: 0;
    padding: 0;
  }

  .failure-section {
    margin-top: 0;
  }

  .fee-submit-area {
    width: 100%;
  }

  .fee-submit-button {
    width: 100%;
    min-width: 0;
    height: var(--ui-size-44);
    border-radius: var(--ui-radius-7);
    box-shadow: none;
    order: initial;
  }

}

@media (prefers-reduced-motion: reduce) {
  .fee-submit-button {
    transition: none;
  }
}

</style>
