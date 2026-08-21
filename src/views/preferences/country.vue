<template>
  <UiPage
    ref="pageRef"
    isAuto
    isNotTitle
    :page-right-title="$t('header.preferences.currentSettings')"
  >
    <section class="country-list" :aria-label="$t('header.preferences.countryList')">
      <div
        v-if="recommendedCountries.length"
        class="country-recommendation"
        :aria-label="$t('header.preferences.recommendedCountry')"
      >
        <div class="country-recommendation__header">
          <strong>{{ $t('header.preferences.recommendedCountry') }}</strong>
        </div>
        <div class="country-recommendation__grid">
          <div
            v-for="item in recommendedCountries"
            :key="item.code"
            class="country-item country-recommendation__item"
            :class="{ active: pendingCountryCode === item.code }"
            role="button"
            tabindex="0"
            :aria-pressed="pendingCountryCode === item.code"
            @click="handleSelect(item.code)"
            @keydown.enter.prevent="handleSelect(item.code)"
            @keydown.space.prevent="handleSelect(item.code)"
          >
            <img :src="item.flag" alt="" loading="lazy" decoding="async" />
            <strong :title="countryName(item)">
              {{ countryName(item) }}
            </strong>
            <small :title="displayLanguageName(item)">
              {{ displayLanguageName(item) }}
            </small>
          </div>
        </div>
      </div>

      <div
        v-for="group in groupedCountries"
        :key="group.region"
        class="country-region"
      >
        <h2
          class="country-region__title"
          :class="{ collapsed: isRegionCollapsed(group.region) }"
        >
          <button
            type="button"
            :aria-expanded="!isRegionCollapsed(group.region)"
            :aria-controls="`country-region-${group.region}`"
            @click="toggleRegion(group.region)"
          >
            <span>{{ regionLabel(group.region) }}</span>
            <Icon
              type="ios-arrow-down"
              :size="16"
              class="country-region__arrow"
              :class="{ collapsed: isRegionCollapsed(group.region) }"
            />
          </button>
        </h2>
        <div
          v-show="!isRegionCollapsed(group.region)"
          :id="`country-region-${group.region}`"
          class="country-grid"
        >
          <div
            v-for="item in group.items"
            :key="item.code"
            class="country-item"
            :class="{ active: pendingCountryCode === item.code }"
            role="button"
            tabindex="0"
            :aria-pressed="pendingCountryCode === item.code"
            @click="handleSelect(item.code)"
            @keydown.enter.prevent="handleSelect(item.code)"
            @keydown.space.prevent="handleSelect(item.code)"
          >
            <img :src="item.flag" alt="" loading="lazy" decoding="async" />
            <strong :title="countryName(item)">{{ countryName(item) }}</strong>
            <small :title="displayLanguageName(item)">{{ displayLanguageName(item) }}</small>
          </div>
        </div>
      </div>
    </section>

    <template #pageRight>
      <aside class="country-summary">
        <h2>{{ $t('header.preferences.currentSettings') }}</h2>

        <div class="country-summary__country">
          <img :src="pendingCountry.flag" alt="" loading="lazy" decoding="async" />
          <div>
            <strong>{{ countryName(pendingCountry) }}</strong>
            <small>{{ pendingCountry.code }} / {{ pendingCountry.alpha3 }}</small>
          </div>
        </div>

        <Form
          class="country-summary__form"
          :model="preferenceForm"
          label-position="top"
        >
          <FormItemBox
            :label="$t('header.preferences.language')"
            prop="language"
          >
            <FormSelectBox
              v-model="preferenceForm.language"
              :options="languageOptions"
              :clearable="false"
              :disabled="saving || optionsLoading || languageOptions.length === 0"
              :loading="optionsLoading"
              :placeholder="$t('header.preferences.languagePlaceholder')"
              :not-found-text="$t('header.preferences.noLanguage')"
            />
          </FormItemBox>

          <FormItemBox
            :label="$t('header.preferences.timezone')"
            prop="timezone"
          >
            <FormSelectBox
              v-model="preferenceForm.timezone"
              :options="timezoneOptions"
              :clearable="false"
              :disabled="saving || optionsLoading || timezoneOptions.length === 0"
              :loading="optionsLoading"
              option-label-key="label"
              :placeholder="$t('header.preferences.timezonePlaceholder')"
              :not-found-text="$t('header.preferences.noTimezone')"
            >
              <template #default="{ row: item }">
                <div class="timezone-option">
                  <span>{{ item.label }}</span>
                  <small v-if="item.offset">{{ item.offset }}</small>
                </div>
              </template>
            </FormSelectBox>
          </FormItemBox>
        </Form>

        <p class="country-summary__hint">
          {{ $t('header.preferences.countrySaveHint') }}
        </p>

        <Button
          type="primary"
          long
          :loading="saving"
          :disabled="!canSave"
          @click="handleSave"
        >
          {{ $t('button.save') }}
        </Button>
      </aside>
    </template>
  </UiPage>
</template>

<script setup>
import userApi from '@/api/user.js'
import countries from '@/config/countries.json'
import {
  DEFAULT_LOCALE,
  FALLBACK_LOCALE,
  locale,
  normalizeLocale,
  setData,
} from '@/locales/set.js'
import { activateLocaleMessages } from '@/locales/index.js'
import { useUserStoreRefs } from '@/utils/store.js'
import {
  DEFAULT_COUNTRY,
  DEFAULT_TIMEZONE,
  applyPreferences,
  country,
  getCachedCountry,
  getCachedLocale,
  getCachedTimezone,
  getCountryConfig,
  normalizeTimezone,
  timezone,
} from '@/utils/preferences.js'
import {
  clearPreferencesPendingSync,
  markPreferencesPendingSync,
} from '@/utils/preferences-storage.js'
import { goBack } from '@/utils/route.js'
import { message } from '@/utils/message.js'
import { t } from '@/utils/index.js'
import { computed, onMounted, reactive, ref, watch } from 'vue'

const disabledCountryCodes = new Set(['IR', 'KP', 'SY', 'CU', 'RU', 'UA', 'VE', 'AF', 'BY'])
const FALLBACK_TIMEZONE = 'America/New_York'
const isCountryEnabled = countryCode => !disabledCountryCodes.has(countryCode)
const resolveEnabledCountry = (value) => {
  const countryCode = String(value || '').trim().toUpperCase()
  return countries.some(item => item.code === countryCode) && isCountryEnabled(countryCode)
    ? countryCode
    : DEFAULT_COUNTRY
}

const { isLogin } = useUserStoreRefs()
const pageRef = ref(null)
const pendingCountryCode = ref(resolveEnabledCountry(country.value))
const saving = ref(false)
const optionsLoading = ref(false)
const selectionChanged = ref(false)
const collapsedRegions = ref(new Set())
const preferenceForm = reactive({
  language: normalizeLocale(locale.value) || DEFAULT_LOCALE,
  timezone: normalizeTimezone(timezone.value) || getCountryConfig(pendingCountryCode.value).timezone,
})

const regionOrder = [
  'Asia',
  'Europe',
  'Africa',
  'America',
  'Pacific',
  'Indian',
  'Atlantic',
  'Antarctica',
]
const recommendedCountryCodes = [
  'TW', 'US', 'GB',
  'SG', 'JP', 'KR',
  'AE', 'CA', 'AU',
  'FR', 'DE', 'ES',
]

const countryName = item => t(item.name_key) || item.name
const regionLabel = value => t(`header.preferences.regions.${value.toLowerCase()}`) || value
const enabledLocaleMap = new Map(
  setData.map(item => [item.value.toLowerCase(), item.value])
)

const getLanguagePayload = result => (
  result?.list ||
  result?.data?.list ||
  result?.languages ||
  result?.data?.languages ||
  result?.data ||
  result ||
  []
)

const normalizeLanguageOptions = (result) => {
  const payload = getLanguagePayload(result)
  const source = Array.isArray(payload)
    ? payload
    : Object.keys(payload || {}).map(locale => ({ locale }))
  const availableLocales = new Set()

  source.forEach((item) => {
    const locale = typeof item === 'string'
      ? item
      : item.locale
    const localeKey = typeof locale === 'string'
      ? locale.trim().replaceAll('_', '-').toLowerCase()
      : ''
    const enabledLocale = enabledLocaleMap.get(localeKey)
    if (enabledLocale) availableLocales.add(enabledLocale)
  })

  return setData.filter(item => availableLocales.has(item.value))
}

const languageOptions = ref([])

const resolveSupportedLanguage = (value) => {
  const normalizedLanguage = normalizeLocale(value)
  return languageOptions.value.some(item => item.value === normalizedLanguage)
    ? normalizedLanguage
    : null
}
const displayLanguageName = (item) => {
  const supportedLanguage = resolveSupportedLanguage(item.language)
  return languageOptions.value.find(option => option.value === supportedLanguage)?.label
    || languageOptions.value.find(option => option.value === FALLBACK_LOCALE)?.label
    || 'English'
}
const resolveSystemLanguage = (value) => {
  const normalizedValue = normalizeLocale(value)
  if (
    normalizedValue &&
    languageOptions.value.some(item => item.value === normalizedValue)
  ) {
    return normalizedValue
  }

  return languageOptions.value.find(item => item.value === FALLBACK_LOCALE)?.value
    || languageOptions.value[0]?.value
    || ''
}

const applyCountryLanguage = (selectedCountry) => {
  preferenceForm.language = resolveSystemLanguage(selectedCountry.language)
}

const setSystemLanguageOptions = (options) => {
  languageOptions.value = options

  if (selectionChanged.value) {
    applyCountryLanguage(pendingCountry.value)
    return
  }

  preferenceForm.language = resolveSystemLanguage(preferenceForm.language)
}

const loadLanguages = async () => {
  const result = await userApi.getLanguages()
  const options = normalizeLanguageOptions(result)
  if (options.length === 0) throw new Error(t('header.preferences.noLanguage'))
  setSystemLanguageOptions(options)
}

const getTimezonePayload = result => (
  result?.list ||
  result?.data?.list ||
  result?.timezones ||
  result?.data?.timezones ||
  result?.data ||
  result ||
  []
)

const normalizeTimezoneOptions = (result) => {
  const payload = getTimezonePayload(result)
  const source = Array.isArray(payload)
    ? payload
    : Object.entries(payload || {}).map(([value, label]) => ({ value, label }))
  const valueMap = new Map()

  source.forEach((item) => {
    const value = typeof item === 'string'
      ? item
      : item.timezone || item.value || item.name || item.id
    const normalizedValue = normalizeTimezone(value)
    if (!normalizedValue || valueMap.has(normalizedValue)) return

    const offset = typeof item === 'object'
      ? item.utc_offset || item.offset || item.gmt_offset
      : ''
    const baseLabel = typeof item === 'string'
      ? item
      : item.label || item.display_name || item.name || normalizedValue
    const offsetText = String(offset || '').trim()
    const offsetLabel = offsetText && !offsetText.toUpperCase().startsWith('UTC')
      ? `UTC${offsetText}`
      : offsetText

    valueMap.set(normalizedValue, {
      label: String(baseLabel),
      offset: offsetLabel,
      value: normalizedValue,
    })
  })

  return [...valueMap.values()]
}

const timezoneOptions = ref([])
const timezoneReady = ref(false)

const resolveSystemTimezone = (value) => {
  const normalizedValue = normalizeTimezone(value)
  if (
    normalizedValue &&
    timezoneOptions.value.some(item => item.value === normalizedValue)
  ) {
    return normalizedValue
  }

  return timezoneOptions.value.find(item => item.value === DEFAULT_TIMEZONE)?.value
    || timezoneOptions.value[0]?.value
    || ''
}

const applyCountryTimezone = (selectedCountry) => {
  if (!timezoneReady.value) {
    preferenceForm.timezone = ''
    return
  }

  const supportedTimezone = normalizeTimezone(selectedCountry.timezone)
  const hasTimezone = timezoneOptions.value.some(
    item => item.value === supportedTimezone
  )
  preferenceForm.timezone = hasTimezone
    ? supportedTimezone
    : resolveSystemTimezone(FALLBACK_TIMEZONE)
}

const setSystemTimezoneOptions = (options) => {
  timezoneOptions.value = options
  timezoneReady.value = options.length > 0

  if (selectionChanged.value) {
    applyCountryTimezone(pendingCountry.value)
    return
  }

  preferenceForm.timezone = resolveSystemTimezone(preferenceForm.timezone)
}

const loadTimezones = async () => {
  const result = await userApi.getTimezones()
  const options = normalizeTimezoneOptions(result)
  if (options.length === 0) throw new Error(t('header.preferences.noTimezone'))
  setSystemTimezoneOptions(options)
}

const applyRemotePreferences = (result) => {
  if (selectionChanged.value) return

  const preferences = (
    result?.preferences ||
    result?.data?.preferences ||
    result?.data ||
    result ||
    {}
  )
  const countryCode = String(preferences.country || '').trim().toUpperCase()
  const resolvedCountry = resolveEnabledCountry(countryCode || country.value)
  const resolvedLanguage = preferences.language
    ? resolveSystemLanguage(preferences.language)
    : normalizeLocale(locale.value) || DEFAULT_LOCALE
  const resolvedTimezone = preferences.timezone
    ? resolveSystemTimezone(preferences.timezone)
    : normalizeTimezone(timezone.value) || DEFAULT_TIMEZONE

  pendingCountryCode.value = resolvedCountry
  preferenceForm.language = resolvedLanguage
  preferenceForm.timezone = resolvedTimezone

  const cacheChanged = (
    getCachedCountry() !== resolvedCountry ||
    getCachedLocale() !== resolvedLanguage ||
    getCachedTimezone() !== resolvedTimezone
  )
  if (cacheChanged) {
    applyPreferences({
      country: resolvedCountry,
      language: resolvedLanguage,
      timezone: resolvedTimezone,
    })
  }
}

const loadPreferenceOptions = async () => {
  optionsLoading.value = true
  try {
    const [languagesResult, timezonesResult, preferencesResult] = await Promise.allSettled([
      loadLanguages(),
      loadTimezones(),
      isLogin.value ? userApi.getPreferences() : Promise.resolve(null),
    ])

    if (languagesResult.status === 'rejected') {
      message(
        languagesResult.reason?.msg || t('header.preferences.languagesLoadFailed'),
        'error'
      )
    }
    if (timezonesResult.status === 'rejected') {
      message(
        timezonesResult.reason?.msg || t('header.preferences.timezonesLoadFailed'),
        'error'
      )
    }
    if (preferencesResult.status === 'fulfilled') {
      if (preferencesResult.value) applyRemotePreferences(preferencesResult.value)
    } else {
      message(
        preferencesResult.reason?.msg || t('header.preferences.loadFailed'),
        'error'
      )
    }
  } finally {
    optionsLoading.value = false
  }
}

const groupedCountries = computed(() => (
  regionOrder
    .map(region => ({
      region,
      items: countries
        .filter(item => item.region === region && isCountryEnabled(item.code))
        .sort((a, b) => a.code.localeCompare(b.code)),
    }))
    .filter(group => group.items.length > 0)
))

const countryMap = new Map(countries.map(item => [item.code, item]))
const recommendedCountries = computed(() => (
  recommendedCountryCodes
    .map(code => countryMap.get(code))
    .filter(item => item && isCountryEnabled(item.code))
))

const isRegionCollapsed = region => collapsedRegions.value.has(region)
const toggleRegion = (region) => {
  const nextRegions = new Set(collapsedRegions.value)
  if (nextRegions.has(region)) {
    nextRegions.delete(region)
  } else {
    nextRegions.add(region)
  }
  collapsedRegions.value = nextRegions
}

const pendingCountry = computed(() => getCountryConfig(pendingCountryCode.value))
const canSave = computed(() => (
  languageOptions.value.some(
    item => item.value === normalizeLocale(preferenceForm.language)
  ) &&
  timezoneOptions.value.some(
    item => item.value === normalizeTimezone(preferenceForm.timezone)
  )
))

const handleSelect = (countryCode) => {
  if (!isCountryEnabled(countryCode)) return

  pendingCountryCode.value = countryCode
  const selectedCountry = getCountryConfig(countryCode)

  applyCountryLanguage(selectedCountry)
  applyCountryTimezone(selectedCountry)

  selectionChanged.value = true
  pageRef.value?.openPageRight()
}

const handleSave = async () => {
  if (!canSave.value || saving.value) return
  const selectedCountry = pendingCountry.value
  const preferences = {
    country: selectedCountry.code,
    language: normalizeLocale(preferenceForm.language),
    timezone: resolveSystemTimezone(preferenceForm.timezone),
  }

  saving.value = true
  try {
    if (isLogin.value) {
      await userApi.savePreferences(preferences)
      clearPreferencesPendingSync()
    }
    applyPreferences(preferences)
    await activateLocaleMessages(preferences.language)
    if (!isLogin.value) {
      markPreferencesPendingSync()
    }
    goBack({ name: 'home' })
  } catch (error) {
    message(error?.msg, 'error')
  } finally {
    saving.value = false
  }
}

watch(country, (value) => {
  if (!selectionChanged.value) pendingCountryCode.value = resolveEnabledCountry(value)
})

onMounted(() => {
  loadPreferenceOptions()
})
</script>

<style scoped lang="less">
.country-recommendation {
  margin-bottom: 20px;
  padding: var(--ui-padding-12);
  border-radius: var(--ui-radius-6);
  background: color-mix(in srgb, var(--primary-color) 4%, #fff);

  &__header {
    margin-bottom: 8px;

    strong {
      color: var(--text-color);
      font-size: 13px;
      line-height: 20px;
    }
  }

  &__grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: var(--ui-space-8);
  }

  & &__item {
    min-height: 48px;
    margin-bottom: 0;
    border: 1px solid #fff;
    background: #fff;

    &:hover,
    &:focus-visible {
      border-color: color-mix(in srgb, var(--primary-color) 55%, #d8deea);
      background: color-mix(in srgb, var(--primary-color) 3%, #fff);
    }

    &.active {
      border-color: var(--primary-color);
      background: #fff;
    }
  }
}

.country-region {
  & + & {
    margin-top: 20px;
  }

  &__title {
    margin: var(--ui-margin-0-0-14);
    border-radius: var(--ui-radius-6);
    background: #f8f9fb;
    transition: background-color 0.2s ease;

    button {
      width: 100%;
      min-height: 40px;
      padding: var(--ui-padding-9-12);
      display: flex;
      align-items: center;
      justify-content: space-between;
      color: var(--text-color);
      font-size: 13px;
      font-weight: 500;
      line-height: 20px;
      text-align: left;
      border: 0;
      background: transparent;
      cursor: pointer;
    }

    &:hover,
    &:focus-within {
      background: #f5f7fb;
    }

    &.collapsed {
      margin-bottom: 0;
      background: #f2f5fa;
    }
  }

  &__arrow {
    color: var(--grey-color);
    transition: transform 0.2s ease;

    &.collapsed {
      transform: rotate(-90deg);
    }
  }
}

.country-grid {
  column-count: 3;
  column-gap: 24px;
}

.country-item {
  width: 100%;
  min-width: 0;
  min-height: 40px;
  margin-bottom: 2px;
  padding: var(--ui-padding-7-8);
  display: grid;
  grid-template-columns: 26px minmax(72px, 1fr) auto;
  align-items: center;
  column-gap: 10px;
  color: var(--text-color);
  text-align: left;
  border: 0;
  border-radius: var(--ui-radius-sm);
  background: transparent;
  break-inside: avoid;
  cursor: pointer;
  transition:
    color 0.2s ease,
    background-color 0.2s ease;

  > img {
    width: var(--ui-size-26);
    height: var(--ui-size-18);
    border: var(--ui-border-subtle);
    border-radius: var(--ui-radius-xs);
    object-fit: cover;
  }

  > strong,
  > small {
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  > strong {
    font-size: 13px;
    font-weight: 500;
    line-height: 20px;
  }

  > small {
    color: var(--grey-color);
    font-size: 11px;
    line-height: 18px;

    &:last-child {
      text-align: right;
    }
  }

  &:hover,
  &:focus-visible {
    color: var(--primary-color);
    background: #f7f9ff;
    outline: none;
  }

  &.active {
    color: var(--primary-color);
    background: color-mix(in srgb, var(--primary-color) 7%, #fff);
  }
}

.country-empty {
  min-height: 260px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  gap: 8px;
  color: var(--grey-color);

  p {
    margin: 0;
  }
}

.country-summary {
  > h2 {
    margin: var(--ui-margin-0-0-16);
    color: var(--text-color);
    font-size: 15px;
    line-height: 22px;
  }

  &__country {
    padding: var(--ui-padding-12);
    display: flex;
    align-items: center;
    gap: 10px;
    border-radius: var(--ui-radius-6);
    background: #f7f8fa;

    img {
      width: var(--ui-size-30);
      height: var(--ui-size-20);
      border: 1px solid #eceff3;
      border-radius: var(--ui-radius-xs);
      object-fit: cover;
    }

    div {
      min-width: 0;
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    strong {
      font-size: 14px;
      line-height: 20px;
    }

    small {
      color: var(--grey-color);
      font-size: 11px;
    }
  }

  &__form {
    margin-top: 16px;

    :deep(.ivu-form-item) {
      margin-bottom: 16px;
    }

    :deep(.ivu-form-item-label) {
      padding-bottom: 6px;
      color: var(--text-color);
      font-size: 13px;
    }
  }

  &__hint {
    margin: var(--ui-margin-0-0-14);
    color: var(--grey-color);
    font-size: 12px;
    line-height: 18px;
  }
}

.timezone-option {
  display: flex;
  flex: 1;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  gap: 10px;

  span {
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  small {
    flex: 0 0 auto;
    color: var(--grey-color);
    font-size: 11px;
  }
}

@media (max-width: 900px) {
  .country-recommendation__grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .country-grid {
    column-count: 2;
    column-gap: 16px;
  }

  .country-summary > h2 {
    display: none;
  }
}

@media (max-width: 520px) {
  .country-recommendation__grid {
    grid-template-columns: 1fr;
  }

  .country-grid {
    column-count: 1;
  }

  .country-item {
    padding-right: 4px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .country-item {
    transition: none;
  }
}
</style>
