export default {
  title: 'Şifreyi al',
  placeholder: {
    email: 'Posta',
    verificationCode: 'Doğrulama Kodu',
    password: '6-32 karakter şifresi oluşturun',
    confirmPassword: 'Parolanızı Onaylayın',
  },
  action: {
    resetPassword: 'şifreyi sıfırla',
    loginNow: 'Şimdi oturum açın',
    registerNow: 'Şimdi kaydolun',
  },
  prompt: {
    hasAccount: 'Zaten bir hesabınız var mı?',
    noAccount: 'Hesabın yok mu?',
  },
  validation: {
    emailRequired: 'Lütfen e-postanızı girin',
    emailFormat: 'Lütfen doğru e-posta biçimini girin',
    verificationCodeRequired: 'doğrulama kodunu girin',
    verificationCodeLength: '6 haneli doğrulama kodunu girin',
    passwordRequired: 'Lütfen yeni şifreyi girin',
    passwordLength: 'Şifre uzunluğu 6 karakterden az olamaz',
    confirmPasswordRequired: 'Lütfen yeni şifreyi onaylayın',
    passwordMismatch: 'İki kez girilen şifreler tutarsız',
  },
  message: {
    success: 'Şifre sıfırlama başarıyla',
    failed: 'Şifre sıfırlama başarısız oldu',
  },
}
