export default {
  verificationRequired: 'Vui lòng liên kết và kích hoạt email hoặc Google Authenticator trước khi tiếp tục.',
  singleLoginEnabled: 'Đã bật chế độ chỉ đăng nhập trên một thiết bị',
  singleLoginDisabled: 'Chế độ đăng nhập đơn bị tắt thành công',
  singleLoginFailed: 'Không thể cập nhật chế độ đăng nhập trên một thiết bị. Vui lòng thử lại sau.',
  centerTitle: 'Trung tâm bảo mật',
  overview: {
    description: 'Quản lý xác minh đăng nhập, giới hạn thiết bị và các phương thức xác thực hai yếu tố.', currentLevel: 'Mức độ bảo mật hiện tại', progress: 'Tiến độ bảo mật', itemCount: '{count} mục', levelHigh: 'Cao', levelMedium: 'Trung bình', levelLow: 'Thấp',
    loginConfig: 'Cài đặt đăng nhập', loginConfigDesc: 'Quản lý mật khẩu, chính sách thiết bị và giới hạn nguồn đăng nhập.', viewDevices: 'Xem thiết bị đăng nhập', loginPassword: 'Mật khẩu đăng nhập', loginPasswordDesc: 'Dùng để xác minh danh tính khi đăng nhập',
    change: 'Thay đổi', singleLogin: 'Đăng nhập trên một thiết bị', singleLoginOnDesc: 'Mỗi lần chỉ có thể đăng nhập tài khoản này trên một thiết bị', singleLoginOffDesc: 'Có thể đăng nhập tài khoản này trên nhiều thiết bị cùng lúc', enabled: 'Đã bật', disabled: 'Đã tắt', enable: 'Bật', disable: 'Tắt',
    ipWhitelist: 'Danh sách IP được phép', ipSetDesc: 'Chỉ có địa chỉ IP trên danh sách cho phép ký vào', ipUnsetDesc: 'Hạn chế các nguồn đăng nhập chung để giảm rủi ro truy cập trái phép', set: 'cài đặt', configured: 'Đã thiết lập', notConfigured: 'Chưa cấu hình',
    twoFactor: 'Xác thực hai yếu tố', twoFactorDesc: 'Liên kết phương thức xác minh bổ sung cho các thao tác nhạy cảm và khôi phục tài khoản.', emailVerification: 'Xác minh email', emailVerificationDesc: 'Có thể dùng để đăng nhập và khôi phục mật khẩu', activated: 'Đã kích hoạt', notActivated: 'Chưa kích hoạt', bind: 'Liên kết', googleAuthenticator: 'Google Authenticator', googleDesc: 'Liên kết ứng dụng xác thực để tăng cường bảo mật tài khoản', emailRequired: 'Liên kết và kích hoạt địa chỉ email trước khi tiếp tục.',
  },
  email: {
    unbound: 'Không có địa chỉ email nào được liên kết đến tài khoản của bạn.', bound: 'Địa chỉ thư hiện thời:', newAddress: 'Địa chỉ thư mới', invalid: 'Vui lòng nhập địa chỉ email hợp lệ',
    newPlaceholder: "Nhập địa chỉ email mới, ví dụ: *****{'@'}gmail.com", code: 'Mã xác minh', codePlaceholder: 'Vui lòng nhập mã xác minh', codeAfterEmail: 'Nhập địa chỉ email để yêu cầu mã xác minh',
    changeTitle: 'Thay đổi địa chỉ email', save: 'Lưu', bindSuccess: 'Đã liên kết địa chỉ email', bindFailed: 'Không thể liên kết địa chỉ email', changeSuccess: 'Đã thay đổi địa chỉ email', changeFailed: 'Không thể thay đổi địa chỉ email',
    verifyTitle: 'Xác minh email', verifyDescription: 'Chúng tôi đã gửi mã xác minh gồm 6 chữ số đến {email}. Hãy nhập mã bên dưới để hoàn tất xác minh.', securityFooter: 'Xác minh bảo mật {siteName} · Bảo vệ tài khoản của bạn', securityTitle: 'Xác minh bảo mật', submit: 'Gửi', googleClosed: 'Đã tắt Google Authenticator', googleCloseFailed: 'Không thể tắt Google Authenticator',
  },
  password: {
    old: 'Mật khẩu hiện tại', new: 'Mật khẩu mới', confirm: 'Xác nhận mật khẩu', length: 'Nhập mật khẩu từ 6–32 ký tự', oldPlaceholder: 'Nhập mật khẩu hiện tại', newPlaceholder: 'Nhập mật khẩu mới', confirmPlaceholder: 'Nhập lại mật khẩu mới', mismatch: 'Mật khẩu không khớp', title: 'Đổi mật khẩu', submit: 'Gửi', success: 'Đã đổi mật khẩu. Vui lòng đăng nhập lại.', failed: 'Không thể đổi mật khẩu',
  },
  ipWhitelist: { duplicate: 'Tìm mục nhập trùng:{ip}', title: 'Chỉnh sửa danh sách IP được phép', save: 'Lưu', success: 'Đã cập nhật danh sách IP được phép', failed: 'Sửa đổi không thành công' },
  google: {
    bind: 'Liên kết', downloadStep: 'Tải ứng dụng xác thực', scanStep: 'Quét mã QR', verifyStep: 'Xác minh bảo mật', downloadTip: 'Tải xuống và cài đặt ứng dụng Google Authenticator', android: 'Phiên bản Android', ios: 'Phiên bản iOS',
    scanDownload: 'Dùng điện thoại quét mã QR để tải Google Authenticator', addAccount: 'Quét mã QR bên dưới bằng Google Authenticator hoặc nhập khóa bí mật theo cách thủ công để thêm tài khoản.', rebindWarning: 'Nếu liên kết lại Google Authenticator, ứng dụng xác thực trước đó sẽ không còn sử dụng được.',
    manualCode: 'Quét mã QR hoặc nhập mã này bằng tay:', copy: 'Sao chép', enterCodeTip: 'Nhập mã 6 số do Google xác thực để hoàn tất thiết lập', codePlaceholder: 'Nhập mã Google xác thực 6 số',
    keyCopied: 'Đã sao chép khóa vào bảng nhớ tạm', invalidCode: 'Nhập một mã xác thực 6 số', bindSuccess: 'Đã liên kết Google Authenticator thành công', title: 'Liên kết Google Authenticator',
  },
  loginRecords: {
    title: 'Thiết bị đã đăng nhập', description: 'Xem các thiết bị đang đăng nhập và quản lý trạng thái đăng nhập.', unknownDevice: 'Thiết bị không xác định', currentDevice: 'Thiết bị hiện tại', currentLogin: 'Đang đăng nhập', currentSession: 'Phiên hiện tại', unknownBrowser: 'Trình duyệt không xác định', ipAddress: 'Địa chỉ IP', loginTime: 'Thời gian đăng nhập', offline: 'Đăng xuất', empty: 'Không có thiết bị nào khác đang đăng nhập',
    loadFailed: 'Không thể tải danh sách thiết bị đăng nhập. Vui lòng liên hệ bộ phận hỗ trợ.', confirmTitle: 'Đăng xuất khỏi thiết bị này?', confirmContent: 'Thiết bị này sẽ cần đăng nhập lại.', confirm: 'Xác nhận', cancel: 'Hủy', submitting: 'Đang gửi', success: 'Đã hoàn tất thao tác', offlineSuccess: 'Đã đăng xuất khỏi thiết bị', failed: 'Thao tác không thành công',
  },
}
