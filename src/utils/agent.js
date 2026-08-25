import { useAppStore } from '@/store/app.js'
import i18n from '@/locales/index.js'

export const getConfig = () => {
  return useAppStore().configDatas || {}
}
export const agentMenus = () => {
  return useAppStore().menus || []
}
//在线客服
export const handlGoCustomer = ()=>{
  const url = getConfig().customer_link
  if (url) window.open(url, '_blank')
}
//渠道名称
export const agentName = ()=>{
  return getConfig().site_name || i18n.global.t('menu.manage')
}
//渠道网址
export const agentUrl = ()=>{
  return getConfig().site_domain
}
//渠道Logo
export const agentLogo = ()=>{
  return getConfig().site_logo
}
//邮箱
export const agentMailbox = ()=>{
  return getConfig().email
}
//返回主页
export const agentGoHome = (toUrl)=>{
  const url = getConfig().source_url
  if(url){
    window.location.href=url
  }else if(toUrl){
    window.location.href=toUrl
  }
}

//代理商参数
export const agentData = ()=>{
  return getConfig()
}