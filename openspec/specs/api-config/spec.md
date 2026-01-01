# api-config Specification

## Purpose

TBD - created by archiving change add-custom-provider-api-config. Update Purpose after archive.

## Requirements

### Requirement: UI 文案与反馈（英文、无 emoji、动效、徽标）

在 API 配置流程（入口标签、表单字段、校验提示、保存/失败提示）中，`atmu` SHALL 满足：

- 所有用户可见文案均为英文，且不包含 emoji 字符。
- 读取/保存等异步步骤提供动效反馈（优先使用 `@inkjs/ui` 的 `Spinner` / `ProgressBar`）。
- 警告与校验错误优先使用 `@inkjs/ui` 的徽标（例如 `Badge`），不使用 emoji。

#### Scenario: 保存时显示动效与徽标提示

**GIVEN** 用户位于 API 配置页且已填写必填字段
**WHEN** 用户执行保存
**THEN** UI 在保存进行中展示动效（例如 `Spinner` / `ProgressBar`）
**AND THEN** 若保存失败，UI 使用徽标（例如 `Badge`）展示英文错误信息

### Requirement: API 配置表单（掩码输入）

主界面操作菜单中选择 `configure API provider` 后，`atmu` SHALL 进入配置表单视图，允许用户：

- 输入 Provider（必填）
- 输入 API Key（掩码显示）
- 输入 Base URL（必填；不提供默认值）

UI SHALL 不以明文展示已保存的 API Key。

#### Scenario: 进入配置页并编辑

**GIVEN** 用户位于主界面
**WHEN** 用户选择 `configure API provider`
**THEN** `atmu` 进入配置表单视图
**AND THEN** API Key 输入框以掩码方式显示用户输入

### Requirement: 将配置写入 Codex 配置文件（TOML + JSON）

`atmu` SHALL 在用户保存配置时确保 `~/.codex/` 目录存在，并写入/更新以下文件：

1. `~/.codex/config.toml`

- `atmu` SHALL 写入或更新顶层键：`model_provider = "<provider>"`
- `atmu` SHALL 写入或更新顶层键：`disable_response_storage = true`
- `atmu` SHALL 写入或更新以下段落（其中 `<provider>` 与 `<base_url>` 来自用户输入，`<TEMP_ENV_KEY>` 为 `provider` 转大写后拼接 `_API_KEY`）：

```toml
[model_providers.<provider>]
name = "<provider>"
base_url = "<base_url>"
wire_api = "responses"
temp_env_key = "<TEMP_ENV_KEY>"
requires_openai_auth = true
```

2. `~/.codex/auth.json`

`atmu` SHALL 在 `auth.json` 中写入或更新键值对：键为 `<TEMP_ENV_KEY>`，值为用户输入的 API Key。

`atmu` SHALL 不再单独持久化 API Key、Base URL、Provider（例如不使用 `conf` 另存一份）。

#### Scenario: 保存后写入 config.toml 与 auth.json

**GIVEN** 用户在配置页填写了 Provider、API Key 与 Base URL
**WHEN** 用户执行保存
**THEN** `atmu` 写入/更新 `~/.codex/config.toml` 的 `model_provider` 与 `disable_response_storage`
**AND THEN** `atmu` 写入/更新 `~/.codex/config.toml` 中 `[model_providers.<provider>]` 段落及其字段
**AND THEN** `atmu` 写入/更新 `~/.codex/auth.json` 中 `<provider.toUpperCase()>_API_KEY` 的值为用户输入的 API Key
**AND THEN** 返回主界面后，Banner 区域显示用户输入的 Provider 与 Base URL（不包含明文 API Key）

#### Scenario: Provider 相同则覆盖 base_url 与 api key

**GIVEN** `~/.codex/config.toml` 已存在 `[model_providers.<provider>]` 且其中 `base_url` 为 `<old_base_url>`
**AND THEN** `~/.codex/auth.json` 已存在键 `<provider.toUpperCase()>_API_KEY` 且其值为 `<old_api_key>`
**WHEN** 用户在配置页使用相同的 `<provider>` 重新保存，并输入新的 Base URL `<new_base_url>` 与新的 API Key `<new_api_key>`
**THEN** `atmu` 将 `[model_providers.<provider>]` 的 `base_url` 更新为 `<new_base_url>`
**AND THEN** `atmu` 将 `<provider.toUpperCase()>_API_KEY` 的值更新为 `<new_api_key>`

### Requirement: 保存后提示重启终端

配置保存成功后，`atmu` SHALL 以模态框或高亮提示向用户展示：

`Configuration saved. Restart your terminal or open a new window so Codex CLI can load the updated configuration.`

用户确认后，`atmu` SHALL 返回主菜单/主界面。

#### Scenario: 保存成功后出现重启提示

**GIVEN** 用户在配置页点击保存且写入成功
**WHEN** `atmu` 完成保存流程
**THEN** UI 显示重启终端提示
**AND THEN** 用户确认后返回主界面
