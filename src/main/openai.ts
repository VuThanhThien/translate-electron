import OpenAI from 'openai'
import { MAX_TRANSLATE_CHARS, type TranslateRequest, type TranslateResponse } from '../shared/types'
import { getPrefs } from './prefs'

const SYSTEM_PROMPT =
  'You are a translation engine. Translate the user text accurately. Preserve meaning. Output only the translated text with no commentary, labels, or quotes.'

function mapOpenAIError(err: unknown): TranslateResponse {
  const message = err instanceof Error ? err.message : String(err)
  const status =
    err && typeof err === 'object' && 'status' in err
      ? Number((err as { status?: number }).status)
      : undefined

  if (status === 401) {
    return { error: 'Invalid API key. Check OPENAI_API_KEY in .env', code: '401' }
  }
  if (status === 429) {
    return { error: 'Rate limited. Wait a moment and try again.', code: '429' }
  }
  if (message.includes('fetch failed') || message.includes('ENOTFOUND') || message.includes('ECONNREFUSED')) {
    return { error: 'Check your internet connection.', code: 'network' }
  }
  return { error: 'Translation failed. See main process logs for details.', code: 'unknown' }
}

export async function translateText(req: TranslateRequest): Promise<TranslateResponse> {
  const apiKey = process.env.OPENAI_API_KEY?.trim()
  if (!apiKey) {
    return { error: 'Missing OPENAI_API_KEY. Add it to .env and rebuild the app.', code: 'missing_key' }
  }

  const text = req.text.trim()
  if (!text) {
    return { error: 'No text to translate.', code: 'empty' }
  }

  if (text.length > MAX_TRANSLATE_CHARS) {
    return {
      error: `Text is too long (${text.length} chars). Limit is ${MAX_TRANSLATE_CHARS}.`,
      code: 'too_long'
    }
  }

  const prefs = getPrefs()
  const model = req.model ?? prefs.openaiModel ?? process.env.OPENAI_MODEL ?? 'gpt-4o-mini'
  const sourceLabel = req.sourceLang === 'auto' ? 'the detected source language' : req.sourceLang
  const targetLabel = req.targetLang

  const client = new OpenAI({ apiKey })

  try {
    const completion = await client.chat.completions.create({
      model,
      temperature: 0.2,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        {
          role: 'user',
          content: `Translate from ${sourceLabel} to ${targetLabel}:\n\n${text}`
        }
      ]
    })

    const translation = completion.choices[0]?.message?.content?.trim()
    if (!translation) {
      return { error: 'Empty response from OpenAI.', code: 'empty_response' }
    }
    return { translation }
  } catch (err) {
    console.error('[openai] translate failed:', err)
    return mapOpenAIError(err)
  }
}

export function warnIfMissingApiKey(): void {
  if (!process.env.OPENAI_API_KEY?.trim()) {
    console.warn('[openai] OPENAI_API_KEY is not set. Add it to .env (dev) or rebuild with a valid .env.')
  }
}
