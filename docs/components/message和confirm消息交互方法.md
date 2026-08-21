# message 和 confirm 消息交互方法

本文档说明 `src/utils/message.js` 暴露的消息提示、确认弹窗、文本确认和持续 loading 方法。公开文案必须使用现有 i18n，敏感信息展示遵守[安全与数据处理规范](../安全与数据处理规范.md)。

## 1. 导入

```js
import {
  message,
  confirm,
  confirmInput,
  messageLoading,
} from '@/utils/message.js'
```

`message`、`confirm`、`messageLoading` 也由 `@/utils` 聚合导出；`confirmInput` 当前需要从 `@/utils/message.js` 导入。

## 2. `message(text, type, config)`

```js
message(t('common.saved'))
message(t('common.saveFailed'), 'error')
message(t('common.notice'), 'info', { duration: 8 })
message(error, 'error')
```

| 参数 | 默认值 | 说明 |
| --- | --- | --- |
| `text` | - | 用户可见文案或错误对象；错误对象优先读取 `msg` / `message`，空值、`SILENT_ERROR` 和 `silent: true` 不展示 |
| `type` | `success` | View UI Plus 消息类型，如 `success`、`error`、`warning`、`info` |
| `config` | `{}` | 覆盖消息配置；默认持续 5 秒 |

不得把服务端堆栈、完整请求体、Token、OTP、PAN、CVV、证件资料或密钥直接作为 `text` 展示。

## 3. `confirm(text, options)`

```js
await confirm(t('example.confirmDelete'), {
  title: t('example.deleteTitle'),
  okText: t('button.confirm'),
  cancelText: t('button.cancel'),
})
```

支持的 `options`：

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `title` | `String` | 弹窗标题，默认使用系统“提示”文案 |
| `okText` | `String` | 确认按钮文案 |
| `cancelText` | `String` | 取消按钮文案 |
| `resolveCancel` | `Boolean` | 为 `true` 时取消操作返回 `false` |

默认模式只在确认时 `resolve(true)`；取消不会 resolve 或 reject。仅需执行确认动作的旧调用可以继续使用 `.then()`。依赖取消分支恢复页面状态时，必须设置 `resolveCancel: true`：

```js
const confirmed = await confirm(t('example.confirmReset'), {
  resolveCancel: true,
})

if (!confirmed) return
```

## 4. `confirmInput(title, modelValue, options)`

```js
const result = await confirmInput(t('example.name'), currentName, {
  placeholder: t('placeholder.inputPlaceholder'),
  pattern: /^[A-Za-z0-9_-]+$/,
  msg: t('example.invalidName'),
})

if (result) {
  await saveName(result.value)
  result.close()
}
```

当输入值发生变化且校验通过时，Promise 返回：

```js
{
  value: 'trimmed value',
  close: Function,
}
```

调用方完成异步保存后必须执行 `close()`。`allowEmpty: true` 允许空字符串；`pattern` 用于非空内容校验。取消或值未变化时，当前实现不会返回业务结果，调用方不得依赖其进入后续流程。

## 5. `messageLoading(text, options)`

```js
const closeLoading = messageLoading(t('common.loading'))

try {
  await loadData()
} finally {
  closeLoading()
}
```

该方法创建持续时间为 `0` 的 loading 消息，并返回关闭函数。关闭动作应放在 `finally`，避免失败后 loading 残留。

## 6. 交互边界

- 危险操作文案必须说明对象和后果，不能只写“是否确认操作”。
- 异步提交的 loading 不替代按钮 disabled 和服务端幂等。
- 认证、卡状态、资金或敏感信息操作不能仅靠前端确认框建立权限边界。
- 修改 Promise 的确认或取消语义会影响大量调用方，必须保持兼容或同步迁移。
