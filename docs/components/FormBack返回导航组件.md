# FormBack 返回导航组件

渲染带标题的返回入口，并通过项目路由辅助方法执行跳转。

## 推荐入口

`src/components/form/FormBack/index.vue`

组件已通过 `src/utils/components.js` 全局注册，业务模板可直接使用。

## 基本用法

```vue
<FormBack title="交易详情" name="finance" />
```

## Props

| 名称 | 类型 | 默认值 | 必填 | 说明 |
| --- | --- | --- | --- | --- |
| `title` | `String` | `''` | 否 | 标题文案。 |
| `name` | `String` | `'/'` | 否 | 路由名称或字段名。 |
| `query` | `Object` | `工厂函数` | 否 | 路由 query 参数。 |
| `params` | `Object` | `工厂函数` | 否 | 路由 params 参数。 |

## Events

无自定义事件。

## Slots

| Slot | 说明 |
| --- | --- |
| `default` | 默认内容区域。 |

## 公开方法

无 `defineExpose` 公开方法。

## 使用边界

- `name` 使用项目路由名称；query 和 params 不得携带敏感信息。
- 保持现有 Props、Events 和值类型兼容；修改共享行为前检查全部直接调用方。

## 典型调用方

- 当前未检索到直接模板调用；该组件属于全局注册或存量兼容入口，新代码使用前应确认是否仍为推荐组件。
