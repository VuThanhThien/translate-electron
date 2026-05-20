import type { ModalOpenPayload, Prefs, TranslateRequest, TranslateResponse } from './types'

export type ElectronAPI = {
  prefs: {
    get: () => Promise<Prefs>
    set: (partial: Partial<Prefs>) => Promise<{ prefs: Prefs; hotkeyError?: string }>
    validateHotkey: (accelerator: string) => Promise<{ ok: boolean; error?: string }>
    onChanged: (callback: (prefs: Prefs) => void) => () => void
  }
  translate: (payload: TranslateRequest) => Promise<TranslateResponse>
  modal: {
    onOpen: (callback: (payload: ModalOpenPayload) => void) => () => void
    close: () => void
  }
}
