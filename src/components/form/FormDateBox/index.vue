<template>
  <DatePicker ref="datePickerRef" class="form-date-box" v-model="c_modelValue" separator=" ~ " :type="type" :style="{
    width: typeof width === 'number' ? width + 'px' : width,
  }" v-bind="{
    ...dateOptions,
    ...$attrs,
    options: mergedDatePickerOptions
  }" :split-panels="type.includes('range')" :transfer-class-name="transferClassName" @on-change="onChange" @on-open-change="handleOpenChange"/>
</template>
<script setup>
import { format, isValid, subMonths, addMonths, subDays, addDays, startOfWeek, startOfMonth, endOfMonth, subYears, addYears, differenceInDays } from 'date-fns'
import { computed, defineProps, nextTick, onBeforeUnmount, onMounted, ref, useAttrs, watch } from 'vue'
import { isPhone } from '@/utils/device'
import { getCalendarDateInTimezone } from '@/utils/preferences'
import { t } from '@/utils'
defineOptions({ inheritAttrs: false })
const attrs = useAttrs()
const props = defineProps({
  modelValue: {
    type: [Array, Object, String, null],
  },
  //默认日期
  defaultDate: {},
  //
  data: {
    type: Object,
  },
  startKey: {
    type: String,
    default: 'startTime',
  },
  endKey: {
    type: String,
    default: 'endTime',
  },
  width:{
    type:[String,Number],
    default:'100%'
  },
  type:{
    type:String,
    default:'daterange'
  },
  //禁用今天之后的时间
  disableAfterToday:{
    type:Boolean,
    default:true
  },
  notDateOptions:{
    type:Boolean,
    default:false
  },
  //是否返回文本
  isSring:{
    type:Boolean,
    default:false
  },
  maxMonths:{
    type:Number,
    default:0,
  }
})
//
const getTimezoneToday = () => getCalendarDateInTimezone()
const getTimezoneEndOfToday = () => {
  const date = getTimezoneToday()
  date.setHours(23, 59, 59, 999)
  return date
}
const parseCalendarDate = (value) => {
  if (value instanceof Date) {
    if (!isValid(value)) return getTimezoneToday()
    return new Date(value.getFullYear(), value.getMonth(), value.getDate(), 12)
  }

  const matched = String(value || '').match(/^(\d{4})-(\d{2})-(\d{2})/)
  if (matched) {
    return new Date(Number(matched[1]), Number(matched[2]) - 1, Number(matched[3]), 12)
  }

  const date = new Date(value)
  return isValid(date)
    ? new Date(date.getFullYear(), date.getMonth(), date.getDate(), 12)
    : getTimezoneToday()
}
const setQuickDate = (number,type) => {
  resetPickerTables()
  const now = getTimezoneToday()
  const _format = dateOptions.value.format || 'yyyy-MM-dd'
  let start = now, end = now
  switch(type) {
    case 'day':
      start = subDays(now, number)
      end = start
      break;
    case 'this_week':
      start = startOfWeek(now, { weekStartsOn: number })
      break;
    case 'this_month':
      start = startOfMonth(now)
      break;
    case 'last_month':
      const lastMonth = subMonths(now, number)
      start = startOfMonth(lastMonth)
      end = endOfMonth(lastMonth)
      break;
    case 'months':
      start = subMonths(now, number)
      break;
    case 'days':
      start = subDays(now, Math.max(number - 1, 0))
      break;
    case 'year':
      start = subYears(now, number)
      break;
    default:
      return []
  }
  return [format(start, _format), format(end, _format)]
}

const getShiftedDates = (direction) => {
  resetPickerTables()
  const currentVal = c_modelValue.value
  if (!Array.isArray(currentVal) || currentVal.length !== 2 || !currentVal[0] || !currentVal[1]) {
    return currentVal
  }

  const startDate = parseCalendarDate(currentVal[0])
  const endDate = parseCalendarDate(currentVal[1])
  const rangeDays = differenceInDays(endDate, startDate) + 1
  if (rangeDays <= 0) return currentVal

  let newStartDate
  let newEndDate
  if (direction < 0) {
    newEndDate = subDays(startDate, 1)
    newStartDate = subDays(newEndDate, rangeDays - 1)
  } else {
    newStartDate = addDays(endDate, 1)
    newEndDate = addDays(newStartDate, rangeDays - 1)
    const today = parseCalendarDate(getTimezoneToday())
    if (newEndDate.getTime() > today.getTime()) newEndDate = today
  }

  const _format = dateOptions.value.format || 'yyyy-MM-dd'
  return [format(newStartDate, _format), format(newEndDate, _format)]
}

const getRangeShiftDisabledState = () => {
  const currentVal = c_modelValue.value
  const incomplete = !Array.isArray(currentVal)
    || currentVal.length !== 2
    || !currentVal[0]
    || !currentVal[1]
  if (incomplete) return { previous: true, next: true }

  const startDate = parseCalendarDate(currentVal[0])
  const endDate = parseCalendarDate(currentVal[1])
  if (differenceInDays(endDate, startDate) < 0) {
    return { previous: true, next: true }
  }
  const today = parseCalendarDate(getTimezoneToday())
  return {
    previous: false,
    next: endDate.getTime() >= today.getTime(),
  }
}
const datePickerRef = ref(null)
let watchedPickerPanel = null
let stopPanelDateWatchers = []

const resetPickerTables = () => {
  const panel = datePickerRef.value?.$refs?.pickerPanel
  if (!panel) return
  panel.leftPickerTable = 'date-table'
  panel.rightPickerTable = 'date-table'
}

const resetPickerPanel = () => {
  const panel = datePickerRef.value?.$refs?.pickerPanel
  if (!panel || !props.type.includes('range')) return

  const initialDate = attrs['start-date']
    || attrs.startDate
    || dateOptions.value?.['start-date']
    || getTimezoneToday()
  const leftPanelDate = startOfMonth(parseCalendarDate(initialDate))

  panel.rangeState = {
    from: null,
    to: null,
    selecting: false,
  }
  panel.leftPanelDate = leftPanelDate
  panel.rightPanelDate = startOfMonth(addMonths(leftPanelDate, 1))
  resetPickerTables()
  nextTick(() => syncPanelPresentation(panel))
}

const getPanelMonthDistance = (leftDate, rightDate) => (
  (rightDate.getFullYear() - leftDate.getFullYear()) * 12
  + rightDate.getMonth()
  - leftDate.getMonth()
)

const getRangeSelectionMonthBounds = (panel) => {
  const rangeState = panel?.rangeState
  if (!props.maxMonths || !rangeState?.selecting || !rangeState.from) return null

  let minDate = subMonths(rangeState.from, props.maxMonths)
  let maxDate = addMonths(rangeState.from, props.maxMonths)
  if (props.maxMonths === 1) {
    if (differenceInDays(maxDate, rangeState.from) > 30) maxDate = addDays(rangeState.from, 30)
    if (differenceInDays(rangeState.from, minDate) > 30) minDate = subDays(rangeState.from, 30)
  }
  if (props.disableAfterToday && maxDate.getTime() > getTimezoneEndOfToday().getTime()) {
    maxDate = getTimezoneEndOfToday()
  }

  const minMonth = startOfMonth(minDate)
  const maxMonth = startOfMonth(maxDate)
  const selectedMonth = startOfMonth(rangeState.from)
  const selectedOnLeft = startOfMonth(panel.leftPanelDate).getTime() === selectedMonth.getTime()
  if (selectedOnLeft) {
    const nextMonth = addMonths(selectedMonth, 1)
    return {
      left: [minMonth, selectedMonth],
      right: [
        nextMonth,
        maxMonth.getTime() > selectedMonth.getTime() ? maxMonth : nextMonth,
      ],
    }
  }

  return {
    left: [
      minMonth.getTime() < selectedMonth.getTime()
        ? minMonth
        : subMonths(selectedMonth, 1),
      subMonths(selectedMonth, 1),
    ],
    right: [selectedMonth, maxMonth],
  }
}

const getRangeSelectionOverallMonthBounds = (panel) => {
  const rangeState = panel?.rangeState
  if (!rangeState?.selecting || !rangeState.from) return null

  let minDate = null
  let maxDate = null
  if (props.maxMonths) {
    minDate = subMonths(rangeState.from, props.maxMonths)
    maxDate = addMonths(rangeState.from, props.maxMonths)
    if (props.maxMonths === 1) {
      if (differenceInDays(maxDate, rangeState.from) > 30) {
        maxDate = addDays(rangeState.from, 30)
      }
      if (differenceInDays(rangeState.from, minDate) > 30) {
        minDate = subDays(rangeState.from, 30)
      }
    }
  }
  if (props.disableAfterToday) {
    const today = getTimezoneEndOfToday()
    if (!maxDate || maxDate.getTime() > today.getTime()) maxDate = today
  }

  if (!minDate && !maxDate) return null
  return [
    minDate ? startOfMonth(minDate) : null,
    maxDate ? startOfMonth(maxDate) : null,
  ]
}

const getPanelSelectableMonthBounds = (panel, panelName) => {
  if (
    panel?.rangeState?.selecting
    && panel.rangeState.from
    && panel?.[`${panelName}PickerTable`] !== 'date-table'
  ) {
    return getRangeSelectionOverallMonthBounds(panel)
  }

  const selectionBounds = getRangeSelectionMonthBounds(panel)?.[panelName]
  if (!selectionBounds) {
    return props.disableAfterToday
      ? [null, startOfMonth(getTimezoneToday())]
      : null
  }
  const otherPanelName = panelName === 'left' ? 'right' : 'left'
  const otherPanelDate = panel?.[`${otherPanelName}PanelDate`]
  if (!otherPanelDate) return null

  const otherMonth = startOfMonth(otherPanelDate)
  let minMonth = panelName === 'left'
    ? (props.maxMonths ? subMonths(otherMonth, props.maxMonths) : null)
    : addMonths(otherMonth, 1)
  let maxMonth = panelName === 'left'
    ? subMonths(otherMonth, 1)
    : (props.maxMonths ? addMonths(otherMonth, props.maxMonths) : null)

  if (props.disableAfterToday) {
    const todayMonth = startOfMonth(getTimezoneToday())
    if (!maxMonth || maxMonth.getTime() > todayMonth.getTime()) maxMonth = todayMonth
  }
  if (selectionBounds) {
    if (!minMonth || selectionBounds[0].getTime() > minMonth.getTime()) {
      minMonth = selectionBounds[0]
    }
    if (!maxMonth || selectionBounds[1].getTime() < maxMonth.getTime()) {
      maxMonth = selectionBounds[1]
    }
  }
  return [minMonth, maxMonth]
}

const isMonthOutsideBounds = (month, bounds) => Boolean(bounds) && (
  (bounds[0] && month.getTime() < bounds[0].getTime())
  || (bounds[1] && month.getTime() > bounds[1].getTime())
)

const hasSelectableDateInMonth = (month) => {
  const year = month.getFullYear()
  const monthIndex = month.getMonth()
  const lastDay = endOfMonth(month).getDate()
  for (let day = 1; day <= lastDay; day += 1) {
    if (!isDateDisabled(new Date(year, monthIndex, day, 12))) return true
  }
  return false
}

const getLinkedPanelNavigation = (panel, panelName, offset) => {
  const selectedMonth = panel?.rangeState?.selecting && panel.rangeState.from
    ? startOfMonth(panel.rangeState.from)
    : null
  if (
    panel?.[`${panelName}PickerTable`] !== 'date-table'
    || !selectedMonth
    || startOfMonth(panel[`${panelName}PanelDate`]).getTime() !== selectedMonth.getTime()
    || (panelName === 'left' && offset < 0)
    || (panelName === 'right' && offset > 0)
  ) return null

  const peerPanelName = panelName === 'left' ? 'right' : 'left'
  const targetMonth = startOfMonth(
    addMonths(panel[`${peerPanelName}PanelDate`], offset)
  )
  const peerBounds = getRangeSelectionMonthBounds(panel)?.[peerPanelName]
  return {
    peerPanelName,
    targetMonth,
    isDisabled: isMonthOutsideBounds(targetMonth, peerBounds)
      || !hasSelectableDateInMonth(targetMonth),
  }
}

const alignPanelsToNewRangeSelection = (panel, selectedDate) => {
  const selectedMonth = startOfMonth(selectedDate)
  const previousMonth = startOfMonth(subMonths(selectedMonth, 1))
  const nextMonth = startOfMonth(addMonths(selectedMonth, 1))
  const hasSelectablePreviousMonth = hasSelectableDateInMonth(previousMonth)
  const hasSelectableNextMonth = hasSelectableDateInMonth(nextMonth)

  if (startOfMonth(panel.leftPanelDate).getTime() === selectedMonth.getTime()) {
    if (hasSelectableNextMonth || !hasSelectablePreviousMonth) {
      panel.rightPanelDate = nextMonth
    } else {
      panel.leftPanelDate = previousMonth
      panel.rightPanelDate = selectedMonth
    }
  } else if (startOfMonth(panel.rightPanelDate).getTime() === selectedMonth.getTime()) {
    if (hasSelectablePreviousMonth || !hasSelectableNextMonth) {
      panel.leftPanelDate = previousMonth
    } else {
      panel.leftPanelDate = selectedMonth
      panel.rightPanelDate = nextMonth
    }
  }
}

const clampPanelToRangeSelection = (panel, changedPanel) => {
  const bounds = getRangeSelectionMonthBounds(panel)?.[changedPanel]
  if (!bounds) return

  const panelKey = `${changedPanel}PanelDate`
  const currentMonth = startOfMonth(panel[panelKey])
  if (currentMonth.getTime() < bounds[0].getTime()) {
    panel[panelKey] = bounds[0]
  } else if (currentMonth.getTime() > bounds[1].getTime()) {
    panel[panelKey] = bounds[1]
  }
}

const enforcePanelConstraints = (panel, changedPanel) => {
  clampPanelToRangeSelection(panel, changedPanel)
  const rangeState = panel?.rangeState
  const isSelectingRange = Boolean(rangeState?.selecting && rangeState.from)
  if (isSelectingRange) {
    const selectedMonth = startOfMonth(rangeState.from)
    if (
      changedPanel === 'left'
      && startOfMonth(panel.leftPanelDate).getTime() < selectedMonth.getTime()
    ) {
      panel.rightPanelDate = selectedMonth
    } else if (
      changedPanel === 'right'
      && startOfMonth(panel.rightPanelDate).getTime() > selectedMonth.getTime()
    ) {
      panel.leftPanelDate = selectedMonth
    }
  }

  if (!panel?.splitPanels || !panel.leftPanelDate || !panel.rightPanelDate) return
  const distance = getPanelMonthDistance(panel.leftPanelDate, panel.rightPanelDate)
  if (distance < 1) {
    if (changedPanel === 'left') {
      panel.rightPanelDate = startOfMonth(addMonths(panel.leftPanelDate, 1))
    } else {
      panel.leftPanelDate = startOfMonth(subMonths(panel.rightPanelDate, 1))
    }
    return
  }
  if (!isSelectingRange || !props.maxMonths || distance <= props.maxMonths) return

  if (changedPanel === 'left') {
    panel.rightPanelDate = startOfMonth(addMonths(panel.leftPanelDate, props.maxMonths))
  } else {
    panel.leftPanelDate = startOfMonth(subMonths(panel.rightPanelDate, props.maxMonths))
  }
}

const syncPanelNavigationPresentation = (panel) => {
  const panelElement = panel?.$el
  if (!panelElement) return
  const bounds = getRangeSelectionMonthBounds(panel)
  const buttons = [
    ['left', -12, '.ivu-picker-panel-content-left .ivu-date-picker-prev-btn-arrow-double'],
    ['left', -1, '.ivu-picker-panel-content-left .ivu-date-picker-prev-btn-arrow'],
    ['left', 12, '.ivu-picker-panel-content-left .ivu-date-picker-next-btn-arrow-double'],
    ['left', 1, '.ivu-picker-panel-content-left .ivu-date-picker-next-btn-arrow'],
    ['right', -12, '.ivu-picker-panel-content-right .ivu-date-picker-prev-btn-arrow-double'],
    ['right', -1, '.ivu-picker-panel-content-right .ivu-date-picker-prev-btn-arrow'],
    ['right', 12, '.ivu-picker-panel-content-right .ivu-date-picker-next-btn-arrow-double'],
    ['right', 1, '.ivu-picker-panel-content-right .ivu-date-picker-next-btn-arrow'],
  ]

  buttons.forEach(([panelName, offset, selector]) => {
    const button = panelElement.querySelector(selector)
    if (!button) return
    const panelTable = panel[`${panelName}PickerTable`]
    const panelBounds = panelTable === 'date-table'
      ? bounds?.[panelName]
      : getPanelSelectableMonthBounds(panel, panelName)
    const isMonthPageButton = panelTable === 'month-table'
      && selector.includes('arrow-double')
    const isYearPageButton = panelTable === 'year-table'
      && selector.includes('arrow-double')
    const targetMonth = startOfMonth(isYearPageButton
      ? addYears(panel[`${panelName}PanelDate`], offset > 0 ? 10 : -10)
      : addMonths(panel[`${panelName}PanelDate`], offset))
    const linkedNavigation = isYearPageButton
      ? null
      : getLinkedPanelNavigation(panel, panelName, offset)
    const selectedMonth = bounds && panel?.rangeState?.from
      ? startOfMonth(panel.rangeState.from)
      : null
    if (linkedNavigation) {
      const { isDisabled } = linkedNavigation
      button.classList.toggle('is-disabled', isDisabled)
      if (isDisabled) {
        button.setAttribute('aria-disabled', 'true')
      } else {
        button.removeAttribute('aria-disabled')
      }
      return
    }
    const targetPageStartYear = isYearPageButton
      ? Math.floor(targetMonth.getFullYear() / 10) * 10
      : targetMonth.getFullYear()
    const hasSelectableTarget = isYearPageButton || isMonthPageButton
      ? Array.from({ length: isYearPageButton ? 120 : 12 }, (_, monthIndex) => (
          startOfMonth(new Date(targetPageStartYear, monthIndex, 1))
        )).some((month) => (
          !isMonthOutsideBounds(month, panelBounds)
          && hasSelectableDateInMonth(month)
        ))
      : !isMonthOutsideBounds(targetMonth, panelBounds)
        && hasSelectableDateInMonth(targetMonth)
    const leftMonth = panelName === 'left'
      ? targetMonth
      : startOfMonth(panel.leftPanelDate)
    const rightMonth = panelName === 'right'
      ? targetMonth
      : startOfMonth(panel.rightPanelDate)
    const isPanelOrderDisabled = Boolean(bounds) && ((
      panelName === 'left' && offset > 0 && leftMonth.getTime() >= rightMonth.getTime()
    ) || (
      panelName === 'right' && offset < 0 && rightMonth.getTime() <= leftMonth.getTime()
    ))
    const isDirectionDisabled = Boolean(bounds && selectedMonth) && (
      (panelName === 'left' && offset > 0 && targetMonth.getTime() > selectedMonth.getTime())
      || (panelName === 'right' && offset < 0 && targetMonth.getTime() < selectedMonth.getTime())
    )
    const distance = getPanelMonthDistance(leftMonth, rightMonth)
    let shiftedPeerMonth = null
    if (bounds && props.maxMonths && distance > props.maxMonths) {
      shiftedPeerMonth = panelName === 'left'
        ? startOfMonth(addMonths(leftMonth, props.maxMonths))
        : startOfMonth(subMonths(rightMonth, props.maxMonths))
    } else if (selectedMonth) {
      if (panelName === 'left' && leftMonth.getTime() < selectedMonth.getTime()) {
        shiftedPeerMonth = selectedMonth
      } else if (panelName === 'right' && rightMonth.getTime() > selectedMonth.getTime()) {
        shiftedPeerMonth = selectedMonth
      }
    }
    const isShiftedPeerDisabled = shiftedPeerMonth
      ? !hasSelectableDateInMonth(shiftedPeerMonth)
      : false
    const isDisabled = !hasSelectableTarget || (!isYearPageButton && (
      isPanelOrderDisabled
      || isShiftedPeerDisabled
      || isDirectionDisabled
    ))
    button.classList.toggle('is-disabled', isDisabled)
    if (isDisabled) {
      button.setAttribute('aria-disabled', 'true')
    } else {
      button.removeAttribute('aria-disabled')
    }
  })
}

const handlePanelLinkedNavigation = (panel, event) => {
  const button = event.target?.closest?.(
    '.ivu-date-picker-prev-btn-arrow-double, .ivu-date-picker-prev-btn-arrow, .ivu-date-picker-next-btn-arrow-double, .ivu-date-picker-next-btn-arrow'
  )
  if (!button) return

  const panelContent = button.closest('.ivu-picker-panel-content-left, .ivu-picker-panel-content-right')
  if (!panelContent) return
  const panelName = panelContent.classList.contains('ivu-picker-panel-content-left')
    ? 'left'
    : 'right'

  const isPrevious = button.classList.contains('ivu-date-picker-prev-btn-arrow')
    || button.classList.contains('ivu-date-picker-prev-btn-arrow-double')
  const monthOffset = button.classList.contains('ivu-date-picker-prev-btn-arrow-double')
    || button.classList.contains('ivu-date-picker-next-btn-arrow-double')
    ? 12
    : 1
  const linkedNavigation = getLinkedPanelNavigation(
    panel,
    panelName,
    isPrevious ? -monthOffset : monthOffset
  )
  if (!linkedNavigation) return

  event.preventDefault()
  event.stopImmediatePropagation()
  if (linkedNavigation.isDisabled) {
    syncPanelPresentation(panel)
    return
  }

  panel[`${linkedNavigation.peerPanelName}PanelDate`] = linkedNavigation.targetMonth
  nextTick(() => syncPanelPresentation(panel))
}

const syncPanelTablePresentation = (panel) => {
  const panelElement = panel?.$el
  if (!panelElement) return

  ;['left', 'right'].forEach((panelName) => {
    const tableType = panel[`${panelName}PickerTable`]
    if (tableType !== 'month-table' && tableType !== 'year-table') return

    const panelDate = panel[`${panelName}PanelDate`]
    const cells = panelElement.querySelectorAll(
      `.ivu-picker-panel-content-${panelName} .ivu-date-picker-cells-cell`
    )
    const bounds = getPanelSelectableMonthBounds(panel, panelName)

    cells.forEach((cell, index) => {
      let isDisabled = false
      if (tableType === 'month-table') {
        const cellMonth = startOfMonth(new Date(panelDate.getFullYear(), index, 1))
        isDisabled = isMonthOutsideBounds(cellMonth, bounds)
          || !hasSelectableDateInMonth(cellMonth)
      } else {
        const year = Number(cell.textContent?.trim())
        const isCurrentPanelYear = year === panelDate.getFullYear()
        const selectableMonths = Array.from({ length: 12 }, (_, monthIndex) => (
          startOfMonth(new Date(year, monthIndex, 1))
        )).filter((cellMonth) => (
          !isMonthOutsideBounds(cellMonth, bounds)
          && hasSelectableDateInMonth(cellMonth)
        ))
        isDisabled = !isCurrentPanelYear && !selectableMonths.length
      }

      cell.classList.toggle('is-range-disabled', isDisabled)
      cell.classList.toggle('ivu-date-picker-cells-cell-disabled', isDisabled)
      if (isDisabled) {
        cell.setAttribute('aria-disabled', 'true')
      } else {
        cell.removeAttribute('aria-disabled')
      }
    })
  })
}

const syncPanelPresentation = (panel) => {
  syncPanelNavigationPresentation(panel)
  syncPanelTablePresentation(panel)
}

const positionPanelsAfterMonthSelection = (panel, panelName, targetMonth) => {
  const selectedMonth = panel?.rangeState?.selecting && panel.rangeState.from
    ? startOfMonth(panel.rangeState.from)
    : null
  if (!selectedMonth) {
    panel[`${panelName}PanelDate`] = targetMonth
    return
  }

  if (targetMonth.getTime() < selectedMonth.getTime()) {
    panel.leftPanelDate = targetMonth
    panel.rightPanelDate = selectedMonth
  } else if (targetMonth.getTime() > selectedMonth.getTime()) {
    panel.leftPanelDate = selectedMonth
    panel.rightPanelDate = targetMonth
  } else if (panelName === 'left') {
    panel.leftPanelDate = selectedMonth
    panel.rightPanelDate = startOfMonth(addMonths(selectedMonth, 1))
  } else {
    panel.leftPanelDate = startOfMonth(subMonths(selectedMonth, 1))
    panel.rightPanelDate = selectedMonth
  }
}

const handlePanelMonthTableClick = (panel, event) => {
  const cell = event.target?.closest?.('.ivu-date-picker-cells-month .ivu-date-picker-cells-cell')
  if (!cell) return

  const panelContent = cell.closest('.ivu-picker-panel-content-left, .ivu-picker-panel-content-right')
  if (!panelContent) return
  const panelName = panelContent.classList.contains('ivu-picker-panel-content-left')
    ? 'left'
    : 'right'
  if (panel[`${panelName}PickerTable`] !== 'month-table') return

  const cells = Array.from(panelContent.querySelectorAll(
    '.ivu-date-picker-cells-month .ivu-date-picker-cells-cell'
  ))
  const monthIndex = cells.indexOf(cell)
  if (monthIndex < 0) return

  const panelDate = panel[`${panelName}PanelDate`]
  const targetMonth = startOfMonth(new Date(panelDate.getFullYear(), monthIndex, 1))
  const bounds = getPanelSelectableMonthBounds(panel, panelName)

  event.preventDefault()
  event.stopImmediatePropagation()
  if (
    isMonthOutsideBounds(targetMonth, bounds)
    || !hasSelectableDateInMonth(targetMonth)
  ) {
    syncPanelPresentation(panel)
    return
  }

  positionPanelsAfterMonthSelection(panel, panelName, targetMonth)
  resetPickerTables()
  enforcePanelConstraints(panel, 'left')
  enforcePanelConstraints(panel, 'right')
  nextTick(() => syncPanelPresentation(panel))
}

const handlePanelYearTableClick = (panel, event) => {
  const cell = event.target?.closest?.('.ivu-date-picker-cells-year .ivu-date-picker-cells-cell')
  if (!cell) return

  const panelContent = cell.closest('.ivu-picker-panel-content-left, .ivu-picker-panel-content-right')
  if (!panelContent) return
  const panelName = panelContent.classList.contains('ivu-picker-panel-content-left')
    ? 'left'
    : 'right'
  if (panel[`${panelName}PickerTable`] !== 'year-table') return

  const year = Number(cell.textContent?.trim())
  const panelDate = panel[`${panelName}PanelDate`]
  const bounds = getPanelSelectableMonthBounds(panel, panelName)
  const selectableMonths = Array.from({ length: 12 }, (_, monthIndex) => (
    startOfMonth(new Date(year, monthIndex, 1))
  )).filter((cellMonth) => (
    !isMonthOutsideBounds(cellMonth, bounds)
    && hasSelectableDateInMonth(cellMonth)
  ))
  const isCurrentPanelYear = year === panelDate.getFullYear()

  event.preventDefault()
  event.stopImmediatePropagation()
  if (!isCurrentPanelYear && !selectableMonths.length) {
    syncPanelPresentation(panel)
    return
  }

  const currentPanelMonth = startOfMonth(panelDate)
  const targetMonth = (
    year === currentPanelMonth.getFullYear()
    && !isMonthOutsideBounds(currentPanelMonth, bounds)
    && hasSelectableDateInMonth(currentPanelMonth)
  )
    ? currentPanelMonth
    : selectableMonths[0] || currentPanelMonth

  panel[`${panelName}PanelDate`] = targetMonth
  panel[`${panelName}PickerTable`] = 'month-table'
  nextTick(() => syncPanelPresentation(panel))
}

const handlePanelTableNavigation = (panel, event) => {
  const button = event.target?.closest?.(
    '.ivu-date-picker-prev-btn-arrow-double, .ivu-date-picker-next-btn-arrow-double'
  )
  if (!button) return

  const panelContent = button.closest('.ivu-picker-panel-content-left, .ivu-picker-panel-content-right')
  if (!panelContent) return
  const panelName = panelContent.classList.contains('ivu-picker-panel-content-left')
    ? 'left'
    : 'right'
  const tableType = panel[`${panelName}PickerTable`]
  if (tableType !== 'month-table' && tableType !== 'year-table') return

  event.preventDefault()
  event.stopImmediatePropagation()

  const direction = button.classList.contains('ivu-date-picker-prev-btn-arrow-double')
    ? -1
    : 1
  const targetPanelDate = startOfMonth(
    addYears(
      panel[`${panelName}PanelDate`],
      direction * (tableType === 'year-table' ? 10 : 1)
    )
  )
  const targetPageStartYear = tableType === 'year-table'
    ? Math.floor(targetPanelDate.getFullYear() / 10) * 10
    : targetPanelDate.getFullYear()
  const bounds = getPanelSelectableMonthBounds(panel, panelName)
  const hasSelectableTarget = Array.from({
    length: tableType === 'year-table' ? 120 : 12,
  }, (_, monthIndex) => (
    startOfMonth(new Date(targetPageStartYear, monthIndex, 1))
  )).some((month) => (
    !isMonthOutsideBounds(month, bounds)
    && hasSelectableDateInMonth(month)
  ))
  if (!hasSelectableTarget) {
    syncPanelPresentation(panel)
    return
  }

  panel[`${panelName}PanelDate`] = targetPanelDate
  nextTick(() => syncPanelPresentation(panel))
}

const preparePanelForRangeTable = (panel, panelName, tableType, previousTableType) => {
  const rangeState = panel?.rangeState
  if (
    previousTableType !== 'date-table'
    || tableType === 'date-table'
    || !rangeState?.selecting
    || !rangeState.from
  ) return

  const selectedMonth = startOfMonth(rangeState.from)
  const panelDateKey = `${panelName}PanelDate`
  if (startOfMonth(panel[panelDateKey]).getTime() !== selectedMonth.getTime()) return

  const otherPanelName = panelName === 'left' ? 'right' : 'left'
  panel[`${otherPanelName}PanelDate`] = selectedMonth
  panel[`${otherPanelName}PickerTable`] = 'date-table'
  panel[panelDateKey] = panelName === 'left'
    ? startOfMonth(subMonths(selectedMonth, 1))
    : startOfMonth(addMonths(selectedMonth, 1))
}

const syncPanelDateConstraints = () => {
  const panel = datePickerRef.value?.$refs?.pickerPanel
  if (!props.type.includes('range') || panel === watchedPickerPanel) return

  stopPanelDateWatchers.forEach((stop) => stop())
  watchedPickerPanel = panel
  stopPanelDateWatchers = []
  if (!panel) return

  const handleLinkedNavigation = (event) => handlePanelLinkedNavigation(panel, event)
  const handleMonthTableClick = (event) => handlePanelMonthTableClick(panel, event)
  const handleYearTableClick = (event) => handlePanelYearTableClick(panel, event)
  const handleTableNavigation = (event) => handlePanelTableNavigation(panel, event)
  panel.$el.addEventListener('click', handleLinkedNavigation, true)
  panel.$el.addEventListener('click', handleMonthTableClick, true)
  panel.$el.addEventListener('click', handleTableNavigation, true)
  panel.$el.addEventListener('click', handleYearTableClick, true)
  stopPanelDateWatchers = [
    () => panel.$el.removeEventListener('click', handleLinkedNavigation, true),
    () => panel.$el.removeEventListener('click', handleMonthTableClick, true),
    () => panel.$el.removeEventListener('click', handleTableNavigation, true),
    () => panel.$el.removeEventListener('click', handleYearTableClick, true),
    watch(() => panel.leftPanelDate, () => {
      if (panel.leftPickerTable === 'date-table') {
        enforcePanelConstraints(panel, 'left')
      }
      nextTick(() => syncPanelPresentation(panel))
    }),
    watch(() => panel.rightPanelDate, () => {
      if (panel.rightPickerTable === 'date-table') {
        enforcePanelConstraints(panel, 'right')
      }
      nextTick(() => syncPanelPresentation(panel))
    }),
    watch(
      () => [panel.rangeState?.selecting, panel.rangeState?.from],
      ([selecting, from], [previousSelecting, previousFrom]) => {
        const isNewSelection = selecting && from && (
          !previousSelecting
          || !previousFrom
          || from.getTime() !== previousFrom.getTime()
        )
        if (isNewSelection) {
          alignPanelsToNewRangeSelection(panel, from)
        }
        enforcePanelConstraints(panel, 'left')
        enforcePanelConstraints(panel, 'right')
        nextTick(() => syncPanelPresentation(panel))
      }
    ),
    watch(
      () => [panel.leftPickerTable, panel.rightPickerTable],
      ([leftTable, rightTable], [previousLeftTable, previousRightTable]) => {
        preparePanelForRangeTable(panel, 'left', leftTable, previousLeftTable)
        preparePanelForRangeTable(panel, 'right', rightTable, previousRightTable)
        nextTick(() => syncPanelPresentation(panel))
      }
    ),
  ]
  enforcePanelConstraints(panel, 'right')
  syncPanelPresentation(panel)
}

const disabledDate = (date) => {
    let isOutOfRange = false
    if (props.maxMonths && datePickerRef.value && datePickerRef.value.$refs.pickerPanel) {
      const rangeState = datePickerRef.value.$refs.pickerPanel.rangeState
      if (rangeState && rangeState.selecting && rangeState.from) {
        const fromDate = rangeState.from
        let maxDate = addMonths(fromDate, props.maxMonths)
        let minDate = subMonths(fromDate, props.maxMonths)

        if (props.maxMonths === 1) {
          if (differenceInDays(maxDate, fromDate) > 30) maxDate = addDays(fromDate, 30)
          if (differenceInDays(fromDate, minDate) > 30) minDate = subDays(fromDate, 30)
        }

        if (date.getTime() > maxDate.getTime() || date.getTime() < minDate.getTime()) {
          isOutOfRange = true
        }
      }
    }

    if (props.disableAfterToday) {
      const endOfToday = getTimezoneEndOfToday();
      return isOutOfRange || (date && date.getTime() > endOfToday.getTime());
    } else {
      return isOutOfRange
    }
}
const isDateDisabled = (date) => {
  const externalDisabledDate = attrs.options?.disabledDate
  return Boolean(
    disabledDate(date)
    || (typeof externalDisabledDate === 'function' && externalDisabledDate(date))
  )
}
const dateOptions=computed(()=>{
  switch(props.type){
    case 'date':
      return {
        placeholder:t('datePicker.datePlaceholder'),
        format:'yyyy-MM-dd',
        'start-date': props.defaultDate ? parseCalendarDate(props.defaultDate) : getTimezoneToday(),
        options:{
          disabledDate: isDateDisabled,
        }
      }
    case 'daterange':
     return {
        placeholder:t('datePicker.rangePlaceholder'),
        format:'yyyy-MM-dd',
        'start-date':props.data?.[props.endKey]?null: props.disableAfterToday ? subMonths(getTimezoneToday(), 1) : getTimezoneToday(),
        options:{
          disabledDate: isDateDisabled,
          shortcuts: !props.notDateOptions ? (() => {
            const list = [
              { text: t('datePicker.today'), value: () => setQuickDate(0,'day') },
              { text: t('datePicker.yesterday'), value: () => setQuickDate(1,'day') },
              { text: t('datePicker.thisWeek'), value: () => setQuickDate(0,'this_week') },
              { text: t('datePicker.thisMonth'), value: () => setQuickDate(0,'this_month') },
              { text: t('datePicker.lastMonth'), value: () => setQuickDate(1,'last_month') }
            ];

            if (!props.maxMonths) {
              list.push({ text: t('datePicker.recentMonths', { count: 3 }), value: () => setQuickDate(3,'months') });
              list.push({ text: t('datePicker.recentMonths', { count: 6 }), value: () => setQuickDate(6,'months') });
              list.push({ text: t('datePicker.recentYears', { count: 1 }), value: () => setQuickDate(1,'year') });
            } else {
              // 自动补充小于等于 maxMonths 的标准快捷项
              if (props.maxMonths > 1) {
                list.push({ text: t('dateRange.last30Days'), value: () => setQuickDate(30,'days') });
              }
              if (props.maxMonths > 3) {
                list.push({ text: t('datePicker.recentMonths', { count: 3 }), value: () => setQuickDate(3,'months') });
              }
              if (props.maxMonths > 6) {
                list.push({ text: t('datePicker.recentMonths', { count: 6 }), value: () => setQuickDate(6,'months') });
              }

              // 添加当前的 maxMonths 作为最大快捷选项（如果不在上方添加过的话）
              if (props.maxMonths === 1) {
                list.push({ text: t('dateRange.last30Days'), value: () => setQuickDate(30,'days') });
              } else {
                list.push({ text: t('datePicker.recentMonths', { count: props.maxMonths }), value: () => setQuickDate(props.maxMonths,'months') });
              }
            }

            const shiftDisabled = getRangeShiftDisabledState();
            list.push({
              text: t('datePicker.rangePrevious'),
              disabled: shiftDisabled.previous,
              ...(shiftDisabled.previous ? {} : { value: () => getShiftedDates(-1) }),
            });
            list.push({
              text: t('datePicker.rangeNext'),
              disabled: shiftDisabled.next,
              ...(shiftDisabled.next ? {} : { value: () => getShiftedDates(1) }),
            });

            return list;
          })() : [],
        }
      }
    default:
      return 'date'
  }
})
const mergedDatePickerOptions = computed(() => {
  const externalOptions = attrs.options && typeof attrs.options === 'object'
    ? attrs.options
    : {}
  const internalOptions = dateOptions.value?.options || {}
  return {
    ...externalOptions,
    ...internalOptions,
    disabledDate: isDateDisabled,
  }
})
const transferClassName = computed(() => [
  'form-date-box-dropdown',
  props.notDateOptions ? 'notDateOptions' : '',
].filter(Boolean).join(' '))
const emits = defineEmits(['update:modelValue', 'on-change'])
const normalizeRangeValue = (value) => {
  if (Array.isArray(value)) return value
  if (!value) return []
  if (typeof value === 'string') {
    const rangeValue = value.split(/\s*~\s*|\s*,\s*/).map((item) => item.trim()).filter(Boolean)
    return rangeValue.length === 2 ? rangeValue : []
  }
  return []
}
const isRangeValueEmpty = (value) => !normalizeRangeValue(value).some(Boolean)
const formatDateValue = (value) => {
  if (!value) return value
  if (typeof value === 'string') return value
  return format(value, dateOptions.value.format)
}
const c_modelValue = computed({
  get() {
    if(props.type.includes('range')){
      if(props.data){
        if(props.data[props.startKey] && props.data[props.endKey]){
          return [props.data[props.startKey], props.data[props.endKey]]
        }
        return []
      }else if(props.isSring && typeof props.modelValue === 'string'){
        return props.modelValue?.split(',') || []
      }
      return normalizeRangeValue(props.modelValue)
    }
    return props.modelValue
  },
  set(value) {
    if(props.type.includes('range')){
      value = normalizeRangeValue(value).map(formatDateValue)
      if (!value.some(Boolean)) value = []
      if(props.data){
        props.data[props.startKey]=value?.[0]
        props.data[props.endKey]=value?.[1]
      }else if(props.isSring){
        emits('update:modelValue', value.join(','))
      }else{
        emits('update:modelValue', value)
      }
    } else {
      emits('update:modelValue', value ? formatDateValue(value) : '')
    }
  },
})
const onChange=(value)=>{
  emits('on-change', value)
  nextTick(() => {
    if(props.type.includes('range') && isRangeValueEmpty(value)) {
      resetPickerPanel()
    }
    syncInputPresentation()
  })
}
const syncInputPresentation = () => {
  if(!datePickerRef.value?.$el) return
  const inputs = datePickerRef.value.$el.querySelectorAll('input')
  inputs.forEach((input) => {
    const fullText = input.value || input.placeholder || ''
    if(fullText){
      input.setAttribute('title', fullText)
    }else{
      input.removeAttribute('title')
    }
    if(isPhone){
      input.setAttribute('readonly', 'readonly')
      input.setAttribute('inputmode', 'none')
    }
  })
}
const syncShortcutPresentation = () => {
  const panel = datePickerRef.value?.$refs?.pickerPanel?.$el
  const shortcuts = dateOptions.value?.options?.shortcuts || []
  panel?.querySelectorAll('.ivu-picker-panel-shortcut').forEach((shortcut, index) => {
    const fullText = shortcut.textContent?.trim()
    if(fullText) shortcut.setAttribute('title', fullText)
    const isDisabled = Boolean(shortcuts[index]?.disabled)
    shortcut.classList.toggle('is-disabled', isDisabled)
    if(isDisabled){
      shortcut.setAttribute('aria-disabled', 'true')
    }else{
      shortcut.removeAttribute('aria-disabled')
    }
  })
}
const handleOpenChange=(visible)=>{
  nextTick(() => {
    if(!visible) resetPickerTables()
    syncInputPresentation()
    if(visible) {
      if(props.type.includes('range') && isRangeValueEmpty(c_modelValue.value)) {
        resetPickerPanel()
      }
      syncPanelDateConstraints()
      syncShortcutPresentation()
    }
  })
}
watch(c_modelValue, (value) => nextTick(() => {
  if(props.type.includes('range') && isRangeValueEmpty(value)) {
    resetPickerPanel()
  }
  syncInputPresentation()
  syncShortcutPresentation()
}), { deep: true })
onMounted(() => {
  nextTick(syncInputPresentation)
})
onBeforeUnmount(() => {
  stopPanelDateWatchers.forEach((stop) => stop())
})
</script>
<style lang="less">
.form-date-box{
  min-width: 0;
  .ivu-input{
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}
.form-date-box-dropdown{
  .ivu-picker-panel-shortcut{
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    &.is-disabled{
      color: var(--ui-color-control-text-disabled);
      cursor: not-allowed;
    }
  }
  .ivu-picker-panel-icon-btn{
    color: var(--ui-color-text-muted);
    &.is-disabled{
      color: var(--ui-color-control-text-disabled) !important;
      cursor: not-allowed;
      pointer-events: none;
    }
  }
  .ivu-date-picker-cells-month,
  .ivu-date-picker-cells-year{
    .ivu-date-picker-cells-cell:not(.is-range-disabled):not(.ivu-date-picker-cells-cell-selected){
      color: var(--ui-color-primary);
    }
    .ivu-date-picker-cells-cell:not(.is-range-disabled){
      cursor: pointer;
      pointer-events: auto;
    }
  }
  .ivu-date-picker-cells-cell.is-range-disabled{
    color: var(--ui-color-control-text-disabled) !important;
    background: transparent !important;
    cursor: not-allowed;
    pointer-events: none;
    em{
      color: var(--ui-color-control-text-disabled) !important;
      background: transparent !important;
    }
  }
}
.notDateOptions{
  .ivu-date-picker-with-range{
    padding-left: 0 !important;
  }
}
.ivu-picker-panel-body-wrapper {
  &.ivu-date-picker-with-range {
    --width: 120px;
    /* PC端正常布局：保持侧边栏加宽，防止“近6个月”等文字折行或被截断 */
    @media screen and (min-width: 769px) {
      padding-left: var(--width);
      .ivu-picker-panel-sidebar {
        width: var(--width);
        margin-left: calc(var(--width) * -1);
      }
    }

    /* 手机端响应式处理：将侧边栏改为顶部横向滚动，将左右双日历改为上下堆叠 */
    @media screen and (max-width: 768px) {
      overflow: hidden;
      .ivu-picker-panel-body{
        display: flex;
        flex-direction: column;
        width: 100%;
        max-width:100%;
        min-width: 100%;
        >*{
          margin: 0 !important;
          padding: 0 !important;
          &:not(:last-child){
            border-bottom: var(--ui-border-divider);
          }
        }
        .ivu-date-picker-cells{
          padding: 0 !important;
          .ivu-date-picker-cells-header{
            display: flex;
            >*{
              flex: 1;
              overflow: hidden;
            }
          }
        }
      }
    }
  }
}
</style>
