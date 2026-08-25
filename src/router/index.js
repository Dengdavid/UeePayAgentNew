
import { createRouter, createWebHistory } from "vue-router";
import {
  routers,
  whiteRoutes,
  loginUnableRoutes,
  errorRoutes,
} from "./router.js";
import { watch } from 'vue'
import Cookies from 'js-cookie'
import { t } from '@/utils/index.js'
import { locale } from '@/locales/set.js'
import { useUserStore } from '@/store/user.js'
import { tokenName } from "@systemConfig";
const routeNames = (arr) => {
  const _arr = []
  arr.map((item) => {
    _arr.push(item.name)
    if (item.children?.length > 0) {
      const childrenArr = item.children.map((el) => el.name)
      _arr.push(...childrenArr)
    }
  })
  return _arr
}

const whiteRouteNames = new Set(routeNames([...whiteRoutes, ...errorRoutes]));

const loginUnableRouteNames = new Set(loginUnableRoutes.map(item => item.name));

const router = createRouter({
  history: createWebHistory(),
  routes: routers,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    }
    // 如果是从不同路由跳转，或 query/hash 变化，都滚到顶部
    if (to.path !== from.path || to.query.id !== from.query.id) {
      return { top: 0 }
    }
    return false
  },
})
const updateDocumentTitle = (route) => {
  const routeTitle = route.meta?.titleKey ? t(route.meta.titleKey) : route.meta?.title
  window.document.title = routeTitle || ''
}

router.beforeEach(async (to) => {
  const token = Cookies.get(tokenName)
  const isWhiteRoute = whiteRouteNames.has(to.name)
  const isLoginUnableRoute = loginUnableRouteNames.has(to.name)

  if (!isWhiteRoute && token && isLoginUnableRoute) {
    return { name: 'home' }
  }

  if (!isWhiteRoute && !token && !isLoginUnableRoute) {
    return { name: 'login' }
  }

  if (to.matched.some((record) => record.meta.requiresAdmin)) {
    const userStore = useUserStore()
    if (!Object.prototype.hasOwnProperty.call(userStore.user, 'is_admin')) {
      await userStore.getUserInfo()
    }
    if (!userStore.user.is_admin) {
      return { name: 'error_404', replace: true }
    }
  }

  updateDocumentTitle(to)
  return true
})

watch(locale, () => {
  updateDocumentTitle(router.currentRoute.value)
}, { flush: 'post' })

export default router
