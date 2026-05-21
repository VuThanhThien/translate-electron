# Phase 02: Secrets + OpenAI Provider Adapter

**Priority:** P1 | **Status:** Pending | **Effort:** ~3h | **Blocked by:** Phase 01

## Context

- Current logic: `src/main/openai.ts` (env key + translate)
- Storage: `userData/secrets.json` map `{ [providerId]: encryptedBase64 }`

## Requirements

- `secrets.ts`: has/get/set/clear per `providerId` via `safeStorage`
- `providers/openai.ts`: `TranslationProvider` — validate, listChatModels, translate
- `providers/registry.ts`: `getProvider(id)` throws if disabled/missing
- Extract + unit-test model filter heuristic
- Remove env key usage from translate path (keep file until phase 3 wires router)

## Related files

| Action | Path |
|--------|------|
| Create | `src/main/secrets.ts` |
| Create | `src/main/providers/openai.ts` |
| Create | `src/main/providers/registry.ts` |
| Create | `src/main/providers/model-filter.ts` (optional, testable) |
| Modify | `src/main/openai.ts` → thin re-export or delete in phase 3 |

## Implementation steps

1. **`secrets.ts`**
   - Path: `join(app.getPath('userData'), 'secrets.json')`
   - `readStore()` / `writeStore()` JSON object
   - `encryptKey(plain)` / `decryptKey(blob)` using `safeStorage`
   - If `!safeStorage.isEncryptionAvailable()` → throw typed error for IPC
   - `hasApiKey(provider)`, `getApiKey(provider)`, `setApiKey(provider, plain)`, `clearApiKey(provider)`
   - Never log plaintext keys

2. **`providers/openai.ts`**
   - Move `SYSTEM_PROMPT`, `mapOpenAIError`, chat completion from `openai.ts`
   - `validateApiKey(key)`: `new OpenAI({ apiKey }).models.list({ limit: 1 })`
   - `listChatModels(key)`: full list + filter via `filterChatModelIds(ids)`
   - `translate({ text, sourceLang, targetLang, model, apiKey })`: existing completion logic
   - Export object satisfying `TranslationProvider` interface (define in `providers/types.ts` or `shared/providers.ts`)

3. **`providers/registry.ts`**
   ```ts
   export function getProvider(id: ProviderId): TranslationProvider {
     const meta = PROVIDERS.find(p => p.id === id)
     if (!meta?.enabled) throw new ProviderNotAvailableError(id)
     switch (id) { case 'openai': return openaiProvider; default: throw ... }
   }
   ```

4. **Model filter** (`filterChatModelIds`)
   - Include: `/^(gpt-|o\d|chatgpt-)/i` excluding embedding/tts/whisper/dall-e/realtime/transcribe
   - Sort: `gpt-4o-mini`, `gpt-4o` first, then alpha
   - Export for unit test (add minimal test file only if project gains test runner; else manual checklist)

5. **Dev verification**
   - `npm run dev` → node REPL or temporary log: encrypt/decrypt roundtrip works on your Mac

## Security

- Keys only in `secrets.json` encrypted blobs
- Renderer never receives stored key after save
- Validate before persist in phase 3 `secrets:set` handler

## Todo

- [ ] `secrets.ts` CRUD + encryption guard
- [ ] OpenAI adapter (validate, list, translate)
- [ ] Registry + disabled provider guard
- [ ] Model filter extracted

## Success criteria

- Can set/get/clear OpenAI key in main process manually
- `listChatModels` returns filtered ids with valid test key
- `translate` works with Keychain key (manual script or phase 3 IPC)

## Risks

- `safeStorage` on unsigned app: document in README if login keychain required

## Next

Phase 03: IPC + `translate.ts` router
