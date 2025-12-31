# Tasks: Codex CLI 环境修复

- [ ] 实现环境检测：解析 `npm list -g --depth=0 --json` 得到 `missing/ok` 两态；可选解析已安装版本用于展示。
- [ ] 主界面联动：新增“环境状态区域”（位于 Banner 与操作菜单之间）；检测中该区域使用动效组件（例如 `@inkjs/ui` 的 `Spinner`）显示 `Checking environment`，并禁用操作菜单；结果为 `missing/ok` 时更新该区域内容与可用操作。
- [ ] 告警展示改用 `@inkjs/ui` 的 `Badge`（不在文案中使用 emoji）；用户可见文案全部为英文。
- [ ] 实现一键修复：当 `missing` 时执行 `npm install -g @openai/codex-cli` 并展示进度（优先使用 `Spinner` 等动效组件）。
- [ ] missing 初始化前创建 `~/.codex/` 与 `~/.codex/config.toml`（若不存在且不覆盖；允许空文件）。
- [ ] 为安装加入超时与有限重试；失败时保留错误信息并允许再次触发。
- [ ] 新增/更新 AVA 测试：覆盖 missing/ok + 修复成功/失败/超时重试等关键场景。
- [ ] 测试路径隔离：测试通过注入用户目录或设置 `HOME` 将写入目标限定在项目内临时目录（例如 `test/.tmp/home`），禁止写入真实 `~/.codex/*`。
