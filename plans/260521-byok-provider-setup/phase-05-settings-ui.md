# Phase 05: Settings UI + Shared Provider Card

**Priority:** P1 | **Status:** Pending | **Effort:** ~2h | **Blocked by:** Phase 04

## Context

- `src/renderer/settings/App.tsx` — hotkey, `openaiModel` text input, `.env` hint
- Hooks: `usePrefs.ts`

## Requirements

- Extract `ProviderConnectionCard` used by Setup + Settings
- Settings: provider Select, model Select, API key manage (configured / change / remove)
- Hooks: `useSecretsHasKey`, `useProviderModels`, `useSetApiKey`
- Remove `.env` paragraph; update save flow
- Changing provider (future): only OpenAI selectable now

## Related files

| Action | Path |
|--------|------|
| Create | `src/renderer/shared/ProviderConnectionCard.tsx` |
| Create | `src/renderer/shared/hooks/useSecrets.ts` |
| Create | `src/renderer/shared/hooks/useProviderModels.ts` |
| Modify | `src/renderer/settings/App.tsx` |
| Modify | `src/renderer/setup/App.tsx` (use shared card) |
| Modify | `src/renderer/modal/App.tsx` (only if error messages reference OPENAI_API_KEY) |

## Implementation steps

1. **`useSecrets.ts`**
   - `useHasApiKey(provider)` query `secrets.hasKey`
   - `useSetApiKey()` mutation `secrets.set`
   - `useClearApiKey()` mutation `secrets.clear`

2. **`useProviderModels.ts`**
   - Query `provider.listModels({ provider })`, `enabled: hasKey`
   - `queryKey: ['provider', provider, 'models']`

3. **`ProviderConnectionCard` props**
   ```ts
   {
     provider: ProviderId
     onProviderChange: (id: ProviderId) => void
     mode: 'setup' | 'settings'
   }
   ```
   - Provider Select (PROVIDERS + disabled Gemini)
   - Key: password field OR "configured" + Change/Remove
   - Model Select populated from query
   - `onSaveKey` callback for parent to chain prefs save

4. **Settings `App.tsx`**
   - Replace `openaiModel` state with `model` from prefs
   - Add `provider` state
   - Embed `ProviderConnectionCard` above languages
   - Save button: validate hotkey + `prefs.set({ hotkey, sourceLang, targetLang, provider, model })`
   - Key change: call `secrets.set` when password field non-empty (can be same Save click)
   - Remove lines 128–131 `.env` hint

5. **Setup `App.tsx`** — thin wrapper around card + single Save & Continue

6. **Modal errors** — grep `OPENAI` / `.env` in renderer; use generic "Add API key in Settings"

## Todo

- [ ] Shared hooks
- [ ] ProviderConnectionCard
- [ ] Settings wired
- [ ] Setup refactored to shared card
- [ ] Modal error strings updated

## Success criteria

- Settings shows model dropdown after key configured
- Change model + Save → retranslate uses new model
- Remove key → `hasKey` false; next hotkey opens Setup
- Provider shows OpenAI + disabled Gemini

## Next

Phase 06: docs + build + QA
