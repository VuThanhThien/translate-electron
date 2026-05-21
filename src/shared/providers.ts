import type { ImproveStrengthId, ImproveVibeId } from './improve-config'
import type { ImproveRequest, ImproveResponse, TranslateRequest, TranslateResponse } from './types'

export const PROVIDERS = [
  { id: 'openai', label: 'OpenAI', enabled: true },
  { id: 'gemini', label: 'Google Gemini', enabled: false }
] as const

export type ProviderId = (typeof PROVIDERS)[number]['id']

export type ModelOption = { id: string; label?: string }

export function isProviderEnabled(id: ProviderId): boolean {
  return PROVIDERS.find((p) => p.id === id)?.enabled ?? false
}

export function getProviderLabel(id: ProviderId): string {
  return PROVIDERS.find((p) => p.id === id)?.label ?? id
}

export function pickDefaultModel(models: ModelOption[]): string {
  const ids = models.map((m) => m.id)
  if (ids.includes('gpt-4o-mini')) return 'gpt-4o-mini'
  return models[0]?.id ?? 'gpt-4o-mini'
}

export type TranslateParams = TranslateRequest & {
  model: string
  apiKey: string
}

export type ImproveParams = ImproveRequest & {
  model: string
  apiKey: string
  improveVibe: ImproveVibeId
  improveStrength: ImproveStrengthId
  improveCustomHint: string
}

export type TranslationProvider = {
  id: ProviderId
  validateApiKey(apiKey: string): Promise<void>
  listChatModels(apiKey: string): Promise<ModelOption[]>
  translate(params: TranslateParams): Promise<TranslateResponse>
  improve(params: ImproveParams): Promise<ImproveResponse>
}

export type SecretsSetRequest = { provider: ProviderId; apiKey: string }

export type SecretsSetResult =
  | { ok: true }
  | {
      ok: false
      error: string
      code?: 'invalid_key' | 'network' | 'encryption_unavailable' | 'provider_not_available'
    }

export type ListModelsResult =
  | { ok: true; models: ModelOption[] }
  | { ok: false; error: string; code?: 'missing_key' | 'invalid_key' | 'network' | 'provider_not_available' }
