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
    path: "/preferences/country",
    name: "preferences_country",
    meta: {
      title: "国家与地区",
      titleKey: "route.countryPreferences",
      hidden: true,
      isApp: true,
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
      isApp: true,
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
        isApp: true,
        isAppDetail: true,
      },
      component: () => import("@/views/ucenter/index/index.vue"),
    },
    {
      path: "/card",
      name: "card",
      meta: {
        title: "卡片管理",
        titleKey: "route.card",
        menuIcon: "icon-yinhangka-m",
        menuIconStyle: menuIconStyles.blue,
        isApp: true,
        isAppDetail: true,
      },
      component: () => import("@/views/card/index.vue"),
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
        isApp: true,
        isAppDetail: true,
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
        isApp: true,
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
        isApp: true,
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
        direct: "ucenter_finance",
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
      alias: ['/ucenter/certify'],
      meta: {
        title: "实名认证",
        titleKey: "route.identityVerification",
        menuIcon: "icon-chakankaihuxinxi",
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
        menuIcon: "icon-xiaoxizhongxin",
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
        menuIcon: "icon-daochu",
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
      path: "security",
      name: "ucenter_security",
      meta: {
        title: "安全中心",
        titleKey: "route.securityCenter",
        menuIcon: "icon-maijiabaozhang-shi",
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
      path: "/pricing",
      name: "pricing",
      meta: {
        title: "会员权益",
        titleKey: "route.pricing",
        menuIcon: "icon-VIP",
        menuIconStyle: menuIconStyles.blue,
        isApp: true,
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
        isApp: true,
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
