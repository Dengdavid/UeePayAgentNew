# FormAddList 动态列表输入组件

维护由分隔值或数组表示的动态输入列表。

## 推荐入口

`src/components/form/FormAddList/index.vue`

组件已通过 `src/utils/components.js` 全局注册，业务模板可直接使用。

## 基本用法

```vue
<FormAddList v-model="items" title="添加一项" @on-change="handleChange" />
```

## Props

| 名称 | 类型 | 默认值 | 必填 | 说明 |
| --- | --- | --- | --- | --- |
| `modelValue` | `[String,Array]` | `''` | 否 | `v-model` 绑定值。 |
| `title` | `String` | `''` | 否 | 新增按钮或区域标题。 |
| `typeName` | `String` | `'input'` | 否 | 内部输入类型，当前支持 input 和 http。 |
| `regex` | `String` | `—` | 否 | 校验表达式或规则。 |
| `regexType` | `String` | `—` | 否 | 校验规则类型。 |

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

- 通过 `typeName` 选择内部输入类型；校验规则沿用 `regex` 与 `regexType`。
- 保持现有 Props、Events 和值类型兼容；修改共享行为前检查全部直接调用方。

## 典型调用方

- `src/views/certify/components/BusinessVerification/FieldsItem.vue`
