export default {
  description: 'API 요청에 필요한 인증 정보, 콜백 URL 및 접근 허용 목록을 관리합니다.', configureOrder: '먼저 보안 공개 키를 설정한 다음 IP 허용 목록, 콜백 URL 및 통신 비밀 키를 설정하세요.', itemCount: '{count}개 항목',
  status: { securityItems: '보안 항목', callbacks: '콜백 알림', ipRestriction: 'IP 제한', on: '사용', off: '사용 안 함', configured: '이미 설정됨', notConfigured: '설정되지 않음' },
  sectionTitle: 'API 보안 구성', change: '개정하다', set: '설정', reset: '다시 놓기', save: '저장',
  publicKey: {
    label: '보안 공개 키', configuredDesc: '전체 카드 정보를 복호화하려면 해당 개인 키를 사용하세요.', unconfiguredDesc: '전체 카드 정보를 조회하기 전에 암호화 공개 키를 설정하세요.', encryptionTip: '암호화에는 1024bit RSA/NONE/OAEPWithSHA1AndMGF1Padding을 사용합니다.', onlineExample: '온라인 예시',
    field: '공공 키', placeholder: '민감한 카드 정보를 암호화하는 데 사용되는 RSA 공개 키 입력', notice: '완전한 카드 정보는 이 공개 키로 암호화됩니다. 해당 개인 키를 사용하여 해독하십시오.', method: '암호화: 1024bit RSA/NONE/OAEPWithSHA1AndMGF1Padding.', masked: '현재 공중 열쇠는 masked입니다. 변경할 수 있는 완전한 공공 키를 입력합니다.', title: '보안 공개 키 설정', success: '수정 성공',
  },
  ipWhitelist: { label: 'IP 허용 목록', configuredDesc: '허용된 IP 주소만 API에 접근할 수 있습니다.', unconfiguredDesc: 'API 노출 위험을 줄이려면 서버의 외부 통신 IP 주소를 제한하세요.', tip: '설정 후에는 허용된 IP 주소만 API에 접근할 수 있습니다.', duplicate: '중복된 항목이 있습니다: {ip}', title: 'IP 허용 목록 수정', success: 'IP 허용 목록이 업데이트되었습니다', failed: 'IP 허용 목록을 업데이트할 수 없습니다' },
  webhook: { label: '콜백 URL', desc: 'Webhook 콜백 알림을 수신합니다', tip: '외부에서 접근 가능한 서버 주소를 입력하세요. 아래에서 프로토콜을 선택하므로 주소에 다시 포함하지 마세요.', title: 'Webhook 설정', success: '저장했습니다' },
  authorization: {
    label: '통신 키', configuredDesc: '서버 측 요청 서명 및 API 커뮤니케이션을 위해 사용하는', unconfiguredDesc: 'API 커뮤니케이션을 위해 사용하는', securityRequired: 'Bind and enable an <span class="text-smg">이메일 주소</span> 또는 <span class="text-smg">Google Authenticator</span> in <span class="text-smg">보안 센터</span> 계속.',
    resetConfirm: '통신 비밀을 재설정? 이전 비밀은 즉시 유효하지 않고 API 요청이 실패합니다. 서버 구성을 동시에 업데이트하십시오.', generateConfirm: '통신 비밀을 생성? API 요청 서명 및 통신에 대한 서버의 새로운 비밀을 구성합니다.', resetSuccess: '재설정 성공', setSuccess: '설정 성공', saveNotice: '새로운 통신 비밀을 안전하게 저장', viewTitle: '공지사항 계정 관리', copy: '복사', copied: '키가 클립보드에 복사되었습니다.',
  },
}
