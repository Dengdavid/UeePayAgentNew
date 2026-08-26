<template>
  <Tooltip
    class="iconTooltip"
    placement="top"
    :content="$t('header.preferences.trigger')"
    :disabled="tooltipDisabled"
  >
    <button
      type="button"
      class="preferences-trigger"
      :class="{ compact }"
      :aria-label="$t('header.preferences.trigger')"
      @click="handleOpen"
    >
      <img :src="currentCountry.flag" alt="" loading="lazy" decoding="async" />
      <span>{{ currentLanguage.label }}</span>
    </button>
  </Tooltip>
</template>

<script setup>
import {
  DEFAULT_LOCALE,
  locale,
  setData,
} from '@/locales/set.js'
import {
  DEFAULT_COUNTRY,
  DEFAULT_TIMEZONE,
  applyPreferences,
  country,
  getCachedCountry,
  getCachedLocale,
  getCachedTimezone,
  getCountryConfig,
  timezone,
} from '@/utils/preferences.js'
import { hasStoredPreferences } from '@/utils/preferences-storage.js'
import { toRoute } from '@/utils/route.js'
import { computed, onMounted } from 'vue'

defineProps({
  authenticated: {
    type: Boolean,
    default: false,
  },
  compact: {
    type: Boolean,
    default: false,
  },
  tooltipDisabled: {
    type: Boolean,
    default: false,
  },
})

const currentCountry = computed(() => getCountryConfig(country.value))
const currentLanguage = computed(() => (
  setData.find(item => item.value === locale.value) ||
  setData.find(item => item.value === DEFAULT_LOCALE)
))

const initPreferences = () => {
  if (!hasStoredPreferences()) {
    applyPreferences({
      country: DEFAULT_COUNTRY,
      language: DEFAULT_LOCALE,
      timezone: DEFAULT_TIMEZONE,
    })
    return
  }

  applyPreferences({
    country: getCachedCountry() || country.value,
    language: getCachedLocale() || locale.value || DEFAULT_LOCALE,
    timezone: getCachedTimezone() || timezone.value || DEFAULT_TIMEZONE,
  }, { persist: false })
}

const handleOpen = () => {
  toRoute('preferences_country')
}

onMounted(initPreferences)
</script>

<style scoped lang="less">
.preferences-trigger {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 32px;
  padding: var(--ui-padding-4-6);
  gap: 7px;
  color: var(--text-color);
  font: inherit;
  line-height: 20px;
  border: 0;
  border-radius: var(--ui-radius-md);
  background: transparent;
  cursor: pointer;
  transition:
    color 0.2s ease,
    background-color 0.2s ease;

  img {
    display: block;
    width: var(--ui-size-22);
    height: var(--ui-size-16);
    border: var(--ui-border-subtle);
    border-radius: var(--ui-radius-xs);
    object-fit: cover;
  }

  span {
    font-size: 13px;
    white-space: nowrap;
  }

  &:hover,
  &:focus-visible {
    color: var(--primary-color);
    background: color-mix(in srgb, var(--primary-color) 6%, var(--white-color));
    outline: none;
  }

  &.compact {
    min-height: 36px;
    padding: var(--ui-padding-4);
  }
}

@media (prefers-reduced-motion: reduce) {
  .preferences-trigger {
    transition: none;
  }
}
</style>
