import legal from './agreement.js'

export default {
  legal,
  title: 'Créer un compte',
  placeholder: {
    account: 'Saisissez un nom de compte de 6 à 20 caractères',
    email: 'Mail',
    verificationCode: 'Code de vérification',
    password: 'Créer un mot de passe de 6 à 30 caractères',
    confirmPassword: 'Confirmez votre mot de passe',
    invitationCode: 'Code d\'invitation (facultatif)',
  },
  agreement: {
    agreePrefix: 'J\'ai lu et j\'accepte',
    userAgreement: '"Contrat d\'utilisation"',
    conjunction: 'et',
    privacyPolicy: '"Accord de confidentialité"',
    userAgreementTitle: 'Contrat d\'utilisation',
    privacyPolicyTitle: 'accord de confidentialité',
    read: 'j\'ai lu',
    readAll: 'Veuillez lire l\'intégralité de l\'accord',
    required: 'Veuillez d\'abord lire et accepter les conditions d\'utilisation et l\'accord de confidentialité.',
  },
  action: {
    registerNow: 'Inscrivez-vous maintenant',
    loginNow: 'Connectez-vous maintenant',
    forgotPassword: 'oublié le mot de passe ?',
  },
  prompt: {
    hasAccount: 'Vous avez déjà un compte ?',
  },
  validation: {
    accountRequired: 'Veuillez entrer votre compte de connexion',
    accountLength: 'Le nom du compte doit contenir entre 6 et 20 caractères',
    accountTrim: 'Le numéro de compte ne peut pas contenir d\'espaces de début ou de fin.',
    accountSpaces: 'Le compte ne peut pas contenir d\'espaces',
    accountFormat: 'Le numéro de compte ne peut contenir que des lettres et des chiffres chinois, anglais ou utiliser le format e-mail.',
    emailRequired: 'Veuillez entrer l\'adresse e-mail',
    emailFormat: 'Veuillez saisir le format d\'e-mail correct',
    verificationCodeRequired: 'Saisissez le code de vérification',
    passwordRequired: 'Veuillez entrer votre mot de passe de connexion',
    passwordLength: 'Le mot de passe doit contenir entre 6 et 30 caractères',
    confirmPasswordRequired: 'Veuillez entrer le mot de passe de confirmation',
    passwordMismatch: 'Les deux mots de passe ne sont pas les mêmes',
  },
  message: {
    success: 'Inscription réussie',
    failed: 'L\'inscription a échoué',
  },
}
