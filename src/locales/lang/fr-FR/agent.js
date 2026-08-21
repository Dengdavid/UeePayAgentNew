export default {
  title: 'Agent',
  apply: {
    eyebrow: 'Programme d’Agents Ouvert · Partenaires Stratégiques Recherchés', title: 'Accédez aux Paiements Internationaux', titleAccent: 'Développez Votre Activité d’Agent', description: 'Intégrez l’émission de cartes virtuelles, les transferts internationaux et la gestion des récompenses sans développer votre propre plateforme. Ajoutez l’émission de cartes, le rechargement de solde et les transferts transfrontaliers pour répondre à davantage de besoins clients.', contactToApply: 'Contacter l’Assistance pour Candidater', learnMore: 'Découvrir les Avantages du Programme', agentStatement: 'Relevé de l’Agent', estimatedRewards: 'Récompenses de {month}', rewardComposition: 'Composition des Récompenses', automaticSummary: 'Résumé Automatique', settlementNotice: 'Les récompenses sont calculées chaque mois et leurs détails peuvent être consultés à tout moment',
    highlights: {
      integration: { value: 'De bout en bout', label: 'Délivrance, remise et récompenses de cartes' },
      scenarios: { value: 'Cas d\'utilisation multiple', label: 'Ouverture, recharge et transferts des cartes' },
      settlement: { value: 'Règlement mensuel', label: 'Examiner les détails de récompense à tout moment' },
    },
    services: {
      card: { title: 'Services d’Émission de Cartes', subtitle: 'Infrastructure de Cartes Virtuelles', description: 'Proposez l’émission, le rechargement de solde, la gestion des cartes et différents scénarios de paiement depuis une plateforme unique.', tags: { opening: 'Émission de Cartes Virtuelles', recharge: 'Gestion des Rechargements', scenarios: 'Scénarios de Paiement' } },
      remittance: { title: 'Transferts Internationaux', subtitle: 'Services de Fonds Transfrontaliers', description: 'Prenez en charge les paiements transfrontaliers, les transferts clients et différents scénarios de règlement multidevise.', tags: { transfer: 'Transferts Transfrontaliers', currency: 'Services Multidevises', tracking: 'Suivi des Transferts' } },
    },
    features: {
      noDevelopment: { title: 'Pas de développement interne', description: 'Démarrer l\'exploitation des services de cartes virtuelles après activation sans construire la plateforme vous-même' }, brand: { title: 'Opérations indépendantes de marque', description: 'Prise en charge de la personnalisation de la marque blanche et de la fixation du domaine pour votre propre marque et système utilisateur' }, rewards: { title: 'Possibilités de récompenses continues', description: 'Les catégories de récompenses couvrent la recharge, l\'ouverture des cartes, les transactions et les services transfrontaliers' }, global: { title: 'Possibilités de marché mondiales', description: 'Développer au niveau international les capacités de paiement transfrontière et multidevises' }, pricing: { title: 'Prix flexibles', description: 'Configurer les tarifs et les stratégies de tarification pour s\'adapter à votre modèle d\'entreprise' }, support: { title: 'Assistance clientèle gérée', description: 'Une équipe de soutien aide aux demandes de renseignements, au traitement des questions et aux examens de base' },
    },
  },
  rewards: {
    statsTitle: 'Statistiques de la rémunération',
    settlementTip: 'Les montants des récompenses dépendent du calcul effectué côté serveur. Les récompenses en attente doivent être vérifiées dans la page de détails avant confirmation.',
    estimatedThisMonth: 'Récompenses Estimées ce Mois-ci', pendingLastMonth: 'Récompenses du Mois Dernier en Attente', totalHistorical: 'Total Historique des Récompenses',
    month: 'Mois de Récompense', status: 'État', total: 'Total des Récompenses', accountRechargeFee: 'Frais de rechargement du compte', cardActivationFee: 'Frais d\'émission de la carte',
    cardTransferInFee: 'Frais de transfert de carte', transactionFee: 'Frais de transaction', crossBorderFee: 'Frais de traitement transfrontalier', membershipFee: 'Frais de service aux membres', remark: 'Remarque', detail: 'Détails',
    pendingConfirmation: 'Confirmation en attente', confirmed: 'Confirmé',
    detailPage: {
      confirmedAmount: 'Montant confirmé', confirmedAmountTip: 'Le montant final réglé à l\'agent', pendingCredit: 'Montant en attente de confirmation', confirmedCredit: 'Montant confirmé ce mois',
      totalReward: 'Montant Total des Récompenses', monthlySummary: 'Résumé de toutes les récompenses de ce mois', creditedAmount: 'Montant Crédité', creditedSiteReward: 'Récompenses des sites d’agents déjà créditées', siteCount: 'Nombre de Sites', siteUnit: 'sites', expandHint: 'Développez un site pour consulter sa ventilation quotidienne',
      composition: 'Composition des récompenses', compositionHint: 'Les récompenses de l\'agent de ce mois sont résumées par les catégories de frais suivantes.', primarySource: 'Source primaire', compositionPercent: '{percent}% du total des récompenses',
      siteDetails: 'Détails des Récompenses par Site', siteDetailsHint: 'Développez un site pour consulter sa ventilation quotidienne. Sélectionnez les sites avant l’exportation.', selectedSites: '{count} sites sélectionnés', noSiteSelected: 'Aucun site sélectionné', exportData: 'Exporter les Données', dailySummary: 'Résumé Quotidien', monthlyExport: 'Résumé Mensuel', dataDetails: 'Données Détaillées',
      waitingConfirmation: 'En Attente de Confirmation', confirmationComplete: 'Confirmation Terminée', verifyBeforeConfirm: 'Vérifiez la composition des récompenses de chaque site avant de confirmer.', recordConfirmed: 'Cet enregistrement de récompense a été confirmé.', close: 'Fermer', confirmReward: 'Confirmer la Récompense',
      siteName: 'Nom du site', totalRewardUsd: 'Montant total des indemnités', creditedUsd: 'Montant crédité $', pendingUsd: 'Montant en attente $', date: 'Date', invitationCommission: 'Commission d\'invitation $', monthTotal: 'Total mensuel',
      generatingFile: 'Le fichier est en cours de création. Consultez vos messages dans quelques instants.', operationFailed: 'L\'opération a échoué', confirmTitle: 'Confirmer la Récompense', confirmContent: 'Confirmez que les données de récompense de l’agent pour ce mois sont correctes. Après confirmation, elles passeront à l’étape suivante et ne pourront plus être annulées.', confirmSuccess: 'Récompense confirmée', missingRecord: 'Données de récompense manquantes',
    },
  },
  setting: { title: 'Paramètres du site' },
  invite: { copy: 'Copier', empty: 'Pas de liens d\'invitation disponibles' },
  admin: {
    warning: 'Les autorisations de l\'administrateur affectent la gestion du site de l\'agent. Ajouter uniquement les comptes dont l\'identité a été confirmée. La disponibilité du site reste soumise aux autorisations du serveur et aux résultats de contrôle des risques.',
    searchPlaceholder: 'Nom du site / Administrateur / Domaine', clear: 'Effacer', add: 'Ajouter un Administrateur', siteCount: '{count} sites d’agents',
    domain: 'Domaine', createdAt: 'Date de Création', remove: 'Supprimer', noMatch: 'Aucun administrateur correspondant', empty: 'Aucune donnée d’administrateur',
    noMatchHint: 'Modifiez le nom du site, le nom de l’administrateur ou le mot-clé du domaine, puis réessayez.', emptyHint: 'Ajoutez un administrateur pour gérer ici ses autorisations sur les sites d’agents.', clearFilter: 'Effacer les Filtres',
    promptTitle: 'Confirmation', removeConfirm: 'Supprimer l’administrateur <span class="ui-text-primary">{name}</span> ?', removeSuccess: 'Administrateur supprimé', operationSuccess: 'Opération réussie', operationFailed: 'L\'opération a échoué',
    modal: {
      title: 'Ajouter Administrateur', confirmUser: 'Confirmer l\' utilisateur', confirmUserHint: 'Rechercher et vérifier le compte', authorizeSites: 'Autoriser les sites', authorizeSitesHint: 'Sélectionner le champ de gestion',
      searchTitle: 'Rechercher un Compte Administrateur', searchDescription: 'Saisissez l’adresse e-mail ou le nom de l’utilisateur, confirmez le compte, puis autorisez les sites d’agents.', userName: 'Nom de l’Utilisateur',
      userPlaceholder: 'Saisissez l’adresse e-mail ou le nom de l’utilisateur et appuyez sur Entrée', searchHint: 'Utilisez si possible l’adresse e-mail complète afin d’éviter de sélectionner un utilisateur portant un nom similaire.', confirmedAccount: 'Compte Administrateur Confirmé', searchAgain: 'Rechercher à Nouveau',
      selectSites: 'Sélectionner les sites d\'agents', selectSitesDescription: 'Sélectionnez un ou plusieurs sites d\'agents que l\'utilisateur confirmé peut gérer.', authorizeTo: 'Autoriser', agentSites: 'Sites d\'agents',
      availableSites: '{count} disponibles', selectedSites: ', {count} sélectionnés', sitePlaceholder: 'Sélectionnez les sites d’agents à autoriser', authorizationHint: 'Après l’envoi, cet utilisateur recevra les autorisations de gestion pour les sites d’agents sélectionnés.', noSites: 'Aucun site n’est disponible pour autorisation. Vérifiez d’abord la configuration des sites d’agents.',
      cancel: 'Annuler', previous: 'Précédent', searchContinue: 'Rechercher et Continuer', confirmAdd: 'Confirmer et Ajouter', enterUser: 'Saisissez l’adresse e-mail ou le nom de l’utilisateur à rechercher', userNotFound: 'Aucun utilisateur correspondant n’a été trouvé. Vérifiez les informations et réessayez.', userMatched: 'Utilisateur trouvé', confirmAccountFirst: 'Confirmez d’abord le compte administrateur', selectSiteFirst: 'Sélectionnez au moins un site d’agent', addSuccess: 'Administrateur ajouté',
    },
  },
}
