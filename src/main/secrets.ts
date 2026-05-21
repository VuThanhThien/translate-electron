import { app, safeStorage } from 'electron'
import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'fs'
import { join, dirname } from 'path'
import type { ProviderId } from '../shared/providers'

type SecretsStore = Record<string, string>

export class EncryptionUnavailableError extends Error {
  constructor() {
    super('macOS Keychain encryption is unavailable. Check that you are logged in.')
    this.name = 'EncryptionUnavailableError'
  }
}

function secretsPath(): string {
  return join(app.getPath('userData'), 'secrets.json')
}

function readStore(): SecretsStore {
  const path = secretsPath()
  if (!existsSync(path)) return {}
  try {
    const raw = readFileSync(path, 'utf8')
    const parsed = JSON.parse(raw) as SecretsStore
    return parsed && typeof parsed === 'object' ? parsed : {}
  } catch {
    return {}
  }
}

function writeStore(data: SecretsStore): void {
  const path = secretsPath()
  mkdirSync(dirname(path), { recursive: true })
  writeFileSync(path, JSON.stringify(data, null, 2), 'utf8')
}

function assertEncryptionAvailable(): void {
  if (!safeStorage.isEncryptionAvailable()) {
    throw new EncryptionUnavailableError()
  }
}

function encryptKey(plain: string): string {
  assertEncryptionAvailable()
  return safeStorage.encryptString(plain).toString('base64')
}

function decryptKey(blob: string): string {
  assertEncryptionAvailable()
  return safeStorage.decryptString(Buffer.from(blob, 'base64'))
}

export function hasApiKey(provider: ProviderId): boolean {
  const store = readStore()
  return Boolean(store[provider])
}

export function getApiKey(provider: ProviderId): string | null {
  const store = readStore()
  const blob = store[provider]
  if (!blob) return null
  try {
    return decryptKey(blob)
  } catch (err) {
    console.error(`[secrets] Failed to decrypt key for ${provider}:`, err)
    return null
  }
}

export function setApiKey(provider: ProviderId, plain: string): void {
  const store = readStore()
  store[provider] = encryptKey(plain.trim())
  writeStore(store)
}

export function clearApiKey(provider: ProviderId): void {
  const store = readStore()
  delete store[provider]
  writeStore(store)
}
