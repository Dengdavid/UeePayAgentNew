<template>
  <UiPage :fallback="{ name: 'card' }" isBack :pageRightStyle="pageRightStyle" :page-right-title="$t('card.index.sceneMatchingTool')">
    <div class="add-main">
        <h3 class="m-b-20">{{ $t('card.index.opening.page.selectBin') }}</h3>
        <div class="card-tags m-b-16">
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
        <div class="card-tags card-tags-2 m-b-16">
          <CardTag v-for="item in showBins" :key="item.id" :item="item" :checked="item.id === form.binId"
            @on-click="form.binId = item.id">
          </CardTag>
        </div>
        <Divider v-if="availableBins.length > binLeight"><a class="expand-btn" @click="isExpandBin = !isExpandBin">{{
          isExpandBin ? $t('card.index.opening.page.collapseBins') : $t('card.index.opening.page.expandBins', { count: collapsedBinCount })
            }}</a></Divider>
        <CardBinInfo v-if="selectBin.id" :bin="selectBin" class="card-bin-section" />
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
            :recharge-limit="rechargeLimit"
            :used-capacity="user.used_capacity"
            :free-cards-nums="user.free_cards_nums"
            @expense-change="c_expenseDetails = $event"
          >
            <template #status>
              <UiNotice
                v-if="displayError"
                class="order-submit-error"
                role="alert"
                aria-live="polite"
                showIcon
              >
                <span>{{ displayError }}</span>
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
        <CardFailureTips v-if="bins.length > 0" class="failure-section" />
    </div>
    <template #pageRight>
      <div class="recom-wrap">
        <RecomWrap :bins="useBins" :selectBin="selectBin" @on-bin="handleCheckSearch" @showBinBtn="showBinBtn"/>
      </div>
    </template>
    <ChannelSourceModal v-model="displayChannelModal" @success="handleChannelSourceSuccess" />
  </UiPage>
</template>

<script setup>
import { cardApi } from '@/api'
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
import { useCardStore } from '@/store/card.js'
import { useUserStore } from '@/store/user.js'
import { storeToRefs } from 'pinia'
import { confirm, message } from '@/utils/message.js'
import { t } from '@/utils'
import { computed, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { toRoute } from '@/utils/route.js'
const router = useRouter()

// 右侧场景推荐栏保持固定宽度，移动端由 UiPage 自动切换布局。
const pageRightStyle = ref({
  width: '390px',
})

// 卡段与用户信息由全局 store 提供，页面只维护本次开卡过程状态。
const cardStore = useCardStore()
const { bins } = storeToRefs(cardStore)
const userStore = useUserStore()
const { user } = storeToRefs(userStore)
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
    required: true,
    type: 'number',
    message: t('card.index.opening.page.transferAmountRequired'),
    trigger: 'blur',
  },
}))

// 使用 Decimal 比较资金，避免原生浮点数和非法字符串导致余额判断失真。
const balanceState = computed(() => {
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
const binLeight = 16

// 场景推荐组件回传的匹配卡段范围。
const showBinIds=ref([])
const isSceneFiltering=ref(false)

// 同步场景筛选结果；当前已选卡段失效时立即清空，避免提交隐藏卡段。
const showBinBtn=(binIds, filtering=false)=>{
  const validBinIds = Array.isArray(binIds) ? binIds : []
  showBinIds.value=validBinIds
  isSceneFiltering.value=filtering
  if(filtering && !validBinIds.includes(form.value.binId)){
    form.value.binId=null
  }
  if(validBinIds.length===0){
    isExpandBin.value=false
  }
}

// 场景筛选启用时，仅展示推荐组件允许的卡段。
const availableBins = computed(() => {
  if(!isSceneFiltering.value){
    return useBins.value
  }
  return useBins.value.filter((item) => showBinIds.value.includes(item.id))
})

// 当前筛选结果中默认展示数量以外、处于折叠状态的卡段数量。
const collapsedBinCount = computed(() => Math.max(availableBins.value.length - binLeight, 0))

// 默认展示 16 个卡段，用户可手动展开。
const showBins = computed(() => {
  const arr=availableBins.value
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
  if (!_form.binId || !selectBin.value.id) return t('card.index.opening.page.selectBinRequired')
  if (!_form.firstName) return t('card.index.opening.page.firstNameEmpty')
  if (!_form.lastName) return t('card.index.opening.page.lastNameEmpty')
  if (!_form.phone) return t('card.index.opening.page.phoneEmpty')
  if (!_form.email) return t('card.index.opening.page.emailEmpty')
  if (!_form.number || _form.number <= 0) return t('card.index.opening.page.cardQuantityEmpty')
  if (!_form.amount || _form.amount <= 0) return t('card.index.opening.page.transferAmountEmpty')
  if (!balanceState.value.valid) return t('card.index.opening.page.balanceUnavailable')
  if (_form.number > allowedCardCount.value) return t('card.index.opening.page.quantityExceedsLimit')
  if (!rechargeAmountState.value.valid) return t('card.index.opening.page.transferConfigInvalid')
  if (!rechargeAmountState.value.withinLimit) return t('card.index.opening.page.transferOutsideLimit')
  if (balanceState.value.insufficient) return t('card.index.opening.page.insufficientBalance')
  return ''
})

// 表单阻断原因优先展示，表单有效时再展示最近一次服务端错误。
const displayError = computed(() => formError.value || errTip.value)
const isBalanceInsufficient = computed(() => balanceState.value.insufficient && formError.value === t('card.index.opening.page.insufficientBalance'))
// 提交中必须保持禁用，防止重复创建卡片。
const isFormDisabled = computed(() => submiting.value || Boolean(formError.value))


// 仅恢复允许缓存的持卡人联系字段，忽略损坏或历史冗余数据。
const holderFields = ['firstName', 'lastName', 'phoneCode', 'phone', 'email']

const getHolderFields = () => Object.fromEntries(
  holderFields.map((field) => [field, form.value[field]]),
)

const restoreCachedHolder = () => {
  try {
    const cachedHolder = JSON.parse(localStorage.getItem('CARDHOLDER') || 'null')
    if (!cachedHolder || typeof cachedHolder !== 'object') return
    const holder = Object.fromEntries(
      holderFields
        .filter((field) => Object.hasOwn(cachedHolder, field))
        .map((field) => [field, cachedHolder[field]]),
    )
    form.value = { ...form.value, ...holder }
  } catch {
    // 浏览器禁用存储或缓存内容损坏时忽略，不阻断页面初始化。
  }
}

// 本地缓存失败不应影响当前开卡流程。
const cacheHolder = (holder) => {
  try {
    localStorage.setItem('CARDHOLDER', JSON.stringify(holder))
  } catch {
    // 浏览器禁用存储或容量不足时忽略，下次由用户重新填写。
  }
}

// 初始化卡片统计、卡段列表及上次填写的联系信息。
const init = async () => {
  restoreCachedHolder()
  const [statsResult, binsResult] = await Promise.allSettled([
    cardApi.vccStatistics(),
    cardStore.getBinList(),
  ])
  cardStats.value = statsResult.status === 'fulfilled' ? statsResult.value || {} : {}
  cardStatsReady.value = statsResult.status === 'fulfilled'
  if (binsResult.status === 'rejected') {
    message(t('card.index.opening.page.binLoadFailed'), 'error')
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
  if (!formRef.value || submiting.value) return
  formRef.value.validate((valid) => {
    if (!valid)  return

    if (user.value.auth_status !== 1) {
      confirm(t('card.index.cardholder.verificationContent'), {
        title: t('card.index.cardholder.verificationTitle'),
        okText: t('card.index.cardholder.verifyNow'),
        cancelText: t('button.cancel'),
      }).then(() => {
        router.push('/ucenter/certification')
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
      router.push({ path: '/ucenter/security' })
    })
  } else if (errorCode === -425) {
    confirm(errTip.value, {
      title: t('card.index.opening.page.insufficientBalanceTitle'),
      okText: t('header.rechargeNow'),
      cancelText: t('button.cancel'),
    }).then(() => {
      router.push({ path: '/ucenter/deposit' })
    })
  } else {
    message(errTip.value, 'error')
  }
}

// 提交开卡请求；入口增加锁，避免弹窗回调或连续点击造成重复提交。
const handleSubmit = async () => {
  if (submiting.value || formError.value) return
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
    amount: _form.amount,
    physical: _form.physical,
    holder: _holder,
  }
  submiting.value = true
  errTip.value = ''
  try {
    await cardApi.vccCreate(params)
  } catch (error) {
    handleSubmitError(error)
    return
  }

  cacheHolder(_holder)
  message(t('card.index.opening.page.submitSuccess'))
  refreshUserInfo()
  router.replace({ name: 'card', query: { type: 'record' } }).catch(() => {
    submiting.value = false
  })
}

// 从场景推荐结果定位卡段，必要时自动展开卡段列表。
const handleCheckSearch =  (bin,index)=> {
  const res = useBins.value.find((item) => item.bin === bin) || {}
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
  router.push('/certify')
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

// 联系字段填写后立即保存，离开页面或退出登录后仍可恢复。
watch(
  () => holderFields.map((field) => form.value[field]),
  () => cacheHolder(getHolderFields()),
)

// 页面挂载后加载开卡所需数据。
onMounted(() => {
  // 认证审核结果可能已在其他页面更新，进入开卡页时重新获取用户状态。
  void userStore.getUserInfo()
  void init()
})

</script>

<style scoped lang="less">
.add-main {
  flex: 1;
  min-width: 0;

  :deep(.ivu-form-item-error-tip) {
    color: var(--error-color);
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
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }

  @media screen and (max-width: 1999px) {
    &.card-tags-2 {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }

  @media screen and (max-width: 1000px) {
    &.card-tags-2 {
      grid-template-columns: minmax(0, 1fr);
    }
  }

  @media screen and (max-width: 768px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
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
