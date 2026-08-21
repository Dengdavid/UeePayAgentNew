# applyPreferences 用户偏好方法

本文档说明 `src/utils/preferences.js` 和 `src/utils/preferences-storage.js` 中由偏好页面及全局布局使用的语言、界面国家和时区方法。详细规则以[多语言规范](../多语言规范.md)、[Store 使用规范](../Store使用规范.md)及[安全与数据处理规范](../安全与数据处理规范.md)为准。

## 1. 数据含义

本工具管理的是界面偏好：

```text
language  界面语言
timezone  界面日期和时间使用的 IANA 时区
country   界面国家偏好
```

这些字段不能代表账户国家、居住地、KYC/KYB 地区、税务居民身份或法律资格。

## 2. 规范化方法

```js
import {
  normalizeTimezone,
  normalizeCountry,
  getCountryConfig,
} from '@/utils/preferences.js'
```

| 方法 | 返回 |
| --- | --- |
| `normalizeTimezone(value)` | 有效 IANA 时区字符串，非法值返回 `null` |
| `normalizeCountry(value)` | 已配置的大写国家代码，非法或未知值返回 `null` |
| `getCountryConfig(value)` | 对应国家配置；无效值回退到默认国家配置 |

Locale 规范化统一使用 `src/locales/set.js` 的 `normalizeLocale()`，不要另写平行规则。

## 3. 缓存读取与响应式值

```js
import {
  getCachedLocale,
  getCachedTimezone,
  getCachedCountry,
  timezone,
  country,
} from '@/utils/preferences.js'
```

缓存读取方法返回规范化结果或 `null`；`timezone`、`country` 是当前会话使用的响应式 ref。业务页面应读取这些公开入口，不直接读取内部 localStorage key。

## 4. `applyPreferences(values, options)`

```js
const applied = applyPreferences({
  language: selectedLanguage,
  timezone: selectedTimezone,
  country: selectedCountry,
})
```

| 参数 | 默认值 | 说明 |
| --- | --- | --- |
| `values` | `{}` | 可包含 `language`、`timezone`、`country` |
| `options.persist` | `true` | 是否写入统一偏好缓存 |

方法会规范化输入、更新唯一 Locale 入口、时区和国家 ref，并在允许时统一持久化。返回最终生效的：

```js
{
  language,
  timezone,
  country,
}
```

无效语言回退项目默认 Locale；无效时区回退默认时区；无效国家优先使用已有缓存，再回退默认国家。

## 5. 单项设置与日历日期

```js
setTimezone(value, { persist: false })
setCountry(value, { persist: false })

const today = getCalendarDateInTimezone(new Date(), timezone.value)
```

`setTimezone`、`setCountry` 成功返回 `true`，非法输入返回 `false`。`getCalendarDateInTimezone` 把目标时区中的年月日转换为浏览器本地中午的 `Date`，供只关心日历日期的组件使用，避免时区改变“今天”边界。

## 6. 待同步状态

偏好页面通过以下方法记录服务端同步状态：

```js
import {
  markPreferencesPendingSync,
  clearPreferencesPendingSync,
} from '@/utils/preferences-storage.js'
```

游客或同步失败时可以标记待同步；服务端保存成功后清除标记。页面不得自行创建新的缓存 key 或把个人资料混入偏好对象。

## 7. 清理缓存

`clearBrowserCache()` 会保留当前界面偏好，清理 sessionStorage 和可访问的 Cache Storage。该方法用于现有退出或缓存清理流程，不代表清除了服务端会话，也不能替代 User Store 的标准登出动作。

## 8. 安全与同步边界

- 偏好缓存只保存语言、界面国家和时区，不保存姓名、邮箱、地址、Token、认证资料或资金数据。
- 服务端开放语言和前端可运行 Locale 必须取交集，不能仅凭缓存开放语言。
- 修改同步优先级、失败恢复或登出保留策略时，验证游客、登录、退出重进和跨设备场景。
- 国家偏好不得用于决定服务端数据归属、账户国家、KYC/KYB、地区限制或法律资格。
