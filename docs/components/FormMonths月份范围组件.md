# FormMonths 月份范围组件

通过对象字段维护开始月份和结束月份。

## 推荐入口

`src/components/form/FormMonths/index.vue`

组件已通过 `src/utils/components.js` 全局注册，业务模板可直接使用。

## 基本用法

```vue
<FormMonths v-model:data="form" star="startTime" end="endTime" @on-change="handleChange" />
```

## Props

| 名称 | 类型 | 默认值 | 必填 | 说明 |
| --- | --- | --- | --- | --- |
| `data` | `[Object]` | `工厂函数` | 否 | 数据对象或数据值。 |
| `star` | `[String]` | `'startTime'` | 否 | 开始月份字段名，历史拼写必须保留。 |
| `end` | `[String]` | `'endTime'` | 否 | 结束月份字段名。 |
| `type` | `[String]` | `'endTime'` | 否 | 组件模式或值类型。 |
| `disabledDate` | `[String]` | `''` | 否 | 额外的日期禁用配置。 |

## Events

| 事件 | 说明 |
| --- | --- |
| `update:data` | 更新 `v-model:data` 值。 |
| `on-change` | 值或业务状态变化后触发。 |

## Slots

无自定义 Slots。

## 公开方法

无 `defineExpose` 公开方法。

## 使用边界

- 保留现有 `star` 字段名以兼容存量调用；不要擅自改为 `start`。
- 保持现有 Props、Events 和值类型兼容；修改共享行为前检查全部直接调用方。

## 典型调用方

- `src/components/form/FormTable/FormItemType.vue`
- `src/components/uiForm/UiFormItem/index.vue`
