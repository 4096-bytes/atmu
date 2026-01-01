# Design: 菜单路由插件化（Menu Extensions）

## 目标

- **降低冲突**：新增菜单时只新增一个模块，并在注册表 `index` 文件中插入一行，不修改 `src/commands/index.tsx` 的路由逻辑。
- **OCP**：路由器对新增菜单扩展开放，对既有路由实现关闭（不需要新增 `switch/case` 与 state）。
- **保持简单**：不引入运行时自动扫描与动态导入，保持显式依赖与可预测构建产物（KISS/YAGNI）。

## 核心抽象

定义 `MenuExtension`：

- `id: string`：菜单唯一标识（用于 select value）
- `label: string`：主菜单显示文案
- `render(props): ReactNode`：渲染该扩展的 screen（由扩展内部管理其交互与副作用）

`props` 统一包含：

- `homeDirectory?: string`：测试/注入用
- `onDone(): void`：返回主菜单

## 目录结构建议

```
src/
  app/
    menu/
      types.ts        # MenuExtension 类型
      index.ts        # 注册表（扩展数组）
      api-config.tsx  # 单个扩展：configure API provider
```

主命令 `src/commands/index.tsx` 仅负责：

- 从注册表读取扩展列表，生成菜单项
- 记录当前激活扩展 `activeExtensionId`
- 按 `id` 查表渲染扩展 screen
- 处理内置 `exit`

## 取舍

- 选择“显式注册表”而非“自动发现”：
  - 优点：构建/打包更稳定；依赖显式；可静态分析；测试更可控
  - 缺点：并行开发仍会在注册表 `index` 文件产生轻量冲突，但比集中修改多个中心文件更易合并
