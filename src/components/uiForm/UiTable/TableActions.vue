<template>
  <div class="action-list">
    <template v-for="(action, actionIndex) in rowActions" :key="action.key || actionIndex">
      <template v-if="actionsMax && (actionIndex < actionsMax - 1 || rowActions.length === actionsMax)">
        <Tooltip v-if="getActionValue(action, 'tooltip')" :content="getActionValue(action, 'tooltip')" placement="top" transfer>
          <span class="action-tooltip-trigger" tabindex="0" :aria-label="getActionValue(action, 'tooltip')">
            <Button
              :loading="row.loading && loadingLabel === getActionValue(action, 'label')"
              :disabled="getActionValue(action, 'disabled')"
              type="text"
              class="table-action-button"
              :class="getActionValue(action, 'class')"
              :style="getActionValue(action, 'style')"
              @click="handleClick(action)"
            >
              {{ getActionValue(action, 'label') }}
            </Button>
          </span>
        </Tooltip>
        <Button v-else
          :loading="row.loading && loadingLabel === getActionValue(action, 'label')"
          :disabled="getActionValue(action, 'disabled')"
          type="text"
          class="table-action-button"
          :class="getActionValue(action, 'class')"
          :style="getActionValue(action, 'style')"
          @click="handleClick(action)"
        >
          {{ getActionValue(action, 'label') }}
        </Button>
      </template>
    </template>
    <Dropdown
      v-if="rowActions.length > actionsMax"
      placement="bottom-end"
      trigger="hover"
      transfer
      :capture="true"
    >
      <Button type="text">
        <span class="label">{{ $t('button.more') }}</span>
        <Icon type="ios-arrow-down" />
      </Button>
      <template #list>
        <DropdownMenu class="ui-table-action-menu">
          <template v-for="(action, actionIndex) in rowActions" :key="action.key || actionIndex">
            <DropdownItem
              v-if="actionIndex >= actionsMax - 1"
              :disabled="getActionValue(action, 'disabled')"
              :class="getActionValue(action, 'class')"
              :style="getActionValue(action, 'style')"
              @click.stop="handleClick(action)"
            >
              <Tooltip v-if="getActionValue(action, 'tooltip')" :content="getActionValue(action, 'tooltip')" placement="top" transfer style="display: block">
                <span tabindex="0" :aria-label="getActionValue(action, 'tooltip')">{{ getActionValue(action, 'label') }}</span>
              </Tooltip>
              <template v-else>{{ getActionValue(action, 'label') }}</template>
            </DropdownItem>
          </template>
        </DropdownMenu>
      </template>
    </Dropdown>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { hasPermission } from '@/utils/permission.js'

const props = defineProps({
  row: {
    type: Object,
    default: () => ({}),
  },
  actions: {
    type: Array,
    default: () => [],
  },
  actionsMax: {
    type: Number,
    default: 1,
  },
  rowIndex: {
    type: Number,
    default: 0,
  },
})

const loadingLabel = ref('')

const getActionValue = (action, key) => {
  return typeof action?.[key] === 'function' ? action[key](props.row) : action?.[key]
}

const rowActions = computed(() => {
  return props.actions.filter(action => {
    if (!hasPermission(action.permission)) return false
    if (typeof action.show === 'function') {
      return action.show(props.row)
    }
    return action.show !== false
  })
})

const handleClick = action => {
  if (!hasPermission(action.permission) || getActionValue(action, 'disabled')) return
  if (typeof action.click === 'function') {
    action.loading = true
    loadingLabel.value = getActionValue(action, 'label')
    action.click(props.row, action, props.rowIndex)
  }
}
</script>

<style lang="less" scoped>
.action-tooltip-trigger {
  display: inline-flex;
  cursor: not-allowed;

  :deep(button:disabled) { pointer-events: none; }
}

.action-list{
  margin:0 -6px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-wrap: nowrap;
  gap:16px;
  white-space: nowrap;
  :deep(.ivu-divider){
    margin: 0 !important;
    top: 0;
  }
  >*{
    position: relative;
    &:not(:last-child){
      &::after{
        content:'';
        position: absolute;
        right:-8px;
        top:50%;
        transform: translateY(-50%);
        width:var(--ui-size-1);
        height:var(--ui-size-12);
        background: var(--ui-color-surface-neutral);
        pointer-events:none
      }
    }
  }
}
:deep(.ivu-btn-text.table-action-button:not(:disabled)){
  color: var(--text-color);
}
:deep(.ivu-btn-text.action-primary:not(:disabled)){
  color: var(--primary-color) !important;
}
:deep(.ivu-btn-text.action-warning:not(:disabled)){
  color: var(--ui-color-warning) !important;
}
:deep(.ivu-btn-text.action-default:not(:disabled)){
  color: var(--text-color) !important;
}
</style>

<style lang="less">
.ui-table-action-menu {
  .ivu-dropdown-item:not(.ivu-dropdown-item-disabled) {
    color: var(--text-color);
  }

  .ivu-dropdown-item.action-primary:not(.ivu-dropdown-item-disabled) {
    color: var(--primary-color) !important;
  }

  .ivu-dropdown-item.action-warning:not(.ivu-dropdown-item-disabled) {
    color: var(--ui-color-warning) !important;
  }

  .ivu-dropdown-item.action-default:not(.ivu-dropdown-item-disabled) {
    color: var(--text-color) !important;
  }
}
</style>
