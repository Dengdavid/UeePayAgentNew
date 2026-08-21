export default {
  title: '代理商',
  apply: {
    eyebrow: '代理合作已开放 · 核心伙伴招募中', title: '接入全球支付能力', titleAccent: '拓展您的代理业务', description: '无需自建技术平台，即可整合虚拟卡发行、全球速汇与分润管理，为客户增加开卡、充值和跨境汇款服务，拓展更多业务机会。', contactToApply: '立即联系客服申请', learnMore: '了解代理商权益', agentStatement: '代理商账单', estimatedRewards: '{month} 收益', rewardComposition: '卡收益构成', automaticSummary: '自动汇总', settlementNotice: '收益返佣按月结算，明细可随时查看',
    highlights: {
      integration: { value: '全链路', label: '发卡、汇款与分润整合' },
      scenarios: { value: '多场景', label: '开卡、充值与跨境汇款' },
      settlement: { value: '按月结', label: '分润明细可随时查看' },
    },
    services: {
      card: { title: '发卡服务', subtitle: '虚拟卡业务入口', description: '支持开卡、充值、卡片管理与消费场景服务，帮助代理商搭建可运营的卡业务平台。', tags: { opening: '虚拟卡开通', recharge: '充值管理', scenarios: '消费场景' } },
      remittance: { title: '全球速汇', subtitle: '跨境资金服务', description: '面向跨境付款、客户汇款与多币种结算场景，为代理商提供更多增值服务选择。', tags: { transfer: '跨境汇款', currency: '多币种服务', tracking: '到账跟踪' } },
    },
    features: {
      noDevelopment: { title: '无需技术开发', description: '无需自行研发，完成开通后即可运营虚拟卡业务' }, brand: { title: '独立品牌运营', description: '支持白标定制与域名绑定，建设自有品牌与用户体系' }, rewards: { title: '持续收益机会', description: '分润覆盖充值、开卡、交易与跨境等业务场景' }, global: { title: '全球市场机会', description: '通过跨境支付与多币种能力拓展全球业务' }, pricing: { title: '自主定价空间', description: '可配置费率与定价策略，适配自身业务模式' }, support: { title: '客服托管服务', description: '客服团队提供咨询、问题处理与基础审核支持' },
    },
  },
  rewards: {
    statsTitle: '奖励统计',
    settlementTip: '奖励金额以服务端结算结果为准，待确认奖励需进入详情页确认后处理。',
    estimatedThisMonth: '本月预计奖励', pendingLastMonth: '上月待确认奖励', totalHistorical: '历史累计奖励',
    month: '奖励月份', status: '状态', total: '奖励总额', accountRechargeFee: '账户充值费', cardActivationFee: '卡片激活费',
    cardTransferInFee: '卡片转入费', transactionFee: '交易手续费', crossBorderFee: '跨境手续费', membershipFee: '会员服务费', remark: '备注', detail: '详情',
    pendingConfirmation: '待确认', confirmed: '已确认',
    detailPage: {
      confirmedAmount: '确认金额', confirmedAmountTip: '最终实际结算给代理商的确认金额', pendingCredit: '待确认入账金额', confirmedCredit: '本月已确认入账金额',
      totalReward: '奖励总金额', monthlySummary: '本月各项奖励汇总', creditedAmount: '已入账金额', creditedSiteReward: '已入账站点奖励部分', siteCount: '站点数量', siteUnit: '个', expandHint: '可展开查看每日构成',
      composition: '奖励构成', compositionHint: '本月代理商奖励按以下手续费项目汇总。', primarySource: '主要来源', compositionPercent: '占奖励构成 {percent}%',
      siteDetails: '站点奖励明细', siteDetailsHint: '展开站点可查看每日构成；导出前请先勾选需要导出的站点。', selectedSites: '已选择 {count} 个站点', noSiteSelected: '未选择站点', exportData: '导出数据', dailySummary: '每日汇总', monthlyExport: '月度汇总', dataDetails: '数据明细',
      waitingConfirmation: '等待确认', confirmationComplete: '已完成确认', verifyBeforeConfirm: '确认前请核对所有站点奖励构成。', recordConfirmed: '当前奖励记录已确认。', close: '关闭', confirmReward: '确认奖励',
      siteName: '站点名称', totalRewardUsd: '奖励总额 $', creditedUsd: '已到账金额 $', pendingUsd: '待确认金额 $', date: '日期', invitationCommission: '邀请返佣 $', monthTotal: '本月合计',
      generatingFile: '正在生成文件，请稍后注意查看站内消息。', operationFailed: '操作失败', confirmTitle: '确认奖励', confirmContent: '请确认该月代理商奖励数据无误。确认后将进入后续处理流程，且无法撤回。', confirmSuccess: '确认成功', missingRecord: '缺少记录数据',
    },
  },
  setting: { title: '站点设置' },
  invite: { copy: '复制', empty: '暂无邀请链接' },
  admin: {
    warning: '管理员权限会影响代理站点管理操作，请仅添加已确认身份的账户；站点启停以服务端权限和风控结果为准。',
    searchPlaceholder: '站点名称 / 管理员名称 / 站点域名', clear: '清空', add: '添加管理员', siteCount: '{count} 个代理站点',
    domain: '域名', createdAt: '创建时间', remove: '移除', noMatch: '未找到匹配管理员', empty: '暂无管理员数据',
    noMatchHint: '请调整站点名称、管理员名称或域名关键词后重试。', emptyHint: '添加管理员后，可在此管理其代理站点权限。', clearFilter: '清空筛选',
    promptTitle: '消息提示', removeConfirm: '确定要移除管理员【 <span class="ui-text-primary">{name}</span> 】吗？', removeSuccess: '移除成功', operationSuccess: '操作成功', operationFailed: '操作失败',
    modal: {
      title: '添加管理员', confirmUser: '确认用户', confirmUserHint: '查询并锁定账户', authorizeSites: '授权站点', authorizeSitesHint: '选择管理范围',
      searchTitle: '查询管理员账户', searchDescription: '输入用户邮箱或名称，先确认账户身份，再进入站点授权。', userName: '用户名称',
      userPlaceholder: '请输入用户邮箱/名称后回车确认', searchHint: '建议优先使用邮箱精确查询，避免名称相近导致误选。', confirmedAccount: '已确认管理员账户', searchAgain: '重新查询',
      selectSites: '选择代理站点', selectSitesDescription: '为已确认的用户选择可管理的代理站点，支持一次授权多个站点。', authorizeTo: '授权给', agentSites: '代理站点',
      availableSites: '可授权 {count} 个', selectedSites: '，已选 {count} 个', sitePlaceholder: '请选择需要授权的代理站点', authorizationHint: '提交后，该用户将获得所选代理站点的管理权限。', noSites: '暂无可授权站点，请先确认代理站点配置。',
      cancel: '取消', previous: '上一步', searchContinue: '查询并继续', confirmAdd: '确认添加', enterUser: '请输入用户邮箱/名称后查询', userNotFound: '未查询到该用户，请重新输入', userMatched: '用户匹配成功', confirmAccountFirst: '请先确认管理员账户', selectSiteFirst: '请选择代理站点', addSuccess: '添加成功',
    },
  },
}
