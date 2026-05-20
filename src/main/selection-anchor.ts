import { execFile } from 'child_process'
import { screen } from 'electron'
import { promisify } from 'util'

const execFileAsync = promisify(execFile)

export type ScreenPoint = { x: number; y: number }

/** Cursor at hotkey time — reliable when selection was made with the mouse. */
export function getCursorAnchor(): ScreenPoint {
  return screen.getCursorScreenPoint()
}

/**
 * Best-effort selection center via macOS Accessibility (requires permission).
 * Returns null when the frontmost app does not expose bounds.
 */
export async function getSelectionCenterFromAccessibility(): Promise<ScreenPoint | null> {
  if (process.platform !== 'darwin') return null

  const script = `
function run() {
  const se = Application("System Events");
  const procs = se.processes.whose({ frontmost: true });
  if (procs.length === 0) return "";
  const proc = procs[0];
  try {
    const focused = proc.attributes.byName("AXFocusedUIElement").value();
    if (!focused.exists()) return "";
    const rangeAttr = focused.attributes.byName("AXSelectedTextRange");
    if (!rangeAttr.exists()) return "";
    const range = rangeAttr.value();
    if (!range || range.length < 2 || range[1] === 0) return "";
    const boundsAttr = focused.attributes.byName("AXBoundsForRangeParameterized");
    if (!boundsAttr.exists()) return "";
    const bounds = boundsAttr.value({ AXRange: range });
    if (!bounds) return "";
    const x = bounds[0] + bounds[2] / 2;
    const y = bounds[1] + bounds[3] / 2;
    return x + "," + y;
  } catch (err) {
    return "";
  }
}
`

  try {
    const { stdout } = await execFileAsync('osascript', ['-l', 'JavaScript', '-e', script], {
      timeout: 400
    })
    const line = stdout.trim()
    if (!line) return null
    const [x, y] = line.split(',').map((v) => Number(v.trim()))
    if (!Number.isFinite(x) || !Number.isFinite(y)) return null
    return { x, y }
  } catch {
    return null
  }
}

export async function resolveSelectionAnchor(cursorAtHotkey: ScreenPoint): Promise<ScreenPoint> {
  const fromAx = await getSelectionCenterFromAccessibility()
  return fromAx ?? cursorAtHotkey
}
