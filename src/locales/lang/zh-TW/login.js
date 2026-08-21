export default {
  title: '賬號登入',
  placeholder: {
    account: '使用者賬號/電子信箱',
    password: '使用者密碼',
  },
  action: {
    loginNow: '立即登入',
    registerNow: '立即註冊',
    forgotPassword: '忘記密碼？',
  },
  prompt: {
    noAccount: '沒有賬號？',
  },
  notice: {
    title: '使用須知',
    sufficientBalance: '卡片餘額充足：避免因餘額不足導致的交易失敗。',
    noMaliciousBinding: '禁止惡意綁卡：不得綁定後付費服務導致扣費失敗。',
    noAuthorizationOnlyBinding: '禁止空綁授權：不得僅綁定平台授權而不進行實際交易。',
    noFraudulentTransactions: '禁止虛假交易：不得付款後惡意退款或濫用退貨政策。',
    accountHolderOnly: '僅限本人/企業使用：禁止轉讓卡片，違規使用責任自負。',
  },
  validation: {
    accountRequired: '登入賬號必填',
    passwordRequired: '登入密碼必填',
  },
  message: {
    success: '登入成功',
    failed: '登入失敗',
  },
}
