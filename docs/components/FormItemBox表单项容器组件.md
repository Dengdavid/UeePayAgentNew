# FormItemBox 表单项容器组件

统一表单标签、必填标记、校验规则、提示和说明文案。

## 推荐入口

`src/components/form/FormItemBox/index.vue`

组件已通过 `src/utils/components.js` 全局注册，业务模板可直接使用。

## 基本用法

```vue
<FormItemBox label="邮箱" prop="email" is-required :rules="rules">
  <FormInput v-model="form.email" />
</FormItemBox>
```

## Props

| 名称 | 类型 | 默认值 | 必填 | 说明 |
| --- | --- | --- | --- | --- |
| `label` | `String` | `''` | 否 | 展示标签。 |
| `labelSub` | `String` | `''` | 否 | 显示在主标签右侧的次要说明。 |
| `prop` | `String` | `'id'` | 否 | 表单字段路径。 |
| `isRequired` | `Boolean` | `false` | 否 | 是否显示必填状态。 |
| `trigger` | `[String,Array]` | `'change,blur'` | 否 | 内置必填校验的触发时机，直接传给 View UI Plus 校验规则。 |
| `rules` | `[Object,Array]` | `—` | 否 | 表单校验规则。 |
| `tips` | `String` | `''` | 否 | 标签旁问号图标的 Tooltip 内容；为空时不显示图标。 |
| `desc` | `String` | `''` | 否 | 表单控件下方的辅助说明；表单项校验失败时样式会将其隐藏。 |

## Events

无自定义事件。

## Slots

| Slot | 说明 |
| --- | --- |
| `default` | 默认内容区域。 |

## 公开方法

无 `defineExpose` 公开方法。

## 使用边界

- 必须放在兼容的 Form 上下文中；`prop` 与表单数据字段保持一致。
- 保持现有 Props、Events 和值类型兼容；修改共享行为前检查全部直接调用方。

## 典型调用方

- `src/components/uiForm/UiPage/PageSearchPhone.vue`
- `src/views/card/components/IntoModal.vue`
- `src/views/card/components/OutModal.vue`
- `src/views/card/detail/components/CardContactModal.vue`
- `src/views/card/detail/components/CardPinModal.vue`
- `src/views/certify/components/BusinessVerification/FieldsItem.vue`
- `src/views/express/components/ExpressReceiverTab/components/DetailPup.vue`
- `src/views/express/components/ExpressSenderTab/components/DetailPup.vue`
