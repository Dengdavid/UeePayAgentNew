// composables/useWindowSize.js
import { onMounted, onUnmounted } from "vue";

export function useWindowSize(onResize) {
  let timeoutId = null;

  const handleResize = () => {
    // 可选：加防抖（避免高频触发）
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() => {
        setOnResize(window.innerWidth, window.innerHeight);
    }, 100); // 防抖 100ms
  };
  const setOnResize=()=>{
    if (typeof onResize === "function") {
        const _deviceType = getDeviceType();
        onResize(window.innerWidth, window.innerHeight, _deviceType);
    }
  }
  onMounted(() => {
    window.addEventListener("resize", handleResize);
    // 初始化时也调用一次（可选）
    setOnResize(window.innerWidth, window.innerHeight);
   
  });

  onUnmounted(() => {
    window.removeEventListener("resize", handleResize);
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
  });
}

//判断设备
export function getDeviceType() {
  const ua = navigator.userAgent;
  // iPad 的识别（注意：iOS 13+ 的 iPad 默认 UA 可能伪装成 Mac，需额外判断）
  const isIPad =
    /iPad/.test(ua) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);

  const isIPhone = /iPhone/.test(ua);
  const isAndroid = /Android/.test(ua) && !/IEMobile/.test(ua);
  const isMobile = isIPhone || isAndroid;

  if (isIPad) {
    return "ipad";
  } else if (isMobile) {
    return "phone";
  } else {
    return "pc";
  }
}