---
title: Improve vibe & strength settings
status: completed
spec: docs/improve-vibe-settings-spec.md
created: 2026-05-21
---

# Plan: Improve writing config (vibe + strength)

Implement user-configurable **Help me write** style via Settings: vibe preset, edit strength, optional custom hint. Prompt building moves to a shared module; OpenAI provider consumes composed prompts.

**Spec:** [docs/improve-vibe-settings-spec.md](../../docs/improve-vibe-settings-spec.md)

## Scope summary

| In | Out |
|----|-----|
| Extend `Prefs` + defaults + migration | Modal UI for improve config |
| `buildImprovePrompt()` + unit tests | Gemini provider |
| Settings section (vibe, strength, hint) | Translate tab prompt changes |
| Wire `improve.ts` → OpenAI | Length / formality sliders |

## Phase 1 — Shared types & prompt builder

**Goal:** Testable prompt logic with no UI.

### Tasks

1. Add `src/shared/improve-config.ts`
   - `ImproveVibeId`, `ImproveStrengthId`
   - `IMPROVE_VIBE_PRESETS` (id, label, description, `promptFragment`)
   - `IMPROVE_STRENGTH_OPTIONS` (id, label, description, `promptFragment`)
   - `sanitizeImproveCustomHint(raw: string): string` (trim, max 200)
   - `coerceImproveVibe` / `coerceImproveStrength` for invalid stored values

2. Add `src/shared/improve-prompt.ts`
   - `buildImprovePrompt({ text, sourceLang, targetLang, vibe, strength, customHint })`
   - Use `getLanguageLabel` from `detect-language.ts`
   - Export for unit tests

3. Extend `src/shared/types.ts`
   - Add three fields to `Prefs` + `DEFAULT_PREFS`

4. Add `src/shared/improve-prompt.test.ts` (Vitest if present, else minimal node test or document manual-only — **prefer adding vitest devDep only if repo already has test runner**)
   - Cases: sameLang vs crossLang base
   - Each vibe includes fragment
   - Each strength includes fragment
   - Custom hint appended when non-empty
   - Invalid vibe → neutral fallback in builder input (coercion at prefs layer)

**Files:** `improve-config.ts`, `improve-prompt.ts`, `types.ts`, test file

**Done when:** `buildImprovePrompt` outputs expected substrings for matrix of inputs; typecheck clean.

---

## Phase 2 — Persistence & main pipeline

**Goal:** Improve requests use saved prefs end-to-end.

### Tasks

1. Update `src/main/prefs.ts` `getPrefs()` / `migrateLegacyPrefs()`
   - Return `improveVibe`, `improveStrength`, `improveCustomHint` with defaults
   - Coerce invalid enum strings

2. Update `src/shared/providers.ts` `ImproveParams`
   - Include `improveVibe`, `improveStrength`, `improveCustomHint`

3. Update `src/main/improve.ts`
   - Merge improve fields from `getPrefs()` into `provider.improve()` call

4. Refactor `src/main/providers/openai.ts` `improve()`
   - Remove `SYSTEM_IMPROVE_SAME` / `SYSTEM_IMPROVE_CROSS` constants
   - Call `buildImprovePrompt()` with resolved langs + params
   - Keep error mapping, temperature 0.2, char limits

**Files:** `prefs.ts`, `improve.ts`, `openai.ts`, `providers.ts`

**Done when:** Dev app improves text using defaults; changing prefs in store (manual) alters behavior.

---

## Phase 3 — Settings UI

**Goal:** Users configure improve style without touching code.

### Tasks

1. Extract `ImproveSettingsSection` component (optional) under `src/renderer/shared/` or inline in `settings/App.tsx`
   - Vibe `<Select>` with descriptions from `IMPROVE_VIBE_PRESETS` (import types/constants via shared alias)
   - Strength radio/segmented control
   - Custom hint field + char count / validation (200 max, reject on save)

2. Wire state in `SettingsApp`
   - Local state for three fields; sync from `usePrefsQuery`
   - Include in `savePrefs.mutate({ ... })`

3. Update `CardDescription` to mention writing style

4. README: one bullet under Settings / Help me write

**Files:** `settings/App.tsx`, `README.md`, optional new component

**Done when:** Save persists; relaunch shows values; overlong hint blocks save with message.

---

## Phase 4 — Verification & docs

**Goal:** Ship-ready quality gate.

### Tasks

1. Run `npm run typecheck`
2. Manual matrix (document in PR or plan checkboxes):
   - EN→EN Neutral Light
   - EN→EN Friendly Strong
   - VI→EN Professional Balanced + custom hint
3. Confirm modal Write tab unchanged visually; behavior reflects Settings after save

**Done when:** Success criteria in spec all checked.

---

## Implementation order

```
Phase 1 → Phase 2 → Phase 3 → Phase 4
```

Phase 1 and 2 can be one PR; Phase 3 UI can follow or same PR if small.

## Key code touchpoints

| File | Change |
|------|--------|
| `src/shared/types.ts` | Extend `Prefs` |
| `src/shared/improve-config.ts` | New |
| `src/shared/improve-prompt.ts` | New |
| `src/main/prefs.ts` | Migration + getters |
| `src/main/improve.ts` | Pass improve prefs |
| `src/main/providers/openai.ts` | Use builder |
| `src/renderer/settings/App.tsx` | UI section |

## Cook / implement handoff

```bash
# Implement from spec + plan (use cook skill or agent):
# Context: docs/improve-vibe-settings-spec.md
# Plan: plans/improve-vibe-settings/plan.md
```

**Suggested first step:** Phase 1 — add `improve-config.ts` and `buildImprovePrompt` with tests before touching UI.

## Effort estimate

| Phase | Estimate |
|-------|----------|
| 1 | 2–3 h |
| 2 | 1–2 h |
| 3 | 2–3 h |
| 4 | 1 h |
| **Total** | ~1 day |
