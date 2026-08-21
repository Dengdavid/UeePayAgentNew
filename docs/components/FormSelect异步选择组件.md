# FormSelect 异步选择组件

在 FormSelectBox 基础上支持接口加载、过滤和标签回填。

## 推荐入口

`src/components/form/FormSelect/index.vue`

组件已通过 `src/utils/components.js` 全局注册，业务模板可直接使用。

## 基本用法

```vue
<FormSelect v-model="status" :options="statusOptions" @on-change="handleChange" />
```

## Props

| 名称 | 类型 | 默认值 | 必填 | 说明 |
| --- | --- | --- | --- | --- |
| `modelValue` | `[Array,Number,String,null]` | `—` | 否 | `v-model` 绑定值。 |
| `label` | `String` | `—` | 否 | 展示标签。 |
| `width` | `[String,Number]` | `'100%'` | 否 | 组件宽度。 |
| `placeholder` | `String` | `'请选择'` | 否 | 占位文案。 |
| `labelName` | `String` | `'label'` | 否 | 选项标签字段名。 |
| `valueName` | `String` | `'value'` | 否 | 选项值字段名。 |
| `isArr` | `Boolean` | `false` | 否 | 多选时是否以数组回写。 |
| `disabled` | `Boolean` | `false` | 否 | 是否禁用。 |
| `multiple` | `Boolean` | `false` | 否 | 是否多选。 |
| `transfer` | `Boolean` | `false` | 否 | 是否将下拉层转移到 body。 |
| `apiUrl` | `String` | `''` | 否 | 远程选项接口地址。 |
| `params` | `Object` | `工厂函数` | 否 | 远程选项请求参数。 |
| `optionsObj` | `Object` | `—` | 否 | 调用方提供的选项缓存对象。 |
| `optionsKey` | `String` | `—` | 否 | 选项缓存键。 |
| `optionsFilter` | `[Array,String]` | `工厂函数` | 否 | 需要排除的选项值。 |
| `method` | `String` | `'get'` | 否 | 远程请求方法，支持 get 或 post。 |
| `options` | `[Array,Object,String]` | `工厂函数` | 否 | 选项集合。 |

## Events

| 事件 | 说明 |
| --- | --- |
| `update:modelValue` | 更新 `v-model` 值。 |
| `update:label` | 更新选中项标签。 |
| `on-change` | 值或业务状态变化后触发。 |
| `noData` | 选项数据为空时触发。 |

## Slots

| Slot | 说明 |
| --- | --- |
| `default` | 默认内容区域。 |

## 公开方法

无 `defineExpose` 公开方法。

## 选项来源与值格式

- `options` 支持数组、对象或逗号分隔字符串；存在本地选项时优先使用本地数据。
- `apiUrl` 非空时按 `method` 和 `params` 加载远程选项；响应支持数组、`data` 数组或 `list` 数组。
- `optionsFilter` 排除指定 value；`optionsKey` 可作为稳定缓存键。
- 多选且 `isArr=true` 时回写数组，否则回写逗号分隔字符串；`label` 以相同形态同步。

## 使用边界

- 接口调用沿用组件现有统一请求入口；选项为空时通过 `noData` 处理，不伪造业务值。
- 保持现有 Props、Events 和值类型兼容；修改共享行为前检查全部直接调用方。

## 典型调用方

- `src/views/certify/components/BusinessVerification/FieldsItem.vue`
