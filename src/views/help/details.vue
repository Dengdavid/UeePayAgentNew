<template>
  <UiPage isNotBg isNotTitle :padding="0" :fallback="{name:'helpList',params:{id:details?.cate_id}}">
    <div class="pageWidth">
      <Breadcrumb class="article-breadcrumb" v-if="!isPhone">
        <BreadcrumbItem to="/help">
          <Icon type="md-home" size="18" color="var(--ui-color-text)" />
          <span>{{ $t('help.center') }}</span>
        </BreadcrumbItem>
        <BreadcrumbItem
          v-if="details?.cate_id"
          :to="{ name: 'helpList', params: { id: details.cate_id } }"
        >
          {{ categoryName }}
        </BreadcrumbItem>
        <BreadcrumbItem>{{ $t('help.articleDetails') }}</BreadcrumbItem>
      </Breadcrumb>

      <div class="details-page">
        <Spin fix v-if="loading" />

        <template v-else-if="hasDetails">
          <article class="article-card">
            <header class="article-card__header">
              <div class="article-card__header-inner">
                <div class="article-card__tags" v-if="tagList.length">
                  <span v-for="tag in tagList" :key="tag"># {{ tag }}</span>
                </div>
                <h1>{{ details.title }}</h1>
                <div class="article-card__meta">
                  <span>
                    <Icon type="ios-time-outline" size="15" aria-hidden="true" />
                    {{ $t('help.updatedAt', { date: details.updated_at || '-' }) }}
                  </span>
                  <span>
                    <Icon type="md-thumbs-up" size="14" aria-hidden="true" />
                    {{ $t('help.recommendations', { count: details.resolved_nums || 0 }) }}
                  </span>
                  <span>
                    <Icon type="md-eye" size="15" aria-hidden="true" />
                    {{ $t('help.views', { count: details.view_nums || 0 }) }}
                  </span>
                </div>
              </div>
            </header>

            <div class="article-card__body">
              <div class="article-card__content" v-if="details.content">
                <TextContent
                  :key="details.id || route.params.id"
                  :data="details.content"
                  :title="$t('help.articleContent')"
                />
              </div>
              <div class="article-card__content-empty" v-else>
                {{ $t('help.noContent') }}
              </div>
            </div>

            <footer class="article-card__footer">
              <section class="article-feedback" aria-labelledby="article-feedback-title">
                <div class="article-feedback__copy">
                  <h2 id="article-feedback-title">{{ $t('help.feedbackQuestion') }}</h2>
                  <p>
                    {{ $t('help.feedbackTip') }}
                    <button v-if="customerUrl" type="button" @click="handlGoCustomer">
                      {{ $t('help.contactSupport') }}
                    </button>
                  </p>
                </div>
                <div class="article-feedback__actions">
                  <Button
                    :type="details.helpResolved === 1 ? 'success' : 'default'"
                    :icon="details.helpResolved === 1 ? 'ios-thumbs-up' : 'ios-thumbs-up-outline'"
                    :loading="feedbackLoading && pendingFeedback === 1"
                    :disabled="feedbackLoading"
                    :aria-pressed="details.helpResolved === 1"
                    @click="helpResolvedBtn(1)"
                  >
                    {{ $t('help.helpful') }}
                  </Button>
                  <Button
                    :type="details.helpResolved === 0 ? 'error' : 'default'"
                    :icon="details.helpResolved === 0 ? 'ios-thumbs-down' : 'ios-thumbs-down-outline'"
                    :loading="feedbackLoading && pendingFeedback === 0"
                    :disabled="feedbackLoading"
                    :aria-pressed="details.helpResolved === 0"
                    @click="helpResolvedBtn(0)"
                  >
                    {{ $t('help.notHelpful') }}
                  </Button>
                </div>
              </section>

              <nav class="article-nav" :aria-label="$t('help.articleNavigation')">
                <router-link
                  v-if="details.prev?.id"
                  replace
                  class="article-nav__item article-nav__item--prev"
                  :to="{ name: 'helpDetails', params: { id: details.prev.id } }"
                >
                  <Icon type="ios-arrow-back" size="18" aria-hidden="true" />
                  <span>
                    <small>{{ $t('help.previousArticle') }}</small>
                    <strong>{{ details.prev.title }}</strong>
                  </span>
                </router-link>
                <div v-else class="article-nav__item article-nav__item--disabled">
                  <Icon type="ios-arrow-back" size="18" aria-hidden="true" />
                  <span>
                    <small>{{ $t('help.previousArticle') }}</small>
                    <strong>{{ $t('help.noMoreArticles') }}</strong>
                  </span>
                </div>

                <router-link
                  v-if="details.next?.id"
                  replace
                  class="article-nav__item article-nav__item--next"
                  :to="{ name: 'helpDetails', params: { id: details.next.id } }"
                >
                  <span>
                    <small>{{ $t('help.nextArticle') }}</small>
                    <strong>{{ details.next.title }}</strong>
                  </span>
                  <Icon type="ios-arrow-forward" size="18" aria-hidden="true" />
                </router-link>
                <div v-else class="article-nav__item article-nav__item--next article-nav__item--disabled">
                  <span>
                    <small>{{ $t('help.nextArticle') }}</small>
                    <strong>{{ $t('help.noMoreArticles') }}</strong>
                  </span>
                  <Icon type="ios-arrow-forward" size="18" aria-hidden="true" />
                </div>
              </nav>
            </footer>
          </article>

          <section class="recommend-card" v-if="recommends.length">
            <div class="recommend-card__header">
              <div>
                <h2>{{ $t('help.relatedArticles') }}</h2>
                <p>{{ $t('help.relatedArticlesTip') }}</p>
              </div>
              <button
                class="recommend-card__refresh"
                type="button"
                :disabled="iconLoad"
                @click="getRandomList"
              >
                <Icon type="md-refresh" size="16" :class="{ 'icon-load': iconLoad }" aria-hidden="true" />
                <span>{{ iconLoad ? $t('help.loading') : $t('help.refresh') }}</span>
              </button>
            </div>

            <div class="recommend-card__list" v-if="recommends.length">
              <router-link
                v-for="item in recommends"
                :key="item.id"
                replace
                :to="{ name: 'helpDetails', params: { id: item.id } }"
              >
                <span>{{ item.title }}</span>
                <Icon type="ios-arrow-forward" size="16" aria-hidden="true" />
              </router-link>
            </div>
          </section>
        </template>

        <div class="details-empty" v-else>
          <UiEmptyBox :text="$t('help.articleNotFound')" />
        </div>
      </div>
    </div>
  </UiPage>
</template>

<script setup>
import Cookies from 'js-cookie'
import { computed, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useRoute, useRouter } from 'vue-router'
import { helpApi } from '@/api'
import TextContent from '@/components/TextContent/index.vue'
import { useAppStore } from '@/store/app.js'
import { confirm, getApi, message, t } from '@/utils'
import { isPhone } from '@/utils/device.js'

const props = defineProps({
  category: {
    type: Array,
    default: () => [],
  },
})

const route = useRoute()
const router = useRouter()
const appStore = useAppStore()
const { customerUrl } = storeToRefs(appStore)

const details = ref({})
const recommends = ref([])
const loading = ref(false)
const iconLoad = ref(false)
const feedbackLoading = ref(false)
const pendingFeedback = ref(null)
let detailRequestId = 0
let recommendRequestId = 0

const hasDetails = computed(() => Boolean(details.value?.title || details.value?.content))

const categoryName = computed(() => {
  const category = props.category.find(
    (item) => String(item.id) === String(details.value?.cate_id)
  )
  return category?.title || details.value?.category?.title || t('help.helpList')
})

const tagList = computed(() => {
  const tags = details.value?.tags
  if (Array.isArray(tags)) return tags.filter(Boolean)
  if (typeof tags !== 'string') return []
  return tags.split(',').map((tag) => tag.trim()).filter(Boolean)
})

const normalizeFeedback = (value) => {
  if (value === null || value === undefined || value === '') return null
  const normalized = Number(value)
  return normalized === 0 || normalized === 1 ? normalized : null
}

const handlGoCustomer = () => {
  if (!customerUrl.value) return
  const popup = window.open(customerUrl.value, '_blank', 'noopener,noreferrer')
  if (popup) popup.opener = null
}

const submitFeedback = async (resolved) => {
  pendingFeedback.value = resolved
  feedbackLoading.value = true
  try {
    await helpApi.userHelpResolved({
      id: route.params.id,
      is_resolved: resolved,
    })
    details.value.helpResolved = resolved
    message(t('help.feedbackSuccess'))
  } catch (error) {
    // 请求层已统一展示错误信息，此处仅保证交互状态可以恢复。
  } finally {
    feedbackLoading.value = false
    pendingFeedback.value = null
  }
}

const helpResolvedBtn = (resolved) => {
  if (details.value.helpResolved === resolved || feedbackLoading.value) return

  if (!Cookies.get('token')) {
    confirm(t('help.loginToFeedback'), { okText: t('help.goToLogin') }).then(() => {
      router.push({ name: 'login' })
    })
    return
  }

  if (details.value.helpResolved === 0 || details.value.helpResolved === 1) {
    confirm(t('help.changeFeedback')).then(() => {
      submitFeedback(resolved)
    })
    return
  }

  submitFeedback(resolved)
}

const getDetails = async () => {
  const requestId = ++detailRequestId
  const id = route.params.id
  loading.value = true
  details.value = {}

  try {
    const response = await helpApi.helpDetail({ id })
    if (requestId !== detailRequestId) return
    details.value = {
      ...(response || {}),
      helpResolved: normalizeFeedback(response?.resolved?.[0]?.is_resolved),
    }
  } catch (error) {
    if (requestId === detailRequestId) details.value = {}
  } finally {
    if (requestId === detailRequestId) loading.value = false
  }
}

const getRandomList = async () => {
  const requestId = ++recommendRequestId
  iconLoad.value = true
  try {
    const response = await getApi('help/randomList', {
      id: route.params.id,
      limit: 8,
    })
    if (requestId !== recommendRequestId) return
    recommends.value = Array.isArray(response) ? response : (response?.data || [])
  } catch (error) {
    if (requestId === recommendRequestId) recommends.value = []
  } finally {
    if (requestId === recommendRequestId) iconLoad.value = false
  }
}

watch(
  () => route.params.id,
  (id, oldId) => {
    if (!id) return
    if (oldId) window.scrollTo({ top: 0, behavior: 'smooth' })
    recommends.value = []
    getDetails()
    getRandomList()
  },
  { immediate: true }
)
</script>

<style scoped lang="less">
@import './style.less';

.pageWidth {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin: var(--ui-margin-16-auto) !important;
}

.details-page {
  position: relative;
  min-height: 420px;
}

.article-card,
.recommend-card,
.details-empty {
  overflow: hidden;
  border-radius: var(--ui-radius-lg);
  background: #fff;
  box-shadow: 0 4px 16px rgba(31, 45, 77, 0.03);
}

.article-card {
  border: 1px solid #e6ebf3;
  box-shadow: 0 12px 32px rgba(31, 45, 77, 0.08);

  &__header {
    position: relative;
    overflow: hidden;
    padding: 32px 32px 24px;
    background:
      radial-gradient(circle at 88% 12%, rgba(43, 92, 217, 0.12), transparent 25%),
      linear-gradient(135deg, #f6f9ff 0%, #edf3fc 100%);

    &::before {
      position: absolute;
      top: 0;
      right: 0;
      width: 42%;
      height: 100%;
      background-image: radial-gradient(rgba(43, 92, 217, 0.12) 1px, transparent 1px);
      background-size: 16px 16px;
      content: '';
      mask-image: linear-gradient(to left, #000, transparent);
      pointer-events: none;
    }

    &-inner {
      position: relative;
      z-index: 1;
      margin: 0 auto;
    }

    h1 {
      max-width: 820px;
      margin: 12px 96px 0 0;
      color: #1f293b;
      font-size: 28px;
      font-weight: 600;
      line-height: 1.4;
      word-break: break-word;
    }
  }

  &__eyebrow {
    display: inline-flex;
    align-items: center;
    gap: 14px;
    margin-bottom: 12px;
    color: #50617a;
    font-size: 13px;
    font-weight: 600;
    line-height: 24px;
  }

  &__category-icon {
    display: inline-flex;
    width: var(--ui-size-28);
    height: var(--ui-size-28);
    align-items: center;
    justify-content: center;
    border: var(--ui-border-primary-soft);
    border-radius: var(--ui-radius-lg);
    background: rgba(255, 255, 255, 0.72);
    color: var(--primary-color);
  }

  &__decoration {
    position: absolute;
    right: 10px;
    bottom: 4px;
    display: inline-flex;
    width: 68px;
    height: 68px;
    align-items: center;
    justify-content: center;
    border: var(--ui-border-primary-soft);
    border-radius: var(--ui-radius-3xl);
    background: rgba(255, 255, 255, 0.54);
    box-shadow: 0 12px 28px rgba(43, 92, 217, 0.1);
    color: rgba(43, 92, 217, 0.5);
    transform: rotate(5deg);
  }

  &__tags {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;

    span {
      padding: var(--ui-padding-4-10);
      border: 1px solid #d8e3f8;
      border-radius: var(--ui-radius-6);
      background: rgba(255, 255, 255, 0.82);
      box-shadow: 0 1px 3px rgba(43, 92, 217, 0.06);
      color: var(--primary-color);
      font-size: 12px;
      font-weight: 600;
      line-height: 18px;
    }
  }

  &__summary {
    max-width: 800px;
    margin: var(--ui-margin-12-0-0);
    color: #68778e;
    font-size: 15px;
    line-height: 1.75;
  }

  &__meta {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 8px;
    margin-top:12px;
    color: #728199;
    font-size: 12px;
    padding-bottom: 16px;

    span {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      line-height: 20px;
      & + span::before {
        width: var(--ui-size-1);
        height: var(--ui-size-12);
        margin:var(--ui-margin-0-8);
        background: #cbd4e1;
        content: '';
      }
    }

    i {
      color: #8193ad;
    }

    strong {
      color: var(--ui-color-neutral-700);
      font-weight: 600;
      font-variant-numeric: tabular-nums;
    }
  }

  &__body {
    padding: 28px 32px;
    background: #fff;
    margin-top: -16px;
    position: relative;
    z-index: 2;
    border-radius: 16px 16px 0 0;
  }

  &__content {
    width: 100%;
    margin: 0 auto;

    :deep(iframe) {
      display: block;
    }
  }

  &__content-empty {
    display: flex;
    min-height: 180px;
    align-items: center;
    justify-content: center;
    color: var(--ui-color-text-secondary);
    font-size: 14px;
  }

  &__footer {
    padding: 0 32px 24px;
  }
}

.article-feedback {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 32px;
  padding: 22px 0;
  border-top: 1px solid #e8edf4;
  border-bottom: 1px solid #e8edf4;

  &__copy {
    min-width: 0;

    h2 {
      margin: 0;
      color: var(--ui-color-text);
      font-size: 15px;
      font-weight: 600;
      line-height: 1.5;
    }

    p {
      margin: var(--ui-margin-5-0-0);
      color: var(--ui-color-neutral-600);
      font-size: 13px;
      line-height: 1.6;
    }

    button {
      margin-left: 6px;
      padding: 0;
      border: 0;
      background: transparent;
      color: var(--primary-color);
      cursor: pointer;
      font: inherit;

      &:hover {
        text-decoration: underline;
      }

      &:focus-visible {
        border-radius: var(--ui-radius-3);
        outline: 3px solid rgba(43, 92, 217, 0.16);
        outline-offset: 2px;
      }
    }
  }

  &__actions {
    display: flex;
    flex: none;
    gap: 10px;

    :deep(.ivu-btn) {
      min-width: 88px;
      min-height: 40px;
      border-radius: var(--ui-radius-6);
    }
  }
}

.article-nav {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 24px;
  padding-top: 22px;

  &__item {
    display: flex;
    min-width: 0;
    min-height: 58px;
    align-items: center;
    gap: 12px;
    padding: 4px 0;
    color: #4f5e73;
    transition: color 180ms ease;

    > i {
      display: inline-flex;
      width: var(--ui-size-32);
      height: var(--ui-size-32);
      flex: none;
      align-items: center;
      justify-content: center;
      border-radius: var(--ui-radius-circle);
      background: #f4f6fa;
      color: #8794a8;
      transition: color 180ms ease, background-color 180ms ease;
    }

    span {
      display: flex;
      min-width: 0;
      flex: 1;
      flex-direction: column;
      gap: 3px;
    }

    small {
      color: #929fb1;
      font-size: 12px;
      line-height: 18px;
    }

    strong {
      overflow: hidden;
      font-size: 14px;
      font-weight: 600;
      line-height: 21px;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    &:not(.article-nav__item--disabled):hover {
      color: var(--primary-color);

      > i {
        background: #eef3ff;
        color: var(--primary-color);
      }
    }

    &--next {
      padding-left: 24px;
      border-left: 1px solid #e8edf4;
      text-align: right;
    }

    &--disabled {
      color: #a8b2c1;
      cursor: default;
      opacity: 0.64;
    }
  }
}

.recommend-card {
  margin-top: 16px;
  padding: 26px 32px 28px;

  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    margin: 0 auto;

    h2 {
      margin: 0;
      color: #28344a;
      font-size: 18px;
      font-weight: 600;
      line-height: 1.5;
    }

    p {
      margin: var(--ui-margin-3-0-0);
      color: var(--ui-color-text-muted);
      font-size: 13px;
      line-height: 1.6;
    }
  }

  &__refresh {
    display: inline-flex;
    min-height: 36px;
    flex: none;
    align-items: center;
    gap: 5px;
    padding: var(--ui-padding-0-10);
    border: 0;
    border-radius: var(--ui-radius-6);
    background: #f3f6fc;
    color: var(--ui-color-neutral-700);
    cursor: pointer;
    font: inherit;
    font-size: 13px;
    transition: color 180ms ease, background-color 180ms ease;

    &:hover:not(:disabled) {
      background: #edf3ff;
      color: var(--primary-color);
    }

    &:disabled {
      cursor: wait;
      opacity: 0.68;
    }

    &:focus-visible {
      outline: 3px solid rgba(43, 92, 217, 0.16);
      outline-offset: 2px;
    }
  }

  &__list {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 8px 12px;
    margin: 18px auto 0;

    a {
      display: flex;
      min-width: 0;
      min-height: 48px;
      align-items: center;
      gap: 10px;
      padding: var(--ui-padding-10-12);
      border-radius: var(--ui-radius-6);
      background: #fafbfc;
      color: #46546a;
      font-size: 14px;
      line-height: 1.5;
      transition: color 180ms ease, background-color 180ms ease;

      span {
        display: -webkit-box;
        min-width: 0;
        flex: 1;
        overflow: hidden;
        -webkit-box-orient: vertical;
        -webkit-line-clamp: 2;
      }

      i {
        flex: none;
        color: #b0bac8;
      }

      &:hover {
        background: #f2f6ff;
        color: var(--primary-color);

        i {
          color: var(--primary-color);
        }
      }
    }
  }
}

.details-empty {
  min-height: 360px;
  padding: var(--ui-padding-48-24);
}

.icon-load {
  animation: icon-spin 800ms linear infinite;
}

@keyframes icon-spin {
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 767px) {
  .pageWidth {
    gap: 0;
    padding: 0;
    margin: 0 auto !important;
  }

  .article-card {
    border: 0;
    border-radius: 0;

    &__header {
      padding: 28px 20px 22px;

      h1 {
        margin-right: 0;
        margin-top: 8px;
        font-size: 23px;
        line-height: 1.42;
      }
    }

    &__eyebrow {
      margin-bottom: 10px;
    }

    &__decoration {
      display: none;
    }

    &__summary {
      margin-top: 8px;
      font-size: 14px;
    }

    &__meta {
      gap: 0;
      margin-top: 14px;

      span:first-child {
        width: 100%;
        margin-bottom: 6px;
      }

      span:nth-child(2)::before {
        display: none;
      }

      span:nth-child(3)::before {
        margin: var(--ui-margin-0-10);
      }
    }

    &__body {
      padding: 28px 20px 36px;
    }

    &__footer {
      padding: 0 20px 28px;
    }
  }

  .article-feedback {
    align-items: stretch;
    flex-direction: column;
    gap: 14px;
    padding: var(--ui-padding-20-0);

    &__actions {
      :deep(.ivu-btn) {
        min-height: 44px;
        flex: 1;
      }
    }
  }

  .article-nav {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 12px;
    padding-top: 8px;

    &__item {
      min-height: 72px;
      padding: var(--ui-padding-12-0);

      strong {
        display: block;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
    }

    &__item--next {
      padding-left: 12px;
      border-top: 0;
      border-left: 0;
      text-align: right;
    }
  }

  .recommend-card {
    padding: 18px 16px;

    &__header {
      align-items: flex-start;
    }

    &__list {
      grid-template-columns: 1fr;
      margin: 14px auto 0;
    }
  }
}

@media (prefers-reduced-motion: reduce) {
  .icon-load {
    animation-duration: 2s;
  }

  .article-nav__item,
  .recommend-card__refresh,
  .recommend-card__list a {
    transition-duration: 0.01ms;
  }
}
</style>
