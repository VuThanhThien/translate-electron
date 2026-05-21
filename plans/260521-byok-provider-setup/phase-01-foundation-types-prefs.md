# Phase 01: Foundation — Types, Providers Catalog, Prefs Migration

**Priority:** P1 | **Status:** Pending | **Effort:** ~2h

## Context

- Spec: [byok-api-key-model-picker.md](../../docs/specs/byok-api-key-model-picker.md)
- Current prefs: `src/main/prefs.ts`, `src/shared/types.ts` (`openaiModel`)

## Requirements

- Add `ProviderId`, `PROVIDERS` catalog (OpenAI enabled, Gemini disabled)
- Extend `Prefs`: `provider: ProviderId`, `model: string`
- Migrate legacy `openaiModel` on read
- Update `DEFAULT_PREFS`
- Extend `ElectronAPI` types (stubs for upcoming IPC)

## Related files

| Action | Path |
|--------|------|
| Create | `src/shared/providers.ts` |
| Modify | `src/shared/types.ts` |
| Modify | `src/shared/electron-api.ts` |
| Modify | `src/main/prefs.ts` |
| Modify | `src/env.d.ts` (if needed for window.api) |

## Implementation steps

1. **Create `src/shared/providers.ts`**
   ```ts
   export const PROVIDERS = [
     { id: 'openai', label: 'OpenAI', enabled: true },
     { id: 'gemini', label: 'Google Gemini', enabled: false }
   ] as const
   export type ProviderId = (typeof PROVIDERS)[number]['id']
   export function isProviderEnabled(id: ProviderId): boolean
   export type ModelOption = { id: string; label?: string }
   ```

2. **Update `Prefs` in `types.ts`**
   - Add `provider: ProviderId` default `'openai'`
   - Rename `openaiModel` → `model` default `'gpt-4o-mini'`
   - Add IPC result types: `SecretsSetResult`, `ListModelsResult`, etc. (from spec)

3. **Migration in `getPrefs()`**
   ```ts
   // electron-store may still have openaiModel
   const legacy = store.get('openaiModel')
   if (legacy && !store.get('model')) store.set('model', legacy)
   if (!store.get('provider')) store.set('provider', 'openai')
   ```

4. **Update `electron-api.ts`** — add method signatures (implement in phase 3):
   - `secrets.hasKey({ provider? })`
   - `secrets.set({ provider, apiKey })`
   - `secrets.clear({ provider? })`
   - `provider.listModels({ provider? })`

5. **Fix compile errors** in renderer referencing `openaiModel` → temporary alias or update call sites in phase 5 only if build breaks (grep `openaiModel`).

## Todo

- [ ] `providers.ts` catalog + helpers
- [ ] `Prefs` + DEFAULT_PREFS + migration
- [ ] `electron-api.ts` type extensions
- [ ] `npm run typecheck` passes (may need stub preload handlers later)

## Success criteria

- Types reflect spec IPC contracts
- Existing users with `openaiModel` get `model` + `provider: openai`
- No secrets in prefs store

## Next

Phase 02: `secrets.ts` + OpenAI adapter
