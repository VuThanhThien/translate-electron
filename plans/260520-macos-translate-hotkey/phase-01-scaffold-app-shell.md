# Phase 01: Scaffold, Design Tokens & App Shell

**Effort:** 2.5h  
**Depends on:** —

## Goal

Runnable Electron app with tray, hidden Dock, Settings window shell, **Tailwind theme from DESIGN.md**, **TanStack Query provider**, dev scripts.

## Tasks

1. Init project: `electron-vite` CLI or template — Electron + Vite + **React 19** + TypeScript.
2. Dependencies:
   - `tailwindcss`, `@tailwindcss/vite` (v4) or postcss stack
   - `@tanstack/react-query`, `@tanstack/react-query-devtools` (dev only)
3. Configure `electron.vite` — entries: `src/main`, `src/preload`, `src/renderer/modal`, `src/renderer/settings`.
4. **Design tokens** (from [DESIGN.md](../../../DESIGN.md)):
   - `src/renderer/styles/tokens.css` — CSS variables: `--color-primary`, `--color-ink`, `--color-canvas`, `--color-canvas-parchment`, `--color-hairline`, spacing, radii
   - `tailwind.config.ts` — `theme.extend` maps vars → `colors.primary`, `fontFamily.display`, `fontSize.body` (17px), `borderRadius.pill`, etc.
   - `globals.css` — `@import "./tokens.css"` + Tailwind directives
5. `src/renderer/shared/providers/QueryProvider.tsx` — wrap both renderer roots.
6. Main entry: `app.whenReady()` → tray, `app.dock.hide()` on darwin.
7. Tray menu: "Open Settings", "Quit".
8. Settings `BrowserWindow` (frameful, hidden on start); show from tray. Minimal placeholder using `text-body text-ink bg-canvas-parchment`.
9. Preload: `contextBridge.exposeInMainWorld('api', { prefs: { get, set }, translate: stub })`.
10. `.gitignore`, `.env.example` (`OPENAI_API_KEY=`, `OPENAI_MODEL=gpt-4o-mini`).
11. `npm run dev` launches without crash.

## Token mapping checklist

| DESIGN.md token | Tailwind key |
|-----------------|--------------|
| `colors.primary` | `primary` |
| `colors.ink` | `ink` |
| `colors.canvas` | `canvas` |
| `colors.canvas-parchment` | `canvas-parchment` |
| `colors.hairline` | `hairline` |
| `colors.ink-muted-48` | `ink-muted` |
| `rounded.pill` | `rounded-pill` |
| `rounded.lg` | `lg` (18px) |
| `typography.body` | `text-body` plugin or custom class |
| `typography.tagline` | `text-tagline` |

## Files to create

| Path | Action |
|------|--------|
| `package.json` | create |
| `electron.vite.config.ts` | create |
| `tailwind.config.ts` | create |
| `src/renderer/styles/tokens.css` | create |
| `src/renderer/styles/globals.css` | create |
| `src/shared/types.ts` | create |
| `src/main/index.ts` | create |
| `src/main/tray.ts` | create |
| `src/preload/index.ts` | create |
| `src/renderer/shared/providers/QueryProvider.tsx` | create |
| `src/renderer/settings/main.tsx` | create |
| `src/renderer/settings/App.tsx` | create |
| `.env.example` | create |
| `.gitignore` | create |

## Acceptance criteria

- [ ] App runs; tray icon visible
- [ ] Dock icon hidden on macOS
- [ ] Tray → Settings window opens with DESIGN.md typography/colors visible
- [ ] Tailwind utilities render correctly in renderer
- [ ] React Query Devtools available in dev (optional toggle)
- [ ] Quit exits cleanly
