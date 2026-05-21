import ElectronStore from 'electron-store'
import { BrowserWindow } from 'electron'
import {
  coerceImproveStrength,
  coerceImproveVibe,
  sanitizeImproveCustomHint
} from '../shared/improve-config'
import { DEFAULT_PREFS, type Prefs } from '../shared/types'

// electron-store v10 is ESM; CJS require() exposes { default: Store }
const Store =
  typeof ElectronStore === 'function'
    ? ElectronStore
    : (ElectronStore as { default: typeof ElectronStore }).default

type LegacyStore = Prefs & { openaiModel?: string }

const store = new Store<LegacyStore>({
  defaults: DEFAULT_PREFS
})

function migrateLegacyPrefs(): void {
  const legacy = store.get('openaiModel')
  if (legacy && !store.get('model')) {
    store.set('model', legacy)
  }
  if (!store.get('provider')) {
    store.set('provider', 'openai')
  }
}

export function getPrefs(): Prefs {
  migrateLegacyPrefs()
  return {
    sourceLang: store.get('sourceLang'),
    targetLang: store.get('targetLang'),
    hotkey: store.get('hotkey'),
    provider: store.get('provider') ?? 'openai',
    model: store.get('model') ?? 'gpt-4o-mini',
    improveVibe: coerceImproveVibe(store.get('improveVibe')),
    improveStrength: coerceImproveStrength(store.get('improveStrength')),
    improveCustomHint: sanitizeImproveCustomHint(String(store.get('improveCustomHint') ?? ''))
  }
}

export function setPrefs(partial: Partial<Prefs>): Prefs {
  const normalized: Partial<Prefs> = { ...partial }
  if (normalized.improveVibe !== undefined) {
    normalized.improveVibe = coerceImproveVibe(normalized.improveVibe)
  }
  if (normalized.improveStrength !== undefined) {
    normalized.improveStrength = coerceImproveStrength(normalized.improveStrength)
  }
  if (normalized.improveCustomHint !== undefined) {
    normalized.improveCustomHint = sanitizeImproveCustomHint(normalized.improveCustomHint)
  }

  for (const [key, value] of Object.entries(normalized)) {
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
