# evaluateExpression 高精度金额计算方法

本文档说明 `src/utils/decimal-expression-evaluator.js` 的高精度四则运算方法。该工具使用 `decimal.js`，用于避免 JavaScript 浮点误差；通用业务数字计算遵守 [decimal.js 数值计算规范](../decimal.js数值计算规范.md)，服务端仍是费用、余额和资金结果的最终来源。

## 1. 导入

```js
import {
  evaluateExpression,
  evaluateAndFormat,
} from '@/utils/decimal-expression-evaluator.js'
```

## 2. `evaluateExpression(expr)`

```js
const result = evaluateExpression('10 + 10 / 3')
const rawValue = result.toString()
```

| 输入 | 返回 |
| --- | --- |
| 只包含数字、小数点、`+ - * / ( )` 的字符串 | `Decimal` 实例 |
| 非字符串、空表达式、非法字符、无效数字、括号不匹配、除数为 0 | 抛出错误 |

方法使用 60 位有效数字和 `Decimal.ROUND_HALF_UP`。调用方不得把用户任意文本直接作为表达式，必须限制输入来源和字符范围。

## 3. `evaluateAndFormat(expr, dp)`

```js
evaluateAndFormat('10 + 10 / 3', 2) // "13.33"
evaluateAndFormat('10.5000', 'auto') // "10.5"
evaluateAndFormat('10 / 3', null) // 完整高精度字符串
```

| `dp` | 输出规则 |
| --- | --- |
| `Number` | 使用 `toFixed(dp)` 输出固定位数并四舍五入 |
| `auto` | 默认行为，去除尾随零 |
| `null` 或其他非数字且非 `auto` 的值 | 返回 Decimal 的完整字符串形式 |

省略 `dp` 或显式传入 `undefined` 时，会应用默认值 `auto`。

返回值始终是字符串，适合表单展示或继续传给 Decimal。不要为了计算再转换为 JavaScript `Number`。

## 4. 支持与限制

支持：

- 加、减、乘、除。
- 括号和标准运算优先级。
- 表达式开头或左括号后的负数。

不支持：

- 百分号、指数、科学计数法和函数调用。
- 隐式乘法或货币符号。
- 对服务端资金结果进行授权性重算或覆盖。

## 5. 资金边界

- 费用预估和展示计算可以使用本工具，最终扣款、余额、汇率和交易结果以服务端为准。
- 输入金额、费率和精度规则必须来自明确业务契约，不能凭页面展示猜测。
- 捕获计算错误时使用正式的用户提示，不把表达式、服务端内部公式或敏感业务规则写入日志。
- 修改全局 Decimal 精度、舍入模式或语法会影响全部调用方，必须作为资金相关变更独立验证。
