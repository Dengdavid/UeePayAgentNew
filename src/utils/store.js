import { storeToRefs } from 'pinia'
import { useAppStore } from '@/store/app'
import { useCardStore } from '@/store/card'
import { useUserStore } from '@/store/user'

// 全局 Store 统一登记入口。
// 新增全局 Store 时，需要同步补充：
// 1. storeFactories 中的 key 和 useXxxStore。
// 2. 对应的 useXxxStoreRefs() 便捷方法。
// 3. 文件底部的 useXxxStore 导出。
const storeFactories = {
  user: useUserStore,
  app: useAppStore,
  card: useCardStore
}

// 只用于读取响应式 state / getter。
// 需要调用 action 或执行登录、登出、初始化等副作用时，请直接使用 useXxxStore()。
const useStoreRefs = (useStore) => storeToRefs(useStore())

/**
 * 获取所有 Store 实例。
 *
 * 适用场景：
 * - 工具函数或复杂组件确实需要同时访问多个 Store。
 *
 * 注意：
 * - 普通页面只读取少量字段时，优先使用 useXxxStoreRefs()。
 * - 不要为了少量字段取出全部 Store，避免扩大响应依赖和误改共享状态。
 */
export const useStores = () =>
  Object.entries(storeFactories).reduce((stores, [key, useStore]) => {
    stores[key] = useStore()
    return stores
  }, {})

/**
 * 获取 User Store 响应式 state / getter。
 *
 * 用于读取登录状态、用户信息、用户组、邀请链接、未读消息等响应式字段。
 * 如需调用 login、logout、init、刷新未读消息等 action，请使用 useUserStore()。
 * 不要在 Store 中保存完整 PAN、CVV、OTP、证件信息、KYC 文件地址、开放平台密钥等敏感信息。
 */
export const useUserStoreRefs = () => useStoreRefs(useUserStore)

/**
 * 获取 App Store 响应式 state / getter。
 *
 * 用于读取客服链接、公告、站点配置、国家地区等全局展示数据。
 * 如需初始化或刷新站点配置，请使用 useAppStore() 调用对应 action。
 */
export const useAppStoreRefs = () => useStoreRefs(useAppStore)

/**
 * 获取 Card Store 响应式 state / getter。
 *
 * 用于读取 Card BIN 列表、BIN 映射等展示数据。
 * 如需初始化或刷新卡相关缓存，请使用 useCardStore() 调用对应 action。
 * Store 中不得保存完整卡号、CVV、OTP 等卡片私密信息。
 */
export const useCardStoreRefs = () => useStoreRefs(useCardStore)

export {
  // 导出原始 Store hooks 供 action / 副作用调用。
  // 组件内只读取响应式字段时，优先使用上方 useXxxStoreRefs()。
  useUserStore,
  useAppStore,
  useCardStore
}
