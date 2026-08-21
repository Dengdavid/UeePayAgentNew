import { Message } from 'view-ui-plus'
import router from '@/router/index.js'
import { useUserStore } from '@/store/user.js'
import { debounce } from '@/libs/tools.js'

const notifyAndRedirectLogout = debounce(function(msg) {
  if (msg) Message.error(msg)
  router.push({ name: 'login' })
}, 300)

export function handleLegalBlock(responseData) {
  const userIp = localStorage.getItem('USERID')
  const routerName = router.currentRoute.value.name

  if (!userIp && responseData.msg) {
    localStorage.setItem('USERID', responseData.msg)
  }
  if (routerName && routerName !== 'error_451') {
    router.push({ name: 'error_451' })
  }
}

export function handleRateLimit(responseData) {
  if (!responseData.msg) return

  Message.error({
    content: responseData.msg,
    duration: 3,
    closable: true,
  })
}

export function handleLogout(message) {
  const userStore = useUserStore()
  userStore.logout()

  if (router.currentRoute.value.name === 'login') return false
  notifyAndRedirectLogout(message)
  return true
}

export function handleNetworkError(error) {
  const url = error.config?.url || ''
  const isPollingApi = url.includes('/user/unReadMessageCount')

  if (isPollingApi) {
    Message.error('轮询接口网络错误')
  } else {
    Message.error('网络连接失败，请检查网络设置')
    router.push({ name: 'error_404' })
  }
}
