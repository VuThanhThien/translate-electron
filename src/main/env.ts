import { config } from 'dotenv'
import { existsSync } from 'fs'
import { join } from 'path'
import { app } from 'electron'

/** Dev: project `.env`. Packaged: `.env` copied into the app bundle at build time. */
export function loadEnv(): void {
  const envPath = app.isPackaged
    ? join(process.resourcesPath, '.env')
    : join(process.cwd(), '.env')

  if (existsSync(envPath)) {
    config({ path: envPath })
  }
}
