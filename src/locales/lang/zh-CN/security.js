export default {
  verificationRequired: '请先绑定并激活邮箱或 Google 身份验证器后再进行此操作',
  singleLoginEnabled: '单点登录开启成功',
  singleLoginDisabled: '单点登录关闭成功',
  singleLoginFailed: '单点登录设置失败，请稍后重试',
  centerTitle: '安全中心',
  overview: {
    description: '管理账户登录验证、设备限制和双重认证方式。', currentLevel: '当前安全等级', progress: '安全进度', itemCount: '{count} 项', levelHigh: '高', levelMedium: '中', levelLow: '低',
    loginConfig: '登录配置', loginConfigDesc: '管理账户登录密码、登录设备策略和登录来源限制。', viewDevices: '查看登录设备', loginPassword: '登录密码', loginPasswordDesc: '登录密码，用于账户登录验证',
    change: '修改', singleLogin: '单点登录', singleLoginOnDesc: '同一账户只能在一个设备上登录', singleLoginOffDesc: '同一账户可在多个设备上同时登录', enabled: '已开启', disabled: '未开启', enable: '开启', disable: '关闭',
    ipWhitelist: 'IP 白名单', ipSetDesc: '只有白名单中的 IP 地址可以登录', ipUnsetDesc: '建议限制常用登录来源，降低异常访问风险', set: '设置', configured: '已设置', notConfigured: '未设置',
    twoFactor: '双重认证', twoFactorDesc: '绑定可用的二次验证方式，用于敏感操作和账户找回。', emailVerification: '邮箱认证', emailVerificationDesc: '可用于登录和找回密码', activated: '已激活', notActivated: '未激活', bind: '绑定', googleAuthenticator: '谷歌验证器', googleDesc: '绑定后可提高账户安全性', emailRequired: '请先绑定并激活邮箱后再进行此操作',
  },
  email: {
    unbound: '您当前未绑定邮箱', bound: '您当前绑定的邮箱是：', newAddress: '新邮箱地址', invalid: '请输入有效的邮箱地址',
    newPlaceholder: "请输入新的邮箱地址，例如：*****{'@'}gmail.com", code: '验证码', codePlaceholder: '请输入验证码', codeAfterEmail: '请输入邮箱地址后获取验证码',
    changeTitle: '修改邮箱', save: '保存', bindSuccess: '绑定邮箱成功', bindFailed: '绑定邮箱失败', changeSuccess: '修改邮箱成功', changeFailed: '修改失败',
    verifyTitle: '邮箱验证', verifyDescription: '我们已向您的 {email} 发送 6 位验证码，请在下方输入以完成验证。', securityFooter: '{siteName}安全验证 · 保障账户安全', securityTitle: '安全验证', submit: '提交', googleClosed: '关闭谷歌验证器成功', googleCloseFailed: '关闭谷歌验证器失败',
  },
  password: {
    old: '原密码', new: '新密码', confirm: '确认密码', length: '请输入 6-32 位密码', oldPlaceholder: '请输入原密码', newPlaceholder: '请输入新密码', confirmPlaceholder: '请再次输入密码', mismatch: '两次密码不相同', title: '修改密码', submit: '提交', success: '修改密码成功，请重新登录', failed: '修改失败',
  },
  ipWhitelist: { duplicate: '发现重复项：{ip}', title: '修改 IP 白名单', save: '保存', success: '修改 IP 白名单成功', failed: '修改失败' },
  google: {
    bind: '绑定', downloadStep: '下载认证器', scanStep: '扫描二维码', verifyStep: '安全认证', downloadTip: '请下载并安装谷歌验证器应用', android: 'Android 版本', ios: 'iOS 版本',
    scanDownload: '请使用手机扫描二维码下载谷歌验证器', addAccount: '请使用 Google 验证器应用扫描下方二维码，或手动输入密钥添加验证账户。', rebindWarning: '如果您重新绑定 Google 验证器，旧验证器将无法使用。',
    manualCode: '扫描二维码或手动输入以下代码：', copy: '复制', enterCodeTip: '请输入谷歌验证器应用生成的 6 位验证码完成绑定', codePlaceholder: '请输入 Google 验证器生成的 6 位验证码',
    keyCopied: '密钥已复制到剪贴板', invalidCode: '请输入 6 位数字验证码', bindSuccess: 'Google 验证器绑定成功', title: '绑定 Google 验证器',
  },
  loginRecords: {
    title: '登录设备', description: '您可以查看当前登录的设备，并管理这些设备的登录状态。', unknownDevice: '未知设备', currentDevice: '当前设备', currentLogin: '当前登录', currentSession: '当前会话', unknownBrowser: '未知浏览器', ipAddress: 'IP 地址', loginTime: '登录时间', offline: '下线', empty: '暂无其他登录设备',
    loadFailed: '获取登录设备失败，请联系客服', confirmTitle: '确认下线设备？', confirmContent: '下线后该设备需要重新登录。', confirm: '确认', cancel: '取消', submitting: '正在提交', success: '操作成功', offlineSuccess: '设备已下线', failed: '操作失败',
  },
}
