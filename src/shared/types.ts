import type { ImproveStrengthId, ImproveVibeId } from './improve-config'
import type { ProviderId } from './providers'

export type Prefs = {
  sourceLang: string
  targetLang: string
  hotkey: string
  provider: ProviderId
  model: string
  improveVibe: ImproveVibeId
  improveStrength: ImproveStrengthId
  improveCustomHint: string
}

export const DEFAULT_PREFS: Prefs = {
  sourceLang: 'auto',
  targetLang: 'vi',
  hotkey: 'Command+Shift+T',
  provider: 'openai',
  model: 'gpt-4o-mini',
  improveVibe: 'neutral',
  improveStrength: 'balanced',
  improveCustomHint: ''
}

export type TranslateRequest = {
  text: string
  sourceLang: string
  targetLang: string
  model?: string
}

export type TranslateResponse =
  | { translation: string }
  | { error: string; code?: string }

export type ImproveRequest = {
  text: string
  sourceLang: string
  targetLang: string
  model?: string
}

export type ImproveResponse =
  | { improved: string }
  | { error: string; code?: string }

/** Which edge of the popover has the pointer (toward the selection anchor). */
export type ModalTailPlacement = 'top' | 'bottom' | 'left' | 'right'

export type ScreenPoint = { x: number; y: number }

export type ModalOpenPayload = {
  text: string
  captureError?: string
  /** ISO 639-1 when prefs source is auto and text was detected locally. */
  detectedSourceLang?: string
  /** Screen coordinates of selection (or cursor fallback). */
  anchor?: ScreenPoint
  /** Popover tail edge + offset for the arrow. */
  placement?: ModalTailPlacement
  tailOffset?: number
}

export const MAX_TRANSLATE_CHARS = 8000

export const LANGUAGE_OPTIONS = [
  { value: 'auto', label: 'Auto-detect' },
  { value: 'en', label: 'English' },
  { value: 'vi', label: 'Vietnamese' },
  { value: 'ja', label: 'Japanese' },
  { value: 'ko', label: 'Korean' },
  { value: 'zh', label: 'Chinese' },
  { value: 'fr', label: 'French' },
  { value: 'de', label: 'German' },
  { value: 'es', label: 'Spanish' }
] as const
