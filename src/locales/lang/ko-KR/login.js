export default {
  title: '로그인',
  placeholder: {
    account: '계정 또는 이메일',
    password: '비밀번호',
  },
  action: {
    loginNow: '지금 로그인하세요',
    registerNow: '지금 등록하세요',
    forgotPassword: '비밀번호를 잊으셨나요?',
  },
  prompt: {
    noAccount: '계정이 없나요?',
  },
  notice: {
    title: '안전한 카드 사용 안내',
    sufficientBalance: '거래 실패를 피하기 위해 충분한 카드 잔액을 유지하십시오.',
    noMaliciousBinding: '수수료가 실패할 때 선불 서비스에 카드를 연결하지 마십시오.',
    noAuthorizationOnlyBinding: '정품 거래없이 플랫폼 인증을위한 카드에 대해 단독으로 연결하지 마십시오.',
    noFraudulentTransactions: '결제 후 악성 환불 또는 남용 반품 정책을 요청하지 마십시오.',
    accountHolderOnly: '계정 보유자 또는 회사에 의해 사용. 다른 사람에게 카드를 전송하지 마십시오. 당신은 규정을 준수하지 않는 사용을 책임집니다.',
  },
  validation: {
    accountRequired: '계정 이름 또는 이메일 주소를 입력하십시오.',
    passwordRequired: '비밀번호',
  },
  message: {
    success: '로그인 성공',
    failed: '로그인 실패',
  },
}
