export default {
  verificationRequired: 'Hubungkan dan aktifkan email atau Google Authenticator sebelum melanjutkan.',
  singleLoginEnabled: 'Mode login tunggal berhasil diaktifkan',
  singleLoginDisabled: 'Mode login tunggal berhasil dinonaktifkan',
  singleLoginFailed: 'Pengaturan login tunggal tidak dapat diperbarui. Silakan coba lagi nanti.',
  centerTitle: 'Pusat Keamanan',
  overview: {
    description: 'Kelola verifikasi login, pembatasan perangkat, dan metode autentikasi dua faktor.', currentLevel: 'Tingkat Keamanan Saat Ini', progress: 'Progres Keamanan', itemCount: '{count} item', levelHigh: 'Tinggi', levelMedium: 'Sedang', levelLow: 'Rendah',
    loginConfig: 'Pengaturan Login', loginConfigDesc: 'Kelola kata sandi login, kebijakan perangkat, dan pembatasan sumber login.', viewDevices: 'Lihat Perangkat yang Login', loginPassword: 'Kata Sandi Login', loginPasswordDesc: 'Digunakan untuk memverifikasi akses saat login',
    change: 'Ubah', singleLogin: 'Login Tunggal', singleLoginOnDesc: 'Akun ini hanya dapat login di satu perangkat pada satu waktu', singleLoginOffDesc: 'Akun ini dapat login di beberapa perangkat secara bersamaan', enabled: 'Aktif', disabled: 'Nonaktif', enable: 'Aktifkan', disable: 'Nonaktifkan',
    ipWhitelist: 'Daftar IP yang Diizinkan', ipSetDesc: 'Hanya alamat IP dalam daftar yang diizinkan yang dapat login', ipUnsetDesc: 'Batasi sumber login yang biasa digunakan untuk mengurangi risiko akses tanpa izin', set: 'Atur', configured: 'Sudah Diatur', notConfigured: 'Belum Diatur',
    twoFactor: 'Autentikasi Dua Faktor', twoFactorDesc: 'Hubungkan metode verifikasi tambahan untuk tindakan sensitif dan pemulihan akun.', emailVerification: 'Verifikasi Email', emailVerificationDesc: 'Dapat digunakan untuk login dan pemulihan kata sandi', activated: 'Aktif', notActivated: 'Nonaktif', bind: 'Hubungkan', googleAuthenticator: 'Google Authenticator', googleDesc: 'Hubungkan aplikasi autentikator untuk meningkatkan keamanan akun', emailRequired: 'Hubungkan dan aktifkan alamat email sebelum melanjutkan.',
  },
  email: {
    unbound: 'Belum ada alamat email yang terhubung ke akun Anda.', bound: 'Alamat email saat ini:', newAddress: 'Alamat Email Baru', invalid: 'Masukkan alamat email yang valid',
    newPlaceholder: "Masukkan alamat email baru, misalnya: *****{'@'}gmail.com", code: 'Kode Verifikasi', codePlaceholder: 'Masukkan kode verifikasi', codeAfterEmail: 'Masukkan alamat email untuk meminta kode verifikasi',
    changeTitle: 'Ubah Alamat Email', save: 'Simpan', bindSuccess: 'Alamat email berhasil dihubungkan', bindFailed: 'Alamat email tidak dapat dihubungkan', changeSuccess: 'Alamat email berhasil diubah', changeFailed: 'Alamat email tidak dapat diubah',
    verifyTitle: 'Verifikasi Email', verifyDescription: 'Kami telah mengirim kode verifikasi 6 digit ke {email}. Masukkan kode tersebut di bawah untuk menyelesaikan verifikasi.', securityFooter: 'Verifikasi Keamanan {siteName} · Melindungi Akun Anda', securityTitle: 'Verifikasi Keamanan', submit: 'Kirim', googleClosed: 'Google Authenticator berhasil dinonaktifkan', googleCloseFailed: 'Google Authenticator tidak dapat dinonaktifkan',
  },
  password: {
    old: 'Kata Sandi Saat Ini', new: 'Kata Sandi Baru', confirm: 'Konfirmasi Kata Sandi', length: 'Masukkan kata sandi sepanjang 6–32 karakter', oldPlaceholder: 'Masukkan kata sandi saat ini', newPlaceholder: 'Masukkan kata sandi baru', confirmPlaceholder: 'Masukkan kembali kata sandi baru', mismatch: 'Kata sandi tidak cocok', title: 'Ubah Kata Sandi', submit: 'Kirim', success: 'Kata sandi berhasil diubah. Silakan login kembali.', failed: 'Kata sandi tidak dapat diubah',
  },
  ipWhitelist: { duplicate: 'Ditemukan entri duplikat: {ip}', title: 'Edit Daftar IP yang Diizinkan', save: 'Simpan', success: 'Daftar IP yang diizinkan berhasil diperbarui', failed: 'Daftar IP yang diizinkan tidak dapat diperbarui' },
  google: {
    bind: 'Hubungkan', downloadStep: 'Unduh Aplikasi Autentikator', scanStep: 'Pindai Kode QR', verifyStep: 'Verifikasi Keamanan', downloadTip: 'Unduh dan instal aplikasi Google Authenticator', android: 'Versi Android', ios: 'Versi iOS',
    scanDownload: 'Pindai kode QR dengan ponsel Anda untuk mengunduh Google Authenticator', addAccount: 'Pindai kode QR di bawah dengan Google Authenticator, atau masukkan kunci rahasia secara manual untuk menambahkan akun.', rebindWarning: 'Jika Anda menghubungkan ulang Google Authenticator, autentikator sebelumnya tidak dapat digunakan lagi.',
    manualCode: 'Pindai kode QR atau masukkan kode berikut secara manual:', copy: 'Salin', enterCodeTip: 'Masukkan kode 6 digit yang dibuat Google Authenticator untuk menyelesaikan pengaturan', codePlaceholder: 'Masukkan kode 6 digit dari Google Authenticator',
    keyCopied: 'Kunci rahasia disalin ke papan klip', invalidCode: 'Masukkan kode verifikasi 6 digit', bindSuccess: 'Google Authenticator berhasil dihubungkan', title: 'Hubungkan Google Authenticator',
  },
  loginRecords: {
    title: 'Perangkat yang Login', description: 'Lihat perangkat yang sedang login dan kelola status loginnya.', unknownDevice: 'Perangkat Tidak Dikenal', currentDevice: 'Perangkat Saat Ini', currentLogin: 'Sedang Login', currentSession: 'Sesi Saat Ini', unknownBrowser: 'Browser Tidak Dikenal', ipAddress: 'Alamat IP', loginTime: 'Waktu Login', offline: 'Logout', empty: 'Tidak ada perangkat lain yang sedang login',
    loadFailed: 'Perangkat yang login tidak dapat dimuat. Silakan hubungi dukungan.', confirmTitle: 'Logout dari perangkat ini?', confirmContent: 'Perangkat ini harus login kembali.', confirm: 'Konfirmasi', cancel: 'Batal', submitting: 'Mengirim', success: 'Operasi selesai', offlineSuccess: 'Perangkat berhasil logout', failed: 'Operasi gagal',
  },
}
