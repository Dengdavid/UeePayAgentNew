# FormList 列表布局组件

以网格或弹性布局渲染列表，并通过 slot 交由调用方展示内容。

## 推荐入口

`src/components/form/FormList/index.vue`

组件已通过 `src/utils/components.js` 全局注册，业务模板可直接使用。

## 基本用法

```vue
<FormList :data="files" :columns="3">
  <template #default="{ item }">{{ item.name }}</template>
</FormList>
```

## Props

| 名称 | 类型 | 默认值 | 必填 | 说明 |
| --- | --- | --- | --- | --- |
| `data` | `Array` | `工厂函数` | 否 | 需要渲染的列表数据。 |
| `rowKey` | `String` | `—` | 否 | 列表项唯一字段。 |
| `columns` | `Number` | `3` | 否 | 桌面端网格列数。 |
| `margin` | `Number` | `16` | 否 | 列表间距。 |
| `radius` | `Number` | `2` | 否 | 圆角值。 |
| `padding` | `Number` | `8` | 否 | 内容内边距。 |
| `height` | `Number` | `—` | 否 | 组件高度。 |
| `isBorder` | `Boolean` | `false` | 否 | 是否显示边框。 |
| `isCenter` | `Boolean` | `false` | 否 | 是否居中内容。 |
| `isFlex` | `Boolean` | `false` | 否 | 是否使用弹性布局。 |

## Events

无自定义事件。

## Slots

| Slot | 说明 |
| --- | --- |
| `tag` | 列表标签区域。 |
| `default` | 默认内容区域。 |

## 公开方法

无 `defineExpose` 公开方法。

## 使用边界

- `rowKey` 应使用稳定唯一字段，避免使用可变化的展示文本。
- 保持现有 Props、Events 和值类型兼容；修改共享行为前检查全部直接调用方。

## 典型调用方

- `src/components/form/FormUploadFile/index.vue`
- `src/components/form/FormUploadImg/index.vue`
