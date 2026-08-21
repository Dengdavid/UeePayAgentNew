import legal from './agreement.js'

export default {
  legal,
  title: 'Daftarkan akun',
  placeholder: {
    account: 'Silakan masukkan 6-20 digit nomor rekening',
    email: 'Surat',
    verificationCode: 'Kode Verifikasi',
    password: 'Buat sandi karakter 6- 30',
    confirmPassword: 'Konfirmasi kata sandi Anda',
    invitationCode: 'Kode undangan (opsional)',
  },
  agreement: {
    agreePrefix: 'Saya telah membaca dan setuju',
    userAgreement: '"Perjanjian Pengguna"',
    conjunction: 'Dan',
    privacyPolicy: '"Perjanjian Privasi"',
    userAgreementTitle: 'Perjanjian Pengguna',
    privacyPolicyTitle: 'perjanjian privasi',
    read: 'saya telah membaca',
    readAll: 'Silakan baca seluruh perjanjian',
    required: 'Harap membaca dan menyetujui Perjanjian Pengguna dan Perjanjian Privasi terlebih dahulu',
  },
  action: {
    registerNow: 'Daftar sekarang',
    loginNow: 'Masuk sekarang',
    forgotPassword: 'lupa kata sandinya?',
  },
  prompt: {
    hasAccount: 'Sudah punya akun?',
  },
  validation: {
    accountRequired: 'Silakan masukkan akun login Anda',
    accountLength: 'Silakan masukkan 6-20 digit nomor rekening',
    accountTrim: 'Nomor rekening tidak boleh berisi spasi di awal atau di akhir.',
    accountSpaces: 'Akun tidak boleh berisi spasi',
    accountFormat: 'Nomor rekening hanya boleh berisi huruf dan angka China, Inggris atau menggunakan format email',
    emailRequired: 'Silakan masukkan alamat email Anda',
    emailFormat: 'Silakan masukkan format email yang benar',
    verificationCodeRequired: 'Masukkan kode verifikasi',
    passwordRequired: 'Silakan masukkan kata sandi masuk Anda',
    passwordLength: 'Silakan masukkan kata sandi 6-30 digit',
    confirmPasswordRequired: 'Silakan masukkan kata sandi konfirmasi',
    passwordMismatch: 'Kedua kata sandi tersebut tidak sama',
  },
  message: {
    success: 'Pendaftaran berhasil',
    failed: 'Pendaftaran gagal',
  },
}
