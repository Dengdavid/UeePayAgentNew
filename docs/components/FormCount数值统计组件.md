# FormCount 数值统计组件

按字段配置展示统计值，并可对数值变化使用动画。

## 推荐入口

`src/components/form/FormCount/index.vue`

组件已通过 `src/utils/components.js` 全局注册，业务模板可直接使用。

## 基本用法

```vue
<FormCount :data="summary" :list="fields" :duration="1" />
```

## Props

| 名称 | 类型 | 默认值 | 必填 | 说明 |
| --- | --- | --- | --- | --- |
| `data` | `Object` | `''` | 否 | 统计字段所在的数据对象。 |
| `list` | `Array` | `[]` | 否 | 统计字段配置数组。 |
| `isCount` | `Boolean` | `false` | 否 | 是否使用 CountUp 汇总样式。 |
| `duration` | `Number` | `1` | 否 | 数字动画持续时间。 |

## Events

无自定义事件。

## Slots

无自定义 Slots。

## 公开方法

无 `defineExpose` 公开方法。

## `list` 字段

| 字段 | 说明 |
| --- | --- |
| `key` | 从 `data` 读取的字段名。 |
| `title` | 指标或字段标题。 |
| `decimals` | `isCount` 模式下的数字小数位数。 |
| `type` | 交给 FormTable 列类型组件处理的展示类型。 |

## 使用边界

- `list` 的字段配置必须与 `data` 的实际字段一致。
- 保持现有 Props、Events 和值类型兼容；修改共享行为前检查全部直接调用方。

## 典型调用方

- 当前未检索到直接模板调用；该组件属于全局注册或存量兼容入口，新代码使用前应确认是否仍为推荐组件。
