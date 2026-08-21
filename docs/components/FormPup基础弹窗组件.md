# FormPup 基础弹窗组件

封装基础 Modal、loading 和底部操作按钮。

## 推荐入口

`src/components/form/FormPup/index.vue`

组件已通过 `src/utils/components.js` 全局注册，业务模板可直接使用。

## 基本用法

```vue
<FormPup v-model="visible" v-model:loading="loading" title="操作确认" :actions="actions">
  弹窗内容
</FormPup>
```

## Props

| 名称 | 类型 | 默认值 | 必填 | 说明 |
| --- | --- | --- | --- | --- |
| `modelValue` | `Boolean` | `null` | 否 | 弹窗显示状态。 |
| `title` | `String` | `—` | 否 | 标题文案。 |
| `loading` | `Boolean` | `false` | 否 | 加载状态。 |
| `actions` | `Array` | `工厂函数` | 否 | 底部操作按钮配置数组。 |

## Events

| 事件 | 说明 |
| --- | --- |
| `update:modelValue` | 更新 `v-model` 值。 |
| `update:loading` | 更新 loading 状态。 |
| `on-change` | 值或业务状态变化后触发。 |

## Slots

| Slot | 说明 |
| --- | --- |
| `default` | 默认内容区域。 |

## 公开方法

无 `defineExpose` 公开方法。

## 使用边界

- 危险操作必须说明后果并防重复提交；复杂表单弹窗优先使用 `FormPupBox`。
- 保持现有 Props、Events 和值类型兼容；修改共享行为前检查全部直接调用方。

## 典型调用方

- `src/components/form/FormUploadFile/index.vue`
- `src/components/form/FormUploadImg/index.vue`
