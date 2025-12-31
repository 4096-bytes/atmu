# Design: API 配置写入 ~/.codex/config.toml 与 ~/.codex/auth.json

## 文件写入原则

- 不再使用 `conf` 另存一份 API Key/Base URL/Provider，避免双写与漂移。
- 保存时确保 `~/.codex/` 目录存在。
- 优先不引入新依赖：在满足需求的前提下，TOML 采用“受控段落更新”策略（文本级别更新指定键与指定 provider 段落），JSON 使用 Node.js 原生读写与 `JSON.parse/stringify`。

## config.toml 更新策略

- 始终写入/更新顶层键：
  - `model_provider = <provider>`
  - `disable_response_storage = true`
- 写入/更新 `[model_providers.<provider>]` 段落：
  - `name = "<provider>"`
  - `base_url = "<base_url>"`
  - `wire_api = "responses"`
  - `temp_env_key = "<PROVIDER_UPPER>_API_KEY"`
  - `requires_openai_auth = true`
- Provider 相同则覆盖更新 `base_url` 等字段；Provider 不同则新增段落。

## auth.json 更新策略

- 读取现有 `auth.json`（若不存在则视为空对象）。
- 写入/更新键 `<PROVIDER_UPPER>_API_KEY` 的值为用户输入的 API Key。
- 尽量保留文件中其他键；写回采用稳定格式化（例如 2 spaces）。

## UI 约束

- API Key 输入与回显均掩码；主界面 Banner 区域不显示明文 API Key。
- 保存成功后展示重启终端提示，用户确认后返回主菜单。
- 本流程所有用户可见文案均为英文，且不包含 emoji。
- 读取/保存等异步步骤提供动效反馈（优先 `@inkjs/ui` 的 `Spinner` / `ProgressBar`）。
- 警告与校验错误优先使用 `@inkjs/ui` 的徽标（例如 `Badge`），不使用 emoji。

## 测试路径隔离（避免修改真实用户目录）

- 任何测试场景不得读写真实 `~/.codex/*`。
- 测试 SHALL 通过“可注入的用户目录解析”或“设置 `HOME` 环境变量”将用户目录指向项目内的临时目录（建议在仓库内，例如 `test/.tmp/home`）。
- 所有文件写入均基于该测试用户目录展开（即写入 `test/.tmp/home/.codex/config.toml` 与 `test/.tmp/home/.codex/auth.json`），并在测试结束后清理。
- 建议将 `test/.tmp/` 加入 `.gitignore`，避免误提交测试残留文件。
