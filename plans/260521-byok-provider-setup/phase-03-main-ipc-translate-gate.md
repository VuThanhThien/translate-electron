# Phase 03: Main IPC, Translate Router, Launch Gate

**Priority:** P1 | **Status:** Pending | **Effort:** ~3h | **Blocked by:** Phase 02

## Context

- IPC today: `src/main/index.ts`, `src/preload/index.ts`
- Hotkey: `handleHotkey` always opens modal
- Startup: `warnIfMissingApiKey()` from env

## Requirements

- `translate.ts` router: prefs → provider → key → translate
- IPC handlers per spec
- `isConfigured()` = `hasApiKey(getPrefs().provider)`
- Startup: show Setup if not configured
- Hotkey: Setup instead of modal if not configured
- Remove env API key from translate; remove `warnIfMissingApiKey` env check

## Related files

| Action | Path |
|--------|------|
| Create | `src/main/translate.ts` |
| Modify | `src/main/index.ts` |
| Modify | `src/preload/index.ts` |
| Delete/trim | `src/main/openai.ts` (re-export or remove) |
| Modify | `src/main/windows.ts` (stub `showSetupWindow` if phase 4 not done — or minimal window) |

## Implementation steps

1. **`translate.ts`**
   ```ts
   export async function translateRequest(req: TranslateRequest): Promise<TranslateResponse> {
     const prefs = getPrefs()
     const provider = getProvider(prefs.provider)
     const apiKey = getApiKey(prefs.provider)
     if (!apiKey) return { error: '...', code: 'missing_key' }
     const model = req.model ?? prefs.model
     return provider.translate({ ...req, model, apiKey })
   }
   ```

2. **IPC in `index.ts`**
   - `secrets:hasKey` → `hasApiKey(provider ?? getPrefs().provider)`
   - `secrets:set` → validate via `getProvider(provider).validateApiKey`, then `setApiKey`; return `{ ok: true }` or error codes from spec
   - `secrets:clear` → `clearApiKey(provider)`
   - `provider:listModels` → get key, `listChatModels`, return `{ ok, models }`
   - `translate:request` → `translateRequest(req)` (replace direct `translateText`)

3. **Preload** — wire new `window.api.secrets` and `window.api.provider`

4. **Configuration helpers** (`src/main/config.ts` optional)
   - `export function isConfigured(): boolean`
   - `export function requireConfigured(action): void`

5. **Launch gate in `app.whenReady`**
   ```ts
   if (!isConfigured()) showSetupWindow()
   else registerHotkey(handleHotkey)
   ```
   - Import `showSetupWindow` from windows (phase 4 implements UI; phase 3 can open settings URL `setup` placeholder)

6. **Hotkey guard**
   ```ts
   async function handleHotkey() {
     if (!isConfigured()) { showSetupWindow(); return }
     // existing capture + openModal
   }
   ```

7. **Remove** `loadEnv` dependency for API key in translate (keep `loadEnv()` if used elsewhere; else optional cleanup in phase 6)

## Todo

- [ ] `translate.ts` router
- [ ] All IPC handlers + preload exposure
- [ ] Startup + hotkey gate
- [ ] Delete env-based translate path
- [ ] `typecheck` clean

## Success criteria

- IPC `secrets:set` with valid key persists and `hasKey` true
- IPC `provider:listModels` returns models
- `translate:request` works with stored key, fails with `missing_key` when empty
- Hotkey without key opens Setup (not modal)

## Next

Phase 04: Setup renderer + window
