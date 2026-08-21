# FormPupBox 表单弹窗组件

根据 pup 配置渲染弹窗表单、操作按钮和校验流程。

## 推荐入口

`src/components/form/FormPupBox/index.vue`

组件已通过 `src/utils/components.js` 全局注册，业务模板可直接使用。

## 基本用法

```vue
<FormPupBox ref="pupRef" :pup="pup">
  <template #default="{ form }">
    <FormInput v-model="form.name" />
  </template>
</FormPupBox>
```

## Props

| 名称 | 类型 | 默认值 | 必填 | 说明 |
| --- | --- | --- | --- | --- |
| `pup` | `Object` | `—` | 否 | 弹窗、表单、校验和操作配置对象。 |

## Events

| 事件 | 说明 |
| --- | --- |
| `scroll-bottom` | 弹窗内容滚动到底部时触发。 |

## Slots

| Slot | 说明 |
| --- | --- |
| `default` | 默认内容区域。 |

## 公开方法

| 方法 | 说明 |
| --- | --- |
| `resetFields` | 重置弹窗表单字段。 |
| `validateField` | 校验指定表单字段。 |

## `pup` 配置

| 字段 | 说明 |
| --- | --- |
| `status` | 弹窗显示状态。 |
| `title` | 弹窗标题。 |
| `form` | 表单数据对象；关闭时恢复为首次挂载时的快照。 |
| `rules` | View UI Plus Form 校验规则。 |
| `actions` | 操作数组；每项支持 `label`、`click(pup)`、`disabled(form)`。 |
| `loading` | 提交 loading；关闭弹窗时重置为 `false`。 |
| `labelPosition` / `labelWidth` | 表单标签布局。 |
| `height` / `maxHeight` / `width` | 弹窗及表单尺寸。 |
| `isNotFooter` | 是否隐藏底部操作区。 |
| `className` | 追加到弹窗的业务 class。 |

## 使用边界

- 页面内弹窗遵守 `open/close + defineExpose + success` 契约；提交结束必须恢复 loading。
- 保持现有 Props、Events 和值类型兼容；修改共享行为前检查全部直接调用方。

## 典型调用方

- `src/components/uiForm/UiTableSelect/index.vue`
- `src/views/card/components/IntoModal.vue`
- `src/views/card/components/OutModal.vue`
- `src/views/card/detail/components/CardContactModal.vue`
- `src/views/card/detail/components/CardDeliverModal.vue`
- `src/views/card/detail/components/CardPinModal.vue`
- `src/views/card/detail/components/PaymentExampleModal.vue`
- `src/views/card/detail/components/SceneBoxPup.vue`
