# Task Completion Checklist

Before marking a change as done:

- Run `npm test` and fix any failures related to the change.
- Ensure formatting/linting passes (Prettier + XO are included in `npm test`).
- If tests import `dist/`, ensure `npm run build` is up to date.
- Keep `package-lock.json` consistent with `package.json` if dependencies changed.
- Do not commit `dist/` output; modify `src/` and rebuild as needed.
- For user-facing changes, include a brief summary and how to test (exact commands).
