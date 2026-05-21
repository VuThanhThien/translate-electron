---
title: "BYOK API Key, Model Picker, Provider-Ready Setup"
description: "User Keychain API keys, live model dropdown, first-run Setup gate, provider registry (OpenAI enabled, Gemini listed disabled)."
status: completed
priority: P1
effort: 14h
branch: master
tags: [feature, electron, auth, frontend, api]
created: 2026-05-21
spec: docs/specs/byok-api-key-model-picker.md
---

# BYOK + Provider-Ready Setup

## Overview

Replace build-time `.env` API key with per-user Keychain storage, provider registry (v1: OpenAI only), live model picker, and first-run Setup window. Gemini visible in provider Select but disabled.

**Spec:** [docs/specs/byok-api-key-model-picker.md](../../docs/specs/byok-api-key-model-picker.md)

## Phases

| # | Phase | Status | Effort | Link |
|---|-------|--------|--------|------|
| 1 | Foundation (types, prefs migration) | Done | 2h | [phase-01](./phase-01-foundation-types-prefs.md) |
| 2 | Secrets + OpenAI provider adapter | Done | 3h | [phase-02](./phase-02-secrets-provider-openai.md) |
| 3 | Main IPC, translate router, launch gate | Done | 3h | [phase-03](./phase-03-main-ipc-translate-gate.md) |
| 4 | Setup window (first-run) | Done | 3h | [phase-04](./phase-04-setup-window.md) |
| 5 | Settings UI + shared components | Done | 2h | [phase-05](./phase-05-settings-ui.md) |
| 6 | Docs, build scripts, QA | Done | 1h | [phase-06](./phase-06-docs-build-qa.md) |

## Architecture (summary)

```
Renderer (setup/settings) → IPC secrets:* / provider:listModels / prefs:*
  → main/secrets.ts (safeStorage per providerId)
  → main/providers/registry → openai adapter
  → main/translate.ts → translate:request
```

## Key decisions (locked)

- Keychain only (`safeStorage`); no `.env` fallback for translate
- Validate key on Save; then `listModels`
- Launch Setup if no key for active `prefs.provider`
- `PROVIDERS`: OpenAI enabled, Gemini disabled in UI
- Prefs: `provider` + `model` (migrate from `openaiModel`)

## Dependencies

- Electron `safeStorage` (macOS Keychain)
- Existing shadcn `Select`, TanStack Query IPC pattern
- OpenAI SDK (main process)

## Risks

| Risk | Mitigation |
|------|------------|
| `safeStorage` unavailable | Return `encryption_unavailable`; block save |
| Unsigned dev build Keychain quirks | Test `npm run dev` early in phase 2 |
| Prefs migration | `getPrefs()` copies `openaiModel` → `model` |

## Out of scope

- Gemini adapter implementation
- `.env` dev fallback for API key
- Custom model ID field

## Implementation handoff

After approval, run implementation with cook skill:

```
/cook plans/260521-byok-provider-setup/
```
