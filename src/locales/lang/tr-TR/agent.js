export default {
  title: 'Temsilci',
  apply: {
    eyebrow: 'Temsilci Ortaklıkları Açık · Ana İş Ortakları Aranıyor', title: 'Küresel Ödeme Hizmetlerine Erişin', titleAccent: 'Temsilci İşinizi Büyütün', description: 'Kendi platformunuzu kurmadan sanal kart hizmetlerini, küresel para transferini ve ödül yönetimini işinize entegre edin. Müşterilerinize kart açma, bakiye yükleme ve sınır ötesi transfer hizmetleri sunarak yeni iş fırsatları oluşturun.', contactToApply: 'Başvuru İçin Destek Ekibiyle İletişime Geçin', learnMore: 'Temsilci Avantajlarını İnceleyin', agentStatement: 'Temsilci Ekstresi', estimatedRewards: '{month} Ödülleri', rewardComposition: 'Kart Ödülü Dağılımı', automaticSummary: 'Otomatik Özet', settlementNotice: 'Ödüller aylık olarak hesaplanır ve ayrıntılar her zaman incelenebilir',
    highlights: {
      integration: { value: 'Uçtan Uca', label: 'Kart hizmetleri, transferler ve ödül yönetimi' },
      scenarios: { value: 'Çoklu Senaryo', label: 'Kart açma, bakiye yükleme ve transferler' },
      settlement: { value: 'Aylık Mutabakat', label: 'Ödül ayrıntılarını istediğiniz zaman inceleyin' },
    },
    services: {
      card: { title: 'Kart Hizmetleri', subtitle: 'Sanal Kart İşletme Altyapısı', description: 'Tek bir kart hizmetleri platformu üzerinden kart açma, bakiye yükleme, kart yönetimi ve ödeme senaryolarını destekleyin.', tags: { opening: 'Sanal Kart Açma', recharge: 'Bakiye Yükleme Yönetimi', scenarios: 'Ödeme Senaryoları' } },
      remittance: { title: 'Küresel Para Transferi', subtitle: 'Sınır Ötesi Fon Hizmetleri', description: 'Sınır ötesi ticari ödemeleri, müşteri para transferlerini ve çeşitli çok para birimli mutabakat senaryolarını destekleyin.', tags: { transfer: 'Sınır Ötesi Transferler', currency: 'Çok Para Birimli Hizmetler', tracking: 'Transfer Takibi' } },
    },
    features: {
      noDevelopment: { title: 'Şirket İçi Geliştirme Gerektirmez', description: 'Kendi platformunuzu kurmadan sanal kart hizmetlerini kullanmaya başlayın' }, brand: { title: 'Bağımsız Marka Operasyonları', description: 'Kendi markanız ve kullanıcı sisteminiz için beyaz etiket ve özel alan adı desteğinden yararlanın' }, rewards: { title: 'Sürekli Ödül Fırsatları', description: 'Bakiye yükleme, kart açma, işlemler ve sınır ötesi hizmetlerden ödül elde edin' }, global: { title: 'Küresel Pazar Fırsatları', description: 'Sınır ötesi ödeme ve çok para birimli hizmetlerle uluslararası pazarlara açılın' }, pricing: { title: 'Esnek Fiyatlandırma', description: 'İş modelinize uygun ücret ve fiyatlandırma stratejileri uygulayın' }, support: { title: 'Yönetilen Müşteri Desteği', description: 'Destek ekibi talepler, sorunların çözümü ve temel inceleme süreçlerinde yardımcı olur' },
    },
  },
  rewards: {
    statsTitle: 'Ödül İstatistikleri',
    settlementTip: 'Ödül tutarları sunucu tarafındaki mutabakat sonucuna göre belirlenir. Bekleyen ödüller onaylanmadan önce ayrıntılar sayfasından incelenmelidir.',
    estimatedThisMonth: 'Bu Ay Tahmini Ödül', pendingLastMonth: 'Geçen Ay Bekleyen Ödül', totalHistorical: 'Toplam Geçmiş Ödül',
    month: 'Ödül Ayı', status: 'Durum', total: 'Toplam Ödül', accountRechargeFee: 'Hesap Yükleme Ücreti', cardActivationFee: 'Kart Etkinleştirme Ücreti',
    cardTransferInFee: 'Karta Aktarım Ücreti', transactionFee: 'İşlem Ücreti', crossBorderFee: 'Sınır Ötesi İşlem Ücreti', membershipFee: 'Üyelik Ücreti', remark: 'Açıklama', detail: 'Ayrıntılar',
    pendingConfirmation: 'Onay Bekliyor', confirmed: 'Onaylandı',
    detailPage: {
      confirmedAmount: 'Onaylanan Tutar', confirmedAmountTip: 'Temsilciye mutabakat sonucu ödenecek nihai tutar', pendingCredit: 'Onay Bekleyen Tutar', confirmedCredit: 'Bu Ay Onaylanan Tutar',
      totalReward: 'Toplam Ödül Tutarı', monthlySummary: 'Bu ayki tüm ödüllerin özeti', creditedAmount: 'Hesaba Geçen Tutar', creditedSiteReward: 'Hesaba geçmiş temsilci sitesi ödülleri', siteCount: 'Site Sayısı', siteUnit: 'site', expandHint: 'Günlük dağılımı görmek için siteyi genişletin',
      composition: 'Ödül Dağılımı', compositionHint: 'Bu ayın temsilci ödülleri aşağıdaki ücret kategorilerine göre özetlenmiştir.', primarySource: 'Ana Kaynak', compositionPercent: 'Toplam ödüllerin %{percent} kadarı',
      siteDetails: 'Site Ödül Ayrıntıları', siteDetailsHint: 'Günlük dağılımı görmek için siteyi genişletin. Dışa aktarmadan önce siteleri seçin.', selectedSites: '{count} site seçildi', noSiteSelected: 'Site seçilmedi', exportData: 'Verileri Dışa Aktar', dailySummary: 'Günlük Özet', monthlyExport: 'Aylık Özet', dataDetails: 'Ayrıntılı Veriler',
      waitingConfirmation: 'Onay Bekliyor', confirmationComplete: 'Onay Tamamlandı', verifyBeforeConfirm: 'Onaylamadan önce her sitenin ödül dağılımını inceleyin.', recordConfirmed: 'Bu ödül kaydı onaylandı.', close: 'Kapat', confirmReward: 'Ödülü Onayla',
      siteName: 'Site Adı', totalRewardUsd: 'Toplam Ödül $', creditedUsd: 'Hesaba Geçen Tutar $', pendingUsd: 'Bekleyen Tutar $', date: 'Tarih', invitationCommission: 'Davet Komisyonu $', monthTotal: 'Aylık Toplam',
      generatingFile: 'Dosya oluşturuluyor. Kısa süre sonra mesajlarınızı kontrol edin.', operationFailed: 'İşlem başarısız oldu', confirmTitle: 'Ödülü Onayla', confirmContent: 'Bu aya ait temsilci ödül verilerinin doğru olduğunu onaylayın. Onaylandıktan sonra sonraki işlem sürecine geçer ve geri alınamaz.', confirmSuccess: 'Ödül onaylandı', missingRecord: 'Ödül kaydı verileri eksik',
    },
  },
  setting: { title: 'Site ayarları' },
  invite: { copy: 'Kopyala', empty: 'Kullanılabilir davet bağlantısı yok' },
  admin: {
    warning: 'Yönetici izinleri temsilci sitesi yönetimini etkiler. Yalnızca kimliği doğrulanmış hesapları ekleyin. Site kullanılabilirliği, sunucu tarafındaki izinlere ve risk kontrolü sonuçlarına bağlıdır.',
    searchPlaceholder: 'Site adı / Yönetici / Alan adı', clear: 'Temizle', add: 'Yönetici Ekle', siteCount: '{count} temsilci sitesi',
    domain: 'Alan adı', createdAt: 'Oluşturulma Zamanı', remove: 'Kaldır', noMatch: 'Eşleşen yönetici bulunamadı', empty: 'Yönetici verisi yok',
    noMatchHint: 'Site adı, yönetici adı veya alan adı anahtar kelimesini değiştirip yeniden deneyin.', emptyHint: 'Temsilci sitesi izinlerini yönetmek için bir yönetici ekleyin.', clearFilter: 'Filtreleri Temizle',
    promptTitle: 'Onay', removeConfirm: '<span class="ui-text-primary">{name}</span> adlı yönetici kaldırılsın mı?', removeSuccess: 'Yönetici kaldırıldı', operationSuccess: 'İşlem başarılı', operationFailed: 'İşlem başarısız oldu',
    modal: {
      title: 'Yönetici Ekle', confirmUser: 'Kullanıcıyı Onayla', confirmUserHint: 'Hesabı bulun ve doğrulayın', authorizeSites: 'Siteleri Yetkilendir', authorizeSitesHint: 'Yönetim kapsamını seçin',
      searchTitle: 'Yönetici Hesabını Bul', searchDescription: 'Kullanıcının e-posta adresini veya adını girin, hesabı doğrulayın ve ardından temsilci sitelerini yetkilendirin.', userName: 'Kullanıcı Adı',
      userPlaceholder: 'Kullanıcı e-posta adresini veya adını girip Enter tuşuna basın', searchHint: 'Benzer adlara sahip kullanıcıları ayırt etmek için mümkünse tam e-posta adresini kullanın.', confirmedAccount: 'Onaylanan Yönetici Hesabı', searchAgain: 'Yeniden Ara',
      selectSites: 'Temsilci Sitelerini Seç', selectSitesDescription: 'Onaylanan kullanıcının yönetebileceği bir veya daha fazla temsilci sitesi seçin.', authorizeTo: 'Yetkilendirilecek Kullanıcı', agentSites: 'Temsilci Siteleri',
      availableSites: '{count} kullanılabilir', selectedSites: ', {count} seçildi', sitePlaceholder: 'Yetkilendirilecek temsilci sitelerini seçin', authorizationHint: 'Gönderimden sonra bu kullanıcı, seçilen temsilci siteleri için yönetim izni alır.', noSites: 'Yetkilendirilebilecek site yok. Önce temsilci sitesi yapılandırmasını kontrol edin.',
      cancel: 'İptal', previous: 'Önceki', searchContinue: 'Ara ve Devam Et', confirmAdd: 'Onayla ve Ekle', enterUser: 'Kullanıcı e-posta adresini veya adını girin', userNotFound: 'Eşleşen kullanıcı bulunamadı. Girdiğiniz bilgileri kontrol edip yeniden deneyin.', userMatched: 'Kullanıcı başarıyla eşleştirildi', confirmAccountFirst: 'Önce yönetici hesabını onaylayın', selectSiteFirst: 'En az bir temsilci sitesi seçin', addSuccess: 'Yönetici eklendi',
    },
  },
}
