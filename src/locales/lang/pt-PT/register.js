import legal from './agreement.js'

export default {
  legal,
  title: 'Registre uma conta',
  placeholder: {
    account: 'Introduza um nome de conta com 6 a 20 caracteres',
    email: 'Correspondência',
    verificationCode: 'Código de verificação',
    password: 'Criar uma senha de 6-30 caracteres',
    confirmPassword: 'Confirme sua senha',
    invitationCode: 'Código do convite (opcional)',
  },
  agreement: {
    agreePrefix: 'eu li e concordo',
    userAgreement: '"Contrato do Usuário"',
    conjunction: 'e',
    privacyPolicy: '"Acordo de Privacidade"',
    userAgreementTitle: 'Contrato do usuário',
    privacyPolicyTitle: 'acordo de privacidade',
    read: 'eu li',
    readAll: 'Por favor, leia todo o acordo',
    required: 'Por favor, leia e concorde com o Contrato do Usuário e o Contrato de Privacidade primeiro',
  },
  action: {
    registerNow: 'Registre-se agora',
    loginNow: 'Faça login agora',
    forgotPassword: 'esqueceu a senha?',
  },
  prompt: {
    hasAccount: 'Já tem uma conta?',
  },
  validation: {
    accountRequired: 'Por favor insira sua conta de login',
    accountLength: 'O nome da conta deve ter entre 6 e 20 caracteres',
    accountTrim: 'O número da conta não pode conter espaços à esquerda ou à direita.',
    accountSpaces: 'A conta não pode conter espaços',
    accountFormat: 'O número da conta só pode conter letras e números em chinês e inglês ou usar o formato de e-mail',
    emailRequired: 'Por favor insira seu endereço de e-mail',
    emailFormat: 'Por favor insira o formato de e-mail correto',
    verificationCodeRequired: 'Digite o código de verificação',
    passwordRequired: 'Por favor digite sua senha de login',
    passwordLength: 'A palavra-passe deve ter entre 6 e 30 caracteres',
    confirmPasswordRequired: 'Por favor insira a senha de confirmação',
    passwordMismatch: 'As duas senhas não são iguais',
  },
  message: {
    success: 'Registro realizado com sucesso',
    failed: 'Falha no registro',
  },
}
