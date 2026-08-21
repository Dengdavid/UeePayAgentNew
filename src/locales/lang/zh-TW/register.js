import legal from './agreement.js'

export default {
  legal,
  title: '註冊賬號',
  placeholder: {
    account: '請輸入6-20位賬號',
    email: '電子信箱',
    verificationCode: '驗證碼',
    password: '請設定6-30位密碼',
    confirmPassword: '請再次確認密碼',
    invitationCode: '邀請碼（選填）',
  },
  agreement: {
    agreePrefix: '我已閱讀並同意',
    userAgreement: '《使用者協議》',
    conjunction: '和',
    privacyPolicy: '《隱私協議》',
    userAgreementTitle: '使用者協議',
    privacyPolicyTitle: '隱私協議',
    read: '我已閱讀',
    readAll: '請閱讀完協議',
    required: '請先閱讀並同意使用者協議和隱私協議',
  },
  action: {
    registerNow: '立即註冊',
    loginNow: '立即登入',
    forgotPassword: '忘記密碼？',
  },
  prompt: {
    hasAccount: '已有賬號？',
  },
  validation: {
    accountRequired: '請輸入登入賬號',
    accountLength: '請輸入6-20位賬號',
    accountTrim: '賬號不能包含前後空格',
    accountSpaces: '賬號不能包含空格',
    accountFormat: '賬號只能包含中文、英文字母和數字或使用電子信箱格式',
    emailRequired: '請輸入電子信箱地址',
    emailFormat: '請輸入正確的電子信箱格式',
    verificationCodeRequired: '請輸入驗證碼',
    passwordRequired: '請輸入登入密碼',
    passwordLength: '請輸入6-30位密碼',
    confirmPasswordRequired: '請輸入確認密碼',
    passwordMismatch: '兩次密碼不相同',
  },
  message: {
    success: '註冊成功',
    failed: '註冊失敗',
  },
}
