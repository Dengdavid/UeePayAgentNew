import legal from './agreement.js'

export default {
  legal,
  title: 'Create Account',
  placeholder: {
    account: 'Enter a 6-20 character account name',
    email: 'Email',
    verificationCode: 'Verification code',
    password: 'Create a 6-30 character password',
    confirmPassword: 'Confirm your password',
    invitationCode: 'Invitation code (optional)',
  },
  agreement: {
    agreePrefix: 'I have read and agree to the',
    userAgreement: 'User Agreement',
    conjunction: 'and',
    privacyPolicy: 'Privacy Policy',
    userAgreementTitle: 'User Agreement',
    privacyPolicyTitle: 'Privacy Policy',
    read: 'I Have Read It',
    readAll: 'Please read the entire agreement',
    required: 'Please read and agree to the User Agreement and Privacy Policy first',
  },
  action: {
    registerNow: 'Create Account',
    loginNow: 'Log In',
    forgotPassword: 'Forgot password?',
  },
  prompt: {
    hasAccount: 'Already have an account?',
  },
  validation: {
    accountRequired: 'Enter your account name',
    accountLength: 'The account name must contain 6-20 characters',
    accountTrim: 'The account name cannot contain leading or trailing spaces',
    accountSpaces: 'The account name cannot contain spaces',
    accountFormat: 'Use Chinese characters, English letters, numbers, or a valid email address',
    emailRequired: 'Enter your email address',
    emailFormat: 'Enter a valid email address',
    verificationCodeRequired: 'Enter the verification code',
    passwordRequired: 'Enter your password',
    passwordLength: 'The password must contain 6-30 characters',
    confirmPasswordRequired: 'Confirm your password',
    passwordMismatch: 'The passwords do not match',
  },
  message: {
    success: 'Account created successfully',
    failed: 'Registration failed',
  },
}
