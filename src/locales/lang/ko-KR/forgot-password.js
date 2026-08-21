export default {
  title: '비밀번호 검색',
  placeholder: {
    email: '우편',
    verificationCode: '인증 코드',
    password: '6-32 문자 암호 생성',
    confirmPassword: '비밀번호를 다시 입력해 주세요',
  },
  action: {
    resetPassword: '비밀번호 재설정',
    loginNow: '지금 로그인하세요',
    registerNow: '지금 등록하세요',
  },
  prompt: {
    hasAccount: '이미 계정이 있나요?',
    noAccount: '계정이 없나요?',
  },
  validation: {
    emailRequired: '이메일을 입력해주세요',
    emailFormat: '올바른 이메일 형식을 입력하세요.',
    verificationCodeRequired: '인증 코드를 입력',
    verificationCodeLength: '6자리 검증 코드 입력',
    passwordRequired: '새로운 비밀번호를 입력해주세요',
    passwordLength: '비밀번호 길이는 6자 미만일 수 없습니다.',
    confirmPasswordRequired: '새 비밀번호를 확인해 주세요',
    passwordMismatch: '두 번 입력한 비밀번호가 일치하지 않습니다.',
  },
  message: {
    success: '비밀번호 재설정',
    failed: '비밀번호 재설정 실패',
  },
}
