export default {
  title: 'Lấy lại mật khẩu',
  placeholder: {
    email: 'Thư',
    verificationCode: 'Mã xác định',
    password: 'Tạo một mật khẩu ký tự 6- 32',
    confirmPassword: 'Xác nhận mật khẩu của bạn',
  },
  action: {
    resetPassword: 'đặt lại mật khẩu',
    loginNow: 'Đăng nhập ngay bây giờ',
    registerNow: 'Đăng ký ngay bây giờ',
  },
  prompt: {
    hasAccount: 'Đã có tài khoản?',
    noAccount: 'Không có tài khoản?',
  },
  validation: {
    emailRequired: 'Vui lòng nhập email của bạn',
    emailFormat: 'Vui lòng nhập đúng định dạng email',
    verificationCodeRequired: 'Vui lòng nhập mã xác minh',
    verificationCodeLength: 'Vui lòng nhập mã xác minh gồm 6 chữ số',
    passwordRequired: 'Vui lòng nhập mật khẩu mới',
    passwordLength: 'Độ dài mật khẩu không thể ít hơn 6 ký tự',
    confirmPasswordRequired: 'Vui lòng xác nhận mật khẩu mới',
    passwordMismatch: 'Mật khẩu nhập hai lần không nhất quán',
  },
  message: {
    success: 'Đặt lại mật khẩu thành công',
    failed: 'Không thể đặt lại mật khẩu',
  },
}
