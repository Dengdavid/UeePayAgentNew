
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

const whiteRouteNames = routeNames([...whiteRoutes, ...errorRoutes]);

const loginUnableRouteNames = loginUnableRoutes.map(item => item.name);

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
const errorRoutesName = routeNames(errorRoutes)

const updateDocumentTitle = (route) => {
  const routeTitle = route.meta?.titleKey ? t(route.meta.titleKey) : route.meta?.title
  const siteName = t('route.siteName')
  window.document.title = routeTitle ? `${routeTitle} | ${siteName}` : siteName
}

router.beforeEach(async (to, from, next) => {
  const token = Cookies.get('token')
  if (to.path === '/certify' && !token) {
    next({ name: 'home' })
    return false
  }
  if (whiteRouteNames.indexOf(to.name) === -1) {
    // 不在白名单内
    if (token) {
      // 已登录不能访问登录、注册等页面
      if (loginUnableRouteNames.indexOf(to.name) !== -1) {
        next({ name: 'home' })
        return false
      }
    } else {
      if (loginUnableRouteNames.indexOf(to.name) === -1) {
        localStorage.setItem('TOROUTENAME',to.name)
        next({ name: 'login'})
        return false
      }
    }
  } else {
    if (to.name === 'card' && !token) {
      localStorage.setItem('TOROUTENAME',to.name)
      next({ name: 'login'})
      return false
    }
  }
  updateDocumentTitle(to)
  next()
})

watch(locale, () => {
  updateDocumentTitle(router.currentRoute.value)
}, { flush: 'post' })

export default router
