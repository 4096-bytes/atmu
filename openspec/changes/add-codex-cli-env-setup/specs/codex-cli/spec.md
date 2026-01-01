# Spec Delta: codex-cli

## ADDED Requirements

### Requirement: Codex CLI 安装状态与版本检测

`atmu` SHALL 在启动自检阶段通过 `npm list -g`（推荐 `--json`）检测 `@openai/codex` 是否安装。

- 未检测到包：状态为 `missing`
- 检测到包：状态为 `ok`

当检测到包时，`atmu` SHOULD 解析并保留已安装版本号，用于 UI 展示（例如 `Installed: <installed>`）。

#### Scenario: 检测缺失

**GIVEN** `npm list -g` 结果中不存在 `@openai/codex`
**WHEN** `atmu` 执行环境检测
**THEN** 检测结果为 `missing`

#### Scenario: 检测已安装

**GIVEN** `npm list -g` 结果中存在 `@openai/codex`
**WHEN** `atmu` 执行环境检测
**THEN** 检测结果为 `ok`

### Requirement: 交互文案语言与 Emoji 约束

`atmu` 在环境检测与 Setup 流程中的所有用户可见交互文案（包括但不限于状态提示、告警信息、菜单项 label）SHALL 全部使用英文。

上述交互文案 SHALL 不包含 emoji 字符。

#### Scenario: missing 状态下文案为英文且不含 emoji

**GIVEN** 检测结果为 `missing`
**WHEN** `atmu` 渲染环境状态区域与操作菜单
**THEN** 用户可见文案为英文且不包含 emoji 字符

### Requirement: 环境状态区域位置

`atmu` SHALL 在主界面中提供独立的“环境状态区域”，其布局位置位于 Banner 与操作菜单之间。

环境检测与 Setup 流程中的状态提示/进度/告警 SHALL 渲染在该“环境状态区域”，而不是渲染在 Banner 区域。

#### Scenario: 环境状态渲染在 Banner 与菜单之间

**GIVEN** `atmu` 正在执行环境检测或处于 `missing/ok` 结果态
**WHEN** 主界面渲染
**THEN** 环境状态渲染在 Banner 与操作菜单之间

### Requirement: 环境检查中的动效状态提示

当 `atmu` 正在执行环境检测时，环境状态区域 SHALL 使用 `@inkjs/ui` 的动效组件显示“正在检查中”的状态（例如 `Spinner`），而不是仅显示静态文本。

动效组件的 label（或等价可见文本）SHALL 为英文（例如 `Checking environment`）。

#### Scenario: 启动时显示正在检查环境

**GIVEN** 用户运行 `atmu`
**WHEN** 环境检测尚未完成
**THEN** 环境状态区域显示带动效的 `Checking environment` 提示

### Requirement: 环境检查期间锁定操作菜单

当环境检测尚未完成时，操作菜单 SHALL 处于禁用状态（不响应用户选择/确认），以避免在未知环境状态下执行操作。

#### Scenario: 检测未完成前操作菜单不可操作

**GIVEN** 用户运行 `atmu`
**WHEN** 环境检测尚未完成
**THEN** 操作菜单不可操作（禁用）

### Requirement: 缺失时的 UI 警告与 Setup 入口

当检测结果为 `missing` 时，UI SHALL 在环境状态区域显示告警，并提供默认选中的 Setup 操作。

告警展示 SHOULD 使用 `@inkjs/ui` 的 `Badge`（例如黄色）表达告警级别，而不是在文案中使用 emoji。

`missing` 的告警文案示例：`Codex CLI is not installed`

在 `missing` Setup 完成之前，`atmu` SHALL 不开放其他主功能操作（例如配置 API），仅允许用户执行 Setup 相关操作或退出。

#### Scenario: missing 显示未安装警告与一键 Setup

**GIVEN** 检测结果为 `missing`
**WHEN** `atmu` 渲染环境状态区域
**THEN** UI 显示 `Codex CLI is not installed`
**AND THEN** UI 使用 `Badge` 表达告警级别
**AND THEN** UI 提供默认选中的 Setup 操作

### Requirement: 环境通过时展示验证通过

当检测结果为 `ok` 时，UI SHALL 在环境状态区域显示通过信息，并包含已安装版本信息（例如 `Installed: <installed>`）。

通过信息 SHOULD 使用 `@inkjs/ui` 的 `Badge`（例如绿色）表达状态，而不是在文案中使用 emoji。

#### Scenario: ok 显示验证通过与版本

**GIVEN** 检测结果为 `ok`
**WHEN** `atmu` 渲染环境状态区域
**THEN** UI 显示通过信息并包含 `Installed: <installed>`
**AND THEN** UI 使用 `Badge` 表达通过状态

### Requirement: 一键安装（全局 npm 安装）

当检测结果为 `missing` 时，`atmu` SHALL 在用户确认后执行：

`npm install -g @openai/codex`

执行成功后，`atmu` SHALL 自动重新运行环境检测，并在检测为 `ok` 后开放主功能操作。

#### Scenario: 缺失时一键 Setup 成功

**GIVEN** 检测结果为 `missing`
**WHEN** 用户在主界面确认 Setup 操作
**THEN** `atmu` 执行 `npm install -g @openai/codex`
**AND THEN** 执行成功后自动重新检测
**AND THEN** 检测为 `ok` 后开放主功能操作

### Requirement: Setup 过程中的动效进度提示

当 `atmu` 正在执行 `npm install -g ...` Setup 操作时，环境状态区域 SHALL 使用 `@inkjs/ui` 的动效组件展示进度/等待状态（例如 `Spinner` 或 `ProgressBar`），而不是仅显示静态文本。

#### Scenario: Setup 期间显示动效进度

**GIVEN** 用户已触发 Setup 操作且 `npm install -g ...` 仍在进行中
**WHEN** `atmu` 渲染环境状态区域
**THEN** 环境状态区域显示动效的进度/等待提示
**AND THEN** 操作菜单不可操作（禁用）

### Requirement: missing Setup 时创建用户 Codex 配置文件

当检测结果为 `missing` 且用户触发 Setup 操作时，`atmu` SHALL 在执行 `npm install -g ...` 之前确保用户目录存在以下路径：

- `~/.codex/`（目录）
- `~/.codex/config.toml`（文件）

若目录/文件不存在，`atmu` SHALL 创建它们；若已存在，`atmu` SHALL 不覆盖用户现有内容。

#### Scenario: missing Setup 前创建 ~/.codex/config.toml

**GIVEN** 检测结果为 `missing`
**AND THEN** 用户目录下不存在 `~/.codex/`
**WHEN** 用户在主界面确认 Setup 操作
**THEN** `atmu` 创建 `~/.codex/` 目录
**AND THEN** `atmu` 创建 `~/.codex/config.toml` 文件（若不存在，可为空文件）
**AND THEN** `atmu` 执行 `npm install -g @openai/codex`

### Requirement: 安装具备超时与重试

安装属于网络操作；`atmu` SHALL 为单次安装尝试设置超时上限以避免假死，并在可恢复失败下自动重试有限次数。

当达到最大重试次数仍失败时，`atmu` SHALL 留在主界面的 Setup 状态并向用户展示失败原因，同时允许用户再次手动触发安装。

#### Scenario: 安装超时后可重试

**GIVEN** 用户触发安装且本次 `npm install -g ...` 超过超时上限
**WHEN** `atmu` 判定超时
**THEN** `atmu` 终止本次安装尝试并展示 `Timeout` 错误信息
**AND THEN** `atmu` 自动重试（若未超过最大重试次数）

#### Scenario: 达到最大重试次数后仍失败

**GIVEN** 用户触发安装且 `npm install -g ...` 连续失败并达到最大重试次数
**WHEN** `atmu` 渲染主界面
**THEN** 环境状态区域展示英文失败原因（例如以 `Badge` 标识为 `Error`）
**AND THEN** UI 仍提供 Setup 操作以允许用户再次手动触发安装
