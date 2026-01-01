# Tasks: 菜单路由插件化

- [x] 定义菜单扩展类型（id/label/render）与注册表入口。
- [x] 将现有 `configure API provider` 迁移为一个菜单扩展模块。
- [x] 重构 `src/commands/index.tsx`：用扩展注册表驱动菜单渲染与路由切换，移除手写 `switch` 分支。
- [x] 调整 `src/types/menu.ts` 与 `src/ui/components/menu.tsx`：允许 `id: string`，不再要求维护 `MenuId` 联合类型。
- [x] 更新受影响测试（UI/E2E）与必要的 OpenSpec 文档引用。
- [x] 运行 `npm test` 验证。
