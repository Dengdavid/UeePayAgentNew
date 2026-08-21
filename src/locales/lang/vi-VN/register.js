import legal from './agreement.js'

export default {
  legal,
  title: 'Đăng ký tài khoản',
  placeholder: {
    account: 'Vui lòng nhập số tài khoản gồm 6-20 chữ số',
    email: 'Thư',
    verificationCode: 'Mã xác định',
    password: 'Tạo một mật khẩu 6- 30 ký tự',
    confirmPassword: 'Xác nhận mật khẩu của bạn',
    invitationCode: 'Mã giấy mời (tùy chọn)',
  },
  agreement: {
    agreePrefix: 'Tôi đã đọc và đồng ý',
    userAgreement: '"Thỏa thuận người dùng"',
    conjunction: 'Và',
    privacyPolicy: '"Thỏa thuận quyền riêng tư"',
    userAgreementTitle: 'Thỏa thuận người dùng',
    privacyPolicyTitle: 'thỏa thuận quyền riêng tư',
    read: 'tôi đã đọc',
    readAll: 'Xin hãy đọc thỏa thuận.',
    required: 'Vui lòng đọc và đồng ý với Thỏa thuận người dùng và Thỏa thuận quyền riêng tư trước',
  },
  action: {
    registerNow: 'Đăng ký ngay bây giờ',
    loginNow: 'Đăng nhập ngay bây giờ',
    forgotPassword: 'quên mật khẩu?',
  },
  prompt: {
    hasAccount: 'Đã có tài khoản?',
  },
  validation: {
    accountRequired: 'Vui lòng nhập tài khoản đăng nhập của bạn',
    accountLength: 'Vui lòng nhập số tài khoản gồm 6-20 chữ số',
    accountTrim: 'Số tài khoản không được chứa dấu cách ở đầu hoặc cuối.',
    accountSpaces: 'Tài khoản không thể chứa dấu cách',
    accountFormat: 'Số tài khoản chỉ được chứa chữ và số tiếng Trung, tiếng Anh hoặc sử dụng định dạng email',
    emailRequired: 'Vui lòng nhập địa chỉ email của bạn',
    emailFormat: 'Vui lòng nhập đúng định dạng email',
    verificationCodeRequired: 'Vui lòng nhập mã xác minh',
    passwordRequired: 'Vui lòng nhập mật khẩu đăng nhập của bạn',
    passwordLength: 'Vui lòng nhập mật khẩu 6-30 chữ số',
    confirmPasswordRequired: 'Vui lòng nhập mật khẩu xác nhận',
    passwordMismatch: 'Hai mật khẩu không giống nhau',
  },
  message: {
    success: 'Đăng ký thành công',
    failed: 'Đăng ký không thành công',
  },
}
