import { globalShortcut, Notification } from 'electron'
import { getPrefs } from './prefs'

let registeredAccelerator: string | null = null

export type HotkeyHandler = () => void | Promise<void>

export function registerHotkey(handler: HotkeyHandler): { ok: boolean; error?: string } {
  const { hotkey } = getPrefs()
  unregisterHotkey()

  if (!globalShortcut.isRegistered(hotkey)) {
    const ok = globalShortcut.register(hotkey, () => {
      void handler()
    })
    if (!ok) {
      const error = `Could not register hotkey "${hotkey}". It may be in use by another app.`
      console.error(`[hotkey] ${error}`)
      if (Notification.isSupported()) {
        new Notification({
          title: 'Translate Input',
          body: error
        }).show()
      }
      return { ok: false, error }
    }
    registeredAccelerator = hotkey
    console.info(`[hotkey] Registered ${hotkey}`)
    return { ok: true }
  }

  registeredAccelerator = hotkey
  return { ok: true }
}

export function unregisterHotkey(): void {
  if (registeredAccelerator) {
    globalShortcut.unregister(registeredAccelerator)
    registeredAccelerator = null
  }
}

export function isHotkeyConflict(accelerator: string): boolean {
  try {
    return !globalShortcut.register(accelerator, () => undefined)
  } finally {
    if (globalShortcut.isRegistered(accelerator)) {
      globalShortcut.unregister(accelerator)
    }
  }
}
