import { onBeforeUnmount, onMounted, ref } from 'vue'

const KEYBOARD_THRESHOLD = 80

export const useKeyboardViewportOffset = () => {
  const keyboardOffset = ref(0)
  const isKeyboardOpen = ref(false)
  let viewportBaseline = 0
  let focusResetTimer = null

  const isEditableElement = (element) => element instanceof HTMLElement && (
    element.matches('input, textarea, select, [contenteditable="true"]')
  )

  const updateKeyboardOffset = () => {
    const viewport = window.visualViewport
    if (!viewport) {
      keyboardOffset.value = 0
      isKeyboardOpen.value = isEditableElement(document.activeElement)
      return
    }

    const obscuredHeight = Math.max(
      0,
      window.innerHeight - viewport.height - viewport.offsetTop,
    )
    viewportBaseline = Math.max(viewportBaseline, viewport.height)
    const viewportReduction = Math.max(0, viewportBaseline - viewport.height)
    const viewportShowsKeyboard = Math.max(obscuredHeight, viewportReduction) > KEYBOARD_THRESHOLD

    keyboardOffset.value = viewportShowsKeyboard ? obscuredHeight : 0
    isKeyboardOpen.value = viewportShowsKeyboard || isEditableElement(document.activeElement)
  }

  const handleFocusIn = (event) => {
    if (!isEditableElement(event.target)) return
    window.clearTimeout(focusResetTimer)
    isKeyboardOpen.value = true
  }

  const handleFocusOut = () => {
    window.clearTimeout(focusResetTimer)
    focusResetTimer = window.setTimeout(updateKeyboardOffset, 120)
  }

  onMounted(() => {
    viewportBaseline = window.visualViewport?.height || window.innerHeight
    updateKeyboardOffset()
    window.visualViewport?.addEventListener('resize', updateKeyboardOffset)
    window.visualViewport?.addEventListener('scroll', updateKeyboardOffset)
    window.addEventListener('orientationchange', updateKeyboardOffset)
    document.addEventListener('focusin', handleFocusIn)
    document.addEventListener('focusout', handleFocusOut)
  })

  onBeforeUnmount(() => {
    window.clearTimeout(focusResetTimer)
    window.visualViewport?.removeEventListener('resize', updateKeyboardOffset)
    window.visualViewport?.removeEventListener('scroll', updateKeyboardOffset)
    window.removeEventListener('orientationchange', updateKeyboardOffset)
    document.removeEventListener('focusin', handleFocusIn)
    document.removeEventListener('focusout', handleFocusOut)
  })

  return { isKeyboardOpen, keyboardOffset }
}
