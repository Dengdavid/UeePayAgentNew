# FormNumber 数字输入组件

封装数字输入、精度、上下限和失焦事件。

## 推荐入口

`src/components/form/FormNumber/index.vue`

组件已通过 `src/utils/components.js` 全局注册，业务模板可直接使用。

## 基本用法

```vue
<FormNumber v-model="amount" :min="0" :precision="2" @on-blur="validateAmount" />
```

## Props

| 名称 | 类型 | 默认值 | 必填 | 说明 |
| --- | --- | --- | --- | --- |
| `modelValue` | `[Number,null]` | `null` | 否 | `v-model` 绑定值。 |
| `precision` | `Number` | `undefined` | 否 | 数字精度。 |
| `min` | `[Number,null]` | `0` | 否 | 允许的最小值。 |
| `max` | `[Number,null]` | `999999999` | 否 | 允许的最大值。 |
| `activeChange` | `Boolean` | `undefined` | 否 | 透传给 `InputNumber` 的 `active-change`；未传时，`min > 0` 会默认关闭即时范围校正，允许用户先输完多位数。 |

## Events

| 事件 | 说明 |
| --- | --- |
| `update:modelValue` | 更新 `v-model` 值。 |
| `on-change` | 值或业务状态变化后触发。 |
| `on-blur` | 输入框失焦时触发。 |

## Slots

无自定义 Slots。

## 公开方法

无 `defineExpose` 公开方法。

## 使用边界

- 涉及金额结果时使用 `decimal.js` 或项目资金工具，不能依赖输入组件进行浮点计算。
- 保持现有 Props、Events 和值类型兼容；修改共享行为前检查全部直接调用方。

## 典型调用方

- `src/components/form/FormPercentageSlider/index.vue`
- `src/views/card/add/components/CardFeeSection.vue`
- `src/views/card/components/IntoModal.vue`
- `src/views/card/components/OutModal.vue`
- `src/views/ucenter/cashback/detail.vue`
- `src/views/ucenter/components/PupMessage.vue`
