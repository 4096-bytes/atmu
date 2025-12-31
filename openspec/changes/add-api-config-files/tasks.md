# Tasks: API 配置文件写入

- [ ] API 配置页：Provider（必填）、Base URL（必填，无默认）、API Key（必填，掩码）。
- [ ] 保存逻辑：写入/更新 `~/.codex/config.toml` 与 `~/.codex/auth.json`；Provider 相同则覆盖 `base_url` 与 API Key。
- [ ] `config.toml` 更新：采用受控段落更新策略（不新增依赖），确保更新/插入顶层键与 `[model_providers.<provider>]` 段落，同时尽量保留其他内容。
- [ ] 主界面 Banner 区域展示 Provider 与 Base URL（不显示明文 API Key）。
- [ ] 保存成功后提示重启终端/新建窗口，并返回主菜单。
- [ ] UI 文案与组件：所有用户可见文案为英文且不含 emoji；异步步骤使用 `@inkjs/ui` 动效组件（例如 `Spinner` / `ProgressBar`）；警告/校验错误使用 `@inkjs/ui` 徽标（例如 `Badge`）。
- [ ] 新增/更新 AVA 测试：覆盖表单校验、写入文件内容、覆盖更新逻辑与重启提示。
- [ ] 测试路径隔离：测试通过注入用户目录或设置 `HOME` 将写入目标限定在项目内临时目录（例如 `test/.tmp/home`），禁止写入真实 `~/.codex/*`。
