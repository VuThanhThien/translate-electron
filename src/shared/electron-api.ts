import type {
  ListModelsResult,
  ProviderId,
  SecretsSetRequest,
  SecretsSetResult
} from './providers'
import type { ModalOpenPayload, Prefs, TranslateRequest, TranslateResponse } from './types'

export type ElectronAPI = {
  prefs: {
    get: () => Promise<Prefs>
    set: (partial: Partial<Prefs>) => Promise<{ prefs: Prefs; hotkeyError?: string }>
    validateHotkey: (accelerator: string) => Promise<{ ok: boolean; error?: string }>
    onChanged: (callback: (prefs: Prefs) => void) => () => void
  }
  secrets: {
    hasKey: (opts?: { provider?: ProviderId }) => Promise<boolean>
    set: (req: SecretsSetRequest) => Promise<SecretsSetResult>
    clear: (opts?: { provider?: ProviderId }) => Promise<{ ok: true }>
  }
  provider: {
    listModels: (opts?: { provider?: ProviderId }) => Promise<ListModelsResult>
  }
  translate: (payload: TranslateRequest) => Promise<TranslateResponse>
  modal: {
    onOpen: (callback: (payload: ModalOpenPayload) => void) => () => void
    close: () => void
  }
  setup: {
    complete: () => void
  }
}
