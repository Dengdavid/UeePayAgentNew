export default {
  description: '管理 API 调用所需的密钥、回调地址和访问白名单。', configureOrder: '建议先配置安全公钥，再设置 IP 白名单、回调地址和通信密钥。', itemCount: '{count} 项',
  status: { securityItems: '安全项', callbacks: '回调通知', ipRestriction: 'IP 限制', on: '开', off: '关', configured: '已设置', notConfigured: '未设置' },
  sectionTitle: '接口安全配置', change: '修改', set: '设置', reset: '重置', save: '保存',
  publicKey: {
    label: '安全公钥', configuredDesc: '您需要通过对应私钥解密完整卡片信息', unconfiguredDesc: '正式读取完整卡片信息前配置加密公钥', encryptionTip: '使用 1024bit RSA/NONE/OAEPWithSHA1AndMGF1Padding 方式加密', onlineExample: '在线示例',
    field: '公钥', placeholder: '请输入用于加密卡片敏感信息的 RSA 公钥', notice: '配置后，完整卡片信息将使用该公钥加密返回，请使用对应私钥解密。', method: '加密方式：1024bit RSA/NONE/OAEPWithSHA1AndMGF1Padding。', masked: '当前公钥为脱敏展示，如需修改，请清空后重新输入完整公钥。', title: '配置安全公钥', success: '修改成功',
  },
  ipWhitelist: { label: 'IP 白名单', configuredDesc: '只有白名单中的 IP 地址可以访问 API', unconfiguredDesc: '建议限制服务端出口 IP，降低接口暴露风险', tip: '设置后，只有白名单中的 IP 地址可以访问 API。', duplicate: '发现重复项：{ip}', title: '修改 IP 白名单', success: '修改 IP 白名单成功', failed: '修改失败' },
  webhook: { label: '回调地址', desc: '用于接收 Webhook 回调通知', tip: '请填写可公网访问的服务端地址，协议已在下方选择，无需重复填写。', title: '配置 Webhook', success: '保存成功' },
  authorization: {
    label: '通信密钥', configuredDesc: '用于服务端请求签名和接口通信', unconfiguredDesc: '通信密钥，用于 API 通信', securityRequired: '请先在<span class="text-smg">安全中心</span>绑定并<span class="text-smg">激活邮箱</span>或<span class="text-smg">Google 验证器</span>后再进行此操作。',
    resetConfirm: '确定要重置通信密钥吗？重置后旧密钥将立即失效，使用旧密钥的 API 请求将无法通过，请同步更新服务端配置。', generateConfirm: '确定要生成通信密钥吗？生成后请将新密钥配置到您的服务端，用于 API 请求签名和通信。', resetSuccess: '重置成功', setSuccess: '设置成功', saveNotice: '请妥善保存您的新通信密钥', viewTitle: '查看通信密钥', copy: '复制', copied: '密钥已复制到剪贴板',
  },
}
