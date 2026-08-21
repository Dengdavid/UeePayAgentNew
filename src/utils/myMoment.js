// utils/myMoment.js

/**
 * 创建一个类 Moment 的日期对象
 * @param {string|Date|number} [input] - 输入值，默认为当前时间
 * @returns {MyMoment}
 */
export function myMoment(input) {
  let date
  if (input == null) {
    date = new Date()
  } else if (input instanceof Date) {
    date = new Date(input)
  } else if (typeof input === 'string') {
    // 支持 YYYY-MM-DD, YYYY/MM/DD 等常见格式
    date = new Date(input.replace(/-/g, '/'))
  } else if (typeof input === 'number') {
    date = new Date(input)
  } else {
    date = new Date(NaN) // 无效日期
  }
  return new MyMoment(date)
}

class MyMoment {
  constructor(date) {
    this._d = date // 内部 Date 对象
  }

  // ===== 核心方法 =====

  /** 获取原始 Date 对象 */
  toDate() {
    return new Date(this._d)
  }

  /** 判断是否是有效日期 */
  isValid() {
    return !isNaN(this._d.getTime())
  }

  // ===== 格式化 =====

  /**
   * 格式化日期
   * 支持: YYYY, YY, MM, M, DD, D, HH, H, mm, m, ss, s
   */
  format(template = 'YYYY-MM-DD HH:mm:ss') {
    if (!this.isValid()) return ''

    const d = this._d
    const year = d.getFullYear()
    const month = d.getMonth() + 1
    const day = d.getDate()
    const hours = d.getHours()
    const minutes = d.getMinutes()
    const seconds = d.getSeconds()

    return template
      .replace(/YYYY/g, String(year))
      .replace(/YY/g, String(year).slice(-2))
      .replace(/MM/g, String(month).padStart(2, '0'))
      .replace(/M/g, String(month))
      .replace(/DD/g, String(day).padStart(2, '0'))
      .replace(/D/g, String(day))
      .replace(/HH/g, String(hours).padStart(2, '0'))
      .replace(/H/g, String(hours))
      .replace(/mm/g, String(minutes).padStart(2, '0'))
      .replace(/m/g, String(minutes))
      .replace(/ss/g, String(seconds).padStart(2, '0'))
      .replace(/s/g, String(seconds))
  }

  // ===== 加减操作 =====

  add(amount, unit) {
    const newDate = new Date(this._d)
    switch (unit.toLowerCase()) {
      case 'year':
      case 'years':
        newDate.setFullYear(newDate.getFullYear() + amount)
        break
      case 'month':
      case 'months':
        newDate.setMonth(newDate.getMonth() + amount)
        break
      case 'day':
      case 'days':
        newDate.setDate(newDate.getDate() + amount)
        break
      case 'hour':
      case 'hours':
        newDate.setHours(newDate.getHours() + amount)
        break
      case 'minute':
      case 'minutes':
        newDate.setMinutes(newDate.getMinutes() + amount)
        break
      case 'second':
      case 'seconds':
        newDate.setSeconds(newDate.getSeconds() + amount)
        break
      default:
        throw new Error(`Unsupported unit: ${unit}`)
    }
    return new MyMoment(newDate)
  }

  subtract(amount, unit) {
    return this.add(-amount, unit)
  }

  // ===== 快捷方法 =====

  startOf(unit) {
    const d = new Date(this._d)
    switch (unit.toLowerCase()) {
      case 'year':
        d.setMonth(0)
        d.setDate(1)
        d.setHours(0, 0, 0, 0)
        break
      case 'month':
        d.setDate(1)
        d.setHours(0, 0, 0, 0)
        break
      case 'day':
        d.setHours(0, 0, 0, 0)
        break
      default:
        throw new Error(`Unsupported unit for startOf: ${unit}`)
    }
    return new MyMoment(d)
  }

  endOf(unit) {
    const d = new Date(this._d)
    switch (unit.toLowerCase()) {
      case 'year':
        d.setMonth(11)
        d.setDate(31)
        d.setHours(23, 59, 59, 999)
        break
      case 'month':
        d.setMonth(d.getMonth() + 1, 0) // 下月0号即本月最后一天
        d.setHours(23, 59, 59, 999)
        break
      case 'day':
        d.setHours(23, 59, 59, 999)
        break
      default:
        throw new Error(`Unsupported unit for endOf: ${unit}`)
    }
    return new MyMoment(d)
  }

  // ===== 比较 =====

  isBefore(other) {
    return this._d < myMoment(other)._d
  }

  isAfter(other) {
    return this._d > myMoment(other)._d
  }

  isSame(other, unit = 'millisecond') {
    const otherMoment = myMoment(other)
    if (!otherMoment.isValid()) return false

    switch (unit.toLowerCase()) {
      case 'year':
        return this._d.getFullYear() === otherMoment._d.getFullYear()
      case 'month':
        return (
          this._d.getFullYear() === otherMoment._d.getFullYear() &&
          this._d.getMonth() === otherMoment._d.getMonth()
        )
      case 'day':
        return (
          this._d.getFullYear() === otherMoment._d.getFullYear() &&
          this._d.getMonth() === otherMoment._d.getMonth() &&
          this._d.getDate() === otherMoment._d.getDate()
        )
      default:
        return this._d.getTime() === otherMoment._d.getTime()
    }
  }
}

// 导出默认函数
export default myMoment
