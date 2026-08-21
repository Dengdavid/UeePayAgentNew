import request from './request.js'

export default {
  // 全局通知
  notice(type) {
    return request({ url: '/index/notice', method: 'get', params: { type } })
  },
  // 获取客服链接
  getCustomerUrl() {
    return request({ url: '/user/auth/getChatLink', method: 'get' })
  },
  // 获取配置信息
  getConfig() {
    return request({ url: '/user/auth/getConfig', method: 'get' })
  },
  // 获取国家与城市数据
  getAreaDatas() {
    return request({ url: '/vcc/physical_country', method: 'post' })
  }
}
