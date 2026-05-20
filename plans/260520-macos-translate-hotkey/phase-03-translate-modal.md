# Phase 03: Translate Modal UI (DESIGN.md)

**Effort:** 3h  
**Depends on:** Phase 02

## Goal

Frameless always-on-top modal near cursor; **styled per DESIGN.md** (`store-utility-card` + `floating-sticky-bar`); language selectors, translation area, loading/error, Retranslate — wired to TanStack Query (stub mutation until Phase 4).

## Visual spec (from DESIGN.md)

```
┌─────────────────────────────────────────┐  ← floating-sticky-bar feel
│  Translate          [pill Close]        │     parchment 80% + backdrop-blur
├─────────────────────────────────────────┤
│  Source (read-only, text-body, ink)     │  ← store-utility-card interior
│  [source ▼]  →  [target ▼]              │     white canvas, hairline border,
│  ─────────────────────────────────────  │     rounded-lg (18px)
│  Translation / loading / error          │
│              [Retranslate] primary pill │
└─────────────────────────────────────────┘
```

| Element | Component / token |
|---------|-------------------|
| Panel | `canvas` bg, `hairline` 1px border, `rounded-lg`, padding `lg` (24px) |
| Header bar | `canvas-parchment` 80%, `backdrop-blur`, height ~52px, `text-tagline` |
| Source block | `text-body`, `text-ink`, read-only |
| Translation | `text-body`; error uses muted banner (not second accent color) |
| Retranslate | `button-primary` — pill, `bg-primary`, active `scale-95` |
| Close | `button-secondary-pill` or ghost text-link |
| Language selects | Native `<select>` styled minimal, or headless + Tailwind; caption size |

**Do not:** shadows on card, gradients, weight 500, second accent color (DESIGN.md Don'ts).

## Tasks

1. `windows.ts`: modal `BrowserWindow` — `frame: false`, `transparent: true`, `alwaysOnTop: true`, `skipTaskbar: true`, `vibrancy: 'under-window'` optional on darwin.
2. Position: `screen.getCursorScreenPoint()`, clamp to work area, offset ~16px from cursor.
3. Preload IPC: `openModal`, `closeModal`, `translate` invoke (stub).
4. Shared components (`src/renderer/shared/components/`):
   - `Button.tsx` — variants: `primary` | `secondary-pill`
   - `ErrorBanner.tsx`
   - `LanguageSelect.tsx`
5. `useTranslate.ts` — `useMutation` calling `window.api.translate`; keys: `['translate', text, sourceLang, targetLang]`.
6. `modal/App.tsx`:
   - `useQuery(['prefs'], api.prefs.get)` for initial langs
   - On mount + when `text` IPC payload arrives: `mutate()` auto-translate
   - States via mutation: `isPending`, `isError`, `data`
   - Retranslate button → `mutate()` with current dropdown values
7. Close: Esc listener, Close button → `api.closeModal()`.

## Files

| Path | Action |
|------|--------|
| `src/main/windows.ts` | extend |
| `src/preload/index.ts` | add IPC types |
| `src/renderer/shared/hooks/useTranslate.ts` | create |
| `src/renderer/shared/hooks/usePrefs.ts` | create |
| `src/renderer/shared/components/Button.tsx` | create |
| `src/renderer/shared/components/ErrorBanner.tsx` | create |
| `src/renderer/shared/components/LanguageSelect.tsx` | create |
| `src/renderer/modal/App.tsx` | create |
| `src/renderer/modal/main.tsx` | create |

## Acceptance criteria

- [ ] Hotkey opens modal with captured text; panel matches DESIGN.md (pill CTA, 17px body, Action Blue)
- [ ] Modal positioned on correct display near cursor
- [ ] Loading spinner/skeleton while mutation pending
- [ ] Mock/stub translation shows in `text-body` style
- [ ] Esc closes modal; second hotkey reopens with new text
- [ ] No inline hex in TSX — only Tailwind semantic classes
