# atmu Specification

## Purpose

TBD - created by archiving change add-atmu-ui-shell. Update Purpose after archive.

## Requirements

### Requirement: 单命令交互式 TUI

`atmu` SHALL 只响应 `atmu` 命令本身，并以 Ink（React for CLI）提供交互式 TUI 体验。

除 `--help`/`-h` 与 `--version`/`-v` 外，`atmu` SHALL 忽略所有命令行参数（包括但不限于 `--init`、`--name`），所有交互收敛到 TUI 内部状态机。

#### Scenario: 以任意参数启动仍进入 TUI

**GIVEN** 用户在终端运行 `atmu --anything`
**WHEN** `atmu` 启动
**THEN** `atmu` 进入 TUI 主界面而非打印参数化输出

### Requirement: --help/-h 引导进入交互式界面

`atmu` SHALL 支持 `--help` 参数及其 `-h` 别名。

当用户以 `--help`/`-h` 启动时，`atmu` SHALL 输出提示用户进入交互式界面操作的帮助信息（例如提示直接运行 `atmu`），并以退出码 0 退出。

#### Scenario: 使用 -h 提示进入交互式界面

**GIVEN** 用户在终端运行 `atmu -h`
**WHEN** `atmu` 启动
**THEN** `atmu` 输出提示用户直接运行 `atmu` 进入交互式界面操作的信息
**AND THEN** `atmu` 以退出码 0 退出

### Requirement: --version/-v 输出版本

`atmu` SHALL 支持 `--version` 参数及其 `-v` 别名。

当用户以 `--version`/`-v` 启动时，`atmu` SHALL 输出 `atmu` 版本号，并以退出码 0 退出。

#### Scenario: 使用 -v 输出版本号

**GIVEN** 用户在终端运行 `atmu -v`
**WHEN** `atmu` 启动
**THEN** `atmu` 输出版本号（例如 `0.0.1`）
**AND THEN** `atmu` 以退出码 0 退出

### Requirement: 主界面骨架

`atmu` 的 TUI 主界面 SHALL 仅展示以下两部分（可使用 ASCII 布局与颜色高亮）：

- Banner（标题与版本号）
- 操作菜单（列表）

#### Scenario: 默认启动渲染主界面骨架

**GIVEN** 用户在终端运行 `atmu`
**WHEN** `atmu` 进入 TUI
**THEN** UI 渲染 Banner 与操作菜单两部分

#### Scenario: Banner 包含版本号

**GIVEN** 用户在终端运行 `atmu`
**WHEN** `atmu` 进入 TUI
**THEN** Banner 显示 ATMU 的 ASCII Logo
**AND THEN** Banner 区域带边框
**AND THEN** Banner 同时包含版本号（例如 `v0.0.1`）
**AND THEN** Banner 同时包含 `Powered by 4096-bytes`

### Requirement: 退出

`atmu` 的操作菜单 SHALL 提供 `exit - quit atmu`。

用户触发退出后，`atmu` SHALL 以退出码 0 退出。

#### Scenario: 从操作菜单退出

**GIVEN** 用户位于 `atmu` TUI 主界面
**WHEN** 用户选择 `exit - quit atmu`
**THEN** `atmu` 以退出码 0 退出

### Requirement: 主菜单项由扩展注册表驱动

`atmu` 的主界面操作菜单 SHALL 由“菜单扩展注册表”生成，并且至少包含：

- `configure API provider - use a custom provider for Codex CLI`
- `exit - quit atmu`

#### Scenario: 主界面渲染扩展菜单项

**GIVEN** 扩展注册表包含 `configure API provider` 扩展
**WHEN** 用户在终端运行 `atmu`
**THEN** 主界面菜单中出现 `configure API provider - use a custom provider for Codex CLI`
**AND THEN** 主界面菜单中出现 `exit - quit atmu`
