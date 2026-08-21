# FormCheckbox 多选组件

将标准化选项渲染为复选框组并同步数组值。

## 推荐入口

`src/components/form/FormCheckbox/index.vue`

组件已通过 `src/utils/components.js` 全局注册，业务模板可直接使用。

## 基本用法

```vue
<FormCheckbox v-model="selected" :options="options" @on-change="handleChange" />
```

## Props

| 名称 | 类型 | 默认值 | 必填 | 说明 |
| --- | --- | --- | --- | --- |
| `modelValue` | `[Array,String,null,undefined]` | `工厂函数` | 否 | `v-model` 绑定值。 |
| `width` | `[String,Number]` | `'100%'` | 否 | 组件宽度。 |
| `labelName` | `String` | `'label'` | 否 | 选项标签字段名。 |
| `valueName` | `String` | `'value'` | 否 | 选项值字段名。 |
| `options` | `[Array,Object,String]` | `[]` | 否 | 选项集合。 |

## Events

| 事件 | 说明 |
| --- | --- |
| `update:modelValue` | 更新 `v-model` 值。 |
| `on-change` | 值或业务状态变化后触发。 |

## Slots

| Slot | 说明 |
| --- | --- |
| `default` | 默认内容区域。 |

## 公开方法

无 `defineExpose` 公开方法。

## 使用边界

- `modelValue` 默认按数组使用；自定义选项内容通过默认 slot 的 `row` 参数渲染。
- 保持现有 Props、Events 和值类型兼容；修改共享行为前检查全部直接调用方。

## 典型调用方

- `src/views/certify/components/BusinessVerification/FieldsItem.vue`
