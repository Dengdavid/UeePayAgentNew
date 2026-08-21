# GitHub 工作流规范

本文档负责 UeePayFrontend 的 Issue、分支、commit、push 和 PR 发布流程。验证范围按最终 diff 的风险决定，避免低风险 PR 重复执行完整构建与性能验收，同时保持范围、安全和结果可追踪。

## 1. 授权与发布边界

- 普通修改只形成本地变更和必要验证；仅当用户单独明确提出 `提交PR`、`更新PR` 或 `创建PR` 时才执行 commit、push 和 PR 操作。
- GitHub 开发或发布流程必须先有 Issue；仅做本地修改时可以暂时形成未提交 diff。
- 不得在 `master`、`main` 或 `develop` 上开发或提交业务改动。
- `提交PR` 只发布当前分支，不授权新建或切换分支；当前分支不满足发布条件时停止并说明。
- 发布请求立即进入 no-edit：只检查、验证、暂存、commit、push 和创建或更新 PR。若需要修改文件或扩大范围，停止并请求确认。
- 混合工作区只显式暂存本次 Issue 的目标文件，不得带入无关改动、临时文件、构建产物或缓存。
- Issue、commit、PR、评论和验证记录不得包含密钥、Token、完整 PAN、CVV、OTP、证件资料或其他敏感值。
- 禁止合并或直接更新 `origin/master`；允许创建以 `master` 为目标但保持未合并、由负责人最终合并的 PR。
- `提交PR` 不包含“合并到沙箱”；只有用户在当前任务明确说出该指令时才执行第 7 节。

## 2. Issue 与分支

仅在用户要求新建 Issue、启动 issue-first 流程，或发布前没有可确认的 Issue 时创建 Issue。标题和正文使用中文：

```text
标题：
<简短中文摘要>

背景：
- 为什么需要该变更

范围：
- 本次处理哪些页面、组件、接口或文档

验收标准：
- 可验证的完成标准

风险：
- 是否涉及资金、卡片、KYC/KYB、2FA、开放平台、敏感信息或公开合规文案
```

Issue 范围不得混入无关优化；涉及共享组件、路由、Store、多语言或图标时引用对应专项规范。

Issue 分支默认直接使用编号，例如 `#262`。用户只说 `拉取分支 #262` 时，不自动提交或创建 PR；shell 中必须引用含 `#` 的分支名：

```bash
git switch -c '#262' origin/master
git switch '#262'
git push -u origin '#262'
```

创建或切换前检查当前分支、目标分支和工作区。不得丢弃用户改动；切换可能覆盖改动时停止并说明。

## 3. 统一 PR 发布流程

`提交PR`、`创建PR` 和 `更新PR` 共用以下流程：

1. 确认当前分支、Issue、已有 PR、工作区状态和目标 diff。
2. 按第 4 节确定风险等级，只运行该等级及实际触发的验证。
3. 验证需要修改文件或扩大范围时停止 no-edit，报告 blocker 并等待用户确认。
4. 验证通过后使用明确路径暂存目标文件，并检查 staged diff。
5. 创建 commit，push 当前 Issue 分支。
6. 通过 GitHub connector 创建或更新 PR，并维护标题、正文或评论。
7. 报告 Issue、branch、commit、push、PR URL、验证结果和未覆盖范围。

当前分支已有打开中的 PR 时，`提交PR` 和 `更新PR` 默认追加到该 PR，不创建重复 PR；push 后更新原 PR 的描述或评论。`更新PR` 但未找到对应 PR 时，停止并确认是创建新 PR 还是只 push 分支。

发布前最低检查：

```bash
git status --short
git diff --stat
git diff --check
git diff --cached --check
```

## 4. 风险分级验证

先按最终 diff 选择最高风险等级，再叠加任务明确要求的专项验证：

| 等级 | 示例 | PR 前最低验证 |
| --- | --- | --- |
| 低 | 文档、非用户可见注释、局部无逻辑样式 | 目标 diff + `git diff --check`；文档再运行 `yarn docs:check`，不构建、不使用浏览器 |
| 中 | 页面交互、表单、表格、i18n、普通 API 展示 | 静态检查 + `yarn build` + 目标页面、移动端和 Console 验证 |
| 高 | 共享组件、路由、Store、请求封装、全局样式、依赖、构建配置 | 中风险验证 + 代表性调用方、关键资源和相关回归 |
| 关键 | 资金、卡状态、KYC/KYB、2FA、权限、开放平台、敏感信息 | 高风险验证 + 关键流程、服务端边界和回滚说明 |

以下任一条件才执行 Lighthouse、bundle 分析、懒加载检查和性能记录：

- 用户明确要求完整验收或性能验证。
- 修改依赖、Vite 配置、应用入口、路由加载或构建模式。
- 修改图片加载、懒加载、chunk、CSS 体积或第三方资源。
- 构建输出或运行证据显示性能、资源或拆包风险。

`yarn buildTest` 仅在用户明确要求测试模式构建时使用。验证必须基于最终 diff；无法执行的步骤如实说明环境限制和未验证范围，不填虚假数据。

## 5. Commit 与 PR 内容

Commit 标题使用英文：

```text
#<issue-number> fix: <short English summary>
#<issue-number> feature: <short English summary>
#<issue-number> docs: <short English summary>
```

不得在 commit 中写敏感信息或混入多个无关 Issue。

PR 标题和正文使用中文，保留 `fix`、`docs`、`Refs` 等项目标识：

```text
#<issue-number> fix: <简短中文摘要>
#<issue-number> docs: <简短中文摘要>
```

```markdown
## 背景
- 为什么需要该变更。

## 修改内容
- 本次修改了什么。

## 影响范围
- 受影响的页面、组件、路由、Store、接口或文档。

## 验证结果
- 已执行的检查及结果。
- 未执行或受限的验证及原因。

## Skills
- 实际影响实现或验证的 Skill；未使用时写“未使用”。

## 风险与回滚
- 风险等级、敏感领域和回滚方式。

Refs #<issue-number>
```

仅在触发性能专项时增加“构建与性能验证”小节。共享组件列出受影响页面，多语言说明同步语言，关键业务单列风险；完整解决 Issue 才使用 `Closes`、`Fixes` 或 `Resolves`，阶段性 PR 使用 `Refs`。

## 6. 工具与暂存

- 本地 `git` 负责分支、diff、显式暂存、commit 和 push。
- GitHub connector 优先负责 Issue / PR 查询、创建、更新、正文和评论；本地 `gh` 仅在 connector 不可用、缺少能力或失败时作为 fallback。
- 不因 `gh auth status` 失败或 token 失效而跳过可用的 GitHub connector。
- GitHub 操作失败时保留本地分支和 commit；push 已成功但 PR 创建失败时报告 branch 和 commit，等待重试。

禁止 `git add .`、`git add -A`，以及暂存用户未要求的文件。文件名包含 `copy` 的临时页面默认不提交；`AGENTS.md` 和 `docs/` 仅在属于当前 Issue 的目标范围时提交。

## 7. 合并到沙箱

仅当用户当前任务明确说“合并到沙箱”，且 PR 已创建或更新、当前分支已推送、工作区无未提交改动时执行：

1. 记录原 PR / Issue 分支并 `git fetch origin`。
2. 将本地 `develop` fast-forward 到 `origin/develop`，不得以旧状态覆盖远端。
3. 将原分支合并到本地 `develop`，确认只包含当前 PR 后 push 到 `origin/develop`。
4. push 成功后切回原分支，确认分支和工作区状态。

禁止 force push、删除远端分支、更新 `origin/master`、自动解决冲突或改写历史。fetch、fast-forward、merge 或 push 任一步失败时停止并安全返回原分支；无法返回时报告现场。只有 push 成功且已返回原分支，才能说明沙箱同步完成。

## 8. 阻塞与完成报告

当前分支或 Issue 不匹配、diff 混入无关文件、验证失败、GitHub 不可用或发布需要改文件时，停止当前步骤，不隐藏失败、不擅自修复或扩大范围。保留已完成的 branch、commit、push 和验证结果，并说明卡点和下一步所需授权。

完成回复只报告实际执行的 Issue、branch、commit、push、PR URL、验证、Skills、风险和未覆盖范围，不得把未执行步骤写成已完成。
