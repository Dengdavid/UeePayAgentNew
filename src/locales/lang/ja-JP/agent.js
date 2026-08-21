export default {
  title: 'エージェント',
  apply: {
    eyebrow: 'エージェント提携受付中・主要パートナー募集中', title: 'グローバル決済サービスを導入', titleAccent: 'エージェント事業を拡大', description: '自社でプラットフォームを開発することなく、バーチャルカード、グローバル送金、報酬管理を既存事業に導入できます。カード発行、残高チャージ、クロスボーダー送金を提供し、顧客ニーズと新たな事業機会に対応します。', contactToApply: '申請についてサポートに問い合わせる', learnMore: 'エージェントのメリットを見る', agentStatement: 'エージェント明細', estimatedRewards: '{month}の報酬', rewardComposition: '報酬の内訳', automaticSummary: '自動集計', settlementNotice: '報酬は毎月精算され、詳細はいつでも確認できます',
    highlights: {
      integration: { value: '一貫したサービス', label: 'カード発行、送金、報酬管理' },
      scenarios: { value: '多様なシナリオ', label: 'カード発行、残高チャージ、送金' },
      settlement: { value: '月次精算', label: '報酬の内訳をいつでも確認' },
    },
    services: {
      card: { title: 'カード発行サービス', subtitle: 'バーチャルカード事業基盤', description: '一つのカードサービス基盤で、カード発行、残高チャージ、カード管理、各種決済シナリオに対応します。', tags: { opening: 'バーチャルカード発行', recharge: 'チャージ管理', scenarios: '決済シナリオ' } },
      remittance: { title: 'グローバル送金', subtitle: 'クロスボーダー資金サービス', description: 'クロスボーダー決済、顧客送金、多通貨精算など、幅広い資金移動のニーズに対応します。', tags: { transfer: 'クロスボーダー送金', currency: '多通貨サービス', tracking: '送金状況の追跡' } },
    },
    features: {
      noDevelopment: { title: '自社開発不要', description: '独自のプラットフォームを構築せずに、バーチャルカードサービスを開始できます' }, brand: { title: '独自ブランドで運営', description: 'ホワイトラベルと独自ドメインに対応し、自社ブランドとユーザー基盤を活用できます' }, rewards: { title: '継続的な報酬機会', description: 'チャージ、カード発行、取引、クロスボーダーサービスなどが報酬対象となります' }, global: { title: 'グローバル市場への展開', description: 'クロスボーダー決済と多通貨サービスを通じて海外市場へ事業を拡大できます' }, pricing: { title: '柔軟な料金設定', description: '事業モデルに合わせて料金や価格戦略を設定できます' }, support: { title: '運営サポート', description: 'サポートチームが問い合わせ対応、問題解決、基本的な審査を支援します' },
    },
  },
  rewards: {
    statsTitle: '報酬統計',
    settlementTip: '報酬額はサーバー側の精算結果に基づきます。保留中の報酬は、確定前に詳細ページで内容を確認してください。',
    estimatedThisMonth: '今月の見込み報酬', pendingLastMonth: '先月の未確定報酬', totalHistorical: '累計報酬',
    month: '報酬対象月', status: 'ステータス', total: '報酬合計', accountRechargeFee: 'アカウントチャージ手数料', cardActivationFee: 'カード有効化手数料',
    cardTransferInFee: 'カード入金手数料', transactionFee: '取引手数料', crossBorderFee: 'クロスボーダー手数料', membershipFee: '会員サービス料', remark: '備考', detail: '詳細',
    pendingConfirmation: '確認待ち', confirmed: '確認済み',
    detailPage: {
      confirmedAmount: '確定金額', confirmedAmountTip: '精算結果に基づきエージェントへ支払われる最終金額', pendingCredit: '確定待ち金額', confirmedCredit: '今月の確定金額',
      totalReward: '報酬総額', monthlySummary: '今月の報酬概要', creditedAmount: '入金済み金額', creditedSiteReward: '入金済みのエージェントサイト報酬', siteCount: 'サイト数', siteUnit: 'サイト', expandHint: 'サイトを展開すると日別の内訳を確認できます',
      composition: '報酬の内訳', compositionHint: '今月のエージェント報酬を以下の手数料区分で集計しています。', primarySource: '主な報酬源', compositionPercent: '報酬総額の{percent}%',
      siteDetails: 'サイト報酬の内訳', siteDetailsHint: 'サイトを展開すると、毎日の構成が表示されます。エクスポートする前に、エクスポートするサイトを確認してください。', selectedSites: '{count}件のサイトが選択されました', noSiteSelected: 'サイトが選択されていません', exportData: 'データのエクスポート', dailySummary: '日次サマリー', monthlyExport: '月次サマリー', dataDetails: 'データの詳細',
      waitingConfirmation: '確認待ち', confirmationComplete: '確認完了', verifyBeforeConfirm: '確定前に、各サイトの報酬内訳を確認してください。', recordConfirmed: 'この報酬記録は確定済みです。', close: '閉じる', confirmReward: '報酬を確定',
      siteName: 'サイト名', totalRewardUsd: '報酬合計 $', creditedUsd: '入金済み金額 $', pendingUsd: '未確定金額 $', date: '日付', invitationCommission: '紹介報酬 $', monthTotal: '月間合計',
      generatingFile: 'ファイルを生成しています。しばらくしてからメッセージをご確認ください。', operationFailed: '操作に失敗しました', confirmTitle: '報酬を確定', confirmContent: '今月のエージェント報酬データが正しいことを確認してください。確定後は次の処理へ進み、取り消すことはできません。', confirmSuccess: '報酬を確定しました', missingRecord: '報酬記録がありません',
    },
  },
  setting: { title: 'サイト設定' },
  invite: { copy: 'コピー', empty: '紹介リンクはまだありません' },
  admin: {
    warning: '管理者権限はエージェントサイトの管理に影響します。本人確認済みのアカウントのみ追加してください。サイトの有効化・停止は、サーバー側の権限とリスク管理結果に基づきます。',
    searchPlaceholder: 'サイト名／管理者／ドメイン', clear: 'クリア', add: '管理者を追加', siteCount: '{count}件のエージェントサイト',
    domain: 'ドメイン名', createdAt: '作成日時', remove: '削除', noMatch: '一致する管理者が見つかりません', empty: '管理者データはまだありません',
    noMatchHint: 'サイト名、管理者名、またはドメインのキーワードを変更して、もう一度お試しください。', emptyHint: '管理者を追加すると、ここでエージェントサイトの権限を管理できます。', clearFilter: 'フィルターをクリア',
    promptTitle: '確認', removeConfirm: '管理者<span class="ui-text-primary">{name}</span>を削除しますか？', removeSuccess: '管理者を削除しました', operationSuccess: '操作が完了しました', operationFailed: '操作に失敗しました',
    modal: {
      title: '管理者を追加', confirmUser: 'ユーザーを確認', confirmUserHint: 'アカウントを検索して確認', authorizeSites: 'サイト権限を付与', authorizeSitesHint: '管理範囲を選択',
      searchTitle: '管理者アカウントを検索', searchDescription: 'ユーザーのメールアドレスまたは名前を入力してアカウントを確認し、その後エージェントサイトの管理権限を付与します。', userName: 'ユーザー名',
      userPlaceholder: 'ユーザーのメールアドレスまたは名前を入力してEnterキーを押してください', searchHint: '同名のユーザーを誤って選択しないよう、可能な限り正確なメールアドレスを使用してください。', confirmedAccount: '確認済みの管理者アカウント', searchAgain: '再検索',
      selectSites: 'エージェントサイトを選択', selectSitesDescription: '確認済みのユーザーに管理を許可するエージェントサイトを1件以上選択してください。', authorizeTo: '権限付与先', agentSites: 'エージェントサイト',
      availableSites: '{count}件付与可能', selectedSites: '、{count}件選択済み', sitePlaceholder: '管理権限を付与するエージェントサイトを選択してください', authorizationHint: '確定後、このユーザーには選択したエージェントサイトの管理権限が付与されます。', noSites: '権限を付与できるサイトがありません。先にエージェントサイトの設定を確認してください。',
      cancel: 'キャンセル', previous: '戻る', searchContinue: '検索して続行', confirmAdd: '確認して追加', enterUser: '検索するユーザーのメールアドレスまたは名前を入力してください', userNotFound: '一致するユーザーが見つかりません。入力内容を確認してもう一度お試しください。', userMatched: 'ユーザーを確認しました', confirmAccountFirst: '先に管理者アカウントを確認してください', selectSiteFirst: 'エージェントサイトを1件以上選択してください', addSuccess: '管理者を追加しました',
    },
  },
}
