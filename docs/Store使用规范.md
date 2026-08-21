# UeePayFrontend Store 使用规范

本文档用于约束 AI Coding Agent 和开发者在 `UeePayFrontend` 用户端项目中读取、修改、新增和审查 Pinia Store 时的默认规则。项目属于金融行业用户端，Store 中的数据会影响登录态、用户身份、认证状态、卡段映射、站点配置、客服入口、未读消息、开放平台配置和用户中心展示。任何 Store 改动都必须优先保证敏感信息不持久化、服务端权限为最终边界、状态刷新准确和兼容现有调用方。

## 1. Store 边界

当前核心 Store：

```text
src/store/user.js   登录态、用户信息、用户组、未读消息、登录/登出
src/store/app.js    客服链接、公告、站点配置、国家地区数据
src/store/card.js   Card BIN 列表与映射
src/store/index.js  Pinia 创建与 pinia-plugin-persist 注册
src/utils/store.js  Store 访问与 storeToRefs 辅助封装
```

AI 修改 Store 前必须先判断数据属于哪一类：

- 用户身份与认证状态：`userStore`
- 站点配置、公告、客服、国家地区：`appStore`
- 卡 BIN、卡组织、卡段映射：`cardStore`
- 页面局部状态：应留在页面组件内，不进入全局 Store

## 2. 使用入口规范

推荐用法：

```js
import { useUserStoreRefs, useUserStore } from '@/utils/store'

const { user, isLogin } = useUserStoreRefs()
const userStore = useUserStore()
```

规则：

- 只读取响应式状态和 getter 时，优先使用 `useUserStoreRefs()`、`useAppStoreRefs()`、`useCardStoreRefs()`。
- 需要调用 action、修改状态、登录、登出、刷新用户信息时，使用原始 `useXxxStore()`。
- 旧页面直接从 `@/store/user.js`、`@/store/app.js`、`@/store/card.js` 导入可以保留，不为了统一风格做大范围迁移。
- 新增通用 store 时，必须同步更新 `src/utils/store.js` 的 `storeFactories`、ref helper 和 export。
- 不要在普通工具函数的顶层随意创建 Store 实例，除非确认 Pinia 生命周期已初始化。

## 3. 持久化规范

项目使用 `pinia-plugin-persist`，必须采用白名单持久化。

当前情况：

- `userStore` 仅持久化 `isLogin`、`groups`。
- `appStore`、`cardStore` 当前持久化路径为空。

强制要求：

- 不得持久化完整用户资料。
- 不得持久化完整卡号 PAN、CVV、PIN、OTP、证件号、KYC/KYB 文件地址。
- 不得持久化开放平台密钥、公钥、authorization、webhook secret、IP 白名单等敏感配置。
- 不得持久化余额、冻结金额、卡余额、提现状态等易过期金融数据。
- 新增 persist path 前必须说明数据来源、敏感性、过期策略和退出登录清理策略。
- 登录态以 Cookie `token` 和服务端用户信息为准，Store 只是前端状态缓存。

## 4. userStore 使用规范

`userStore` 当前职责：

```text
isLogin
showLoginModal
user
token（当前空 state 兼容字段，不得赋值或 persist）
groups
unreadNum
customerUrl
userGroup getter
inviteUrl getter
init()
login(token)
logout()
showModal()
getUserInfo()
getMessageNum()
```

规则：

- 登录成功后调用 `userStore.login(token)`，由其写入 Cookie 并初始化用户信息。
- `login(token)` 的参数只允许写入当前统一认证 Cookie；不得同步写入 `userStore.token`、其他 Pinia state、persist、localStorage 或 sessionStorage。
- 需要刷新用户资料时调用 `userStore.getUserInfo()`，不要在多个页面重复写同类请求逻辑。
- 资金、认证、开放平台、卡片操作成功后，如页面依赖用户状态，应刷新 `getUserInfo()`。
- 登出必须调用 `userStore.logout()`，并确保 Cookie `token` 清理。
- 未读消息轮询由 `getMessageNum()` 管理，不要在页面内重复创建轮询。
- 不要直接把服务端返回的敏感扩展字段写入 persist。
- 不要只改 `isLogin` 而不处理认证 Cookie、用户信息和相关缓存。

注意：

- `inviteUrl` getter 依赖服务端返回的 `invite_code`，不能前端伪造业务归属。
- `userGroup` 只用于前端展示和交互控制，不能替代服务端权限。

## 5. appStore 使用规范

`appStore` 当前职责：

```text
customerUrl
notice
areaDatas
configDatas
countries getter
init()
getConfig()
getCustomerUrl()
getNotice()
getAreaDatas()
```

规则：

- 客服链接、公告、站点配置必须以服务端结果为准。
- 国家地区数据优先复用 `appStore.areaDatas` 和 `countries` getter。
- 上传格式、邮箱格式等配置应来自 `configDatas`，不要在页面硬编码第二套规则。
- `appStore.init()` 可用于应用启动或登录后刷新基础配置。
- 不要把站点配置误当作用户权限或服务端风控结果。

## 6. cardStore 使用规范

`cardStore` 当前职责：

```text
bins
binMaps getter
init()
getBinList()
```

规则：

- 卡 BIN 和卡组织展示优先使用 `bins`、`binMaps`。
- 页面需要最新卡段列表时调用 `cardStore.getBinList()`。
- 不要在多个页面重复请求并自建 BIN 映射。
- BIN 映射只用于展示和前端交互辅助，不代表服务端开卡权限或卡状态。
- 不要把卡详情、卡余额、CVV、PAN、PIN 等私密信息放入 `cardStore`。

## 7. 页面局部状态与全局 Store 边界

以下状态应优先放在页面或组件内部：

- 表单输入草稿。
- 弹窗开关。
- 当前页筛选条件、分页条件、临时 tab。
- 单个详情页的接口返回数据。
- 一次性 loading、buttonLoading、局部 selections。

以下状态可以考虑 Store：

- 多页面复用且生命周期跨页面的基础数据。
- 登录用户信息。
- 站点级配置。
- Card BIN 映射。
- 全局未读消息数。

判断标准：

- 如果刷新页面后必须重新从服务端确认，就不要持久化。
- 如果只服务于当前页面，不要放全局 Store。
- 如果涉及敏感信息，默认不进 Store；确有需要也不 persist。

## 8. Store 与 API 请求规范

要求：

- Store action 内请求必须使用项目已有 API 封装，不直接绕过 `src/api/request.js`。
- Store 不负责绕过 2FA、KYC/KYB、风控、451、429、-100 登出逻辑。
- action 失败时不应频繁弹窗，尤其是轮询类请求。
- 用户信息、配置、BIN 列表等初始化请求应避免重复风暴。
- 不在 Store 中吞掉会影响资金或安全流程的关键错误，页面需要处理时应返回状态或抛出。
- 服务端是最终权限边界，Store 状态只用于前端展示和交互控制。

## 9. Store 与敏感信息

数据分级、页面局部内存、Cookie、浏览器存储、URL、日志和生命周期的完整边界统一遵守 `docs/安全与数据处理规范.md`，本节只保留 Store 特有规则：

- Sensitive / Restricted 数据不得写入 Pinia state 或 persist；包括 Token、完整 PAN、CVV、PIN、OTP、证件号、KYC/KYB 原始文件地址、开放平台密钥和 Authorization 明文。
- 当前交互确需的验证码、临时文件、私密信息 reveal 结果或密钥编辑值应留在页面或弹窗局部状态，不提升为全局 Store。
- 修改 Store 前必须检查服务端返回对象是否混入敏感扩展字段；不能因为方便复用而保存整个响应。
- 局部敏感值的清理时机和其他载体限制直接按安全规范执行，不在本文档维护第二份名单。

## 10. Getter 与派生数据规范

规则：

- 派生展示字段优先使用 getter，如 `userGroup`、`inviteUrl`、`countries`、`binMaps`。
- getter 不应发请求，不应产生副作用。
- getter 不应修改 state。
- 大型映射如 `binMaps` 应保持稳定、可预测，避免页面重复计算。
- 复杂业务判断如果依赖服务端权限，不能只放在 getter 中作为最终依据。

## 11. Action 规范

规则：

- action 名称应表达业务动作，如 `getUserInfo`、`getMessageNum`、`getBinList`。
- 初始化类 action 使用 `init()`，但必须避免重复请求和循环依赖。
- action 内调用其他 store 时要明确边界，例如 `userStore.init()` 初始化后触发 `cardStore.init()`。
- 轮询 action 必须可停止或受登录态控制，避免登出后继续请求。
- 登录、登出、认证状态刷新等 action 应保持向后兼容，不随意改返回值和副作用。

## 12. 新增 Store 规范

新增 Store 前必须确认：

- 是否确实跨页面复用。
- 是否不能由页面局部状态解决。
- 是否涉及敏感信息。
- 是否需要持久化，默认不持久化。
- 是否需要加入 `src/utils/store.js`。
- 是否会和现有 `user/app/card` 职责重叠。

新增模板：

```js
import { defineStore } from 'pinia'

export const useExampleStore = defineStore('exampleStore', {
  persist: {
    enabled: true,
    strategies: [
      {
        paths: []
      }
    ]
  },
  state: () => ({
    list: []
  }),
  getters: {},
  actions: {}
})
```

要求：

- `persist.paths` 默认空数组。
- Store id 使用明确名称，如 `exampleStore`。
- state 必须返回函数。
- action 内不直接依赖页面组件实例。
- 新增后补充 `src/utils/store.js` 导出和 ref helper。

## 13. 修改 Store 前检查清单

修改 Store 前必须检查：

- 是否影响登录、注册、登出、忘记密码。
- 是否影响 2FA、410 请求重放或安全中心。
- 是否影响 KYC/KYB、认证状态、用户组。
- 是否影响卡片、卡 BIN、开卡、卡详情。
- 是否影响 Recharge、提现、财务流水、奖励、返现。
- 是否影响开放平台密钥、公钥、IP 白名单、回调地址。
- 是否新增持久化字段。
- 是否改变已有 state 字段类型、getter 返回值或 action 副作用。
- 是否存在轮询、重复请求或登出后请求风险。

## 14. 删除或重构 Store 规范

删除或重构前必须：

- 全局搜索 `useUserStore`、`useAppStore`、`useCardStore`、`useXxxStoreRefs`。
- 检查 `src/utils/store.js` 的导出和 helper。
- 检查直接 import 和通过工具封装 import 两种路径。
- 检查 `storeToRefs` 解构字段。
- 检查组件模板中是否依赖 getter。
- 检查 API 拦截器、App 初始化、登录页、注册页、451 页面、布局组件。

禁止：

- 删除兼容字段但不迁移调用方。
- 把 user、app、card 职责混在一个新 Store 中。
- 为了减少请求把敏感服务端结果持久化。
- 未验证调用方就改变 action 返回值或副作用。

## 15. 交付要求

Store 相关任务使用项目 `AGENTS.md` 的统一交付格式，并额外说明：

- 修改了哪些 Store、helper、state、getter 或 action。
- 是否涉及登录态、Token、用户信息、权限、KYC、2FA、卡片、开放平台或敏感信息。
- 是否新增或修改 Pinia persist 字段。
- 是否改变 state、getter、action 和调用方兼容性。
