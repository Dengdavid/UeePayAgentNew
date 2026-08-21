import legal from './agreement.js'

export default {
  legal,
  title: 'تسجيل حساب',
  placeholder: {
    account: 'أدخل اسم حساب يتكون من 6 إلى 20 حرفًا',
    email: 'بريد',
    verificationCode: 'مدونة التحقق',
    password: 'أنشئ كلمة مرور من 6 إلى 30 حرفًا',
    confirmPassword: 'تأكد من كلمة المرور',
    invitationCode: 'رمز الدعوة (اختياري)',
  },
  agreement: {
    agreePrefix: 'لقد قرأت ووافقت',
    userAgreement: '"اتفاقية المستخدم"',
    conjunction: 'و',
    privacyPolicy: '"اتفاقية الخصوصية"',
    userAgreementTitle: 'اتفاقية المستخدم',
    privacyPolicyTitle: 'اتفاقية الخصوصية',
    read: 'لقد قرأت',
    readAll: 'يرجى قراءة الاتفاق بأكمله',
    required: 'يرجى قراءة اتفاقية المستخدم واتفاقية الخصوصية والموافقة عليها أولاً',
  },
  action: {
    registerNow: 'سجل الآن',
    loginNow: 'قم بتسجيل الدخول الآن',
    forgotPassword: 'نسيت كلمة المرور؟',
  },
  prompt: {
    hasAccount: 'هل لديك حساب بالفعل؟',
  },
  validation: {
    accountRequired: 'الرجاء إدخال حساب تسجيل الدخول الخاص بك',
    accountLength: 'يجب أن يتكون اسم الحساب من 6 إلى 20 حرفًا',
    accountTrim: 'لا يمكن أن يحتوي رقم الحساب على مسافات بادئة أو زائدة.',
    accountSpaces: 'لا يمكن أن يحتوي الحساب على مسافات',
    accountFormat: 'يمكن أن يحتوي رقم الحساب فقط على أحرف وأرقام صينية وإنجليزية أو يستخدم تنسيق البريد الإلكتروني',
    emailRequired: 'الرجاء إدخال عنوان البريد الإلكتروني الخاص بك',
    emailFormat: 'الرجاء إدخال تنسيق البريد الإلكتروني الصحيح',
    verificationCodeRequired: 'إدخال رمز التحقق',
    passwordRequired: 'الرجاء إدخال كلمة مرور تسجيل الدخول الخاصة بك',
    passwordLength: 'يجب أن تتكون كلمة المرور من 6 إلى 30 حرفًا',
    confirmPasswordRequired: 'الرجاء إدخال كلمة المرور التأكيدية',
    passwordMismatch: 'كلمتا المرور ليستا متماثلتين',
  },
  message: {
    success: 'تم التسجيل بنجاح',
    failed: 'فشل التسجيل',
  },
}
