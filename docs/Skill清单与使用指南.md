# Skill 清单与使用指南

本文件记录当前 Codex 环境已安装或已加载的 Skill 及 UeePayFrontend 的稳定选择边界。新安装、升级、启停或移除 Skill 后必须同步更新本清单；运行时是否已经可调用，以 Available skills、触发描述和 `SKILL.md` 为准。

## 1. 已安装与当前可用 Skill

清单同时包含当前会话可用的 Skill，以及已安装但可能需要重启或刷新后才会出现在 Available skills 中的 Skill。

类型说明：

- `项目级`：存放在当前项目 `.codex/skills` 中，仅服务于项目约定的设计与交付能力。
- `个人级`：存放在用户级 Codex Skill 目录中的自定义能力。
- `系统级`：Codex 自带的基础管理或生成能力。
- `内置插件`：随 Codex 运行环境提供的通用插件能力。
- `远程插件`：由已安装插件提供的专业能力，名称保留 `插件名:Skill名` 前缀。

| 名称 | 类型 | 描述 |
| --- | --- | --- |
| `banner-design` | 项目级 | 创建 Banner、封面、广告素材、网站 Hero 和印刷页眉。 |
| `brand` | 项目级 | 定义或评审品牌语气、视觉识别、信息表达、资产和风格指南。 |
| `design` | 项目级 | 处理品牌、Logo、Token、Banner、图标、幻灯片和社交素材等综合视觉设计。 |
| `design-system` | 项目级 | 创建或评审设计 Token、组件规范和系统化视觉规则。 |
| `finance-management-constraints` | 项目级 | 约束财务管理相关 PR 的 GitHub 提交流程、指派对象和中英文提交说明。 |
| `slides` | 项目级 | 创建包含图表、设计 Token 和响应式布局的 HTML 演示文稿。 |
| `ui-styling` | 项目级 | 构建可访问的 shadcn/ui 与 Tailwind 界面、响应式布局、主题和画布视觉。 |
| `ui-ux-pro-max` | 项目级 | 使用可搜索的 UI/UX 设计知识库辅助界面设计。 |
| `design-taste-frontend` | 个人级 | 为落地页、作品集和改版提供避免模板化的前端设计与实现流程。 |
| `hatch-pet` | 个人级 | 创建、修复、验证、视觉检查并打包 Codex v2 动画宠物。 |
| `imagegen` | 系统级 | 使用 AI 生成或编辑照片、插画、纹理、精灵、Mockup 和透明背景位图。 |
| `openai-docs` | 系统级 | 查询 OpenAI 产品、API、Codex 和模型选择的最新官方文档并提供引用。 |
| `plugin-creator` | 系统级 | 创建和初始化符合 Codex 规范的插件目录、清单与个人市场配置。 |
| `review-agent` | 系统级 | 对指定代码变更进行只读、缺陷优先的审查，并返回全部可操作问题。 |
| `skill-creator` | 系统级 | 创建或更新扩展 Codex 专业知识、工作流或工具集成的 Skill。 |
| `skill-installer` | 系统级 | 从精选列表或 GitHub 仓库安装 Codex Skill。 |
| `browser:control-in-app-browser` | 内置插件 | 控制应用内浏览器进行页面打开、导航、检查、点击、输入、截图和本地测试。 |
| `chrome:control-chrome` | 内置插件 | 使用用户现有 Chrome 标签页、登录状态或扩展完成浏览器操作。 |
| `computer-use:computer-use` | 内置插件 | 通过 Computer Use 读取或操作本地 Mac 应用界面。 |
| `visualize:visualize` | 内置插件 | 在对话中创建可视化、交互工具、图表、对比、UI Mockup 和可调场景。 |
| `documents:documents` | 远程插件 | 创建、编辑、批注和视觉验证 DOCX 或面向 Google Docs 的文档。 |
| `figma:figma-code-connect` | 远程插件 | 创建和维护将 Figma 组件映射到代码片段的 Code Connect 模板。 |
| `figma:figma-create-new-file` | 远程插件 | 在调用 Figma 新建文件能力前执行必需的前置准备。 |
| `figma:figma-design-to-code` | 远程插件 | 在获取 Figma 设计上下文并将设计实现为代码前执行必需的前置流程。 |
| `figma:figma-generate-design` | 远程插件 | 将应用页面、视图或多区块布局生成到 Figma。 |
| `figma:figma-generate-diagram` | 远程插件 | 在 Figma 中生成图表或流程图前执行必需的前置准备。 |
| `figma:figma-generate-library` | 远程插件 | 根据代码库在 Figma 中创建或更新变量、Token 和组件库。 |
| `figma:figma-implement-motion` | 远程插件 | 将 Figma 动效和动画转换为生产可用的应用代码。 |
| `figma:figma-swiftui` | 远程插件 | 在 SwiftUI 与 Figma 之间转换界面、组件和 Token。 |
| `figma:figma-use` | 远程插件 | 在调用通用 Figma 操作能力前执行必需的基础前置流程。 |
| `figma:figma-use-figjam` | 远程插件 | 为 FigJam 场景补充 Figma 操作规则。 |
| `figma:figma-use-motion` | 远程插件 | 为 Figma 动画的关键帧、缓动和时长操作提供上下文。 |
| `figma:figma-use-slides` | 远程插件 | 为 Figma Slides 场景补充 Figma 操作规则。 |
| `github:gh-address-comments` | 远程插件 | 检查 PR 中未解决的评审意见，并实现选定的修复。 |
| `github:gh-fix-ci` | 远程插件 | 调试和修复 GitHub Actions 中失败的 PR 检查。 |
| `github:github` | 远程插件 | 通过 GitHub 连接器梳理仓库、PR、Issue 和相关上下文。 |
| `github:yeet` | 远程插件 | 确认范围后提交本地变更、推送分支并创建 Draft PR。 |
| `pdf:pdf` | 远程插件 | 读取、创建、检查、渲染和验证 PDF，包括可填写的 AcroForm。 |
| `presentations:Presentations` | 远程插件 | 读取、创建或编辑 PowerPoint、PPTX 和面向 Google Slides 的演示文稿。 |
| `product-design:audit` | 远程插件 | 基于截图审查产品流程、用户旅程、漏斗、页面及可访问性。 |
| `product-design:ideate` | 远程插件 | 根据产品设计简报生成图像化设计方向、变体或重混方案。 |
| `product-design:image-to-code` | 远程插件 | 将选定图片、截图或 Mockup 忠实实现为响应式前端。 |
| `product-design:index` | 远程插件 | 为产品设计探索、研究、审查、视觉克隆、成品检查或原型分享选择正确流程。 |
| `product-design:url-to-code` | 远程插件 | 将线上 URL 克隆为可运行的本地纯前端应用。 |
| `sites:sites-building` | 远程插件 | 使用 Sites 构建落地页、作品集、Dashboard、门户和内部工具。 |
| `sites:sites-hosting` | 远程插件 | 使用 Sites 发布网站并管理部署与托管。 |
| `spreadsheets:Spreadsheets` | 远程插件 | 创建、编辑、分析和验证 XLSX、XLS、CSV、TSV 等独立表格文件。 |
| `spreadsheets:excel-live-control` | 远程插件 | 通过 ChatGPT 加载项或连接会话控制当前打开的 Excel 工作簿。 |
| `superpowers:brainstorming` | 远程插件 | 在创意工作、功能设计或行为修改前澄清意图、需求和设计。 |
| `superpowers:dispatching-parallel-agents` | 远程插件 | 在两个以上互不依赖的任务可并行执行时分派多个 Agent。 |
| `superpowers:executing-plans` | 远程插件 | 在独立会话中按已有实施计划和检查点执行任务。 |
| `superpowers:finishing-a-development-branch` | 远程插件 | 在实现和测试完成后决定分支集成、PR 或清理方式。 |
| `superpowers:receiving-code-review` | 远程插件 | 在处理代码评审意见前进行技术核验并避免盲目修改。 |
| `superpowers:requesting-code-review` | 远程插件 | 在主要功能完成或合并前请求代码评审并核对需求。 |
| `superpowers:subagent-driven-development` | 远程插件 | 在当前会话中使用相互独立的子任务执行实施计划。 |
| `superpowers:systematic-debugging` | 远程插件 | 在修复 Bug、测试失败或异常行为前系统定位根因。 |
| `superpowers:test-driven-development` | 远程插件 | 在实现功能或 Bug 修复前先编写失败测试并按 TDD 推进。 |
| `superpowers:using-git-worktrees` | 远程插件 | 在需要隔离的功能开发或计划执行前创建和校验 Git Worktree。 |
| `superpowers:using-superpowers` | 远程插件 | 在会话开始时检查并调用适用 Skill，规定 Skill 的选择优先级。 |
| `superpowers:verification-before-completion` | 远程插件 | 在宣称完成、修复或通过前运行验证并核对实际输出。 |
| `superpowers:writing-plans` | 远程插件 | 在有规格或多步骤需求时，先编写可执行的实施计划。 |
| `superpowers:writing-skills` | 远程插件 | 创建、编辑或部署前验证 Skill 时提供规范流程。 |
| `template-creator:template-creator` | 远程插件 | 根据参考文档、演示文稿、表格或视觉素材创建可复用的个人 Artifact 模板 Skill。 |

## 2. 选择原则

- 用户明确点名 Skill，或任务与运行时触发描述明确匹配时使用；强制前置 Skill 必须先执行。
- 多个 Skill 功能重叠时选择覆盖任务的最小集合；流程 Skill 先于实现 Skill。
- 普通字段、文案、局部样式、简单组件修复和常规检查，未匹配强制触发时不额外使用 Skill。
- Skill 只决定任务执行方法，不扩大文件修改、安装依赖、构建、发布或外部操作授权。
- 项目 `AGENTS.md`、专项规范和用户要求优先；Skill 输出必须回到当前 Vue、View UI Plus、组件、Token、安全和业务边界。
- 触发后完整读取对应 `SKILL.md` 及其要求的直接引用，不加载无关模板、示例或其他 Skill。

## 3. 能力路由

| 任务 | 选择规则 |
| --- | --- |
| 需求探索、调试、测试、计划、验证 | 使用运行时匹配的 Superpowers 流程 Skill；不要把多个流程重复叠加 |
| UI、品牌、设计系统、Banner | 只在任务明确需要设计产出时选择对应项目或全局设计 Skill |
| 浏览器、Chrome、Computer Use | 仅在明确要求在线验证、必须复现运行时问题，或风险等级要求时使用 |
| Figma | 只有用户明确要求 Figma 交付物或提供 Figma 设计时使用，并先执行运行时规定的前置 Skill |
| Word、PDF、PPT、Excel | 交付物类型明确匹配时使用对应 Artifact Skill |
| GitHub Issue、PR、Review、CI | 用户明确要求 GitHub 操作时使用对应 GitHub Skill；发布仍遵守 no-edit 和风险分级 |
| 网站构建、托管 | 仅在任务或项目配置明确匹配 Sites 时使用 |
| 图片生成或编辑 | 需要生成或修改位图资产时使用图片 Skill |

## 4. 项目边界

- 用户中心、财务、Recharge、提现、卡片、KYC/KYB、2FA 和开放平台优先准确、效率、合规与现有设计体系，不套用营销化页面方向。
- 普通 Vue 页面实现不引入 shadcn/Tailwind、其他 UI 框架或新设计体系。
- 浏览器验证范围遵守 `docs/测试规范.md`；构建与性能触发遵守 `docs/构建发布与性能规范.md`。
- GitHub 侧操作优先使用可用的 GitHub connector，本地 `git` 负责工作区、commit 和 push，具体遵守 `docs/GitHub工作流规范.md`。
- 项目目录中未出现在 Available skills 的 `SKILL.md` 不视为已启用能力，其内容也不能覆盖正式规范。

## 5. 使用记录

完成回复、交付文档和 PR 只记录实际影响实现或验证的 Skill 及用途；仅查看、可用但未触发或未影响结果的 Skill 不记录，未使用时写“未使用”。

清单用于说明当前环境已安装和已加载的能力；新安装或移除 Skill 时同步维护，具体版本、触发条件和当前会话是否可调用仍以运行时 Available skills 为准。
