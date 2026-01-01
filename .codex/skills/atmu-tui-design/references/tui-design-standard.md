# Terminal UI Design Standard

This document defines the project’s baseline terminal UI (TUI) design standard. It focuses on *portable UI principles* and intentionally avoids tying the design to a specific library, framework, or the current state of the codebase.

## 1) Goals

- **Scannable**: users understand “where they are” and “what to do next” within seconds.
- **Action-oriented**: the primary interaction is always obvious and reachable via keyboard.
- **Low-noise**: visual emphasis is reserved for what is actionable or critical.
- **Reliable exit paths**: every screen provides clear ways to confirm, go back, or quit.

## 2) Layout Skeleton (4-Zone Model)

Design screens using these zones from top to bottom. Not every screen must include every zone, but the hierarchy should remain consistent.

1. **Context Card (Header)**
   - A compact, visually grouped block that answers “what is this?” and “what context am I in?”
   - Left-aligned; do not force full-width unless the terminal is very narrow.
   - Keep it stable across states so the screen doesn’t “jump”.

2. **Hint Strip (Optional)**
   - 1–2 short lines for discovery and next-step guidance.
   - Render as secondary/dim to avoid competing with the primary interaction.

3. **Primary Interaction (Main Area)**
   - The user’s single obvious focus: input, selection list, confirmation, etc.
   - Avoid multiple competing focus points (e.g., two active inputs).

4. **Action Bar (Footer)**
   - A consistent, always-visible shortcut row.
   - Use keycaps (inverse or boxed styling) + short labels.
   - Standardize key names: `enter`, `esc`, `ctrl+c`, `↑/↓`.

## 3) Visual Language

### Emphasis rules

- **Do not rely on color alone** to communicate state; include a shape/prefix indicator (`>` marker, brackets, etc.).
- Use **one accent** for actionable tokens (commands, selected row, active step).
- Use **dim/secondary styling** for descriptions and helper text.

### Grouping rules

- Prefer **whitespace and alignment** over drawing borders everywhere.
- Use borders/panels sparingly for “rememberable blocks” (context, summaries, critical warnings).

### Alignment rules

- Prefer **two-column rows** for menus and palettes:
  - Left: the actionable name (command/option).
  - Right: a single-line explanation (dim).
- Keep descriptions short; a user should scan without reading paragraphs.

## 4) Interaction Patterns

### A) Selection lists (menus, pickers)

- Provide an explicit current selection indicator (`>` or similar).
- Keep list height controlled; do not push the footer off-screen.
- For long lists, support **search/filter** or progressive disclosure.

### B) Command palette (slash-like actions)

- Triggered by a dedicated keystroke or a leading token in the input.
- Each row is: **action** + **one-line description**.
- Selection state must be obvious; scrolling should be predictable.

### C) Modal selection (risk/permission choices)

- Use a clear title and a short option list.
- Prefer numbering (`1.`, `2.`, `3.`) + selection marker for discoverability.
- Put capability/risk descriptions on the same row as the option (dim).
- Always include explicit footer keys for confirm/back/quit.

### D) Forms (multi-field input)

- Indicate the active field without relying on color (e.g., `>` prefix).
- Show validation errors as a **top-of-form summary** (one error per line).
- For async submit, show a spinner/progress indicator and disable further edits.
- After success, show a dedicated success state with a single obvious next action.

### E) Async + state transitions

- Prevent UI jitter: keep layout zones stable while loading.
- Make “busy” states visible (spinner/progress label) and reversible (escape/back when safe).

## 5) Copy & Messaging

- Titles should describe the current action, verb-led: `configure …`, `select …`, `resume …`.
- Keep tips short and directive: `Type to search`, `Press enter to confirm`.
- Use consistent terminology for the same concept across screens.
- When a choice has risk, explain consequences plainly (no alarmism, no vagueness).

## 6) Terminal Constraints & Accessibility

- Assume narrow widths: avoid hard-coded columns; allow natural wrapping.
- Assume short heights: keep the action bar visible; limit list height.
- Avoid flicker: don’t re-render large blocks unnecessarily; keep stable positions.
- Keyboard-first by default: every action must be reachable without a mouse.

## 7) Quality Checklist (before shipping a screen)

- **Focus**: Is there exactly one obvious primary interaction?
- **Hierarchy**: Can a user tell title → main action → secondary hints → shortcuts?
- **Exit paths**: Are `enter`, `esc`, and `ctrl+c` behaviors clear and consistent?
- **Noise**: Is emphasis reserved for actionable/critical elements?
- **Constraints**: Does it remain usable on small terminals?
- **States**: Are loading/error/success states explicit and unambiguous?

