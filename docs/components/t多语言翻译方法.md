# t 多语言翻译方法

本文档说明 JavaScript 代码通过 `src/utils/index.js` 使用全局 `t` 翻译函数的方法。Locale、回退、格式化和翻译质量以[多语言规范](../多语言规范.md)为准。

## 1. 导入

```js
import { t } from '@/utils'
```

`t` 指向项目唯一 i18n 实例的 `i18n.global.t`。普通脚本、事件处理和工具函数不应重新创建 i18n 实例。

## 2. 基础使用

```js
const title = t('card.index.title')
```

带参数的文案：

```js
const text = t('certify.remainingTimes', { times: remainingTimes })
```

模板内继续使用 `$t`：

```vue
<span>{{ $t('button.confirm') }}</span>
```

## 3. 响应式使用

Locale 切换后需要立即更新的文案，应在会重新执行的上下文中调用 `t()`：

```js
const title = computed(() => t('card.index.title'))

const getOptions = () => [
  { value: 'success', label: t('status.success') },
]
```

不要在模块加载时生成无法重建的静态展示数组：

```js
// 不推荐：语言切换后 label 可能保留旧值
const options = [
  { value: 'success', label: t('status.success') },
]
```

## 4. Key 与文案边界

- 新增或修改 key 前，核对 `en-US` 和所有已启用 Locale 的真实导出结构。
- 不根据文件名猜 key 路径，不创建与现有业务域平行的重复命名空间。
- 服务端返回的业务数据、状态和法律内容不能在前端凭直觉改写含义。
- 资金、认证、地区限制、协议和风险提示必须保持正式、准确，不承诺不确定结果。
- Toast、Modal 和错误提示不得通过翻译插值暴露敏感数据或服务端内部信息。

## 5. 常见场景

脚本侧提示：

```js
message(t('common.saveSuccess'))
```

动态状态映射：

```js
const statusLabel = computed(() => (
  t(`card.index.bills.status.${statusKey.value}`)
))
```

修改源文案、key 或业务含义时，需要同步全部启用 Locale，并运行文档之外对应的 i18n 检查。
