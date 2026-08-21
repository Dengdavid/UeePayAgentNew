import { onMounted, onUnmounted, ref } from 'vue';
export function useWindowResize(callback, delay = 200) {
  let timer = null;
  const width = ref(window.innerWidth);
  const height = ref(window.innerHeight);

  const handler = () => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      width.value = window.innerWidth;
      height.value = window.innerHeight;

      if (callback) {
        callback(width.value, height.value);
      }
    }, delay);
  };

  onMounted(() => {
    window.addEventListener('resize', handler);
    handler(); // 初始化
  });

  onUnmounted(() => {
    window.removeEventListener('resize', handler);
    if (timer) clearTimeout(timer);
  });

  return { width, height };
}
