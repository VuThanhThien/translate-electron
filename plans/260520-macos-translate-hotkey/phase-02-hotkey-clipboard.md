# Phase 02: Hotkey & Clipboard Capture

**Effort:** 2.5h  
**Depends on:** Phase 01

## Goal

Global hotkey triggers simulate Cmd+C, read clipboard text, emit event to open modal (stub window OK).

## Tasks

1. Add `electron-store` / `prefs.ts` with defaults: `hotkey: Command+Shift+T`.
2. `hotkey.ts`: register `globalShortcut` on ready; unregister on change/quit.
3. `capture.ts`:
   - Delay 80ms (tunable)
   - Simulate `Meta+C` via `@nut-tree/nut-js` (or AppleScript fallback)
   - `clipboard.readText()` → return string or empty
4. On hotkey: run capture → log text → call `windows.openModal({ text })` (empty → still open with error state).
5. Handle shortcut registration failure (log + tray notification).

## Files

| Path | Action |
|------|--------|
| `src/main/prefs.ts` | create |
| `src/main/hotkey.ts` | create |
| `src/main/capture.ts` | create |
| `src/main/windows.ts` | create (modal stub) |
| `src/main/index.ts` | wire hotkey |

## Acceptance criteria

- [ ] Default hotkey copies selection from Notes/Safari into capture result
- [ ] Empty selection shows empty string (modal can show error in phase 3)
- [ ] Changing hotkey in prefs (phase 5) re-registers shortcut
- [ ] README note: Accessibility permission if nut-js fails

## Risks

- `robotjs` native build issues on Apple Silicon → prefer `@nut-tree/nut-js` or AppleScript:
  `osascript -e 'tell application "System Events" to keystroke "c" using command down'`
