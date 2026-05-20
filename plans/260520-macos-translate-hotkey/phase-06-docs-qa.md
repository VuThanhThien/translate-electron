# Phase 06: Docs & Manual QA

**Effort:** 1h  
**Depends on:** Phase 05

## Goal

README for dev setup; document DESIGN.md + stack; manual test matrix on macOS.

## Tasks

1. `README.md`:
   - Prerequisites: Node 20+, macOS
   - Stack: Electron, React 19, TanStack Query, Tailwind (tokens from `DESIGN.md`)
   - `cp .env.example .env` + API key
   - `npm install` / `npm run dev`
   - Permissions: Accessibility, Input Monitoring
   - Default hotkey `Cmd+Shift+T`
   - Link to `DESIGN.md` for UI contributors
   - Limitations: hotkey required, cloud API, no clipboard restore
2. Update `docs/design-spec.md` header: point visual spec to `DESIGN.md` (one-line cross-ref).
3. Manual QA matrix:

| App | Select | Hotkey | Translate | UI tokens OK |
|-----|--------|--------|-----------|--------------|
| Safari | | | | |
| Slack / Discord | | | | |
| VS Code / Cursor | | | | |
| Notes | | | | |

4. Visual pass: Action Blue only for CTAs, 17px body, pill buttons, no card shadows.

## Acceptance criteria

- [ ] New developer runs from README alone
- [ ] QA matrix recorded in README or `docs/qa-2026-05-20.md`
- [ ] No secrets in repo
- [ ] UI review: modal + settings align with DESIGN.md Do's/Don'ts
