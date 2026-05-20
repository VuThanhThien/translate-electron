#!/usr/bin/env node
import { existsSync, readFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const envPath = join(root, '.env')

if (!existsSync(envPath)) {
  console.error('Missing .env — create it before packaging:')
  console.error('  cp .env.example .env')
  process.exit(1)
}

const content = readFileSync(envPath, 'utf8')
const hasKey =
  /^OPENAI_API_KEY=\s*\S+/m.test(content) && !/^OPENAI_API_KEY=\s*sk-your-key/m.test(content)

if (!hasKey) {
  console.error('.env must set OPENAI_API_KEY before npm run dist:mac')
  process.exit(1)
}

console.log('[build] Using .env from project root (bundled into the app)')
