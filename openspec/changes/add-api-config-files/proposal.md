# Change: 添加 API 配置页并写入 ~/.codex 配置文件

## Why

将 API 配置从 `atmu` 内部存储迁移为直接编辑 Codex CLI 期望的 `~/.codex/config.toml` 与 `~/.codex/auth.json`，减少重复状态来源，并保证底层 CLI 的一致性与可移植性。

## What Changes

- 在主界面操作菜单提供 `Configure API (Advanced)` 入口，进入表单视图：
  - Provider（必填）
  - Base URL（必填，不提供默认值）
  - API Key（必填，掩码显示）
- 保存时写入/更新：
  - `~/.codex/config.toml`：顶层键 `model_provider = "<provider>"`、`disable_response_storage = true`，以及 `[model_providers.<provider>]` 段落（含 `wire_api="responses"` 等固定字段）。
  - `~/.codex/auth.json`：键为 `<PROVIDER_UPPER>_API_KEY`，值为用户输入的 API Key；Provider 相同则覆盖更新。
- 保存后提示用户重启终端/新建窗口以确保 Codex CLI 加载最新配置。
- UI 文案与交互约束：
  - 本流程所有用户可见文案均为英文，且不包含 emoji。
  - 加载/保存等异步步骤提供动效反馈（优先使用 `@inkjs/ui` 组件，例如 `Spinner` / `ProgressBar`）。
  - 警告与校验错误优先使用 `@inkjs/ui` 的徽标（例如 `Badge`），不使用 emoji。

## Impact

- Affected specs: `api-config`
- 依赖关系（建议顺序）：
  - 依赖 `add-atmu-ui-shell` 提供主界面与导航壳。
  - 建议在 `add-codex-cli-env-repair` 之后开放该入口（仅在环境 `ok` 时可用）。

## Out of Scope（本 Change）

- 不实现 Codex CLI 的安装/升级（见 `add-codex-cli-env-repair`）。
