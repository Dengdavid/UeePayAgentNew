# FormTable 配置表格组件

根据 table 配置提供搜索、分页、展开、选择和动态列插槽。

## 推荐入口

`src/components/form/FormTable/index.vue`

组件已通过 `src/utils/components.js` 全局注册，业务模板可直接使用。

## 基本用法

```vue
<FormTable ref="tableRef" :table="table" title="记录" @search="handleSearch">
  <template #status="{ row }"><FormDot :model-value="row.status" :options="statusOptions" /></template>
</FormTable>
```

## Props

| 名称 | 类型 | 默认值 | 必填 | 说明 |
| --- | --- | --- | --- | --- |
| `table` | `Object` | `—` | 否 | 搜索、列、数据、分页和操作配置对象。 |
| `title` | `String` | `—` | 否 | 标题文案。 |

## Events

| 事件 | 说明 |
| --- | --- |
| `search` | 发起搜索或刷新时触发。 |
| `on-expand` | 表格展开状态变化时触发。 |
| `on-selection-change` | 表格选择项变化时触发。 |

## Slots

| Slot | 说明 |
| --- | --- |
| `headerLeft` | 表格头部左侧区域。 |
| `headerRight` | 表格头部右侧区域。 |
| `expand` | 表格展开内容。 |
| 动态名称 | 按内部字段或选项名称转发的 slot。 |

## 公开方法

| 方法 | 说明 |
| --- | --- |
| `reload` | 重新加载表格数据。 |
| `setTableSearch` | 设置表格搜索条件。 |

## `table` 配置

| 字段 | 说明 |
| --- | --- |
| `api` | 存在时由组件 POST 请求数据；不存在时触发 `search` 交给父组件加载。 |
| `search` | 初始搜索参数对象。 |
| `searchThead` | 搜索字段配置数组。 |
| `thead` | 表格列配置数组，常用字段为 `title`、`key`、`type`、`align`、`width`、`fixed`。 |
| `tbody` | 可选的外部表格数据数组。 |
| `total` | 可选的外部分页总数。 |
| `notPage` | 是否隐藏分页。 |
| `notRefresh` | 是否隐藏刷新按钮。 |
| `selections` | 启用选择列，并接收当前选中行。 |
| `action` | 操作数组；每项支持 `title`、`onClick(row,index)`、`type`、`disabled(row)`、`hidden(row)`。 |
| `actionWidth` | 操作列宽度。 |

## 使用边界

- `reload` 和 `setTableSearch` 仅通过组件 ref 调用；搜索事件不得回调形成递归刷新。
- 保持现有 Props、Events 和值类型兼容；修改共享行为前检查全部直接调用方。

## 典型调用方

- `src/views/agent/rewards/detail.vue`
