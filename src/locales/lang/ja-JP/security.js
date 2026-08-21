export default {
  verificationRequired: '続行する前に、メールアドレスまたは Google Authenticator を連携して有効にしてください。',
  singleLoginEnabled: 'シングルログインを有効にしました',
  singleLoginDisabled: 'シングルログインを無効にしました',
  singleLoginFailed: 'シングルログインの設定を更新できませんでした。しばらくしてからもう一度お試しください。',
  centerTitle: 'セキュリティセンター',
  overview: {
    description: 'ログイン認証、デバイス制限、二要素認証の方法を管理します。', currentLevel: '現在のセキュリティレベル', progress: 'セキュリティ設定の進捗', itemCount: '{count} 項目', levelHigh: '高', levelMedium: '中', levelLow: '低',
    loginConfig: 'ログイン設定', loginConfigDesc: 'ログインパスワード、デバイスポリシー、ログイン元の制限を管理します。', viewDevices: 'ログイン中のデバイスを表示', loginPassword: 'ログインパスワード', loginPasswordDesc: 'アカウントへのログイン時の本人確認に使用します',
    change: '変更', singleLogin: 'シングルログイン', singleLoginOnDesc: 'このアカウントで同時にログインできるデバイスは 1 台のみです', singleLoginOffDesc: 'このアカウントで複数のデバイスに同時にログインできます', enabled: '有効', disabled: '無効', enable: '有効にする', disable: '無効にする',
    ipWhitelist: 'IP 許可リスト', ipSetDesc: '許可リストに登録された IP アドレスからのみログインできます', ipUnsetDesc: '不正アクセスのリスクを抑えるため、通常利用するログイン元を制限することをおすすめします', set: '設定', configured: '設定済み', notConfigured: '未設定',
    twoFactor: '二要素認証', twoFactorDesc: '機密性の高い操作やアカウント復旧に使用する追加の認証方法を連携します。', emailVerification: 'メール認証', emailVerificationDesc: 'ログインとパスワードの再設定に使用できます', activated: '有効', notActivated: '無効', bind: '連携', googleAuthenticator: 'Google Authenticator', googleDesc: '認証アプリを連携してアカウントの安全性を高めます', emailRequired: '続行する前に、メールアドレスを連携して有効にしてください。',
  },
  email: {
    unbound: '現在、メールアドレスは連携されていません。', bound: '現在のメールアドレス：', newAddress: '新しいメールアドレス', invalid: '有効なメールアドレスを入力してください',
    newPlaceholder: "新しいメールアドレスを入力してください（例：*****{'@'}gmail.com）", code: '認証コード', codePlaceholder: '認証コードを入力してください', codeAfterEmail: '認証コードを取得するにはメールアドレスを入力してください',
    changeTitle: 'メールアドレスを変更', save: '保存', bindSuccess: 'メールアドレスを連携しました', bindFailed: 'メールアドレスを連携できませんでした', changeSuccess: 'メールアドレスを変更しました', changeFailed: 'メールアドレスを変更できませんでした',
    verifyTitle: 'メール認証', verifyDescription: '{email} に 6 桁の認証コードを送信しました。以下に入力して認証を完了してください。', securityFooter: '{siteName} セキュリティ認証 · アカウントを保護', securityTitle: 'セキュリティ認証', submit: '認証する', googleClosed: 'Google Authenticator を無効にしました', googleCloseFailed: 'Google Authenticator を無効にできませんでした',
  },
  password: {
    old: '現在のパスワード', new: '新しいパスワード', confirm: 'パスワードの確認', length: '6～32 文字のパスワードを入力してください', oldPlaceholder: '現在のパスワードを入力してください', newPlaceholder: '新しいパスワードを入力してください', confirmPlaceholder: '新しいパスワードをもう一度入力してください', mismatch: 'パスワードが一致しません', title: 'パスワードを変更', submit: '変更する', success: 'パスワードを変更しました。もう一度ログインしてください。', failed: 'パスワードを変更できませんでした',
  },
  ipWhitelist: { duplicate: '重複する項目があります：{ip}', title: 'IP 許可リストを編集', save: '保存', success: 'IP 許可リストを更新しました', failed: 'IP 許可リストを更新できませんでした' },
  google: {
    bind: '連携', downloadStep: '認証アプリをダウンロード', scanStep: 'QR コードをスキャン', verifyStep: 'セキュリティ認証', downloadTip: 'Google Authenticator アプリをダウンロードしてインストールしてください', android: 'Android 版', ios: 'iOS 版',
    scanDownload: 'スマートフォンで QR コードをスキャンして Google Authenticator をダウンロードしてください', addAccount: 'Google Authenticator で以下の QR コードをスキャンするか、秘密鍵を手動で入力してアカウントを追加してください。', rebindWarning: 'Google Authenticator を再連携すると、以前の認証アプリは使用できなくなります。',
    manualCode: 'QR コードをスキャンするか、次のコードを手動で入力してください：', copy: 'コピー', enterCodeTip: 'Google Authenticator に表示された 6 桁のコードを入力して設定を完了してください', codePlaceholder: 'Google Authenticator の 6 桁のコードを入力してください',
    keyCopied: '秘密鍵をクリップボードにコピーしました', invalidCode: '6 桁の認証コードを入力してください', bindSuccess: 'Google Authenticator を連携しました', title: 'Google Authenticator を連携',
  },
  loginRecords: {
    title: 'ログイン中のデバイス', description: '現在ログイン中のデバイスを確認し、ログイン状態を管理できます。', unknownDevice: '不明なデバイス', currentDevice: '現在のデバイス', currentLogin: 'ログイン中', currentSession: '現在のセッション', unknownBrowser: '不明なブラウザ', ipAddress: 'IP アドレス', loginTime: 'ログイン日時', offline: 'ログアウト', empty: 'ほかにログイン中のデバイスはありません',
    loadFailed: 'ログイン中のデバイスを取得できませんでした。サポートにお問い合わせください。', confirmTitle: 'このデバイスをログアウトしますか？', confirmContent: 'このデバイスでは再度ログインが必要になります。', confirm: '確認', cancel: 'キャンセル', submitting: '処理中', success: '操作が完了しました', offlineSuccess: 'デバイスをログアウトしました', failed: '操作に失敗しました',
  },
}
