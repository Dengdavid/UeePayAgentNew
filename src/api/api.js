import request from './request.js'
export const getString = (url, data) => {
  if (!data) return url

  let pairs = []

  if (Array.isArray(data)) {
    // 转为 [[key, value], ...]
    pairs = data.map(({ key, value }) => [key, value])
  } else if (typeof data === 'object') {
    pairs = Object.entries(data)
  } else {
    return url
  }

  // 过滤空值 + 编码
  const params = pairs
    .filter(([, value]) => value != null && value !== '') // 排除 null, undefined, ''
    .map(
      ([key, value]) =>
        `${encodeURIComponent(key)}=${encodeURIComponent(value)}`
    )

  return params.length > 0 ? `${url}?${params.join('&')}` : url
}
export const get = async (url, data) => {
  const _string = getString(url, {
    ...data,
    total: undefined,
  })
  const res= await request({ url: _string, method: 'get', data })
  return res
}

export const post = async (url, data, config = {}) => {
  const res = await request({ ...config, url, method: 'post', data })
  return res
}
