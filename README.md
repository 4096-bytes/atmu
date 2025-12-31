# atmu

## What is atmu

`atmu` is an interactive, Ink-based CLI concierge for Codex CLI. Its MVP goal is to reduce environment setup friction
by guiding users through a single terminal UI.

## Quick start

### Install (global)

```bash
npm install --global atmu
atmu
```

### Run from source

```bash
npm install
npm run build
node dist/atmu.js
```

### Flags

```bash
atmu -h
atmu -v
```

## Features

- Interactive TUI as the primary interface (Ink + Pastel).
- ASCII banner with version and attribution.
- Action menu (currently: `exit - quit atmu`).
- `-h/--help` provides interactive-first guidance.
- `-v/--version` prints the package version.
- Unknown CLI flags are ignored and the UI still starts.

Planned (not yet implemented):

- Codex CLI environment verification and repair (install/upgrade with retry/timeout).
- API configuration flow that writes to `~/.codex/config.toml` and `~/.codex/auth.json`.

## License

MIT
