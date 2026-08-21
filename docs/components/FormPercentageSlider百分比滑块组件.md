# FormPercentageSlider 百分比滑块组件

同步滑块与数字输入框，用于受限百分比值。

## 推荐入口

`src/components/form/FormPercentageSlider/index.vue`

组件未全局注册，需要显式导入：

```js
import FormPercentageSlider from '@/components/form/FormPercentageSlider/index.vue'
```

## 基本用法

```vue
<FormPercentageSlider v-model="rate" :min="0" :max="100" :precision="2" />
```

## Props

| 名称 | 类型 | 默认值 | 必填 | 说明 |
| --- | --- | --- | --- | --- |
| `modelValue` | `[Number,String,null]` | `null` | 否 | `v-model` 绑定值。 |
| `min` | `[Number,String]` | `0` | 否 | 允许的最小值。 |
| `max` | `[Number,String]` | `100` | 否 | 允许的最大值。 |
| `step` | `[Number,String]` | `0.01` | 否 | 步进值。 |
| `precision` | `[Number,String]` | `2` | 否 | 数字精度。 |
| `disabled` | `Boolean` | `false` | 否 | 是否禁用。 |

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

- 当前未全局注册，必须显式导入；资金费率计算仍使用高精度工具。
- 保持现有 Props、Events 和值类型兼容；修改共享行为前检查全部直接调用方。

## 典型调用方

- `src/views/certify/components/BusinessVerification/FieldsItem.vue`
