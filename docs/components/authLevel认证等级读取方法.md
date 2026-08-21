# authLevel 认证等级读取方法

本文档说明 `src/utils/level.js` 中由认证页面直接使用的认证等级、剩余次数和展示映射。认证结果、可认证次数和跳转资格必须以服务端返回及现有认证流程为准。

## 1. 导入

```js
import {
  authLevel,
  authRemainingTimes,
  levelMap,
} from '@/utils/level.js'
```

## 2. `authLevel()`

```js
const currentLevel = Number(authLevel())
```

读取 User Store 中当前用户的 `auth_level`，字段缺失或假值时返回 `0`。该值只用于页面展示和流程分支，不是前端授权凭证。

## 3. `authRemainingTimes()`

```js
const remainingTimes = Number(authRemainingTimes())

if (remainingTimes <= 0) {
  return
}
```

读取 User Store 中的 `auth_remaining_times`，字段缺失或假值时返回 `0`。页面可以据此禁用入口并展示提示，但服务端仍必须校验实际次数。

## 4. `levelMap`

`levelMap` 是响应式 `computed`，提供认证等级对应的多语言展示信息：

```js
const config = levelMap.value[String(authLevel())]
```

当前每个等级包含 `label`、`type`、`tabs`、`desc`、`desc1`、`desc2`、`color` 和 `icon`。新增或调整等级时必须同步接口枚举、全部启用 Locale、认证页面和状态展示。

## 5. 使用边界

- 不根据本地等级绕过 KYC/KYB、风控、地区限制、2FA 或服务端权限。
- 操作成功后，如果页面依赖最新等级或次数，应通过现有 User Store action 刷新服务端用户信息。
- 不在路由、localStorage、日志或埋点中保存证件资料、认证链接或认证结果详情。
- `levelMap` 只负责展示，不替代服务端状态枚举和业务判断。

`src/utils/level.js` 还导出了历史认证跳转能力，但当前业务页面没有直接调用；新增页面不得在未核对现有认证流程和调用契约的情况下直接复用。
