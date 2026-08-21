# regexFun 动态字段校验方法

本文档说明 `src/utils/regex.js` 中由业务页面直接使用的 URL、单值和逗号分隔动态字段校验方法。前端校验只改善交互，不能替代服务端验证。

## 1. `isUrl(val)`

```js
import { isUrl } from '@/utils/regex.js'

const valid = isUrl('https://www.example.com/path')
```

只接受带 `http` 或 `https` 协议且包含主机名的 URL，并明确拒绝以 IPv4 或 IPv6 地址作为 hostname。query 和 fragment 可以存在。

外链、回调地址和下载 URL 除格式校验外，仍需按业务执行域名、协议和来源白名单校验；`isUrl()` 本身不判断目标域名是否可信。

## 2. `isRegex(val, regexType, regexText)`

```js
import { isRegex } from '@/utils/regex.js'

isRegex(value, 'email')
isRegex(value, 'postal_code')
isRegex(value, '', customPattern)
```

空值返回 `true`，必填由表单的 required 规则单独处理。

| `regexType` | 当前规则 |
| --- | --- |
| `postal_code` | 3～10 位，以字母或数字开头，后续允许字母、数字、空格和连字符 |
| `email` | 使用 `validator.isEmail` |
| `website` | 调用 `isUrl` |
| `ssn` | 校验带连字符的美国 SSN 基础格式，并排除部分非法号段 |
| 其他 | 有 `regexText` 时使用 `validator.matches`；否则视为通过 |

## 3. `regexFun(val, regexType, regexText)`

```js
import { regexFun } from '@/utils/regex.js'

const valid = regexFun(
  'first@example.com,second@example.com',
  'email',
)
```

`regexFun` 将逗号分隔字符串拆分、去除首尾空格和空项，然后要求每一项都通过 `isRegex`。输入为空时返回 `true`。

## 4. 校验边界

- required、长度、业务唯一性和服务端规则必须分别校验，不能因为 `regexFun()` 返回 `true` 就认为字段完整有效。
- 动态 `regexText` 必须来自可信业务配置；不要把用户输入直接当作正则表达式。
- 前端不得通过调整校验规则绕过 KYC/KYB、认证、地区限制或服务端字段要求。
- 校验错误提示应说明修正方式，不展示服务端内部正则或风控规则。
- URL 格式有效不代表地址安全，也不允许在 URL 中携带 Token、OTP、证件资料或密钥。
