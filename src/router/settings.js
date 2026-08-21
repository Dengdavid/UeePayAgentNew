//判断国家地址是否合法
let isCountry = true
export const isCountryAddress = () => {
  return new Promise((resolve) => {
    // reject 实际未使用，可省略
    const countryCode = localStorage.getItem('COUNTRYCODE')
    const countryTimeStr = localStorage.getItem('COUNTRYTIME')
    // 辅助函数：判断是否超过3分钟
    function isThreeMinutesApart(storedTimeStr) {
      if (!storedTimeStr) return true
      const storedTime = Number(storedTimeStr)
      if (isNaN(storedTime)) return true // 无效时间戳视为过期
      const now = Date.now().toString()
      return now - storedTime >= 3 * 60 * 1000 // 3分钟
    }

    // 判断国家代码
    function _isCountryCode(code) {
      if (['CN'].includes(code)) {
        resolve(false)
      } else {
        resolve(true)
      }
    }

    // 请求 IP 信息
    function _fetch() {
      isCountry = false
      fetch('/ipapi/json')
        .then((response) => {
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`)
          }
          return response.json()
        })
        .then((data) => {
          isCountry = false
          const code = data.country_code
          if (code) {
            localStorage.setItem('COUNTRYCODE', code || '')
            _isCountryCode(code)
          } else {
            resolve(false)
          }
        })
        .catch((error) => {
          isCountry = false
          resolve(false)
        })
        .finally(() => {
          // 存储时间戳（数字字符串）
          localStorage.setItem('COUNTRYTIME', Date.now().toString())
        })
    }
    if (!isCountry) return true
    // 主逻辑
    if (countryCode && !isThreeMinutesApart(countryTimeStr)) {
      // 缓存有效
      _isCountryCode(countryCode)
    } else {
      // 无缓存 或 已过期
      _fetch()
    }
  })
}
