# Phase 04: Setup Window (First-Run)

**Priority:** P1 | **Status:** Pending | **Effort:** ~3h | **Blocked by:** Phase 03

## Context

- Pattern: `src/renderer/settings/` + `windows.ts` settings window
- Vite entries: `modal`, `settings` in `electron.vite.config.ts`

## Requirements

- New renderer entry `setup/`
- `showSetupWindow()` / `createSetupWindow()` mirroring settings dimensions
- Setup shown on launch when `!isConfigured()`
- Non-skippable: user quits or completes Save & Continue
- On success: close setup, user can use hotkey

## Related files

| Action | Path |
|--------|------|
| Create | `src/renderer/setup/index.html` |
| Create | `src/renderer/setup/main.tsx` |
| Create | `src/renderer/setup/App.tsx` |
| Create | `src/renderer/shared/ProviderConnectionCard.tsx` (or under setup first, extract in phase 5) |
| Modify | `src/main/windows.ts` |
| Modify | `electron.vite.config.ts` |
| Modify | `src/main/tray.ts` (conditional menu label — full tray in phase 6) |

## Implementation steps

1. **Vite** — add rollup input:
   ```ts
   setup: resolve(__dirname, 'src/renderer/setup/index.html')
   ```

2. **`windows.ts`**
   - `setupWindow` singleton like settings
   - `createSetupWindow()`, `showSetupWindow()`, `closeSetupWindow()`
   - `rendererUrl('setup')` — extend union type `'modal' | 'settings' | 'setup'`
   - Title: "Translate Input — Setup"
   - Consider `closable: false` or intercept `close` event to hide quit-only (spec: no skip — allow window close = app still runs but hotkey reopens Setup)

3. **`setup/App.tsx`**
   - Provider `<Select>` from `PROVIDERS` — Gemini `SelectItem` disabled, suffix "Coming soon"
   - Masked API key input
   - Model `<Select>` disabled until after successful save+list
   - Button **Save & Continue**:
     1. `secrets.set({ provider, apiKey })`
     2. on ok → `provider.listModels({ provider })`
     3. pick default model (`gpt-4o-mini` or first)
     4. `prefs.set({ provider, model })`
     5. `closeSetupWindow()` — main could listen via IPC `setup:complete` or renderer invokes `window.close()` if exposed
   - Loading + error `Alert` states
   - Use TanStack Query mutations or sequential async in handler

4. **`setup/main.tsx`** — mirror settings bootstrap (QueryProvider, globals.css)

5. **IPC close flow**
   - Option A: `window.api.setup.complete()` → main closes window
   - Option B: send from main after prefs set from main-side handler only
   - Prefer main closes after successful `secrets:set` chain in one IPC `setup:finish` to avoid half-state — **or** keep all in renderer sequential calls then `setup.close()` preload send

6. **Styling** — reuse Card/Button/Select from shadcn; match Settings layout

## UI copy

- Title: "Connect your AI provider"
- Subtitle: dynamic provider label
- Footer: Key stored in macOS Keychain

## Todo

- [ ] Vite setup entry
- [ ] Setup window in main
- [ ] Setup App with Save flow
- [ ] Close setup on success
- [ ] Manual: fresh `userData` → Setup on launch

## Success criteria

- Delete `secrets.json` + relaunch → Setup appears
- Valid key + Save → Setup closes, hotkey opens modal
- Invalid key → error, key not stored
- Gemini not selectable

## Next

Phase 05: Settings integration + shared card
