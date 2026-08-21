# FormUploadInput 上传输入框组件

以只读输入框展示上传结果，并通过按钮触发基础上传组件。

## 推荐入口

`src/components/form/FormUploadInput/index.vue`

组件已通过 `src/utils/components.js` 全局注册，业务模板可直接使用。

## 基本用法

```vue
<FormUploadInput v-model="fileUrl" placeholder="点击上传文件" @on-change="handleChange" />
```

## Props

| 名称 | 类型 | 默认值 | 必填 | 说明 |
| --- | --- | --- | --- | --- |
| `modelValue` | `未声明` | `—` | 否 | `v-model` 绑定值。 |
| `placeholder` | `String` | `'点击上传文件'` | 否 | 占位文案。 |

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

- 适合单文件入口；复杂预览和示例说明使用 `FormUploadFile` 或 `FormUploadImg`。
- 保持现有 Props、Events 和值类型兼容；修改共享行为前检查全部直接调用方。

## 典型调用方

- `src/components/uiForm/UiFormItem/index.vue`
