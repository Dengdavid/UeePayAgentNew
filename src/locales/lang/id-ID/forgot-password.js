export default {
  title: 'Ambil kata sandi',
  placeholder: {
    email: 'Surat',
    verificationCode: 'Kode Verifikasi',
    password: 'Buat sandi karakter 6- 32',
    confirmPassword: 'Konfirmasi kata sandi Anda',
  },
  action: {
    resetPassword: 'mengatur ulang kata sandi',
    loginNow: 'Masuk sekarang',
    registerNow: 'Daftar sekarang',
  },
  prompt: {
    hasAccount: 'Sudah punya akun?',
    noAccount: 'Tidak ada akun?',
  },
  validation: {
    emailRequired: 'Silakan masukkan email Anda',
    emailFormat: 'Silakan masukkan format email yang benar',
    verificationCodeRequired: 'Masukkan kode verifikasi',
    verificationCodeLength: 'Masukkan kode verifikasi 6 digit',
    passwordRequired: 'Silakan masukkan kata sandi baru',
    passwordLength: 'Panjang kata sandi tidak boleh kurang dari 6 karakter',
    confirmPasswordRequired: 'Harap konfirmasi kata sandi baru',
    passwordMismatch: 'Kata sandi yang dimasukkan dua kali tidak konsisten',
  },
  message: {
    success: 'Reset sandi berhasil',
    failed: 'Reset sandi gagal',
  },
}
