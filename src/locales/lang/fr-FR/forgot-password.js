export default {
  title: 'Récupérer le mot de passe',
  placeholder: {
    email: 'Mail',
    verificationCode: 'Code de vérification',
    password: 'Créer un mot de passe 6-32 caractères',
    confirmPassword: 'Confirmez votre mot de passe',
  },
  action: {
    resetPassword: 'réinitialiser le mot de passe',
    loginNow: 'Connectez-vous maintenant',
    registerNow: 'Inscrivez-vous maintenant',
  },
  prompt: {
    hasAccount: 'Vous avez déjà un compte ?',
    noAccount: 'Pas de compte ?',
  },
  validation: {
    emailRequired: 'Veuillez entrer votre email',
    emailFormat: 'Veuillez saisir le format d\'e-mail correct',
    verificationCodeRequired: 'Saisissez le code de vérification',
    verificationCodeLength: 'Veuillez saisir le code de vérification à 6 chiffres',
    passwordRequired: 'Veuillez entrer un nouveau mot de passe',
    passwordLength: 'La longueur du mot de passe ne peut pas être inférieure à 6 caractères',
    confirmPasswordRequired: 'Veuillez confirmer le nouveau mot de passe',
    passwordMismatch: 'Les mots de passe saisis deux fois sont incohérents',
  },
  message: {
    success: 'Réinitialiser le mot de passe avec succès',
    failed: 'La réinitialisation du mot de passe a échoué',
  },
}
