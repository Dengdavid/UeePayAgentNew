export default {
  title: '账号登录',
  placeholder: {
    account: '用户账号/邮箱',
    password: '用户密码',
  },
  action: {
    loginNow: '立即登录',
    registerNow: '立即注册',
    forgotPassword: '忘记密码？',
  },
  prompt: {
    noAccount: '没有账号？',
  },
  notice: {
    title: '使用须知',
    sufficientBalance: '卡片余额充足：避免因余额不足导致的交易失败。',
    noMaliciousBinding: '禁止恶意绑卡：不得绑定后付费服务导致扣费失败。',
    noAuthorizationOnlyBinding: '禁止空绑授权：不得仅绑定平台授权而不进行实际交易。',
    noFraudulentTransactions: '禁止虚假交易：不得付款后恶意退款或滥用退货政策。',
    accountHolderOnly: '仅限本人/企业使用：禁止转让卡片，违规使用责任自负。',
  },
  validation: {
    accountRequired: '登录账号必填',
    passwordRequired: '登录密码必填',
  },
  message: {
    success: '登录成功',
    failed: '登录失败',
  },
}
