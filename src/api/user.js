import request from './request.js'

export default {
  // 登录
  login(data) {
    return request({ url: "/user/auth/login", method: "post", data });
  },
  // 注册
  register(data) {
    return request({ url: "/user/auth/register", method: "post", data });
  },
  // 忘记密码
  forgotPwd(data) {
    return request({ url: "/user/auth/forgotPwd", method: "post", data });
  },
  // 修改密码
  changePwd(data) {
    return request({ url: "/user/auth/changePwd", method: "post", data });
  },
  // 获取登录用户信息
  getUserInfo() {
    return request({ url: "/user/center", method: "post" });
  },
  // 获取语言与时区偏好
  getPreferences() {
    return request({ url: "/user/preferences", method: "get" });
  },
  // 获取可选语言
  getLanguages() {
    return request({ url: "/user/languages", method: "get" });
  },
  // 获取可选时区
  getTimezones() {
    return request({ url: "/user/timezones", method: "get" });
  },
  // 保存国家、语言与时区偏好
  savePreferences(data) {
    return request({ url: "/user/savePreferences", method: "post", data });
  },
  // 退出登录
  logout() {
    return request({ url: "/user/auth/logout", method: "post" });
  },
  // 个人中心统计
  userStatistics(data) {
    return request({ url: "/user/userStatistics", method: "post" });
  },
  // 提现
  withdraw(data) {
    return request({ url: "/user/withdraw", method: "post", data });
  },
  // 获取分组列表
  getGroupList() {
    return request({ url: "/user/group/index", method: "post" });
  },
  // 购买用户组
  buyGroup(data) {
    return request({ url: "/user/group/buy", method: "post", data });
  },
  // 获取充值地址
  getRechargeAddress(data, config = {}) {
    return request({ ...config, url: "/user/depostAdress", method: "post", data });
  },
  // 创建新的充值地址
  createRechargeAddress(data, config = {}) {
    return request({ ...config, url: "/user/createAddress", method: "post", data });
  },
  // 同步充值余额
  syncRecharge(config = {}) {
    return request({ ...config, url: "/user/syncRecharge", method: "post" });
  },
  // 消息列表
  getMessageList(params) {
    return request({ url: "/user/message", method: "get", params });
  },
  // 消息未读数量
  getMessageNum() {
    return request({ url: "/user/unReadMessageCount", method: "get" });
  },
  // 消息详情
  msgDetail(params) {
    return request({
      url: "/user/viewMessage",
      method: "get",
      params,
      requestPolicy: {
        // 查看消息会改变已读状态，超时后不自动重复提交。
        retryOnTimeout: false,
      },
    });
  },
  // 标记全部已读
  readAllMessage() {
    return request({
      url: "/user/readAllMessage",
      method: "get",
      requestPolicy: {
        // 全部已读会改变服务端状态，超时后不自动重复提交。
        retryOnTimeout: false,
      },
    });
  },
  // 删除消息
  deleteMessage(data) {
    return request({ url: "/user/batchMessage", method: "post", data });
  },
  // 财务统计
  financeStatistics() {
    return request({ url: "/user/profitStatistics", method: "post" });
  },
  // 返佣统计
  inviteStatistics() {
    return request({ url: "/user/inviteStatistics", method: "post" });
  },
  // 返佣记录
  inviteList(data) {
    return request({ url: "/user/inviteList", method: "post", data });
  },
  // 获取充值记录列表
  rechargeList(params) {
    return request({ url: "/user/rechargeList", method: "get", params });
  },
  // 申请退款
  refundRecharge(data) {
    return request({ url: "/user/refundRecharge", method: "post", data });
  },
  // 获取安全设置信息
  getMySettings() {
    return request({ url: "/user/getMySettings", method: "get" });
  },
  // 保存安全设置
  setMySettings(data) {
    return request({ url: "/user/setMySettings", method: "post", data });
  },
  // 获取开放平台安全设置
  getSecuritySettings() {
    return request({ url: "/user/getSecuritySettings", method: "get" });
  },
  // 保存开放平台安全设置
  setSecuritySettings(data) {
    return request({ url: "/user/setSecuritySettings", method: "post", data });
  },
  // 获取开放平台信息
  getOpenPlatform() {
    return request({ url: "/user/getOpenPlatform", method: "post" });
  },
  // 获取完整公钥
  getPubkey() {
    return request({ url: "/user/getPubkey", method: "post" });
  },
  // 下线设备
  clearToken(data) {
    return request({ url: "/user/auth/offline", method: "post", data });
  },
  // 获取登录设备
  getLoginTokens() {
    return request({ url: "/user/getLoginTokens", method: "get" });
  },
  // 设置单点登录
  setSingleLogin(data) {
    return request({ url: "/user/setSingleLogin", method: "post", data });
  },
  // 设置IP白名单
  setIptables(data) {
    return request({ url: "/user/setIptables", method: "post", data });
  },
  // 设置公钥
  setPubkey(data) {
    return request({ url: "/user/setPubkey", method: "post", data });
  },
  // 设置开放平台IP白名单
  setOauthIpTables(data) {
    return request({ url: "/user/setOauthIpTables", method: "post", data });
  },
  // 设置回调地址
  setCallbackUrl(data) {
    return request({ url: "/user/setCallbackUrl", method: "post", data });
  },
  // 重置通信密钥
  resetAuthorization(data) {
    return request({ url: "/user/resetAuthorization", method: "post", data });
  },
  // 发送邮箱验证码
  sendEmail(data) {
    return request({ url: "/user/auth/sendEmail", method: "post", data });
  },
  // 激活邮箱
  validateEmail(data) {
    return request({ url: "/user/auth/validateEmail", method: "post", data });
  },
  // 修改邮箱
  changeEmail(data) {
    return request({ url: "/user/auth/changeEmail", method: "post", data });
  },
  // 验证邮箱激活码
  verifyEmailCaptcha(data) {
    return request({
      url: "/user/auth/verifyEmailCaptcha",
      method: "post",
      data,
    });
  },
  // 生成谷歌验证器密钥和二维码
  createSecretKey() {
    return request({ url: "/user/auth/createSecretKey", method: "post" });
  },
  // 验证谷歌验证码
  verifySecretKey(data) {
    return request({ url: "/user/auth/verifySecretKey", method: "post", data });
  },
  // 清除谷歌验证器密钥
  closedSecretKey(data) {
    return request({ url: "/user/auth/closedSecretKey", method: "post", data });
  },
  // 子账户列表
  getAccountList(data) {
    return request({ url: "/user/account/index", method: "post", data });
  },
  // 创建子账户
  createAccount(data) {
    return request({ url: "/user/account/create", method: "post", data });
  },
  // 修改子账户密码
  resetAccountPassword(data) {
    return request({
      url: "/user/account/resetPassword",
      method: "post",
      data,
    });
  },
  // 修改子账户邮箱
  changeAccountEmail(data) {
    return request({ url: "/user/account/changeEmail", method: "post", data });
  },
  // 修改子账户有效期
  changeAccountExpireTime(data) {
    return request({
      url: "/user/account/changeExpireTime",
      method: "post",
      data,
    });
  },
  // 修改子账户状态
  changeAccountStatus(data) {
    return request({ url: "/user/account/changeStatus", method: "post", data });
  },
  // 获取链路列表
  getChainList(params, config = {}) {
    return request({ ...config, url: "/user/getChainList", method: "get", params });
  },
  // 获取退款手续费
  getRefundRiskFee(data) {
    return request({ url: "/user/getRefundFee", method: "post", data });
  },
  // 获取国家列表
  getAllCountrys(data) {
    return request({
      url: "/user/Certifications/getCountys",
      method: "get",
      data,
    });
  },
  // 提交KYB认证信息
  companyCertifications(data) {
    return request({
      url: "/user/Certifications/companyCertification",
      method: "post",
      data,
    });
  },
  // KYB认证信息
  getCompanyCertifications() {
    return request({
      url: "/user/Certifications/getCompanyCertification",
      method: "get",
    });
  },
  // 上传企业资料文件
  uploadComplianceFile(formData) {
    return request({
      url: "/user/Certifications/upload",
      method: "post",
      data: formData,
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },
};
