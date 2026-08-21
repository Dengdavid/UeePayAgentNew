# decimal.js 数值计算规范

本文档是 `UeePayFrontend` 业务数值计算的统一规范。凡计算结果会影响页面展示、表单值、接口参数、业务判断或用户决策，都必须使用 `decimal.js` 或项目已有的 Decimal 工具，避免 JavaScript `Number` 的浮点误差和隐式类型转换。

## 1. 适用范围

必须使用 `Decimal` 的场景包括：

- 金额、余额、费用、汇率和价格。
- 费率、比例、百分比、折扣和增长率。
- 数量、统计、合计、平均值、最大值、最小值和区间判断。
- 单位换算、权重、评分及其他业务数值。
- 加、减、乘、除、取模、幂、累计、比较、舍入和精度截取。

以下值不属于业务数值计算，可以继续使用原生 `Number`：

- `v-for` 索引、数组位置、循环计数器和组件内部序号。
- 仅用于流程分支的枚举值、状态码和布尔型 `0 / 1`。
- CSS 尺寸、动画时长和不参与业务结果的界面控制参数。
- 日期和时间运算；此类逻辑使用 `date-fns`、`Date` 或项目已有日期工具。

是否使用 Decimal 以“该数值是否参与业务结果”为判断标准，不能因为当前数据看起来是整数就改用原生运算。

## 2. 导入与输入

```js
import Decimal from 'decimal.js'
```

优先使用接口、表单或配置提供的原始数字字符串创建实例，避免数值在进入 Decimal 前已经发生精度损失：

```js
const amount = new Decimal(value ?? '0')
const rate = new Decimal(rateValue ?? '0')
```

禁止先执行 `Number(value)`、`parseFloat(value)` 或原生计算，再把结果传给 Decimal：

```js
// 错误：精度可能在创建 Decimal 前已经丢失
const total = new Decimal(Number(price) * Number(quantity))

// 正确
const total = new Decimal(price ?? '0').times(quantity ?? '0')
```

外部输入可能为空、非数字或无限值时，必须先校验；不能把非法值静默转换为有效业务结果：

```js
const toDecimal = (value, fallback = '0') => {
  try {
    const result = new Decimal(value ?? fallback)
    return result.isFinite() ? result : new Decimal(fallback)
  } catch {
    return new Decimal(fallback)
  }
}
```

使用 fallback 前必须确认业务允许兜底为 `0`；资金、费率或限制值缺失时，如果 `0` 会改变业务含义，应进入错误或不可操作状态。

## 3. 常用计算

### 3.1 加减乘除

```js
const subtotal = new Decimal(price).times(quantity)
const fee = subtotal.times(feeRate).div(100)
const total = subtotal.plus(fee)
const remaining = balance.minus(total)
```

对应方法：

| 运算 | 推荐方法 |
| --- | --- |
| 加法 | `plus()` |
| 减法 | `minus()` |
| 乘法 | `times()` / `mul()` |
| 除法 | `div()` / `dividedBy()` |
| 取模 | `mod()` |
| 幂 | `pow()` |

除法前必须检查除数：

```js
const divisor = new Decimal(count)
if (divisor.isZero()) throw new Error('Divisor cannot be zero')

const average = total.div(divisor)
```

### 3.2 累计与平均值

```js
const total = rows.reduce(
  (result, row) => result.plus(row.amount ?? '0'),
  new Decimal(0)
)

const average = rows.length
  ? total.div(rows.length)
  : new Decimal(0)
```

累计过程必须始终返回 `Decimal`，不能在 `reduce()` 中混用原生 `Number`。

### 3.3 比较与范围

```js
const amount = new Decimal(value)
const min = new Decimal(minValue)
const max = new Decimal(maxValue)

const isValid = amount.greaterThanOrEqualTo(min)
  && amount.lessThanOrEqualTo(max)
```

常用比较方法包括 `equals()`、`greaterThan()`、`greaterThanOrEqualTo()`、`lessThan()` 和 `lessThanOrEqualTo()`。禁止通过减法后判断正负代替明确比较。

最大值和最小值使用：

```js
const maximum = Decimal.max(...values.map(value => new Decimal(value)))
const minimum = Decimal.min(...values.map(value => new Decimal(value)))
```

### 3.4 百分比与比例

```js
const percent = new Decimal(rate).times(100)
const amount = new Decimal(base).times(percentValue).div(100)
const ratio = new Decimal(part).div(total)
```

必须先确认接口中的费率是小数比例（如 `0.025`）还是百分数（如 `2.5`），不得凭页面显示猜测后乘除 `100`。

## 4. 舍入与输出

计算链中保持 `Decimal` 实例，只在展示、表单赋值或接口提交边界转换为字符串：

```js
const result = new Decimal(amount).times(rate)

const rawValue = result.toString()
const displayValue = result.toFixed(2, Decimal.ROUND_HALF_UP)
```

- 精度和舍入模式必须来自接口契约、币种规则或明确业务要求。
- 禁止使用 `Math.round()`、`Math.floor()`、`Math.ceil()` 或原生 `Number.prototype.toFixed()` 生成业务结果。
- 不需要固定小数位时使用 `toString()`；需要固定展示位数时使用 Decimal 的 `toFixed()`。
- 除非第三方组件明确只接受 `Number`，不得使用 `toNumber()`。必须转换时，只能在组件边界转换，并确保该值不会继续参与业务计算或接口提交。

## 5. 表达式计算

需要计算受控的四则运算字符串时，使用项目已有工具：

```js
import {
  evaluateExpression,
  evaluateAndFormat,
} from '@/utils/decimal-expression-evaluator.js'
```

详细参数、支持语法和安全边界见 [evaluateExpression 高精度金额计算方法](./components/evaluateExpression高精度金额计算方法.md)。普通字段计算直接使用 Decimal 方法，不要为了简单加减乘除拼接表达式字符串。

## 6. 服务端与安全边界

- 服务端仍是余额、费用、汇率、限额、资金状态和最终交易结果的权威来源。
- 前端 Decimal 计算只能用于输入校验、预估、展示和已授权的请求参数组装，不能覆盖服务端结果或绕过服务端校验。
- 接口原始数字值应尽量保持字符串形式；格式化后的货币文案、百分号文本或带分隔符字符串不得直接参与计算或回传。
- 错误日志不得输出敏感金额公式、完整交易数据或服务端内部风控规则。

## 7. 检查清单

- [ ] 所有业务数值运算均由 Decimal 方法完成。
- [ ] 没有先转 `Number` 或 `parseFloat` 再计算。
- [ ] 计算过程中没有混用 Decimal 和原生运算符。
- [ ] 除数为零、非法值、空值和无限值有明确处理。
- [ ] 精度与舍入模式来自明确业务规则。
- [ ] 只在展示、表单或接口边界转换输出。
- [ ] 服务端最终结果和权限边界保持不变。
