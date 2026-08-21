# FormUpload 基础上传组件

封装统一上传地址、格式、大小限制和上传结果事件。

## 推荐入口

`src/components/form/FormUpload/index.vue`

组件已通过 `src/utils/components.js` 全局注册，业务模板可直接使用。

## 基本用法

```vue
<FormUpload :format="formats" @on-change="handleUpload" />
```

## Props

| 名称 | 类型 | 默认值 | 必填 | 说明 |
| --- | --- | --- | --- | --- |
| `modelValue` | `String` | `null` | 否 | 兼容输入值；当前实现不触发对应更新事件。 |
| `type` | `String` | `'select'` | 否 | 组件模式或值类型。 |
| `UploadType` | `String` | `—` | 否 | 上传内容类型，img 表示图片，其他值按文件处理。 |
| `width` | `[String,Number]` | `—` | 否 | 组件宽度。 |
| `height` | `[String,Number]` | `—` | 否 | 组件高度。 |
| `format` | `Array` | `工厂函数` | 否 | 允许上传的文件扩展名。 |
| `action` | `String` | `'/user/Certifications/upload'` | 否 | 上传接口地址。 |
| `maxSize` | `Number` | `—` | 否 | 文件大小上限。 |
| `isNotProgress` | `Boolean` | `false` | 否 | 是否隐藏上传进度内容。 |

## Events

| 事件 | 说明 |
| --- | --- |
| `update:modelValue` | 已声明的兼容事件，当前实现未触发。 |
| `update:url` | 已声明的兼容事件，当前实现未触发。 |
| `update:id` | 已声明的兼容事件，当前实现未触发。 |
| `on-change` | 上传成功后返回服务端 `res.data`。 |

## Slots

| Slot | 说明 |
| --- | --- |
| `default` | 默认内容区域。 |

## 公开方法

无 `defineExpose` 公开方法。

## 上传结果

- 上传成功后 `on-change` 接收服务端 `res.data`。
- `update:modelValue`、`update:url`、`update:id` 虽已声明，但当前实现未触发；文档按实时代码标记为兼容接口。
- `format` 使用不带点号的扩展名数组；`maxSize` 单位沿用 View UI Plus Upload。

## 使用边界

- 当前实现通过 `on-change` 返回上传结果；声明的 update 事件属于兼容接口，调用方不能依赖尚未触发的 `v-model` 回写。
- 上传认证、文件归属和访问权限由服务端控制；不得记录原始敏感文件地址。
- 保持现有 Props、Events 和值类型兼容；修改共享行为前检查全部直接调用方。

## 典型调用方

- `src/components/form/FormUploadFile/index.vue`
- `src/components/form/FormUploadImg/index.vue`
- `src/components/form/FormUploadInput/index.vue`
