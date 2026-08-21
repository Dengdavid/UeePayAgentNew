export default {
  title: '에이전트',
  apply: {
    eyebrow: '에이전트 파트너십 모집 중 · 핵심 파트너를 찾습니다', title: '글로벌 결제 서비스 도입', titleAccent: '에이전트 사업 확장', description: '자체 플랫폼을 구축하지 않고도 가상 카드, 글로벌 송금, 보상 관리를 기존 사업에 연동할 수 있습니다. 카드 발급, 잔액 충전, 해외 송금 서비스를 제공해 더 다양한 고객 요구에 대응하세요.', contactToApply: '신청 문의하기', learnMore: '에이전트 혜택 보기', agentStatement: '에이전트 명세서', estimatedRewards: '{month} 보상', rewardComposition: '보상 구성', automaticSummary: '자동 요약', settlementNotice: '보상은 매월 정산되며 세부 내역은 언제든지 확인할 수 있습니다',
    highlights: {
      integration: { value: '통합 서비스', label: '카드 발급, 송금, 보상 관리' },
      scenarios: { value: '다양한 시나리오', label: '카드 발급, 잔액 충전, 송금' },
      settlement: { value: '월별 정산', label: '언제든지 보상 내역 확인' },
    },
    services: {
      card: { title: '카드 발급 서비스', subtitle: '가상 카드 사업 인프라', description: '하나의 카드 서비스 플랫폼에서 카드 발급, 잔액 충전, 카드 관리, 다양한 결제 시나리오를 지원합니다.', tags: { opening: '가상 카드 발급', recharge: '잔액 충전 관리', scenarios: '결제 시나리오' } },
      remittance: { title: '글로벌 송금', subtitle: '해외 송금 서비스', description: '해외 결제, 고객 송금, 다중 통화 정산을 위한 추가 서비스 옵션을 제공합니다.', tags: { transfer: '해외 송금', currency: '다중 통화 서비스', tracking: '송금 추적' } },
    },
    features: {
      noDevelopment: { title: '별도 개발 불필요', description: '자체 플랫폼을 구축하지 않고 가상 카드 서비스를 시작할 수 있습니다' }, brand: { title: '독립 브랜드 운영', description: '화이트 라벨과 전용 도메인을 지원해 자체 브랜드와 사용자 체계를 활용할 수 있습니다' }, rewards: { title: '지속적인 보상 기회', description: '충전, 카드 발급, 거래, 해외 서비스 등 다양한 항목에서 보상을 받을 수 있습니다' }, global: { title: '글로벌 시장 기회', description: '해외 결제와 다중 통화 서비스를 통해 국제 시장으로 사업을 확장할 수 있습니다' }, pricing: { title: '유연한 가격 설정', description: '비즈니스 모델에 맞춰 수수료와 가격 전략을 설정할 수 있습니다' }, support: { title: '운영 고객 지원', description: '지원팀이 문의, 문제 해결, 기본 검토 절차를 지원합니다' },
    },
  },
  rewards: {
    statsTitle: '보상 통계',
    settlementTip: '보상 금액은 서버 측 정산 결과에 따라 결정됩니다. 보류 중인 보상은 확정 전에 상세 페이지에서 검토해 주세요.',
    estimatedThisMonth: '이번 달 예상 보상', pendingLastMonth: '지난달 미확정 보상', totalHistorical: '누적 보상',
    month: '보상 월', status: '상태', total: '총 보상', accountRechargeFee: '계정 충전 수수료', cardActivationFee: '카드 발급 수수료',
    cardTransferInFee: '카드 입금 수수료', transactionFee: '거래 수수료', crossBorderFee: '해외 거래 수수료', membershipFee: '회원 서비스 수수료', remark: '비고', detail: '상세 정보',
    pendingConfirmation: '확인 대기', confirmed: '확인됨',
    detailPage: {
      confirmedAmount: '확정 금액', confirmedAmountTip: '정산 결과에 따라 에이전트에게 지급되는 최종 금액', pendingCredit: '확정 대기 금액', confirmedCredit: '이번 달 확정 금액',
      totalReward: '총 보상 금액', monthlySummary: '이번 달 전체 보상 요약', creditedAmount: '지급 완료 금액', creditedSiteReward: '지급 완료된 에이전트 사이트 보상', siteCount: '사이트 수', siteUnit: '사이트', expandHint: '사이트를 펼치면 일별 내역을 확인할 수 있습니다',
      composition: '보상 구성', compositionHint: '이달의 에이전트 보상은 다음 요금 범주에 의해 요약됩니다.', primarySource: '주요 보상 항목', compositionPercent: '{percent}% 총 보상',
      siteDetails: '사이트별 보상 상세', siteDetailsHint: '사이트를 펼치면 일별 내역을 확인할 수 있습니다. 내보내기 전에 사이트를 선택하세요.', selectedSites: '{count}개 사이트 선택', noSiteSelected: '선택한 사이트 없음', exportData: '데이터 내보내기', dailySummary: '일별 요약', monthlyExport: '월별 요약', dataDetails: '상세 데이터',
      waitingConfirmation: '확정 대기', confirmationComplete: '확정 완료', verifyBeforeConfirm: '확정 전에 각 사이트의 보상 구성을 검토해 주세요.', recordConfirmed: '이 보상 기록은 확정되었습니다.', close: '닫기', confirmReward: '보상 확정',
      siteName: '사이트 이름', totalRewardUsd: '총 보상 $', creditedUsd: '지급 완료 금액 $', pendingUsd: '미확정 금액 $', date: '날짜', invitationCommission: '초대 보상 $', monthTotal: '월 합계',
      generatingFile: '파일을 생성 중입니다. 잠시 후 메시지를 확인해 주세요.', operationFailed: '작업 실패', confirmTitle: '보상 확정', confirmContent: '이번 달 에이전트 보상 데이터가 정확한지 확인해 주세요. 확정 후에는 다음 처리 단계로 진행되며 되돌릴 수 없습니다.', confirmSuccess: '보상을 확정했습니다', missingRecord: '보상 기록이 없습니다',
    },
  },
  setting: { title: '사이트 설정' },
  invite: { copy: '복사', empty: '초대 링크가 없습니다' },
  admin: {
    warning: '관리자 권한은 에이전트 사이트 관리에 영향을 줍니다. 신원이 확인된 계정만 추가하세요. 사이트 이용 가능 범위는 서버 권한과 위험 관리 결과에 따라 달라질 수 있습니다.',
    searchPlaceholder: '사이트 이름 / 관리자 / 도메인', clear: '지우기', add: '관리자 추가', siteCount: '{count} 에이전트 사이트',
    domain: '도메인', createdAt: '생성일', remove: '삭제', noMatch: '일치하는 관리자 없음', empty: '관리자가 없습니다',
    noMatchHint: '사이트 이름, 관리자 이름 또는 도메인 키워드를 변경하고 다시 시도해 주세요.', emptyHint: '관리자를 추가하여 에이전트 사이트 권한을 관리하세요.', clearFilter: '필터 지우기',
    promptTitle: '확인', removeConfirm: '관리자 <span class="ui-text-primary">{name}</span> 님을 삭제하시겠습니까?', removeSuccess: '관리자를 삭제했습니다', operationSuccess: '작업 성공', operationFailed: '작업 실패',
    modal: {
      title: '관리자 추가', confirmUser: '사용자 확인', confirmUserHint: '계정 찾기 및 확인', authorizeSites: '사이트 권한 부여', authorizeSitesHint: '관리 범위 선택',
      searchTitle: '관리자 계정 찾기', searchDescription: '사용자 이메일 또는 이름을 입력해 계정을 확인한 후 에이전트 사이트 권한을 부여하세요.', userName: '사용자 이름',
      userPlaceholder: '사용자 이메일 또는 이름을 입력하고 Enter 키를 누르세요.', searchHint: '이름이 비슷한 사용자를 잘못 선택하지 않도록 정확한 이메일 주소를 사용하세요.', confirmedAccount: '확인된 관리자 계정', searchAgain: '다시 검색',
      selectSites: '에이전트 사이트 선택', selectSitesDescription: '확인된 사용자가 관리할 수 있는 하나 이상의 에이전트 사이트 선택.', authorizeTo: '권한 부여 대상', agentSites: '에이전트 사이트',
      availableSites: '{count}개 사용 가능', selectedSites: ', {count}개 선택', sitePlaceholder: '권한을 부여할 에이전트 사이트를 선택하세요', authorizationHint: '제출 후 이 사용자는 선택한 에이전트 사이트의 관리 권한을 받습니다.', noSites: '권한을 부여할 수 있는 사이트가 없습니다. 에이전트 사이트 구성을 먼저 확인하세요.',
      cancel: '취소', previous: '이전', searchContinue: '검색 후 계속', confirmAdd: '확인 후 추가', enterUser: '검색할 사용자 이메일 또는 이름을 입력하세요', userNotFound: '일치하는 사용자를 찾을 수 없습니다. 입력 내용을 확인한 후 다시 시도하세요.', userMatched: '사용자를 확인했습니다', confirmAccountFirst: '먼저 관리자 계정을 확인하세요', selectSiteFirst: '에이전트 사이트를 하나 이상 선택하세요', addSuccess: '관리자를 추가했습니다',
    },
  },
}
