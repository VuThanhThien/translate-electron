import { clipboard } from 'electron'
import { execFile } from 'child_process'
import { promisify } from 'util'

const execFileAsync = promisify(execFile)

const CAPTURE_DELAY_MS = 80

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function simulateCopy(): Promise<void> {
  const script =
    'tell application "System Events" to keystroke "c" using command down'
  await execFileAsync('osascript', ['-e', script])
}

export async function captureSelectionText(): Promise<string> {
  await delay(CAPTURE_DELAY_MS)
  try {
    await simulateCopy()
  } catch (err) {
    console.error('[capture] Cmd+C simulation failed:', err)
    throw new Error(
      'Could not simulate copy. Enable Accessibility for this app in System Settings → Privacy & Security → Accessibility.'
    )
  }
  await delay(50)
  return clipboard.readText().trim()
}
