# Tasks: atmu UI 壳

- [x] 移除现有 `--name` 选项契约与示例输出，保留单命令 `atmu`。
- [x] 增加 `--help` 与 `-h`：输出交互式引导信息（例如 `Run \`atmu\` (no flags) to open the UI.`）并退出码 0。
- [x] 增加 `--version` 与 `-v`：输出 `atmu` 版本号并退出码 0（优先使用 Pastel 默认行为/配置）。
- [x] 在 `package.json` 增加 `description` 字段，确保 `--help` 输出包含项目描述与交互式引导信息。
- [x] 引入并使用 `@inkjs/ui@2.0.0` 组件构建主界面。
- [x] 重构源码目录结构：引入 `src/ui/`、`src/utils/`、`src/types/`；`src/commands/` 只做装配层。
- [x] 实现主界面：仅渲染 Banner（ASCII Logo + `v<version>` + `Powered by 4096-bytes`）与操作菜单（列表，至少包含 `exit - quit atmu`）。
- [x] 新增/更新 AVA 测试：覆盖 `-h/--help` 与 `-v/--version` 输出，以及默认进入 TUI 的关键帧。
- [x] 新增端到端测试（AVA）：以子进程方式运行 `node dist/atmu.js` 覆盖 `-h/-v` 场景，并保证输出稳定（禁用颜色/交互）。
- [x] 更新 `README.md`：移除 `--name` 示例，说明 `atmu` 以交互式界面为主（`-h/--help` 为引导信息，`-v/--version` 输出版本）。
