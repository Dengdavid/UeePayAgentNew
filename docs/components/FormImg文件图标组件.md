# FormImg 文件图标组件

根据文件扩展名显示项目内置文件类型图标。

## 推荐入口

`src/components/form/FormImg/index.vue`

组件已通过 `src/utils/components.js` 全局注册，业务模板可直接使用。

## 基本用法

```vue
<FormImg src="statement.pdf" :width="40" :height="40" />
```

## Props

| 名称 | 类型 | 默认值 | 必填 | 说明 |
| --- | --- | --- | --- | --- |
| `src` | `String` | `—` | 否 | 文件名或资源路径。 |
| `width` | `[Number,String]` | `—` | 否 | 组件宽度。 |
| `height` | `[Number,String]` | `—` | 否 | 组件高度。 |

## Events

无自定义事件。

## Slots

无自定义 Slots。

## 公开方法

无 `defineExpose` 公开方法。

## 使用边界

- 用于文件类型图标，不用于普通业务图片展示。
- 保持现有 Props、Events 和值类型兼容；修改共享行为前检查全部直接调用方。

## 典型调用方

- `src/components/form/FormUploadFile/index.vue`
