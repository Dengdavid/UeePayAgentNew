# FormUploadFile 文件上传组件

组合文件上传、文件类型图标、预览列表和示例文件弹窗。

## 推荐入口

`src/components/form/FormUploadFile/index.vue`

组件已通过 `src/utils/components.js` 全局注册，业务模板可直接使用。

## 基本用法

```vue
<FormUploadFile :model-value="fileId" v-model:url="fileUrl" tip="支持 PDF" />
```

## Props

| 名称 | 类型 | 默认值 | 必填 | 说明 |
| --- | --- | --- | --- | --- |
| `modelValue` | `未声明` | `—` | 否 | 兼容输入值；组件不触发 update:modelValue。 |
| `url` | `String` | `—` | 否 | 当前文件 URL。 |
| `width` | `Number` | `—` | 否 | 组件宽度。 |
| `height` | `Number` | `—` | 否 | 组件高度。 |
| `tip` | `String` | `—` | 否 | 上传说明 HTML。 |
| `document` | `String` | `—` | 否 | 默认文件类型图标名称。 |
| `example` | `[String,Array]` | `''` | 否 | 示例文件 URL 或 URL 数组。 |
| `fit` | `String` | `'contain'` | 否 | 预览内容适配方式。 |

## Events

| 事件 | 说明 |
| --- | --- |
| `update:url` | 更新文件或资源 URL。 |

## Slots

无自定义 Slots。

## 公开方法

无 `defineExpose` 公开方法。

## 使用边界

- 组件只发出 `update:url`；`modelValue` 当前作为兼容输入保留，不使用 `v-model` 期待其回写。
- 用于普通文件和认证资料时，必须限制格式、大小、预览范围和下载权限。
- 保持现有 Props、Events 和值类型兼容；修改共享行为前检查全部直接调用方。

## 典型调用方

- `src/views/certify/components/BusinessVerification/FieldsItem.vue`
