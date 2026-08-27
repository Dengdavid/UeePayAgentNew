# UeePayAgent

优易付（UeePay）代理商端白标站点前端，包含代理站点用户中心及授权管理员后台。

当前路由和页面覆盖注册登录、控制台、卡片、Express、认证、财务、消息、安全设置，以及管理员可访问的站点运营管理。实际可用能力由服务端权限、站点配置、地区限制与风控结果决定；前端不得绕过登录、2FA、认证、风控、地区限制或敏感信息保护。

## 技术栈

- Vue 3
- Vite 5
- View UI Plus
- Pinia
- Vue Router
- vue-i18n
- axios
- Less
- yarn

依赖版本以 `package.json` 和 `yarn.lock` 为准。仓库当前尚未固定 Node.js 与 Yarn 版本；首次安装或 CI 环境升级前，应先确认团队统一版本，并在 `.nvmrc`、`packageManager` 或 CI 配置中固化后再更新本文档。

## 快速开始

```bash
yarn
yarn dev
```

默认开发端口为 `5176`。当前 Vite 开发代理将 `/agent` 指向配置的代理商端 API 环境，将 `/ipapi` 指向 `https://ipapi.co`。不要在代码、文档或提交记录中写入生产密钥、Token、完整卡号、CVV、OTP、证件资料或其他敏感配置。

### 常用命令

```bash
yarn dev        # 默认开发环境
yarn devTest    # 以 testMode 启动开发服务
yarn build      # 默认生产构建
yarn buildTest  # 以 testMode 执行构建
yarn preview    # 本地预览构建产物
yarn docs:check # 文档链接、锚点、路径和命令检查
```

当前 `package.json` 尚未提供 lint、单元测试、E2E、bundle analyze 或 Lighthouse CLI 脚本。不得在文档或 PR 中声称运行了不存在的命令；现阶段按[测试规范](./docs/测试规范.md)和[构建发布与性能规范](./docs/构建发布与性能规范.md)执行可用验证，并如实记录未自动化范围。

`testMode` 当前不代表完整独立的 API 环境；具体作用和代理边界以[技术规范](./docs/技术规范.md#21-运行环境与版本)为准。

## 目录结构

```text
src/api          API 与统一请求封装
src/router       登录注册、用户中心和管理员路由
src/store        Pinia 状态
src/views        页面与业务模块
src/components   共享组件
src/locales      多语言入口与语言包
src/config       API host、站点与业务配置
src/utils        路由、Store、金额、日期、设备、文本等工具
src/theme        View UI Plus 与全局 Less 主题
docs             项目专项规范
```

## 开发前必读

1. 阅读当前项目 `AGENTS.md` 和上级 `../AGENTS.md`。
2. 从[文档索引](./docs/README.md)选择与任务对应的专项规范。
3. 检查当前分支与工作区，保留用户已有未提交改动。
4. 阅读目标页面、路由、Store、API 和共享组件后再修改。
5. 只修改当前需求直接相关的文件。

核心边界：

- 所有业务请求优先经过 `src/api/request.js`，保留 `410`、`429`、`451` 和 `-100` 处理。
- 组件内站内跳转统一使用 `src/utils/route.js`。
- Store 优先通过 `src/utils/store.js` 暴露的入口使用。
- 所有业务数字计算使用 `decimal.js` 或项目已有 Decimal 工具，具体写法与边界见 [decimal.js 数值计算规范](./docs/decimal.js数值计算规范.md)。
- 用户可见文案遵守多语言同步与金融合规要求。
- PAN、CVV、OTP、证件资料、密钥不得出现在页面、Console、Toast 或提交记录中。

## 验证与发布

普通局部样式、文案和文档修改默认不运行完整构建。用户明确要求构建、完整验证、完成项目、提交 PR、更新 PR，或改动影响路由加载、依赖、构建配置、全局样式入口等高风险基础设施时，按以下文档执行：

- [测试规范](./docs/测试规范.md)
- [构建发布与性能规范](./docs/构建发布与性能规范.md)
- [GitHub 工作流规范](./docs/GitHub工作流规范.md)

只要执行了构建，就必须继续检查浏览器 Console、页面与资源加载、Lighthouse、bundle size，并记录懒加载判断和前后数据。构建、完整验收或性能优化任务可以在授权范围内整改；提交 PR、更新 PR 阶段保持 no-edit，发现需整改时停止发布并请求确认。构建成功本身不是完整验收结果。

## 文档维护

- `README.md` 负责项目入口、启动方式和文档导航。
- `AGENTS.md` 负责必须执行的项目级硬规则。
- `docs/技术规范.md` 负责工程基线。
- 专项规范负责各自业务或技术领域的详细规则。
- 同一规则只保留一个详细权威来源，其他文档使用摘要和链接引用。

当命令、依赖、端口、代理、目录结构、验证流程或发布流程变化时，应同步更新对应文档。
修改项目规则或说明文档后运行 `yarn docs:check`，确保本地链接、章节锚点、项目路径和文档中的 yarn 命令仍有效。
