import { isPhone } from '@/utils/device.js'
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
    path: "/home",
    name: "home",
    meta: {
      title: "首页",
      titleKey: "route.home",
      isApp:true,
    },
    component: () => import("@/views/home/index.vue"),
  },
  {
    path: "/card",
    name: "card",
    meta: {
      title: "卡片",
      titleKey: "route.card",
      menuIcon: "icon-CRMEB-zichan-mianxing",
      menuIconSize: "22px",
      isApp: true,
      isAppDetail: true,
    },
    component: () => import("@/views/card/index.vue"),
  },
  {
    path: "/express",
    name: "express",
    meta: {
      title: "速汇⚡️",
      titleKey: "route.express",
      menuIcon: "icon-fukuanshenqingicon",
      isApp: true,
    },
    component: () => import("@/views/express.vue"),
  },
  {
    path: "/pricing",
    name: "pricing",
    meta: {
      title: "定价",
      titleKey: "route.pricing",
      menuIcon: "icon-vip_fill",
      isApp: true,
    },
    component: () => import("@/views/pricing/index.vue"),
  },
  {
    path: "/cooperate",
    name: "cooperate",
    meta: {
      title: "合作",
      titleKey: "route.cooperate",
      menuIcon: "icon-hezuo",
      menuIconSize: "22px",
      isApp: true,
    },
    component: () => import("@/views/cooperate/index.vue"),
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
      isApp: true,
    },
    component: () => import("@/views/certify/index.vue"),
  },
  {
    path: "/help",
    name: "help",
    meta: {
      title: "帮助中心",
      titleKey: "help.center",
      menuIcon: "md-help-circle",
      menuIconStyle: menuIconStyles.orange,
      hidden: true,
    },
    redirect: "/help",
    component: () => import("@/views/help/help-view.vue"),
    children: [
      {
        path: "",
        name: "helpIndex",
        meta: {
          title: "帮助中心",
          titleKey: "help.center",
          isApp: true,
          isAppDetail: true,
        },
        component: () => import("@/views/help/index.vue"),
      },
      {
        path: "list/:id",
        name: "helpList",
        meta: {
          title: "帮助中心列表",
          titleKey: "help.listPageTitle",
          isApp: true,
          isAppDetail: true,
        },
        component: () => import("@/views/help/list.vue"),
      },
      {
        path: "details/:id",
        name: "helpDetails",
        meta: {
          title: "帮助中心详情",
          titleKey: "help.detailsPageTitle",
          isApp: true,
          isAppDetail: true,
        },
        component: () => import("@/views/help/details.vue"),
      },
    ],
  },
  {
    path: "/preferences/country",
    name: "preferences_country",
    meta: {
      title: "国家与地区",
      titleKey: "route.countryPreferences",
      hidden: true,
      isApp: true,
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

// 代理商
export const agentRoutes = [
  {
    path: "rewards",
    name: "ucenter_agent_rewards",
    meta: {
      title: "代理商奖励",
      titleKey: "route.agentRewards",
      direct: "ucenter_agent",
      isApp: true,
      isAppDetail: true,
    },
    component: () => import("@/views/agent/rewards/index.vue"),
  },
  {
    path: "rewards_detail/:id",
    name: "ucenter_agent_detail",
    meta: {
      title: "代理商奖励详情",
      titleKey: "route.agentRewardDetails",
      direct: 'ucenter_agent',
      hidden: true,
      isApp: true,
      isAppDetail: true,
    },
    component: () => import("@/views/agent/rewards/detail.vue"),
  },
  // {
  //   path: "inviteCode",
  //   name: "ucenter_agent_inviteCode",
  //   meta: {
  //     title: "邀请码管理",
  //     direct: "ucenter_agent",
  //   },
  //   component: () => import("@/views/agent/inviteCode/index.vue"),
  // },
  {
    path: "admin",
    name: "ucenter_agent_admin",
    meta: {
      title: "管理员管理",
      titleKey: "route.administratorManagement",
      direct: "ucenter_agent",
      isApp: true,
      isAppDetail: true,
    },
    component: () => import("@/views/agent/admin/index.vue"),
  },
]
// ucenter
export const ucenterRoutes = {
  path: "/ucenter",
  name: "ucenter",
  redirect: "/ucenter/index",
  meta: {
    title: "菜单",
    titleKey: "route.menu",
    menuIcon: "icon-zongheiconmorenhui",
    menuIconSize: "28px",
  },
  component: () => import("@/views/ucenter/router-view.vue"),
  children: [
    {
      path: "index",
      name: "ucenter_index",
      meta: {
        title: "个人主页",
        titleKey: "route.personalHome",
        menuIcon: "md-person",
        menuIconStyle: menuIconStyles.blue,
        isApp: true,
        isAppDetail: true,
      },
      component: () => import("@/views/ucenter/index/index.vue"),
    },
    {
      path: "finance",
      name: "ucenter_finance",
      meta: {
        title: "财务管理",
        titleKey: "route.financeManagement",
        menuIcon: "md-list-box",
        menuIconStyle: menuIconStyles.orange,
        isApp: true,
        isAppDetail: true,
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
        isApp: true,
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
        menuIcon: "md-card",
        hidden: !isPhone,
        menuIconStyle: menuIconStyles.green,
        isApp: true,
        isAppDetail: true,
        isCertification: true,
      },
      component: () => import("@/views/ucenter/recharge/index.vue"),
    },
    {
      path: "express",
      name: "ucenter_express",
      meta: {
        titleKey: "express.title.expressList",
        menuTitleKey: "route.express",
        title: "全球速汇",
        menuIcon: "md-globe",
        menuIconStyle: menuIconStyles.cyan,
        menuTagKey: "menu.recommended",
        isApp: true,
        isAppDetail: true,
        isCertification: true,
      },
      component: () => import("@/views/express/index.vue"),
    },
    {
      path: "expressTransfer",
      name: "express_transfer",
      meta: {
        titleKey: "express.title.expressTransfer",
        title: "发起速汇",
        hidden: true,
        direct: "ucenter_express",
        isApp: true,
        isAppDetail: true,
        isCertification: true,
      },
      component: () => import("@/views/express/transfer/index.vue"),
    },
    {
      path: "expressDetail/:id",
      name: "express_detail",
      meta: {
        titleKey: "express.title.expressDetail",
        title: "交易详情",
        hidden: true,
        direct: "ucenter_express",
        isApp: true,
        isAppDetail: true,
        isCertification: true,
      },
      component: () => import("@/views/express/detail/index.vue"),
    },
    {
      path: "/certify",
      name: "certify",
      meta: {
        title: "实名认证",
        titleKey: "route.identityVerification",
        menuIcon: "md-checkmark-circle",
        menuIconStyle: menuIconStyles.purple,
        isApp: true,
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
      meta: {
        title: "消息中心",
        titleKey: "route.messageCenter",
        menuIcon: "md-notifications",
        menuIconStyle: menuIconStyles.blue,
        isApp: true,
        isAppDetail: true,
      },
      component: () => import("@/views/ucenter/message/index.vue"),
    },
    {
      path: "download",
      name: "ucenter_download",
      meta: {
        title: "下载中心",
        titleKey: "route.downloadCenter",
        menuIcon: "md-download",
        menuIconStyle: menuIconStyles.blue,
        isApp: true,
        isAppDetail: true,
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
      path: "invite",
      name: "ucenter_invite",
      meta: {
        title: "我的邀请",
        titleKey: "route.myInvitations",
        menuIcon: "md-share",
        menuIconStyle: menuIconStyles.red,
        isApp: true,
        isAppDetail: true,
      },
      component: () => import("@/views/ucenter/invite/index.vue"),
    },
    {
      path: "security",
      name: "ucenter_security",
      meta: {
        title: "安全中心",
        titleKey: "route.securityCenter",
        menuIcon: "md-lock",
        menuIconStyle: menuIconStyles.green,
        isApp: true,
        isAppDetail: true,
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
        isApp: true,
        isAppDetail: true,
      },
      component: () => import("@/views/ucenter/login-records/index.vue"),
    },
    {
      path: "open-platform",
      name: "ucenterOpenPlatform",
      meta: {
        title: "开放平台",
        titleKey: "route.openPlatform",
        menuIcon: "md-code-working",
        menuIconStyle: menuIconStyles.orange,
        need_auth: "allow_api",
        isApp: true,
        isAppDetail: true,
      },
      component: () => import("@/views/ucenter/open-platform/index.vue"),
    },
    {
      path: "account",
      name: "ucenterAccount",
      meta: {
        title: "团队管理",
        titleKey: "route.teamManagement",
        menuIcon: "md-contacts",
        menuIconStyle: menuIconStyles.cyan,
        need_auth: "allow_account",
        isApp: true,
        isAppDetail: true,
      },
      component: () => import("@/views/ucenter/account/index.vue"),
    },
    {
      path: "cashback",
      name: "ucenterCashback",
      meta: {
        title: "消费返现",
        titleKey: "route.cashback",
        menuIcon: "md-cash",
        menuIconStyle: menuIconStyles.orange,
        need_auth: "is_cashback",
        isApp: true,
        isAppDetail: true,
      },
      component: () => import("@/views/ucenter/cashback/index.vue"),
    },
    {
      path: "cashback_rate",
      alias: "cashback_pricing",
      name: "ucenterCashbackRate",
      meta: {
        title: "返现费率",
        titleKey: "cashback.rateTitle",
        need_auth: "is_cashback",
        direct: "ucenterCashback",
        hidden: true,
        isApp: true,
        isAppDetail: true,
      },
      component: () => import("@/views/ucenter/cashback/rate.vue"),
    },
    {
      path: "cashback_detail",
      name: "ucenter_cashback_detail",
      meta: {
        title: "返现详情",
        titleKey: "route.cashbackDetails",
        need_auth: "is_cashback",
        direct: "ucenterCashback",
        hidden: true,
        isApp: true,
        isAppDetail: true,
      },
      component: () => import("@/views/ucenter/cashback/detail.vue"),
    },
    {
      path: "agent",
      name: "ucenter_agent",
      redirect: "/ucenter/agent/rewards",
      meta: {
        title: "代理分销",
        titleKey: "route.agent",
        menuIcon: "md-briefcase",
        menuIconStyle: menuIconStyles.purple,
        isApp: true,
        isAppDetail: true,
        // need_auth: "is_invite_cashback",
      },
      children: agentRoutes,
      component: () => import("@/views/agent/index.vue"),
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
        isApp: true,
        isAppDetail: true,
      },
      component: () => import("@/views/card/add/index.vue"),
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
