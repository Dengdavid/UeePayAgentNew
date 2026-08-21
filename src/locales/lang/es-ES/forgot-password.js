export default {
  title: 'recuperar contraseña',
  placeholder: {
    email: 'Correo',
    verificationCode: 'Código de verificación',
    password: 'Crear una contraseña de 6-32 caracteres',
    confirmPassword: 'Confirme su contraseña',
  },
  action: {
    resetPassword: 'restablecer contraseña',
    loginNow: 'Inicia sesión ahora',
    registerNow: 'Regístrate ahora',
  },
  prompt: {
    hasAccount: '¿Ya tienes una cuenta?',
    noAccount: '¿Sin cuenta?',
  },
  validation: {
    emailRequired: 'Por favor ingrese su correo electrónico',
    emailFormat: 'Por favor ingrese el formato de correo electrónico correcto',
    verificationCodeRequired: 'Introduzca el código de verificación',
    verificationCodeLength: 'Introduzca el código de verificación de 6 dígitos',
    passwordRequired: 'Por favor ingrese una nueva contraseña',
    passwordLength: 'La longitud de la contraseña no puede ser inferior a 6 caracteres.',
    confirmPasswordRequired: 'Por favor confirme la nueva contraseña',
    passwordMismatch: 'Las contraseñas ingresadas dos veces son inconsistentes',
  },
  message: {
    success: 'restablecimiento de la contraseña con éxito',
    failed: 'restablecimiento de contraseña falló',
  },
}
