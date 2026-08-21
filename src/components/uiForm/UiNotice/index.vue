<template>
  <aside
    class="ui-notice"
    :class="`ui-notice--${type}`"
    :role="role || 'alert'"
  >
    <Icon v-if="showIcon" class="ui-notice-icon" type="ios-information-circle-outline" :size="17" />
    <div class="ui-notice-content">
      <h4 v-if="title">{{ title }}</h4>
      <div v-if="$slots.default" class="ui-notice-message">
        <slot />
      </div>
      <ol v-if="items.length" class="ui-notice-list">
        <li v-for="(item, index) in items" :key="index">{{index+1}}.{{ item }}</li>
      </ol>
    </div>
  </aside>
</template>

<script setup>
defineProps({
  type: {
    type: String,
    default: 'accent',
    validator: (value) => ['accent', 'plain'].includes(value),
  },
  title: {
    type: String,
    default: '',
  },
  items: {
    type: Array,
    default: () => [],
  },
  showIcon: {
    type: Boolean,
    default: false,
  },
  role: {
    type: String,
    default: '',
  },
})
</script>

<style scoped lang="less">
.ui-notice {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: var(--ui-padding-9-12);
  color: var(--error-color);
  background: var(--ui-color-surface-danger-soft);
  border: var(--ui-border-error-subtle);
  border-left: 3px solid var(--error-color);
  border-radius: var(--ui-radius-6);
  font-size: 12px;
  line-height: 20px;
}

.ui-notice--plain {
  border: var(--ui-border-error-subtle);
}

.ui-notice-icon {
  flex: none;
  margin-top: 1px;
  color: var(--error-color);
}

.ui-notice-content {
  min-width: 0;
  flex: 1;
}

h4 {
  margin-bottom: 8px;
  color: var(--error-color);
  font-size: 13px;
  font-weight: 600;
}

.ui-notice-message {
  color: inherit;
}

.ui-notice-list {
  margin: 0;
  color: var(--ui-color-text);
}

.ui-notice-list li + li {
  margin-top: 2px;
}
</style>
