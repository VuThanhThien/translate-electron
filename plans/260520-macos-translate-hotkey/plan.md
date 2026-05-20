---
title: "macOS Translate Hotkey (Electron MVP)"
description: "Electron menu-bar app: global hotkey captures selection via clipboard, opens overlay modal, auto-translates with OpenAI. UI follows DESIGN.md (Apple-inspired tokens)."
status: completed
priority: P2
effort: 14h
branch: ""
tags: [feature, electron, desktop, api, react-query, tailwind]
created: 2026-05-20
updated: 2026-05-20
spec: docs/design-spec.md
design: DESIGN.md
---

# macOS Translate Hotkey — Implementation Plan

## Overview

Greenfield Electron app for macOS. User selects text, presses hotkey, app simulates copy, reads clipboard, opens always-on-top modal, auto-calls OpenAI to translate. Tray provides Settings (languages, hotkey, model). API key from `.env`. No release/notarization.

**Functional spec:** [docs/design-spec.md](../../docs/design-spec.md) — flows, IPC, OpenAI, permissions  
**Visual design:** [DESIGN.md](../../DESIGN.md) — colors, typography, components, responsive rules (source of truth for UI)

## Phases

| # | Phase | Status | Effort | File |
|---|-------|--------|--------|------|
| 1 | Scaffold, design tokens & app shell | Done | 2.5h | [phase-01](./phase-01-scaffold-app-shell.md) |
| 2 | Hotkey & clipboard capture | Done | 2.5h | [phase-02](./phase-02-hotkey-clipboard.md) |
| 3 | Translate modal UI (DESIGN.md) | Done | 3h | [phase-03](./phase-03-translate-modal.md) |
| 4 | OpenAI + TanStack Query | Done | 2.5h | [phase-04](./phase-04-openai-integration.md) |
| 5 | Settings & prefs (React Query) | Done | 2.5h | [phase-05](./phase-05-settings-prefs.md) |
| 6 | Docs & manual QA | Done | 1h | [phase-06](./phase-06-docs-qa.md) |

## Tech stack

| Layer | Choice | Notes |
|-------|--------|-------|
| Shell | Electron 33+ (latest stable) | Main: hotkey, clipboard, OpenAI, windows |
| Language | TypeScript | Strict; shared types in `src/shared/` |
| Bundler | electron-vite | Dual entry main / preload / renderer |
| UI | React 19 + Vite | Separate entries: `modal`, `settings` |
| Styling | **Tailwind CSS v4** | Theme mapped from `DESIGN.md` tokens |
| Server state | **TanStack Query v5** | IPC-backed queries/mutations (not fetch to HTTP from renderer) |
| Persistence | `electron-store` | Prefs in main; exposed via IPC |
| AI | `openai` official SDK | Main process only |
| Input sim | `@nut-tree/nut-js` | AppleScript fallback for Cmd+C |

### Why TanStack Query in Electron?

Renderer never calls OpenAI directly. Treat IPC as the data layer:

- `useQuery(['prefs'], () => api.prefs.get())` — settings + modal initial langs
- `useMutation(translate)` — auto-translate on modal open + Retranslate
- `queryClient.invalidateQueries(['prefs'])` on `prefs:changed` from main

Keeps loading/error/retry consistent without ad-hoc `useState` for every async path.

### Why Tailwind?

`DESIGN.md` defines a complete token system (colors, typography, radii, spacing). Tailwind theme extension gives utility classes that match spec (`bg-canvas`, `text-ink`, `rounded-pill`, `text-body`) and avoids one-off inline styles in modal/settings.

## Design system (from DESIGN.md)

Map YAML tokens → `src/renderer/styles/tokens.css` + `tailwind.config.ts`. Do **not** duplicate hex in components; use semantic utilities only.

| UI surface | DESIGN.md reference | Usage in app |
|------------|---------------------|--------------|
| Modal panel | `store-utility-card` + `floating-sticky-bar` | Parchment/blur bar feel; `rounded-lg` (18px), hairline border |
| Primary actions | `button-primary` | Retranslate, Save — pill, Action Blue `#0066cc`, `scale(0.95)` active |
| Secondary | `button-secondary-pill` | Close / cancel ghost pill |
| Text fields | `search-input` | Hotkey field styling in Settings (pill, 44px height) |
| Body copy | `typography.body` | 17px / 400 / 1.47 — source & translation text |
| Headings | `typography.tagline` | Modal title "Translate" |
| Links / hints | `text-link` | ".env" help in Settings |
| Muted | `ink-muted-48` | Fine-print, API key note |
| Dark chrome | N/A for v1 | Modal stays light (`canvas` / `canvas-parchment`); no product tiles |

**Font stack:** `SF Pro Display/Text, system-ui, -apple-system` — on non-Apple, Inter fallback per DESIGN.md § Font Substitutes.

**Modal window chrome:** Electron `transparent: true` + CSS panel with `backdrop-filter: blur(20px) saturate(180%)` on parchment 80% (matches `sub-nav-frosted` / `floating-sticky-bar`).

## Project layout (target)

```
translate-input/
├── DESIGN.md                    # visual source of truth
├── .env.example
├── docs/design-spec.md          # functional spec (IPC, flows)
├── package.json
├── electron.vite.config.ts
├── tailwind.config.ts
├── src/
│   ├── shared/
│   │   └── types.ts             # Prefs, IPC payloads
│   ├── main/
│   │   ├── index.ts
│   │   ├── tray.ts
│   │   ├── hotkey.ts
│   │   ├── capture.ts
│   │   ├── windows.ts
│   │   ├── openai.ts
│   │   └── prefs.ts
│   ├── preload/
│   │   └── index.ts             # contextBridge → window.api
│   └── renderer/
│       ├── styles/
│       │   ├── tokens.css       # CSS vars from DESIGN.md
│       │   └── globals.css      # @tailwind base/components/utilities
│       ├── shared/
│       │   ├── providers/QueryProvider.tsx
│       │   ├── hooks/usePrefs.ts
│       │   ├── hooks/useTranslate.ts
│       │   └── components/      # Button, Select, ErrorBanner
│       ├── modal/
│       │   ├── main.tsx
│       │   └── App.tsx
│       └── settings/
│           ├── main.tsx
│           └── App.tsx
└── plans/260520-macos-translate-hotkey/
```

## Critical path

Phase 1 (tokens + Query provider) → 2 → 3 → 4 → 5 → 6

Phase 4 can use `MOCK_TRANSLATE=1` in parallel once Phase 3 shell exists.

## Out of scope (unchanged)

Product tiles, global nav, footer, photography — DESIGN.md is adapted for a compact utility overlay only.

## Cook handoff

When ready to implement:

```
/cook plans/260520-macos-translate-hotkey/plan.md
```

Or phase-by-phase starting with `phase-01-scaffold-app-shell.md`.
