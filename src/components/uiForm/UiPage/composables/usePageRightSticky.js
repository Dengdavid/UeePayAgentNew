import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'

/**
 * 管理 UiPage 右侧栏的 sticky 位置和可用高度。
 */
export const usePageRightSticky = ({ isPhone }) => {
  const stickyGap = 16
  const pageRef = ref(null)
  const pageRightRef = ref(null)
  const stickyTop = ref(0)
  const viewportHeight = ref(0)
  const pageRightHeight = ref(0)
  let pageRightResizeObserver = null
  let scrollContainer = null
  let scrollTarget = null

  const pageRightStickyStyle = computed(() => {
    const availableHeight = viewportHeight.value - stickyTop.value - stickyGap
    const top = pageRightHeight.value > availableHeight
      ? viewportHeight.value - pageRightHeight.value - stickyGap
      : stickyTop.value

    return { top: `${Math.min(top, stickyTop.value)}px` }
  })

  const updatePageRightHeight = () => {
    pageRightHeight.value = pageRightRef.value?.getBoundingClientRect().height || 0
  }

  const updateStickyLayout = () => {
    if (!pageRef.value || isPhone) return
    scrollContainer ||= pageRef.value.closest('.ui-main')
    viewportHeight.value = scrollContainer?.clientHeight || window.innerHeight
    updatePageRightHeight()
  }

  const updateStickyTop = () => {
    const scrollTop = scrollContainer?.scrollTop ?? window.scrollY
    stickyTop.value = scrollTop > 0 ? stickyGap : 0
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

    scrollContainer = pageRef.value?.closest('.ui-main') || null
    scrollTarget = scrollContainer || window
    scrollTarget.addEventListener('scroll', updateStickyTop, { passive: true })
    window.addEventListener('resize', refreshStickyTop)
    updateStickyTop()
    refreshStickyTop()

    if (pageRightRef.value && typeof ResizeObserver !== 'undefined') {
      pageRightResizeObserver = new ResizeObserver(refreshPageRightHeight)
      pageRightResizeObserver.observe(pageRightRef.value)
    }
  })

  onBeforeUnmount(() => {
    pageRightResizeObserver?.disconnect?.()
    if (typeof window !== 'undefined') {
      scrollTarget?.removeEventListener('scroll', updateStickyTop)
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
