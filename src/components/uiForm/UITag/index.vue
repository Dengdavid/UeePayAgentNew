<template>
  <span class="ui-tag" :class="[`is-${type}`, `size-${size}`, { 'is-custom': color, 'is-solid': solid }]" :style="color ? { '--ui-tag-color': color } : undefined" :title="String(title)">{{ title }}</span>
</template>

<script setup>
defineProps({
  title: { type: [String, Number], default: '' },
  type: { type: String, default: 'default', validator: value => ['default', 'success', 'warning', 'error'].includes(value) },
  size: { type: String, default: 'default', validator: value => ['small', 'default', 'large'].includes(value) },
  color: { type: String, default: '' },
  solid: { type: Boolean, default: false },
})
</script>

<style lang="less" scoped>
.ui-tag {
  display: inline-flex;
  align-items: center;
  flex-shrink: 0;
  max-width: 100%;
  gap: var(--ui-space-6);
  min-height: var(--ui-size-24);
  padding: var(--ui-space-4) var(--ui-space-12);
  border-radius: var(--ui-radius-full);
  color: var(--ui-color-text-secondary);
  background: var(--ui-color-surface-subtle);
  font-size: var(--ui-font-size-xs);
  font-weight: var(--ui-font-weight-semibold);
  line-height: var(--ui-line-height-md);
  overflow-wrap: anywhere;

  &::before {
    content: '';
    flex-shrink: 0;
    width: var(--ui-size-6);
    height: var(--ui-size-6);
    border-radius: var(--ui-radius-circle);
    background: currentColor;
  }

  &.is-success {
    color: var(--ui-color-success);
    background: var(--ui-alert-background-success);
  }

  &.is-warning {
    color: var(--ui-color-warning);
    background: var(--ui-alert-background-warning);
  }

  &.is-error {
    color: var(--ui-color-error);
    background: var(--ui-alert-background-error);
  }

  &.is-custom {
    color: var(--ui-tag-color);
    background: color-mix(in srgb, var(--ui-tag-color) 10%, var(--ui-color-surface));
  }

  &.is-solid {
    color: var(--ui-color-text-inverse);
    background: var(--ui-color-text-secondary);

    &.is-success { background: var(--ui-color-success); }
    &.is-warning { background: var(--ui-color-warning); }
    &.is-error { background: var(--ui-color-error); }
    &.is-custom { background: var(--ui-tag-color); }
  }

  &.size-small {
    min-height: var(--ui-size-22);
    padding: var(--ui-space-2) var(--ui-space-8);
  }

  &.size-large {
    min-height: var(--ui-size-32);
    padding: var(--ui-space-6) var(--ui-space-16);
    font-size: var(--ui-font-size-md);
  }

  @media (max-width: 767px) {
    &.size-default {
      padding-inline: var(--ui-space-8);
    }
  }
}
</style>
