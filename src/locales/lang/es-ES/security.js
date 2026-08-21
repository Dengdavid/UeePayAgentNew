export default {
  verificationRequired: 'Vincule y active su correo electrónico o Google Authenticator antes de continuar.',
  singleLoginEnabled: 'Modo de inicio único habilitado con éxito',
  singleLoginDisabled: 'Modo de inicio de sesión único desactivado correctamente',
  singleLoginFailed: 'No se pudo actualizar el modo de inicio de sesión único. Inténtelo de nuevo más tarde.',
  centerTitle: 'Centro de seguridad',
  overview: {
    description: 'Gestione la verificación de inicio de sesión, las restricciones de dispositivos y los métodos de autenticación de dos factores.', currentLevel: 'Nivel de seguridad actual', progress: 'Progreso de seguridad', itemCount: '{count} elementos', levelHigh: 'Alto', levelMedium: 'Medio', levelLow: 'Bajo',
    loginConfig: 'Configuración de inicio de sesión', loginConfigDesc: 'Gestione su contraseña, la política de dispositivos y las restricciones de origen del inicio de sesión.', viewDevices: 'Ver dispositivos conectados', loginPassword: 'Contraseña de inicio de sesión', loginPasswordDesc: 'Se utiliza para verificar su identidad al iniciar sesión',
    change: 'Cambiar', singleLogin: 'Inicio de sesión único', singleLoginOnDesc: 'Solo se puede iniciar sesión en esta cuenta desde un dispositivo a la vez', singleLoginOffDesc: 'Se puede iniciar sesión en esta cuenta desde varios dispositivos al mismo tiempo', enabled: 'Activado', disabled: 'Desactivado', enable: 'Activar', disable: 'Desactivar',
    ipWhitelist: 'Lista de IP permitidas', ipSetDesc: 'Solo se puede iniciar sesión desde las direcciones IP incluidas en la lista', ipUnsetDesc: 'Restrinja los orígenes de inicio de sesión habituales para reducir el riesgo de acceso no autorizado', set: 'Configurar', configured: 'Configurada', notConfigured: 'Sin configurar',
    twoFactor: 'Autenticación de dos factores', twoFactorDesc: 'Vincule un método de verificación adicional para operaciones sensibles y recuperación de la cuenta.', emailVerification: 'Verificación por correo electrónico', emailVerificationDesc: 'Puede utilizarse para iniciar sesión y recuperar la contraseña', activated: 'Activada', notActivated: 'No activada', bind: 'Vincular', googleAuthenticator: 'Google Authenticator', googleDesc: 'Vincule una aplicación de autenticación para mejorar la seguridad de la cuenta', emailRequired: 'Vincule y active una dirección de correo electrónico antes de continuar.',
  },
  email: {
    unbound: 'Ninguna dirección de correo electrónico está actualmente vinculada a su cuenta.', bound: 'Dirección de correo electrónico actual:', newAddress: 'Nueva dirección de correo electrónico', invalid: 'Por favor, introduce una dirección de correo electrónico válida',
    newPlaceholder: "Introduzca una nueva dirección de correo electrónico, por ejemplo: *****{'@'}gmail.com", code: 'Código de verificación', codePlaceholder: 'Introduzca el código de verificación', codeAfterEmail: 'Introduzca una dirección de correo electrónico para solicitar un código de verificación',
    changeTitle: 'Cambiar dirección de correo electrónico', save: 'Guardar', bindSuccess: 'Dirección de correo electrónico conectada con éxito', bindFailed: 'Incapaz de vincular la dirección de correo electrónico', changeSuccess: 'Correo electrónico cambió con éxito', changeFailed: 'La modificación falló',
    verifyTitle: 'Verificación de correo electrónico', verifyDescription: 'Hemos enviado un código de verificación de 6 dígitos a {email}. Introdúzcalo a continuación para completar la verificación.', securityFooter: 'Verificación de seguridad de {siteName} · Protegemos su cuenta', securityTitle: 'Verificación de seguridad', submit: 'Enviar', googleClosed: 'Google Authenticator se ha desactivado', googleCloseFailed: 'No se ha podido desactivar Google Authenticator',
  },
  password: {
    old: 'Contraseña actual', new: 'Nueva contraseña', confirm: 'Confirmar contraseña', length: 'Introduzca una contraseña de entre 6 y 32 caracteres', oldPlaceholder: 'Introduzca su contraseña actual', newPlaceholder: 'Introduzca una contraseña nueva', confirmPlaceholder: 'Vuelva a introducir la contraseña nueva', mismatch: 'Las contraseñas no coinciden', title: 'Cambiar contraseña', submit: 'Enviar', success: 'La contraseña se ha cambiado correctamente. Vuelva a iniciar sesión.', failed: 'No se pudo cambiar la contraseña',
  },
  ipWhitelist: { duplicate: 'Se encontró una entrada duplicada: {ip}', title: 'Editar lista de IP permitidas', save: 'Guardar', success: 'La lista de IP permitidas se actualizó correctamente', failed: 'No se pudo actualizar la lista de IP permitidas' },
  google: {
    bind: 'Vincular', downloadStep: 'Descargar autenticador', scanStep: 'Escanear código QR', verifyStep: 'Verificación de seguridad', downloadTip: 'Descargue e instale la aplicación Google Authenticator', android: 'Versión para Android', ios: 'Versión para iOS',
    scanDownload: 'Escanee el código QR con su teléfono para descargar Google Authenticator', addAccount: 'Escanee el código QR siguiente con Google Authenticator o introduzca manualmente la clave secreta para añadir la cuenta.', rebindWarning: 'Si vuelve a vincular Google Authenticator, el autenticador anterior dejará de funcionar.',
    manualCode: 'Escanee el código QR o introduzca manualmente el siguiente código:', copy: 'Copiar', enterCodeTip: 'Introduzca el código de 6 dígitos generado por Google Authenticator para completar la configuración', codePlaceholder: 'Introduzca el código de 6 dígitos de Google Authenticator',
    keyCopied: 'Clave secreta copiada al portapapeles', invalidCode: 'Introduzca un código de verificación de 6 dígitos', bindSuccess: 'Google Authenticator se ha vinculado correctamente', title: 'Vincular Google Authenticator',
  },
  loginRecords: {
    title: 'Dispositivos conectados', description: 'Consulte los dispositivos con una sesión iniciada y gestione su estado.', unknownDevice: 'Dispositivo desconocido', currentDevice: 'Dispositivo actual', currentLogin: 'Sesión iniciada', currentSession: 'Sesión actual', unknownBrowser: 'Navegador desconocido', ipAddress: 'Dirección IP', loginTime: 'Hora de inicio de sesión', offline: 'Cerrar sesión', empty: 'No hay otros dispositivos con una sesión iniciada',
    loadFailed: 'No se pudieron cargar los dispositivos conectados. Póngase en contacto con el servicio de asistencia.', confirmTitle: '¿Cerrar la sesión de este dispositivo?', confirmContent: 'Será necesario volver a iniciar sesión en este dispositivo.', confirm: 'Confirmar', cancel: 'Cancelar', submitting: 'Enviando', success: 'Operación completada', offlineSuccess: 'Se cerró la sesión del dispositivo', failed: 'La operación no se pudo completar',
  },
}
