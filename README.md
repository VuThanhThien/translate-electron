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
- macOS Keychain via Electron `safeStorage` for API keys (BYOK)

## Prerequisites

- **macOS** (target platform)
- **Node.js 20+**
- Your own OpenAI API key (entered in the app on first launch)

## Setup

```bash
npm install
npm run dev
```

On first launch, the **Setup** window prompts for your OpenAI API key and model. The key is stored in **macOS Keychain**, not in project files or app preferences.

## Usage

1. Select text in any app (Safari, Slack, VS Code, Notes, …).
2. Press the default hotkey **⌘⇧T** (`Command+Shift+T`).
3. The modal opens on the **Translate** tab with captured text and auto-translation.
4. Switch to **Help me write** for grammar fixes (same language) or translate-and-fix (different languages). Results are cached per tab until you close the modal.
5. Use **Copy** on the output section to copy the active tab’s result.
6. Change languages in the shared language bar; edits debounce like translate (550ms on the active tab).
7. **Tray icon → Open Settings** to change hotkey, provider, model, or default languages.

If no API key is configured, the hotkey opens **Setup** instead of the translate modal.

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

Tray menu: **Open Settings** (or **Configure API Key…** when unset), **Quit**. Dock icon is hidden while running as a background utility.

To reset API key during development, delete `~/Library/Application Support/translate-input/secrets.json` and relaunch.

## Installable macOS app

No project `.env` API key is required to build or run the packaged app.

```bash
npm install
npm run dist:mac
```

Artifacts land in `dist/`:

| Output | Use |
|--------|-----|
| `dist/mac-arm64/Translate Input.app` | Run or copy to Applications |
| `dist/Translate Input-0.1.0-arm64.dmg` | Installer disk image |
| `dist/Translate Input-0.1.0-arm64-mac.zip` | Zip archive |

App icon and menu-bar tray use `logo.png`. Change API keys or model in **Settings** (no rebuild required).

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
| `npm run pack` | Unpacked app in `dist/` for the **current OS** (no installer) |
| `npm run dist` | Installer/archive for the **current OS** |
| `npm run dist:mac` | macOS DMG + zip + `.app` |
| `npm run dist:win` | Windows NSIS installer + portable `.exe` (run on Windows, or cross-build with Wine) |
| `npm run dist:linux` | Linux AppImage + `.deb` |

**Platform support:** Packaging works on all three targets above. **Runtime features** (selection capture via simulated copy, menu-bar tray, accessibility anchoring) are implemented for **macOS only**. Windows/Linux builds are for contributors or future porting—not a supported end-user experience yet.

## Limitations (v1)

- Hotkey required (no selection bubble)
- Cloud translation only (OpenAI enabled; Gemini listed as coming soon)
- Clipboard is **not** restored after capture
- Unsigned build (Gatekeeper warning on first open); no App Store / notarization / auto-update
- API keys in macOS Keychain only (no `.env` fallback)

## Manual QA matrix

Record results when testing on your machine (`docs/qa-2026-05-20.md`).

| App | Select | Hotkey | Translate | Help me write | Copy | UI tokens OK |
|-----|--------|--------|-----------|---------------|------|--------------|
| Safari | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ |
| Slack / Discord | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ |
| VS Code / Cursor | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ |
| Notes | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ |

**BYOK QA:** See `plans/260521-byok-provider-setup/phase-06-docs-build-qa.md`.

## Project layout

See [plans/260520-macos-translate-hotkey/plan.md](./plans/260520-macos-translate-hotkey/plan.md) and [plans/260521-byok-provider-setup/plan.md](./plans/260521-byok-provider-setup/plan.md).
