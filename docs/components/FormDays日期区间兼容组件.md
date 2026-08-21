# FormDays 日期区间兼容组件

提供存量日期或日期区间选择能力。

## 推荐入口

`src/components/form/FormDays/index.vue`

组件已通过 `src/utils/components.js` 全局注册，业务模板可直接使用。

## 基本用法

```vue
<FormDays v-model="dateRange" type="daterange" @on-change="handleChange" />
```

## Props

| 名称 | 类型 | 默认值 | 必填 | 说明 |
| --- | --- | --- | --- | --- |
| `modelValue` | `[Array,Object,String,null]` | `—` | 否 | `v-model` 绑定值。 |
| `dataName` | `[String,Array]` | `''` | 否 | 对象模式下绑定的字段名。 |
| `type` | `String` | `'daterange'` | 否 | 组件模式或值类型。 |
| `min` | `String` | `'startTime'` | 否 | 允许的最小值。 |
| `max` | `String` | `'endTime'` | 否 | 允许的最大值。 |
| `months` | `Number` | `—` | 否 | 范围类型下的默认月数；挂载时自动设置从当前时间向前推指定月数的日期范围。 |
| `disableAfterToday` | `Boolean` | `false` | 否 | 是否禁止选择当天之后的日期。 |
| `width` | `[String,Number]` | `'100%'` | 否 | 组件宽度。 |

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

- 新页面优先使用 `FormDateBox`；修改存量调用时保持原值格式兼容。
- 保持现有 Props、Events 和值类型兼容；修改共享行为前检查全部直接调用方。

## 典型调用方

- 当前未检索到直接模板调用；该组件属于全局注册或存量兼容入口，新代码使用前应确认是否仍为推荐组件。
