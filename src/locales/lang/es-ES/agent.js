export default {
  title: 'Agente',
  apply: {
    eyebrow: 'Programa de Agentes Abierto · Buscamos Socios Estratégicos', title: 'Acceda a Pagos Globales', titleAccent: 'Amplíe Su Negocio de Agente', description: 'Integre la emisión de tarjetas virtuales, las transferencias globales y la gestión de recompensas sin desarrollar una plataforma propia. Añada servicios de emisión de tarjetas, recarga de saldo y transferencias transfronterizas para atender más necesidades de sus clientes.', contactToApply: 'Contactar con Soporte para Solicitarlo', learnMore: 'Conocer las Ventajas del Agente', agentStatement: 'Extracto del Agente', estimatedRewards: 'Recompensas de {month}', rewardComposition: 'Composición de las Recompensas', automaticSummary: 'Resumen Automático', settlementNotice: 'Las recompensas se liquidan mensualmente y sus detalles pueden consultarse en cualquier momento',
    highlights: {
      integration: { value: 'De Principio a Fin', label: 'Emisión de tarjetas, transferencias y recompensas' },
      scenarios: { value: 'Múltiples Escenarios', label: 'Emisión de tarjetas, recargas y transferencias' },
      settlement: { value: 'Liquidación Mensual', label: 'Consulte los detalles de las recompensas cuando quiera' },
    },
    services: {
      card: { title: 'Servicios de Emisión de Tarjetas', subtitle: 'Infraestructura para Tarjetas Virtuales', description: 'Ofrezca emisión, recarga de saldo, gestión de tarjetas y distintos escenarios de pago desde una única plataforma.', tags: { opening: 'Emisión de Tarjetas Virtuales', recharge: 'Gestión de Recargas', scenarios: 'Escenarios de Pago' } },
      remittance: { title: 'Transferencias Globales', subtitle: 'Servicios de Fondos Transfronterizos', description: 'Atienda pagos transfronterizos, transferencias de clientes y distintos escenarios de liquidación multidivisa.', tags: { transfer: 'Transferencias Transfronterizas', currency: 'Servicios Multidivisa', tracking: 'Seguimiento de Transferencias' } },
    },
    features: {
      noDevelopment: { title: 'Sin Desarrollo Interno', description: 'Empiece a ofrecer tarjetas virtuales sin desarrollar una plataforma propia' }, brand: { title: 'Operaciones con Marca Propia', description: 'Utilice personalización de marca blanca y un dominio propio para su marca y sistema de usuarios' }, rewards: { title: 'Oportunidades de Recompensa Continuas', description: 'Las recompensas pueden incluir recargas, emisión de tarjetas, transacciones y servicios transfronterizos' }, global: { title: 'Oportunidades en el Mercado Global', description: 'Expanda su negocio internacionalmente con pagos transfronterizos y servicios multidivisa' }, pricing: { title: 'Precios Flexibles', description: 'Configure tarifas y estrategias de precios adaptadas a su modelo de negocio' }, support: { title: 'Atención al Cliente Gestionada', description: 'Un equipo de soporte ayuda con consultas, resolución de incidencias y revisiones básicas' },
    },
  },
  rewards: {
    statsTitle: 'Estadísticas de recompensa',
    settlementTip: 'Los importes de las recompensas se determinan mediante la liquidación del servidor. Revise las recompensas pendientes en la página de detalles antes de confirmarlas.',
    estimatedThisMonth: 'Recompensas Estimadas Este Mes', pendingLastMonth: 'Recompensas Pendientes del Mes Pasado', totalHistorical: 'Total Histórico de Recompensas',
    month: 'Mes de recompensa', status: 'Estado', total: 'Recompensas totales', accountRechargeFee: 'Tarifa de recarga de cuenta', cardActivationFee: 'Tarifa de activación de tarjeta',
    cardTransferInFee: 'Tarifa de transferencia de tarjeta', transactionFee: 'Tarifas de transacción', crossBorderFee: 'Tarifa de tramitación transfronteriza', membershipFee: 'Tarifa de servicio para miembros', remark: 'Observación', detail: 'Detalles',
    pendingConfirmation: 'Confirmación pendiente', confirmed: 'Confirmado',
    detailPage: {
      confirmedAmount: 'Importe Confirmado', confirmedAmountTip: 'Importe final que se abonará al agente según la liquidación', pendingCredit: 'Importe Pendiente de Confirmación', confirmedCredit: 'Importe Confirmado Este Mes',
      totalReward: 'Importe Total de Recompensas', monthlySummary: 'Resumen de todas las recompensas de este mes', creditedAmount: 'Importe Abonado', creditedSiteReward: 'Recompensas de sitios de agentes ya abonadas', siteCount: 'Número de Sitios', siteUnit: 'sitios', expandHint: 'Despliegue un sitio para ver su desglose diario',
      composition: 'Composición de recompensa', compositionHint: 'Las recompensas de agente de este mes se resumen por las siguientes categorías de honorarios.', primarySource: 'Fuente primaria', compositionPercent: '{percent}% de las recompensas totales',
      siteDetails: 'Detalles de la recompensa del sitio', siteDetailsHint: 'Ampliar un sitio para ver su desglose diario. Seleccione sitios antes de exportar.', selectedSites: '{count} sitios seleccionados', noSiteSelected: 'No hay sitios seleccionados', exportData: 'Exportar datos', dailySummary: 'Resumen diario', monthlyExport: 'Resumen', dataDetails: 'Datos detallados',
      waitingConfirmation: 'Pendiente de Confirmación', confirmationComplete: 'Confirmación Completada', verifyBeforeConfirm: 'Revise la composición de recompensas de cada sitio antes de confirmar.', recordConfirmed: 'Este registro de recompensas ya está confirmado.', close: 'Cerrar', confirmReward: 'Confirmar Recompensa',
      siteName: 'Nombre del sitio', totalRewardUsd: 'Total de recompensas $', creditedUsd: 'Cantidad acreditada $', pendingUsd: 'Monto pendiente $', date: 'Fecha', invitationCommission: 'Comisión de Invitación $', monthTotal: 'Total mensual',
      generatingFile: 'El archivo se está generando. Consulte sus mensajes en unos instantes.', operationFailed: 'La operación ha fallado', confirmTitle: 'Confirmar Recompensa', confirmContent: 'Confirme que los datos de recompensas del agente de este mes son correctos. Una vez confirmados, pasarán al siguiente proceso y no podrán revertirse.', confirmSuccess: 'Recompensa confirmada', missingRecord: 'Faltan datos del registro de recompensas',
    },
  },
  setting: { title: 'Configuración del sitio' },
  invite: { copy: 'Copiar', empty: 'No hay enlaces de invitación disponibles' },
  admin: {
    warning: 'Los permisos de administrador afectan a la gestión de los sitios de agentes. Añada únicamente cuentas cuya identidad se haya confirmado. La disponibilidad de los sitios depende de los permisos del servidor y de los resultados del control de riesgos.',
    searchPlaceholder: 'Nombre del sitio / Administrador / Dominio', clear: 'Borrar', add: 'Añadir Administrador', siteCount: '{count} sitios de agentes',
    domain: 'Dominio', createdAt: 'Creado en', remove: 'Retirar', noMatch: 'No hay administradores coincidentes', empty: 'No hay datos de administrador',
    noMatchHint: 'Cambie el nombre del sitio, el administrador o la palabra clave del dominio e inténtelo de nuevo.', emptyHint: 'Añada un administrador para gestionar aquí sus permisos sobre los sitios de agentes.', clearFilter: 'Borrar Filtros',
    promptTitle: 'Confirmación', removeConfirm: '¿Eliminar al administrador <span class="ui-text-primary">{name}</span>?', removeSuccess: 'Administrador eliminado', operationSuccess: 'Operación completada', operationFailed: 'La operación ha fallado',
    modal: {
      title: 'Añadir administrador', confirmUser: 'Confirmar usuario', confirmUserHint: 'Encontrar y verificar la cuenta', authorizeSites: 'Autorizar sitios', authorizeSitesHint: 'Seleccione el alcance de la gestión',
      searchTitle: 'Buscar Cuenta de Administrador', searchDescription: 'Introduzca el correo electrónico o nombre del usuario, confirme la identidad de la cuenta y después autorice los sitios de agentes.', userName: 'Nombre del Usuario',
      userPlaceholder: 'Introduzca el correo electrónico o nombre del usuario y pulse Enter', searchHint: 'Utilice la dirección de correo electrónico completa siempre que sea posible para no seleccionar a un usuario con un nombre similar.', confirmedAccount: 'Cuenta de Administrador Confirmada', searchAgain: 'Buscar de Nuevo',
      selectSites: 'Seleccionar Sitios de Agentes', selectSitesDescription: 'Seleccione uno o varios sitios de agentes que podrá gestionar el usuario confirmado.', authorizeTo: 'Autorizar a', agentSites: 'Sitios de Agentes',
      availableSites: '{count} disponibles', selectedSites: ', {count} seleccionados', sitePlaceholder: 'Seleccione los sitios de agentes que desea autorizar', authorizationHint: 'Tras el envío, este usuario recibirá permisos de gestión sobre los sitios de agentes seleccionados.', noSites: 'No hay sitios disponibles para autorizar. Compruebe primero la configuración de los sitios de agentes.',
      cancel: 'Cancelar', previous: 'Anterior', searchContinue: 'Buscar y Continuar', confirmAdd: 'Confirmar y Añadir', enterUser: 'Introduzca el correo electrónico o nombre del usuario que desea buscar', userNotFound: 'No se ha encontrado ningún usuario coincidente. Revise los datos e inténtelo de nuevo.', userMatched: 'Usuario encontrado', confirmAccountFirst: 'Confirme primero la cuenta de administrador', selectSiteFirst: 'Seleccione al menos un sitio de agente', addSuccess: 'Administrador añadido',
    },
  },
}
