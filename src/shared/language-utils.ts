import { detectSourceLanguage } from './detect-language'

/** Swap source/target langs; target is never left as auto-detect. */
export function swapLanguagePair(
  sourceLang: string,
  targetLang: string,
  textForDetection?: string
): { sourceLang: string; targetLang: string } {
  const newSource = targetLang
  let newTarget = sourceLang
  if (newTarget === 'auto') {
    const detected = textForDetection ? detectSourceLanguage(textForDetection) : null
    newTarget = detected ?? 'en'
  }
  return { sourceLang: newSource, targetLang: newTarget }
}
