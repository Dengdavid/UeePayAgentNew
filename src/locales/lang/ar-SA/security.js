export default {
  verificationRequired: 'اربط بريدك الإلكتروني أو Google Authenticator وفعّله قبل المتابعة.',
  singleLoginEnabled: 'تم تفعيل وضع تسجيل الدخول من جهاز واحد',
  singleLoginDisabled: 'تم تعطيل وضع تسجيل الدخول من جهاز واحد',
  singleLoginFailed: 'تعذر تحديث إعداد تسجيل الدخول من جهاز واحد. يُرجى المحاولة مرة أخرى لاحقًا.',
  centerTitle: 'مركز الأمان',
  overview: {
    description: 'إدارة التحقق من تسجيل الدخول وقيود الأجهزة ووسائل المصادقة الثنائية.', currentLevel: 'مستوى الأمان الحالي', progress: 'تقدم إعدادات الأمان', itemCount: '{count} عناصر', levelHigh: 'مرتفع', levelMedium: 'متوسط', levelLow: 'منخفض',
    loginConfig: 'إعدادات تسجيل الدخول', loginConfigDesc: 'إدارة كلمة مرور تسجيل الدخول وسياسة الأجهزة والقيود على مصادر تسجيل الدخول.', viewDevices: 'عرض أجهزة تسجيل الدخول', loginPassword: 'كلمة مرور تسجيل الدخول', loginPasswordDesc: 'تُستخدم للتحقق من هويتك عند تسجيل الدخول',
    change: 'تغيير', singleLogin: 'تسجيل الدخول من جهاز واحد', singleLoginOnDesc: 'لا يمكن تسجيل الدخول إلى هذا الحساب إلا من جهاز واحد في الوقت نفسه', singleLoginOffDesc: 'يمكن تسجيل الدخول إلى هذا الحساب من عدة أجهزة في الوقت نفسه', enabled: 'مفعّل', disabled: 'معطّل', enable: 'تفعيل', disable: 'تعطيل',
    ipWhitelist: 'قائمة عناوين IP المسموح بها', ipSetDesc: 'لا يمكن تسجيل الدخول إلا من عناوين IP المدرجة في قائمة السماح', ipUnsetDesc: 'قيّد مصادر تسجيل الدخول المعتادة للحد من مخاطر الوصول غير المصرح به', set: 'إعداد', configured: 'تم الإعداد', notConfigured: 'لم يتم الإعداد',
    twoFactor: 'المصادقة الثنائية', twoFactorDesc: 'اربط وسيلة تحقق إضافية للعمليات الحساسة واسترداد الحساب.', emailVerification: 'التحقق عبر البريد الإلكتروني', emailVerificationDesc: 'يمكن استخدامه لتسجيل الدخول واسترداد كلمة المرور', activated: 'مفعّل', notActivated: 'غير مفعّل', bind: 'ربط', googleAuthenticator: 'Google Authenticator', googleDesc: 'اربط تطبيق المصادقة لتعزيز أمان الحساب', emailRequired: 'اربط عنوان بريد إلكتروني وفعّله قبل المتابعة.',
  },
  email: {
    unbound: 'لا يوجد حاليًا عنوان بريد إلكتروني مرتبط بحسابك.', bound: 'عنوان البريد الإلكتروني الحالي:', newAddress: 'عنوان البريد الإلكتروني الجديد', invalid: 'أدخل عنوان بريد إلكتروني صالحًا',
    newPlaceholder: "أدخل عنوان بريد إلكتروني جديدًا، مثل: *****{'@'}gmail.com", code: 'رمز التحقق', codePlaceholder: 'أدخل رمز التحقق', codeAfterEmail: 'أدخل عنوان البريد الإلكتروني لطلب رمز تحقق',
    changeTitle: 'تغيير عنوان البريد الإلكتروني', save: 'حفظ', bindSuccess: 'تم ربط عنوان البريد الإلكتروني بنجاح', bindFailed: 'تعذر ربط عنوان البريد الإلكتروني', changeSuccess: 'تم تغيير عنوان البريد الإلكتروني بنجاح', changeFailed: 'تعذر تغيير عنوان البريد الإلكتروني',
    verifyTitle: 'التحقق عبر البريد الإلكتروني', verifyDescription: 'أرسلنا رمز تحقق مكوّنًا من 6 أرقام إلى {email}. أدخله أدناه لإكمال التحقق.', securityFooter: 'التحقق الأمني من {siteName} · حماية حسابك', securityTitle: 'التحقق الأمني', submit: 'إرسال', googleClosed: 'تم تعطيل Google Authenticator بنجاح', googleCloseFailed: 'تعذر تعطيل Google Authenticator',
  },
  password: {
    old: 'كلمة المرور الحالية', new: 'كلمة المرور الجديدة', confirm: 'تأكيد كلمة المرور', length: 'أدخل كلمة مرور تتكون من 6 إلى 32 حرفًا', oldPlaceholder: 'أدخل كلمة المرور الحالية', newPlaceholder: 'أدخل كلمة المرور الجديدة', confirmPlaceholder: 'أدخل كلمة المرور الجديدة مرة أخرى', mismatch: 'كلمتا المرور غير متطابقتين', title: 'تغيير كلمة المرور', submit: 'إرسال', success: 'تم تغيير كلمة المرور بنجاح. يُرجى تسجيل الدخول مرة أخرى.', failed: 'تعذر تغيير كلمة المرور',
  },
  ipWhitelist: { duplicate: 'تم العثور على إدخال مكرر: {ip}', title: 'تعديل قائمة عناوين IP المسموح بها', save: 'حفظ', success: 'تم تحديث قائمة عناوين IP المسموح بها بنجاح', failed: 'تعذر تحديث قائمة عناوين IP المسموح بها' },
  google: {
    bind: 'ربط', downloadStep: 'تنزيل تطبيق المصادقة', scanStep: 'مسح رمز QR', verifyStep: 'التحقق الأمني', downloadTip: 'نزّل تطبيق Google Authenticator وثبّته', android: 'إصدار Android', ios: 'إصدار iOS',
    scanDownload: 'امسح رمز QR بهاتفك لتنزيل Google Authenticator', addAccount: 'امسح رمز QR أدناه باستخدام Google Authenticator، أو أدخل المفتاح السري يدويًا لإضافة الحساب.', rebindWarning: 'إذا أعدت ربط Google Authenticator، فلن يعود تطبيق المصادقة السابق صالحًا للاستخدام.',
    manualCode: 'امسح رمز QR أو أدخل الرمز التالي يدويًا:', copy: 'نسخ', enterCodeTip: 'أدخل الرمز المكوّن من 6 أرقام الذي ينشئه Google Authenticator لإكمال الإعداد', codePlaceholder: 'أدخل رمز Google Authenticator المكوّن من 6 أرقام',
    keyCopied: 'تم نسخ المفتاح السري إلى الحافظة', invalidCode: 'أدخل رمز تحقق مكوّنًا من 6 أرقام', bindSuccess: 'تم ربط Google Authenticator بنجاح', title: 'ربط Google Authenticator',
  },
  loginRecords: {
    title: 'أجهزة تسجيل الدخول', description: 'اعرض الأجهزة المسجّل دخولها حاليًا وأدِر حالة تسجيل الدخول الخاصة بها.', unknownDevice: 'جهاز غير معروف', currentDevice: 'الجهاز الحالي', currentLogin: 'مسجّل الدخول حاليًا', currentSession: 'الجلسة الحالية', unknownBrowser: 'متصفح غير معروف', ipAddress: 'عنوان IP', loginTime: 'وقت تسجيل الدخول', offline: 'تسجيل الخروج', empty: 'لا توجد أجهزة أخرى مسجّل دخولها',
    loadFailed: 'تعذر تحميل أجهزة تسجيل الدخول. يُرجى التواصل مع الدعم.', confirmTitle: 'هل تريد تسجيل الخروج من هذا الجهاز؟', confirmContent: 'سيحتاج هذا الجهاز إلى تسجيل الدخول مرة أخرى.', confirm: 'تأكيد', cancel: 'إلغاء', submitting: 'جارٍ الإرسال', success: 'اكتملت العملية', offlineSuccess: 'تم تسجيل خروج الجهاز بنجاح', failed: 'فشلت العملية',
  },
}
