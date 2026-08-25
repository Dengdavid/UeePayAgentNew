import common from './common.js'
import setting from './setting.js'
import menuManagement from './menu-management.js'
import userManagement from './user-management.js'
import groupManagement from './group-management.js'
import marketing from './marketing.js'
import certify from './certify.js'
import counts from './counts.js'
import cardDetail from './card/detail.js'
import cardIndex from './card/index.js'
import express from './express.js'
import help from './help.js'
import twoFactorAuth from './two-factor-auth.js'
import cashback from './cashback.js'
import security from './security.js'
import register from './register.js'
import login from './login.js'
import forgotPassword from './forgot-password.js'
import pageLogin from './page-login.js'
import ucenterAccount from './ucenter-account.js'
import agent from './agent.js'
import exception from './exception.js'
import finance from './finance.js'
import openPlatform from './open-platform.js'
import dashboard from './dashboard.js'
import recharge from './recharge.js'
import withdrawal from './withdrawal.js'
import messageCenter from './message-center.js'
import invite from './invite.js'
import download from './download.js'
import cooperate from './cooperate.js'
import home from './home.js'
import pricing from './pricing.js'
import state from './state.js'

export default {
  ...common,
  ...express,
  ...help,
  setting,
  menuManagement,
  userManagement,
  groupManagement,
  marketing,
  certify,
  counts,
  twoFactorAuth,
  cashback,
  security,
  register,
  login,
  forgotPassword,
  pageLogin,
  ucenterAccount,
  agent,
  exception,
  finance,
  openPlatform,
  dashboard,
  recharge,
  withdrawal,
  messageCenter,
  invite,
  download,
  cooperate,
  home,
  pricing,
  state,
  card: {
    index: cardIndex,
    detail: cardDetail
  }
}
