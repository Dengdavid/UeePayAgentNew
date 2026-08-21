# useStoreRefs 状态访问方法

本文档说明 `src/utils/store.js` 提供的 Pinia 访问辅助方法。Store 职责、持久化和敏感数据规则以[Store 使用规范](../Store使用规范.md)及[安全与数据处理规范](../安全与数据处理规范.md)为准。

## 1. 读取响应式状态

```js
import {
  useUserStoreRefs,
  useAppStoreRefs,
  useCardStoreRefs,
} from '@/utils/store.js'

const { user, isLogin } = useUserStoreRefs()
const { customerUrl } = useAppStoreRefs()
const { bins, binMaps } = useCardStoreRefs()
```

| 方法 | Store | 适用数据 |
| --- | --- | --- |
| `useUserStoreRefs()` | User Store | 登录状态、用户信息、用户组、邀请链接、未读消息等 state/getter |
| `useAppStoreRefs()` | App Store | 客服链接、公告、站点配置、国家地区等展示数据 |
| `useCardStoreRefs()` | Card Store | Card BIN 列表与映射等展示数据 |

这些方法内部使用 `storeToRefs`，适合解构响应式 state 和 getter，不用于调用 action。

## 2. 调用 Store Action

```js
import { useUserStore } from '@/utils/store.js'

const userStore = useUserStore()
await userStore.getUserInfo()
```

需要登录、登出、初始化、刷新数据或执行其他 action 时，使用原始 Store hook：

```js
useUserStore()
useAppStore()
useCardStore()
```

不要从 `useXxxStoreRefs()` 返回结果上调用 action，也不要为了读取少量字段而获取并修改完整 Store 实例。

## 3. `useStores()`

```js
import { useStores } from '@/utils/store.js'

const { user, app, card } = useStores()
```

`useStores()` 返回当前登记的全部 Store 实例，只适用于确实需要跨多个 Store 的工具或复杂组件。普通业务页面优先选择具体的 refs 或 Store hook，避免扩大响应依赖和误改共享状态。

## 4. 数据边界

- Store 不是服务端权限边界，不能依赖本地状态决定数据归属、认证结果、卡状态或资金结果。
- Token 只沿用当前 Cookie 认证，不写入可持久化 Store。
- 完整 PAN、CVV、OTP、证件信息、KYC 文件地址、密钥、余额和易过期金融数据不得持久化。
- 页面局部状态留在页面组件，不因为多个函数使用就自动进入全局 Store。
- 不在 Pinia 尚未初始化的模块顶层随意创建 Store 实例。

## 5. 扩展规则

新增全局 Store 时必须同步更新：

1. `storeFactories` 的名称和 Store hook。
2. 对应的 `useXxxStoreRefs()` 方法。
3. 文件底部原始 Store hook 导出。
4. `docs/Store使用规范.md` 中的职责和持久化边界。
