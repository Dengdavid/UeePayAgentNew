<template>
  <section class="help-head" :aria-label="$t('help.searchRegion')">
    <div class="pageWidth help-head__content">
      <div class="help-head__intro">
        <h1>{{ $t('help.greeting') }}</h1>
        <p>{{ $t('help.searchTip') }}</p>
      </div>

      <div class="search-area">
        <form
          class="search-box"
          :class="{ 'search-box--active': hasSearched }"
          role="search"
          @submit.prevent="handleSearch"
        >
        <label class="sr-only" for="help-search-input">
          {{ $t('help.searchLabel') }}
        </label>
        <div
          class="search-box__submit"
          type="submit"
          :aria-label="$t('help.search')"
          :disabled="searchLoading"
        >
          <Icon type="ios-search" aria-hidden="true" />
        </div>
        <input
          id="help-search-input"
          ref="searchInput"
          v-model="searchValue"
          class="search-box__input"
          type="search"
          autocomplete="off"
          :placeholder="$t('help.searchPlaceholder')"
          aria-describedby="help-search-shortcut"
          @input="handleInput"
        />
        <button
          v-if="searchValue"
          class="search-box__clear"
          type="button"
          :aria-label="$t('help.clearSearch')"
          @click="clearSearch"
        >
          <Icon type="ios-close" aria-hidden="true" />
        </button>
        <kbd
          id="help-search-shortcut"
          class="search-box__shortcut"
          :title="$t('help.shortcutTip')"
          aria-hidden="true"
        >/</kbd>
        </form>
        <div class="hot-topics" aria-live="polite">
          <Icon type="md-flame" color="red"/>
          <span class="hot-topics__label">{{ $t('help.popularTitleLabel') }}</span>
          <div v-if="hotLoading" class="hot-topics__skeleton" :aria-label="$t('help.loadingPopular')">
            <span v-for="item in 4" :key="item"></span>
          </div>
          <div v-else-if="hotTopics.length" class="hot-topics__viewport">
            <div class="hot-topics__track">
              <ul class="hot-topics__list">
                <li v-for="item in hotTopics" :key="item.id">
                  <button type="button" @click="openArticle(item)">{{ item.title }}</button>
                </li>
              </ul>
              <ul class="hot-topics__list hot-topics__list--clone" aria-hidden="true">
                <li v-for="item in hotTopics" :key="`clone-${item.id}`">
                  <button type="button" tabindex="-1" @click="openArticle(item)">{{ item.title }}</button>
                </li>
              </ul>
            </div>
        </div>
        <div v-else-if="hotError" class="hot-topics__error">
          <span>{{ $t('help.popularFailed') }}</span>
          <button type="button" @click="loadHotTopics">{{ $t('help.retry') }}</button>
        </div>
        </div>
        <div
          v-if="hasSearched"
          class="search-results"
          aria-live="polite"
          aria-busy="searchLoading"
        >
        <div class="section-heading">
          <span class="section-heading__label">{{ $t('help.searchResults') }}</span>
          <span v-if="!searchLoading && !searchError" class="section-heading__count">
            {{ $t('help.resultCount', { count: searchResults.length }) }}
          </span>
        </div>

        <div v-if="searchLoading" class="result-skeleton" :aria-label="$t('help.searching')">
          <span v-for="item in 3" :key="item"></span>
        </div>

        <div v-else-if="searchError" class="result-state result-state--error" role="alert">
          <Icon type="ios-alert-outline" aria-hidden="true" />
          <div>
            <strong>{{ $t('help.searchFailed') }}</strong>
            <p>{{ $t('help.searchFailedTip') }}</p>
          </div>
          <button type="button" @click="handleSearch">{{ $t('help.retry') }}</button>
        </div>

        <ul v-else-if="searchResults.length" class="result-list">
          <li v-for="item in searchResults" :key="item.id">
            <div class="result-card" @click="openArticle(item)">
              <div class="list-b-4">
                <div v-if="item.category?.title" class="result-card__category">
                  {{ item.category.title }}
                </div>
                <div class="result-card__title">
                  <template v-for="(part, index) in highlightText(item.title, searchedKeyword)" :key="index">
                    <mark v-if="part.matched">{{ part.text }}</mark>
                    <span v-else>{{ part.text }}</span>
                  </template>
                </div>
                <div v-if="item.desc" class="result-card__desc">
                  <template v-for="(part, index) in highlightText(item.desc, searchedKeyword)" :key="index">
                    <mark v-if="part.matched">{{ part.text }}</mark>
                    <span v-else>{{ part.text }}</span>
                  </template>
                </div>
              </div>
              <Icon type="ios-arrow-forward" class="result-card__arrow" aria-hidden="true" />
            </div>
          </li>
        </ul>

        <div v-else class="result-state result-state--empty">
          <span class="result-state__icon" aria-hidden="true">
            <Icon type="ios-search" />
          </span>
          <strong>{{ $t('help.noResults') }}</strong>
          <p>{{ $t('help.noResultsTip') }}</p>
        </div>
        </div>
      </div>
    </div>
    <Aurora class="full" />
  </section>
</template>

<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { toRoute } from '@/utils/route.js'
import helpApi from '@/api/help.js'
import Aurora from '@/views/home/components/Aurora.vue'

const searchInput = ref(null)
const searchValue = ref('')
const searchedKeyword = ref('')
const searchResults = ref([])
const searchLoading = ref(false)
const searchError = ref(false)
const hasSearched = ref(false)
const hotTopics = ref([])
const hotLoading = ref(false)
const hotError = ref(false)

let searchRequestId = 0
let searchTimer = null

const getList = (response) => {
  if (Array.isArray(response)) return response
  return Array.isArray(response?.data) ? response.data : []
}

const loadHotTopics = async () => {
  hotLoading.value = true
  hotError.value = false
  try {
    const response = await helpApi.helpList({ page: 1, isTag: true, limit: 8 })
    hotTopics.value = getList(response).slice(0, 8)
  } catch (error) {
    hotTopics.value = []
    hotError.value = true
  } finally {
    hotLoading.value = false
  }
}

const handleSearch = async () => {
  window.clearTimeout(searchTimer)
  const keyword = searchValue.value.trim()
  if (!keyword) {
    searchInput.value?.focus()
    return
  }

  const requestId = ++searchRequestId
  searchedKeyword.value = keyword
  hasSearched.value = true
  searchLoading.value = true
  searchError.value = false

  try {
    const response = await helpApi.helpList({ page: 1, keyword, limit: 20 })
    if (requestId !== searchRequestId) return
    searchResults.value = getList(response)
  } catch (error) {
    if (requestId !== searchRequestId) return
    searchResults.value = []
    searchError.value = true
  } finally {
    if (requestId === searchRequestId) searchLoading.value = false
  }
}

const handleInput = () => {
  window.clearTimeout(searchTimer)
  const keyword = searchValue.value.trim()

  if (keyword) {
    searchRequestId += 1
    searchedKeyword.value = keyword
    hasSearched.value = true
    searchResults.value = []
    searchLoading.value = true
    searchError.value = false
    searchTimer = window.setTimeout(handleSearch, 320)
    return
  }

  searchRequestId += 1
  hasSearched.value = false
  searchedKeyword.value = ''
  searchResults.value = []
  searchLoading.value = false
  searchError.value = false
}

const clearSearch = () => {
  searchValue.value = ''
  handleInput()
  searchInput.value?.focus()
}

const highlightText = (text, keyword) => {
  const source = String(text || '')
  const query = String(keyword || '').trim()
  if (!query) return [{ text: source, matched: false }]

  const lowerSource = source.toLocaleLowerCase()
  const lowerQuery = query.toLocaleLowerCase()
  const parts = []
  let cursor = 0
  let index = lowerSource.indexOf(lowerQuery)

  while (index !== -1) {
    if (index > cursor) parts.push({ text: source.slice(cursor, index), matched: false })
    parts.push({ text: source.slice(index, index + query.length), matched: true })
    cursor = index + query.length
    index = lowerSource.indexOf(lowerQuery, cursor)
  }

  if (cursor < source.length) parts.push({ text: source.slice(cursor), matched: false })
  return parts.length ? parts : [{ text: source, matched: false }]
}

const openArticle = (item) => {
  if (!item?.id) return
  toRoute('helpDetails', { id:item.id }, 'params')
}

const handleShortcut = (event) => {
  if (event.key !== '/' || event.metaKey || event.ctrlKey || event.altKey) return

  const target = event.target
  const isEditing = target instanceof HTMLElement && (
    target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)
  )
  if (isEditing) return

  event.preventDefault()
  const input = searchInput.value
  if (!input) return

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  input.focus({ preventScroll: true })
  input.scrollIntoView({
    behavior: prefersReducedMotion ? 'auto' : 'smooth',
    block: 'center',
    inline: 'nearest',
  })
}

onMounted(() => {
  loadHotTopics()
  window.addEventListener('keydown', handleShortcut)
})

onBeforeUnmount(() => {
  window.clearTimeout(searchTimer)
  searchRequestId += 1
  window.removeEventListener('keydown', handleShortcut)
})
</script>

<style scoped lang="less">
@import '../style.less';

.help-head {
  position: relative;
  z-index: 2;
  overflow: visible;
  background: linear-gradient(180deg, #eef5fe 0%, #f8fbff 72%, #ffffff 100%);
  color: var(--ui-color-text);

  :deep(.full) {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 0;
  }

  &__content {
    position: relative;
    z-index: 1;
    padding: 48px 24px 52px;
  }

  &__intro {
    max-width: 760px;
    margin: 0 auto;
    text-align: center;

    h1 {
      margin: var(--ui-margin-0-0-8);
      color: var(--ui-color-text);
      font-size: clamp(26px, 3vw, 34px);
      font-weight: 400;
      letter-spacing: 0.01em;
      line-height: 1.35;
    }

    p {
      margin: 0;
      color: var(--ui-color-neutral-700);
      font-size: 15px;
      line-height: 1.7;
    }
  }
}

.search-area {
  position: relative;
  width: min(780px, 100%);
  margin: 30px auto 0;
}

.search-box {
  display: flex;
  align-items: center;
  width: 100%;
  min-height: 58px;
  margin: 0;
  padding: 5px 12px;
  border: 1px solid #d7e2f2;
  border-radius: var(--ui-radius-xl);
  background: #fff;
  box-shadow: 0 10px 28px rgba(54, 92, 157, 0.11);
  transition: border-color 180ms ease, box-shadow 180ms ease;

  &:focus-within {
    border-color: #7f9dde;
    box-shadow: 0 0 0 3px rgba(43, 92, 217, 0.12), 0 12px 30px rgba(54, 92, 157, 0.14);
  }

  &--active {
    border-color: #b7caed;
  }

  &__submit,
  &__clear {
    display: grid;
    width: var(--ui-size-44);
    height: var(--ui-size-44);
    flex: 0 0 44px;
    place-items: center;
    border: 0;
    border-radius: var(--ui-radius-circle);
    background: transparent;
    color: #8294b2;
    cursor: pointer;
    font-size: 23px;
    transition: color 180ms ease, background-color 180ms ease;

    &:hover:not(:disabled) {
      background: #f1f4f8;
      color: var(--ui-color-primary);
    }

    &:focus-visible {
      outline: 3px solid rgba(43, 92, 217, 0.24);
    }

    &:disabled {
      cursor: wait;
    }
  }

  &__submit {
    width: var(--ui-size-40);
    height: var(--ui-size-40);
    flex-basis: 40px;
  }

  &__clear {
    width: var(--ui-size-36);
    height: var(--ui-size-36);
    flex-basis: 36px;
    font-size: 20px;
  }

  &__input {
    min-width: 0;
    flex: 1;
    height: var(--ui-size-46);
    padding: var(--ui-padding-0-10);
    border: 0;
    outline: 0;
    background: transparent;
    color: #25314a;
    font: inherit;
    font-size: 16px;

    &::placeholder {
      color: var(--ui-color-text-muted);
    }

    &::-webkit-search-cancel-button {
      display: none;
    }
  }

  &__shortcut {
    display: grid;
    width: var(--ui-size-30);
    height: var(--ui-size-30);
    flex: 0 0 30px;
    place-items: center;
    margin-left: 4px;
    border: 1px solid #dfe5ee;
    border-bottom-width: 2px;
    border-radius: var(--ui-radius-md);
    background: #f8fafc;
    box-shadow: 0 1px 0 rgba(31, 42, 68, 0.04);
    color: #8290a7;
    font-family: inherit;
    font-size: 13px;
  }

  &__loading {
    animation: spin 0.8s linear infinite;
  }
}

.search-results {
  position: absolute;
  z-index: 20;
  top: 68px;
  left: 0;
  width: 100%;
  margin: 0;
  padding: 0;
  overflow: hidden;
  overscroll-behavior: contain;
  border-radius: var(--ui-radius-xl);
  background: #fff;
  color: var(--ui-color-text);
  box-shadow: 0 16px 38px rgba(43, 73, 126, 0.16);
}

.section-heading {
  position: sticky;
  z-index: 2;
  top: 0;
  display: flex;
  min-height: 42px;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin: 0;
  padding: 7px 14px;
  border-bottom: 1px solid #e8edf5;
  background: rgba(249, 251, 254, 0.98);

  &__label {
    display: inline-flex;
    align-items: center;
    gap: 7px;
    color: #65748a;
    font-size: 12px;
    font-weight: 600;
    letter-spacing: 0.02em;

    &::before {
      width: var(--ui-size-4);
      height: var(--ui-size-4);
      border-radius: var(--ui-radius-circle);
      background: var(--ui-color-primary);
      content: '';
    }
  }

  &__count {
    padding: var(--ui-padding-4-8);
    border-radius: var(--ui-radius-md);
    background: #eef3ff;
    color: #315bb9;
    font-size: 12px;
    font-variant-numeric: tabular-nums;
  }
}

.result-list {
  max-height: 400px;
  margin: 0;
  padding: 0;
  overflow-y: auto;
  list-style: none;

  li + li {
    border-top: 1px solid #e8edf5;
  }
}

.result-card {
  position: relative;
  width: 100%;
  gap: 4px 16px;
  padding: 13px 52px 13px 16px;
  border: 0;
  border-radius: 0;
  background: transparent;
  color: inherit;
  cursor: pointer;
  font: inherit;
  text-align: left;
  transition: background-color 160ms ease;
  &:hover { background: #f7faff; }
  &:focus-visible { outline: 3px solid rgba(43, 92, 217, 0.22); outline-offset: -2px; }

  &:hover &__arrow {
    background: #eaf1ff;
    color: #214fc4;
    transform: translateY(-50%) translateX(2px);
  }
  &__category {
    width: max-content;
    grid-column: 1;
    padding:var(--ui-padding-4-6);
    border-radius: var(--ui-radius-sm);
    background: #eef4ff;
    color: var(--ui-color-primary);
    font-size: 12px;
    line-height: 1;
  }
  &__title {
    color: var(--ui-color-text);
    font-size: 14px;
    font-weight: 600;
    line-height: 1.32;
  }

  &__desc {
    overflow: hidden;
    color: var(--ui-color-text-secondary);
    font-size: 12px;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__arrow {
    position: absolute;
    top: 50%;
    right: 14px;
    display: grid;
    width: var(--ui-size-28);
    height: var(--ui-size-28);
    place-items: center;
    border-radius: var(--ui-radius-circle);
    color: #7f92b2;
    font-size: 16px;
    transform: translateY(-50%);
    transition: color 160ms ease, background-color 160ms ease, transform 160ms ease;
  }
}

mark {
  padding: 0;
  background: transparent;
  color: var(--ui-color-primary);
  font-weight: 600;
}

.result-state {
  display: flex;
  min-height: 180px;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  strong {
    margin-top: 12px;
    color: #27344d;
    font-size: 16px;
  }

  p {
    margin: var(--ui-margin-6-0-0);
    color: #6d7a90;
    line-height: 1.6;
  }

  &__icon {
    display: grid;
    width: var(--ui-size-48);
    height: var(--ui-size-48);
    place-items: center;
    border-radius: var(--ui-radius-circle);
    background: #eaf0ff;
    color: var(--ui-color-primary);
    font-size: 23px;
  }

  &--error {
    min-height: 130px;
    flex-direction: row;
    gap: 14px;
    text-align: left;

    > i {
      color: #c4513b;
      font-size: 28px;
    }

    strong {
      display: block;
      margin: 0;
    }

    button {
      min-height: 44px;
      margin-left: auto;
      padding: var(--ui-padding-0-16);
      border: 1px solid #cfd8e8;
      border-radius: var(--ui-radius-7);
      background: #fff;
      color: var(--ui-color-primary);
      cursor: pointer;
    }
  }
}

.result-skeleton {
  display: grid;
  gap: 12px;
  padding: var(--ui-padding-14);

  span {
    height: var(--ui-size-64);
    border-radius: var(--ui-radius-lg);
    background: linear-gradient(90deg, #f1f4f8 25%, #f8fafc 50%, #f1f4f8 75%);
    background-size: 200% 100%;
    animation: shimmer 1.3s ease-in-out infinite;
  }
}

.hot-topics {
  display: flex;
  width: min(780px, 100%);
  min-height: 32px;
  align-items: center;
  justify-content: center;
  gap:4px;
  margin: 10px auto 0;
  color: #7b899f;
  font-size: 13px;
  line-height: 28px;

  &__label {
    flex: 0 0 auto;
    color: var(--ui-color-text-muted);
  }

  &__viewport {
    min-width: 0;
    flex: 1;
    overflow: hidden;
  }

  &__track {
    display: flex;
    width: max-content;
    align-items: center;
    animation: hot-topics-scroll 32s linear infinite;
    will-change: transform;

    &:hover,
    &:focus-within {
      animation-play-state: paused;
    }
  }

  &__list {
    display: flex;
    flex: 0 0 auto;
    align-items: center;
    justify-content: flex-start;
    gap: 18px;
    margin: 0;
    padding: 0 18px 0 0;
    list-style: none;

    li {
      flex: 0 0 auto;
    }

    button {
      display: block;
      min-height: 28px;
      padding: 0;
      border: 0;
      background: transparent;
      color: #526784;
      cursor: pointer;
      font: inherit;
      text-align: center;
      white-space: nowrap;
      transition: color 180ms ease;

      &:hover {
        color: var(--ui-color-primary);
      }

      &:focus-visible {
        border-radius: var(--ui-radius-3);
        outline: 2px solid rgba(43, 92, 217, 0.42);
        outline-offset: 2px;
      }
    }
  }

  &__skeleton {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 18px;

    span {
      width: var(--ui-size-84);
      height: var(--ui-size-12);
      border-radius: var(--ui-radius-sm);
      background: linear-gradient(90deg, rgba(126, 143, 171, 0.12), rgba(126, 143, 171, 0.28), rgba(126, 143, 171, 0.12));
      background-size: 200% 100%;
      animation: shimmer 1.3s ease-in-out infinite;
    }
  }

  &__error {
    display: flex;
    align-items: center;
    gap: 8px;
    color: #7e8ba0;

    button {
      min-height: 28px;
      padding: 0;
      border: 0;
      background: transparent;
      color: var(--ui-color-primary);
      cursor: pointer;
      font: inherit;
    }
  }
}

.sr-only {
  position: absolute;
  width: var(--ui-size-1);
  height: var(--ui-size-1);
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  clip-path: inset(50%);
  white-space: nowrap;
}

@keyframes spin { to { transform: rotate(360deg); } }
@keyframes shimmer { to { background-position: -200% 0; } }
@keyframes hot-topics-scroll {
  to { transform: translateX(-50%); }
}
@keyframes result-panel-enter {
  from { opacity: 0; transform: translateY(-4px); }
  to { opacity: 1; transform: translateY(0); }
}

@media (max-width: 767px) {
  .help-head {
    &__content {
      padding: 36px 16px 24px;
    }

    &__intro {
      h1 {
        margin: var(--ui-margin-0-0-8);
        font-size: 26px;
      }

      p {
        font-size: 14px;
      }
    }
  }

  .search-area {
    margin-top: 24px;
  }

  .search-box {
    min-height: 54px;
    padding: var(--ui-padding-4-10);
    border-radius: var(--ui-radius-lg);

    &__input {
      height: var(--ui-size-44);
      padding: var(--ui-padding-0-8);
    }

    &__submit {
      width: var(--ui-size-40);
      height: var(--ui-size-44);
      flex-basis: 40px;
    }

    &__shortcut {
      display: none;
    }
  }

  .hot-topics {
    min-height: 32px;
    gap: 10px;
    margin-top: 10px;
    line-height: 24px;

    &__list {
      gap: 16px;
      padding-right: 16px;

      button {
        min-height: 24px;
        text-align: left;
      }
    }

    &__skeleton {
      min-width: 0;
      flex: 1;
      justify-content: flex-start;
      gap: 14px;
      overflow: hidden;

      span {
        flex: 0 0 72px;
      }
    }
  }

  .search-results {
    top: 62px;
    max-height: 400px;
    border-radius: var(--ui-radius-lg);
  }

  .result-card {
    padding-right: 34px;
    padding-left: 8px;

    &__desc {
      display: -webkit-box;
      white-space: normal;
      -webkit-box-orient: vertical;
      -webkit-line-clamp: 2;
    }
  }

  .result-state {
    &--error {
      align-items: flex-start;
      flex-direction: column;

      button {
        margin-left: 42px;
      }
    }
  }
}

@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    scroll-behavior: auto !important;
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }

  .hot-topics {
    &__viewport {
      overflow-x: auto;
      scrollbar-width: none;

      &::-webkit-scrollbar {
        display: none;
      }
    }

    &__track {
      animation: none !important;
    }

    &__list--clone {
      display: none;
    }
  }
}
</style>
