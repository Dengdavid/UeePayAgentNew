export default {
  verificationRequired: '계속하기 전에 이메일 또는 Google Authenticator를 연결하고 활성화해 주세요.',
  singleLoginEnabled: '단일 로그인 모드가 성공적으로 활성화되었습니다.',
  singleLoginDisabled: '단일 로그인 모드가 비활성화되었습니다.',
  singleLoginFailed: '단일 로그인 설정을 변경할 수 없습니다. 잠시 후 다시 시도해 주세요.',
  centerTitle: '보안 센터',
  overview: {
    description: '로그인 인증, 기기 제한 및 2단계 인증 방법을 관리합니다.', currentLevel: '현재 보안 수준', progress: '보안 설정 진행률', itemCount: '{count}개 항목', levelHigh: '높음', levelMedium: '보통', levelLow: '낮음',
    loginConfig: '로그인 설정', loginConfigDesc: '로그인 비밀번호, 기기 정책 및 로그인 출처 제한을 관리합니다.', viewDevices: '로그인 기기 보기', loginPassword: '로그인 비밀번호', loginPasswordDesc: '로그인 시 본인 확인에 사용됩니다',
    change: '변경', singleLogin: '단일 로그인', singleLoginOnDesc: '동일한 계정은 한 기기에서만 로그인할 수 있습니다.', singleLoginOffDesc: '동일한 계정으로 여러 기기에 동시에 로그인할 수 있습니다.', enabled: '활성화됨', disabled: '비활성화됨', enable: '활성화', disable: '비활성화',
    ipWhitelist: 'IP 허용 목록', ipSetDesc: '허용 목록에 등록된 IP 주소에서만 로그인할 수 있습니다.', ipUnsetDesc: '비정상적인 접근 위험을 줄이려면 자주 사용하는 로그인 출처를 제한하세요.', set: '설정', configured: '설정됨', notConfigured: '설정되지 않음',
    twoFactor: '2단계 인증', twoFactorDesc: '민감한 작업과 계정 복구에 사용할 추가 인증 방법을 연결하세요.', emailVerification: '이메일 인증', emailVerificationDesc: '로그인과 비밀번호 복구에 사용할 수 있습니다.', activated: '활성화됨', notActivated: '활성화되지 않음', bind: '연결', googleAuthenticator: 'Google Authenticator', googleDesc: '인증 앱을 사용해 계정 보안을 강화합니다.', emailRequired: '계속하려면 이메일 주소를 연결하고 활성화하세요.',
  },
  email: {
    unbound: '현재 계정에 연결된 이메일 주소가 없습니다.', bound: '현재 이메일 주소:', newAddress: '새 이메일 주소', invalid: '유효한 이메일 주소를 입력해 주세요.',
    newPlaceholder: "새 이메일 주소를 입력해 주세요. 예: *****{'@'}gmail.com", code: '인증 코드', codePlaceholder: '인증 코드를 입력', codeAfterEmail: '인증 코드를 요청하려면 이메일 주소를 입력하십시오.',
    changeTitle: '이메일 변경', save: '저장', bindSuccess: '이메일 주소가 연결되었습니다', bindFailed: '이메일 주소를 연결할 수 없습니다', changeSuccess: '이메일 주소가 변경되었습니다', changeFailed: '이메일 주소를 변경할 수 없습니다',
    verifyTitle: '이메일 인증', verifyDescription: '{email}로 6자리 인증 코드를 보냈습니다. 아래에 입력하여 인증을 완료해 주세요.', securityFooter: '{siteName} 보안 인증 · 계정 보호', securityTitle: '보안 인증', submit: '제출', googleClosed: 'Google Authenticator가 비활성화되었습니다', googleCloseFailed: 'Google Authenticator를 비활성화할 수 없습니다',
  },
  password: {
    old: '현재 비밀번호', new: '새 비밀번호', confirm: '비밀번호 확인', length: '6~32자의 비밀번호를 입력해 주세요', oldPlaceholder: '현재 비밀번호를 입력해 주세요', newPlaceholder: '새 비밀번호를 입력해 주세요', confirmPlaceholder: '새 비밀번호를 다시 입력해 주세요', mismatch: '비밀번호가 일치하지 않습니다', title: '비밀번호 변경', submit: '제출', success: '비밀번호가 변경되었습니다. 다시 로그인해 주세요.', failed: '비밀번호를 변경할 수 없습니다',
  },
  ipWhitelist: { duplicate: '중복된 항목이 있습니다: {ip}', title: 'IP 허용 목록 수정', save: '저장', success: 'IP 허용 목록이 업데이트되었습니다', failed: 'IP 허용 목록을 업데이트할 수 없습니다' },
  google: {
    bind: '연결', downloadStep: '인증 앱 다운로드', scanStep: 'QR 코드 스캔', verifyStep: '보안 인증', downloadTip: 'Google Authenticator 앱을 다운로드하여 설치해 주세요.', android: 'Android 버전', ios: 'iOS 버전',
    scanDownload: '휴대전화로 QR 코드를 스캔하여 Google Authenticator를 다운로드해 주세요', addAccount: 'Google Authenticator로 아래 QR 코드를 스캔하거나 비밀 키를 직접 입력하여 계정을 추가해 주세요.', rebindWarning: 'Google Authenticator를 다시 연결하면 기존 인증 앱은 더 이상 사용할 수 없습니다.',
    manualCode: 'QR 코드를 스캔하거나 다음 코드를 직접 입력해 주세요:', copy: '복사', enterCodeTip: 'Google Authenticator에서 생성된 6자리 코드를 입력하여 설정을 완료해 주세요', codePlaceholder: 'Google Authenticator의 6자리 코드를 입력해 주세요',
    keyCopied: '비밀 키가 클립보드에 복사되었습니다', invalidCode: '6자리 인증 코드를 입력해 주세요', bindSuccess: 'Google Authenticator가 연결되었습니다', title: 'Google Authenticator 연결',
  },
  loginRecords: {
    title: '로그인 기기', description: '현재 로그인된 기기를 확인하고 로그인 상태를 관리할 수 있습니다.', unknownDevice: '알 수 없는 기기', currentDevice: '현재 기기', currentLogin: '로그인 중', currentSession: '현재 세션', unknownBrowser: '알 수 없는 브라우저', ipAddress: 'IP 주소', loginTime: '로그인 시간', offline: '로그아웃', empty: '다른 로그인 기기가 없습니다',
    loadFailed: '로그인 기기를 불러올 수 없습니다. 고객 지원에 문의해 주세요.', confirmTitle: '이 기기에서 로그아웃하시겠습니까?', confirmContent: '이 기기에서는 다시 로그인해야 합니다.', confirm: '확인', cancel: '취소', submitting: '제출 중', success: '작업이 완료되었습니다', offlineSuccess: '기기에서 로그아웃했습니다', failed: '작업에 실패했습니다',
  },
}
