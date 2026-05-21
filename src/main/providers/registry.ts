import { isProviderEnabled, PROVIDERS, type ProviderId, type TranslationProvider } from '../../shared/providers'
import { openaiProvider } from './openai'

export class ProviderNotAvailableError extends Error {
  readonly providerId: ProviderId

  constructor(providerId: ProviderId) {
    super(`Provider "${providerId}" is not available.`)
    this.name = 'ProviderNotAvailableError'
    this.providerId = providerId
  }
}

export function getProvider(id: ProviderId): TranslationProvider {
  const meta = PROVIDERS.find((p) => p.id === id)
  if (!meta?.enabled) {
    throw new ProviderNotAvailableError(id)
  }
  switch (id) {
    case 'openai':
      return openaiProvider
    default:
      throw new ProviderNotAvailableError(id)
  }
}

export function assertProviderEnabled(id: ProviderId): void {
  if (!isProviderEnabled(id)) {
    throw new ProviderNotAvailableError(id)
  }
}
