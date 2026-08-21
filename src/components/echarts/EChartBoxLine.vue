<template>
   <EChartBox :option="optionLine"/>
</template>

<script setup>
import { computed } from 'vue';
import * as echarts from 'echarts';
import EChartBox from '@/components/echarts/EChartBox.vue';
import { t } from '@/utils';

// 定义 Props
const props = defineProps({
  // X 轴数据（通常为日期时间数组）
  xData: {
    type: Array,
    default: () => [],
  },
  // Y 轴数据（通常为数值数组）
  yData: {
    type: Array,
    default: () => [],
  },
  // 图例/系列名称
  title: {
    type: String,
    default: ''
  },
  // 金额单位
  unit: {
    type: String,
    default: '$'
  }
});

// 基础颜色配置
const chartLineColor = '#2F7BFF'
const tooltipBgColor = '#FFFFFF'
const upColor = '#36CE9E'
const downColor = '#FF515A'
let color = [chartLineColor, '#36CE9E', '#FFC005', '#FF515A', '#8B5CFF', '#00CA69']

/**
 * 将十六进制颜色转换为 RGBA 格式
 * @param {string} hex 十六进制颜色代码 (e.g. #3469FF)
 * @param {number} opacity 透明度 (0-1)
 * @returns {string} rgba 颜色字符串
 */
const hexToRgba = (hex, opacity) => {
  let rgbaColor = ''
  let reg = /^#[\da-f]{6}$/i
  if (reg.test(hex)) {
    rgbaColor = `rgba(${parseInt('0x' + hex.slice(1, 3))},${parseInt(
      '0x' + hex.slice(3, 5)
    )},${parseInt('0x' + hex.slice(5, 7))},${opacity})`
  }
  return rgbaColor
}

const escapeHtml = (value) => String(value ?? '').replace(/[&<>"']/g, (char) => ({
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
}[char]))

const formatAmount = (value) => {
  const amount = Number(value)
  if (!Number.isFinite(amount)) return '--'
  return Number(value)
}

const getCompareText = (current, prev) => {
  const currentValue = Number(current)
  const prevValue = Number(prev)
  if (!Number.isFinite(currentValue) || !Number.isFinite(prevValue) || prevValue === 0) {
    return ''
  }

  const percent = ((currentValue - prevValue) / Math.abs(prevValue)) * 100
  const isUp = percent >= 0
  return `<div style="margin-top:6px;font-size:12px;line-height:16px;color:${isUp ? upColor : downColor};">${t(isUp ? 'chart.compareUp' : 'chart.compareDown')} ${isUp ? '+' : ''}${percent.toFixed(1)}%</div>`
}

const formatTooltip = (params) => {
  const item = Array.isArray(params) ? params[0] : params
  const dataIndex = item?.dataIndex ?? 0
  const currentValue =item?.value
  const dateText = escapeHtml(item?.axisValueLabel || item?.axisValue || '')
  const label = escapeHtml(props.title)
  const unit = escapeHtml(props.unit)
  const amountText = formatAmount(currentValue)
  const unitStyle = 'color:#1F2937;font-size:12px;font-weight:600;'
  const unitPrefix = unit === '$' ? `<span style="${unitStyle}">${unit}</span> ` : ''
  const unitSuffix = unit && unit !== '$' ? `<span style="${unitStyle}">${unit}</span>` : ''
  const compareText = getCompareText(currentValue, props.yData[dataIndex - 1])

  return `
    <div style="min-width:126px;">
      <div style="display:flex;align-items:center;gap:6px;color:#7F8AA3;font-size:12px;line-height:16px;">
        <span>${dateText}</span>
      </div>
      <div style="margin-top:10px;color:#4B5568;font-size:12px;line-height:20px;">
        ${label?`${label}: `:''}${unitPrefix}<span style="color:#1F2937;font-size:22px;font-weight:700;vertical-align:baseline;">${amountText}</span>${unitSuffix}
      </div>
      ${compareText}
    </div>
  `
}

/**
 * 响应式计算 ECharts 配置项
 * 使用 computed 确保数据更新时图表也随之刷新
 */
const optionLine = computed(() => ({
  color: color,
  // 提示框配置
  tooltip: {
    trigger: 'axis',
    confine: true,
    backgroundColor: tooltipBgColor,
    borderWidth: 0,
    padding: [12, 14],
    extraCssText: 'border-radius:10px;box-shadow:0 8px 24px rgba(20, 30, 50, 0.12);',
    formatter: formatTooltip,
    axisPointer: {
      type: 'line',
      lineStyle: {
        color: chartLineColor,
        width: 1,
        type: 'dashed',
        opacity: 0.55,
      },
    },
  },
  // 图例配置
  legend: {
    show: false,
  },
  // 布局网格
  grid: {
    top: 20,
    left: 0,
    right: 20,
    bottom: 20,
    containLabel: true,
  },
  // X 轴配置
  xAxis: [
    {
      type: 'category',
      boundaryGap: false,
      axisTick: {
        show: false,
      },
      axisLine: {
        lineStyle: {
          color: '#e8e8e8',
        },
      },
      axisLabel: {
        margin: 10,
        fontSize: 12,
        color: '#9e9e9e',
      },
      data: props.xData,
    },
  ],
  // Y 轴配置
  yAxis: [
    {
      type: 'value',
      axisTick: {
        show: false,
      },
      splitLine: {
        lineStyle: {
          color: '#e8e8e8',
        },
      },
      axisLine: {
        lineStyle: {
          color: '#e8e8e8',
        },
      },
      axisLabel: {
        margin: 10,
        fontSize: 12,
        color: '#9e9e9e',
      },
    },
  ],
  // 数据系列
  series: [
    {
      name: props.title,
      type: 'line',
      smooth: true,        // 折线平滑显示
      showSymbol: false,    // 默认不显示数据点，hover 时显示
      lineStyle: {
        color: chartLineColor,
        width: 2,
      },
      emphasis: {
        itemStyle: {
          color: chartLineColor,
          borderColor: '#FFFFFF',
          borderWidth: 2,
        },
      },
      // 区域渐变填充
      areaStyle: {
        color: new echarts.graphic.LinearGradient(
          0,
          0,
          0,
          1,
          [
            {
              offset: 0,
              color: hexToRgba(chartLineColor, 0.24),
            },
            {
              offset: 1,
              color: hexToRgba(chartLineColor, 0),
            },
          ],
          false
        ),
      },
      data: props.yData,
    },
  ],
}))
</script>

<style scoped>

</style>
