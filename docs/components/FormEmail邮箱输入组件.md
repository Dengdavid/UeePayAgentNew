# FormEmail 邮箱输入组件

提供邮箱输入、自动补全建议和前缀区域。

## 推荐入口

`src/components/form/FormEmail/index.vue`

组件已通过 `src/utils/components.js` 全局注册，业务模板可直接使用。

## 基本用法

```vue
<FormEmail v-model:data="form" data-name="email" @on-change="handleChange" />
```

## Props

| 名称 | 类型 | 默认值 | 必填 | 说明 |
| --- | --- | --- | --- | --- |
| `data` | `[Object,String]` | `工厂函数` | 否 | 数据对象或数据值。 |
| `dataName` | `[String,Array]` | `''` | 否 | 对象模式下绑定的字段名。 |
| `options` | `Object` | `[]` | 否 | 自定义邮箱后缀配置。 |
| `isIconLeft` | `Boolean` | `false` | 否 | 是否启用左侧图标布局。 |

## Events

| 事件 | 说明 |
| --- | --- |
| `update:data` | 更新 `v-model:data` 值。 |
| `on-change` | 值或业务状态变化后触发。 |

## Slots

| Slot | 说明 |
| --- | --- |
| `prefix` | 输入或选择器前缀区域。 |

## 公开方法

无 `defineExpose` 公开方法。

## 使用边界

- `data` 可传对象或字符串；对象模式下 `dataName` 必须对应真实字段。
- 保持现有 Props、Events 和值类型兼容；修改共享行为前检查全部直接调用方。

## 典型调用方

- `src/views/card/add/components/CardholderInfoForm.vue`
- `src/views/card/detail/components/CardContactModal.vue`
- `src/views/card/physical/components/MailingAddress.vue`
- `src/views/forgot-password/index.vue`
- `src/views/register/index.vue`
- `src/views/ucenter/account/components/AccountCreateModal.vue`
- `src/views/ucenter/account/components/AccountEmailModal.vue`
- `src/views/ucenter/security/components/EmailBindingModal.vue`
