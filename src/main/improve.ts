import type { ImproveRequest, ImproveResponse } from '../shared/types'
import { getProvider } from './providers/registry'
import { getApiKey } from './secrets'
import { getPrefs } from './prefs'

export async function improveRequest(req: ImproveRequest): Promise<ImproveResponse> {
  const prefs = getPrefs()

  let provider
  try {
    provider = getProvider(prefs.provider)
  } catch {
    return { error: 'Provider is not available.', code: 'provider_not_available' }
  }

  const apiKey = getApiKey(prefs.provider)
  if (!apiKey) {
    return { error: 'Add your API key in Settings.', code: 'missing_key' }
  }

  const model = req.model ?? prefs.model
  return provider.improve({
    ...req,
    model,
    apiKey,
    improveVibe: prefs.improveVibe,
    improveStrength: prefs.improveStrength,
    improveCustomHint: prefs.improveCustomHint
  })
}
