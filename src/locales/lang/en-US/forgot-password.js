export default {
  title: 'Reset Password',
  placeholder: {
    email: 'Email',
    verificationCode: 'Verification code',
    password: 'Create a 6-32 character password',
    confirmPassword: 'Confirm your new password',
  },
  action: {
    resetPassword: 'Reset Password',
    loginNow: 'Log In',
    registerNow: 'Create Account',
  },
  prompt: {
    hasAccount: 'Already have an account?',
    noAccount: "Don't have an account?",
  },
  validation: {
    emailRequired: 'Enter your email address',
    emailFormat: 'Enter a valid email address',
    verificationCodeRequired: 'Enter the verification code',
    verificationCodeLength: 'Enter the 6-digit verification code',
    passwordRequired: 'Enter a new password',
    passwordLength: 'The password must contain at least 6 characters',
    confirmPasswordRequired: 'Confirm your new password',
    passwordMismatch: 'The passwords do not match',
  },
  message: {
    success: 'Password reset successfully',
    failed: 'Password reset failed',
  },
}
