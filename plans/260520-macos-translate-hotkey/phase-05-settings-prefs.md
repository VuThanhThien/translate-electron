# Phase 05: Settings & Prefs (React Query)

**Effort:** 2.5h  
**Depends on:** Phase 04

## Goal

Persist languages, hotkey, model; Settings UI per **DESIGN.md** (`search-input`, `button-primary`, `text-link`); **`useQuery` + `useMutation`** for prefs; main syncs hotkey.

## Tasks

1. Extend `Prefs` in `src/shared/types.ts`: `sourceLang`, `targetLang`, `hotkey`, `openaiModel`.
2. Main `prefs.ts` + `electron-store`; IPC `prefs:get`, `prefs:set`, `prefs:changed` broadcast.
3. `usePrefs.ts`:
   - `useQuery({ queryKey: ['prefs'], queryFn: api.prefs.get })`
   - `useMutation({ mutationFn: api.prefs.set, onSuccess: () => queryClient.invalidateQueries(['prefs']) })`
   - Subscribe `api.onPrefsChanged` → invalidate query
4. Settings UI (`settings/App.tsx`):
   - Layout: `bg-canvas-parchment`, max-width ~480px, `text-body`
   - Hotkey field: `search-input` styling (pill, 44px, hairline border)
   - Model input: same input style
   - Language defaults: `LanguageSelect` shared component
   - Save → `savePrefs.mutate(partial)` → primary pill button
   - Help line: `text-link` — "Set OPENAI_API_KEY in .env" (`fine-print` / `ink-muted`)
5. On save in main: persist → `globalShortcut.unregisterAll` + re-register → `webContents.send('prefs:changed')`.
6. Modal: `useQuery(['prefs'])` for initial langs; listens for `prefs:changed`.

## Files

| Path | Action |
|------|--------|
| `src/main/prefs.ts` | extend |
| `src/renderer/settings/App.tsx` | full form |
| `src/renderer/shared/hooks/usePrefs.ts` | create |
| `src/preload/index.ts` | prefs IPC + event subscription |

## Acceptance criteria

- [ ] Settings matches DESIGN.md inputs/buttons (no raw hex)
- [ ] Change target → save → next hotkey uses new default langs
- [ ] Change hotkey → old unregistered, new works; conflict shows inline error
- [ ] Quit/relaunch → `useQuery` refetches persisted prefs
- [ ] Modal receives `prefs:changed` without restart
