# FormIp 地址输入组件

输入并校验单个 IP 地址。

## 推荐入口

`src/components/form/FormIp/index.vue`

组件未全局注册，需要显式导入：

```js
import FormIp from '@/components/form/FormIp/index.vue'
```

## 基本用法

```vue
<FormIp v-model="ip" @on-change="handleChange" />
```

## Props

| 名称 | 类型 | 默认值 | 必填 | 说明 |
| --- | --- | --- | --- | --- |
| `modelValue` | `String` | `null` | 否 | `v-model` 绑定值。 |
| `index` | `Number` | `—` | 否 | IP 通过校验并失焦后，作为 `on-change` 事件的唯一参数返回，便于列表场景定位当前项。 |

## Events

| 事件 | 说明 |
| --- | --- |
| `update:modelValue` | 更新 `v-model` 值。 |
| `on-change` | 值或业务状态变化后触发。 |

## Slots

无自定义 Slots。

## 公开方法

无 `defineExpose` 公开方法。

## 使用边界

- 当前未全局注册，必须显式导入；服务端仍需重新校验 IP。
- 保持现有 Props、Events 和值类型兼容；修改共享行为前检查全部直接调用方。

## 典型调用方

- `src/components/utils/newline-input.vue`
