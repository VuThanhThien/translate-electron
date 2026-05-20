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
| `OPENAI_API_KEY` | Yes | OpenAI API key |
| `OPENAI_MODEL` | No | Default model override (`gpt-4o-mini` in prefs) |

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
npm run preview  # run the built app from out/
npm run typecheck
```

Tray menu: **Open Settings**, **Quit**. Dock icon is hidden while running as a background utility.

## Installable macOS app

Configure `.env` in the project root first — it is **bundled into the app at build time** (no per-user `.env` file).

```bash
cp .env.example .env
# Set OPENAI_API_KEY

npm install
npm run dist:mac
```

Artifacts land in `dist/`:

| Output | Use |
|--------|-----|
| `dist/mac-arm64/Translate Input.app` | Run or copy to Applications |
| `dist/Translate Input-0.1.0-arm64.dmg` | Installer disk image |
| `dist/Translate Input-0.1.0-arm64-mac.zip` | Zip archive |

App icon and menu-bar tray use `logo.png`. To change API keys or model defaults, edit `.env` and run `npm run dist:mac` again.

Quick local test without DMG:

```bash
npm run pack
open "dist/mac-arm64/Translate Input.app"
```

### Start at login

1. Open **System Settings → General → Login Items** (or **Users & Groups → Login Items** on older macOS).
2. Click **+** and choose **Translate Input** from Applications (or the `.app` in `dist/mac-arm64/`).

First launch: macOS may block the app because it is **unsigned**. Open **Privacy & Security** and choose **Open Anyway**, or right-click the app → **Open**.

### Build commands

| Script | Description |
|--------|-------------|
| `npm run pack` | Build `.app` in `dist/mac-*` (no DMG) |
| `npm run dist` | Full package for current platform |
| `npm run dist:mac` | macOS DMG + zip + `.app` |

## Limitations (v1)

- Hotkey required (no selection bubble)
- Cloud translation only (OpenAI)
- Clipboard is **not** restored after capture
- Unsigned build (Gatekeeper warning on first open); no App Store / notarization / auto-update
- API key is embedded from project `.env` at build time (rebuild to change; not in Settings UI)

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
