export default {
  title: 'パスワードを再設定',
  placeholder: {
    email: 'メールアドレス',
    verificationCode: '認証コード',
    password: '6～32文字のパスワードを設定してください',
    confirmPassword: 'もう一度パスワードを確認してください',
  },
  action: {
    resetPassword: 'パスワードをリセットする',
    loginNow: '今すぐログインしてください',
    registerNow: '今すぐ登録してください',
  },
  prompt: {
    hasAccount: 'すでにアカウントをお持ちですか?',
    noAccount: 'アカウントがありませんか?',
  },
  validation: {
    emailRequired: 'メールアドレスを入力してください',
    emailFormat: '有効なメールアドレスを入力してください',
    verificationCodeRequired: '認証コードを入力してください',
    verificationCodeLength: '6桁のコードを入力してください',
    passwordRequired: '新しいパスワードを入力してください',
    passwordLength: 'パスワードの長さは 6 文字未満にすることはできません',
    confirmPasswordRequired: '新しいパスワードを確認してください',
    passwordMismatch: '2回入力したパスワードは一致しません',
  },
  message: {
    success: 'パスワードをリセットしました',
    failed: 'パスワードのリセットに失敗しました',
  },
}
