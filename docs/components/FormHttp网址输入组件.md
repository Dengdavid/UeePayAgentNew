# FormHttp 网址输入组件

在输入框前提供协议选择，并校验组合后的 URL。

## 推荐入口

`src/components/form/FormHttp/index.vue`

组件已通过 `src/utils/components.js` 全局注册，业务模板可直接使用。

## 基本用法

```vue
<FormHttp v-model="webhookUrl" @on-change="handleChange" />
```

## Props

| 名称 | 类型 | 默认值 | 必填 | 说明 |
| --- | --- | --- | --- | --- |
| `modelValue` | `[String,null]` | `''` | 否 | `v-model` 绑定值。 |
| `width` | `[String,Number]` | `'100%'` | 否 | 组件宽度。 |
| `regex` | `String` | `''` | 否 | 校验表达式或规则。 |
| `regexType` | `String` | `''` | 否 | 校验规则类型。 |

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

- 外部 URL 仍需由服务端校验和限制来源，前端校验不能替代安全边界。
- 保持现有 Props、Events 和值类型兼容；修改共享行为前检查全部直接调用方。

## 典型调用方

- `src/components/form/FormAddList/index.vue`
