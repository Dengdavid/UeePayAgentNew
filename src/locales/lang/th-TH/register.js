import legal from './agreement.js'

export default {
  legal,
  title: 'ลงทะเบียนบัญชี',
  placeholder: {
    account: 'กรุณากรอกหมายเลขบัญชี 6-20 หลัก',
    email: 'จดหมาย',
    verificationCode: 'รหัสตรวจสอบ',
    password: 'สร้างรหัสผ่านของอักขระ 6-30',
    confirmPassword: 'ยืนยันรหัสผ่านของคุณ',
    invitationCode: 'รหัสการเชื้อเชิญ (ตัวเลือกเสริม)',
  },
  agreement: {
    agreePrefix: 'ฉันได้อ่านและเห็นด้วย',
    userAgreement: '“ข้อตกลงผู้ใช้”',
    conjunction: 'และ',
    privacyPolicy: '“ข้อตกลงความเป็นส่วนตัว”',
    userAgreementTitle: 'ข้อตกลงผู้ใช้',
    privacyPolicyTitle: 'ข้อตกลงความเป็นส่วนตัว',
    read: 'ฉันได้อ่าน',
    readAll: 'โปรดอ่านข้อตกลงทั้งหมด',
    required: 'โปรดอ่านและยอมรับข้อตกลงผู้ใช้และข้อตกลงความเป็นส่วนตัวก่อน',
  },
  action: {
    registerNow: 'ลงทะเบียนตอนนี้',
    loginNow: 'เข้าสู่ระบบตอนนี้',
    forgotPassword: 'ลืมรหัสผ่านเหรอ?',
  },
  prompt: {
    hasAccount: 'มีบัญชีอยู่แล้ว?',
  },
  validation: {
    accountRequired: 'กรุณากรอกบัญชีเข้าสู่ระบบของคุณ',
    accountLength: 'กรุณากรอกหมายเลขบัญชี 6-20 หลัก',
    accountTrim: 'หมายเลขบัญชีต้องไม่มีช่องว่างนำหน้าหรือต่อท้าย',
    accountSpaces: 'บัญชีไม่สามารถมีช่องว่างได้',
    accountFormat: 'หมายเลขบัญชีมีได้เฉพาะตัวอักษรจีน อังกฤษ และตัวเลข หรือใช้รูปแบบอีเมล',
    emailRequired: 'กรุณากรอกที่อยู่อีเมลของคุณ',
    emailFormat: 'กรุณากรอกรูปแบบอีเมลที่ถูกต้อง',
    verificationCodeRequired: 'กรุณากรอกรหัสยืนยัน',
    passwordRequired: 'กรุณากรอกรหัสผ่านเข้าสู่ระบบของคุณ',
    passwordLength: 'กรุณากรอกรหัสผ่าน 6-30 หลัก',
    confirmPasswordRequired: 'กรุณากรอกรหัสผ่านยืนยัน',
    passwordMismatch: 'รหัสผ่านทั้งสองไม่เหมือนกัน',
  },
  message: {
    success: 'การลงทะเบียนสำเร็จ',
    failed: 'การลงทะเบียนล้มเหลว',
  },
}
