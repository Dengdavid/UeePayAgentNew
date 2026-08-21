export default {
  title: '找回密碼',
  placeholder: {
    email: '電子信箱',
    verificationCode: '驗證碼',
    password: '請設定6-32位密碼',
    confirmPassword: '請再次確認密碼',
  },
  action: {
    resetPassword: '重置密碼',
    loginNow: '立即登入',
    registerNow: '立即註冊',
  },
  prompt: {
    hasAccount: '已有賬號？',
    noAccount: '沒有賬號？',
  },
  validation: {
    emailRequired: '請輸入電子信箱',
    emailFormat: '請輸入正確的電子信箱格式',
    verificationCodeRequired: '請輸入驗證碼',
    verificationCodeLength: '請輸入6位驗證碼',
    passwordRequired: '請輸入新密碼',
    passwordLength: '密碼長度不能少於6位',
    confirmPasswordRequired: '請確認新密碼',
    passwordMismatch: '兩次輸入的密碼不一致',
  },
  message: {
    success: '重置密碼成功',
    failed: '重置密碼失敗',
  },
}
