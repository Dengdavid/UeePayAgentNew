<template>
  <div class="ui-table">
    <Table :columns="columns" :loading="loading" :height="isSelect ? 600 : ''" :data="tbody" :row-key="rowKey">
      <template v-for="item in slotKeys" #[item.prop||item.key]="{ row, index }" :key="item.prop || item.key">
        <slot
          v-if="$slots[item.prop || item.key]"
          :name="item.prop || item.key"
          :row="row"
          :index="index"
        />
        <ColumnsItemType v-else :data="item" :row="row" />
      </template>
      <template v-if="actions.length > 0" #action="{ row, index }">
        <Button v-if="isSelect" type="text" @click="handleSelect(row, index)">{{ $t('button.select') }}</Button>
        <TableActions
          v-else
          :row="row"
          :actions="actions"
          :actions-max="actionsMax"
          :row-index="index"
        />
      </template>
    </Table>
  </div>
</template>

<script setup>
import ColumnsItemType from './ColumnsItemType.vue'
import TableActions from './TableActions.vue'
import { computed } from 'vue'
import { t } from '@/utils'

const props = defineProps({
  thead: {
    type: Array,
    default: () => [],
  },
  tbody: {
    type: Array,
    default: () => [],
  },
  actions: {
    type: Array,
    default: () => [],
  },
  title: {
    type: String,
  },
  buttonLoading: {
    type: Boolean,
    default: false,
  },
  actionsWidth: {
    type: Number,
    default: 0,
  },
  actionsMax: {
    type: Number,
    default: 1,
  },
  loading: {
    type: Boolean,
    default: false,
  },
  isSelect: {
    type: Boolean,
    default: false,
  },
  rowKey: {
    type: String,
    default: 'id',
  },
})

const ACTIONS_MIN_WIDTH = 100
const ACTION_BUTTON_HORIZONTAL_SPACE = 30
const ACTION_CELL_HORIZONTAL_SPACE = 36
const ACTION_GAP = 16
const ACTION_LIST_HORIZONTAL_OFFSET = 12
const ACTION_MORE_ICON_SPACE = 18
const COLUMN_HORIZONTAL_SPACE = 36

let measureContext

const isSlot = item => Boolean(
  item.type || item.formType || typeof item.value === 'function' || typeof item.click === 'function'
)
const slotKeys = computed(() => props.thead.filter(isSlot))

const measureTextWidth = value => {
  const text = String(value || '')
  if (typeof document !== 'undefined') {
    measureContext ||= document.createElement('canvas').getContext('2d')
    if (measureContext) {
      measureContext.font = '14px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
      return Math.ceil(measureContext.measureText(text).width)
    }
  }
  return Array.from(text).reduce((width, char) => width + (/[^\x00-\xff]/.test(char) ? 14 : 8), 0)
}
const getActionValue = (action, key, row) => {
  const value = action?.[key]
  if (typeof value !== 'function') return value
  return row ? value(row) : ''
}
const getVisibleActions = row => {
  return props.actions.filter(action => {
    if (typeof action.show === 'function') {
      return row ? action.show(row) : true
    }
    return action.show !== false
  })
}
const getDisplayedActions = (row) => {
  if (props.isSelect) {
    return {
      labels: [t('button.select')],
      hasMore: false,
    }
  }

  const rowActions = getVisibleActions(row)
  const actionsMax = Math.max(Number(props.actionsMax) || 0, 0)
  if (rowActions.length > actionsMax) {
    const directActions = rowActions.slice(0, Math.max(actionsMax - 1, 0))
    return {
      labels: [
        ...directActions.map(action => getActionValue(action, 'label', row)),
        t('button.more'),
      ],
      hasMore: true,
    }
  }
  return {
    labels: rowActions.map(action => getActionValue(action, 'label', row)),
    hasMore: false,
  }
}
const getActionsColumnWidth = () => {
  const rows = props.tbody.length ? props.tbody : [null]
  const contentWidth = rows.reduce((maxWidth, row) => {
    const displayedActions = getDisplayedActions(row)
    const labels = displayedActions.labels.filter(Boolean)
    const labelsWidth = labels.reduce((width, label) => {
      return width + measureTextWidth(label) + ACTION_BUTTON_HORIZONTAL_SPACE
    }, 0)
    const gapsWidth = Math.max(labels.length - 1, 0) * ACTION_GAP
    const listOffset = props.isSelect ? 0 : ACTION_LIST_HORIZONTAL_OFFSET
    const moreIconWidth = displayedActions.hasMore ? ACTION_MORE_ICON_SPACE : 0
    return Math.max(
      maxWidth,
      labelsWidth + gapsWidth + ACTION_CELL_HORIZONTAL_SPACE - listOffset + moreIconWidth
    )
  }, 0)
  const titleWidth = measureTextWidth(t('button.operation')) + ACTION_CELL_HORIZONTAL_SPACE
  return Math.ceil(Math.max(
    ACTIONS_MIN_WIDTH,
    Number(props.actionsWidth) || 0,
    titleWidth,
    contentWidth
  ))
}
const getOptionsColumnWidth = (item) => {
  if (!item.options) return 0
  const optionList = Array.isArray(item.options) ? item.options : Object.values(item.options)
  const labelWidth = optionList.reduce((width, option) => {
    const label = typeof option === 'object' ? option?.label : option
    return Math.max(width, measureTextWidth(label))
  }, 0)
  const isDot = (item.type || item.formType) === 'dot'
  return labelWidth ? labelWidth + (isDot ? 52 : COLUMN_HORIZONTAL_SPACE) : 0
}
const getRowColumnWidth = (item) => {
  const keyParts = (item.prop || item.key)?.split('.') || []
  const labelWidth = props.tbody.reduce((width, row) => {
    const value = typeof item.value === 'function'
      ? item.value(row)
      : keyParts.reduce((result, key) => result?.[key], row)
    return Math.max(width, measureTextWidth(value ?? '-'))
  }, 0)
  return labelWidth ? labelWidth + COLUMN_HORIZONTAL_SPACE : 0
}
const getAutoColumnWidth = (item, title) => {
  const contentWidth = Math.max(
    measureTextWidth(title) + COLUMN_HORIZONTAL_SPACE,
    getOptionsColumnWidth(item),
    getRowColumnWidth(item),
    Number(item.width) || 0,
    Number(item.minWidth) || 0,
  )
  const maxWidth = Number(item.maxWidth) || 0
  return maxWidth ? Math.min(contentWidth, maxWidth) : contentWidth
}
const getColumnSize = (item, title, key) => {
  const titleWidth = measureTextWidth(title) + COLUMN_HORIZONTAL_SPACE
  const optionsColumnWidth = getOptionsColumnWidth(item)
  if (!item[key]) return key === 'minWidth' && optionsColumnWidth ? Math.max(titleWidth, optionsColumnWidth) : item[key]
  return Math.max(Number(item[key]) || 0, titleWidth, optionsColumnWidth)
}
const columns = computed(() => {
  const tableColumns = props.thead.map(item => {
    const title = `${item.label}${item.unit ? ` (${item.unit})` : ''}`
    const autoWidth = item.autoWidth !== false
    const usesSlot = isSlot(item)
    const width = autoWidth ? undefined : getColumnSize(item, title, 'width')
    const minWidth = autoWidth ? getAutoColumnWidth(item, title) : getColumnSize(item, title, 'minWidth')
    const column = {
      key: item.prop,
      title,
      tooltip: true,
      ...(usesSlot ? { slot: item.prop || item.key } : {}),
      ...item,
      width,
      minWidth,
    }

    if (usesSlot) return column

    const keyParts = (item.prop || item.key)?.split('.') || []
    column.render = (h, { row }) => {
      if (!keyParts.length) return '-'
      const rowValue = keyParts.reduce((value, key) => value?.[key], row)
      return h('span', { class: rowValue || rowValue === 0 ? '' : 'ui-text-grey' }, rowValue ?? '-')
    }
    return column
  })

  if (props.actions.length > 0) {
    tableColumns.push({
      slot: 'action',
      title: t('button.operation'),
      width: getActionsColumnWidth(),
      align: 'center',
      fixed: 'right',
    })
  }
  return tableColumns
})

const emit = defineEmits(['select'])
const handleSelect = (row, index) => {
  emit('select', row, index)
}
</script>

<style lang="less" scoped>
:deep(.ivu-table-header th .ivu-table-cell),
:deep(.ivu-table-fixed-header th .ivu-table-cell) {
  white-space: nowrap;
}
</style>
