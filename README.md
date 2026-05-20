# Translate Input

macOS menu-bar utility (Electron): select text anywhere, press a global hotkey, and get an always-on-top translation modal powered by OpenAI.

**Behavior & IPC:** [docs/design-spec.md](./docs/design-spec.md)  
**UI:** [shadcn/ui](https://ui.shadcn.com) components in `src/renderer/components/ui/`

## Stack

- Electron 35 + electron-vite
- React 19, TypeScript
- Tailwind CSS v4 + shadcn/ui
- TanStack Query v5 (IPC as data layer)
- OpenAI SDK (main process only)
- `electron-store` for preferences

## Prerequisites

- **macOS** (target platform)
- **Node.js 20+**
- OpenAI API key

## Setup

```bash
cp .env.example .env
# Edit .env — set OPENAI_API_KEY

npm install
npm run dev
```

### Environment variables

| Variable | Required | Description |
|----------|----------|-------------|
| `OPENAI_API_KEY` | Yes* | OpenAI API key (*not required if `MOCK_TRANSLATE=1`) |
| `OPENAI_MODEL` | No | Default model override (`gpt-4o-mini` in prefs) |
| `MOCK_TRANSLATE=1` | No | Return mock translations without API calls |

## Usage

1. Select text in any app (Safari, Slack, VS Code, Notes, …).
2. Press the default hotkey **⌘⇧T** (`Command+Shift+T`).
3. The modal shows captured text and auto-translates.
4. Change languages and click **Retranslate** if needed.
5. **Tray icon → Open Settings** to change hotkey, model, or default languages.

## macOS permissions

| Permission | Why |
|------------|-----|
| **Accessibility** | Simulates **⌘C** via AppleScript to read the current selection |
| **Input Monitoring** | May be required for global shortcuts on newer macOS / Electron builds |

Grant in **System Settings → Privacy & Security**.

## Development

```bash
npm run dev      # electron-vite dev
npm run build    # production build to out/
npm run typecheck
```

Tray menu: **Open Settings**, **Quit**. Dock icon is hidden while running as a background utility.

## Limitations (v1)

- Hotkey required (no selection bubble)
- Cloud translation only (OpenAI)
- Clipboard is **not** restored after capture
- No App Store / notarization / auto-update
- Dev-focused; not hardened for production distribution

## Manual QA matrix

Record results when testing on your machine (`docs/qa-2026-05-20.md`).

| App | Select | Hotkey | Translate | UI tokens OK |
|-----|--------|--------|-----------|--------------|
| Safari | ☐ | ☐ | ☐ | ☐ |
| Slack / Discord | ☐ | ☐ | ☐ | ☐ |
| VS Code / Cursor | ☐ | ☐ | ☐ | ☐ |
| Notes | ☐ | ☐ | ☐ | ☐ |

**Visual pass:** shadcn/ui components render correctly in modal and settings.

## Project layout

See [plans/260520-macos-translate-hotkey/plan.md](./plans/260520-macos-translate-hotkey/plan.md).
