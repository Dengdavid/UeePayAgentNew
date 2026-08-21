export default {
  title: '代理商',
  apply: {
    eyebrow: '代理合作已開放 · 核心夥伴招募中', title: '接入全球支付能力', titleAccent: '拓展您的代理業務', description: '無需自建技術平台，即可整合虛擬卡發行、全球速匯與分潤管理，為客戶增加開卡、儲值和跨境匯款服務，拓展更多業務機會。', contactToApply: '立即聯絡客服申請', learnMore: '瞭解代理商權益', agentStatement: '代理商帳單', estimatedRewards: '{month} 收益', rewardComposition: '卡收益構成', automaticSummary: '自動匯總', settlementNotice: '收益返傭按月結算，明細可隨時查看',
    highlights: {
      integration: { value: '全鏈路', label: '發卡、匯款與分潤整合' },
      scenarios: { value: '多場景', label: '開卡、儲值與跨境匯款' },
      settlement: { value: '按月結', label: '分潤明細可隨時查看' },
    },
    services: {
      card: { title: '發卡服務', subtitle: '虛擬卡業務入口', description: '支援開卡、儲值、卡片管理與消費場景服務，幫助代理商搭建可運營的卡業務平台。', tags: { opening: '虛擬卡開通', recharge: '儲值管理', scenarios: '消費場景' } },
      remittance: { title: '全球速匯', subtitle: '跨境資金服務', description: '面向跨境付款、客戶匯款與多幣種結算場景，為代理商提供更多增值服務選擇。', tags: { transfer: '跨境匯款', currency: '多幣種服務', tracking: '入帳跟蹤' } },
    },
    features: {
      noDevelopment: { title: '無需技術開發', description: '無需自行研發，完成開通後即可運營虛擬卡業務' }, brand: { title: '獨立品牌運營', description: '支援白標客製與域名綁定，建設自有品牌與使用者體系' }, rewards: { title: '持續收益機會', description: '分潤覆蓋儲值、開卡、交易與跨境等業務場景' }, global: { title: '全球市場機會', description: '通過跨境支付與多幣種能力拓展全球業務' }, pricing: { title: '自主定價空間', description: '可配置費率與定價策略，適配自身業務模式' }, support: { title: '客服托管服務', description: '客服團隊提供咨詢、問題處理與基礎審核支援' },
    },
  },
  rewards: {
    statsTitle: '獎勵統計',
    settlementTip: '獎勵金額以伺服器端結算結果為準，待確認獎勵需進入詳情頁確認後處理。',
    estimatedThisMonth: '本月預計獎勵', pendingLastMonth: '上月待確認獎勵', totalHistorical: '歷史累計獎勵',
    month: '獎勵月份', status: '狀態', total: '獎勵總額', accountRechargeFee: '帳戶儲值費', cardActivationFee: '卡片啟用費',
    cardTransferInFee: '卡片轉入費', transactionFee: '交易手續費', crossBorderFee: '跨境手續費', membershipFee: '會員服務費', remark: '備注', detail: '詳情',
    pendingConfirmation: '待確認', confirmed: '已確認',
    detailPage: {
      confirmedAmount: '確認金額', confirmedAmountTip: '最終實際結算給代理商的確認金額', pendingCredit: '待確認入賬金額', confirmedCredit: '本月已確認入賬金額',
      totalReward: '獎勵總金額', monthlySummary: '本月各項獎勵匯總', creditedAmount: '已入賬金額', creditedSiteReward: '已入賬站點獎勵部分', siteCount: '站點數量', siteUnit: '個', expandHint: '可展開查看每日構成',
      composition: '獎勵構成', compositionHint: '本月代理商獎勵按以下手續費項目匯總。', primarySource: '主要來源', compositionPercent: '佔獎勵構成 {percent}%',
      siteDetails: '站點獎勵明細', siteDetailsHint: '展開站點可查看每日構成；導出前請先勾選需要導出的站點。', selectedSites: '已選擇 {count} 個站點', noSiteSelected: '未選擇站點', exportData: '導出資料', dailySummary: '每日匯總', monthlyExport: '月度匯總', dataDetails: '資料明細',
      waitingConfirmation: '等待確認', confirmationComplete: '已完成確認', verifyBeforeConfirm: '確認前請核對所有站點獎勵構成。', recordConfirmed: '當前獎勵記錄已確認。', close: '關閉', confirmReward: '確認獎勵',
      siteName: '站點名稱', totalRewardUsd: '獎勵總額 $', creditedUsd: '已入帳金額 $', pendingUsd: '待確認金額 $', date: '日期', invitationCommission: '邀請返傭 $', monthTotal: '本月合計',
      generatingFile: '正在生成文件，請稍後注意查看站內消息。', operationFailed: '操作失敗', confirmTitle: '確認獎勵', confirmContent: '請確認該月代理商獎勵資料無誤。確認後將進入後續處理流程，且無法撤回。', confirmSuccess: '確認成功', missingRecord: '缺少記錄資料',
    },
  },
  setting: { title: '站點設定' },
  invite: { copy: '複製', empty: '暫無邀請鏈接' },
  admin: {
    warning: '管理員權限會影響代理站點管理操作，請僅添加已確認身份的帳戶；站點啓停以伺服器端權限和風控結果為準。',
    searchPlaceholder: '站點名稱 / 管理員名稱 / 站點域名', clear: '清空', add: '添加管理員', siteCount: '{count} 個代理站點',
    domain: '域名', createdAt: '建立時間', remove: '移除', noMatch: '未找到匹配管理員', empty: '暫無管理員資料',
    noMatchHint: '請調整站點名稱、管理員名稱或域名關鍵詞後重試。', emptyHint: '添加管理員後，可在此管理其代理站點權限。', clearFilter: '清空篩選',
    promptTitle: '消息提示', removeConfirm: '確定要移除管理員【 <span class="ui-text-primary">{name}</span> 】嗎？', removeSuccess: '移除成功', operationSuccess: '操作成功', operationFailed: '操作失敗',
    modal: {
      title: '添加管理員', confirmUser: '確認使用者', confirmUserHint: '查詢並鎖定帳戶', authorizeSites: '授權站點', authorizeSitesHint: '選擇管理範圍',
      searchTitle: '查詢管理員帳戶', searchDescription: '輸入使用者電子信箱或名稱，先確認帳戶身份，再進入站點授權。', userName: '使用者名稱',
      userPlaceholder: '請輸入使用者電子信箱/名稱後回車確認', searchHint: '建議優先使用電子信箱精確查詢，避免名稱相近導致誤選。', confirmedAccount: '已確認管理員帳戶', searchAgain: '重新查詢',
      selectSites: '選擇代理站點', selectSitesDescription: '為已確認的使用者選擇可管理的代理站點，支援一次授權多個站點。', authorizeTo: '授權給', agentSites: '代理站點',
      availableSites: '可授權 {count} 個', selectedSites: '，已選 {count} 個', sitePlaceholder: '請選擇需要授權的代理站點', authorizationHint: '提交後，該使用者將獲得所選代理站點的管理權限。', noSites: '暫無可授權站點，請先確認代理站點配置。',
      cancel: '取消', previous: '上一步', searchContinue: '查詢並繼續', confirmAdd: '確認添加', enterUser: '請輸入使用者電子信箱/名稱後查詢', userNotFound: '未查詢到該使用者，請重新輸入', userMatched: '使用者匹配成功', confirmAccountFirst: '請先確認管理員帳戶', selectSiteFirst: '請選擇代理站點', addSuccess: '添加成功',
    },
  },
}
