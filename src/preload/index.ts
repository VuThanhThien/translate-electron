import { contextBridge, ipcRenderer } from 'electron'
import type { ElectronAPI } from '../shared/electron-api'
import type { ImproveRequest, ModalOpenPayload, Prefs, TranslateRequest } from '../shared/types'
import type { ProviderId, SecretsSetRequest } from '../shared/providers'

const api: ElectronAPI = {
  prefs: {
    get: () => ipcRenderer.invoke('prefs:get'),
    set: (partial) => ipcRenderer.invoke('prefs:set', partial),
    validateHotkey: (accelerator) => ipcRenderer.invoke('prefs:validate-hotkey', accelerator),
    onChanged: (callback) => {
      const listener = (_event: Electron.IpcRendererEvent, prefs: Prefs): void => callback(prefs)
      ipcRenderer.on('prefs:changed', listener)
      return () => ipcRenderer.removeListener('prefs:changed', listener)
    }
  },
  secrets: {
    hasKey: (opts) => ipcRenderer.invoke('secrets:hasKey', opts),
    set: (req: SecretsSetRequest) => ipcRenderer.invoke('secrets:set', req),
    clear: (opts) => ipcRenderer.invoke('secrets:clear', opts)
  },
  provider: {
    listModels: (opts) => ipcRenderer.invoke('provider:listModels', opts)
  },
  translate: (payload) => ipcRenderer.invoke('translate:request', payload),
  improve: (payload: ImproveRequest) => ipcRenderer.invoke('improve:request', payload),
  modal: {
    onOpen: (callback) => {
      const listener = (_event: Electron.IpcRendererEvent, payload: ModalOpenPayload): void =>
        callback(payload)
      ipcRenderer.on('modal:open', listener)
      return () => ipcRenderer.removeListener('modal:open', listener)
    },
    close: () => ipcRenderer.send('modal:close')
  },
  setup: {
    complete: () => ipcRenderer.send('setup:complete')
  }
}

contextBridge.exposeInMainWorld('api', api)
