# Spec Delta: atmu

## MODIFIED Requirements

### Requirement: 主菜单项由扩展注册表驱动

`atmu` 的主界面操作菜单 SHALL 由“菜单扩展注册表”生成，并且至少包含：

- `configure API provider - use a custom provider for Codex CLI`
- `exit - quit atmu`

#### Scenario: 主界面渲染扩展菜单项

**GIVEN** 扩展注册表包含 `configure API provider` 扩展
**WHEN** 用户在终端运行 `atmu`
**THEN** 主界面菜单中出现 `configure API provider - use a custom provider for Codex CLI`
**AND THEN** 主界面菜单中出现 `exit - quit atmu`
