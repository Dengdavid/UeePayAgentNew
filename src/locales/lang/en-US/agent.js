export default {
  title: 'Agent',
  apply: {
    eyebrow: 'Agent Partnerships Open · Core Partners Wanted', title: 'Access Global Payments', titleAccent: 'Expand Your Agent Business', description: 'Integrate virtual card issuance, global remittance, and revenue-sharing management to provide card issuance, deposits, and cross-border payment services for your customers and explore new business opportunities.', contactToApply: 'Apply Now', learnMore: 'Agent Benefits', agentStatement: 'Agent Statement', estimatedRewards: '{month} Rewards', rewardComposition: 'Revenue Breakdown', automaticSummary: 'Auto Summary', settlementNotice: 'Rewards are settled monthly, with details available for review',
    highlights: {
      integration: { value: 'End-to-End', label: 'Card issuing, remittance, and rewards' },
      scenarios: { value: 'Multiple Use Cases', label: 'Card Issuance, Deposits & Cross-Border Payments' },
      settlement: { value: 'Monthly Settlement', label: 'View Revenue details anytime' },
    },
    services: {
      card: { title: 'Card Issuing Services', subtitle: 'Virtual Card Business Access', description: 'Support card issuance, deposits, card management, and payment scenarios to help partners build scalable payment solutions.', tags: { opening: 'Virtual Card Issuance', recharge: 'Deposit Management', scenarios: 'Payment Scenarios' } },
      remittance: { title: 'Global Remittance', subtitle: 'Cross-Border Payment Services', description: 'Support cross-border payments, customer remittances, and multi-currency settlement scenarios with additional service options.', tags: { transfer: 'Cross-Border Remittance', currency: 'Multi-currency Services', tracking: 'Settlement Tracking' } },
    },
    features: {
      noDevelopment: { title: 'No Technical Development Required', description: 'Start operating your virtual card business after activation' }, brand: { title: 'Independent Brand Operations', description: 'Build your own brand with custom domains and user management' }, rewards: { title: 'Recurring Revenue Opportunities', description: 'Earn revenue from card issuance, deposits, transactions, and cross-border payments' }, global: { title: 'Global Market Opportunities', description: 'Expand internationally with cross-border payment and multi-currency capabilities' }, pricing: { title: 'Flexible Pricing', description: 'Configure pricing and settlement strategies to fit your business model' }, support: { title: 'Managed Customer Support', description: 'Get operational and customer service assistance' },
    },
  },
  rewards: {
    statsTitle: 'Reward Statistics',
    settlementTip: 'Reward amounts are subject to server-side settlement. Pending rewards must be reviewed from the details page before confirmation.',
    estimatedThisMonth: 'Estimated Rewards This Month', pendingLastMonth: 'Pending Rewards Last Month', totalHistorical: 'Total Historical Rewards',
    month: 'Reward Month', status: 'Status', total: 'Total Rewards', accountRechargeFee: 'Account Deposit Fee', cardActivationFee: 'Card Activation Fee',
    cardTransferInFee: 'Card Transfer In Fee', transactionFee: 'Transaction Fee', crossBorderFee: 'Cross-Border Fee', membershipFee: 'Membership Fee', remark: 'Remarks', detail: 'Details',
    pendingConfirmation: 'Pending Confirmation', confirmed: 'Confirmed',
    detailPage: {
      confirmedAmount: 'Confirmed Amount', confirmedAmountTip: 'The final amount settled to the agent', pendingCredit: 'Amount Pending Confirmation', confirmedCredit: 'Amount Confirmed This Month',
      totalReward: 'Total Reward Amount', monthlySummary: 'Summary of all rewards this month', creditedAmount: 'Credited Amount', creditedSiteReward: 'Agent-site rewards already credited', siteCount: 'Site Count', siteUnit: 'sites', expandHint: 'Expand a site to view its daily breakdown',
      composition: 'Reward Composition', compositionHint: 'This month\'s agent rewards are summarized by the following fee categories.', primarySource: 'Primary Source', compositionPercent: '{percent}% of total rewards',
      siteDetails: 'Site Reward Details', siteDetailsHint: 'Expand a site to view its daily breakdown. Select sites before exporting.', selectedSites: '{count} sites selected', noSiteSelected: 'No sites selected', exportData: 'Export Data', dailySummary: 'Daily Summary', monthlyExport: 'Monthly Summary', dataDetails: 'Detailed Data',
      waitingConfirmation: 'Awaiting Confirmation', confirmationComplete: 'Confirmation Complete', verifyBeforeConfirm: 'Review the reward composition for every site before confirming.', recordConfirmed: 'This reward record has been confirmed.', close: 'Close', confirmReward: 'Confirm Reward',
      siteName: 'Site Name', totalRewardUsd: 'Total Rewards $', creditedUsd: 'Credited Amount $', pendingUsd: 'Pending Amount $', date: 'Date', invitationCommission: 'Invitation Commission $', monthTotal: 'Monthly Total',
      generatingFile: 'The file is being generated. Check your messages shortly.', operationFailed: 'Operation failed', confirmTitle: 'Confirm Reward', confirmContent: 'Confirm that this month\'s agent reward data is correct. After confirmation, it will enter the subsequent processing flow and cannot be withdrawn.', confirmSuccess: 'Reward confirmed', missingRecord: 'Reward record data is missing',
    },
  },
  setting: { title: 'Site Settings' },
  invite: { copy: 'Copy', empty: 'No invitation links available' },
  admin: {
    warning: 'Administrator permissions affect agent-site management. Add only accounts whose identity has been confirmed. Site availability remains subject to server-side permissions and risk-control results.',
    searchPlaceholder: 'Site name / Administrator / Domain', clear: 'Clear', add: 'Add Administrator', siteCount: '{count} agent sites', domain: 'Domain', createdAt: 'Created Time', remove: 'Remove',
    noMatch: 'No matching administrators', empty: 'No administrator data', noMatchHint: 'Adjust the site name, administrator name, or domain keyword and try again.', emptyHint: 'Add an administrator to manage their agent-site permissions here.', clearFilter: 'Clear Filters',
    promptTitle: 'Confirmation', removeConfirm: 'Remove administrator <span class="ui-text-primary">{name}</span>?', removeSuccess: 'Administrator removed', operationSuccess: 'Operation completed', operationFailed: 'Operation failed',
    modal: {
      title: 'Add Administrator', confirmUser: 'Confirm User', confirmUserHint: 'Find and verify the account', authorizeSites: 'Authorize Sites', authorizeSitesHint: 'Select the management scope',
      searchTitle: 'Find Administrator Account', searchDescription: 'Enter the user email or name, confirm the account identity, and then authorize agent sites.', userName: 'User Name', userPlaceholder: 'Enter a user email or name and press Enter', searchHint: 'Use an exact email address where possible to avoid selecting a user with a similar name.',
      confirmedAccount: 'Confirmed Administrator Account', searchAgain: 'Search Again', selectSites: 'Select Agent Sites', selectSitesDescription: 'Select one or more agent sites that the confirmed user may manage.', authorizeTo: 'Authorize', agentSites: 'Agent Sites',
      availableSites: '{count} available', selectedSites: ', {count} selected', sitePlaceholder: 'Select agent sites to authorize', authorizationHint: 'After submission, this user will receive management permissions for the selected agent sites.', noSites: 'No sites are available for authorization. Check the agent-site configuration first.',
      cancel: 'Cancel', previous: 'Previous', searchContinue: 'Search and Continue', confirmAdd: 'Confirm and Add', enterUser: 'Enter a user email or name to search', userNotFound: 'No matching user was found. Check the entry and try again.', userMatched: 'User matched successfully', confirmAccountFirst: 'Confirm the administrator account first', selectSiteFirst: 'Select at least one agent site', addSuccess: 'Administrator added',
    },
  },
}
