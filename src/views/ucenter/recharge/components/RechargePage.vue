<template>
   <div class="recharge-layout">
      <div class="recharge-wrap">
        <!-- 添加币种选择下拉框 -->
        <div class="currency-selector mb-20">
          <p class="mb-10">{{ $t('recharge.selectCurrency') }}</p>
          <UiSelect v-model="selectedCurrency" :filterable="false" :disabled="loading" :options="[
            {
              label:'USDT',
              value:'USDT',
              img:getCurrencyImage('USDT'),
            },
            {
              label:'USDC',
              value:'USDC',
              img:getCurrencyImage('USDC'),
            }
          ]" @change="getChainList">
              <template #icon="{row}">
                <div class="select-prefix-icon" v-if="row.img">
                  <img :src="row.img" class="currency-icon-small" />
                </div>
              </template>
          </UiSelect>
        </div>

        <!-- 添加链名称选择下拉框 -->
        <div class="currency-selector mb-20">
          <p class="mb-10">{{ $t('recharge.selectNetwork') }}</p>
          <UiSelect
            v-model="selectedChain"
            :filterable="false"
            :options="chainList.map(el=>({
                value:el.chain,
                label:el.name,
                img:getCurrencyImage(el.chain),
            }))"
            :disabled="loading"
            @change="handleChainChange"
            >
              <template #icon="{row}">
                <div class="select-prefix-icon" v-if="row.img">
                  <img :src="row.img" class="currency-icon-small" />
                </div>
              </template>
          </UiSelect>
          <!-- 添加链说明 -->
          <div v-if="currentChainRemark" class="chain-remark" v-html="currentChainRemark"></div>
        </div>
        <template v-if="selectedCurrency && selectedChain">
          <p class="mt-20">{{ $t('recharge.instructionPrefix') }} <span class="currency-name">{{ selectedCurrency }}{{ $i18n.locale === 'en-US' ? '-' : ' - ' }}{{ currentChainName }}</span> {{ $t('recharge.instructionSuffix') }}</p>
          <div class="qrcode-box">
            <div class="qrcode-img" v-if="imgUrl">
              <div class="qrcode-logo">
                <img :src="getCurrencyImage(selectedCurrency)" />
              </div>
              <img :src="imgUrl" />
            </div>
            <div v-if="loading" class="loading-box">
              <ui-loading></ui-loading>
            </div>
            <div v-if="isError" class="loaderr">
              <a @click="getRechargeAddress">
                <Icon type="md-refresh" size="16" />
                <span class="ml-10">{{ $t('recharge.reloadFailed') }}</span>
              </a>
            </div>
          </div>
          <div class="mb-20">
            <p class="mb-10">{{ $t('recharge.walletAddress') }}
            </p>
            <div class="input-with-icon list-b-8">
              <Input  :model-value="address" readonly search :enter-button="$t('recharge.copy')" placeholder="" :disabled="creatingAddress" @on-search="handleCopy"></Input>
              <div class="ui-text-error fwb list-b-4">
                <p>{{ $t('recharge.warning.minimum', { currency: selectedCurrency }) }}</p>
                <p>{{ $t('recharge.warning.verifyAddress') }}</p>
              </div>
            </div>
          </div>
        </template>
        <div class="mb-20" style="color: #9e9e9e; line-height: 24px;">
          <ol>
            <li>{{ $t('recharge.supportedCurrencies') }}</li>
            <li>{{ $t('recharge.exchangeFee', { fee: user.account_depost_fee, minFee: user.depost_min_fee, currency: selectedCurrency }) }}</li>
            <li><span class="warning-text">{{ $t('recharge.complianceNotice') }}</span></li>
            <li>{{ $t('recharge.privateWalletPrefix') }}<a href="https://t.me/UeePayCom/415" target="_blank">{{ $t('recharge.energyRental') }}</a>{{ $t('recharge.privateWalletSuffix') }}</li>
          </ol>
        </div>
        <div class="pt-10" style="text-align: center;">
          <a @click="handleGoRecord" class="action-button">{{ $t('recharge.records') }}</a>
          <a @click="handleSyncRecharge" class="action-button sync-button" :class="{ 'disabled': syncCooldown }">{{ $t('recharge.sync') }}</a>
        </div>
      </div>
      <RechargeWarn ref="rechargeWarnRef" :currency="selectedCurrency" :chain="selectedChain" :user="user" :chainList="chainList"/>
    </div>
</template>

<script setup>
import {ref, onMounted, onBeforeUnmount, onActivated, onDeactivated, computed,reactive} from 'vue'
import RechargeWarn from './RechargeWarn.vue'
import {useRouter} from 'vue-router'
import {userApi} from '@/api'
import { storeToRefs } from 'pinia'
import { useUserStore } from '@/store/user.js'
import {Copy, Tooltip} from 'view-ui-plus'
import { message } from '@/utils/message.js'
import QRCode from 'qrcode'
import UiLoading from '@/components/layout/UiLoading.vue'
import { UiSelect } from '@/utils/myUi.js'
import { t } from '@/utils'
// 导入币种图标
import BNBIcon from '@/assets/images/currency/BNB.png'
import ETHIcon from '@/assets/images/currency/ETH.png'
import MATICIcon from '@/assets/images/currency/MATIC.png'
import OPIcon from '@/assets/images/currency/OP.png'
import AVAXIcon from '@/assets/images/currency/AVAX.png'
import ARBIcon from '@/assets/images/currency/ARB.png'
import TRXIcon from '@/assets/images/currency/TRX.png'
import USDTIcon from '@/assets/images/currency/USDT.png'
import USDCIcon from '@/assets/images/currency/USDC.png'

const router = useRouter()
const userStore = useUserStore();
const { user } = storeToRefs(userStore);
const loading = ref(false)
const isError = ref(false)
const address = ref('')
const imgUrl = ref('')
const syncCooldown = ref(false)
const chainList = ref([])
const selectedChain = ref('')
const selectedCurrency = ref('USDT') // 默认选中USDT
const selectDisabled = ref(false)
const creatingAddress = ref(false)
let cooldownTimer = null
let isPageActive = true
let requestVersion = 0
let hasActivated = false
let requestController = new AbortController()

const getRequestConfig = () => ({
  signal: requestController.signal,
})

//
const rechargeWarnRef=ref(null)

// 币种图标映射
const currencyIcons = {
  'ETH': ETHIcon,
  'MATIC': MATICIcon,
  'OP': OPIcon,
  'AVAX': AVAXIcon,
  'ARB': ARBIcon,
  'TRX': TRXIcon,
  'BNB': BNBIcon,
  'USDT': USDTIcon,
  'USDC': USDCIcon
}

// 获取币种图标
const getCurrencyImage = (chain) => {
  return currencyIcons[chain] || ''
}

// 计算当前选择的币种名称
const currentChainName = computed(() => {
  const selected = chainList.value.find(item => item.chain === selectedChain.value)
  return selected ? selected.name : ''
})

// 计算当前选择的链说明
const currentChainRemark = computed(() => {
  const selected = chainList.value.find(item => item.chain === selectedChain.value)
  return selected ? selected.remark : ''
})

// 获取链路列表
const getChainList = async () => {
  const currentVersion = requestVersion

  if(!selectedCurrency.value){
     selectedChain.value=''
     chainList.value=[]
     return
  }
  try {
    const res = await userApi.getChainList({
      currency:selectedCurrency.value
    }, getRequestConfig())
    if (!isPageActive || currentVersion !== requestVersion) return

    chainList.value = res
    if (res && res.length > 0) {
      // 默认选择第一个币种
      selectedChain.value = res[0].chain
      getRechargeAddress()
    }
  } catch (err) {
    if (!isPageActive || currentVersion !== requestVersion) return
    message(err?.msg,'error')
  }
}

// 处理币种切换
const handleChainChange = (value) => {
  selectedChain.value = value
  getRechargeAddress()
}

// 获取充值地址
const getRechargeAddress = function () {
  if (loading.value || !selectedChain.value) return false;

  const currentVersion = requestVersion
  loading.value = true;
  selectDisabled.value = true; // 禁用Select组件
  const data = {
    chain: selectedChain.value,
    currency:selectedCurrency.value,
  }

  userApi.getRechargeAddress(data, getRequestConfig()).then(async (res) => {
    if (!isPageActive || currentVersion !== requestVersion) return

    loading.value = false;
    selectDisabled.value = false; // 启用Select组件
    if (!res) {
      imgUrl.value = '';
      isError.value = true;
      address.value = '';
      return false;
    }
    isError.value = false;
    address.value = res;
    const qrcodeUrl = await QRCode.toDataURL(res, {
      errorCorrectionLevel: 'H',
      type: 'image/jpeg',
      quality: 0.8,
      margin: 2
    })
    if (!isPageActive || currentVersion !== requestVersion) return

    imgUrl.value = qrcodeUrl
    rechargeWarnRef.value?.open()
  }).catch((err) => {
    if (!isPageActive || currentVersion !== requestVersion) return

    loading.value = false;
    selectDisabled.value = false; // 启用Select组件
    isError.value = true;
    imgUrl.value = '';
    address.value = '';
    message(err?.msg,'error')
  })
}

const handleCopy = function () {
  if (!address.value) return false;
  Copy({text: address.value});
}

const handleGoRecord = function () {
  router.push({name: 'ucenter_finance', query: {type: 'recharge'}})
}

let errorMessageTimer = null
const handleSyncRecharge = function () {
  if (syncCooldown.value) return;

  if (loading.value) return false;
  const currentVersion = requestVersion
  loading.value = true;

  syncCooldown.value = true;
  cooldownTimer = setTimeout(() => {
    syncCooldown.value = false;
  }, 10000);

  userApi.syncRecharge(getRequestConfig()).then(() => {
    if (!isPageActive || currentVersion !== requestVersion) return

    message(t('recharge.syncSuccess'))
    loading.value = false;
  }).catch(err => {
    if (!isPageActive || currentVersion !== requestVersion) return

    loading.value = false;
    message(err?.msg,'error')
  })
}

// 创建新的充值地址
const createRechargeAddress = function () {
  if (creatingAddress.value || !selectedChain.value) return false;

  const currentVersion = requestVersion
  creatingAddress.value = true;
  const data = {
    chain: selectedChain.value,
    currency:selectedCurrency.value,
  }

  userApi.createRechargeAddress(data, getRequestConfig()).then(async (res) => {
    if (!isPageActive || currentVersion !== requestVersion) return

    creatingAddress.value = false;
    if (!res) {
      message(t('recharge.createFailed'),'error')
      return false;
    }

    // 更新地址和二维码
    address.value = res;
    const qrcodeUrl = await QRCode.toDataURL(res, {
      errorCorrectionLevel: 'H',
      type: 'image/jpeg',
      quality: 0.8,
      margin: 2
    });
    if (!isPageActive || currentVersion !== requestVersion) return

    imgUrl.value = qrcodeUrl
    message(t('recharge.createSuccess'))
  }).catch(err => {
    if (!isPageActive || currentVersion !== requestVersion) return

    creatingAddress.value = false;
    message(err?.msg,'error')
  });
}

onMounted(() => {
  getChainList();
})

onActivated(() => {
  isPageActive = true
  if (requestController.signal.aborted) {
    requestController = new AbortController()
  }

  if (hasActivated && !address.value) {
    loading.value = false
    selectDisabled.value = false
    getChainList()
  }
  hasActivated = true
})

onDeactivated(() => {
  isPageActive = false
  requestVersion += 1
  requestController.abort()
  loading.value = false
  selectDisabled.value = false
  creatingAddress.value = false
  if (cooldownTimer) {
    clearTimeout(cooldownTimer)
    cooldownTimer = null
  }
  syncCooldown.value = false
})

onBeforeUnmount(() => {
  isPageActive = false
  requestVersion += 1
  requestController.abort()
  if (cooldownTimer) {
    clearTimeout(cooldownTimer);
  }
})
</script>

<style scoped lang="less">


.recharge-layout {
  position: relative;
  padding: 60px 20px;
  text-align: center;
  background-color: var(--ui-color-surface);
}

.recharge-wrap {
  margin: 0 auto;
  width: 100%;
  max-width: 440px;
  text-align: left;
}

.qrcode-box {
  position: relative;
  margin: var(--ui-margin-40-auto);
  width: var(--ui-size-300);
  height: var(--ui-size-300);
}
.qrcode-img {
  position: relative;
  padding: 0px;
  border: var(--ui-border-subtle);
  overflow: hidden;
  border-radius: var(--ui-card-radius);
  box-shadow: var(--ui-shadow-media);
  width: 100%;
  height: 100%;
  .qrcode-logo{
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    width: var(--ui-size-40);
    height: var(--ui-size-40);
    border-radius: var(--ui-radius-full);
    background: var(--ui-color-surface);
    padding: 2px;
  }
  img {
    width: 100%;
    height: 100%;
  }
}

.qrcode-box .loading-box, .qrcode-box .loaderr {
  position: absolute;
  top: 0;
  left: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  color: var(--ui-color-neutral-550);
  border: 1px solid #fcfcfc;
  background-color: rgba(255, 255, 255, 0.8);
}

.action-button {
  display: inline-block;
  margin: var(--ui-margin-0-10);
  padding: var(--ui-padding-8-16);
  border-radius: var(--ui-radius-sm);
  cursor: pointer;
  transition: background-color 0.3s;
}

.action-button:hover {
  background-color: #f0f0f0;
}

.sync-button {
  color: var(--ui-color-error-strong);
}

.sync-button.disabled {
  opacity: var(--ui-opacity-control-disabled);
  cursor: not-allowed;
}

.warning-text {
  color: var(--ui-color-notice);
}

.small-text {
  font-size: 12px;
}

.medium-text {
  font-size: 16px;
}

/* 新增样式 */
.currency-selector {
  margin-top: 20px;
}

.currency-option {
  display: flex;
  align-items: center;
}

.currency-icon {
  width: var(--ui-size-24);
  height: var(--ui-size-24);
  margin-right: 10px;
}

.currency-icon-small {
  width: var(--ui-size-20);
  height: var(--ui-size-20);
}

.select-prefix-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 5px;
}

.currency-icon-large {
  position: absolute;
  top: -30px;
  right: -30px;
  width: var(--ui-size-60);
  height: var(--ui-size-60);
  z-index: 1;
}

.currency-icon-large img {
  width: 100%;
  height: 100%;
}

.currency-name {
  color: var(--ui-color-notice);
  font-weight: bold;
}

/* 输入框相关样式 */
.input-with-icon {
  position: relative;
  width: 100%;
}

.create-new-link {
  color:var(--error-color);
  font-size: 12px;
  margin-left: 5px;
  cursor: pointer;
  transition: color 0.3s;
}

.create-new-link.disabled {
  color: var(--ui-color-neutral-550);
  cursor: not-allowed;
}

.loading-icon {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.prefix-icon-container {
  display: flex;
  align-items: center;
  justify-content: center;
}

.input-currency-icon {
  width: var(--ui-size-20);
  height: var(--ui-size-20);
}

/* 链说明样式 */
.chain-remark {
  margin-top: 10px;
  padding: var(--ui-padding-10);
  background-color: #FFF9E6;
  border-radius: var(--ui-radius-sm);
  color: var(--ui-color-notice);
  line-height: 1.5;
}

.chain-remark a {
  color: var(--ui-color-info);
  text-decoration: underline;
}
</style>
