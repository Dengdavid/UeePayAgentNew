export default {
  title: 'Recuperar senha',
  placeholder: {
    email: 'Correspondência',
    verificationCode: 'Código de verificação',
    password: 'Criar uma senha de 6-32 caracteres',
    confirmPassword: 'Confirme sua senha',
  },
  action: {
    resetPassword: 'redefinir senha',
    loginNow: 'Faça login agora',
    registerNow: 'Registre-se agora',
  },
  prompt: {
    hasAccount: 'Já tem uma conta?',
    noAccount: 'Sem conta?',
  },
  validation: {
    emailRequired: 'Por favor insira seu e-mail',
    emailFormat: 'Por favor insira o formato de e-mail correto',
    verificationCodeRequired: 'Digite o código de verificação',
    verificationCodeLength: 'Insira o código de verificação de 6 dígitos',
    passwordRequired: 'Por favor insira a nova senha',
    passwordLength: 'O comprimento da senha não pode ser inferior a 6 caracteres',
    confirmPasswordRequired: 'Por favor confirme a nova senha',
    passwordMismatch: 'As senhas digitadas duas vezes são inconsistentes',
  },
  message: {
    success: 'Reiniciar senha com sucesso',
    failed: 'Falha na redefinição da senha',
  },
}
