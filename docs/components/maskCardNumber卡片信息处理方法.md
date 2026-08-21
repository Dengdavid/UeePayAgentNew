# maskCardNumber 卡片信息处理方法

本文档说明 `src/utils/card.js` 中业务页面直接使用的卡号脱敏和账单摘要复制方法。卡片私密信息的展示、权限和复制边界以[安全与数据处理规范](../安全与数据处理规范.md)为准。

## 1. `maskCardNumber(cardNumber)`

```js
import { maskCardNumber } from '@/utils/card.js'

const cardNumber = maskCardNumber(row.card_no)
```

方法会：

1. 将输入转换为字符串并去除首尾空白。
2. 忽略空格和连字符后检查是否为 12～19 位纯数字。
3. 对符合条件的完整数字卡号保留前 6 位和后 4 位，中间替换为 6 个 `*`。
4. 已脱敏值或未知格式保持原样，避免对服务端展示值做错误重排。

示例：

```text
1234567890123456 -> 123456******3456
1234 **** **** 5678 -> 保持原样
```

返回值始终为字符串。该方法只负责展示脱敏，不能证明调用方拥有查看完整 PAN 的权限。

## 2. `copyCard(row)`

```js
import { copyCard } from '@/utils/card.js'

copyCard(billRow)
```

该方法生成多语言账单摘要并通过 `copyText()` 复制，当前包含：

- 账单 ID、交易时间。
- 经 `maskCardNumber()` 处理的卡号。
- 状态和交易类型的多语言文案；未知服务端枚举保留原值。
- 交易金额、订单金额和币种。
- 商户名称、商户国家及详情。

金额使用接口原值，不在复制工具内执行 JavaScript 浮点运算。`copyCard` 当前不返回复制 Promise；调用方不应据此自行展示第二条成功提示。

## 3. 相关映射

`statusOptions`、`transactionStatusValues`、`transactionTypeValues` 和 `statusKeyMap` 是账单筛选及展示的配套映射，不是服务端状态权限来源。新增服务端枚举时，需要同步检查语言包、筛选项、状态组件和未知值回退。

## 4. 安全边界

- 页面不得为了显示统一而把已脱敏服务端值还原、补齐或猜测为完整卡号。
- 完整 PAN reveal 必须依赖服务端授权；前端脱敏函数不能替代权限和 2FA。
- CVV、PIN 和 OTP 不得进入该工具、复制摘要、Toast 或日志。
- 复制动作必须由用户主动触发，并保持页面原有风控和权限流程。
