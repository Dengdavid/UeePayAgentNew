/**
 * 转义 HTML 特殊字符，防止 XSS
 * @param {string | null | undefined} str
 * @returns {string}
 */
export const escapeHtml = (str) => {
  if (str == null) return ''
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

/**
 * 对文本中的查询关键词进行高亮（支持单个或多个关键词）
 *
 * @param {string | null | undefined} text - 原始纯文本（非 HTML）
 * @param {string | string[] | null | undefined} query - 搜索关键词
 * @param {Object} [options] - 高亮选项
 * @param {string} [options.color='#2b5cd9'] - 文字颜色（会被 CSS.escape 处理）
 * @param {string} [options.className=''] - 自定义 CSS 类名
 * @param {string} [options.tag='span'] - 包裹标签，默认 span
 * @returns {string} 返回安全的 HTML 字符串
 */
export const highlightText = (text, query, options = {}) => {
  const { color = '#2b5cd9', className = '', tag = 'span' } = options

  if (!text) return ''
  if (!query || (Array.isArray(query) && query.length === 0)) {
    return escapeHtml(text)
  }

  let queries = Array.isArray(query)
    ? query.filter((q) => typeof q === 'string' && q.trim())
    : typeof query === 'string' && query.trim()
    ? [query.trim()]
    : []

  if (queries.length === 0) return escapeHtml(text)

  let safeText = escapeHtml(text)

  for (const q of queries) {
    const escapedQuery = q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const regex = new RegExp(`(${escapedQuery})`, 'gi')

    // 直接使用 color（假设来自可信源）
    const styleAttr = color ? ` style="color: ${color};"` : ''
    const classAttr = className ? ` class="${escapeHtml(className)}"` : ''

    safeText = safeText.replace(
      regex,
      `<${tag}${classAttr}${styleAttr}>$1</${tag}>`
    )
  }

  return safeText
}
