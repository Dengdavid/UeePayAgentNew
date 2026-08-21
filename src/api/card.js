import request from './request.js'

export default {
  // 卡BIN列表
  getBinList(data) {
    return request({ url: '/vcc/bins', method: 'post', data })
  },
  // 卡BIN场景
  vccScene(data) {
    return request({ url: '/vcc/scene', method: 'post', data })
  },
  // 卡片列表
  vccList(params) {
    return request({ url: '/vcc/index', method: 'get', params })
  },
  // 创建卡片
  vccCreate(data) {
    return request({ url: '/vcc/create', method: 'post', data })
  },
  // 卡片详情
  vccInfo(data) {
    return request({ url: '/vcc/info', method: 'post', data })
  },
  // 同步卡片和账单
  vccCardSync(data) {
    return request({ url: '/vcc/cardSync', method: 'post', data })
  },
  // 卡片备注
  vccLabel(data) {
    return request({ url: '/vcc/label', method: 'post', data })
  },
  // 卡片转入
  vccIn(data) {
    return request({ url: '/vcc/in', method: 'post', data })
  },
  // 卡片转出
  vccOut(data) {
    return request({ url: '/vcc/out', method: 'post', data })
  },
  // 冻结卡片
  vccSuspend(data) {
    return request({ url: '/vcc/suspend', method: 'post', data })
  },
  // 解冻卡片
  vccEnable(data) {
    return request({ url: '/vcc/enable', method: 'post', data })
  },
  // 注销卡片
  vccDestroy(data) {
    return request({ url: '/vcc/destroy', method: 'post', data })
  },
  // 卡片页统计
  vccStatistics() {
    return request({ url: '/vcc/cardStatistics', method: 'post' })
  },
  // 卡片详情统计
  vccInfoStatistics(data) {
    return request({ url: '/vcc/cardInfoStatistics', method: 'post', data })
  },
  // 开卡订单-取消
  vccTradeCancel(data) {
    return request({ url: '/vcc/trade/cancel', method: 'post', data })
  },
  // 开卡订单-同步
  vccTradeSync(data) {
    return request({ url: '/vcc/trade/sync', method: 'post', data })
  },
  // 开卡订单-催审
  vccTradeUrge(data) {
    return request({ url: '/vcc/trade/urge', method: 'post', data })
  },
  // 实体卡申请
  vccApply(data) {
    return request({ url: '/vcc/apply', method: 'post', data })
  },
  // 实体卡开卡费以及邮寄费
  vccGetPhyiscalFee(data) {
    return request({ url: '/vcc/physical_fees', method: 'post', data })
  },
  // 生成身份认证URL
  vccHolderIdentityUrl(data) {
    return request({ url: '/vcc/holder_identity_url', method: 'post', data })
  },
  // 身份认证
  vccHolderIdentity(data) {
    return request({ url: '/vcc/holder_identity', method: 'post', data })
  },
  // 非中国大陆认证
  vccHolderIdentityOther(data) {
    return request({ url: '/vcc/update_physical_status', method: 'post', data })
  },
  // 实体卡激活
  vccActivate(data) {
    return request({ url: '/vcc/activate', method: 'post', data })
  },
  // 修改pin
  updatePin(data) {
    return request({ url: '/vcc/updatepin', method: 'post', data })
  },
  // 更新持卡人信息
  updateHolder(data) {
    return request({ url: '/vcc/update_holder', method: 'post', data })
  },
  // 实卡邮寄信息
  vccDeliverInfo(data) {
    return request({ url: '/vcc/deliver_info', method: 'post', data })
  },
  // 获取卡片私密信息
  vccPrivate(data) {
    return request({ url: '/vcc/private', method: 'post', data })
  },
  // 获取卡片可用余额
  vccBalance(data) {
    return request({ url: '/vcc/balance', method: 'post', data })
  },
  // 获取卡片消费场景
  vccGetConsumptionScenes(params) {
    return request({ url: '/vcc/getConsumptionScenes', method: 'get', params })
  },
  // 设置卡片消费场景
  vccSetConsumptionScenes(data) {
    return request({ url: '/vcc/updateConsumptionScene', method: 'post', data })
  },
  // 上传合规资料文件
  uploadComplianceFile(data) {
    return request({
      url: '/vcc/upload',
      method: 'post',
      data: data,
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
  },
  // 提交持卡人实名认证信息
  createCardholder(data) {
    return request({ url: '/vcc/createCardholder', method: 'post', data })
  },
  //  获取所有持卡人
  getAllCardholders() {
    return request({ url: '/vcc/getAllCardholders', method: 'get' })
  },
  // 获取持卡人详细信息
  getCardholderDetail(params) {
    return request({ url: '/vcc/getCardholderDetail', method: 'get', params })
  },
  //  获取卡头分类列表
  getBinCate() {
    return request({ url: '/vcc/BinCate', method: 'get' })
  },
  // 获取返现列表
  getCashbackList() {
    return request({ url: '/vcc/Cashback', method: 'get' })
  },
  // 获取返现详情
  getCashbackDetail(params) {
    return request({ url: '/vcc/Cashback/detail', method: 'get', params })
  },
  // 获取返现统计
  getCashbackStatistics(params) {
    return request({ url: '/vcc/Cashback/statistics', method: 'get', params })
  },
  // 确认返现
  confirmCashback(data) {
    return request({ url: '/vcc/Cashback/confirm', method: 'post', data })
  },
  // 申诉返现
  appealCashback(data) {
    return request({ url: '/vcc/Cashback/appeal', method: 'post', data })
  },
  //获取来源渠道
  getSourceChannels() {
    return request({ url: '/user/getSourceChannels', method: 'get'})
  },
  // 提交来源渠道
  sourceChannel(data) {
    return request({ url: '/user/sourceChannel', method: 'post', data })
  }
}
