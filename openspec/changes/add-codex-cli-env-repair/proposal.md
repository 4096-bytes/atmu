# Change: 添加 Codex CLI 环境检测与一键修复

## Why

将“环境完整性校验 + 一键安装 + 超时重试”等网络与系统副作用能力独立成变更，便于单独审阅风险（权限/网络/超时），并可在 UI 壳之上迭代交付。

## What Changes

- 启动自检：通过 `npm list -g --json` 检测 `@openai/codex-cli` 是否安装，产出 `missing/ok` 两态（不做版本匹配；可选解析已安装版本用于展示）。
- 缺失时一键修复：在主界面展示明确告警与默认选中的修复操作，执行 `npm install -g @openai/codex-cli` 并展示进度。
- missing 初始化前准备：在用户目录创建 `~/.codex/` 与 `~/.codex/config.toml`（允许空文件，不覆盖已有内容）。
- Resilience：安装具备超时上限与有限重试；失败后留在主界面修复状态并允许再次触发。
- 交互约束：环境检测/修复流程的用户可见文案全部使用英文，不出现 emoji；告警优先使用 `@inkjs/ui` 的 `Badge`；检测与修复过程使用 `@inkjs/ui` 的动效组件（例如 `Spinner`）。
- 布局约束：环境检测/修复的状态与告警不占用 Banner 区域，而是显示在 Banner 与操作菜单之间的“环境状态区域”。

## Impact

- Affected specs: `codex-cli`
- 风险与约束：
  - 全局安装需要网络与系统权限；必须避免假死（超时/重试/错误可视化）。
- 依赖关系（建议顺序）：
  - 依赖 `add-atmu-ui-shell` 提供主界面骨架与交互入口。

## Out of Scope（本 Change）

- 不实现 API 配置表单与 `~/.codex/auth.json` 写入（见 `add-api-config-files`）。
