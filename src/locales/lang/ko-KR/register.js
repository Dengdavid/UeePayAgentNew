import legal from './agreement.js'

export default {
  legal,
  title: '계정 등록',
  placeholder: {
    account: '6~20자의 계정 이름을 입력해 주세요',
    email: '우편',
    verificationCode: '인증 코드',
    password: '6-30 문자 암호 생성',
    confirmPassword: '비밀번호를 다시 입력해 주세요',
    invitationCode: '초대 코드 (옵션)',
  },
  agreement: {
    agreePrefix: '읽었으며 이에 동의합니다.',
    userAgreement: '"이용약관"',
    conjunction: '그리고',
    privacyPolicy: '"개인정보 보호 계약"',
    userAgreementTitle: '사용자 계약',
    privacyPolicyTitle: '개인 정보 보호 계약',
    read: '나는 읽었다',
    readAll: '전체 동의를 읽으십시오',
    required: '먼저 사용자 계약 및 개인 정보 보호 계약을 읽고 동의하십시오.',
  },
  action: {
    registerNow: '지금 등록하세요',
    loginNow: '지금 로그인하세요',
    forgotPassword: '비밀번호를 잊으셨나요?',
  },
  prompt: {
    hasAccount: '이미 계정이 있나요?',
  },
  validation: {
    accountRequired: '로그인 계정을 입력해주세요',
    accountLength: '계정 이름은 6~20자여야 합니다',
    accountTrim: '계좌 번호에는 앞이나 뒤에 공백이 포함될 수 없습니다.',
    accountSpaces: '계정에는 공백이 포함될 수 없습니다.',
    accountFormat: '계좌번호는 중국어, 영문, 숫자만 포함할 수 있으며, 이메일 형식을 사용할 수 있습니다.',
    emailRequired: '이메일 주소를 입력해주세요',
    emailFormat: '올바른 이메일 형식을 입력하세요.',
    verificationCodeRequired: '인증 코드를 입력',
    passwordRequired: '로그인 비밀번호를 입력해주세요',
    passwordLength: '비밀번호는 6~30자여야 합니다',
    confirmPasswordRequired: '확인 비밀번호를 입력해주세요',
    passwordMismatch: '두 비밀번호가 동일하지 않습니다.',
  },
  message: {
    success: '등록 성공',
    failed: '등록 실패',
  },
}
