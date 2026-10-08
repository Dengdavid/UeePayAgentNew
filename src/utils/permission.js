import pinia from '@/store/index.js'
import { useUserStore } from '@/utils/store'

export const hasPermission = (code) => {
  if (!code) return true
  const permissionCodes = useUserStore(pinia).user?.permission_codes
  return typeof code === 'string' && Array.isArray(permissionCodes) && permissionCodes.includes(code)
}

export const hasRoutePermission = (route) => {
  if (route?.meta?.disallowSubAccount && useUserStore(pinia).user?.parent_uid) return false
  return !route?.meta?.permissionCodes || route.meta.permissionCodes.every(hasPermission)
}

const mainAccountMenus = ['pricing', 'ucenterCashback', 'ucenter_agent', 'ucenterOpenPlatform', 'ucenter_invite', 'certify']

export const hasMenuPermission = (route) => {
  if (useUserStore(pinia).user?.parent_uid && mainAccountMenus.includes(route?.name)) return false
  return hasRoutePermission(route)
}

// 子账号操作权限同时要求对应卡片的页面访问权限。
export const hasCardPermission = (action, shared = false) => {
  if (shared && ['recharge', 'withdraw'].includes(action)) return false
  const user = useUserStore(pinia).user
  if (!user?.id) return false
  if (!user.parent_uid) return true
  const prefix = shared ? 'shared_card' : 'card'
  return hasPermission(`${prefix}.view`) && hasPermission(`${prefix}.${action}`)
}
