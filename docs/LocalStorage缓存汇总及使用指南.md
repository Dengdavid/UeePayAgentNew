# LocalStorage 缓存汇总及使用指南

本文档汇总 `UeePayFrontend` 当前 LocalStorage 的键、用途、生命周期和安全结论，并约束新增、修改、读取和清理方式。LocalStorage 只负责非敏感、允许跨会话保留的浏览器状态；服务端始终是用户身份、权限、认证、风控、地区限制、资金和业务结果的最终边界。

本文档记录代码当前事实和治理建议，不代表所有存量用法都符合现行规范。数据能否进入浏览器持久化存储，以[安全与数据处理规范](./安全与数据处理规范.md)为最终依据。

## 1. 使用边界

### 1.1 允许保存

- 已登记的语言、界面国家和时区等非敏感用户偏好。
- 不包含用户标识、业务数据或权限语义的短期页面状态，并且有明确过期和清理策略。
- 只用于改善交互、丢失后可安全重建，且不会改变服务端事实的数据。

### 1.2 禁止保存

- Token、OTP、认证 Session、证件号、KYC/KYB 文件地址和认证结果。
- 完整 PAN、CVV、PIN、私钥、API key、Webhook secret 等敏感或受限数据。
- 姓名、邮箱、手机号、地址、持卡人资料等 Personal 数据；键名本身也不得编码这些值。
- 余额、卡余额、费用、提现状态、交易结果等会过期或影响资金判断的数据。
- 完整接口响应、完整表单、上传文件对象、内部 URL 或未知结构的服务端报文。

Base64、URL 编码、哈希或前端加密不会改变数据级别，不能把禁止持久化的数据变成允许保存的数据。

### 1.3 不能承担的职责

- LocalStorage 不能作为登录态、权限、用户归属、认证状态、风控、地区限制或业务完成状态的最终依据。
- LocalStorage 值可由用户修改、浏览器扩展读取，也可能被清理、损坏或拒绝访问；业务必须能在缓存缺失或无效时安全降级。
- 前端缓存过期不等于服务端操作失效；重新进入敏感或资金页面时必须重新获取服务端结果。

## 2. 当前 LocalStorage 清单

结论说明：

- `允许`：符合当前已登记用途，可以继续通过现有封装使用。
- `受限存量`：当前业务仍在使用，只能维持现状并遵守限制，新增或扩大用途前必须重新审查。
- `待治理`：当前实现与安全规范或生命周期要求不一致，后续专项任务应迁移、缩短生命周期或删除。
- `清理专用`：只用于兼容旧版本删除，不得重新写入。

| Key | 当前内容与用途 | 读写位置 | 生命周期 / 清理 | 结论 |
| --- | --- | --- | --- | --- |
| `APP_USER_PREFERENCES` | `{ country, timezone, language }` 界面偏好 | `src/utils/preferences-storage.js`、`src/utils/preferences.js`、`src/locales/set.js` | 用户修改时更新；退出登录清理后立即恢复当前偏好 | 允许；新增字段必须仍是明确登记的非敏感偏好 |
| `APP_USER_PREFERENCES_PENDING_SYNC` | 未登录状态下偏好待同步标记，值为 `1` | `src/utils/preferences-storage.js`、`src/views/preferences/country.vue`、`src/store/user.js` | 登录同步成功后删除 | 允许；只保存布尔语义，不得写入用户或接口数据 |
| `APP_USER_COUNTRY`、`APP_USER_TZ`、`locale` | 旧版偏好键 | `src/utils/preferences-storage.js` | 每次读取或写入新偏好时删除 | 清理专用；不得恢复写入 |
| `COUNTRYCODE` | `/ipapi/json` 返回的 IP 地区国家代码 | `src/router/settings.js`、`src/views/exception/499/index.vue` | 与 `COUNTRYTIME` 共同按 3 分钟过期；499 返回时删除国家代码 | 受限存量；仅作短期前端判断，不能替代服务端地区限制 |
| `COUNTRYTIME` | `COUNTRYCODE` 的写入时间戳 | `src/router/settings.js` | 超过 3 分钟视为过期，但当前不会主动删除 | 受限存量；必须与国家代码一起处理，异常值按过期处理 |
| `TOROUTENAME` | 未登录拦截前的目标命名路由 | `src/router/index.js`、`src/utils/route.js` | 登录或注册成功后由 `goBack()` 一次性读取并删除 | 受限存量；只能保存已存在的非敏感命名路由，不得保存 query、Token 或回跳 URL |
| `last_selected_currency` | Express 汇款入口选中的完整币种对象 | `src/views/express.vue`、`src/views/express/transfer/index.vue` | 进入汇款表单并恢复后删除 | 待治理；应收敛为恢复交互所需的白名单字段，不能保存完整接口对象 |
| `transferInfo` | Express 汇款入口的金额、币种和国家 | `src/views/express.vue`、`src/views/express/transfer/index.vue` | 进入汇款表单并恢复后删除 | 待治理；包含汇款意图与金额，不应跨会话持久化 |
| `express_form` | Express 汇款完整表单，包括动态 sender、receiver 和 common 字段 | `src/views/express/transfer/index.vue` | 表单变化时持续覆盖；提交成功后删除；退出登录时由统一清理移除 | 待治理；完整业务表单可能包含 Personal 和金融数据，禁止存入 LocalStorage |
| `invite_code` | 注册或找回密码流程的邀请码 | `src/views/components/PageLogin/index.vue`、`src/views/register/index.vue`、`src/views/forgot-password/index.vue` | 注册成功后删除；当前无 TTL | 受限存量；只能作为前端预填，服务端必须校验归属和有效性，应补充过期策略 |
| `CARDHOLDER` | `{ firstName, lastName, phoneCode, phone, email }` 持卡人联系资料 | `src/views/card/add/index.vue`、`src/utils/preferences-storage.js` | 页面填写时持续覆盖；当前退出登录清理后仍被恢复 | 待治理；属于 Personal 数据，且跨退出登录保留，不符合持久化边界 |
| `USERID` | 451 法律或地区限制响应中的 `responseData.msg`，并在错误页展示 | `src/api/request/applicationErrorHandler.js`、`src/views/exception/451/index.vue` | 用户主动重新检测时删除；退出登录时由统一清理移除 | 待治理；字段名与真实数据语义不一致，内容可能是 IP、标识或错误文案，确认接口契约前不得扩大使用 |
| `SESSIONID` | Didit 个人认证会话 ID，用于跳转后继续轮询认证进度 | `src/views/certify/index.vue`、`src/views/certify/components/PersonalVerification/didit.vue` | 成功、失败、超过轮询次数或无认证时删除；退出登录时由统一清理移除 | 待治理；认证 Session 属于 Sensitive 数据，禁止进入 LocalStorage |
| `form_code_countdown:${event}:${encodeURIComponent(email)}` | 邮箱验证码发送倒计时的到期时间戳 | `src/components/form/FormCode/index.vue` | 60 秒到期后删除 | 待治理；动态键包含编码后的邮箱，键名本身泄露 Personal 数据 |
| `props.storage` 动态键 | `src/components/render/index.vue` 根据调用方传入键名缓存动态表单，代码允许缓存文件 URL 和 `fileId` | `src/components/render/index.vue` | 由调用方负责，组件本身没有统一 TTL 或删除逻辑；当前未发现外部调用方 | 待治理；不得用于 Personal、认证、上传、资金或其他敏感表单，新调用方默认禁止开启 |

## 3. 统一使用入口

### 3.1 用户偏好

语言、界面国家和时区必须复用 `src/utils/preferences-storage.js` 与 `src/utils/preferences.js`，不要在页面直接读写 `APP_USER_PREFERENCES`：

```js
import {
  getCachedCountry,
  getCachedTimezone,
  setCountry,
  setTimezone,
} from '@/utils/preferences.js'

const country = getCachedCountry()
const timezone = getCachedTimezone()

setCountry('TW')
setTimezone('Asia/Taipei')
```

语言继续通过 `src/locales/set.js` 的现有入口处理，不创建第二份 Locale 缓存。

### 3.2 新增业务缓存

新增 LocalStorage 前必须依次确认：

1. 数据是否确实需要跨页面且跨浏览器会话保留；只在当前页面使用时保留在组件内存，只需同一标签页时优先评估 SessionStorage。
2. 数据是否仅包含 Public 或 Internal 字段；Personal、Sensitive 和 Restricted 数据直接禁止。
3. 是否可以只保存稳定 ID、枚举或白名单字段，禁止保存完整接口响应和完整表单。
4. 明确 Key、数据结构、写入入口、读取入口、TTL、完成清理、失败清理、退出登录和用户切换行为。
5. 将新 Key 登记到本文档后再实现；调用方超过一个时应提供项目内统一 helper。

Key 使用大写项目或业务前缀并表达用途，例如 `APP_<DOMAIN>_<PURPOSE>`。不要把邮箱、手机号、用户 ID、Token 或其他运行时值拼入 Key。

### 3.3 读写要求

- 访问 LocalStorage 必须处理浏览器禁用存储、隐私模式、容量不足和安全策略导致的异常。
- JSON 读取必须捕获解析错误，并校验对象类型、允许字段和值域；损坏缓存应忽略或删除，不能阻断主流程。
- 写入对象前显式挑选字段，不使用 `JSON.stringify(response)`、`JSON.stringify(form)` 或对象展开保存未知字段。
- 带 TTL 的值同时保存 `expiresAt`，读取时先校验时间；过期后立即删除，不只是在逻辑上忽略。
- 缓存缺失、过期或被篡改时回到安全默认值或重新请求服务端，不能把异常缓存当成业务成功。
- LocalStorage 是同步 API，不在高频输入、滚动或轮询中持续写入大型对象。

最小示例仅适用于已经通过数据分级并登记的非敏感缓存：

```js
const CACHE_KEY = 'APP_EXAMPLE_VIEW'

export const setExampleView = (value) => {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({
      mode: value.mode,
      expiresAt: Date.now() + 30 * 60 * 1000,
    }))
  } catch {
    // 缓存失败不阻断主流程。
  }
}

export const getExampleView = () => {
  try {
    const value = JSON.parse(localStorage.getItem(CACHE_KEY) || 'null')
    if (!value || value.expiresAt <= Date.now()) {
      localStorage.removeItem(CACHE_KEY)
      return null
    }
    return ['compact', 'comfortable'].includes(value.mode) ? value : null
  } catch {
    localStorage.removeItem(CACHE_KEY)
    return null
  }
}
```

## 4. 清理规则

### 4.1 退出登录

桌面端和移动端退出登录都会调用 `src/utils/preferences.js` 的 `clearBrowserCache()`。当前实际行为是：

1. 暂存 `CARDHOLDER`。
2. 执行 `localStorage.clear()`。
3. 恢复 `APP_USER_PREFERENCES` 和 `CARDHOLDER`。
4. 清空 SessionStorage。
5. 删除当前站点 Cache Storage 中的缓存。

因此，当前函数名称虽然是“清理浏览器缓存”，但并不代表 LocalStorage 中所有数据最终都被删除；用户偏好和 `CARDHOLDER` 会保留。其中 `CARDHOLDER` 的保留行为与 Personal 数据禁止持久化的规范冲突，后续修复时应单独确认产品需求和迁移影响。

### 4.2 禁止无边界清理

- 页面和普通组件不得直接调用 `localStorage.clear()`，避免删除其他模块登记的数据。
- 单一流程完成或取消时使用 `removeItem(明确的 Key)`。
- 成组缓存必须由所属 helper 统一清理，并在本文档登记保留项。
- 清理失败不能被解释为退出、认证、资金或业务操作失败；服务端状态仍由对应接口结果决定。

## 5. 与其他存储的区别

| 载体 | 当前项目用途 | 与 LocalStorage 的区别 |
| --- | --- | --- |
| 组件局部状态 | 当前页面交互和临时表单 | 页面卸载后释放，敏感数据优先保留在这里并及时清理 |
| Pinia state | 跨组件共享的当前运行时状态 | 不等于持久化；是否持久化由 Store 配置单独决定 |
| Pinia persist | 当前 `pinia-plugin-persist` 默认写入 SessionStorage | `userStore` 只持久化 `isLogin`、`groups`；不属于本 LocalStorage 清单 |
| SessionStorage | 同一标签页会话缓存 | 标签页关闭后清除，但 Personal、Sensitive、Restricted 数据仍不能因此自动变为允许保存 |
| Cookie | 当前统一认证 Token 等已有用途 | Token 只沿用现有 Cookie 认证，不得旁路复制到 LocalStorage |
| Cache Storage | 浏览器请求/响应缓存 | `clearBrowserCache()` 会尝试删除，与键值型 LocalStorage 不同 |

## 6. 修改与验证清单

新增、修改或删除 LocalStorage 用法时必须检查：

- [ ] 已搜索 Key 的全部读、写、删除和动态调用方。
- [ ] 已按 Public、Internal、Personal、Sensitive、Restricted 完成数据分级。
- [ ] 没有保存完整响应、完整表单、上传信息或未知扩展字段。
- [ ] Key 不包含邮箱、手机号、用户 ID、Token 或其他个人与敏感值。
- [ ] 已定义 TTL、过期删除、流程完成、失败、退出登录和用户切换清理。
- [ ] 缓存不会决定权限、认证、地区限制、风控、资金或服务端业务结果。
- [ ] 已验证缓存缺失、损坏、过期、被禁用和容量不足时的降级行为。
- [ ] 修改了共享 helper 时已检查桌面端、移动端和全部直接调用方。
- [ ] 已同步更新本文档清单，并运行 `yarn docs:check`。

## 7. 当前待治理优先级

1. `SESSIONID`：认证 Session 持久化，优先迁移到更短生命周期且符合认证回跳需求的安全方案。
2. `CARDHOLDER`：Personal 数据跨会话并跨退出登录保留，应移除持久化或重新确认明确的合规依据。
3. `express_form`：完整汇款表单可能包含 Personal 和金融数据，应改为页面内存或只保留允许的非敏感步骤状态。
4. `form_code_countdown:*`：动态 Key 包含邮箱，应改为不携带 Personal 数据的会话级方案。
5. `USERID`、`last_selected_currency`、`transferInfo`、`invite_code`：确认真实数据契约，收敛字段并补齐 TTL 和清理策略。
6. `src/components/render/index.vue` 的 `storage` 能力：当前无外部调用方，新增调用前应先删除或改造成显式白名单缓存。
