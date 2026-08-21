<template>
  <div ref="chartRef" class="echart-container"></div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch, shallowRef } from 'vue';
import * as echarts from 'echarts';
import { useWindowResize } from '@/utils/onWindowResize.js'
// 定义 Props
const props = defineProps({
  // ECharts 配置项
  option: {
    type: Object,
    required: true,
    default: () => ({})
  },
  // 主题名称 (如 'dark', 'macarons' 或自定义主题对象)
  theme: {
    type: [String, Object],
    default: ''
  },
  // 是否自动调整大小
  autoResize: {
    type: Boolean,
    default: true
  }
});

// 定义 Emits
const emit = defineEmits(['chart-ready']);

// 模板引用
const chartRef = ref(null);
// 使用 shallowRef 存储 echarts 实例，避免深度响应式导致性能问题
const chartInstance = shallowRef(null);

// 初始化图表
const initChart = () => {
  if (!chartRef.value) return;

  // 如果实例已存在，先销毁（防止重复初始化）
  if (chartInstance.value) {
    chartInstance.value.dispose();
  }

  // 创建实例
  chartInstance.value = echarts.init(chartRef.value, props.theme);

  // 设置初始配置
  if (props.option) {
    chartInstance.value.setOption(props.option, true); // true 表示不合并，完全重置
  }

  // 通知父组件图表已就绪
  emit('chart-ready', chartInstance.value);
};

// 监听窗口大小变化实现自适应
const handleResize = () => {
  if (chartInstance.value) {
    chartInstance.value.resize();
  }
};

// 监听 option 变化
watch(
  () => props.option,
  (newVal) => {
    if (chartInstance.value && newVal) {
      // 默认使用 merge 模式更新，性能更好
      // 如果需要完全重置，可以将第二个参数改为 true
      chartInstance.value.setOption(newVal, { notMerge: false }); 
    }
  },
  { deep: true } // 深度监听对象内部变化
);

// 监听 theme 变化 (较少见，通常主题在初始化时确定)
watch(() => props.theme, () => {
  initChart();
});
useWindowResize(handleResize)
// 生命周期钩子
onMounted(() => {
  initChart();
});

onBeforeUnmount(() => {
  if (chartInstance.value) {
    chartInstance.value.dispose();
    chartInstance.value = null;
  }
});

// 暴露方法给父组件 (可选)
defineExpose({
  getInstance: () => chartInstance.value,
  resize: handleResize
});
</script>

<style scoped>
.echart-container {
  width: 100%;
  height: 100%;
  /* 必须给容器一个最小高度，否则可能无法显示 */
  min-height: 300px; 
}
</style>
