import { contextBridge, ipcRenderer } from 'electron'
import type { ElectronAPI } from '../shared/electron-api'
import type { ModalOpenPayload, Prefs, TranslateRequest } from '../shared/types'

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
  translate: (payload) => ipcRenderer.invoke('translate:request', payload),
  modal: {
    onOpen: (callback) => {
      const listener = (_event: Electron.IpcRendererEvent, payload: ModalOpenPayload): void =>
        callback(payload)
      ipcRenderer.on('modal:open', listener)
      return () => ipcRenderer.removeListener('modal:open', listener)
    },
    close: () => ipcRenderer.send('modal:close')
  }
}

contextBridge.exposeInMainWorld('api', api)
