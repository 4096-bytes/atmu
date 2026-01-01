---
name: atmu-tui-design
description: Design consistent, readable, action-oriented TUI screens for atmu (Ink + Pastel). Use when adding or refactoring `src/ui` screens/layout/components (menus/forms/lists/modals/action bars) and keeping a consistent "panel + action bar + high-contrast selection" interaction style.
---

# Atmu Tui Design

## Overview

Apply the project’s terminal UI design standard to keep all screens consistent, scannable, and keyboard-first.

## Workflow

Follow these steps to avoid inconsistent screens:

1. Define the screen’s responsibility: do one thing (one primary task + optional secondary info).
2. Choose the layout skeleton: use a stable header/context area, a primary interaction area, and a consistent footer action bar.
3. Prefer established interaction patterns (selection lists, palettes, forms) so keyboard behavior is predictable.
4. Establish hierarchy: title (current task) → primary interaction → secondary hints (dim) → shortcut/action bar.
5. Handle edge cases: small terminals (height/width), long text wrapping, async loading, error and success states.
6. Add tests: AVA + `ink-testing-library` (assert final frame/critical copy only).

## Design Language Summary

- Clear hierarchy: one explicit focus (`>`/highlight) + a clear title + a consistent bottom action hint.
- Low-noise emphasis: rely on the terminal theme; use `dimColor` for secondary info; use a single accent for actionable items.
- Minimal, stable decoration: group with a rounded `Panel` + padding; rely on whitespace (`gap`) instead of stacking borders.
- Discoverable controls: bottom `ActionBar` uses inverse keycaps (`inverse`) + dim descriptions; keep key names consistent (`enter`/`esc`/`ctrl+c`).

## References

- Project design standard (single source of truth): `references/tui-design-standard.md`
