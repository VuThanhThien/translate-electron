import { BrowserWindow, screen, app } from 'electron'
import type { Rectangle } from 'electron'
import { join } from 'path'
import type { ModalOpenPayload, ModalTailPlacement, ScreenPoint } from '../shared/types'

const MODAL_WIDTH = 480
const MODAL_HEIGHT = 560
const MODAL_MIN_HEIGHT = 480
const SETTINGS_WIDTH = 680
const SETTINGS_HEIGHT = 720
const POPOVER_GAP = 12
const ARROW_SIZE = 11
const EDGE_MARGIN = 10
const TAIL_EDGE_PADDING = 56

let modalWindow: BrowserWindow | null = null
let settingsWindow: BrowserWindow | null = null

function isDev(): boolean {
  return !app.isPackaged
}

function rendererUrl(page: 'modal' | 'settings'): string {
  if (isDev() && process.env['ELECTRON_RENDERER_URL']) {
    return `${process.env['ELECTRON_RENDERER_URL']}/${page}/index.html`
  }
  return join(__dirname, `../renderer/${page}/index.html`)
}

function preloadPath(): string {
  return join(__dirname, '../preload/index.js')
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

export type PopoverLayout = {
  x: number
  y: number
  placement: ModalTailPlacement
  tailOffset: number
}

/** Place popover near anchor with tail pointing at selection. */
export function computePopoverLayout(
  anchor: ScreenPoint,
  width: number,
  height: number,
  workArea: Rectangle
): PopoverLayout {
  const gap = POPOVER_GAP + ARROW_SIZE

  let placement: ModalTailPlacement = 'top'
  let x = anchor.x - width / 2
  let y = anchor.y + gap

  const fitsBelow = y + height <= workArea.y + workArea.height - EDGE_MARGIN
  const fitsAbove = y >= workArea.y + EDGE_MARGIN && anchor.y - gap - height >= workArea.y + EDGE_MARGIN

  if (!fitsBelow && fitsAbove) {
    placement = 'bottom'
    y = anchor.y - gap - height
  } else if (!fitsBelow) {
    y = clamp(
      anchor.y - height / 2,
      workArea.y + EDGE_MARGIN,
      workArea.y + workArea.height - height - EDGE_MARGIN
    )
    placement = anchor.y < y + height / 2 ? 'top' : 'bottom'
  }

  x = clamp(x, workArea.x + EDGE_MARGIN, workArea.x + workArea.width - width - EDGE_MARGIN)

  const tailOffset = clamp(anchor.x - x, TAIL_EDGE_PADDING, width - TAIL_EDGE_PADDING)

  return {
    x: Math.round(x),
    y: Math.round(y),
    placement,
    tailOffset: Math.round(tailOffset)
  }
}

function positionModalNearAnchor(win: BrowserWindow, anchor: ScreenPoint): PopoverLayout {
  const display = screen.getDisplayNearestPoint(anchor)
  const layout = computePopoverLayout(anchor, MODAL_WIDTH, MODAL_HEIGHT, display.workArea)
  win.setPosition(layout.x, layout.y, false)
  return layout
}

export function createSettingsWindow(): BrowserWindow {
  if (settingsWindow && !settingsWindow.isDestroyed()) {
    return settingsWindow
  }

  settingsWindow = new BrowserWindow({
    width: SETTINGS_WIDTH,
    height: SETTINGS_HEIGHT,
    minWidth: 560,
    minHeight: 520,
    show: false,
    title: 'Translate Input — Settings',
    backgroundColor: '#ffffff',
    webPreferences: {
      preload: preloadPath(),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false
    }
  })

  settingsWindow.on('closed', () => {
    settingsWindow = null
  })

  if (isDev()) {
    void settingsWindow.loadURL(rendererUrl('settings'))
  } else {
    void settingsWindow.loadFile(rendererUrl('settings'))
  }

  return settingsWindow
}

export function showSettingsWindow(): void {
  const win = createSettingsWindow()
  win.setSize(SETTINGS_WIDTH, SETTINGS_HEIGHT)
  if (win.isMinimized()) win.restore()
  win.show()
  win.focus()
}

export function closeModalWindow(): void {
  if (modalWindow && !modalWindow.isDestroyed()) {
    modalWindow.close()
  }
}

export function openModal(payload: ModalOpenPayload): void {
  const anchor = payload.anchor ?? screen.getCursorScreenPoint()

  if (!modalWindow || modalWindow.isDestroyed()) {
    modalWindow = new BrowserWindow({
      width: MODAL_WIDTH,
      height: MODAL_HEIGHT,
      show: false,
      frame: false,
      transparent: true,
      alwaysOnTop: true,
      skipTaskbar: true,
      minHeight: MODAL_MIN_HEIGHT,
      minWidth: MODAL_WIDTH,
      resizable: true,
      hasShadow: false,
      vibrancy: 'under-window',
      visualEffectState: 'active',
      webPreferences: {
        preload: preloadPath(),
        contextIsolation: true,
        nodeIntegration: false,
        sandbox: false
      }
    })

    modalWindow.on('closed', () => {
      modalWindow = null
    })

    if (isDev()) {
      void modalWindow.loadURL(rendererUrl('modal'))
    } else {
      void modalWindow.loadFile(rendererUrl('modal'))
    }
  }

  modalWindow.setMinimumSize(MODAL_WIDTH, MODAL_MIN_HEIGHT)
  modalWindow.setSize(MODAL_WIDTH, MODAL_HEIGHT)

  const layout = positionModalNearAnchor(modalWindow, anchor)
  const fullPayload: ModalOpenPayload = {
    ...payload,
    anchor,
    placement: layout.placement,
    tailOffset: layout.tailOffset
  }

  const sendPayload = (): void => {
    modalWindow?.webContents.send('modal:open', fullPayload)
  }

  if (modalWindow.webContents.isLoading()) {
    modalWindow.webContents.once('did-finish-load', sendPayload)
  } else {
    sendPayload()
  }

  modalWindow.show()
  modalWindow.focus()
}

export function getSettingsWindow(): BrowserWindow | null {
  return settingsWindow
}
