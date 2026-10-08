// 路由白名单
const menuIconStyles = {
  blue: {
    background: "linear-gradient(135deg, #4DA1FF 0%, #1677FF 100%)",
  },
  orange: {
    background: "linear-gradient(135deg, #FFBC3D 0%, #FF9500 100%)",
  },
  green: {
    background: "linear-gradient(135deg, #33D18C 0%, #00B578 100%)",
  },
  cyan: {
    background: "linear-gradient(135deg, #33C8FF 0%, #00A4FF 100%)",
  },
  purple: {
    background: "linear-gradient(135deg, #A366FF 0%, #8033FF 100%)",
  },
  red: {
    background: "linear-gradient(135deg, #FF7B7B 0%, #FF4D4F 100%)",
  },
};

export const whiteRoutes = [
  {
    path: "/activate",
    name: "accountActivation",
    meta: {
      title: "激活团队账号",
      titleKey: "ucenterAccount.activationPage.title",
      hidden: true,
      standalone: true,
      skipAppInit: true,
      isApp: true,
    },
    component: () => import("@/views/activate/index.vue"),
  },
  {
    path: "/preferences/country",
    name: "preferences_country",
    meta: {
      title: "国家与地区",
      titleKey: "route.countryPreferences",
      hidden: true,
      standalone: true,
    },
    component: () => import("@/views/preferences/country.vue"),
  },
];

// 登陆后不许访问页面
export const loginUnableRoutes = [
  {
    path: "/login",
    name: "login",
    meta: {
      title: "登录",
      titleKey: "route.login",
    },
    component: () => import("@/views/login/index.vue"),
  },
  {
    path: "/forgot-password",
    name: "forgot-password",
    meta: {
      title: "忘记密码",
      titleKey: "route.forgotPassword",
    },
    component: () => import("@/views/forgot-password/index.vue"),
  },
  {
    path: "/register",
    name: "register",
    meta: {
      title: "注册",
      titleKey: "route.register",
    },
    component: () => import("@/views/register/index.vue"),
  },
  {
    path: "/invite",
    name: "invite",
    //重定向到注册页面
    redirect: "/register",
    meta: {
      title: "邀请",
      titleKey: "route.invitation",
      hidden: true,
    },
  },
];
// 管理后台
export const manageRoutes = [
    {
      path: "marketing",
      name: "marketing",
      meta: {
        title:"营销数据",//营销数据
        titleKey: "menu.marketingData",
        direct: "manage",
      },
      component: () => import("@/views/manage/marketing/index.vue"),
    },
    {
      path: "cardManagement",
      name: "cardManagement",
      meta: {
        title: "账单管理",//账单管理
        titleKey: "menu.cardManage",
        direct: "manage",
      },
      component: () => import("@/views/manage/cardManagement/index.vue"),
    },
    {
      path: "billManagement",
      name: "billManagement",
      meta: {
        title: "账单管理",//账单管理
        titleKey: "menu.billManage",
        direct: "manage",
      },
      component: () => import("@/views/manage/billManagement/index.vue"),
    },
    {
      path: "userManagement",
      name: "userManagement",
      meta: {
        title: "用户管理",//用户管理
        titleKey: "menu.userManag",
        direct: "manage",
      },
      component: () => import("@/views/manage/userManagement/index.vue"),
    },
    {
      path: "pricingManagement",
      name: "pricingManagement",
      meta: {
        title:"定价管理",//定价管理
        titleKey: "menu.pricingManagement",
        direct: "manage",
      },
      component: () => import("@/views/manage/pricingManagement/index.vue"),
    },
    {
      path: "menuManagement",
      name: "menuManagement",
      meta: {
        title:"菜单管理",//菜单管理
        titleKey: "menu.menuManage",
        direct: "manage",
      },
      component: () => import("@/views/manage/menuManagement/index.vue"),
    },
    {
      path: "siteNotice",
      name: "siteNotice",
      meta: {
        title:"站点公告",//站点公告
        titleKey: "menu.siteNotice",
        direct: "manage",
      },
      component: () => import("@/views/manage/siteNotice/index.vue"),
    },
    {
      path: "setting",
      name: "setting",
      meta: {
        title: "站点设置",//站点设置
        titleKey: "menu.siteSetting",
        direct: "manage",
      },
      component: () => import("@/views/manage/setting/index.vue"),
    },
];
// 代理商
export const agentRoutes = [
  {
    path: "rewards",
    name: "ucenter_agent_rewards",
    meta: {
      title: "代理商奖励",
      titleKey: "route.agentRewards",
      direct: "ucenter_agent",
      isAppDetail: true,
    },
    component: () => import("@/views/ucenter/index/index.vue"),
  },
]
// ucenter
export const ucenterRoutes = {
  path: "/",
  name: "ucenter_index",
  redirect: "/home",
  meta: {
    title: "菜单",
    titleKey: "route.menu",
    menuIcon: "icon-zongheiconmorenhui",
    menuIconSize: "28px",
  },
  children: [
    {
      path: "/home",
      name: "home",
      meta: {
        title: "控制台",
        titleKey: "route.home",
        menuIcon: "icon-kongzhitai",
        menuIconStyle: menuIconStyles.green,
      },
      component: () => import("@/views/ucenter/index/index.vue"),
    },
    {
    path: "/card",
    name: "card",
    meta: {
      title: "常规卡",
      titleKey: "card.index.regularCard",
      menuIcon: "icon-CRMEB-zichan-mianxing",
      menuIconSize: "22px",
      isApp: true,
      isAppDetail: true,
    },
    component: () => import("@/views/card/prepaid/index.vue"),
  },
    {
    path: "/card/shared",
    name: "sharedCard",
    meta: {
      title: "共享卡",
      titleKey: "card.index.sharedCard",
      direct: "card",
      hidden: false,
      menuIcon: "icon-feiyong",
      menuIconStyle: menuIconStyles.purple,
      isApp: true,
      isAppDetail: true,
    },
    component: () => import("@/views/card/share/index.vue"),
  },
    {
    path: "/card/shared/wallet",
    name: "cardSharedWallets",
    meta: {
      title: "共享钱包",
      titleKey: "card.index.sharedManagement.title",
      direct: "sharedCard",
      hidden: true,
      menuIcon: "md-wallet",
      menuIconStyle: menuIconStyles.purple,
      permissionCodes: ["shared_wallet.view"],
      isApp: true,
      isAppDetail: true,
      isCertification: true,
    },
    component: () => import("@/views/card/share/wallet/index.vue"),
  },
    {
    path: "/card/shared/wallet/detail/:id",
    name: "cardSharedWalletDetail",
    meta: {
      title: "共享钱包详情",
      titleKey: "card.index.sharedManagement.detailTitle",
      direct: "cardSharedWallets",
      hidden: true,
      permissionCodes: ["shared_wallet.view"],
      isApp: true,
      isAppDetail: true,
    },
    component: () => import("@/views/card/share/wallet/detail/index.vue"),
  },
    {
    path: "/card/shared/wallet/add",
    name: "cardSharedWalletAdd",
    meta: {
      title: "新建共享钱包",
      titleKey: "card.index.sharedForm.createTitle",
      direct: "cardSharedWallets",
      hidden: true,
      permissionCodes: ["shared_wallet.view"],
      isApp: true,
      isAppDetail: true,
    },
    component: () => import("@/views/card/share/wallet/form/index.vue"),
  },
    {
    path: "/card/shared/wallet/edit/:id",
    name: "cardSharedWalletEdit",
    meta: {
      title: "编辑共享钱包",
      titleKey: "card.index.sharedForm.editTitle",
      direct: "cardSharedWallets",
      hidden: true,
      permissionCodes: ["shared_wallet.view"],
      isApp: true,
      isAppDetail: true,
    },
    component: () => import("@/views/card/share/wallet/form/index.vue"),
  },
    {
      path: "express",
      name: "ucenter_express",
      meta: {
        titleKey: "express.title.expressList",
        menuTitleKey: "route.express",
        title: "全球速汇",
        menuIcon: "icon-kuajinyewu",
        menuIconStyle: menuIconStyles.cyan,
        menuTagKey: "menu.recommended",
        isCertification: true,
      },
      component: () => import("@/views/express/index.vue"),
    },
    {
      path: "/certify",
      name: "certify",
      meta: {
        title: "实名认证",
        titleKey: "route.identityVerification",
        menuIcon: "md-checkmark-circle",
        menuIconStyle: menuIconStyles.purple,
        hidden: true,
      },
      component: () => import("@/views/certify/index.vue"),
    },
    {
      path: "expressTransfer",
      name: "express_transfer",
      meta: {
        titleKey: "express.title.expressTransfer",
        title: "发起速汇",
        hidden: true,
        direct: "ucenter_express",
        isAppDetail: true,
        isCertification: true,
      },
      component: () => import("@/views/express/transfer/index.vue"),
    },
    {
      path: "finance",
      name: "ucenter_finance",
      meta: {
        title: "财务管理",
        titleKey: "route.financeManagement",
        menuIcon: "icon-feiyong",
        menuIconStyle: menuIconStyles.orange,
      },
      component: () => import("@/views/ucenter/finance/index.vue"),
    },
    {
      path: "withdraw",
      name: "withdraw",
      meta: {
        title: "余额提现",
        titleKey: "route.withdrawal",
        hidden: true,
        direct: "ucenter_finance",
        isAppDetail: true,
      },
      component: () => import("@/views/ucenter/withdraw.vue"),
    },
    {
      path: "deposit",
      alias: "recharge",
      name: "ucenter_deposit",
      meta: {
        title: "账户充值",
        titleKey: "route.accountRecharge",
        direct: "ucenter_finance",
        menuIcon: "md-card",
        hidden: true,
        menuIconStyle: menuIconStyles.green,
        isAppDetail: true,
        isCertification: true,
      },
      component: () => import("@/views/ucenter/recharge/index.vue"),
    },
    {
      path: "expressDetail/:id",
      name: "express_detail",
      meta: {
        titleKey: "express.title.expressDetail",
        title: "交易详情",
        hidden: true,
        direct: "ucenter_express",
        isAppDetail: true,
        isCertification: true,
      },
      component: () => import("@/views/express/detail/index.vue"),
    },
    {
      path: "/certify",
      name: "certify",
      alias: ['/ucenter/certify'],
      meta: {
        title: "实名认证",
        titleKey: "route.identityVerification",
        menuIcon: "icon-chakankaihuxinxi",
        menuIconStyle: menuIconStyles.purple,
      },
      component: () => import("@/views/certify/index.vue"),
    },
    {
      path: "cardholder",
      name: "cardholder",
      meta: {
        title: "持卡人管理",
        titleKey: "route.cardholderManagement",
        hidden: true,
      },
      component: () => import("@/views/ucenter/cardholder.vue"),
    },
    {
      path: "message",
      name: "ucenter_message",
      alias: ['/ucenter/message'],
      meta: {
        title: "消息中心",
        titleKey: "route.messageCenter",
        menuIcon: "icon-xiaoxizhongxin",
        menuIconStyle: menuIconStyles.blue,
      },
      component: () => import("@/views/ucenter/message/index.vue"),
    },
    {
      path: "download",
      name: "ucenter_download",
      alias: ['/ucenter/download'],
      meta: {
        title: "下载中心",
        titleKey: "route.downloadCenter",
        menuIcon: "icon-daochu",
        menuIconStyle: menuIconStyles.blue,
      },
      component: () => import("@/views/ucenter/download/index.vue"),
    },
    {
      path: "msgDetail",
      name: "msgDetail",
      meta: {
        title: "查看消息",
        titleKey: "route.messageDetails",
        hidden: true,
        direct: "ucenter_message",
      },
      component: () => import("@/views/ucenter/msgDetail.vue"),
    },
    {
      path: "account",
      name: "ucenterAccount",
      meta: {
        title: "团队管理",
        titleKey: "route.teamManagement",
        permissionCodes: ['team.view'],
        menuIcon: "icon-tuanduiguanli",
        menuIconStyle: menuIconStyles.cyan,
        isApp: true,
        isAppDetail: true,
      },
      component: () => import("@/views/ucenter/account/index.vue"),
    },
    {
      path: "account/create",
      name: "ucenterAccountCreate",
      meta: {
        title: "批量新建账号",
        titleKey: "ucenterAccount.batchCreate.title",
        permissionCodes: ['team.view', 'team.account.view', 'team.account.create'],
        hidden: true,
        direct: "ucenterAccount",
        need_auth: "allow_account",
        isApp: true,
        isAppDetail: true,
      },
      component: () => import("@/views/ucenter/account/create/index.vue"),
    },
    {
      path: "account/edit/:id",
      name: "ucenterAccountEdit",
      meta: {
        title: "编辑账户",
        titleKey: "ucenterAccount.edit.title",
        permissionCodes: ['team.view', 'team.account.view', 'team.account.update'],
        hidden: true,
        direct: "ucenterAccount",
        isApp: true,
        isAppDetail: true,
      },
      component: () => import("@/views/ucenter/account/edit/index.vue"),
    },
    {
      path: "account/security/:id",
      name: "ucenterAccountSecurity",
      meta: {
        title: "账号安全",
        titleKey: "ucenterAccount.security.title",
        permissionCodes: ['team.view', 'team.account.view', 'team.account.security.view'],
        hidden: true,
        direct: "ucenterAccount",
        isApp: true,
        isAppDetail: true,
      },
      component: () => import("@/views/ucenter/account/security/index.vue"),
    },
    {
      path: "account/group/create",
      name: "ucenterAccountGroupCreate",
      meta: {
        title: "新建分组",
        titleKey: "ucenterAccount.groupForm.createTitle",
        permissionCodes: ['team.view', 'team.group.view', 'team.group.create'],
        hidden: true,
        direct: "ucenterAccount",
        isApp: true,
        isAppDetail: true,
      },
      component: () => import("@/views/ucenter/account/group/form/index.vue"),
    },
    {
      path: "account/group/edit/:id",
      name: "ucenterAccountGroupEdit",
      meta: {
        title: "编辑分组",
        titleKey: "ucenterAccount.groupForm.editTitle",
        permissionCodes: ['team.view', 'team.group.view', 'team.group.update'],
        hidden: true,
        direct: "ucenterAccount",
        isApp: true,
        isAppDetail: true,
      },
      component: () => import("@/views/ucenter/account/group/form/index.vue"),
    },
    {
      path: "account/role/create",
      name: "ucenterAccountRoleCreate",
      meta: {
        title: "新建角色",
        titleKey: "ucenterAccount.roleForm.createTitle",
        permissionCodes: ['team.view', 'team.role.view', 'team.role.create'],
        hidden: true,
        direct: "ucenterAccount",
        isApp: true,
        isAppDetail: true,
      },
      component: () => import("@/views/ucenter/account/role/form/index.vue"),
    },
    {
      path: "account/role/edit/:id",
      name: "ucenterAccountRoleEdit",
      meta: {
        title: "编辑角色",
        titleKey: "ucenterAccount.roleForm.editTitle",
        permissionCodes: ['team.view', 'team.role.view'],
        hidden: true,
        direct: "ucenterAccount",
        isApp: true,
        isAppDetail: true,
      },
      component: () => import("@/views/ucenter/account/role/form/index.vue"),
    },
    {
      path: "log",
      name: "ucenter_log",
      meta: {
        title: "操作日志",
        titleKey: "auditLog.menu",
        menuIcon: "icon-caozuorizhix",
        menuIconStyle: menuIconStyles.blue,
        isApp: true,
        isAppDetail: true,
      },
      component: () => import("@/views/ucenter/log/index.vue"),
    },
    {
      path: "security",
      name: "ucenter_security",
      alias: ['/ucenter/security'],
      meta: {
        title: "安全中心",
        titleKey: "route.securityCenter",
        menuIcon: "icon-maijiabaozhang-shi",
        menuIconStyle: menuIconStyles.green,
      },
      component: () => import("@/views/ucenter/security/index.vue"),
    },
    {
      path: "login-records",
      name: "ucenterLoginRecords",
      meta: {
        title: "登录设备",
        titleKey: "security.loginRecords.title",
        hidden: true,
        direct: "ucenter_security",
        isAppDetail: true,
      },
      component: () => import("@/views/ucenter/login-records/index.vue"),
    },
    {
      path: "/pricing",
      name: "pricing",
      meta: {
        title: "会员权益",
        titleKey: "route.pricing",
        menuIcon: "icon-VIP",
        menuIconStyle: menuIconStyles.blue,
      },
      component: () => import("@/views/pricing/index.vue"),
    },
    {
      path: "/cooperate",
      name: "cooperate",
      meta: {
        title: "商务合作",
        titleKey: "route.cooperate",
        menuIcon: "icon-hezuo",
        menuIconStyle: menuIconStyles.purple,
      },
      component: () => import("@/views/cooperate/index.vue"),
    },
    {
      path: "manage",
      name: "manage",
      meta: {
        title: "管理后台",
        titleKey: "menu.manage",
        hidden: true,
        requiresAdmin: true,
      },
      redirect: "/manage/marketing",
      component: () => import("@/views/manage/index.vue"),
      children:manageRoutes,
    },
  ],
};

// 单页路由
export const pageRoutes = {
  path: "/",
  name: "singlePage",
  redirect: "/home",
  component: () => import("@/views/main.vue"),
  children: [
    {
      path: "/card/detail/:id",
      name: "cardDetail",
      meta: {
        title: "卡片详情",
        titleKey: "route.cardDetails",
        direct: "card",
        hidden: true,
        cardType: "prepaid",
        permissionCodes: ["card.view"],
        isApp: true,
        isAppDetail: true,
      },
      component: () => import("@/views/card/detail/index.vue"),
    },
    {
      path: "/card/share/detail/:id",
      name: "sharedCardDetail",
      meta: {
        title: "卡片详情",
        titleKey: "route.cardDetails",
        direct: "sharedCard",
        hidden: true,
        cardType: "share",
        permissionCodes: ["shared_card.view"],
        isApp: true,
        isAppDetail: true,
      },
      component: () => import("@/views/card/detail/index.vue"),
    },
    {
      path: "/card/add",
      name: "cardAdd",
      meta: {
        title: "快速开卡",
        titleKey: "route.openVirtualCard",
        direct: "card",
        hidden: true,
        // 开卡页根据 query.type 校验对应卡类型的查看和创建权限。
        isApp: true,
        isAppDetail: true,
      },
      component: () => import("@/views/card/add/index.vue"),
    },
    {
      path: "/card/share/add",
      name: "sharedCardAdd",
      redirect: to => ({ name: "cardAdd", query: { ...to.query, type: "share" }, hash: to.hash }),
    },
    {
      path: "/card/physical",
      name: "cardPhysical",
      meta: {
        title: "实体卡申请",
        titleKey: "route.physicalCardApplication",
        direct: "card",
        isApp: true,
        isAppDetail: true,
      },
      component: () => import("@/views/card/physical/index.vue"),
    },
    {
      path: "/card/activation",
      name: "cardActivation",
      meta: {
        title: "卡片激活",
        titleKey: "route.cardActivation",
        direct: "card",
        isApp: true,
        isAppDetail: true,
      },
      component: () => import("@/views/card/activation.vue"),
    },
    {
      path: "iframe",
      name: "iframe",
      meta: {
        title: "",//
        hidden: true,
      },
      component: () => import("@/views/iframe/index.vue"),
    },
  ],
};

//404 403 500 路由
export const errorRoutes = [
  {
    path: "/404",
    name: "error_404",
    meta: {
      title: "404",
    },
    component: () => import("@/views/exception/404/index.vue"),
  },
  {
    path: "/403",
    name: "error_403",
    meta: {
      title: "403",
    },
    component: () => import("@/views/exception/403/index.vue"),
  },
  {
    path: "/500",
    name: "error_500",
    meta: {
      title: "500",
    },
    component: () => import("@/views/exception/500/index.vue"),
  },
  {
    path: "/451",
    name: "error_451",
    meta: {
      title: "451",
    },
    component: () => import("@/views/exception/451/index.vue"),
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/404'
  }
];

export const routers = [
  ucenterRoutes,
  pageRoutes,
  ...whiteRoutes,
  ...loginUnableRoutes,
  ...errorRoutes,
];
