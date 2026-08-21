# FormCell 信息单元组件

展示标题、副标题、内容和操作区的页面信息单元。

## 推荐入口

`src/components/form/FormCell/index.vue`

组件已通过 `src/utils/components.js` 全局注册，业务模板可直接使用。

## 基本用法

```vue
<FormCell title="账户状态" sub="当前状态">
  Active
  <template #btn><Button>查看</Button></template>
</FormCell>
```

## Props

| 名称 | 类型 | 默认值 | 必填 | 说明 |
| --- | --- | --- | --- | --- |
| `title` | `String` | `''` | 否 | 标题文案。 |
| `sub` | `String` | `''` | 否 | 显示在标题右侧的次要文字。 |
| `type` | `String` | `'default'` | 否 | 组件模式或值类型。 |
| `isBg` | `Boolean` | `false` | 否 | 是否为整个单元容器添加背景和圆角。 |
| `isTop` | `Boolean` | `false` | 否 | 是否为内容区添加背景和圆角。 |
| `margin` | `[String,Number]` | `'10px'` | 否 | 同时用作容器的下外边距与内容区的上外边距；数字按 `px` 处理。 |
| `padding` | `[String,Number]` | `0` | 否 | 单元容器内边距；数字按 `px` 处理。 |
| `isShowValue` | `Boolean` | `true` | 否 | 内容区初始是否展开；仅在初始化时读取。 |
| `isNotShow` | `Boolean` | `false` | 否 | 是否隐藏“展开 / 收起”控件；不会强制改变当前展开状态。 |
| `isBorder` | `Boolean` | `false` | 否 | 兼容性参数；当前模板未将其绑定到 class，传入后不会产生样式变化。 |

## Events

无自定义事件。

## Slots

| Slot | 说明 |
| --- | --- |
| `btn` | 右侧操作区域。 |
| `default` | 默认内容区域。 |

## 公开方法

无 `defineExpose` 公开方法。

## 使用边界

- 适合详情信息展示，不替代表单项或表格单元格。
- 保持现有 Props、Events 和值类型兼容；修改共享行为前检查全部直接调用方。

## 典型调用方

- `src/views/agent/inviteCode/index.vue`
- `src/views/express/detail/index.vue`
- `src/views/express/transfer/index.vue`
