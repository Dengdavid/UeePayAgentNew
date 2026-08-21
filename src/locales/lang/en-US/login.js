export default {
  title: 'Log In',
  placeholder: {
    account: 'Account or email',
    password: 'Password',
  },
  action: {
    loginNow: 'Log In',
    registerNow: 'Create Account',
    forgotPassword: 'Forgot password?',
  },
  prompt: {
    noAccount: "Don't have an account?",
  },
  notice: {
    title: 'Important Information',
    sufficientBalance: 'Keep a sufficient card balance to avoid transaction failures caused by insufficient funds.',
    noMaliciousBinding: 'Do not link cards to postpaid services when charges may fail.',
    noAuthorizationOnlyBinding: 'Do not link a card solely for platform authorization without a genuine transaction.',
    noFraudulentTransactions: 'Do not request malicious refunds or abuse return policies after making a payment.',
    accountHolderOnly: 'For use by the account holder or company only. Do not transfer cards to others. You are responsible for non-compliant use.',
  },
  validation: {
    accountRequired: 'Enter your account name or email address',
    passwordRequired: 'Enter your password',
  },
  message: {
    success: 'Logged in successfully',
    failed: 'Login failed',
  },
}
