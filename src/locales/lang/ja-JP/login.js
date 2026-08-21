export default {
  title: 'アカウントにログイン',
  placeholder: {
    account: 'ユーザーアカウント/メールアドレス',
    password: 'ユーザパスワード',
  },
  action: {
    loginNow: '今すぐログインしてください',
    registerNow: '今すぐ登録してください',
    forgotPassword: 'パスワードを忘れましたか?',
  },
  prompt: {
    noAccount: 'アカウントがありませんか?',
  },
  notice: {
    title: '取扱説明書',
    sufficientBalance: '十分なカード残高：残高不足によるトランザクションの失敗を回避します。',
      noMaliciousBinding: '不正なカード登録は禁止：後払いサービスにカードを登録し、請求の失敗を招く行為は禁止されています。',
      noAuthorizationOnlyBinding: '認証のみを目的とした登録は禁止：実際の取引を行わず、プラットフォーム認証のためだけにカードを登録することはできません。',
      noFraudulentTransactions: '不正取引は禁止：支払い後に悪意のある返金を申請したり、返品ポリシーを悪用したりすることは禁止されています。',
    accountHolderOnly: '個人/業務用のみ：カードを譲渡することは禁止されており、規則に違反して使用することはあなたの責任です。',
  },
  validation: {
    accountRequired: 'ログインアカウントが必要です',
    passwordRequired: 'ログインパスワードが必要です',
  },
  message: {
    success: 'ログイン成功',
    failed: 'ログインに失敗しました',
  },
}
