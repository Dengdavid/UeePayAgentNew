# FormSearchTabs 搜索标签组件

将对象形式的筛选项渲染为包含“全部”的标签组。

## 推荐入口

`src/components/form/FormSearchTabs/index.vue`

组件未全局注册，需要显式导入：

```js
import FormSearchTabs from '@/components/form/FormSearchTabs/index.vue'
```

## 基本用法

```vue
<FormSearchTabs v-model="status" :options="statusOptions" @change="search" />
```

## Props

| 名称 | 类型 | 默认值 | 必填 | 说明 |
| --- | --- | --- | --- | --- |
| `modelValue` | `[String,Number]` | `''` | 否 | `v-model` 绑定值。 |
| `options` | `Object` | `工厂函数` | 是 | 筛选项对象。 |
| `allLabel` | `String` | `'全部'` | 否 | “全部”选项的展示文案。 |

## Events

| 事件 | 说明 |
| --- | --- |
| `update:modelValue` | 更新 `v-model` 值。 |
| `change` | 筛选标签变化时触发。 |

## Slots

无自定义 Slots。

## 公开方法

无 `defineExpose` 公开方法。

## 使用边界

- 当前未全局注册，必须显式导入；`options` 为必填对象。
- 保持现有 Props、Events 和值类型兼容；修改共享行为前检查全部直接调用方。

## 典型调用方

- 当前未检索到直接模板调用；该组件属于全局注册或存量兼容入口，新代码使用前应确认是否仍为推荐组件。
