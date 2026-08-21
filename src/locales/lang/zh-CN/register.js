import legal from './agreement.js'

export default {
  legal,
  title: '注册账号',
  placeholder: {
    account: '请输入6-20位账号',
    email: '邮箱',
    verificationCode: '验证码',
    password: '请设置6-30位密码',
    confirmPassword: '请再次确认密码',
    invitationCode: '邀请码（选填）',
  },
  agreement: {
    agreePrefix: '我已阅读并同意',
    userAgreement: '《用户协议》',
    conjunction: '和',
    privacyPolicy: '《隐私协议》',
    userAgreementTitle: '用户协议',
    privacyPolicyTitle: '隐私协议',
    read: '我已阅读',
    readAll: '请阅读完协议',
    required: '请先阅读并同意用户协议和隐私协议',
  },
  action: {
    registerNow: '立即注册',
    loginNow: '立即登录',
    forgotPassword: '忘记密码？',
  },
  prompt: {
    hasAccount: '已有账号？',
  },
  validation: {
    accountRequired: '请输入登录账号',
    accountLength: '请输入6-20位账号',
    accountTrim: '账号不能包含前后空格',
    accountSpaces: '账号不能包含空格',
    accountFormat: '账号只能包含中文、英文字母和数字或使用邮箱格式',
    emailRequired: '请输入邮箱地址',
    emailFormat: '请输入正确的邮箱格式',
    verificationCodeRequired: '请输入验证码',
    passwordRequired: '请输入登录密码',
    passwordLength: '请输入6-30位密码',
    confirmPasswordRequired: '请输入确认密码',
    passwordMismatch: '两次密码不相同',
  },
  message: {
    success: '注册成功',
    failed: '注册失败',
  },
}
