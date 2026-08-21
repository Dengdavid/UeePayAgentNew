import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'

const DRAWER_HEADER_HEIGHT = 56
const DEFAULT_MAX_HEIGHT = 500

/**
 * 管理移动端统计/右侧内容抽屉的内容测量和自适应高度。
 */
export const useCountsDrawer = () => {
  const countsShow = ref(false)
  const countsBodyRef = ref(null)
  const contentHeight = ref(0)
  const maxHeight = ref(0)
  let resizeObserver = null

  const countsDrawerBodyStyle = { padding: 0 }
  const normalizeHeight = (height) => Math.max(Math.ceil(height), 101)
  const countsDrawerHeight = computed(() => {
    const availableHeight = maxHeight.value || DEFAULT_MAX_HEIGHT
    if (!contentHeight.value) return normalizeHeight(availableHeight)
    return normalizeHeight(Math.min(contentHeight.value + DRAWER_HEADER_HEIGHT, availableHeight))
  })

  const updateMaxHeight = () => {
    if (typeof window === 'undefined') return
    maxHeight.value = Math.floor(window.innerHeight * 0.8)
  }

  const updateContentHeight = () => {
    if (!countsBodyRef.value) return
    contentHeight.value = Math.ceil(countsBodyRef.value.scrollHeight)
  }

  const initObserver = () => {
    updateMaxHeight()
    updateContentHeight()
    if (typeof window !== 'undefined') {
      window.requestAnimationFrame(updateContentHeight)
    }
    if (!countsBodyRef.value || typeof ResizeObserver === 'undefined') return

    resizeObserver?.disconnect?.()
    resizeObserver = new ResizeObserver(updateContentHeight)
    resizeObserver.observe(countsBodyRef.value)
  }

  watch(countsShow, (show) => {
    if (show) {
      nextTick(initObserver)
      return
    }
    resizeObserver?.disconnect?.()
    resizeObserver = null
  })

  onMounted(() => {
    updateMaxHeight()
    if (typeof window !== 'undefined') {
      window.addEventListener('resize', updateMaxHeight)
    }
  })

  onBeforeUnmount(() => {
    resizeObserver?.disconnect?.()
    if (typeof window !== 'undefined') {
      window.removeEventListener('resize', updateMaxHeight)
    }
  })

  return {
    countsShow,
    countsBodyRef,
    countsDrawerHeight,
    countsDrawerBodyStyle,
  }
}
