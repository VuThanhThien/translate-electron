import type { ProviderId } from '../shared/providers'
import { hasApiKey } from './secrets'
import { getPrefs } from './prefs'

export function isConfigured(provider?: ProviderId): boolean {
  const active = provider ?? getPrefs().provider
  return hasApiKey(active)
}
