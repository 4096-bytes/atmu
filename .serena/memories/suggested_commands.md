# Suggested Commands (Linux)

## Install / Setup

- `npm ci` (preferred for reproducible installs)
- `npm install`

## Build / Dev

- `npm run dev` (watch build to `dist/`)
- `npm run build` (compile `src/` → `dist/`)

## Run

- `node dist/atmu.js`
- `node dist/atmu.js -h`
- `node dist/atmu.js -v`

## Test / Lint / Format

- `npm test` (Prettier check + XO + build + AVA)
- `npx prettier --write .`
- `npx xo`

## Common Repo Utilities

- `rg -n "pattern" src`
- `ls -la`
- `find . -maxdepth 3 -type f`
- `git status`
- `git diff`
