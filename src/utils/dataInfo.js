//判断是否是数组
export const isArray=(data)=>{
  return Array.isArray(data);
}
//判断是否是对象
export const isObject=(data)=>{
  return data !== null &&
         typeof data === 'object' &&
         Object.prototype.toString.call(data) === '[object Object]';
}

/**
 * 将对象转化为数组
 * @param {*} data - 输入数据
 * @param {'values' | 'keys' | 'entries' | 'custom'} mode - 转换模式
 * @param {Function} [transformFn] - 当 mode 为 'custom' 时的自定义转换函数 (key, value) => any
 * @returns {Array} 转化后的数组
 */
export const objectToArray = (data, mode = 'values', transformFn) => {
  // 1. 非对象处理：如果是 null, undefined 或非对象，返回空数组或包裹数组
  if (!isObject(data)) {
    return [];
  }

  // 2. 根据模式执行转换
  switch (mode) {
    case 'keys':
      // 模式 A: 只取键 -> ['a', 'b', 'c']
      return Object.keys(data);

    case 'entries':
      // 模式 B: 取键值对 -> [['a', 1], ['b', 2]]
      return Object.entries(data);

    case 'custom':
      // 模式 C: 自定义转换 -> 允许你决定数组元素的格式
      if (typeof transformFn !== 'function') {
        throw new Error('Custom mode requires a transform function');
      }
      return Object.entries(data).map(([key, value]) => transformFn(key, value));

    case 'values':
    default:
      // 模式 D (默认): 只取值 -> [1, 2, 3]
      return Object.values(data);
  }
};

/**
 * 将任何数据类型转换为数组
 * @param {*} data - 输入的任何数据
 * @param {Object} options - 配置项
 * @returns {Array} 转换后的数组
 */
export const toArray=(data)=>{
  // 1. 处理 null 和 undefined
  if (data === null || data === undefined) {
    return [];
  }
  // 2. 如果已经是数组，直接返回 (为了安全也可以返回 [...data] 进行浅拷贝)
  if (isArray(data)) {
    return data;
  }
  // 4. 处理普通对象
  if (isObject(data)) {
    const options = objectToArray(data, 'custom', (key, value) => ({
      value: key,
      label:isObject(value) ? value?.label || value?.title || '' : value,
      type:isObject(value) ? value?.type || 'default' :undefined,
    }));
    return options;
  }
  if (typeof data === 'string') {
    return data.split(',').map(item=>item.trim());
  }
  // 5. 处理原始类型 (number, string, boolean, symbol, bigint, function)
  // 统一包裹在数组中
  return [data];
}

//复制文本
import { message } from '@/utils/message.js'
const copyTextFallback = (text) => {
  const textarea = document.createElement('textarea')
  textarea.value = text
  textarea.setAttribute('readonly', '')
  textarea.style.position = 'fixed'
  textarea.style.top = '0'
  textarea.style.left = '-9999px'
  textarea.style.opacity = '0'
  document.body.appendChild(textarea)
  try {
    textarea.focus()
    textarea.select()
    textarea.setSelectionRange(0, textarea.value.length)
    return document.execCommand('copy')
  } finally {
    document.body.removeChild(textarea)
  }
}

export const copyText=async (text,msg='复制成功',errorMsg='复制失败，请手动复制')=>{
  if(!text) return false
  try {
    if (globalThis.navigator?.clipboard?.writeText && globalThis.isSecureContext) {
      try {
        await globalThis.navigator.clipboard.writeText(text)
        message(msg)
        return true
      } catch (error) {
        // 小米等 Android WebView 可能暴露 Clipboard API，但实际调用会被拒绝，继续使用兼容方案。
      }
    }
    const copied = copyTextFallback(text)
    if(!copied){
      throw new Error('Copy command was rejected')
    }
    message(msg)
    return true
  } catch (err) {
    message(errorMsg, 'error')
    return false
  }
}
