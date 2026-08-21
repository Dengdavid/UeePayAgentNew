# FormAffix 吸顶容器组件

包装 View UI Plus Affix，为内容提供顶部吸附能力。

## 推荐入口

`src/components/form/FormAffix/index.vue`

组件已通过 `src/utils/components.js` 全局注册，业务模板可直接使用。

## 基本用法

```vue
<FormAffix :top="16">
  <PageTitle />
</FormAffix>
```

## Props

| 名称 | 类型 | 默认值 | 必填 | 说明 |
| --- | --- | --- | --- | --- |
| `top` | `Number` | `0` | 否 | 吸附时距离顶部的像素值。 |

## Events

无自定义事件。

## Slots

| Slot | 说明 |
| --- | --- |
| `default` | 默认内容区域。 |

## 公开方法

无 `defineExpose` 公开方法。

## 使用边界

- 只负责吸附布局，不承载页面状态或业务行为。
- 保持现有 Props、Events 和值类型兼容；修改共享行为前检查全部直接调用方。

## 典型调用方

- 当前未检索到直接模板调用；该组件属于全局注册或存量兼容入口，新代码使用前应确认是否仍为推荐组件。
