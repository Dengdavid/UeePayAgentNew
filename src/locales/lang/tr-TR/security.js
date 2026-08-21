export default {
  verificationRequired: 'Devam etmeden önce e-posta doğrulamasını veya Google Authenticator’ı etkinleştirin.',
  singleLoginEnabled: 'Tek oturum açma modu başarıyla etkinleştirildi',
  singleLoginDisabled: 'Tek oturum açma modu başarıyla devre dışı bırakıldı',
  singleLoginFailed: 'Tek oturum açma ayarı güncellenemedi. Daha sonra tekrar deneyin.',
  centerTitle: 'Güvenlik Merkezi',
  overview: {
    description: 'Giriş doğrulamasını, cihaz kısıtlamalarını ve iki faktörlü doğrulama yöntemlerini yönetin.', currentLevel: 'Mevcut Güvenlik Düzeyi', progress: 'Güvenlik İlerlemesi', itemCount: '{count} öğe', levelHigh: 'Yüksek', levelMedium: 'Orta', levelLow: 'Düşük',
    loginConfig: 'Giriş Yapılandırması', loginConfigDesc: 'Giriş şifrenizi, cihaz politikasını ve giriş kaynağı kısıtlamalarını yönetin.', viewDevices: 'Giriş Cihazlarını Görüntüle', loginPassword: 'Giriş Şifresi', loginPasswordDesc: 'Oturum açarken erişimi doğrulamak için kullanılır',
    change: 'Değiştir', singleLogin: 'Tek Oturum Açma', singleLoginOnDesc: 'Bu hesapla aynı anda yalnızca bir cihazda oturum açılabilir', singleLoginOffDesc: 'Bu hesapla aynı anda birden fazla cihazda oturum açılabilir', enabled: 'Etkin', disabled: 'Devre Dışı', enable: 'Etkinleştir', disable: 'Devre Dışı Bırak',
    ipWhitelist: 'IP İzin Listesi', ipSetDesc: 'Yalnızca izin listesindeki IP adresleri oturum açabilir', ipUnsetDesc: 'Yetkisiz erişim riskini azaltmak için yaygın giriş kaynaklarını kısıtlayın', set: 'Ayarla', configured: 'Yapılandırıldı', notConfigured: 'Yapılandırılmadı',
    twoFactor: 'İki Faktörlü Kimlik Doğrulama', twoFactorDesc: 'Hassas işlemler ve hesap kurtarma için ikincil bir doğrulama yöntemi bağlayın.', emailVerification: 'E-posta Doğrulaması', emailVerificationDesc: 'Giriş ve şifre kurtarma için kullanılabilir', activated: 'Etkin', notActivated: 'Etkin Değil', bind: 'Bağla', googleAuthenticator: 'Google Authenticator', googleDesc: 'Hesap güvenliğini artırmak için bir kimlik doğrulayıcı bağlayın', emailRequired: 'Devam etmeden önce bir e-posta adresini bağlayıp etkinleştirin.',
  },
  email: {
    unbound: 'Hesabınıza bağlı bir e-posta adresi bulunmuyor.', bound: 'Mevcut e-posta adresi:', newAddress: 'Yeni E-posta Adresi', invalid: 'Geçerli bir e-posta adresi girin',
    newPlaceholder: "Yeni bir e-posta adresi girin, örneğin: *****{'@'}gmail.com", code: 'Doğrulama Kodu', codePlaceholder: 'Doğrulama kodunu girin', codeAfterEmail: 'Doğrulama kodu istemek için bir e-posta adresi girin',
    changeTitle: 'E-posta Adresini Değiştir', save: 'Kaydet', bindSuccess: 'E-posta adresi başarıyla bağlandı', bindFailed: 'E-posta adresi bağlanamadı', changeSuccess: 'E-posta adresi başarıyla değiştirildi', changeFailed: 'E-posta adresi güncellenemedi',
    verifyTitle: 'E-posta Doğrulaması', verifyDescription: '{email} adresine 6 haneli bir doğrulama kodu gönderdik. Doğrulamayı tamamlamak için kodu aşağıya girin.', securityFooter: '{siteName} Güvenlik Doğrulaması · Hesabınızı Korur', securityTitle: 'Güvenlik Doğrulaması', submit: 'Gönder', googleClosed: 'Google Authenticator başarıyla devre dışı bırakıldı', googleCloseFailed: 'Google Authenticator devre dışı bırakılamadı',
  },
  password: {
    old: 'Mevcut Şifre', new: 'Yeni Şifre', confirm: 'Şifreyi Onayla', length: '6-32 karakterden oluşan bir şifre girin', oldPlaceholder: 'Mevcut şifrenizi girin', newPlaceholder: 'Yeni şifreyi girin', confirmPlaceholder: 'Yeni şifreyi yeniden girin', mismatch: 'Şifreler eşleşmiyor', title: 'Şifreyi Değiştir', submit: 'Gönder', success: 'Şifre başarıyla değiştirildi. Yeniden giriş yapın.', failed: 'Şifre değiştirilemedi',
  },
  ipWhitelist: { duplicate: 'Yinelenen kayıt bulundu: {ip}', title: 'IP İzin Listesini Düzenle', save: 'Kaydet', success: 'IP izin listesi başarıyla güncellendi', failed: 'IP izin listesi güncellenemedi' },
  google: {
    bind: 'Bağla', downloadStep: 'Authenticator’ı İndir', scanStep: 'QR Kodu Tara', verifyStep: 'Güvenlik Doğrulaması', downloadTip: 'Google Authenticator uygulamasını indirip yükleyin', android: 'Android Sürümü', ios: 'iOS Sürümü',
    scanDownload: 'Google Authenticator’ı indirmek için QR kodunu telefonunuzla tarayın', addAccount: 'Hesabı eklemek için aşağıdaki QR kodunu Google Authenticator ile tarayın veya gizli anahtarı manuel olarak girin.', rebindWarning: 'Google Authenticator’ı yeniden bağlarsanız önceki kimlik doğrulayıcı artık çalışmaz.',
    manualCode: 'QR kodunu tarayın veya bu kodu manuel olarak girin:', copy: 'Kopyala', enterCodeTip: 'Kurulumu tamamlamak için Google Authenticator tarafından oluşturulan 6 haneli kodu girin', codePlaceholder: '6 haneli Google Authenticator kodunu girin',
    keyCopied: 'Gizli anahtar panoya kopyalandı', invalidCode: '6 haneli doğrulama kodu girin', bindSuccess: 'Google Authenticator başarıyla bağlandı', title: 'Google Authenticator’ı Bağla',
  },
  loginRecords: {
    title: 'Giriş Cihazları', description: 'Şu anda oturum açık olan cihazları görüntüleyin ve giriş durumlarını yönetin.', unknownDevice: 'Bilinmeyen Cihaz', currentDevice: 'Mevcut Cihaz', currentLogin: 'Oturum Açık', currentSession: 'Mevcut Oturum', unknownBrowser: 'Bilinmeyen Tarayıcı', ipAddress: 'IP Adresi', loginTime: 'Giriş Zamanı', offline: 'Oturumu Kapat', empty: 'Oturum açık başka cihaz yok',
    loadFailed: 'Giriş cihazları yüklenemedi. Destek ekibiyle iletişime geçin.', confirmTitle: 'Bu cihazın oturumu kapatılsın mı?', confirmContent: 'Bu cihazın yeniden giriş yapması gerekir.', confirm: 'Onayla', cancel: 'İptal', submitting: 'Gönderiliyor', success: 'İşlem tamamlandı', offlineSuccess: 'Cihazın oturumu başarıyla kapatıldı', failed: 'İşlem başarısız oldu',
  },
}
