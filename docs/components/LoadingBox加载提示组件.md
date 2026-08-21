# LoadingBox 加载提示组件

展示简单 loading 图标和提示文字。

## 推荐入口

`src/components/form/LoadingBox/index.vue`

组件已通过 `src/utils/components.js` 全局注册，业务模板可直接使用。

## 基本用法

```vue
<LoadingBox text="加载中" />
```

## Props

| 名称 | 类型 | 默认值 | 必填 | 说明 |
| --- | --- | --- | --- | --- |
| `text` | `String` | `'loading'` | 否 | 加载图标下方显示的提示文字。 |

## Events

无自定义事件。

## Slots

无自定义 Slots。

## 公开方法

无 `defineExpose` 公开方法。

## 使用边界

- 仅用于局部加载提示；页面级 loading 优先使用页面容器能力。
- 保持现有 Props、Events 和值类型兼容；修改共享行为前检查全部直接调用方。

## 典型调用方

- `src/components/layout/CardBox.vue`
