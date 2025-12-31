# Design: Codex CLI 环境检测与一键修复

## 核心决策

- 检测使用 `npm list -g --depth=0 --json`，避免解析人类可读输出。
- 不做版本匹配：仅判断 `@openai/codex-cli` 是否已安装（`missing/ok`）。
- 修复统一走一条命令路径：`npm install -g @openai/codex-cli`。
- missing 初始化前确保 `~/.codex/config.toml` 存在（允许空文件、不覆盖）。

## 交互与状态

- 环境检测/修复流程的所有用户可见文案使用英文，且不出现 emoji。
- 增加独立的“环境状态区域”，布局位于 Banner 与操作菜单之间；环境检测/修复的状态/告警/进度全部渲染在该区域，不占用 Banner。
- 环境检测中使用动效组件（优先 `@inkjs/ui` 的 `Spinner`）呈现状态（例如 `Checking environment`），而不是仅显示静态文本。
- 环境检测未完成前，禁用操作菜单（不响应选择/确认）。
- 检测结果：
  - `missing`：使用告警 `Badge`（例如黄色）提示未安装（例如 `Codex CLI is not installed`），并提供默认选中的修复操作
  - `ok`：使用通过 `Badge`（例如绿色）显示环境通过，并展示 `Installed: <installed>`
- 修复期间显示安装进度（不强依赖真实百分比）。

## 超时与重试

- 为单次 `npm install -g ...` 设置超时上限；超时后终止子进程并记录为失败。
- 对可恢复错误（网络、超时等）做有限次数自动重试；达到上限后留在修复状态并允许用户手动再次触发。

## 测试策略

- 通过依赖注入将 `npm list -g` 与 `npm install -g` 的执行抽象出来，测试中使用 stub 控制三态与失败类型。
- Ink 测试断言关键英文文案与结构（避免依赖动态 spinner 帧）。
- 任何测试场景不得读写真实 `~/.codex/*`；测试 SHALL 通过“可注入的用户目录解析”或“设置 `HOME` 环境变量”将用户目录指向项目内临时目录（建议在仓库内，例如 `test/.tmp/home`），并在测试结束后清理。
- 建议将 `test/.tmp/` 加入 `.gitignore`，避免误提交测试残留文件。
