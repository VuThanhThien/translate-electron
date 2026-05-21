import type { ListModelsResult, ProviderId, SecretsSetRequest, SecretsSetResult } from '../shared/providers'
import { EncryptionUnavailableError, clearApiKey, getApiKey, hasApiKey, setApiKey } from './secrets'
import { getProvider, ProviderNotAvailableError, assertProviderEnabled } from './providers/registry'
import { mergeSavedModel } from './providers/model-filter'
import { getPrefs } from './prefs'

function activeProvider(provider?: ProviderId): ProviderId {
  return provider ?? getPrefs().provider
}

function mapSetError(err: unknown): SecretsSetResult {
  if (err instanceof EncryptionUnavailableError) {
    return {
      ok: false,
      error: err.message,
      code: 'encryption_unavailable'
    }
  }
  if (err instanceof ProviderNotAvailableError) {
    return { ok: false, error: err.message, code: 'provider_not_available' }
  }
  const code = err && typeof err === 'object' && 'code' in err ? (err as { code?: string }).code : undefined
  const message = err instanceof Error ? err.message : 'Could not save API key.'
  if (code === 'invalid_key') {
    return { ok: false, error: message, code: 'invalid_key' }
  }
  if (code === 'network') {
    return { ok: false, error: message, code: 'network' }
  }
  return { ok: false, error: message }
}

export function handleSecretsHasKey(provider?: ProviderId): boolean {
  return hasApiKey(activeProvider(provider))
}

export async function handleSecretsSet(req: SecretsSetRequest): Promise<SecretsSetResult> {
  const provider = req.provider
  const trimmed = req.apiKey?.trim()
  if (!trimmed) {
    return { ok: false, error: 'API key is required.' }
  }

  try {
    assertProviderEnabled(provider)
    const p = getProvider(provider)
    await p.validateApiKey(trimmed)
    setApiKey(provider, trimmed)
    return { ok: true }
  } catch (err) {
    return mapSetError(err)
  }
}

export function handleSecretsClear(provider?: ProviderId): { ok: true } {
  clearApiKey(activeProvider(provider))
  return { ok: true }
}

export async function handleListModels(provider?: ProviderId): Promise<ListModelsResult> {
  const id = activeProvider(provider)

  try {
    assertProviderEnabled(id)
  } catch (err) {
    if (err instanceof ProviderNotAvailableError) {
      return { ok: false, error: err.message, code: 'provider_not_available' }
    }
    return { ok: false, error: 'Provider is not available.', code: 'provider_not_available' }
  }

  const apiKey = getApiKey(id)
  if (!apiKey) {
    return { ok: false, error: 'Add your API key first.', code: 'missing_key' }
  }

  try {
    const p = getProvider(id)
    const models = await p.listChatModels(apiKey)
    const prefs = getPrefs()
    const merged = id === prefs.provider ? mergeSavedModel(models, prefs.model) : models
    return { ok: true, models: merged }
  } catch (err) {
    const code = err && typeof err === 'object' && 'code' in err ? (err as { code?: string }).code : undefined
    const message = err instanceof Error ? err.message : 'Could not load models.'
    if (code === 'invalid_key') {
      return { ok: false, error: message, code: 'invalid_key' }
    }
    if (code === 'network') {
      return { ok: false, error: message, code: 'network' }
    }
    return { ok: false, error: message }
  }
}
