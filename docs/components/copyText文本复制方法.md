# copyText 文本复制方法

本文档说明 `src/utils/dataInfo.js` 中 `copyText` 的使用契约。复制个人信息、卡片数据或开放平台信息时同时遵守[安全与数据处理规范](../安全与数据处理规范.md)。

## 1. 导入与签名

```js
import { copyText } from '@/utils/dataInfo.js'
```

```text
copyText(text, successMessage, errorMessage) => Promise<Boolean>
```

| 参数 | 默认值 | 说明 |
| --- | --- | --- |
| `text` | - | 要复制的文本；空值直接返回 `false` |
| `successMessage` | `复制成功` | 复制成功提示，业务页面应传入 i18n 文案 |
| `errorMessage` | `复制失败，请手动复制` | 失败提示，业务页面应传入 i18n 文案 |

## 2. 使用示例

```js
const copied = await copyText(
  invitationCode.value,
  t('invite.copySuccess'),
  t('invite.copyFailed'),
)

if (!copied) {
  // 页面可以保留文本供用户手动选择，不重复弹出同类错误提示。
}
```

方法优先使用安全上下文中的 Clipboard API；不可用或被 WebView 拒绝时，自动回退到临时 textarea 和 `document.execCommand('copy')`。方法内部已经展示成功或失败消息。

## 3. 返回值

| 返回值 | 含义 |
| --- | --- |
| `true` | Clipboard API 或兼容方案复制成功 |
| `false` | 输入为空，或全部复制方案失败 |

## 4. 安全边界

- 复制必须由用户明确触发，不在页面加载、接口完成或自动轮询后复制。
- 复制前由业务层完成权限校验和脱敏；`copyText` 不判断数据敏感等级。
- 默认不得复制完整 PAN、CVV、PIN、OTP、证件号、私钥或 Webhook secret。
- 即使服务端已经返回敏感字段，也不能因此跳过权限、2FA、风控或短生命周期要求。
- 不把复制内容写入 Console、日志、埋点、URL、Store 或错误提示。

卡片账单摘要应优先使用 `src/utils/card.js` 的 `copyCard()`，由其统一执行卡号脱敏和多语言字段拼装。
