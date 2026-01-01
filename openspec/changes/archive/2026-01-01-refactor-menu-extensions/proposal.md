# Change: 菜单路由插件化（降低并行开发冲突）

## Why

当前每新增一个主菜单操作，通常需要同时修改：

- `src/commands/index.tsx`（新增 screen 状态、switch 分支、effect 等）
- `src/types/menu.ts`（扩展 `MenuId` 联合类型）
- `src/utils/menu.ts`（插入 menu item）

当多个菜单并行开发时，这些中心文件极易产生冲突，合并成本高，也不符合“对修改关闭、对扩展开放”的目标。

## What Changes

- 引入“菜单扩展（menu extension）”模型：每个菜单操作用一个独立模块描述（`id`、`label`、`render`）。
- 主命令路由从“手写 switch + 多个 state”改为“基于扩展注册表的通用路由器”：
  - 主界面渲染菜单项：来自扩展注册表 + 内置 `exit`
  - 选择菜单项：查表后渲染对应扩展的 screen
  - 返回主菜单：统一由扩展的 `onDone` 回调驱动
- 移除对 `MenuId` 联合类型的强耦合：`Menu`/`MenuItem` 以 `string` 作为 id，避免新增菜单时修改中心类型文件。

## Impact

- Affected specs: `atmu`
- 预期用户可见行为不变（仅内部结构调整，目的是降低冲突与提升可扩展性）。

## Out of Scope（本 Change）

- 不引入运行时文件系统扫描的“自动发现插件”（保持显式注册，避免隐式行为与打包差异）。
- 不改变现有菜单文案、交互流程与可见输出。
