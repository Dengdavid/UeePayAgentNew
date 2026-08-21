
import router from '@/router/index'
import { useRoute,useRouter } from 'vue-router'

const ROUTE_DATA_TYPES = ['query', 'params']
const RETURN_ROUTE_CONSUMER_NAMES = ['login', 'register']
const hasDynamicIdParam = route => route.matched.some(
  record => /(^|\/):id(\/|$)/.test(record.path)
)

// 仅允许站内跳转使用 query / params，避免调用方传入任意 key 生成不可预期的路由对象。
const getRouteDataType = (type) => {
  return ROUTE_DATA_TYPES.includes(type) ? type : 'query'
}

// Vue Router 在重复跳转时可能抛出导航失败，也可能触发页面重复请求。
// 工具层统一拦截相同 fullPath 的跳转，业务层无需重复判断。
const isSameRoute = (target) => {
  const current = router.currentRoute.value
  return router.resolve(target).fullPath === current.fullPath
}

/**
 * 站内页面跳转入口。
 *
 * 约束：
 * - 业务组件内优先使用该方法，不直接调用 router.push / router.replace。
 * - name 必须是路由表中定义的命名路由，不传 path 字符串。
 * - data 不得包含 token、密钥、完整证件号、PAN、CVV、OTP 等敏感信息。
 * - 登录、登出、认证完成、错误页、清理一次性 query 等流程建议传 { replace: true }。
 *
 * @param {string} name - 目标路由 name。
 * @param {object} data - query 或 params 参数。
 * @param {'query' | 'params'} type - 参数类型，非法值会回退为 query。
 * @param {object} options - 跳转选项。
 * @param {boolean} options.replace - 是否使用 router.replace 替换当前历史记录。
 * @returns {Promise|void}
 */
export const toRoute = (name, data = {},type='query', options = {}) => {
  const routeType = getRouteDataType(type)
  const target = { name, [routeType]: data || {} }
  if (isSameRoute(target)) return Promise.resolve()
  const targetRoute = router.resolve(target)
  const replace = options.replace || (
    router.currentRoute.value.name === targetRoute.name &&
    hasDynamicIdParam(targetRoute)
  )
  return replace ? router.replace(target) : router.push(target)
}
/**
 * 安全返回上一页。
 *
 * 说明：
 * - 模板中可直接写 @click="goBack"，函数会自动识别并忽略 MouseEvent。
 * - 登录 / 注册成功后显式调用 goBack() 时，会优先消费 router.beforeEach 写入的 TOROUTENAME。
 * - 没有可返回的站内历史记录时，使用 fallback 作为降级页面。
 *
 * @param {string | object} [fallback] - 降级路由，详情页建议传对应列表页，默认首页。
 * @returns {void}
 */
export const goBack = (fallback = { name: 'home' }) => {
  // 1. 基础环境校验
  if (typeof window === 'undefined') return;

  // 防御：如果是在模板中绑定的 @click，fallback 会是 MouseEvent 或 PointerEvent
  const isEvent = fallback && (fallback instanceof Event || fallback.type);
  if (isEvent) {
    fallback = { name: 'home' };
  }

  // 同一个 /:id 详情内切换记录时由 toRoute 使用 replace，只保留一条详情历史。
  // 返回时优先回到进入详情前的页面；直接打开详情且没有历史时使用 fallback。
  if (hasDynamicIdParam(router.currentRoute.value)) {
    const hasHistory = window.history.state && window.history.state.back;
    if (hasHistory) {
      router.back();
      return;
    }
    const fallbackRoute = typeof fallback === 'string'
      ? { name: fallback }
      : (fallback || { name: 'home' });
    router.replace(fallbackRoute);
    return;
  }

  // 只有登录或注册成功后显式调用 goBack() 时，才消费 TOROUTENAME。
  if (
    !isEvent &&
    RETURN_ROUTE_CONSUMER_NAMES.includes(router.currentRoute.value.name)
  ) {
    const toName = localStorage.getItem('TOROUTENAME')
    if(toName){
      localStorage.removeItem('TOROUTENAME')
      router.replace({name:toName})
      return
    }
  }

  // 如果传入的是字符串，说明组件（如 UiPage）明确指定了返回路由名称（backName）
  // 此时应当拥有最高优先级，直接强制跳转，避免 router.back() 导致的不可控回退
  if (typeof fallback === 'string') {
    router.replace({ name: fallback });
    return;
  }

  // 2. 判断 Vue Router 的内部历史记录栈中是否有上一页
  const hasHistory = window.history.state && window.history.state.back;

  // 3. 只有当内部有上一页记录时，才执行返回
  if (hasHistory) {
    // 检查上一页的路径是否和当前页完全一样（只是 query 改变）
    // 如果一样，一直调用 router.back() 会让用户觉得“一直返回当前页面”出不去
    const currentPath = router.currentRoute.value.path;
    const backPath = window.history.state.back.split('?')[0].split('#')[0];

    if (backPath === currentPath && fallback && fallback.name) {
      router.replace(fallback);
    } else {
      router.back();
    }
  } else {
    // 4. 降级处理：跳转到指定的备用页面
    router.replace(fallback);
  }
};
/**
 * 获取当前路由 query。
 *
 * 注意：该方法返回的是当前快照对象，不是响应式 hook。
 * 如果需要监听路由变化，应在组件内使用 watch 或直接读取 useRoute()。
 */
export const useRouteQuery=()=>{
  return router.currentRoute.value.query
}

/**
 * 获取当前路由 params。
 *
 * 注意：该方法返回的是当前快照对象，不是响应式 hook。
 * 如果需要监听路由变化，应在组件内使用 watch 或直接读取 useRoute()。
 */
export const useRouteParams=()=>{
  return router.currentRoute.value.params
}

// 统一替换当前 query，同时保留当前 route name、params 和 hash，避免清理 query 时丢失页面上下文。
const replaceQuery = (query = {}) => {
  const route = router.currentRoute.value
  const target = {
    name: route.name,
    params: route.params,
    query,
    hash: route.hash
  }
  if (isSameRoute(target)) return Promise.resolve()
  return router.replace(target)
}

/**
 * 清空当前页面全部 query。
 *
 * 新代码需要清空全部 query 时优先使用该方法，不依赖 removeQuery() 空参数的历史行为。
 */
export const clearQuery=()=>{
  return replaceQuery({})
}

/**
 * 移除当前页面指定 query。
 *
 * 兼容历史行为：
 * - removeQuery() 空参数会清空全部 query。
 * - 新代码清空全部 query 应使用 clearQuery()，语义更明确。
 *
 * @param {string | string[] | null} keys - 要移除的 query key。
 */
export const removeQuery=(keys = null)=>{
  const route = router.currentRoute.value
  // 兼容历史调用：removeQuery() 表示清空全部 query。新代码优先使用 clearQuery()。
  if (!keys) {
    return clearQuery()
  }
  const query = {
    ...route.query
  }
  const removeKeys =
    Array.isArray(keys)
      ? keys
      : [keys]
  removeKeys.forEach(key=>{
    delete query[key]
  })
  return replaceQuery(query)
}

export {
  // 仅供请求拦截器、store、路由守卫、路由配置和少数复杂组件使用。
  // 普通组件跳转优先使用 toRoute / goBack / removeQuery / clearQuery。
  useRoute,
  useRouter
}
