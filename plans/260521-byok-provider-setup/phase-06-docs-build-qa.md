# Phase 06: Docs, Build Scripts, Manual QA

**Priority:** P2 | **Status:** Pending | **Effort:** ~1h | **Blocked by:** Phase 05

## Context

- README documents `.env` required at build
- `scripts/ensure-build-env.mjs` enforces `OPENAI_API_KEY`
- `package.json` `extraResources` bundles `.env`

## Requirements

- Update README for BYOK + Setup flow
- Relax or replace build env check (no developer key required to ship)
- Tray menu: open Setup when unconfigured, else Settings
- Update `.env.example` (optional / docs only)
- Manual QA matrix
- Mark spec approved / plan completed when done

## Related files

| Action | Path |
|--------|------|
| Modify | `README.md` |
| Modify | `scripts/ensure-build-env.mjs` |
| Modify | `.env.example` |
| Modify | `package.json` (optional: remove `.env` from `extraResources`) |
| Modify | `src/main/tray.ts` |
| Modify | `src/main/env.ts` / `index.ts` (remove dead env load if unused) |
| Modify | `docs/specs/byok-api-key-model-picker.md` status → Implemented |

## Implementation steps

1. **README**
   - Setup: first launch → enter API key in app
   - Remove "embed OPENAI_API_KEY at build"
   - Permissions section unchanged
   - Limitations: update API key bullet → Keychain in Settings
   - Development: `npm run dev` → open Setup, paste own key (no `.env` required)

2. **`ensure-build-env.mjs`**
   - Option A: remove script gate entirely
   - Option B: only warn if `.env` missing, do not require key
   - Recommend **A** or warn-only — packaged app must not require project `.env`

3. **`package.json` build**
   - Remove `{ "from": ".env", "to": ".env" }` from `extraResources` OR ship empty template without secrets
   - Update `prepack`/`predist` if script deleted

4. **`tray.ts`**
   ```ts
   label: isConfigured() ? 'Open Settings' : 'Configure API Key…'
   click: () => isConfigured() ? showSettingsWindow() : showSetupWindow()
   ```

5. **`.env.example`**
   ```env
   # Optional — API keys are configured in the app (Settings / Setup).
   # OPENAI_MODEL is no longer used; set model in Settings.
   ```

6. **Manual QA** (record in `docs/qa-byok-2026-05-21.md` optional)

   | Case | Expected |
   |------|----------|
   | Fresh userData, launch | Setup window |
   | Invalid key Save | Error, no translate |
   | Valid key Save | Setup closes, translate works |
   | Hotkey without key | Setup, not modal |
   | Settings change model | Retranslate new model |
   | Remove key | Setup on hotkey |
   | Gemini in Select | Disabled, not selectable |
   | `npm run typecheck` | Pass |
   | `npm run pack` without .env key | Build succeeds |

## Todo

- [ ] README updated
- [ ] Build script / extraResources updated
- [ ] Tray conditional label
- [ ] QA matrix executed
- [ ] Spec status updated

## Success criteria

- New user can install `.app` without developer API key in bundle
- All manual QA rows pass
- No plaintext keys in repo or prefs export

## Plan completion

Update `plan.md` frontmatter `status: completed` when all phases done.
