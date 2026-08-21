# FormInput 文本输入组件

统一文本输入、清空、搜索、回车和可选前置选择能力。

## 推荐入口

`src/components/form/FormInput/index.vue`

组件已通过 `src/utils/components.js` 全局注册，业务模板可直接使用。

## 基本用法

```vue
<FormInput v-model="keyword" search clearable @on-change="search" @on-enter="search" />
```

## Props

| 名称 | 类型 | 默认值 | 必填 | 说明 |
| --- | --- | --- | --- | --- |
| `modelValue` | `[String,null]` | `null` | 否 | `v-model` 绑定值。 |
| `select` | `String` | `null` | 否 | 前置选择器绑定值。 |
| `width` | `[String,Number]` | `'100%'` | 否 | 组件宽度。 |
| `regex` | `String` | `—` | 否 | 校验表达式或规则。 |
| `regexType` | `String` | `—` | 否 | 校验规则类型。 |
| `search` | `Boolean` | `false` | 否 | 是否使用搜索框模式。 |
| `clearable` | `Boolean` | `true` | 否 | 是否允许清空。 |
| `autocomplete` | `String` | `'one-time-code'` | 否 | 原生 autocomplete 属性。 |
| `changeDelay` | `Number` | `500` | 否 | `on-change` 的延迟时间，单位毫秒。 |
| `options` | `Array` | `工厂函数` | 否 | 选项集合。 |

## Events

| 事件 | 说明 |
| --- | --- |
| `update:modelValue` | 更新 `v-model` 值。 |
| `update:select` | 更新前置选择值。 |
| `on-change` | 值或业务状态变化后触发。 |
| `on-enter` | 输入框按下回车时触发。 |

## Slots

| Slot | 说明 |
| --- | --- |
| 动态名称 | 按内部字段或选项名称转发的 slot。 |

## 公开方法

无 `defineExpose` 公开方法。

## 使用边界

- 输入变化默认按 `changeDelay` 延迟触发；回车和搜索保持即时，不在调用方叠加重复请求。
- 保持现有 Props、Events 和值类型兼容；修改共享行为前检查全部直接调用方。

## 典型调用方

- `src/components/form/FormAddList/index.vue`
- `src/components/form/FormCode/index.vue`
- `src/components/form/FormSelect/index.vue`
- `src/components/form/FormTable/FormItemType.vue`
- `src/components/form/FormUploadFile/index.vue`
- `src/components/uiForm/UiFormItem/index.vue`
- `src/views/agent/admin/components/AdminModal.vue`
- `src/views/agent/admin/index.vue`
