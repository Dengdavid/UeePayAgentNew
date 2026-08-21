# FormSwitch 开关组件

在布尔值、数字值或字符串值之间映射开关状态。

## 推荐入口

`src/components/form/FormSwitch/index.vue`

组件已通过 `src/utils/components.js` 全局注册，业务模板可直接使用。

## 基本用法

```vue
<FormSwitch v-model="enabled" :true-value="1" :false-value="0" />
```

## Props

| 名称 | 类型 | 默认值 | 必填 | 说明 |
| --- | --- | --- | --- | --- |
| `modelValue` | `[String,Boolean,Number]` | `0` | 否 | `v-model` 绑定值。 |
| `type` | `String` | `'number'` | 否 | 值映射类型。 |
| `trueText` | `String` | `—` | 否 | 开启状态文案。 |
| `falseText` | `String` | `—` | 否 | 关闭状态文案。 |
| `trueValue` | `[String,Boolean,Number]` | `1` | 否 | 开启时回写的值。 |
| `falseValue` | `[String,Boolean,Number]` | `0` | 否 | 关闭时回写的值。 |

## Events

| 事件 | 说明 |
| --- | --- |
| `update:modelValue` | 更新 `v-model` 值。 |
| `on-change` | 值或业务状态变化后触发。 |

## Slots

无自定义 Slots。

## 公开方法

无 `defineExpose` 公开方法。

## 使用边界

- 显式确认 `trueValue`、`falseValue` 与接口字段类型一致。
- 保持现有 Props、Events 和值类型兼容；修改共享行为前检查全部直接调用方。

## 典型调用方

- `src/views/agent/admin/index.vue`
- `src/views/ucenter/account/components/AccountCreateModal.vue`
- `src/views/ucenter/components/PupMessage.vue`
