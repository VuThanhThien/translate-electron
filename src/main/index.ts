import { app, ipcMain } from 'electron'
import { captureSelectionText } from './capture'
import { getCursorAnchor, resolveSelectionAnchor } from './selection-anchor'
import { registerHotkey, unregisterHotkey, isHotkeyConflict } from './hotkey'
import { detectSourceLanguage } from '../shared/detect-language'
import { translateRequest } from './translate'
import { getPrefs, setPrefs } from './prefs'
import { createTray, destroyTray, refreshTrayMenu } from './tray'
import { closeModalWindow, closeSetupWindow, openModal, showSetupWindow } from './windows'
import { isConfigured } from './config'
import {
  handleListModels,
  handleSecretsClear,
  handleSecretsHasKey,
  handleSecretsSet
} from './ipc-secrets'
import type { ModalOpenPayload, Prefs, TranslateRequest } from '../shared/types'
import type { ProviderId, SecretsSetRequest } from '../shared/providers'

async function handleHotkey(): Promise<void> {
  if (!isConfigured()) {
    showSetupWindow()
    return
  }

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

  ipcMain.handle('secrets:hasKey', (_event, opts?: { provider?: ProviderId }) =>
    handleSecretsHasKey(opts?.provider)
  )

  ipcMain.handle('secrets:set', (_event, req: SecretsSetRequest) => handleSecretsSet(req))

  ipcMain.handle('secrets:clear', (_event, opts?: { provider?: ProviderId }) =>
    handleSecretsClear(opts?.provider)
  )

  ipcMain.handle('provider:listModels', (_event, opts?: { provider?: ProviderId }) =>
    handleListModels(opts?.provider)
  )

  ipcMain.handle('translate:request', (_event, req: TranslateRequest) => translateRequest(req))

  ipcMain.on('modal:close', () => closeModalWindow())

  ipcMain.on('setup:complete', () => {
    closeSetupWindow()
    refreshTrayMenu()
  })
}

app.whenReady().then(async () => {
  setupIpc()
  createTray()

  if (process.platform === 'darwin' && app.dock) {
    app.dock.hide()
  }

  if (!isConfigured()) {
    showSetupWindow()
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
