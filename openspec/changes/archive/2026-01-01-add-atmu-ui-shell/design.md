# Design: atmu UI 壳（Banner + 操作菜单）

## 目标

- 主界面（Index）只包含两个可见区域：Banner 与操作菜单。
- Banner 必须展示 `ATMU` 与当前版本号，并允许在后续变更中追加一行“状态/提示”文案（例如环境检测中、需要修复等）。
- 操作菜单是可扩展的列表组件：后续能力（环境修复、API 配置等）只需要“追加/替换菜单项”，无需重构页面布局。
- CLI 元信息（name/description/version）由 Pastel 从 `package.json` 自动读取，确保 `--help`/`--version` 行为一致且可测试。

## Pastel CLI 元信息

Pastel 会从最近的 `package.json` 提取 `name` / `description` / `version`。

版本号存在时，Pastel 会提供 `-v, --version` 旗标输出版本信息；Help 由 Commander.js 生成并通常包含 `-h, --help`。本项目将通过自定义 `description`（或自定义 help 文案）确保 `-h/--help` 能明确提示用户“直接运行 `atmu` 进入交互式界面操作”。

本 Change SHALL 不覆盖 Pastel 的 `name`/`version` 推导逻辑；若需要自定义文案，优先通过补齐 `package.json.description` 实现。

## UI 组件选择（@inkjs/ui）

主界面使用 `@inkjs/ui@2.0.0`（Ink UI 组件库）构建基础交互组件，优先使用其：

- 列表选择（Select / SelectInput 等同类组件）
- 文本样式（Badge/Box/Divider 等同类组件）

菜单锁定（禁用）优先使用 `Select` 的 `isDisabled` 能力；若后续菜单需要“部分禁用”，则在生成 `options` 时过滤不可用项或在 UI 层拦截提交事件。

实现时保持组件层无副作用；状态与动作通过 props/handlers 注入，便于测试替换。

## 主界面布局

仅两段式布局：

1. Banner
   - 第一行：`ATMU v<version>`
   - 可选第二行：简短状态/提示（例如 `正在检查环境...` 或 `⚠️ Codex CLI 未安装`）

2. 操作菜单（列表）
   - 单列列表，支持键盘上下选择与回车确认
   - 允许“禁用状态”：检测未完成或环境未通过时，菜单可整体禁用或仅开放修复/退出等有限操作

## 菜单模型（建议）

用一个纯数据结构表达菜单项，避免在 UI 内写条件分支：

- `id`: 稳定标识（字符串）
- `label`: 展示文本（建议 `action - description`）
- `enabled`: 是否可选
- `onSelect`: 触发动作（导航/执行副作用/退出）

后续变更只需根据运行时状态生成 `MenuItem[]`。

## 工程目录结构（建议）

目标：让职责内聚、依赖方向清晰（UI 依赖类型与 utils；command 只做装配；避免在组件 render 中执行副作用）。

建议结构如下（示例文件名仅用于表达职责，可在实现阶段微调）：

```text
src/
  atmu.tsx               # Pastel app 初始化（name/description/version），仅启动与路由发现
  commands/
    index.tsx            # 默认命令入口：装配 UI（Index 视图）并注入依赖/handlers
  ui/
    screens/
      index.tsx          # 主界面：Banner + Menu（纯渲染 + 事件回调）
    components/
      banner.tsx         # Banner 展示（ATMU + 版本 + 可选状态文案）
      menu.tsx           # 操作菜单（@inkjs/ui Select 的薄封装）
    layout/
      panel.tsx          # 可复用的布局容器（边框/内边距）
    theme/
      tokens.ts          # UI tokens（spacing/borders/colors）
  utils/
    pastelMeta.ts        # 从 package.json/运行时提取 name/version/description（或集中配置）
    menu.ts              # 由运行时状态生成 MenuItem[]（纯函数）
    format.ts            # 文案/格式化（例如 banner 文案拼接）
  types/
    menu.ts              # MenuItem/MenuId 等类型
    app.ts               # AppState 等跨模块共享类型（若需要）
```

### 职责边界

- `src/atmu.tsx`
  - 只负责创建/运行 `Pastel` 实例与全局元信息（name/description/version）
  - 不包含 UI 逻辑，不包含业务状态机

- `src/commands/*`
  - 只作为 Pastel 的路由入口（装配层）
  - 负责把“当前运行时状态（后续由 env-repair/api-config 提供）”映射为 UI props

- `src/ui/*`
  - 只做渲染与用户输入处理（事件回调），不直接读写文件、不直接执行 `npm` 等副作用
  - 组件可在测试中独立渲染并断言关键帧

- `src/utils/*`
  - 纯函数优先（例如菜单生成、文案拼接、输入规范化）
  - 若必须包含副作用（例如读取 package.json），集中封装并提供可替换接口，便于测试 stub

- `src/types/*`
  - 放置跨模块复用的类型定义，避免 UI/commands/utils 之间循环依赖

## 端到端测试设计（AVA）

本 Change 需要补齐“从用户视角可观测”的 CLI 级别验证，避免仅测试组件渲染导致的漏测（例如 `-h/-v` 旗标、Pastel 元信息、退出码）。

### 测试分层

1. **CLI 进程级 E2E（推荐覆盖）**

- 通过子进程执行构建产物：`node dist/atmu.js`
- 覆盖场景：
  - `atmu -h` / `atmu --help`：输出包含交互式引导文案，退出码 0
  - `atmu -v` / `atmu --version`：输出版本号（来自 `package.json.version`），退出码 0
- 稳定性策略：
  - 设置 `NO_COLOR=1` 与 `FORCE_COLOR=0`（必要时加 `TERM=dumb`）以减少 ANSI 干扰
  - 使用 `t.regex()`/`t.true(stdout.includes(...))` 断言关键子串，避免对整段 help 做脆弱快照
  - 为子进程设置超时并在 `t.teardown()` 中强制清理，防止 CI 卡死

2. **TUI 交互级“近 E2E”（可选增强）**

- 使用 `ink-testing-library` 渲染默认命令（Index）并通过其 `stdin` 模拟用户选择菜单项（例如选择 `exit - quit atmu` 并回车）。
- 断言：
  - 初始帧包含 `ATMU v<version>` 与菜单项
  - 触发退出后组件卸载/退出回调被调用（避免依赖真实 TTY/PTY）

### AVA 最佳实践（约束）

- 测试只依赖 `dist/`（由 `npm test` 中的 build 先行保证），不要直接 import `src/` 的实现细节。
- 每个测试聚焦单一行为；对 `-h/-v` 使用独立用例，减少失败时的排查成本。
- 禁止使用不确定的时间等待（例如 `setTimeout` 轮询）；优先使用库提供的 `waitUntilExit`/同步输出采集或明确的超时控制。
