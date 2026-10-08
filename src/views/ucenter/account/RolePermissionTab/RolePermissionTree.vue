<template>
  <div
    class="permission-tree"
    :class="{
      'permission-tree--root': depth === 0,
      'permission-tree--leaf-level': isLeafLevel,
    }"
  >
    <section
      v-for="node in nodes"
      :key="node.id"
      class="permission-node"
    >
      <div
        class="permission-node__row"
        :class="{
          'permission-node__row--section': depth === 0 || node.children.length > 0,
        }"
      >
        <button
          v-if="node.children.length"
          type="button"
          class="permission-node__toggle"
          :aria-label="isExpanded(node) ? $t('button.collapse') : $t('button.expand')"
          :aria-expanded="isExpanded(node)"
          @click="toggleExpanded(node)"
        >
          <Icon
            type="ios-arrow-forward"
            class="permission-node__toggle-icon"
            :class="{ 'permission-node__toggle-icon--expanded': isExpanded(node) }"
          />
        </button>
        <span
          v-else-if="depth === 0"
          class="permission-node__toggle-placeholder"
          aria-hidden="true"
        />
        <Checkbox
          :model-value="isNodeChecked(node)"
          :indeterminate="isNodeIndeterminate(node)"
          :disabled="readonly || getNodeSelectableIds(node).length === 0"
          @on-change="handleToggle(node, $event)"
        >
          <span class="permission-node__title">{{ node.name }}</span>
          <Tag v-if="!isPage(node) && Number(node.is_sensitive) === 1" color="red" class="permission-node__sensitive">
            {{ $t('auditLog.riskLevels.sensitive') }}
          </Tag>
        </Checkbox>
        <label v-if="isPage(node) && !hasChildPages(node)" class="permission-node__readonly">
          <span>{{ $t('ucenterAccount.permission.readonly') }}</span>
          <FormSwitch
            size="small"
            :model-value="readonlyPageIds.includes(node.id)"
            :true-value="true"
            :false-value="false"
            :disabled="readonly || getNodeSelectableIds(node).length === 0"
            :aria-label="`${node.name} ${$t('ucenterAccount.permission.readonly')}`"
            @on-change="handleReadonlyToggle(node, $event)"
          />
        </label>
      </div>

      <RolePermissionTree
        v-if="node.children.length"
        v-show="isExpanded(node)"
        class="permission-tree__children"
        :nodes="node.children"
        :selected-ids="selectedIds"
        :readonly="readonly"
        :readonly-page-ids="readonlyPageIds"
        :ancestor-disabled="ancestorDisabled || !isPermissionEnabled(node)"
        :depth="depth + 1"
        @toggle="emit('toggle', $event)"
        @toggle-readonly="emit('toggle-readonly', $event)"
      />
    </section>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'

const props = defineProps({
  nodes: {
    type: Array,
    default: () => [],
  },
  selectedIds: {
    type: Array,
    default: () => [],
  },
  readonlyPageIds: {
    type: Array,
    default: () => [],
  },
  ancestorDisabled: {
    type: Boolean,
    default: false,
  },
  readonly: {
    type: Boolean,
    default: false,
  },
  depth: {
    type: Number,
    default: 0,
  },
})

const emit = defineEmits(['toggle', 'toggle-readonly'])
const expandedIds = ref(new Set())

const selectedIdSet = computed(() => new Set(props.selectedIds.map(Number)))
const isLeafLevel = computed(() => {
  return props.depth > 0
    && props.nodes.length > 0
    && props.nodes.every((node) => !node.children?.length)
})

watch(() => props.nodes, (nodes) => {
  expandedIds.value = new Set(
    nodes.filter((node) => node.children?.length).map((node) => node.id),
  )
}, { immediate: true })

const isPermissionEnabled = (node) => {
  return node?.status === undefined || Number(node.status) === 1
}

const isPage = (node) => Number(node.type) === 0 || node.children.length > 0
const hasChildPages = (node) => isPage(node) && node.children.some(isPage)

const getNodeSelectableIds = (node, ancestorDisabled = props.ancestorDisabled) => {
  const disabled = ancestorDisabled || !isPermissionEnabled(node)
  if (disabled) return []

  return [
    node.id,
    ...(node.children || []).flatMap((child) => getNodeSelectableIds(child, disabled)),
  ]
}

const isNodeChecked = (node) => {
  if (hasChildPages(node)) {
    const selectableIds = getNodeSelectableIds(node)
    return selectableIds.length > 0 && selectableIds.every((id) => selectedIdSet.value.has(id))
  }
  return selectedIdSet.value.has(node.id)
}

const isNodeIndeterminate = (node) => {
  if (!hasChildPages(node)) return false
  const selectableIds = getNodeSelectableIds(node)
  const selectedCount = selectableIds.filter((id) => selectedIdSet.value.has(id)).length
  return selectedCount > 0 && selectedCount < selectableIds.length
}

const handleToggle = (node, checked) => {
  if (props.readonly || getNodeSelectableIds(node).length === 0) return
  emit('toggle', { node, checked })
}

const handleReadonlyToggle = (node, checked) => {
  if (props.readonly || getNodeSelectableIds(node).length === 0) return
  emit('toggle-readonly', { node, checked })
}

const isExpanded = (node) => expandedIds.value.has(node.id)

const toggleExpanded = (node) => {
  const nextIds = new Set(expandedIds.value)
  if (nextIds.has(node.id)) nextIds.delete(node.id)
  else nextIds.add(node.id)
  expandedIds.value = nextIds
}
</script>

<style scoped lang="less">
.permission-tree {
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: var(--ui-space-8);
}

.permission-tree--root {
  gap: var(--ui-space-8);
}

.permission-node {
  min-width: 0;
}

.permission-node__row {
  display: flex;
  align-items: center;
  min-height: var(--ui-size-36);
  padding: var(--ui-space-4) var(--ui-space-8);
}

.permission-node__row--section {
  min-height: var(--ui-size-40);
  padding: 0 var(--ui-space-12);
  background: var(--ui-color-surface-muted);
}

.permission-node__row--section .permission-node__title {
  font-weight: var(--ui-font-weight-semibold);
}

.permission-node__title {
  color: var(--ui-color-text);
  line-height: var(--ui-line-height-md);
}

.permission-node__sensitive {
  height: var(--ui-size-18);
  line-height: var(--ui-size-16);
  padding-inline: var(--ui-space-4);
  font-size: var(--ui-font-size-xs);
  margin-block: 0;
  margin-inline-start: var(--ui-space-4);
  margin-inline-end: 0;
  border-radius: var(--ui-radius-full);
}

.permission-node__readonly {
  display: inline-flex;
  align-items: center;
  flex-shrink: 0;
  gap: var(--ui-space-8);
  margin-inline-start: var(--ui-space-8);
}

:deep(.permission-node__row .ivu-checkbox-wrapper) {
  display: flex;
  align-items: center;
  min-width: 0;
  flex: 1;
  min-height: inherit;
  margin-right: 0;
}

:deep(.permission-node__row .ivu-checkbox-label-text) {
  min-width: 0;
  padding-left: var(--ui-space-8);
  white-space: normal;
}

.permission-node__toggle,
.permission-node__toggle-placeholder {
  width: var(--ui-space-16);
  height: var(--ui-size-36);
  flex: 0 0 var(--ui-space-16);
  margin-right: var(--ui-space-4);
}

.permission-node__toggle {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  border: 0;
  background: transparent;
  color: var(--ui-color-text-secondary);
  cursor: pointer;
}

.permission-node__toggle-icon {
  transition: transform var(--ui-motion-control) var(--ui-ease-standard);
}

.permission-node__toggle-icon--expanded {
  transform: rotate(90deg);
}

.permission-tree__children {
  margin: var(--ui-space-8) 0 0 var(--ui-space-24);
}

.permission-tree--leaf-level {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: var(--ui-space-8) var(--ui-space-12);
}

.permission-tree--leaf-level .permission-node__row {
  min-height: var(--ui-size-20);
  padding-block: 0;
}

:deep(.permission-tree--leaf-level .ivu-checkbox-wrapper) {
  width: 100%;
}

:deep(.permission-tree--leaf-level .ivu-checkbox-wrapper:not(.ivu-checkbox-wrapper-disabled):not(.ivu-checkbox-wrapper-checked):hover) {
  color: var(--ui-color-primary);
}

:deep(.permission-node__row .ivu-checkbox-wrapper-disabled .ivu-checkbox-label-text) {
  color: var(--ui-color-control-text-disabled);
}

@media screen and (max-width: 768px) {
  .permission-tree--leaf-level {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: var(--ui-space-4);
  }

  .permission-node__row {
    min-height: var(--ui-size-44);
    padding-block: var(--ui-space-6);
  }

  .permission-tree--leaf-level .permission-node__row {
    min-height: var(--ui-size-32);
    padding-block: 0;
  }

  .permission-tree__children {
    margin-left: var(--ui-space-16);
  }
}
</style>
