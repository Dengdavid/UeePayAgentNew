import legal from './agreement.js'

export default {
  legal,
  title: 'Registrar una cuenta',
  placeholder: {
    account: 'Introduzca un nombre de cuenta de 6 a 20 caracteres',
    email: 'Correo',
    verificationCode: 'Código de verificación',
    password: 'Crear una contraseña de 6-30 caracteres',
    confirmPassword: 'Confirme su contraseña',
    invitationCode: 'Código de invitación (opcional)',
  },
  agreement: {
    agreePrefix: 'He leído y acepto',
    userAgreement: '"Acuerdo de usuario"',
    conjunction: 'y',
    privacyPolicy: '"Acuerdo de Privacidad"',
    userAgreementTitle: 'Acuerdo de usuario',
    privacyPolicyTitle: 'acuerdo de privacidad',
    read: 'he leído',
    readAll: 'Por favor lea todo el acuerdo',
    required: 'Primero lea y acepte el Acuerdo de usuario y el Acuerdo de privacidad.',
  },
  action: {
    registerNow: 'Regístrate ahora',
    loginNow: 'Inicia sesión ahora',
    forgotPassword: '¿Olvidaste la contraseña?',
  },
  prompt: {
    hasAccount: '¿Ya tienes una cuenta?',
  },
  validation: {
    accountRequired: 'Por favor ingrese su cuenta de inicio de sesión',
    accountLength: 'El nombre de la cuenta debe tener entre 6 y 20 caracteres',
    accountTrim: 'El número de cuenta no puede contener espacios iniciales o finales.',
    accountSpaces: 'La cuenta no puede contener espacios',
    accountFormat: 'El número de cuenta solo puede contener letras y números en chino e inglés o utilizar el formato de correo electrónico.',
    emailRequired: 'Por favor ingrese la dirección de correo electrónico',
    emailFormat: 'Por favor ingrese el formato de correo electrónico correcto',
    verificationCodeRequired: 'Introduzca el código de verificación',
    passwordRequired: 'Por favor ingrese su contraseña de inicio de sesión',
    passwordLength: 'La contraseña debe tener entre 6 y 30 caracteres',
    confirmPasswordRequired: 'Por favor ingrese la contraseña de confirmación',
    passwordMismatch: 'Las dos contraseñas no son iguales.',
  },
  message: {
    success: 'Registro exitoso',
    failed: 'Registro fallido',
  },
}
