export type ImproveVibeId = 'neutral' | 'professional' | 'casual' | 'friendly'
export type ImproveStrengthId = 'light' | 'balanced' | 'strong'

export const IMPROVE_CUSTOM_HINT_MAX = 200

export const IMPROVE_VIBE_PRESETS = [
  {
    id: 'neutral' as const,
    label: 'Neutral',
    description: 'Clear, neutral tone for general writing.',
    promptFragment: 'Use a clear, neutral tone.'
  },
  {
    id: 'professional' as const,
    label: 'Professional',
    description: 'Formal, workplace-appropriate wording.',
    promptFragment: 'Use a formal, workplace-appropriate tone.'
  },
  {
    id: 'casual' as const,
    label: 'Casual',
    description: 'Relaxed, conversational style.',
    promptFragment: 'Use a relaxed, conversational tone.'
  },
  {
    id: 'friendly' as const,
    label: 'Friendly',
    description: 'Warm and approachable without heavy slang.',
    promptFragment: 'Use a warm, approachable tone; avoid slang-heavy phrasing.'
  }
] as const

export const IMPROVE_STRENGTH_OPTIONS = [
  {
    id: 'light' as const,
    label: 'Light',
    description: 'Grammar, spelling, and punctuation only.',
    promptFragment:
      'Fix grammar, spelling, and punctuation only; make minimal rephrasing.'
  },
  {
    id: 'balanced' as const,
    label: 'Balanced',
    description: 'Light rephrase for clarity; keep structure where possible.',
    promptFragment: 'Improve clarity with light rephrasing; keep structure where possible.'
  },
  {
    id: 'strong' as const,
    label: 'Strong',
    description: 'Rewrite for flow and tone; do not add new facts.',
    promptFragment:
      'Rewrite for flow and tone while preserving meaning; do not add new facts.'
  }
] as const

const VIBE_IDS = new Set(IMPROVE_VIBE_PRESETS.map((p) => p.id))
const STRENGTH_IDS = new Set(IMPROVE_STRENGTH_OPTIONS.map((p) => p.id))

export function sanitizeImproveCustomHint(raw: string): string {
  return raw.trim().slice(0, IMPROVE_CUSTOM_HINT_MAX)
}

export function isImproveCustomHintTooLong(raw: string): boolean {
  return raw.trim().length > IMPROVE_CUSTOM_HINT_MAX
}

export function coerceImproveVibe(value: unknown): ImproveVibeId {
  if (typeof value === 'string' && VIBE_IDS.has(value as ImproveVibeId)) {
    return value as ImproveVibeId
  }
  return 'neutral'
}

export function coerceImproveStrength(value: unknown): ImproveStrengthId {
  if (typeof value === 'string' && STRENGTH_IDS.has(value as ImproveStrengthId)) {
    return value as ImproveStrengthId
  }
  return 'balanced'
}
