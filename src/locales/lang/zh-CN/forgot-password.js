export default {
  title: '找回密码',
  placeholder: {
    email: '邮箱',
    verificationCode: '验证码',
    password: '请设置6-32位密码',
    confirmPassword: '请再次确认密码',
  },
  action: {
    resetPassword: '重置密码',
    loginNow: '立即登录',
    registerNow: '立即注册',
  },
  prompt: {
    hasAccount: '已有账号？',
    noAccount: '没有账号？',
  },
  validation: {
    emailRequired: '请输入邮箱',
    emailFormat: '请输入正确的邮箱格式',
    verificationCodeRequired: '请输入验证码',
    verificationCodeLength: '请输入6位验证码',
    passwordRequired: '请输入新密码',
    passwordLength: '密码长度不能少于6位',
    confirmPasswordRequired: '请确认新密码',
    passwordMismatch: '两次输入的密码不一致',
  },
  message: {
    success: '重置密码成功',
    failed: '重置密码失败',
  },
}
