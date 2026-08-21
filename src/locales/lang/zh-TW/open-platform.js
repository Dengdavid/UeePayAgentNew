export default {
  description: '管理 API 調用所需的密鑰、回調地址和訪問白名單。', configureOrder: '建議先配置安全公鑰，再設定 IP 白名單、回調地址和通信密鑰。', itemCount: '{count} 項',
  status: { securityItems: '安全項', callbacks: '回調通知', ipRestriction: 'IP 限制', on: '開', off: '關', configured: '已設定', notConfigured: '未設定' },
  sectionTitle: '介面安全配置', change: '修改', set: '設定', reset: '重置', save: '儲存',
  publicKey: {
    label: '安全公鑰', configuredDesc: '您需要通過對應私鑰解密完整卡片資訊', unconfiguredDesc: '正式讀取完整卡片資訊前配置加密公鑰', encryptionTip: '使用 1024bit RSA/NONE/OAEPWithSHA1AndMGF1Padding 方式加密', onlineExample: '線上示例',
    field: '公鑰', placeholder: '請輸入用於加密卡片敏感資訊的 RSA 公鑰', notice: '配置後，完整卡片資訊將使用該公鑰加密返回，請使用對應私鑰解密。', method: '加密方式：1024bit RSA/NONE/OAEPWithSHA1AndMGF1Padding。', masked: '當前公鑰為脫敏展示，如需修改，請清空後重新輸入完整公鑰。', title: '配置安全公鑰', success: '修改成功',
  },
  ipWhitelist: { label: 'IP 白名單', configuredDesc: '只有白名單中的 IP 地址可以訪問 API', unconfiguredDesc: '建議限制伺服器端出口 IP，降低介面暴露風險', tip: '設定後，只有白名單中的 IP 地址可以訪問 API。', duplicate: '發現重復項：{ip}', title: '修改 IP 白名單', success: '修改 IP 白名單成功', failed: '修改失敗' },
  webhook: { label: '回調地址', desc: '用於接收 Webhook 回調通知', tip: '請填寫可公網訪問的伺服器端地址，協議已在下方選擇，無需重復填寫。', title: '配置 Webhook', success: '儲存成功' },
  authorization: {
    label: '通信密鑰', configuredDesc: '用於伺服器端請求籤名和介面通信', unconfiguredDesc: '通信密鑰，用於 API 通信', securityRequired: '請先在<span class="text-smg">安全中心</span>綁定並<span class="text-smg">啟用電子信箱</span>或<span class="text-smg">Google 驗證器</span>後再進行此操作。',
    resetConfirm: '確定要重置通信密鑰嗎？重置後舊密鑰將立即失效，使用舊密鑰的 API 請求將無法通過，請同步更新伺服器端配置。', generateConfirm: '確定要生成通信密鑰嗎？生成後請將新密鑰配置到您的伺服器端，用於 API 請求籤名和通信。', resetSuccess: '重置成功', setSuccess: '設定成功', saveNotice: '請妥善儲存您的新通信密鑰', viewTitle: '查看通信密鑰', copy: '複製', copied: '密鑰已複製到剪貼簿',
  },
}
