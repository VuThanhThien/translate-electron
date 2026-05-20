import { config } from 'dotenv'
import { existsSync } from 'fs'
import { app, ipcMain } from 'electron'
import { join } from 'path'
import { captureSelectionText } from './capture'
import { getCursorAnchor, resolveSelectionAnchor } from './selection-anchor'
import { registerHotkey, unregisterHotkey, isHotkeyConflict } from './hotkey'
import { detectSourceLanguage } from '../shared/detect-language'
import { translateText, warnIfMissingApiKey } from './openai'
import { getPrefs, setPrefs } from './prefs'
import { createTray, destroyTray } from './tray'
import { closeModalWindow, openModal } from './windows'
import type { ModalOpenPayload, Prefs, TranslateRequest } from '../shared/types'

const envPath = join(process.cwd(), '.env')
if (existsSync(envPath)) {
  config({ path: envPath })
}

warnIfMissingApiKey()

async function handleHotkey(): Promise<void> {
  const cursorAnchor = getCursorAnchor()
  let payload: ModalOpenPayload

  try {
    const text = await captureSelectionText()
    const anchor = await resolveSelectionAnchor(cursorAnchor)
    if (!text) {
      payload = {
        text: '',
        captureError: 'Select text and try again.',
        anchor
      }
    } else {
      const detectedSourceLang = detectSourceLanguage(text) ?? undefined
      payload = { text, anchor, detectedSourceLang }
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Capture failed.'
    const anchor = await resolveSelectionAnchor(cursorAnchor)
    payload = { text: '', captureError: message, anchor }
  }

  openModal(payload)
}

function setupIpc(): void {
  ipcMain.handle('prefs:get', () => getPrefs())

  ipcMain.handle('prefs:set', (_event, partial: Partial<Prefs>) => {
    const next = setPrefs(partial)
    const { ok, error } = registerHotkey(handleHotkey)
    if (!ok && error) {
      return { prefs: next, hotkeyError: error }
    }
    return { prefs: next }
  })

  ipcMain.handle('prefs:validate-hotkey', (_event, accelerator: string) => {
    if (!accelerator?.trim()) {
      return { ok: false, error: 'Hotkey is required.' }
    }
    const current = getPrefs().hotkey
    if (accelerator === current) {
      return { ok: true }
    }
    unregisterHotkey()
    const conflict = isHotkeyConflict(accelerator)
    registerHotkey(handleHotkey)
    if (conflict) {
      return { ok: false, error: `Hotkey "${accelerator}" is already in use.` }
    }
    return { ok: true }
  })

  ipcMain.handle('translate:request', (_event, req: TranslateRequest) => translateText(req))

  ipcMain.on('modal:close', () => closeModalWindow())
}

app.whenReady().then(async () => {
  setupIpc()
  createTray()

  if (process.platform === 'darwin' && app.dock) {
    app.dock.hide()
  }

  const result = registerHotkey(handleHotkey)
  if (!result.ok) {
    console.warn('[main] Hotkey registration failed on startup:', result.error)
  }
})

app.on('will-quit', () => {
  unregisterHotkey()
  destroyTray()
})

app.on('window-all-closed', () => {
  // Menu-bar utility: keep running when all windows are closed
})
