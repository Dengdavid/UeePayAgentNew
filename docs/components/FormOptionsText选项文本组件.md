# FormOptionsText 选项文本组件

根据当前值从选项集合中解析对应展示文本。

## 推荐入口

`src/components/form/FormOptionsText/index.vue`

组件已通过 `src/utils/components.js` 全局注册，业务模板可直接使用。

## 基本用法

```vue
<FormOptionsText :model-value="status" :options="statusOptions" />
```

## Props

| 名称 | 类型 | 默认值 | 必填 | 说明 |
| --- | --- | --- | --- | --- |
| `modelValue` | `未声明` | `—` | 否 | `v-model` 绑定值。 |
| `options` | `未声明` | `—` | 否 | 选项集合。 |
| `labelKey` | `String` | `'label'` | 否 | 标签字段名。 |
| `valueKey` | `String` | `'value'` | 否 | 值字段名。 |

## Events

无自定义事件。

## Slots

无自定义 Slots。

## 公开方法

无 `defineExpose` 公开方法。

## 使用边界

- 只负责值到文案的映射；业务状态以服务端返回值为准。
- 保持现有 Props、Events 和值类型兼容；修改共享行为前检查全部直接调用方。

## 典型调用方

- `src/components/form/FormTable/ColumnsItemType.vue`
