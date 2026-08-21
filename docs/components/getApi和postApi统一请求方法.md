# getApi 和 postApi 统一请求方法

本文档说明业务页面通过 `src/utils/api.js` 使用统一 GET、POST 请求的方法契约。完整请求生命周期、取消、重试、2FA 和错误处理以[请求封装规范](../请求封装规范.md)及[安全与数据处理规范](../安全与数据处理规范.md)为准。

## 1. 实现与导入

```text
src/utils/api.js
src/api/api.js
src/api/request.js
```

推荐按需导入：

```js
import { getApi, postApi } from '@/utils/api.js'
```

项目也通过 `@/utils` 聚合导出这两个方法，现有页面可以继续使用：

```js
import { getApi, postApi } from '@/utils'
```

## 2. `getApi(url, data)`

```js
const result = await getApi('/help/list', {
  page: 1,
  keyword: searchKeyword,
})
```

| 参数 | 类型 | 说明 |
| --- | --- | --- |
| `url` | `String` | 接口路径 |
| `data` | `Object` | 查询参数；字段值为 `null`、`undefined`、空字符串以及字段名为 `total` 的内容不会进入最终 query |

返回统一请求层解析后的 Promise 结果。参数会经过 `encodeURIComponent` 编码，不应由页面手工拼接 query。

当前 `getApi` 只接收 `url` 和 `data`。需要传入 `requestPolicy` 等高级配置时，应使用对应 API 模块通过统一 `request` 入口实现，不给 `getApi` 临时增加未支持的第三个参数。

## 3. `postApi(url, data, config)`

```js
const result = await postApi('/example/save', formData, {
  requestPolicy: {
    takeLatestKey: 'example-save',
  },
})
```

| 参数 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `url` | `String` | - | 接口路径 |
| `data` | `*` | - | 请求体 |
| `config` | `Object` | `{}` | 传递给统一请求层的配置 |

`config` 会与 `{ url, method: 'post', data }` 合并。页面不得借此绕过统一认证、2FA、限流、地区限制或错误处理。

## 4. 调用边界

- GET 查询可以由统一请求策略处理安全的超时重试；POST 默认不得自动重试。
- 资金、卡状态、认证和其他非幂等提交必须保留 loading、防重复提交和服务端幂等边界。
- 请求失败由调用方根据页面交互使用 `try/catch` 或现有 Promise 链处理，不把失败改写成成功结果。
- Token、OTP、PAN、CVV、证件资料、密钥和 KYC 文件地址不得进入 URL、日志或错误提示。
- 不直接使用原始 axios，也不直接导入 `src/api/request/*` 内部模块。

## 5. 常见错误

```js
// 错误：手工拼接未编码参数
getApi(`/help/list?keyword=${keyword}`)

// 正确
getApi('/help/list', { keyword })
```

```js
// 错误：用自动重试弥补非幂等提交失败
postApi('/card/freeze', data, {
  requestPolicy: { retryOnTimeout: true },
})
```

## 6. 修改与验证

修改 `getApi`、`postApi` 或底层请求契约前，必须检查直接调用方，并按照请求风险完成取消、超时、2FA 重放、错误状态和重复提交验证。
