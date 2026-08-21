export default {
  description: 'API呼び出しに必要なキー、コールバックURL、アクセス許可リストを管理します。', configureOrder: 'IP許可リスト、コールバックURL、通信キーを設定する前に、セキュリティ公開鍵を設定することをおすすめします。', itemCount: '{count}項目',
  status: { securityItems: 'セキュリティ項目', callbacks: 'Webhook 通知', ipRestriction: 'IP 制限', on: 'オン', off: 'オフ', configured: '設定済み', notConfigured: '未設定' },
  sectionTitle: 'APIセキュリティ設定', change: '変更', set: '設定', reset: 'リセット', save: '保存',
  publicKey: {
    label: 'セキュリティ公開鍵', configuredDesc: '完全なカード情報は、対応する秘密鍵で復号する必要があります', unconfiguredDesc: '完全なカード情報を取得する前に、暗号化用の公開鍵を設定してください', encryptionTip: '1024bit RSA/NONE/OAEPWithSHA1AndMGF1Padding方式で暗号化します', onlineExample: 'オンライン例',
    field: '公開鍵', placeholder: 'カードの機密情報を暗号化するためのRSA公開鍵を入力してください', notice: '設定後、完全なカード情報はこの公開鍵で暗号化して返されます。対応する秘密鍵で復号してください。', method: '暗号化方式：1024bit RSA/NONE/OAEPWithSHA1AndMGF1Padding。', masked: '現在の公開鍵はマスキング表示されています。変更する場合は、一度消去してから完全な公開鍵を入力してください。', title: 'セキュリティ公開鍵を設定', success: '変更しました',
  },
  ipWhitelist: { label: 'IP許可リスト', configuredDesc: '許可リストに登録されたIPアドレスのみAPIへアクセスできます', unconfiguredDesc: 'APIの露出リスクを抑えるため、サーバーの送信元IPを制限することをおすすめします。', tip: '設定後は、許可リストに登録されたIPアドレスのみAPIへアクセスできます。', duplicate: '重複する項目があります：{ip}', title: 'IP許可リストを変更', success: 'IP許可リストを変更しました', failed: '変更に失敗しました' },
  webhook: { label: 'コールバックURL', desc: 'Webhook通知を受信するために使用します', tip: 'インターネットからアクセスできるサーバーURLを入力してください。プロトコルは下で選択するため、重ねて入力する必要はありません。', title: 'Webhookを設定', success: '保存しました' },
  authorization: {
    label: '通信キー', configuredDesc: 'サーバーリクエストの署名とAPI通信に使用します', unconfiguredDesc: 'API通信に使用する通信キーです', securityRequired: 'この操作を行う前に、<span class="text-smg">セキュリティセンター</span>でメールアドレスまたは<span class="text-smg">Google Authenticator</span>を連携して<span class="text-smg">有効化</span>してください。',
    resetConfirm: '通信キーをリセットしますか？リセット後、古いキーは直ちに無効となり、そのキーを使用したAPIリクエストは認証されません。サーバー側の設定もあわせて更新してください。', generateConfirm: '通信キーを生成しますか？生成後、新しいキーをサーバー側に設定し、APIリクエストの署名と通信に使用してください。', resetSuccess: '通信キーをリセットしました', setSuccess: '通信キーを設定しました', saveNotice: '新しい通信キーを安全に保管してください', viewTitle: '通信キーを表示', copy: 'コピー', copied: 'キーをクリップボードにコピーしました',
  },
}
