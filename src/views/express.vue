<template>
    <main class="express-page">
        <section class="banner" :style="{ '--banner-image': bannerBg }">
            <div class="banner-content ui-layout">
                <div class="hero-copy">
                    <h1 class="title">{{ $t('express.marketing.title') }}</h1>
                    <p class="sub-title">
                        <span class="sub-title-main">{{ $t('express.marketing.subtitle') }}</span>
                        <span class="sub-title-note">{{ $t('express.marketing.subtitleNote') }}</span>
                    </p>
                </div>

                <div class="exchange-wrap" :class="{ 'is-loading': currencyLoading }" :aria-busy="currencyLoading">
                    <div class="exchange-head">
                        <div>
                            <h2>{{ $t('express.marketing.estimatorTitle') }}</h2>
                            <p>{{ $t('express.marketing.estimatorDesc') }}</p>
                        </div>
                        <div class="currency-route" aria-live="polite">
                            <template v-if="currencyLoading">
                                <Icon class="route-loading-icon" type="ios-loading" :size="16" />
                                <span>{{ $t('express.marketing.rateLoading') }}</span>
                            </template>
                            <template v-else>
                                <span>USD</span>
                                <Icon type="md-arrow-forward" :size="17" aria-hidden="true" />
                                <span>{{ currentCurrency?.payout_currency || '--' }}</span>
                            </template>
                        </div>
                    </div>

                    <div class="amount-grid">
                        <div class="exchange-cell">
                            <label class="label" for="express-send-amount">
                                {{ $t('express.marketing.sendAmount') }}
                                <span v-if="currentCurrency" class="quota">
                                    {{ calculateAmount(currentCurrency.min_quota, currentCurrency.exchange_rate, true) }}
                                    ~
                                    {{ calculateAmount(currentCurrency.max_quota, currentCurrency.exchange_rate, true) }}
                                    USD
                                </span>
                            </label>
                            <div class="con">
                                <input
                                    id="express-send-amount"
                                    ref="amountInput"
                                    v-model="previewForm.amount"
                                    class="input amount"
                                    type="number"
                                    inputmode="decimal"
                                    :disabled="currencyLoading || !currentCurrency"
                                    :placeholder="$t('express.marketing.sendPlaceholder')"
                                    @input="handleAmountChange"
                                />
                                <button
                                    v-if="previewForm.amount && !currencyLoading"
                                    type="button"
                                    class="clear-button"
                                    :aria-label="$t('express.marketing.clearSendAmount')"
                                    @click="clearAmount"
                                >
                                    <Icon type="md-close-circle" :size="18" />
                                </button>
                                <div class="state-select-slot">
                                    <StateSelect
                                        :options="[USD_OPTION]"
                                        model-value="USA"
                                        disabled
                                        class="state-select"
                                    />
                                </div>
                            </div>
                        </div>

                        <div class="spacer" aria-hidden="true">
                            <Icon type="md-arrow-forward" :size="16" />
                        </div>

                        <div class="exchange-cell">
                            <label class="label" for="express-receive-amount">
                                {{ $t('express.marketing.receiveAmount') }}
                                <span v-if="currentCurrency" class="quota">
                                    {{ currentCurrency.min_quota }}
                                    ~
                                    {{ currentCurrency.max_quota }}
                                    {{ currentCurrency.payout_currency }}
                                </span>
                            </label>
                            <div class="con">
                                <input
                                    id="express-receive-amount"
                                    v-model="previewForm.amount1"
                                    class="input amount"
                                    type="number"
                                    inputmode="decimal"
                                    :disabled="currencyLoading || !currentCurrency"
                                    :placeholder="$t('express.marketing.receivePlaceholder')"
                                    @input="handleAmount1Change"
                                />
                                <button
                                    v-if="previewForm.amount1 && !currencyLoading"
                                    type="button"
                                    class="clear-button"
                                    :aria-label="$t('express.marketing.clearReceiveAmount')"
                                    @click="clearAmount1"
                                >
                                    <Icon type="md-close-circle" :size="18" />
                                </button>
                                <div class="state-select-slot" :aria-busy="currencyLoading">
                                    <div
                                        v-if="currencyLoading"
                                        class="state-select-placeholder"
                                        aria-hidden="true"
                                    >
                                        <span class="state-select-placeholder-flag"></span>
                                        <span class="state-select-placeholder-name"></span>
                                        <Icon type="ios-arrow-down" :size="14" />
                                    </div>
                                    <StateSelect
                                        v-else
                                        :options="sortedCurrencyOptions"
                                        :model-value="exchangeState"
                                        class="state-select"
                                        @on-change="handleCurrencyChange"
                                    />
                                </div>
                            </div>
                        </div>

                        <div class="amount-error-slot" aria-live="polite">
                            <span v-if="showAmountError" role="alert">
                                {{ $t('express.marketing.quotaRange', { min: calculateAmount(currentCurrency?.min_quota, currentCurrency?.exchange_rate, true), max: calculateAmount(currentCurrency?.max_quota, currentCurrency?.exchange_rate, true) }) }}
                            </span>
                        </div>
                    </div>

                    <div class="action-strip">
                        <div class="rate-info">
                            <span>{{ $t('express.marketing.exchangeRate') }}</span>
                            <strong v-if="currentCurrency">1 USD = {{ currentRate }} {{ currentCurrency.payout_currency }}</strong>
                            <strong v-else>{{ $t('express.marketing.rateLoading') }}</strong>
                        </div>
                        <Button
                            class="transfer-cta ui-cta-button"
                            type="primary"
                            size="large"
                            :loading="currencyLoading"
                            :disabled="currencyLoading || !currentCurrency"
                            @click="handleTransfer"
                        >
                            <span>{{ $t('express.marketing.remitNow') }}</span>
                            <Icon type="md-arrow-forward" :size="18" />
                        </Button>
                        <small class="rate-disclaimer">
                            {{ $t('express.marketing.rateDisclaimer') }}
                        </small>
                    </div>
                </div>
            </div>
        </section>

        <section class="trust-strip">
            <div class="ui-layout slogans">
                <div v-for="index in 4" :key="index" class="item">
                    <img :src="highlightIcons[index - 1]" alt="" />
                    <div>
                        <h2>{{ $t(`express.marketing.highlights.${index - 1}.title`) }}</h2>
                        <p>{{ $t(`express.marketing.highlights.${index - 1}.desc`) }}</p>
                    </div>
                </div>
            </div>
        </section>

        <section class="transfer-guide-section">
            <div class="ui-layout">
                <div class="transfer-guide-heading">
                    <h2>{{ $t('express.marketing.disclaimerTitle') }}</h2>
                    <p>{{ $t('express.marketing.disclaimerIntro') }}</p>
                </div>
                <div class="transfer-guide-grid">
                    <article class="journey-summary">
                        <div class="journey-summary-head">
                            <span class="journey-summary-icon ui-feature-icon">
                                <Icon custom="iconfont icon-kuajinyewu" aria-hidden="true" />
                            </span>
                            <div>
                                <h3>{{ $t('express.marketing.journeyTitle') }}</h3>
                                <p class="journey-summary-intro">{{ $t('express.marketing.journeyIntro') }}</p>
                            </div>
                        </div>
                        <div class="journey-summary-list">
                            <div v-for="index in 5" :key="index" class="journey-summary-item">
                                <span class="journey-step-index">{{ index }}</span>
                                <div>
                                    <h4>{{ $t(`express.marketing.journey.${index - 1}.title`) }}</h4>
                                    <p>{{ $t(`express.marketing.journey.${index - 1}.desc`) }}</p>
                                </div>
                            </div>
                        </div>
                        <div class="journey-support">
                            <Icon type="md-headset" :size="18" aria-hidden="true" />
                            <p>{{ $t('express.marketing.journeySupport') }}</p>
                        </div>
                    </article>

                    <div class="service-factor-list">
                        <article
                            v-for="(icon, index) in serviceFactorIcons"
                            :key="icon"
                            class="service-factor-item"
                        >
                            <span
                                class="service-factor-icon ui-feature-icon"
                            >
                                <Icon
                                    :type="icon.startsWith('icon-') ? '' : icon"
                                    :custom="icon.startsWith('icon-') ? `iconfont ${icon}` : ''"
                                    aria-hidden="true"
                                />
                            </span>
                            <div class="service-factor-copy">
                                <h3>{{ $t(`express.marketing.disclaimerFactors.${index}.title`) }}</h3>
                                <p>{{ $t(`express.marketing.disclaimerFactors.${index}.desc`) }}</p>
                            </div>
                            <span class="service-factor-tag">
                                {{ $t(`express.marketing.disclaimerFactors.${index}.tag`) }}
                            </span>
                        </article>
                    </div>
                </div>
            </div>
        </section>

        <section class="faq-section">
            <div class="ui-layout">
                <div class="section-heading">
                    <h2>{{ $t('express.marketing.faqTitle') }}</h2>
                    <p>{{ $t('express.marketing.faqSubtitle') }}</p>
                </div>
                <div class="faq-group">
                    <article v-for="child in faqList" :key="child.id" class="faq-cell">
                        <h3 class="faq-question">{{ child.title }}</h3>
                        <p class="faq-desc">{{ child.content }}</p>
                    </article>
                </div>
            </div>
        </section>
    </main>
</template>

<script setup>
import { ref, onMounted, nextTick, computed } from 'vue';
import { expressApi } from '@/api'
import StateSelect from '@/components/utils/state-select.vue';
import { t } from '@/utils'
import { country } from '@/utils/preferences'
import { toRoute } from '@/utils/route'
import expressHeroGlobal from '@/assets/images/express_hero_global-v4.jpg'
import highlightIcon1 from '@/assets/images/express_icon_1.png'
import highlightIcon2 from '@/assets/images/express_icon_2.png'
import highlightIcon3 from '@/assets/images/express_icon_3.png'
import highlightIcon4 from '@/assets/images/express_icon_4.png'

const STORAGE_KEY = 'last_selected_currency';

onMounted(() => {
    init();
})

const currency = ref([]);
const highlightIcons = [highlightIcon1, highlightIcon2, highlightIcon3, highlightIcon4];
const serviceFactorIcons = [
    'icon-fengkongxinxi',
    'md-card',
    'md-globe',
    'md-calendar',
    'md-time'
];

const sortedCurrencyOptions = computed(() => {
    // 1. 先 sort 排序
    const sorted = [...currency.value].sort((a, b) => b.sort - a.sort);

    // 2. 把 country_code 相同的放在一起
    const grouped = [];
    const seen = new Set();
    sorted.forEach(item => {
        if (!seen.has(item.country_code)) {
            seen.add(item.country_code);
            const group = sorted.filter(el => el.country_code === item.country_code);
            grouped.push(...group);
        }
    });

    // 3. 最后再过滤
    return grouped.filter(el => el.transfer_type_id !== 2);
});

const exchangeState = ref('');
const currentRate = ref('0.000000');
const currentCurrency = ref(null);
const currencyLoading = ref(true);

const previewForm = ref({
    amount: null,
    amount1: null
});

const amountInput = ref(null);

// 保存选择的币种到localStorage
const saveSelectedCurrency = (currency) => {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(currency));
    } catch (e) {
    }
}

// 根据汇率计算金额
const calculateAmount = (amount, rate, isReverse = false) => {
    if (!amount || !rate) return null;
    const num = parseFloat(amount);
    if (isNaN(num)) return null;
    return isReverse ? (num / rate).toFixed(2) : (num * rate).toFixed(2);
}

// 验证金额是否在限额范围内
const validateAmount = (amount, currency) => {
    if (!amount || !currency) return false;
    const num = parseFloat(amount);
    if (isNaN(num)) return false;
    return num >= currency.min_quota && num <= currency.max_quota;
}

// 添加错误提示状态
const showAmountError = ref(false);

// 处理汇款金额变化
const handleAmountChange = () => {
    if (!currentCurrency.value) return;
    const amount = previewForm.value.amount;

    // 验证输入值是否为负数或0
    const numValue = parseFloat(amount);
    if(numValue <= 0) {
        previewForm.value.amount = 1;
        // 使用更新后的值计算到账金额
        const calculatedAmount = calculateAmount(
            1,
            currentCurrency.value.exchange_rate
        );
        previewForm.value.amount1 = calculatedAmount;
        return;
    }

    if (!amount) {
        previewForm.value.amount1 = null;
        showAmountError.value = false;
        return;
    }

    // 验证输入金额
    const calculatedAmount = calculateAmount(
        amount,
        currentCurrency.value.exchange_rate
    );

    // 检查是否超出限额
    showAmountError.value = !validateAmount(calculatedAmount, currentCurrency.value);

    // 计算到账金额
    previewForm.value.amount1 = calculatedAmount;
}

// 处理到账金额变化
const handleAmount1Change = () => {
    if (!currentCurrency.value) return;
    const amount = previewForm.value.amount1;

    // 验证输入值是否为负数或0
    const numValue = parseFloat(amount);
    if(numValue <= 0) {
        previewForm.value.amount1 = 1;
        // 使用更新后的值计算汇款金额
        const calculatedAmount = calculateAmount(
            1,
            currentCurrency.value.exchange_rate,
            true
        );
        previewForm.value.amount = calculatedAmount;
        return;
    }

    if (!amount) {
        previewForm.value.amount = null;
        showAmountError.value = false;
        return;
    }

    // 检查是否超出限额
    showAmountError.value = !validateAmount(amount, currentCurrency.value);

    // 计算汇款金额
    previewForm.value.amount = calculateAmount(
        amount,
        currentCurrency.value.exchange_rate,
        true
    );
}

// 清空汇款金额
const clearAmount = () => {
    previewForm.value.amount = null;
    previewForm.value.amount1 = null;
    showAmountError.value = false;
}

// 清空到账金额
const clearAmount1 = () => {
    previewForm.value.amount = null;
    previewForm.value.amount1 = null;
    showAmountError.value = false;
}

const handleCurrencyChange = (item) => {
    if (item && item.country) {
        exchangeState.value = item.country;
        currentCurrency.value = item;
        // 更新汇率显示，保留6位小数
        currentRate.value = item.exchange_rate ? item.exchange_rate.toFixed(6) : '0.000000';

        // 保存选择的币种
        saveSelectedCurrency(item);

        // 重置错误提示
        showAmountError.value = false;

        // 处理金额
        const currentAmount = previewForm.value.amount1;
        if (currentAmount) {
            // 检查当前金额是否在新币种的限额范围内
            const amount = parseFloat(currentAmount);
            if (!isNaN(amount) && amount >= item.min_quota && amount <= item.max_quota) {
                // 如果在范围内，使用当前金额重新计算汇款金额
                previewForm.value.amount = calculateAmount(
                    amount,
                    item.exchange_rate,
                    true
                );
            } else {
                // 如果不在范围内，使用新币种的最小限额
                previewForm.value.amount1 = item.min_quota;
                previewForm.value.amount = calculateAmount(
                    item.min_quota,
                    item.exchange_rate,
                    true
                );
            }
        } else {
            // 如果没有金额，使用新币种的最小限额
            previewForm.value.amount1 = item.min_quota;
            previewForm.value.amount = calculateAmount(
                item.min_quota,
                item.exchange_rate,
                true
            );
        }
    }
}

// 固定的 USD 数据
const USD_OPTION = {
    country: 'USA',
    country_code: 'US',
    country_name: t('express.transferInfo.usa'),
    exchange_rate: 1.00000000,
    max_quota: 1000,
    min_quota: 10,
    payout_currency: 'USD'
};

// 获取币种列表
const getCurrencyList = async () => {
    currencyLoading.value = true;
    try {
        const res = await expressApi.getCurrency();
        if (res && Array.isArray(res) && res.length > 0) {
          currency.value = res;
        } else {
          currency.value = [USD_OPTION];
        }
    } catch (error) {
        currency.value = [USD_OPTION];
    } finally {
        currencyLoading.value = false;
    }
}

const init = function() {
    // 获取币种列表
    getCurrencyList().then(() => {
        // 默认选择当前国家；不支持当前国家时降级为下拉列表第一项。
        const defaultCurrency = sortedCurrencyOptions.value.find(
            item => String(item.country_code || '').toUpperCase() === country.value
        ) || sortedCurrencyOptions.value[0];
        if (defaultCurrency) {
            handleCurrencyChange(defaultCurrency);
        }
    });
}

// FAQ列表
const faqList = Array.from({ length: 8 }, (_, index) => ({
    id: index,
    title: t(`express.marketing.faq.${index}.title`),
    content: t(`express.marketing.faq.${index}.content`)
}));


// Hero 使用固定品牌背景，不随到账国家或地区切换。
const bannerBg = `url('${expressHeroGlobal}')`;

// 处理跳转到汇款页面
const handleTransfer = () => {
    if (!currentCurrency.value || !previewForm.value.amount) {
        // 聚焦到汇款金额输入框
        nextTick(() => {
            amountInput.value?.focus();
        });
        return;
    }

    const params = {
        amount: previewForm.value.amount1,
        // rate: currentCurrency.value.exchange_rate,
        currency: currentCurrency.value.payout_currency,
        country: currentCurrency.value.country
    }
    // 缓存信息
    try {
        localStorage.setItem('transferInfo', JSON.stringify(params));
    } catch (e) {
    }

    toRoute('express_transfer');
}

</script>

<style lang="less" scoped>
@import '@/assets/css/express.less';
</style>
