# Style & Conventions

## Language / Modules

- TypeScript + TSX
- ESM (`"type": "module"`)

## Formatting / Linting

- Indentation: tabs (`.editorconfig`)
- Line endings: LF; files end with newline
- Formatting: Prettier (`@vdemedes/prettier-config`)
- Linting: XO (`xo-react`), Prettier-integrated

## Command/Module Conventions

- Commands live in `src/commands/<name>.tsx`.
- A command typically exports:
  - `options`: a Zod schema defining flags/defaults
  - `default`: a React component that renders the UI

## Testing

- AVA test runner
- UI tests: `ink-testing-library`
- Tests should import from `dist/` (build first)

## Repo Guidelines

- Keep changes focused and small; avoid new dependencies unless required.
- Do not commit generated `dist/` artifacts.
- If a request involves planning/proposals/spec changes, consult `openspec/AGENTS.md`.
