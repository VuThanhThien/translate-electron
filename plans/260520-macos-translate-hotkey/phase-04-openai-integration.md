# Phase 04: OpenAI Integration + TanStack Query

**Effort:** 2.5h  
**Depends on:** Phase 03

## Goal

Main process translates via OpenAI; renderer uses **`useMutation` / `useQuery`** for real results, errors, and retries — no raw `useEffect` fetch chains.

## Tasks

1. `src/main/openai.ts`:
   - Read `process.env.OPENAI_API_KEY` at startup; warn if missing
   - `translate({ text, sourceLang, targetLang, model })` via `openai` SDK
   - System prompt: translation-only output (per design-spec)
   - Max length ~8000 chars
2. IPC `ipcMain.handle('translate:request', ...)` — returns `{ translation }` or `{ error, code? }`.
3. Preload: `translate: (payload) => ipcRenderer.invoke('translate:request', payload)`.
4. Update `useTranslate.ts`:
   - `useMutation({ mutationFn: api.translate, retry: 1, onError })`
   - Optional `gcTime` / `staleTime` — translations are ephemeral per modal session
5. `modal/App.tsx`: remove stub; wire mount → `mutate({ text, sourceLang, targetLang })` when IPC delivers text.
6. Error mapping in main → user strings: 401, 429, network, missing key.
7. `MOCK_TRANSLATE=1` → main returns `[mock] ${text.slice(0,80)}` for offline UI.

## Query keys convention

```ts
['prefs']                           // useQuery — settings + modal defaults
['translate', text, source, target] // useMutation variables (not cached long-term)
```

## Files

| Path | Action |
|------|--------|
| `src/main/openai.ts` | create |
| `src/main/index.ts` | register handlers |
| `src/preload/index.ts` | expose translate |
| `src/renderer/shared/hooks/useTranslate.ts` | wire real IPC |
| `package.json` | add `openai` |

## Acceptance criteria

- [ ] Valid `.env` → modal auto-translates on open (mutation success)
- [ ] Missing API key → `isError` + ErrorBanner message
- [ ] Retranslate after lang change → new mutation, new result
- [ ] API key never in renderer bundle (inspect DevTools Sources)
- [ ] React Query Devtools shows mutation lifecycle in dev
