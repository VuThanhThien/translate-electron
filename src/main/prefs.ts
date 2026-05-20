import ElectronStore from 'electron-store'
import { BrowserWindow } from 'electron'
import { DEFAULT_PREFS, type Prefs } from '../shared/types'

// electron-store v10 is ESM; CJS require() exposes { default: Store }
const Store =
  typeof ElectronStore === 'function'
    ? ElectronStore
    : (ElectronStore as { default: typeof ElectronStore }).default

const store = new Store<Prefs>({
  defaults: DEFAULT_PREFS
})

export function getPrefs(): Prefs {
  return {
    sourceLang: store.get('sourceLang'),
    targetLang: store.get('targetLang'),
    hotkey: store.get('hotkey'),
    openaiModel: store.get('openaiModel')
  }
}

export function setPrefs(partial: Partial<Prefs>): Prefs {
  for (const [key, value] of Object.entries(partial)) {
    if (value !== undefined) {
      store.set(key as keyof Prefs, value)
    }
  }
  const prefs = getPrefs()
  broadcastPrefsChanged(prefs)
  return prefs
}

export function broadcastPrefsChanged(prefs: Prefs): void {
  for (const win of BrowserWindow.getAllWindows()) {
    if (!win.isDestroyed()) {
      win.webContents.send('prefs:changed', prefs)
    }
  }
}
