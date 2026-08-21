import { onBeforeUnmount, ref } from 'vue'

/**
 * 管理移动端列表滚动反馈、返回顶部按钮和浮动操作显隐。
 */
export const useMobileScroll = () => {
  const isScrolling = ref(false)
  const showBackTop = ref(false)
  const scrollBody = ref(null)
  let scrollTimer = null
  let ticking = false

  const scrollToTop = (behavior = 'smooth') => {
    scrollBody.value?.scrollTo({ top: 0, behavior })
    showBackTop.value = false
  }

  const handleScroll = (event) => {
    const scrollTop = event.target.scrollTop
    if (ticking) return

    window.requestAnimationFrame(() => {
      showBackTop.value = scrollTop > 300
      isScrolling.value = true
      if (scrollTimer) clearTimeout(scrollTimer)
      scrollTimer = setTimeout(() => {
        isScrolling.value = false
      }, 400)
      ticking = false
    })
    ticking = true
  }

  const handleBackToTop = () => scrollToTop('smooth')

  onBeforeUnmount(() => {
    if (scrollTimer) clearTimeout(scrollTimer)
  })

  return {
    isScrolling,
    showBackTop,
    scrollBody,
    scrollToTop,
    handleScroll,
    handleBackToTop,
  }
}
