import legal from './agreement.js'

export default {
  legal,
  title: 'Bir hesap kaydedin',
  placeholder: {
    account: 'Lütfen 6-20 haneli hesap numarasını giriniz',
    email: 'Posta',
    verificationCode: 'Doğrulama Kodu',
    password: '6-30 karakter şifresi oluşturun',
    confirmPassword: 'Parolanızı Onaylayın',
    invitationCode: 'Davet kodu (optional)',
  },
  agreement: {
    agreePrefix: 'Okudum ve kabul ediyorum',
    userAgreement: '"Kullanıcı Sözleşmesi"',
    conjunction: 'Ve',
    privacyPolicy: '"Gizlilik Sözleşmesi"',
    userAgreementTitle: 'Kullanıcı Sözleşmesi',
    privacyPolicyTitle: 'gizlilik sözleşmesi',
    read: 'okudum',
    readAll: 'Lütfen tüm anlaşmayı okuyun',
    required: 'Lütfen önce Kullanıcı Sözleşmesini ve Gizlilik Sözleşmesini okuyup kabul edin',
  },
  action: {
    registerNow: 'Şimdi kaydolun',
    loginNow: 'Şimdi oturum açın',
    forgotPassword: 'şifreyi mi unuttun?',
  },
  prompt: {
    hasAccount: 'Zaten bir hesabınız var mı?',
  },
  validation: {
    accountRequired: 'Lütfen giriş hesabınızı girin',
    accountLength: 'Lütfen 6-20 haneli hesap numarasını giriniz',
    accountTrim: 'Hesap numarasının başında veya sonunda boşluk bulunamaz.',
    accountSpaces: 'Hesap boşluk içeremez',
    accountFormat: 'Hesap numarası yalnızca Çince, İngilizce harfler ve rakamlar içerebilir veya e-posta biçimini kullanabilir',
    emailRequired: 'Lütfen e-posta adresinizi girin',
    emailFormat: 'Lütfen doğru e-posta biçimini girin',
    verificationCodeRequired: 'doğrulama kodunu girin',
    passwordRequired: 'Lütfen giriş şifrenizi girin',
    passwordLength: 'Lütfen 6-30 haneli bir şifre girin',
    confirmPasswordRequired: 'Lütfen onay şifresini girin',
    passwordMismatch: 'İki şifre aynı değil',
  },
  message: {
    success: 'Kayıt başarılı',
    failed: 'Kayıt başarısız oldu',
  },
}
