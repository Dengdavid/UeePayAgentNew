import legal from './agreement.js'

export default {
  legal,
  title: 'アカウントを登録する',
  placeholder: {
    account: '6～20文字のアカウント名を入力してください',
    email: 'メールアドレス',
    verificationCode: '認証コード',
    password: '6～30文字のパスワードを設定してください',
    confirmPassword: 'もう一度パスワードを確認してください',
    invitationCode: '招待コード（任意）',
  },
  agreement: {
    agreePrefix: '読んで同意します',
    userAgreement: '「利用規約」',
    conjunction: 'そして',
    privacyPolicy: '「プライバシー規約」',
    userAgreementTitle: 'ユーザー同意書',
    privacyPolicyTitle: 'プライバシー規約',
    read: '読みました',
    readAll: '契約書をよくお読みください',
    required: 'まずユーザー契約とプライバシー契約を読んで同意してください',
  },
  action: {
    registerNow: '今すぐ登録してください',
    loginNow: '今すぐログインしてください',
    forgotPassword: 'パスワードを忘れましたか?',
  },
  prompt: {
    hasAccount: 'すでにアカウントをお持ちですか?',
  },
  validation: {
    accountRequired: 'ログインアカウントを入力してください',
    accountLength: 'アカウント名は6～20文字で入力してください',
    accountTrim: 'アカウント名の先頭または末尾にスペースは使用できません。',
    accountSpaces: 'アカウントにスペースを含めることはできません',
    accountFormat: 'アカウント名には、中国語、英字、数字のみ使用できます。またはメールアドレス形式で入力してください',
    emailRequired: 'メールアドレスを入力してください',
    emailFormat: '有効なメールアドレスを入力してください',
    verificationCodeRequired: '認証コードを入力してください',
    passwordRequired: 'ログインパスワードを入力してください',
    passwordLength: 'パスワードは6～30文字で入力してください',
    confirmPasswordRequired: '確認用のパスワードを入力してください',
    passwordMismatch: 'パスワードが一致しません',
  },
  message: {
    success: '登録しました',
    failed: '登録に失敗しました',
  },
}
