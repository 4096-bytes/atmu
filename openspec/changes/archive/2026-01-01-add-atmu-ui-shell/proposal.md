# Change: 添加 atmu 交互式 UI 壳与帮助信息

## Why

将用户交互（Ink TUI 主界面、基本导航、帮助提示）与后续的环境修复、API 配置写入解耦，降低单次变更的范围与审阅成本，并为后续能力提供稳定的 UI “应用壳”。

## What Changes

- `atmu` 默认启动进入 Ink TUI，主界面仅包含两部分：Banner（`ATMU` + 版本号）与操作菜单（列表）。
- UI 组件使用 `@inkjs/ui@2.0.0`，菜单作为可扩展列表，为后续能力追加入口提供稳定结构。
- 支持 `--help` 及其 `-h` 别名：输出提示用户通过交互式界面操作，并以退出码 0 退出。
- 支持 `--version` 及其 `-v` 别名：输出 `atmu` 版本号并以退出码 0 退出。
- 除 `--help`/`-h` 与 `--version`/`-v` 外，忽略其他命令行参数，仍进入 TUI（不再提供 `--name` 等参数化输出）。

版本号与应用名由 Pastel 默认从 `package.json` 读取；本 Change 将补齐 `package.json.description` 以完善 `--help` 文案。

## Impact

- Affected specs: `atmu`
- **BREAKING**：移除 v0.0.1 现有示例行为（`--name` 与 `Hello, <name>` 输出），并调整 `--help` 行为为交互式引导文案。
- 本 Change 可独立交付；后续能力通过“追加/替换操作菜单项”扩展，无需改变主界面结构。

## Out of Scope（本 Change）

- 不实现 `@openai/codex-cli` 的检测/安装/升级/超时重试。
- 不实现 API 配置表单与 `~/.codex/*` 文件写入。
