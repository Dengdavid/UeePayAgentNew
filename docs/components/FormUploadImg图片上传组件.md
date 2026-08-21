# FormUploadImg 图片上传组件

组合图片上传、预览列表和示例图片弹窗。

## 推荐入口

`src/components/form/FormUploadImg/index.vue`

组件已通过 `src/utils/components.js` 全局注册，业务模板可直接使用。

## 基本用法

```vue
<FormUploadImg v-model:url="imageUrl" :width="240" :height="160" />
```

## Props

| 名称 | 类型 | 默认值 | 必填 | 说明 |
| --- | --- | --- | --- | --- |
| `url` | `[String,Number]` | `—` | 否 | 当前图片 URL。 |
| `width` | `Number` | `—` | 否 | 组件宽度。 |
| `height` | `Number` | `—` | 否 | 组件高度。 |
| `tip` | `String` | `—` | 否 | 上传说明 HTML。 |
| `document` | `String` | `—` | 否 | 默认图片占位资源名称。 |
| `example` | `[String,Array]` | `''` | 否 | 示例图片 URL 或 URL 数组。 |
| `fit` | `String` | `'contain'` | 否 | 预览图片适配方式。 |

## Events

| 事件 | 说明 |
| --- | --- |
| `update:url` | 更新文件或资源 URL。 |

## Slots

无自定义 Slots。

## 公开方法

无 `defineExpose` 公开方法。

## 使用边界

- 仅展示服务端授权的图片地址；敏感认证图片不得公开或写入日志。
- 保持现有 Props、Events 和值类型兼容；修改共享行为前检查全部直接调用方。

## 典型调用方

- 当前未检索到直接模板调用；该组件属于全局注册或存量兼容入口，新代码使用前应确认是否仍为推荐组件。
