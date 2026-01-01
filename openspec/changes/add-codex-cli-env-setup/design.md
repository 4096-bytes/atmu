# Design: Codex CLI 环境检测与一键 Setup

## 核心决策

- 检测使用 `npm list -g --depth=0 --json`，避免解析人类可读输出。
- 不做版本匹配：仅判断 `@openai/codex` 是否已安装（`missing/ok`）。
- Setup 统一走一条命令路径：`npm install -g @openai/codex`。
- missing 初始化前确保 `~/.codex/config.toml` 存在（允许空文件、不覆盖）。

## 交互与状态

- 环境检测/Setup 流程的所有用户可见文案使用英文，且不出现 emoji。
- 增加独立的“环境状态区域”，布局位于 Banner 与操作菜单之间；环境检测/Setup 的状态/告警/进度全部渲染在该区域，不占用 Banner。
- 环境检测中使用动效组件（优先 `@inkjs/ui` 的 `Spinner`）呈现状态（例如 `Checking environment`），而不是仅显示静态文本。
- 环境检测未完成前，禁用操作菜单（不响应选择/确认）。
- 检测结果：
  - `missing`：使用告警 `Badge`（例如黄色）提示未安装（例如 `Codex CLI is not installed`），并提供默认选中的 Setup 操作
  - `ok`：使用通过 `Badge`（例如绿色）显示环境通过，并展示 `Installed: <installed>`
- Setup 期间显示安装进度（不强依赖真实百分比）。

### 主界面布局（Index）

目标：在不改变 Banner 责任边界（品牌/版本/主功能状态摘要）的前提下，为“环境完整性（Codex CLI 安装）”提供一个稳定、可扫描、可操作的状态区。

主界面自上而下分为三段：

1. **Banner（已有）**：ASCII logo + 版本号 + `Powered by 4096-bytes`，以及既有的“主功能状态摘要”（例如 API provider 摘要）
2. **环境状态区域（新增）**：仅用于 Codex CLI 环境检测/Setup 的状态、告警、进度与错误（不放入 Banner）
3. **操作菜单（已有）**：基于扩展注册表的主功能入口 + `exit - quit atmu`（在 `missing` 时收敛为 Setup + exit）

说明：API provider 的摘要信息仍保留在 Banner 内部（与 `api-config` spec 一致），环境状态区域不复用该字段，避免概念混淆。

### 状态机（UI 视角）

环境状态区域建议使用单一状态源驱动（避免多处分散判断），并保证布局稳定（减少 UI 抖动）：

- `checking`：启动自检中（运行 `npm list -g ...`）
- `missing`：未安装（可操作：Setup / exit）
- `installing`：Setup 执行中（运行 `npm install -g ...`；可显示重试计数）
- `failed`：Setup 失败（可操作：Retry Setup / exit）
- `ok`：已安装（展示版本；开放主功能菜单）

状态转换（最小闭环）：

- `checking` → `missing | ok`
- `missing` → `installing`（用户确认 Setup）
- `installing` → `ok | failed`（成功后自动重新检测并进入 `ok`；失败进入 `failed`）
- `failed` → `installing`（用户再次确认 Setup）

### 环境状态区域的视觉结构（2 行优先）

为适配小终端高度，环境状态区域优先控制在 2 行（必要时允许自然换行），并遵循“徽标 + 句子”的低噪声结构：

- **第 1 行（主状态行）**：`Badge` + 关键句（英文、无 emoji）
- **第 2 行（细节/引导行，可选）**：dim 文案（英文），用于版本号、重试次数、简短引导或错误摘要

不依赖颜色表达语义：`Badge` 文本本身需明确（例如 `Warning`/`Ready`/`Error`）。

### 示例文案与界面草图（非规范性）

以下为建议的可见文案与布局示意（用于实现与测试对齐；最终以 spec delta 为准）：

#### 1) checking（启动检测中）

```
╭─ Banner ─────────────────────────────────╮
│ ...                                       │
╰───────────────────────────────────────────╯

[Spinner] Checking environment...
(menu disabled)
```

#### 2) missing（未安装）

```
[Badge Warning] Codex CLI is not installed.
               Select "setup Codex CLI" to install it globally.

> setup Codex CLI - install @openai/codex globally
  exit - quit atmu
```

#### 3) installing（安装中）

```
[Spinner] Installing Codex CLI... (attempt 1/3)
(menu disabled)
```

#### 4) failed（失败，可重试）

```
[Badge Error] Setup failed.
             Failed to install: <error summary>

> setup Codex CLI - retry install
  exit - quit atmu
```

#### 5) ok（已安装）

```
[Badge Ready] Codex CLI is installed.
             Installed: <installed>

> configure API provider - use a custom provider for Codex CLI
  exit - quit atmu
```

### 关键交互约束（与现有组件对齐）

- 主界面主交互仍为单一焦点：菜单选择（`@inkjs/ui` 的 `Select`）；环境状态区域仅展示状态，不引入第二个可聚焦交互点。
- 在 `checking`/`installing` 状态下禁用菜单可避免重复触发与状态竞争；退出路径依旧由 `ctrl+c`（以及实现可选的显式退出）保证。

## 超时与重试

- 为单次 `npm install -g ...` 设置超时上限；超时后终止子进程并记录为失败。
- 对可恢复错误（网络、超时等）做有限次数自动重试；达到上限后留在 Setup 状态并允许用户手动再次触发。

## 测试策略

- 通过依赖注入将 `npm list -g` 与 `npm install -g` 的执行抽象出来，测试中使用 stub 控制三态与失败类型。
- Ink 测试断言关键英文文案与结构（避免依赖动态 spinner 帧）。
- 任何测试场景不得读写真实 `~/.codex/*`；测试 SHALL 通过“可注入的用户目录解析”或“设置 `HOME` 环境变量”将用户目录指向项目内临时目录（建议在仓库内，例如 `test/.tmp/home`），并在测试结束后清理。
- 建议将 `test/.tmp/` 加入 `.gitignore`，避免误提交测试残留文件。
