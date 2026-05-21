import type { ModelOption } from '../../shared/providers'

const EXCLUDE_PATTERN =
  /embedding|tts|whisper|dall-e|realtime|transcribe|audio|image|moderation/i

const INCLUDE_PATTERN = /^(gpt-|o\d|chatgpt-)/i

const PRIORITY_ORDER = ['gpt-4o-mini', 'gpt-4o']

export function filterChatModelIds(ids: string[]): ModelOption[] {
  const filtered = ids.filter((id) => INCLUDE_PATTERN.test(id) && !EXCLUDE_PATTERN.test(id))
  const unique = [...new Set(filtered)]
  unique.sort((a, b) => {
    const aIdx = PRIORITY_ORDER.indexOf(a)
    const bIdx = PRIORITY_ORDER.indexOf(b)
    if (aIdx !== -1 || bIdx !== -1) {
      if (aIdx === -1) return 1
      if (bIdx === -1) return -1
      return aIdx - bIdx
    }
    return a.localeCompare(b)
  })
  return unique.map((id) => ({ id }))
}

export function mergeSavedModel(models: ModelOption[], savedModel?: string): ModelOption[] {
  if (!savedModel || models.some((m) => m.id === savedModel)) {
    return models
  }
  return [{ id: savedModel, label: `${savedModel} (saved)` }, ...models]
}
