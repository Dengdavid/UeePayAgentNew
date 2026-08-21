# toRoute 路由辅助方法

本文档说明 `src/utils/route.js` 中由业务页面直接使用的命名路由跳转、回退和参数辅助方法。详细规则以[路由规范](../路由规范.md)为准。

## 1. 导入

```js
import {
  toRoute,
  goBack,
  useRouteQuery,
  useRouteParams,
  clearQuery,
  removeQuery,
  useRoute,
} from '@/utils/route.js'
```

## 2. `toRoute(name, data, type, options)`

```js
toRoute('card_detail', { id: row.id }, 'params')
toRoute('login', { redirect: 'ucenter' }, 'query', { replace: true })
```

| 参数 | 默认值 | 说明 |
| --- | --- | --- |
| `name` | - | 路由表中的命名路由，不传 path |
| `data` | `{}` | query 或 params 数据 |
| `type` | `query` | 只接受 `query`、`params`；非法值回退为 `query` |
| `options.replace` | `false` | 使用 `router.replace` 替代 `router.push` |

相同 `fullPath` 会直接返回已完成 Promise，避免重复导航。动态 `/:id` 详情页内切换记录时会自动使用 replace，防止浏览器历史堆积多个同类详情。

## 3. `goBack(fallback)`

```vue
<Button @click="goBack">{{ $t('button.back') }}</Button>
```

```js
goBack({ name: 'card_list' })
goBack('ucenter_card')
```

方法会忽略模板自动传入的点击事件。有可用站内历史时返回上一页；没有历史、详情页直接打开或当前 query 历史不适合返回时，使用 `fallback`，默认回到 `home`。

详情页、结果页和操作页应显式提供稳定 fallback。

## 4. 参数快照

```js
const query = useRouteQuery()
const params = useRouteParams()
```

两者返回调用时的当前快照，不是响应式 hook。需要响应参数变化时使用：

```js
const route = useRoute()
const id = computed(() => route.params.id)
```

## 5. Query 清理

```js
await removeQuery('dialog')
await removeQuery(['dialog', 'step'])
await clearQuery()
```

`removeQuery(keys)` 只移除指定字段，并保留 route name、params、其他 query 和 hash。`removeQuery()` 空参数清空全部 query 是历史兼容行为；新代码清空全部 query 使用 `clearQuery()`。

## 6. 安全与兼容边界

- query、params 和 hash 不得携带 Token、密钥、完整证件号、PAN、CVV、OTP 或 KYC 文件地址。
- 登录、登出、认证完成、错误页和一次性参数清理等不应返回旧页面的流程使用 replace。
- 外部链接、下载、协议文件、第三方认证和支付不使用 `toRoute`，但必须执行协议、域名和参数校验。
- 普通页面不直接调用 `router.push`、`router.replace` 或 `window.location` 实现站内跳转。
- 修改清理或回退语义前必须搜索全部调用方，避免破坏 tabs、列表筛选和详情返回。
