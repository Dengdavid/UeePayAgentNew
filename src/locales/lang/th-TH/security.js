export default {
  verificationRequired: 'โปรดเชื่อมโยงและเปิดใช้งานอีเมลหรือ Google Authenticator ก่อนดำเนินการต่อ',
  singleLoginEnabled: 'เปิดใช้งานโหมดเข้าสู่ระบบได้ทีละอุปกรณ์แล้ว',
  singleLoginDisabled: 'ปิดใช้งานโหมดเข้าสู่ระบบได้ทีละอุปกรณ์แล้ว',
  singleLoginFailed: 'ไม่สามารถอัปเดตการตั้งค่าการเข้าสู่ระบบได้ทีละอุปกรณ์ โปรดลองอีกครั้งในภายหลัง',
  centerTitle: 'ศูนย์ความปลอดภัย',
  overview: {
    description: 'จัดการการยืนยันการเข้าสู่ระบบ ข้อจำกัดของอุปกรณ์ และวิธีการยืนยันตัวตนแบบสองปัจจัย', currentLevel: 'ระดับความปลอดภัยปัจจุบัน', progress: 'ความคืบหน้าการตั้งค่าความปลอดภัย', itemCount: '{count} รายการ', levelHigh: 'สูง', levelMedium: 'ปานกลาง', levelLow: 'ต่ำ',
    loginConfig: 'การตั้งค่าการเข้าสู่ระบบ', loginConfigDesc: 'จัดการรหัสผ่าน นโยบายอุปกรณ์ และข้อจำกัดของแหล่งที่มาของการเข้าสู่ระบบ', viewDevices: 'ดูอุปกรณ์ที่เข้าสู่ระบบ', loginPassword: 'รหัสผ่านเข้าสู่ระบบ', loginPasswordDesc: 'ใช้ยืนยันตัวตนเมื่อเข้าสู่ระบบบัญชี',
    change: 'เปลี่ยน', singleLogin: 'เข้าสู่ระบบได้ทีละอุปกรณ์', singleLoginOnDesc: 'บัญชีนี้เข้าสู่ระบบได้ครั้งละหนึ่งอุปกรณ์เท่านั้น', singleLoginOffDesc: 'บัญชีนี้เข้าสู่ระบบหลายอุปกรณ์พร้อมกันได้', enabled: 'เปิดใช้งาน', disabled: 'ปิดใช้งาน', enable: 'เปิดใช้งาน', disable: 'ปิดใช้งาน',
    ipWhitelist: 'รายการ IP ที่อนุญาต', ipSetDesc: 'เข้าสู่ระบบได้เฉพาะจากที่อยู่ IP ในรายการที่อนุญาตเท่านั้น', ipUnsetDesc: 'จำกัดแหล่งที่มาของการเข้าสู่ระบบที่ใช้งานเป็นประจำเพื่อลดความเสี่ยงจากการเข้าถึงโดยไม่ได้รับอนุญาต', set: 'ตั้งค่า', configured: 'ตั้งค่าแล้ว', notConfigured: 'ยังไม่ได้ตั้งค่า',
    twoFactor: 'การยืนยันตัวตนแบบสองปัจจัย', twoFactorDesc: 'เชื่อมโยงวิธีการยืนยันเพิ่มเติมสำหรับการดำเนินการที่สำคัญและการกู้คืนบัญชี', emailVerification: 'การยืนยันทางอีเมล', emailVerificationDesc: 'ใช้สำหรับเข้าสู่ระบบและกู้คืนรหัสผ่านได้', activated: 'เปิดใช้งาน', notActivated: 'ยังไม่เปิดใช้งาน', bind: 'เชื่อมโยง', googleAuthenticator: 'Google Authenticator', googleDesc: 'เชื่อมโยงแอปยืนยันตัวตนเพื่อเพิ่มความปลอดภัยของบัญชี', emailRequired: 'โปรดเชื่อมโยงและเปิดใช้งานอีเมลก่อนดำเนินการต่อ',
  },
  email: {
    unbound: 'ยังไม่มีอีเมลที่เชื่อมโยงกับบัญชีของคุณ', bound: 'อีเมลปัจจุบัน:', newAddress: 'อีเมลใหม่', invalid: 'โปรดกรอกอีเมลที่ถูกต้อง',
    newPlaceholder: "กรอกอีเมลใหม่ เช่น *****{'@'}gmail.com", code: 'รหัสยืนยัน', codePlaceholder: 'กรอกรหัสยืนยัน', codeAfterEmail: 'กรอกอีเมลเพื่อขอรหัสยืนยัน',
    changeTitle: 'เปลี่ยนอีเมล', save: 'บันทึก', bindSuccess: 'เชื่อมโยงอีเมลแล้ว', bindFailed: 'ไม่สามารถเชื่อมโยงอีเมลได้', changeSuccess: 'เปลี่ยนอีเมลแล้ว', changeFailed: 'ไม่สามารถเปลี่ยนอีเมลได้',
    verifyTitle: 'ยืนยันอีเมล', verifyDescription: 'เราได้ส่งรหัสยืนยัน 6 หลักไปยัง {email} โปรดกรอกรหัสด้านล่างเพื่อยืนยันให้เสร็จสิ้น', securityFooter: 'การยืนยันความปลอดภัยของ {siteName} · ปกป้องบัญชีของคุณ', securityTitle: 'การยืนยันความปลอดภัย', submit: 'ส่ง', googleClosed: 'ปิดใช้งาน Google Authenticator แล้ว', googleCloseFailed: 'ไม่สามารถปิดใช้งาน Google Authenticator ได้',
  },
  password: {
    old: 'รหัสผ่านปัจจุบัน', new: 'รหัสผ่านใหม่', confirm: 'ยืนยันรหัสผ่าน', length: 'กรอกรหัสผ่าน 6–32 ตัวอักษร', oldPlaceholder: 'กรอกรหัสผ่านปัจจุบัน', newPlaceholder: 'กรอกรหัสผ่านใหม่', confirmPlaceholder: 'กรอกรหัสผ่านใหม่อีกครั้ง', mismatch: 'รหัสผ่านไม่ตรงกัน', title: 'เปลี่ยนรหัสผ่าน', submit: 'ส่ง', success: 'เปลี่ยนรหัสผ่านแล้ว โปรดเข้าสู่ระบบอีกครั้ง', failed: 'ไม่สามารถเปลี่ยนรหัสผ่านได้',
  },
  ipWhitelist: { duplicate: 'พบรายการซ้ำ: {ip}', title: 'แก้ไขรายการ IP ที่อนุญาต', save: 'บันทึก', success: 'อัปเดตรายการ IP ที่อนุญาตแล้ว', failed: 'ไม่สามารถอัปเดตรายการ IP ที่อนุญาตได้' },
  google: {
    bind: 'เชื่อมโยง', downloadStep: 'ดาวน์โหลดแอปยืนยันตัวตน', scanStep: 'สแกนรหัส QR', verifyStep: 'การยืนยันความปลอดภัย', downloadTip: 'ดาวน์โหลดและติดตั้งแอป Google Authenticator', android: 'เวอร์ชัน Android', ios: 'เวอร์ชัน iOS',
    scanDownload: 'สแกนรหัส QR ด้วยโทรศัพท์เพื่อดาวน์โหลด Google Authenticator', addAccount: 'สแกนรหัส QR ด้านล่างด้วย Google Authenticator หรือกรอกคีย์ลับด้วยตนเองเพื่อเพิ่มบัญชี', rebindWarning: 'หากเชื่อมโยง Google Authenticator ใหม่ แอปยืนยันตัวตนเดิมจะไม่สามารถใช้งานได้อีก',
    manualCode: 'สแกนรหัส QR หรือกรอกรหัสต่อไปนี้ด้วยตนเอง:', copy: 'คัดลอก', enterCodeTip: 'กรอกรหัส 6 หลักจาก Google Authenticator เพื่อดำเนินการตั้งค่าให้เสร็จสิ้น', codePlaceholder: 'กรอกรหัส Google Authenticator 6 หลัก',
    keyCopied: 'คัดลอกคีย์ลับไปยังคลิปบอร์ดแล้ว', invalidCode: 'กรอกรหัสยืนยัน 6 หลัก', bindSuccess: 'เชื่อมโยง Google Authenticator แล้ว', title: 'เชื่อมโยง Google Authenticator',
  },
  loginRecords: {
    title: 'อุปกรณ์ที่เข้าสู่ระบบ', description: 'ดูอุปกรณ์ที่กำลังเข้าสู่ระบบและจัดการสถานะการเข้าสู่ระบบ', unknownDevice: 'อุปกรณ์ที่ไม่รู้จัก', currentDevice: 'อุปกรณ์ปัจจุบัน', currentLogin: 'กำลังเข้าสู่ระบบ', currentSession: 'เซสชันปัจจุบัน', unknownBrowser: 'เบราว์เซอร์ที่ไม่รู้จัก', ipAddress: 'ที่อยู่ IP', loginTime: 'เวลาเข้าสู่ระบบ', offline: 'ออกจากระบบ', empty: 'ไม่มีอุปกรณ์อื่นที่กำลังเข้าสู่ระบบ',
    loadFailed: 'ไม่สามารถโหลดอุปกรณ์ที่เข้าสู่ระบบได้ โปรดติดต่อฝ่ายสนับสนุน', confirmTitle: 'ออกจากระบบบนอุปกรณ์นี้หรือไม่', confirmContent: 'อุปกรณ์นี้จะต้องเข้าสู่ระบบอีกครั้ง', confirm: 'ยืนยัน', cancel: 'ยกเลิก', submitting: 'กำลังส่ง', success: 'ดำเนินการเสร็จสิ้น', offlineSuccess: 'ออกจากระบบบนอุปกรณ์แล้ว', failed: 'ดำเนินการไม่สำเร็จ',
  },
}
