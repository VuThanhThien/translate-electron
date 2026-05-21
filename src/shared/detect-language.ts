import { franc } from 'franc'
import { LANGUAGE_OPTIONS } from './types'

/** ISO 639-3 (franc) → ISO 639-1 values used in LANGUAGE_OPTIONS. */
const FRANC_TO_ISO6391: Record<string, string> = {
  eng: 'en',
  vie: 'vi',
  jpn: 'ja',
  kor: 'ko',
  cmn: 'zh',
  zho: 'zh',
  fra: 'fr',
  deu: 'de',
  spa: 'es'
}

const SUPPORTED_SOURCE_CODES = new Set<string>(
  LANGUAGE_OPTIONS.map((o) => o.value).filter((v) => v !== 'auto')
)

/** Detect source language from text; returns a supported ISO 639-1 code or null. */
export function detectSourceLanguage(text: string): string | null {
  const trimmed = text.trim()
  if (trimmed.length < 10) return null

  const iso3 = franc(trimmed, { minLength: 10 })
  if (iso3 === 'und') return null

  const iso1 = FRANC_TO_ISO6391[iso3]
  if (!iso1 || !SUPPORTED_SOURCE_CODES.has(iso1)) return null
  return iso1
}

/** Use saved pref when set; otherwise detected language or auto. */
export function resolveModalSourceLang(prefsSourceLang: string, detected?: string | null): string {
  if (prefsSourceLang !== 'auto') return prefsSourceLang
  if (detected && SUPPORTED_SOURCE_CODES.has(detected)) return detected
  return 'auto'
}

/** Human-readable label for prompts (falls back to code). */
export function getLanguageLabel(code: string): string {
  if (code === 'auto') return 'the detected source language'
  return LANGUAGE_OPTIONS.find((o) => o.value === code)?.label ?? code
}
