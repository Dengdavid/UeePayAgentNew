# FormCode 验证码输入组件

组合验证码输入框与发送按钮，按业务 event 和邮箱请求验证码。

## 推荐入口

`src/components/form/FormCode/index.vue`

组件已通过 `src/utils/components.js` 全局注册，业务模板可直接使用。

## 基本用法

```vue
<FormCode v-model="code" event="validate" :email="email" @on-enter="submit" />
```

## Props

| 名称 | 类型 | 默认值 | 必填 | 说明 |
| --- | --- | --- | --- | --- |
| `modelValue` | `[String,null]` | `null` | 否 | `v-model` 绑定值。 |
| `event` | `String` | `'forgot'` | 否 | 发送邮箱验证码时传给 `/user/auth/sendEmail` 的业务事件类型，也用于隔离本地倒计时。 |
| `email` | `String` | `—` | 否 | 接收验证码的邮箱；格式无效时发送按钮不可用。 |

## Events

| 事件 | 说明 |
| --- | --- |
| `update:modelValue` | 更新 `v-model` 值。 |
| `on-change` | 值或业务状态变化后触发。 |
| `on-enter` | 输入框按下回车时触发。 |

## Slots

| Slot | 说明 |
| --- | --- |
| 动态名称 | 按内部字段或选项名称转发的 slot。 |

## 公开方法

无 `defineExpose` 公开方法。

## 使用边界

- OTP 不得写入日志、路由或持久化 Store；发送和验证结果以服务端为准。
- 保持现有 Props、Events 和值类型兼容；修改共享行为前检查全部直接调用方。

## 典型调用方

- `src/views/forgot-password/index.vue`
- `src/views/register/index.vue`
- `src/views/ucenter/security/components/EmailBindingModal.vue`
- `src/views/ucenter/security/components/EmailModal.vue`
- `src/views/ucenter/security/components/EmailVerificationModal.vue`
