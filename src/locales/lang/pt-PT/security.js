export default {
  verificationRequired: 'Associe e ative o seu e-mail ou o Google Authenticator antes de continuar.',
  singleLoginEnabled: 'Modo de login único habilitado com sucesso',
  singleLoginDisabled: 'Modo de login único desabilitado com sucesso',
  singleLoginFailed: 'Não foi possível atualizar a configuração de um único login. Por favor, tente novamente mais tarde.',
  centerTitle: 'Central de Segurança',
  overview: {
    description: 'Gerir a verificação de início de sessão, as restrições de dispositivos e os métodos de autenticação de dois fatores.', currentLevel: 'Nível de segurança atual', progress: 'Progresso de segurança', itemCount: '{count} itens', levelHigh: 'Alto', levelMedium: 'Médio', levelLow: 'Baixo',
    loginConfig: 'Configuração de início de sessão', loginConfigDesc: 'Gerir a palavra-passe, a política de dispositivos e as restrições da origem do início de sessão.', viewDevices: 'Ver dispositivos com sessão iniciada', loginPassword: 'Palavra-passe de início de sessão', loginPasswordDesc: 'Utilizada para confirmar a identidade ao iniciar sessão',
    change: 'Alterar', singleLogin: 'Início de sessão num único dispositivo', singleLoginOnDesc: 'Esta conta só pode ter sessão iniciada num dispositivo de cada vez', singleLoginOffDesc: 'Esta conta pode ter sessão iniciada em vários dispositivos ao mesmo tempo', enabled: 'Ativado', disabled: 'Desativado', enable: 'Ativar', disable: 'Desativar',
    ipWhitelist: 'Lista de IP permitidos', ipSetDesc: 'Somente endereços IP na lista de permissões podem entrar', ipUnsetDesc: 'Restrinja fontes de login comuns para reduzir o risco de acesso não autorizado', set: 'configurar', configured: 'Já definido', notConfigured: 'Não Configurado',
    twoFactor: 'Autenticação de dois fatores', twoFactorDesc: 'Associe um método de verificação adicional para operações sensíveis e recuperação da conta.', emailVerification: 'Verificação por e-mail', emailVerificationDesc: 'Pode ser utilizada para iniciar sessão e recuperar a palavra-passe', activated: 'Ativada', notActivated: 'Não ativada', bind: 'Associar', googleAuthenticator: 'Google Authenticator', googleDesc: 'Associe uma aplicação de autenticação para reforçar a segurança da conta', emailRequired: 'Associe e ative um endereço de e-mail antes de continuar.',
  },
  email: {
    unbound: 'Nenhum endereço de e- mail está ligado à sua conta.', bound: 'Endereço de email atual:', newAddress: 'Novo endereço de e- mail', invalid: 'Por favor insira um endereço de e-mail válido',
    newPlaceholder: "Introduza um novo endereço de e-mail, por exemplo: *****{'@'}gmail.com", code: 'Código de verificação', codePlaceholder: 'Digite o código de verificação', codeAfterEmail: 'Digite um endereço de e- mail para solicitar um código de verificação',
    changeTitle: 'Alterar endereço de e- mail', save: 'Gravar', bindSuccess: 'Endereço de e- mail ligado com sucesso', bindFailed: 'Não foi possível ligar o endereço de e- mail', changeSuccess: 'O endereço de e- mail foi alterado com sucesso', changeFailed: 'Falha na modificação',
    verifyTitle: 'Verificação de e-mail', verifyDescription: 'Enviámos um código de verificação de 6 dígitos para {email}. Introduza-o abaixo para concluir a verificação.', securityFooter: 'Verificação de segurança {siteName} · Proteção da sua conta', securityTitle: 'Verificação de segurança', submit: 'Enviar', googleClosed: 'O Google Authenticator foi desativado', googleCloseFailed: 'Não foi possível desativar o Google Authenticator',
  },
  password: {
    old: 'Palavra-passe atual', new: 'Nova palavra-passe', confirm: 'Confirmar palavra-passe', length: 'Introduza uma palavra-passe com 6 a 32 caracteres', oldPlaceholder: 'Introduza a palavra-passe atual', newPlaceholder: 'Introduza uma nova palavra-passe', confirmPlaceholder: 'Introduza novamente a nova palavra-passe', mismatch: 'As palavras-passe não coincidem', title: 'Alterar palavra-passe', submit: 'Enviar', success: 'A palavra-passe foi alterada. Inicie sessão novamente.', failed: 'Não foi possível alterar a palavra-passe',
  },
  ipWhitelist: { duplicate: 'Foi encontrada uma entrada duplicada: {ip}', title: 'Editar lista de IP permitidos', save: 'Guardar', success: 'A lista de IP permitidos foi atualizada', failed: 'Não foi possível atualizar a lista de IP permitidos' },
  google: {
    bind: 'Associar', downloadStep: 'Transferir aplicação de autenticação', scanStep: 'Ler código QR', verifyStep: 'Verificação de segurança', downloadTip: 'Transfira e instale a aplicação Google Authenticator', android: 'Versão para Android', ios: 'Versão para iOS',
    scanDownload: 'Leia o código QR com o telemóvel para transferir o Google Authenticator', addAccount: 'Leia o código QR abaixo com o Google Authenticator ou introduza manualmente a chave secreta para adicionar a conta.', rebindWarning: 'Se voltar a associar o Google Authenticator, a aplicação de autenticação anterior deixará de funcionar.',
    manualCode: 'Examine o código QR ou digite este código manualmente:', copy: 'Copiar', enterCodeTip: 'Digite o código de 6 dígitos gerado pelo Google Authenticator para completar a configuração', codePlaceholder: 'Digite o código de 6 dígitos do Google Authenticator',
    keyCopied: 'Chave copiada para a área de transferência', invalidCode: 'Insira um código de verificação de 6 dígitos', bindSuccess: 'Autenticação do Google vinculada com sucesso', title: 'Vincular o autenticador do Google',
  },
  loginRecords: {
    title: 'Dispositivos com sessão iniciada', description: 'Consulte os dispositivos com sessão iniciada e gira o respetivo estado.', unknownDevice: 'Dispositivo desconhecido', currentDevice: 'Dispositivo atual', currentLogin: 'Sessão iniciada', currentSession: 'Sessão atual', unknownBrowser: 'Navegador desconhecido', ipAddress: 'Endereço IP', loginTime: 'Hora de início de sessão', offline: 'Terminar sessão', empty: 'Não existem outros dispositivos com sessão iniciada',
    loadFailed: 'Não foi possível carregar os dispositivos. Contacte o apoio ao cliente.', confirmTitle: 'Terminar a sessão neste dispositivo?', confirmContent: 'Será necessário voltar a iniciar sessão neste dispositivo.', confirm: 'Confirmar', cancel: 'Cancelar', submitting: 'A enviar', success: 'Operação concluída', offlineSuccess: 'A sessão do dispositivo foi terminada', failed: 'A operação falhou',
  },
}
