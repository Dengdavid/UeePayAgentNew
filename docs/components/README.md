# 组件与公共方法文档

本目录记录业务页面直接使用的共享组件和核心公共方法。文件名统一采用“组件名称或方法名称 + 中文说明”，文档描述当前代码契约、推荐入口、使用示例和关键边界。

通用规则仍以项目根目录 `AGENTS.md` 和 `docs/README.md` 中的专项规范为权威来源；本目录不重复定义请求、安全、路由、Store、多语言等领域规则。

## 组件文档

| 文档 | 实现入口 | 内容 |
| --- | --- | --- |
| [FormAddList 动态列表输入组件](./FormAddList动态列表输入组件.md) | `src/components/form/FormAddList/index.vue` | 维护由分隔值或数组表示的动态输入列表。 |
| [FormAffix 吸顶容器组件](./FormAffix吸顶容器组件.md) | `src/components/form/FormAffix/index.vue` | 包装 View UI Plus Affix，为内容提供顶部吸附能力。 |
| [FormBack 返回导航组件](./FormBack返回导航组件.md) | `src/components/form/FormBack/index.vue` | 渲染带标题的返回入口，并通过项目路由辅助方法执行跳转。 |
| [FormCell 信息单元组件](./FormCell信息单元组件.md) | `src/components/form/FormCell/index.vue` | 展示标题、副标题、内容和操作区的页面信息单元。 |
| [FormCheckbox 多选组件](./FormCheckbox多选组件.md) | `src/components/form/FormCheckbox/index.vue` | 将标准化选项渲染为复选框组并同步数组值。 |
| [FormCode 验证码输入组件](./FormCode验证码输入组件.md) | `src/components/form/FormCode/index.vue` | 组合验证码输入框与发送按钮，按业务 event 和邮箱请求验证码。 |
| [FormCount 数值统计组件](./FormCount数值统计组件.md) | `src/components/form/FormCount/index.vue` | 按字段配置展示统计值，并可对数值变化使用动画。 |
| [FormDateBox 日期组件](./FormDateBox日期组件使用与交互流程.md) | `src/components/form/FormDateBox/index.vue` | 统一处理日期和日期区间、快捷选项、边界限制及兼容值格式。 |
| [FormDays 日期区间兼容组件](./FormDays日期区间兼容组件.md) | `src/components/form/FormDays/index.vue` | 提供存量日期或日期区间选择能力。 |
| [FormDot 状态点组件](./FormDot状态点组件.md) | `src/components/form/FormDot/index.vue` | 根据当前值和选项映射展示状态点与文本。 |
| [FormEmail 邮箱输入组件](./FormEmail邮箱输入组件.md) | `src/components/form/FormEmail/index.vue` | 提供邮箱输入、自动补全建议和前缀区域。 |
| [FormEwm 二维码组件](./FormEwm二维码组件.md) | `src/components/form/FormEwm/index.vue` | 根据 URL 生成带可选 Logo 的二维码画布。 |
| [FormHttp 网址输入组件](./FormHttp网址输入组件.md) | `src/components/form/FormHttp/index.vue` | 在输入框前提供协议选择，并校验组合后的 URL。 |
| [FormImg 文件图标组件](./FormImg文件图标组件.md) | `src/components/form/FormImg/index.vue` | 根据文件扩展名显示项目内置文件类型图标。 |
| [FormInput 文本输入组件](./FormInput文本输入组件.md) | `src/components/form/FormInput/index.vue` | 统一文本输入、清空、搜索、回车和可选前置选择能力。 |
| [FormIp 地址输入组件](./FormIp地址输入组件.md) | `src/components/form/FormIp/index.vue` | 输入并校验单个 IP 地址。 |
| [FormItemBox 表单项容器组件](./FormItemBox表单项容器组件.md) | `src/components/form/FormItemBox/index.vue` | 统一表单标签、必填标记、校验规则、提示和说明文案。 |
| [FormJson 数据查看组件](./FormJson数据查看组件.md) | `src/components/form/FormJson/index.vue` | 以可展开的查看器展示对象或 JSON 数据。 |
| [FormList 列表布局组件](./FormList列表布局组件.md) | `src/components/form/FormList/index.vue` | 以网格或弹性布局渲染列表，并通过 slot 交由调用方展示内容。 |
| [FormListBox 详情列表组件](./FormListBox详情列表组件.md) | `src/components/form/FormListBox/index.vue` | 按配置展示对象或数组形式的详情字段，并支持编辑事件。 |
| [FormMonths 月份范围组件](./FormMonths月份范围组件.md) | `src/components/form/FormMonths/index.vue` | 通过对象字段维护开始月份和结束月份。 |
| [FormNumber 数字输入组件](./FormNumber数字输入组件.md) | `src/components/form/FormNumber/index.vue` | 封装数字输入、精度、上下限和失焦事件。 |
| [FormOptionsText 选项文本组件](./FormOptionsText选项文本组件.md) | `src/components/form/FormOptionsText/index.vue` | 根据当前值从选项集合中解析对应展示文本。 |
| [FormPercentageSlider 百分比滑块组件](./FormPercentageSlider百分比滑块组件.md) | `src/components/form/FormPercentageSlider/index.vue` | 同步滑块与数字输入框，用于受限百分比值。 |
| [FormPup 基础弹窗组件](./FormPup基础弹窗组件.md) | `src/components/form/FormPup/index.vue` | 封装基础 Modal、loading 和底部操作按钮。 |
| [FormPupBox 表单弹窗组件](./FormPupBox表单弹窗组件.md) | `src/components/form/FormPupBox/index.vue` | 根据 pup 配置渲染弹窗表单、操作按钮和校验流程。 |
| [FormRadio 单选组件](./FormRadio单选组件.md) | `src/components/form/FormRadio/index.vue` | 将标准化选项渲染为单选组并同步当前值。 |
| [FormSearchTabs 搜索标签组件](./FormSearchTabs搜索标签组件.md) | `src/components/form/FormSearchTabs/index.vue` | 将对象形式的筛选项渲染为包含“全部”的标签组。 |
| [FormSelect 异步选择组件](./FormSelect异步选择组件.md) | `src/components/form/FormSelect/index.vue` | 在 FormSelectBox 基础上支持接口加载、过滤和标签回填。 |
| [FormSelectBox 选择器组件](./FormSelectBox选择器组件.md) | `src/components/form/FormSelectBox/index.vue` | 统一单选、多选、标签回填、图片前缀和自定义选项展示。 |
| [FormSwitch 开关组件](./FormSwitch开关组件.md) | `src/components/form/FormSwitch/index.vue` | 在布尔值、数字值或字符串值之间映射开关状态。 |
| [FormTable 配置表格组件](./FormTable配置表格组件.md) | `src/components/form/FormTable/index.vue` | 根据 table 配置提供搜索、分页、展开、选择和动态列插槽。 |
| [FormUpload 基础上传组件](./FormUpload基础上传组件.md) | `src/components/form/FormUpload/index.vue` | 封装统一上传地址、格式、大小限制和上传结果事件。 |
| [FormUploadFile 文件上传组件](./FormUploadFile文件上传组件.md) | `src/components/form/FormUploadFile/index.vue` | 组合文件上传、文件类型图标、预览列表和示例文件弹窗。 |
| [FormUploadImg 图片上传组件](./FormUploadImg图片上传组件.md) | `src/components/form/FormUploadImg/index.vue` | 组合图片上传、预览列表和示例图片弹窗。 |
| [FormUploadInput 上传输入框组件](./FormUploadInput上传输入框组件.md) | `src/components/form/FormUploadInput/index.vue` | 以只读输入框展示上传结果，并通过按钮触发基础上传组件。 |
| [LoadingBox 加载提示组件](./LoadingBox加载提示组件.md) | `src/components/form/LoadingBox/index.vue` | 展示简单 loading 图标和提示文字。 |

## 核心公共方法文档

| 文档 | 实现入口 | 业务用途 |
| --- | --- | --- |
| [getApi 和 postApi 统一请求方法](./getApi和postApi统一请求方法.md) | `src/utils/api.js` | GET、POST 统一请求入口 |
| [message 和 confirm 消息交互方法](./message和confirm消息交互方法.md) | `src/utils/message.js` | Toast、确认框、文本确认和持续 loading |
| [toRoute 路由辅助方法](./toRoute路由辅助方法.md) | `src/utils/route.js` | 命名路由跳转、回退和 query 处理 |
| [useStoreRefs 状态访问方法](./useStoreRefs状态访问方法.md) | `src/utils/store.js` | Pinia state/getter 与 action 访问入口 |
| [t 多语言翻译方法](./t多语言翻译方法.md) | `src/utils/index.js` | JavaScript 侧多语言文案 |
| [copyText 文本复制方法](./copyText文本复制方法.md) | `src/utils/dataInfo.js` | 用户主动复制普通或已脱敏文本 |
| [maskCardNumber 卡片信息处理方法](./maskCardNumber卡片信息处理方法.md) | `src/utils/card.js` | 卡号脱敏和账单摘要复制 |
| [evaluateExpression 高精度金额计算方法](./evaluateExpression高精度金额计算方法.md) | `src/utils/decimal-expression-evaluator.js` | Decimal 四则运算和格式化 |
| [authLevel 认证等级读取方法](./authLevel认证等级读取方法.md) | `src/utils/level.js` | 认证等级、剩余认证次数和展示映射 |
| [regexFun 动态字段校验方法](./regexFun动态字段校验方法.md) | `src/utils/regex.js` | 动态认证字段和 URL 校验 |
| [applyPreferences 用户偏好方法](./applyPreferences用户偏好方法.md) | `src/utils/preferences.js` | 语言、国家和时区的规范化与同步 |

## 纳入边界

本目录优先记录满足以下条件的方法：

- 由 `src/views` 下业务页面直接导入，或支撑资金、认证、卡片、路由、请求等高风险公共流程。
- 已形成稳定公共契约，调用方需要理解参数、返回值或兼容行为。
- 不能仅通过方法名安全推断正确用法。

以下内容默认不单独建文档：

- 仅在工具文件内部使用的辅助函数。
- `src/utils/components.js`、`src/utils/plugin.js` 等组件注册或聚合导出清单。
- 单纯常量、枚举和映射；若与公共方法强相关，则在对应方法文档中说明。
- 单页面局部使用、行为简单且没有稳定公共契约的工具。

新增或修改本目录文档后，需要同步本索引，并运行：

```bash
yarn docs:check
```
