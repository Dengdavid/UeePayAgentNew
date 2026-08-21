export default {
  verificationRequired: 'Associez et activez votre adresse e-mail ou Google Authenticator avant de continuer.',
  singleLoginEnabled: 'Mode mono-login activé avec succès',
  singleLoginDisabled: 'Mode mono-login désactivé avec succès',
  singleLoginFailed: 'Impossible de mettre à jour le paramètre mono-login. Veuillez réessayer plus tard.',
  centerTitle: 'Centre de sécurité',
  overview: {
    description: 'Gérez la vérification de connexion, les restrictions des appareils et les méthodes d’authentification à deux facteurs.', currentLevel: 'Niveau de sécurité actuel', progress: 'Progression de la sécurité', itemCount: '{count} éléments', levelHigh: 'Élevé', levelMedium: 'Moyen', levelLow: 'Faible',
    loginConfig: 'Configuration de connexion', loginConfigDesc: 'Gérez votre mot de passe, la politique des appareils et les restrictions liées aux sources de connexion.', viewDevices: 'Voir les appareils connectés', loginPassword: 'Mot de passe de connexion', loginPasswordDesc: 'Utilisé pour vérifier votre identité lors de la connexion',
    change: 'Modifier', singleLogin: 'Connexion sur un seul appareil', singleLoginOnDesc: 'Ce compte ne peut être connecté que sur un seul appareil à la fois', singleLoginOffDesc: 'Ce compte peut être connecté sur plusieurs appareils en même temps', enabled: 'Activé', disabled: 'Désactivé', enable: 'Activer', disable: 'Désactiver',
    ipWhitelist: 'Liste d’adresses IP autorisées', ipSetDesc: 'Seules les adresses IP figurant sur la liste peuvent se connecter', ipUnsetDesc: 'Limitez les sources de connexion habituelles afin de réduire les risques d’accès non autorisé', set: 'Configurer', configured: 'Configurée', notConfigured: 'Non configurée',
    twoFactor: 'Authentification à deux facteurs', twoFactorDesc: 'Associez une méthode de vérification supplémentaire pour les opérations sensibles et la récupération du compte.', emailVerification: 'Vérification par e-mail', emailVerificationDesc: 'Peut être utilisée pour la connexion et la récupération du mot de passe', activated: 'Activée', notActivated: 'Non activée', bind: 'Associer', googleAuthenticator: 'Google Authenticator', googleDesc: 'Associez une application d’authentification pour renforcer la sécurité du compte', emailRequired: 'Associez et activez une adresse e-mail avant de continuer.',
  },
  email: {
    unbound: 'Aucune adresse e-mail n\'est actuellement liée à votre compte.', bound: 'Adresse courriel actuelle :', newAddress: 'Nouvelle adresse électronique', invalid: 'S\'il vous plaît, mettez une adresse email valide',
    newPlaceholder: "Saisissez une nouvelle adresse e-mail, par exemple : *****{'@'}gmail.com", code: 'Code de vérification', codePlaceholder: 'Saisissez le code de vérification', codeAfterEmail: 'Saisissez une adresse électronique pour demander un code de vérification',
    changeTitle: 'Modifier l\'adresse électronique', save: 'Enregistrer', bindSuccess: 'Adresse électronique liée avec succès', bindFailed: 'Impossible de lier l\'adresse électronique', changeSuccess: 'L\'adresse électronique a été modifiée avec succès', changeFailed: 'La modification a échoué',
    verifyTitle: 'Vérification de l’adresse e-mail', verifyDescription: 'Nous avons envoyé un code de vérification à 6 chiffres à {email}. Saisissez-le ci-dessous pour terminer la vérification.', securityFooter: 'Vérification de sécurité {siteName} · Protection de votre compte', securityTitle: 'Vérification de sécurité', submit: 'Envoyer', googleClosed: 'Google Authenticator a été désactivé', googleCloseFailed: 'Impossible de désactiver Google Authenticator',
  },
  password: {
    old: 'Mot de passe actuel', new: 'Nouveau mot de passe', confirm: 'Confirmer le mot de passe', length: 'Saisissez un mot de passe de 6 à 32 caractères', oldPlaceholder: 'Saisissez votre mot de passe actuel', newPlaceholder: 'Saisissez un nouveau mot de passe', confirmPlaceholder: 'Saisissez à nouveau le nouveau mot de passe', mismatch: 'Les mots de passe ne correspondent pas', title: 'Modifier le mot de passe', submit: 'Envoyer', success: 'Le mot de passe a été modifié. Veuillez vous reconnecter.', failed: 'Impossible de modifier le mot de passe',
  },
  ipWhitelist: { duplicate: 'Une entrée en double a été détectée : {ip}', title: 'Modifier la liste d’adresses IP autorisées', save: 'Enregistrer', success: 'La liste d’adresses IP autorisées a été mise à jour', failed: 'Impossible de mettre à jour la liste d’adresses IP autorisées' },
  google: {
    bind: 'Associer', downloadStep: 'Télécharger l’application d’authentification', scanStep: 'Scanner le code QR', verifyStep: 'Vérification de sécurité', downloadTip: 'Téléchargez et installez l’application Google Authenticator', android: 'Version Android', ios: 'Version iOS',
    scanDownload: 'Scannez le code QR avec votre téléphone pour télécharger Google Authenticator', addAccount: 'Scannez le code QR ci-dessous avec Google Authenticator ou saisissez manuellement la clé secrète pour ajouter le compte.', rebindWarning: 'Si vous associez à nouveau Google Authenticator, l’ancienne application d’authentification ne fonctionnera plus.',
    manualCode: 'Scannez le code QR ou saisissez ce code manuellement :', copy: 'Copier', enterCodeTip: 'Entrez le code à 6 chiffres généré par Google Authentificateur pour terminer la configuration', codePlaceholder: 'Entrez le code de Google Authentificateur à 6 chiffres',
    keyCopied: 'Clé copiée dans le presse-papiers', invalidCode: 'Entrez un code de vérification à 6 chiffres', bindSuccess: 'Google Authentificateur lié avec succès', title: 'Lier l\'authentificateur Google',
  },
  loginRecords: {
    title: 'Appareils connectés', description: 'Consultez les appareils actuellement connectés et gérez leur statut de connexion.', unknownDevice: 'Appareil inconnu', currentDevice: 'Appareil actuel', currentLogin: 'Connecté', currentSession: 'Session actuelle', unknownBrowser: 'Navigateur inconnu', ipAddress: 'Adresse IP', loginTime: 'Heure de connexion', offline: 'Déconnecter', empty: 'Aucun autre appareil n’est connecté',
    loadFailed: 'Impossible de charger les appareils connectés. Contactez l’assistance.', confirmTitle: 'Déconnecter cet appareil ?', confirmContent: 'Une nouvelle connexion sera nécessaire sur cet appareil.', confirm: 'Confirmer', cancel: 'Annuler', submitting: 'Envoi en cours', success: 'Opération terminée', offlineSuccess: 'L’appareil a été déconnecté', failed: 'L’opération a échoué',
  },
}
