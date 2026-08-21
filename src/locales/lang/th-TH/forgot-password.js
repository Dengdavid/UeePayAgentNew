export default {
  title: 'ดึงรหัสผ่าน',
  placeholder: {
    email: 'จดหมาย',
    verificationCode: 'รหัสตรวจสอบ',
    password: 'สร้างรหัสผ่านของอักขระ 6-32',
    confirmPassword: 'ยืนยันรหัสผ่านของคุณ',
  },
  action: {
    resetPassword: 'รีเซ็ตรหัสผ่าน',
    loginNow: 'เข้าสู่ระบบตอนนี้',
    registerNow: 'ลงทะเบียนตอนนี้',
  },
  prompt: {
    hasAccount: 'มีบัญชีอยู่แล้ว?',
    noAccount: 'ไม่มีบัญชี?',
  },
  validation: {
    emailRequired: 'กรุณากรอกอีเมล์ของคุณ',
    emailFormat: 'กรุณากรอกรูปแบบอีเมลที่ถูกต้อง',
    verificationCodeRequired: 'กรุณากรอกรหัสยืนยัน',
    verificationCodeLength: 'กรุณากรอกรหัสยืนยัน 6 หลัก',
    passwordRequired: 'กรุณากรอกรหัสผ่านใหม่',
    passwordLength: 'ความยาวรหัสผ่านต้องไม่น้อยกว่า 6 ตัวอักษร',
    confirmPasswordRequired: 'กรุณายืนยันรหัสผ่านใหม่',
    passwordMismatch: 'รหัสผ่านที่ป้อนสองครั้งไม่สอดคล้องกัน',
  },
  message: {
    success: 'การปรับค่ารหัสผ่านเรียบร้อยแล้ว',
    failed: 'การปรับค่ารหัสผ่านล้มเหลว',
  },
}
