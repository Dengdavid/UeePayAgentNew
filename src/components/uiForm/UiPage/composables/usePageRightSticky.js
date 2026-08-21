import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'

/**
 * 管理 UiPage 右侧栏的 sticky top，并在全局消息栏高度变化后重新计算。
 */
export const usePageRightSticky = ({ isPhone }) => {
  const pageRef = ref(null)
  const pageRightRef = ref(null)
  const stickyTop = ref(0)
  const viewportHeight = ref(0)
  const pageRightHeight = ref(0)
  let stickyHeaderResizeObserver = null
  let pageRightResizeObserver = null
  let initialPageTop = null

  const pageRightStickyStyle = computed(() => {
    const viewportGap = 16
    const availableHeight = viewportHeight.value - stickyTop.value - viewportGap
    const top = pageRightHeight.value > availableHeight
      ? viewportHeight.value - pageRightHeight.value - viewportGap
      : stickyTop.value

    return { top: `${Math.min(top, stickyTop.value)}px` }
  })

  const updatePageRightHeight = () => {
    pageRightHeight.value = pageRightRef.value?.getBoundingClientRect().height || 0
  }

  const updateStickyLayout = () => {
    if (!pageRef.value || isPhone) {
      stickyTop.value = 0
      return
    }
    viewportHeight.value = window.innerHeight
    updatePageRightHeight()

    const stickyHeader = document.querySelector('.sticky-header')
    if (stickyHeader) {
      stickyTop.value = Math.max(Math.round(stickyHeader.getBoundingClientRect().bottom) + 16, 0)
      return
    }

    initialPageTop ??= Math.max(Math.round(pageRef.value.getBoundingClientRect().top), 0)
    stickyTop.value = initialPageTop
  }

  const refreshStickyTop = () => {
    nextTick(() => {
      window.requestAnimationFrame(updateStickyLayout)
    })
  }

  const refreshPageRightHeight = () => {
    nextTick(() => {
      window.requestAnimationFrame(updatePageRightHeight)
    })
  }

  onMounted(() => {
    if (typeof window === 'undefined') return

    window.addEventListener('resize', refreshStickyTop)
    refreshStickyTop()

    const stickyHeader = document.querySelector('.sticky-header')
    if (stickyHeader && typeof ResizeObserver !== 'undefined') {
      stickyHeaderResizeObserver = new ResizeObserver(refreshStickyTop)
      stickyHeaderResizeObserver.observe(stickyHeader)
    }

    if (pageRightRef.value && typeof ResizeObserver !== 'undefined') {
      pageRightResizeObserver = new ResizeObserver(refreshPageRightHeight)
      pageRightResizeObserver.observe(pageRightRef.value)
    }
  })

  onBeforeUnmount(() => {
    stickyHeaderResizeObserver?.disconnect?.()
    pageRightResizeObserver?.disconnect?.()
    if (typeof window !== 'undefined') {
      window.removeEventListener('resize', refreshStickyTop)
    }
  })

  return {
    pageRef,
    pageRightRef,
    pageRightStickyStyle,
    refreshStickyTop,
  }
}
