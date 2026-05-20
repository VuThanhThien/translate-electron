import { existsSync } from 'fs'
import { join } from 'path'
import { Menu, Tray, nativeImage, app } from 'electron'
import { showSettingsWindow } from './windows'

let tray: Tray | null = null

function logoPath(): string {
  return app.isPackaged
    ? join(process.resourcesPath, 'logo.png')
    : join(process.cwd(), 'logo.png')
}

function createTrayIcon(): Electron.NativeImage {
  const path = logoPath()
  if (existsSync(path)) {
    const img = nativeImage.createFromPath(path)
    return img.resize({ width: 18, height: 18 })
  }

  const size = 18
  const canvas = Buffer.alloc(size * size * 4)
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const i = (y * size + x) * 4
      const on = x >= 4 && x <= 13 && y >= 4 && y <= 13
      canvas[i + 3] = on ? 255 : 0
    }
  }
  return nativeImage.createFromBuffer(canvas, { width: size, height: size })
}

export function createTray(): Tray {
  const icon = createTrayIcon()
  tray = new Tray(icon)
  tray.setToolTip('Translate Input')

  const menu = Menu.buildFromTemplate([
    {
      label: 'Open Settings',
      click: () => showSettingsWindow()
    },
    { type: 'separator' },
    {
      label: 'Quit',
      click: () => app.quit()
    }
  ])

  tray.setContextMenu(menu)
  return tray
}

export function destroyTray(): void {
  tray?.destroy()
  tray = null
}
