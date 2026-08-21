export const vClickOutside = {
  beforeMount(el, binding) {

    el.clickOutsideHandler = (e) => {
      // 检查点击是否发生在 el 及其子元素之外
      if (!el.contains(e.target)) {
        binding.value?.() // 调用传入的回调函数
      }
    }
    document.addEventListener('click', el.clickOutsideHandler)
  },
  unmounted(el) {
    document.removeEventListener('click', el.clickOutsideHandler)
  }
}
