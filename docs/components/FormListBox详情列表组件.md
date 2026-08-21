# FormListBox 详情列表组件

按配置展示对象或数组形式的详情字段，并支持编辑事件。

## 推荐入口

`src/components/form/FormListBox/index.vue`

组件已通过 `src/utils/components.js` 全局注册，业务模板可直接使用。

## 基本用法

```vue
<FormListBox :data="detail" :data-list="fields" is-edit @edit="handleEdit" />
```

## Props

| 名称 | 类型 | 默认值 | 必填 | 说明 |
| --- | --- | --- | --- | --- |
| `data` | `Object` | `—` | 否 | 详情数据对象。 |
| `dataList` | `Array` | `—` | 否 | 字段配置数组。 |
| `list` | `Number` | `3` | 否 | 最大网格列数。 |
| `gap` | `[Number,String]` | `8` | 否 | 字段间距。 |
| `labelWidth` | `[Number,String]` | `100` | 否 | 标签宽度。 |
| `minWidth` | `Number` | `360` | 否 | 每列最小宽度。 |
| `isText` | `Boolean` | `false` | 否 | 是否使用文本模式。 |
| `isTop` | `Boolean` | `false` | 否 | 标签是否位于内容上方。 |
| `isEdit` | `Boolean` | `false` | 否 | 是否启用编辑语义。 |

## Events

| 事件 | 说明 |
| --- | --- |
| `edit` | 请求编辑当前字段时触发。 |

## Slots

| Slot | 说明 |
| --- | --- |
| `default` | 默认内容区域。 |

## 公开方法

无 `defineExpose` 公开方法。

## `dataList` 字段

| 字段 | 说明 |
| --- | --- |
| `prop` | 从 `data` 读取的字段名，同时作为列表 key。 |
| `label` | 字段标签。 |
| `value` | 可选的显式展示值，优先于 `data[prop]`。 |
| `type` | 交给 FormTable 列类型组件处理的展示类型。 |
| `span` | 当前字段跨越的网格列数。 |

## 使用边界

- 字段展示涉及卡号、证件号等信息时，传入值必须已按业务规则脱敏。
- 保持现有 Props、Events 和值类型兼容；修改共享行为前检查全部直接调用方。

## 典型调用方

- `src/components/com/CardTotalBox.vue`
- `src/components/com/ListAddBox.vue`
