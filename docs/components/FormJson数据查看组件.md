# FormJson 数据查看组件

以可展开的查看器展示对象或 JSON 数据。

## 推荐入口

`src/components/form/FormJson/index.vue`

组件已通过 `src/utils/components.js` 全局注册，业务模板可直接使用。

## 基本用法

```vue
<FormJson :data="detail" />
```

## Props

| 名称 | 类型 | 默认值 | 必填 | 说明 |
| --- | --- | --- | --- | --- |
| `data` | `未声明` | `null` | 否 | 数据对象或数据值。 |

## Events

无自定义事件。

## Slots

无自定义 Slots。

## 公开方法

无 `defineExpose` 公开方法。

## 使用边界

- 只用于展示；敏感字段必须在传入前删除或脱敏。
- 保持现有 Props、Events 和值类型兼容；修改共享行为前检查全部直接调用方。

## 典型调用方

- `src/components/form/FormTable/ColumnsItemType.vue`
