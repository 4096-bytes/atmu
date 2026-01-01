# Tasks: Codex CLI 环境 Setup

- [x] 实现环境检测：解析 `npm list -g --depth=0 --json` 得到 `missing/ok` 两态；可选解析已安装版本用于展示。
- [x] 主界面联动：新增“环境状态区域”（位于 Banner 与操作菜单之间）；检测中该区域使用动效组件（例如 `@inkjs/ui` 的 `Spinner`）显示 `Checking environment`，并禁用操作菜单；结果为 `missing/ok` 时更新该区域内容与可用操作。
- [x] 告警展示改用 `@inkjs/ui` 的 `Badge`（不在文案中使用 emoji）；用户可见文案全部为英文。
- [x] 实现一键 Setup：当 `missing` 时执行 `npm install -g @openai/codex` 并展示进度（优先使用 `Spinner` 等动效组件）。
- [x] Setup 期间锁定交互：当安装进行中，禁用操作菜单以避免重复触发；状态与进度均在“环境状态区域”展示。
- [x] missing 初始化前创建 `~/.codex/` 与 `~/.codex/config.toml`（若不存在且不覆盖；允许空文件）。
- [x] 为安装加入超时与有限重试；失败时保留错误信息并允许再次触发。
- [x] 新增/更新 AVA 测试：覆盖 missing/ok + Setup 成功/失败/超时重试等关键场景。
- [x] 测试路径隔离：测试通过注入用户目录或设置 `HOME` 将写入目标限定在项目内临时目录（例如 `test/.tmp/home`），禁止写入真实 `~/.codex/*`。
