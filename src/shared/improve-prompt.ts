import { getLanguageLabel } from './detect-language'
import {
  type ImproveStrengthId,
  type ImproveVibeId,
  IMPROVE_STRENGTH_OPTIONS,
  IMPROVE_VIBE_PRESETS
} from './improve-config'

const BASE_SAME =
  'You are a proofreader and writing assistant. Proofread and rewrite in the target language. Output ONLY the final text. Preserve meaning. No commentary, labels, or quotes.'

const BASE_CROSS =
  'You are a bilingual writing assistant. Translate into the target language, then apply style. Output entirely in the target language. Preserve meaning. No commentary, labels, or quotes.'

export type BuildImprovePromptParams = {
  text: string
  sourceLang: string
  targetLang: string
  vibe: ImproveVibeId
  strength: ImproveStrengthId
  customHint: string
}

export type ImprovePromptResult = {
  system: string
  user: string
  sameLang: boolean
}

function vibeFragment(vibe: ImproveVibeId): string {
  return (
    IMPROVE_VIBE_PRESETS.find((p) => p.id === vibe)?.promptFragment ??
    IMPROVE_VIBE_PRESETS.find((p) => p.id === 'neutral')!.promptFragment
  )
}

function strengthFragment(strength: ImproveStrengthId): string {
  return (
    IMPROVE_STRENGTH_OPTIONS.find((p) => p.id === strength)?.promptFragment ??
    IMPROVE_STRENGTH_OPTIONS.find((p) => p.id === 'balanced')!.promptFragment
  )
}

export function buildImprovePrompt(params: BuildImprovePromptParams): ImprovePromptResult {
  const { text, sourceLang, targetLang, vibe, strength, customHint } = params
  const sameLang =
    sourceLang !== 'auto' && targetLang !== 'auto' && sourceLang === targetLang

  const systemParts = [sameLang ? BASE_SAME : BASE_CROSS, vibeFragment(vibe), strengthFragment(strength)]
  const hint = customHint.trim()
  if (hint) {
    systemParts.push(`Additional user instructions: ${hint}`)
  }

  const sourceLabel = getLanguageLabel(sourceLang)
  const targetLabel = getLanguageLabel(targetLang)
  const user = sameLang
    ? `Proofread in ${targetLabel}:\n\n${text}`
    : `Rewrite in ${targetLabel} (from ${sourceLabel}). The output must be entirely in ${targetLabel}:\n\n${text}`

  return {
    system: systemParts.join(' '),
    user,
    sameLang
  }
}
