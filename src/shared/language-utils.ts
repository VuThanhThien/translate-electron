import { detectSourceLanguage } from './detect-language'

export type SwapLanguageOptions = {
  /** Text before swap (usually the pre-swap source) — used to resolve auto → concrete lang. */
  detectText?: string
  /** Already-resolved source (e.g. auto detected as en during translate). */
  resolvedSource?: string
}

/** Swap source/target langs; neither side is left as auto-detect when avoidable. */
export function swapLanguagePair(
  sourceLang: string,
  targetLang: string,
  opts?: SwapLanguageOptions | string
): { sourceLang: string; targetLang: string } {
  const options: SwapLanguageOptions =
    typeof opts === 'string' ? { detectText: opts } : (opts ?? {})

  const newSource = targetLang === 'auto' ? options.resolvedSource ?? 'en' : targetLang
  let newTarget = sourceLang
  if (newTarget === 'auto') {
    const resolved =
      options.resolvedSource && options.resolvedSource !== 'auto'
        ? options.resolvedSource
        : null
    const detected = options.detectText ? detectSourceLanguage(options.detectText) : null
    newTarget = resolved ?? detected ?? 'en'
  }
  return { sourceLang: newSource, targetLang: newTarget }
}
