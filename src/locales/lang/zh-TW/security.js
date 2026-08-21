export default {
  verificationRequired: '請先綁定並啟用電子信箱或 Google 身份驗證器後再進行此操作',
  singleLoginEnabled: '單點登入開啓成功',
  singleLoginDisabled: '單點登入關閉成功',
  singleLoginFailed: '單點登入設定失敗，請稍後重試',
  centerTitle: '安全中心',
  overview: {
    description: '管理帳戶登入驗證、設備限制和雙重認證方式。', currentLevel: '當前安全等級', progress: '安全進度', itemCount: '{count} 項', levelHigh: '高', levelMedium: '中', levelLow: '低',
    loginConfig: '登入配置', loginConfigDesc: '管理帳戶登入密碼、登入設備策略和登入來源限制。', viewDevices: '查看登入設備', loginPassword: '登入密碼', loginPasswordDesc: '登入密碼，用於帳戶登入驗證',
    change: '修改', singleLogin: '單點登入', singleLoginOnDesc: '同一帳戶只能在一個設備上登入', singleLoginOffDesc: '同一帳戶可在多個設備上同時登入', enabled: '已開啓', disabled: '未開啓', enable: '開啓', disable: '關閉',
    ipWhitelist: 'IP 白名單', ipSetDesc: '只有白名單中的 IP 地址可以登入', ipUnsetDesc: '建議限制常用登入來源，降低異常訪問風險', set: '設定', configured: '已設定', notConfigured: '未設定',
    twoFactor: '雙重認證', twoFactorDesc: '綁定可用的二次驗證方式，用於敏感操作和帳戶找回。', emailVerification: '電子信箱認證', emailVerificationDesc: '可用於登入和找回密碼', activated: '已啟用', notActivated: '未啟用', bind: '綁定', googleAuthenticator: '谷歌驗證器', googleDesc: '綁定後可提高帳戶安全性', emailRequired: '請先綁定並啟用電子信箱後再進行此操作',
  },
  email: {
    unbound: '您當前未綁定電子信箱', bound: '您當前綁定的電子信箱是：', newAddress: '新電子信箱地址', invalid: '請輸入有效的電子信箱地址',
    newPlaceholder: "請輸入新的電子信箱地址，例如：*****{'@'}gmail.com", code: '驗證碼', codePlaceholder: '請輸入驗證碼', codeAfterEmail: '請輸入電子信箱地址後獲取驗證碼',
    changeTitle: '修改電子信箱', save: '儲存', bindSuccess: '綁定電子信箱成功', bindFailed: '綁定電子信箱失敗', changeSuccess: '修改電子信箱成功', changeFailed: '修改失敗',
    verifyTitle: '電子信箱驗證', verifyDescription: '我們已向您的 {email} 發送 6 位驗證碼，請在下方輸入以完成驗證。', securityFooter: '{siteName}安全驗證 · 保障帳戶安全', securityTitle: '安全驗證', submit: '提交', googleClosed: '關閉谷歌驗證器成功', googleCloseFailed: '關閉谷歌驗證器失敗',
  },
  password: {
    old: '原密碼', new: '新密碼', confirm: '確認密碼', length: '請輸入 6-32 位密碼', oldPlaceholder: '請輸入原密碼', newPlaceholder: '請輸入新密碼', confirmPlaceholder: '請再次輸入密碼', mismatch: '兩次密碼不相同', title: '修改密碼', submit: '提交', success: '修改密碼成功，請重新登入', failed: '修改失敗',
  },
  ipWhitelist: { duplicate: '發現重復項：{ip}', title: '修改 IP 白名單', save: '儲存', success: '修改 IP 白名單成功', failed: '修改失敗' },
  google: {
    bind: '綁定', downloadStep: '下載認證器', scanStep: '掃描QR Code', verifyStep: '安全認證', downloadTip: '請下載並安裝谷歌驗證器應用', android: 'Android 版本', ios: 'iOS 版本',
    scanDownload: '請使用手機掃描QR Code下載谷歌驗證器', addAccount: '請使用 Google 驗證器應用掃描下方QR Code，或手動輸入密鑰添加驗證帳戶。', rebindWarning: '如果您重新綁定 Google 驗證器，舊驗證器將無法使用。',
    manualCode: '掃描QR Code或手動輸入以下代碼：', copy: '複製', enterCodeTip: '請輸入谷歌驗證器應用生成的 6 位驗證碼完成綁定', codePlaceholder: '請輸入 Google 驗證器生成的 6 位驗證碼',
    keyCopied: '密鑰已複製到剪貼簿', invalidCode: '請輸入 6 位數字驗證碼', bindSuccess: 'Google 驗證器綁定成功', title: '綁定 Google 驗證器',
  },
  loginRecords: {
    title: '登入設備', description: '您可以查看當前登入的設備，並管理這些設備的登入狀態。', unknownDevice: '未知設備', currentDevice: '當前設備', currentLogin: '當前登入', currentSession: '當前會話', unknownBrowser: '未知瀏覽器', ipAddress: 'IP 地址', loginTime: '登入時間', offline: '下線', empty: '暫無其他登入設備',
    loadFailed: '獲取登入設備失敗，請聯絡客服', confirmTitle: '確認下線設備？', confirmContent: '下線後該設備需要重新登入。', confirm: '確認', cancel: '取消', submitting: '正在提交', success: '操作成功', offlineSuccess: '設備已下線', failed: '操作失敗',
  },
}
