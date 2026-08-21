export default {
  title: 'Agente',
  apply: {
    eyebrow: 'Parcerias de Agentes Abertas · Procuramos Parceiros Estratégicos', title: 'Aceda a Pagamentos Globais', titleAccent: 'Expanda o Seu Negócio de Agente', description: 'Integre a emissão de cartões virtuais, transferências globais e gestão de recompensas sem desenvolver uma plataforma própria. Acrescente serviços de emissão de cartões, carregamento de saldo e transferências transfronteiriças para responder a mais necessidades dos clientes.', contactToApply: 'Contactar o Apoio para Candidatura', learnMore: 'Conhecer as Vantagens do Agente', agentStatement: 'Extrato do Agente', estimatedRewards: 'Recompensas de {month}', rewardComposition: 'Composição das Recompensas', automaticSummary: 'Resumo Automático', settlementNotice: 'As recompensas são apuradas mensalmente e os detalhes podem ser consultados a qualquer momento',
    highlights: {
      integration: { value: 'Ponta a Ponta', label: 'Emissão de cartões, transferências e recompensas' },
      scenarios: { value: 'Vários Cenários', label: 'Emissão de cartões, carregamentos e transferências' },
      settlement: { value: 'Apuramento Mensal', label: 'Consulte os detalhes das recompensas a qualquer momento' },
    },
    services: {
      card: { title: 'Serviços de Emissão de Cartões', subtitle: 'Infraestrutura para Cartões Virtuais', description: 'Disponibilize emissão, carregamento de saldo, gestão de cartões e vários cenários de pagamento através de uma única plataforma.', tags: { opening: 'Emissão de Cartões Virtuais', recharge: 'Gestão de Carregamentos', scenarios: 'Cenários de Pagamento' } },
      remittance: { title: 'Transferências Globais', subtitle: 'Serviços de Fundos Transfronteiriços', description: 'Apoie pagamentos transfronteiriços, transferências de clientes e diferentes cenários de liquidação multimoeda.', tags: { transfer: 'Transferências Transfronteiriças', currency: 'Serviços Multimoeda', tracking: 'Acompanhamento de Transferências' } },
    },
    features: {
      noDevelopment: { title: 'Sem Desenvolvimento Interno', description: 'Comece a operar serviços de cartões virtuais sem desenvolver uma plataforma própria' }, brand: { title: 'Operação com Marca Própria', description: 'Utilize personalização de marca branca e domínio próprio para a sua marca e sistema de utilizadores' }, rewards: { title: 'Oportunidades de Recompensa Contínuas', description: 'As recompensas podem abranger carregamentos, emissão de cartões, transações e serviços transfronteiriços' }, global: { title: 'Oportunidades no Mercado Global', description: 'Expanda-se internacionalmente com pagamentos transfronteiriços e serviços multimoeda' }, pricing: { title: 'Preços Flexíveis', description: 'Defina taxas e estratégias de preços adequadas ao seu modelo de negócio' }, support: { title: 'Apoio ao Cliente Gerido', description: 'Uma equipa de apoio ajuda com pedidos, resolução de problemas e análises básicas' },
    },
  },
  rewards: {
    statsTitle: 'Estatísticas de Recompensa',
    settlementTip: 'Os montantes das recompensas são determinados pelo apuramento no servidor. As recompensas pendentes devem ser revistas na página de detalhes antes da confirmação.',
    estimatedThisMonth: 'Recompensas Estimadas Este Mês', pendingLastMonth: 'Recompensas Pendentes do Mês Passado', totalHistorical: 'Total Histórico de Recompensas',
    month: 'Mês da Recompensa', status: 'Estado', total: 'Total de Recompensas', accountRechargeFee: 'Taxa de carregamento da conta', cardActivationFee: 'Taxa de ativação do cartão',
    cardTransferInFee: 'Taxa de transferência de cartão', transactionFee: 'Taxas de transação', crossBorderFee: 'Taxa de manuseio transfronteiriço', membershipFee: 'Taxa de serviço para membros', remark: 'Observação', detail: 'Detalhes',
    pendingConfirmation: 'Confirmação Pendente', confirmed: 'Confirmado',
    detailPage: {
      confirmedAmount: 'Montante Confirmado', confirmedAmountTip: 'Montante final a pagar ao agente após o apuramento', pendingCredit: 'Montante Pendente de Confirmação', confirmedCredit: 'Montante Confirmado Este Mês',
      totalReward: 'Montante Total das Recompensas', monthlySummary: 'Resumo de todas as recompensas deste mês', creditedAmount: 'Montante Creditado', creditedSiteReward: 'Recompensas de sites de agentes já creditadas', siteCount: 'Número de Sites', siteUnit: 'sites', expandHint: 'Expanda um site para consultar a discriminação diária',
      composition: 'Composição das Recompensas', compositionHint: 'As recompensas do agente deste mês estão resumidas pelas seguintes categorias de taxas.', primarySource: 'Fonte Principal', compositionPercent: '{percent}% do total das recompensas',
      siteDetails: 'Detalhes das Recompensas por Site', siteDetailsHint: 'Expanda um site para consultar a discriminação diária. Selecione os sites antes de exportar.', selectedSites: '{count} sites selecionados', noSiteSelected: 'Nenhum site selecionado', exportData: 'Exportar Dados', dailySummary: 'Resumo Diário', monthlyExport: 'Resumo Mensal', dataDetails: 'Dados Detalhados',
      waitingConfirmation: 'A Aguardar Confirmação', confirmationComplete: 'Confirmação Concluída', verifyBeforeConfirm: 'Reveja a composição das recompensas de cada site antes de confirmar.', recordConfirmed: 'Este registo de recompensa foi confirmado.', close: 'Fechar', confirmReward: 'Confirmar Recompensa',
      siteName: 'Nome do Site', totalRewardUsd: 'Total de Recompensas $', creditedUsd: 'Montante Creditado $', pendingUsd: 'Montante Pendente $', date: 'Data', invitationCommission: 'Comissão de Convites $', monthTotal: 'Total Mensal',
      generatingFile: 'O ficheiro está a ser gerado. Consulte as suas mensagens dentro de instantes.', operationFailed: 'Falha na operação', confirmTitle: 'Confirmar Recompensa', confirmContent: 'Confirme que os dados das recompensas deste mês estão corretos. Após a confirmação, os dados avançam para o processamento seguinte e não podem ser revertidos.', confirmSuccess: 'Recompensa confirmada', missingRecord: 'Faltam dados do registo de recompensa',
    },
  },
  setting: { title: 'Configurações do site' },
  invite: { copy: 'Copiar', empty: 'Nenhum link de convite disponível' },
  admin: {
    warning: 'As permissões de administrador afetam a gestão dos sites de agentes. Adicione apenas contas cuja identidade tenha sido confirmada. A disponibilidade dos sites depende das permissões no servidor e dos resultados do controlo de risco.',
    searchPlaceholder: 'Nome do site / Administrador / Domínio', clear: 'Limpar', add: 'Adicionar Administrador', siteCount: '{count} sites de agentes',
    domain: 'Domínio', createdAt: 'Criado em', remove: 'Remover', noMatch: 'Sem administradores correspondentes', empty: 'Sem dados de administrador',
    noMatchHint: 'Ajuste o nome do site, nome do administrador ou palavra-chave de domínio e tente novamente.', emptyHint: 'Adicione um administrador para gerenciar suas permissões de site de agente aqui.', clearFilter: 'Limpar os Filtros',
    promptTitle: 'Aviso', removeConfirm: 'Remover administrador <span class="ui-text-primary">{name}</span>?', removeSuccess: 'Administrador removido', operationSuccess: 'Operação bem-sucedida', operationFailed: 'Falha na operação',
    modal: {
      title: 'Adicionar Administrador', confirmUser: 'Confirmar usuário', confirmUserHint: 'Procurar e verificar a conta', authorizeSites: 'Autorizar Sites', authorizeSitesHint: 'Selecione o escopo de gerenciamento',
      searchTitle: 'Procurar Conta de Administrador', searchDescription: 'Introduza o e-mail ou nome do utilizador, confirme a identidade da conta e, em seguida, autorize os sites de agentes.', userName: 'Nome do Utilizador',
      userPlaceholder: 'Introduza o e-mail ou nome do utilizador e prima Enter', searchHint: 'Sempre que possível, utilize o endereço de e-mail completo para evitar selecionar um utilizador com um nome semelhante.', confirmedAccount: 'Conta de Administrador Confirmada', searchAgain: 'Procurar Novamente',
      selectSites: 'Selecionar Sites de Agentes', selectSitesDescription: 'Selecione um ou mais sites de agentes que o utilizador confirmado poderá gerir.', authorizeTo: 'Autorizar Utilizador', agentSites: 'Sites de Agentes',
      availableSites: '{count} disponíveis', selectedSites: ', {count} selecionados', sitePlaceholder: 'Selecione os sites de agentes a autorizar', authorizationHint: 'Após o envio, este utilizador receberá permissões de gestão para os sites de agentes selecionados.', noSites: 'Não existem sites disponíveis para autorização. Verifique primeiro a configuração dos sites de agentes.',
      cancel: 'Cancelar', previous: 'Anterior', searchContinue: 'Procurar e Continuar', confirmAdd: 'Confirmar e Adicionar', enterUser: 'Introduza o e-mail ou nome do utilizador para pesquisar', userNotFound: 'Não foi encontrado nenhum utilizador correspondente. Verifique os dados e tente novamente.', userMatched: 'Utilizador encontrado', confirmAccountFirst: 'Confirme primeiro a conta de administrador', selectSiteFirst: 'Selecione pelo menos um site de agente', addSuccess: 'Administrador adicionado',
    },
  },
}
