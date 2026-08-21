<template>
   <div class="home">
    <div class="home-wrap home-wrap-banner" :style="{
      backgroundImage:`url(${bannerBg})`
    }">
      <div class="home-main" >
        <div class="banner-panel main">
          <div class="banner-copy">
            <h1>
              <span>{{ $t('home.hero.line1') }}</span>
              <strong>{{ $t('home.hero.line2') }}</strong>
            </h1>
            <p>{{ $t('home.hero.subtitle') }}</p>
            <div class="banner-action">
              <div class="btns list-r-16">
                <router-link :to="{ name: 'card' }">
                  <Button  shape="circle" size="large">
                    <span>{{ $t('home.hero.openCard') }}</span>
                    <Icon type="ios-arrow-round-forward"  size="26"/>
                  </Button>
                </router-link>
              </div>
            </div>
          </div>
          <div class="banner-visual" aria-hidden="true">
            <img
              :src="bannerVisual"
              alt=""
              width="1240"
              height="745"
              loading="eager"
              fetchpriority="high"
              decoding="async"
            />
          </div>
        </div>
        <div class="main main-hd">
          <ul>
            <li v-for="banner in banners" :key="banner.title">
              <div class="hd ui-feature-icon">
                <span class="iconfont" :class="banner.icon || 'icon-maijiabaozhang-shi'"></span>
              </div>
              <div class="bd">
                <h3 class="title" :title="banner.title">{{ banner.title }}</h3>
                <div class="desc" :title="banner.desc">{{ banner.desc }}</div>
              </div>
            </li>
          </ul>
        </div>
      </div>
      <Aurora class="full"></Aurora>
    </div>
    <div class="home-wrap home-wrap-pay">
      <div class="home-main">
        <PageTitle :title="$t('home.payment.title')" :subtitle="$t('home.payment.subtitle')"/>
        <div class="main">
          <ul>
            <li  v-for="pay in pays" :key="pay.img">
              <div :class="pay.img" class="pay-item">
                <div class="banner">
                  <img
                    :src="pay.src"
                    alt=""
                    width="776"
                    height="396"
                    loading="lazy"
                    decoding="async"
                  />
                </div>
                <div class="bd">
                  <h1 class="title">{{ pay.title }}</h1>
                  <div class="desc">{{ pay.desc }}</div>
                </div>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </div>
    <div class="home-wrap home-wrap-security">
      <div class="home-main">
        <PageTitle isBlack :title="$t('home.security.title')" :subtitle="$t('home.security.subtitle')"/>
        <div class='main'>
          <ul>
            <li  v-for="security in securitys" :key="security">
              <div class="pay-item">
                <div class="icon">
                  <span class="iconfont" :class="security.icon || 'icon-maijiabaozhang-shi'"></span>
                </div>
                <div class="title">{{ security.title }}</div>
                <!-- <div class="desc">{{ security.desc }}</div> -->
                <div class="desc-list list-b-4">
                  <div class="desc-item" v-for="desc in security.descs">
                    {{ desc }}
                  </div>
                </div>
                <div class="btn">
                  <router-link :to="{ name: security.toName }">
                    <Button type="primary" ghost shape="circle" size="large">
                      {{ $t('home.security.viewMore') }}
                      <Icon type="md-arrow-round-forward" />
                    </Button>
                  </router-link>
                </div>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </div>
    <div class="home-wrap home-wrap-scene">
      <div class="home-main">
        <PageTitle :title="$t('home.scenarios.title')" :subtitle="$t('home.scenarios.subtitle')"/>
        <div class="main">
          <img
            class="scene-background"
            :src="sceneBg"
            alt=""
            aria-hidden="true"
            width="1280"
            height="272"
            loading="lazy"
            decoding="async"
          />
          <div class="count" >
            <dl v-for="sceneNum in sceneNums">
              <dt>
                <span v-font="40">
                  <Numeral :value="sceneNum.num" format="0,0"></Numeral>
                </span>
                <span>+</span>
              </dt>
              <dd>{{ sceneNum.title }}</dd>
            </dl>
          </div>
        </div>
         <div class="scene">
            <ul>
              <li v-for="(sceneImage, index) in supportImages" :key="sceneImage">
                <img
                  :src="sceneImage"
                  alt=""
                  :width="index < 9 ? 162 : 163"
                  height="180"
                  loading="lazy"
                  decoding="async"
                >
              </li>
            </ul>
          </div>
          <AnimatedLogoCloud :logos="logos"/>
      </div>
      <Aurora class="full"></Aurora>
    </div>
    <div class="home-wrap home-wrap-step">
      <div class="home-main">
        <PageTitle :title="$t('home.onboarding.title')" :subtitle="$t('home.onboarding.subtitle')"/>
        <div class="step">
          <div
            v-for="(item, index) in onboardingSteps"
            :key="item.title"
            class="step-item"
            :class="[
              `is-${item.status}`,
              { 'is-before-upcoming': onboardingSteps[index + 1]?.status === 'upcoming' }
            ]"
          >
            <em class="step-number">{{ index + 1 }}</em>
            <div class="step-head">
              <span class="step-icon"><i class="iconfont" :class="item.icon"></i></span>
            </div>
            <div class="step-content">
              <h4>{{ item.title }}</h4>
              <p>{{ item.desc }}</p>
              <Button
                class="step-action"
                :class="{ 'ui-button-shine': item.status === 'completed' && item.canAction }"
                :type="item.canAction ? 'primary' : 'default'"
                :disabled="!item.canAction"
                @click="handleOnboardingAction(item)"
              >
                <Icon v-if="item.status === 'completed' && !item.canAction" type="md-checkmark" />
                {{ item.actionText }}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
   </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import Aurora from './components/Aurora.vue'
import AnimatedLogoCloud from './components/AnimatedLogoCloud.vue'
import { cardApi } from '@/api'
import { useAppStoreRefs, useUserStoreRefs } from '@/utils/store.js'
import { t } from '@/utils'
import { toRoute } from '@/utils/route.js'
import bannerBg from '@/assets/images/scene/banner_bg.webp'
import bannerVisual from '@/assets/images/scene/banner_ui_blend.webp'
import sceneBg from '@/assets/images/scene/bg.webp'
import payScene from '@/assets/images/scene/pay_scene.png'
import payCard from '@/assets/images/scene/pay_card.png'
import payMoney from '@/assets/images/scene/pay_money.png'
const { customerUrl } = useAppStoreRefs()
const handlGoCustomer = function () {
  window.open(customerUrl.value, '_blank')
}
const { isLogin, user } = useUserStoreRefs()
const cardNumber = ref(0)
const cardStatsLoaded = ref(false)
const isVerified = computed(() => isLogin.value && Number(user.value?.auth_status) === 1)
const hasOpenedCard = computed(() => Number(user.value?.card_number || cardNumber.value) > 0)
const getStepStatus = (isCompleted, isCurrent) => isCompleted ? 'completed' : isCurrent ? 'current' : 'upcoming'
const onboardingSteps = computed(() => [
  {
    icon: 'icon-CRMEB-fenxiaoyuanshenqing-mianxing',
    title: t('home.onboarding.register'),
    desc: t('home.onboarding.registerDesc'),
    route: 'register',
    status: getStepStatus(isLogin.value, !isLogin.value),
    action: t('home.onboarding.registerNow')
  },
  {
    icon: 'icon-renlianshibie',
    title: t('home.onboarding.verify'),
    desc: t('home.onboarding.verifyDesc'),
    route: 'certify',
    status: getStepStatus(isVerified.value, isLogin.value && !isVerified.value),
    action: t('home.onboarding.verifyNow')
  },
  {
    icon: 'icon-yinhangka-m',
    title: t('home.onboarding.createCard'),
    desc: t('home.onboarding.createCardDesc'),
    route: 'cardAdd',
    status: getStepStatus(hasOpenedCard.value, isVerified.value && !hasOpenedCard.value),
    action: t('home.onboarding.openCardNow'),
    completedAction: t('home.onboarding.openCardAgain')
  }
].map(item => {
  const canAction = item.status === 'current' || (item.status === 'completed' && Boolean(item.completedAction))
  return {
    ...item,
    canAction,
    actionText: item.status === 'completed'
      ? item.completedAction || t('home.onboarding.completed')
      : item.status === 'current'
        ? item.action
        : t('home.onboarding.pending')
  }
}))
const handleOnboardingAction = (item) => {
  if (!item.canAction) return
  toRoute(item.route)
}
watch(isLogin, async (loggedIn) => {
  if (!loggedIn) {
    cardNumber.value = 0
    cardStatsLoaded.value = false
    return
  }
  if (cardStatsLoaded.value) return
  cardStatsLoaded.value = true
  try {
    const stats = await cardApi.vccStatistics()
    cardNumber.value = Number(stats?.card_number || 0)
  } catch {
    cardStatsLoaded.value = false
  }
}, { immediate: true })
const supportImageModules = import.meta.glob('@/assets/images/scene/support_img_*.png', {
  eager: true,
  import: 'default'
})
const getSupportImageNumber = (path) => Number(path.match(/support_img_(\d+)\.png$/)?.[1] || 0)
const supportImages = Object.entries(supportImageModules)
  .sort(([pathA], [pathB]) => getSupportImageNumber(pathA) - getSupportImageNumber(pathB))
  .map(([, src]) => src)
const logos = [
  {
    name: "Vercel",
    path: "https://res.cloudinary.com/dfhp33ufc/image/upload/v1715881430/vercel_wordmark_dark_mhv8u8.svg",
  },
  {
    name: "Prime",
    path: "https://res.cloudinary.com/dfhp33ufc/image/upload/v1715276558/logos/t2awrrfzdvmg1chnzyfr.svg",
  },
  {
    name: "Trustpilot",
    path: "https://res.cloudinary.com/dfhp33ufc/image/upload/v1715276558/logos/tkfspxqmjflfllbuqxsi.svg",
  },
  {
    name: "Webflow",
    path: "https://res.cloudinary.com/dfhp33ufc/image/upload/v1715276560/logos/nymiivu48d5lywhf9rpf.svg",
  },
  {
    name: "Airbnb",
    path: "https://res.cloudinary.com/dfhp33ufc/image/upload/v1715276558/logos/pmblusboe7vkw8vxdknx.svg",
  },
  {
    name: "Tina",
    path: "https://res.cloudinary.com/dfhp33ufc/image/upload/v1715276560/logos/afqhiygywyphuou6xtxc.svg",
  },
  {
    name: "Stackoverflow",
    path: "https://res.cloudinary.com/dfhp33ufc/image/upload/v1715276558/logos/ts1j4mkooxqmscgptafa.svg",
  },
  {
    name: "mistral",
    path: "https://res.cloudinary.com/dfhp33ufc/image/upload/v1715276558/logos/tyos2ayezryjskox3wzs.svg",
  },
];
const bannerIcons = ['icon-feiyong', 'icon-api', 'icon-CRMEB-fenxiaoyuanshenqing-mianxing', 'icon-fukuanshenqingicon', 'icon-zhangdanjiesuan']
const banners = computed(() => bannerIcons.map((icon, index) => ({ icon, title: t(`home.benefits.${index}.title`), desc: t(`home.benefits.${index}.desc`) })))
const payImages = [
  { img: 'pay_scene', src: payScene },
  { img: 'pay_card', src: payCard },
  { img: 'pay_money', src: payMoney }
]
const pays = computed(() => payImages.map((pay, index) => ({ ...pay, title: t(`home.paymentFeatures.${index}.title`), desc: t(`home.paymentFeatures.${index}.desc`) })))
const sceneNums = computed(() => [
  {
    title:t('home.metrics.0'),
    num:100000
  },
  {
    title:t('home.metrics.1'),
    num:500
  },
  {
    title:t('home.metrics.2'),
    num:180
  },
  {
    title:t('home.metrics.3'),
    num:2000
  }
])
const securityIcons = ['icon-chakankaihuxinxi', 'icon-fukuan', 'icon-ziyuan143', 'icon-maijiabaozhang-shi']
const securitys = computed(() => securityIcons.map((icon, index) => ({ icon, title: t(`home.safeguards.${index}.title`), toName: 'cardAdd', descs: Array.from({ length: 3 }, (_, itemIndex) => t(`home.safeguards.${index}.items.${itemIndex}`)) })))
</script>

<style scoped>
@import './home.less';
</style>
