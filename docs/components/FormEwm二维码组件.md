# FormEwm 二维码组件

根据 URL 生成带可选 Logo 的二维码画布。

## 推荐入口

`src/components/form/FormEwm/index.vue`

组件已通过 `src/utils/components.js` 全局注册，业务模板可直接使用。

## 基本用法

```vue
<FormEwm :url="qrUrl" :width="160" :height="160" />
```

## Props

| 名称 | 类型 | 默认值 | 必填 | 说明 |
| --- | --- | --- | --- | --- |
| `url` | `String` | `—` | 否 | 资源 URL。 |
| `logo` | `String` | `''` | 否 | 二维码中心覆盖图的资源地址；为空时不显示。 |
| `width` | `[Number,String]` | `120` | 否 | 组件宽度。 |
| `height` | `[Number,String]` | `0` | 否 | 组件高度。 |
| `padding` | `[Number,String]` | `8` | 否 | 二维码图片与外容器之间的内边距；数字按 `px` 处理。 |
| `radius` | `[Number,String]` | `8` | 否 | 外容器圆角；数字按 `px` 处理。 |
| `background` | `String` | `'#fff'` | 否 | 外容器背景色。 |
| `notShadow` | `Boolean` | `false` | 否 | 开启无装饰模式：移除阴影、内边距、背景和圆角，并强制占满父容器。 |

## Events

无自定义事件。

## Slots

无自定义 Slots。

## 公开方法

无 `defineExpose` 公开方法。

## 使用边界

- 二维码内容不得包含不应公开的 Token、密钥或敏感文件地址。
- 保持现有 Props、Events 和值类型兼容；修改共享行为前检查全部直接调用方。

## 典型调用方

- `src/components/layout/LayoutFooter.vue`
- `src/views/ucenter/security/components/GoogleModal.vue`
