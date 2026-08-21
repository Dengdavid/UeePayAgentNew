# FormSelectBox 选择器组件

统一单选、多选、标签回填、图片前缀和自定义选项展示。

## 推荐入口

`src/components/form/FormSelectBox/index.vue`

组件已通过 `src/utils/components.js` 全局注册，业务模板可直接使用。

## 基本用法

```vue
<FormSelectBox v-model="value" :options="options" @on-change="handleChange" />
```

## Props

| 名称 | 类型 | 默认值 | 必填 | 说明 |
| --- | --- | --- | --- | --- |
| `modelValue` | `[Array,String,Number]` | `''` | 否 | `v-model` 绑定值。 |
| `disabled` | `Boolean` | `false` | 否 | 是否禁用。 |
| `options` | `[Array,Object,String]` | `[]` | 否 | 选项集合。 |
| `width` | `[String,Number]` | `'100%'` | 否 | 组件宽度。 |
| `placeholder` | `String` | `'请选择'` | 否 | 占位文案。 |
| `labelKey` | `String` | `'label'` | 否 | 标签字段名。 |
| `valueKey` | `String` | `'value'` | 否 | 值字段名。 |
| `optionLabelKey` | `String` | `''` | 否 | 额外的选项副标签字段。 |
| `images` | `Object` | `—` | 否 | 选项图片映射。 |
| `imagesKey` | `String` | `—` | 否 | 选项图片字段名。 |
| `multiple` | `Boolean` | `false` | 否 | 是否多选。 |

## Events

| 事件 | 说明 |
| --- | --- |
| `update:modelValue` | 更新 `v-model` 值。 |
| `update:label` | 更新选中项标签。 |
| `on-change` | 值或业务状态变化后触发。 |
| `noData` | 选项数据为空时触发。 |

## Slots

| Slot | 说明 |
| --- | --- |
| `default` | 默认内容区域。 |
| `prefix` | 输入或选择器前缀区域。 |

## 公开方法

无 `defineExpose` 公开方法。

## 使用边界

- `labelKey`、`valueKey` 必须对应真实选项字段；重复 value 会造成选择语义不明确。
- 保持现有 Props、Events 和值类型兼容；修改共享行为前检查全部直接调用方。

## 典型调用方

- `src/components/form/FormSelect/index.vue`
- `src/components/form/FormTable/FormItemType.vue`
- `src/components/uiForm/UiFormItem/index.vue`
- `src/views/agent/admin/components/AdminModal.vue`
- `src/views/express/transfer/index.vue`
- `src/views/preferences/country.vue`
