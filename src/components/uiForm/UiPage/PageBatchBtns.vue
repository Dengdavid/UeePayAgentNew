<template>
  <div ref="containerRef" class="ui-page-status-btn" :class="{ 'has-overflow': collapsed }" v-if="data?.length>0 && selectionArr?.length>0">
    <div ref="actionsRef" class="batch-actions" :class="{ 'is-collapsed': collapsed }" :inert="collapsed ? true : undefined" :aria-hidden="collapsed ? true : undefined">
      <template v-for="item in actions" :key="item.label">
        <Tooltip v-if="item.tooltip" :content="item.tooltip" placement="top" transfer>
          <span class="action-tooltip-trigger" tabindex="0" :aria-label="item.tooltip">
            <Button size="small" :loading="activeAction === item.label" :disabled="activeAction !== null || item.disabled === true" @click.stop="clickBtn(item)">{{ item.label }}</Button>
          </span>
        </Tooltip>
        <Button v-else size="small" :loading="activeAction === item.label" :disabled="activeAction !== null || item.disabled === true" @click.stop="clickBtn(item)">
          <span>{{ item.label }}</span>
        </Button>
      </template>
    </div>
    <Dropdown placement="bottom-end" trigger="click" transfer v-if="overflowActions.length">
      <Button size="small" :shape="isPhone?'circle':''" :loading="activeAction !== null" :disabled="activeAction !== null">
        <span>{{ $t('button.more') }}</span>
        <Icon type="ios-arrow-down"></Icon>
      </Button>
      <template #list>
        <DropdownMenu>
          <DropdownItem v-for="item in overflowActions" :key="item.label" :disabled="activeAction !== null || item.disabled === true" @click.stop="clickBtn(item)">
            <Tooltip v-if="item.tooltip" :content="item.tooltip" placement="top" transfer style="display: block">
              <span tabindex="0" :aria-label="item.tooltip">{{ item.label }}</span>
            </Tooltip>
            <template v-else>{{ item.label }}</template>
          </DropdownItem>
        </DropdownMenu>
      </template>
    </Dropdown>
  </div>
</template>
<script setup>
import { t } from '@/utils'
import { computed, ref } from 'vue'
import { useResizeObserver } from '@vueuse/core'
import { isPhone } from '@/utils/device.js'
import { confirm } from '@/utils/message.js'
const props = defineProps({
  data:{
    type: Array,
  },
  selectionArr:{
     type: Array,
     default:()=>[]
  }
})
const actions = computed(() => (props.data || []).filter(item => typeof item.hidden === 'function' ? item.hidden() : true))
const containerRef = ref(null)
const actionsRef = ref(null)
const lacksSpace = ref(false)
const updateOverflow = () => {
  if (!containerRef.value || !actionsRef.value) return
  lacksSpace.value = actionsRef.value.getBoundingClientRect().width > containerRef.value.clientWidth
}
useResizeObserver(containerRef, updateOverflow)
useResizeObserver(actionsRef, updateOverflow)
const collapsed = computed(() => isPhone.value || actions.value.length >= 6 || lacksSpace.value)
const overflowActions = computed(() => collapsed.value ? actions.value : [])
const activeAction = ref(null)
const clickBtn = async (item) => {
  if (item.disabled === true || activeAction.value !== null || !props.selectionArr?.length || typeof item.click !== 'function') return
  const rows = [...props.selectionArr]
  activeAction.value = item.label
  try {
    if (!item.isNotConfirm) {
      const confirmed = await confirm(item.confirmText || t('uiCommon.batchConfirm', { count: rows.length, action: item.label }), { resolveCancel: true })
      if (!confirmed) return
    }
    await item.click(rows)
  } finally {
    activeAction.value = null
  }
}
</script>
<style lang="less" scoped>
.action-tooltip-trigger {
  display: inline-flex;
  cursor: not-allowed;

  :deep(button:disabled) { pointer-events: none; }
}

.ui-page-status-btn {
  position: relative;
  flex: 1;
  min-width: 0;

  &.has-overflow {
    overflow: hidden;
  }

  .batch-actions {
    display: flex;
    width: max-content;
    gap: var(--ui-space-8);
    white-space: nowrap;

    &.is-collapsed {
      position: absolute;
      visibility: hidden;
      pointer-events: none;
    }
  }
}
</style>
