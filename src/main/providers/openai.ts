import OpenAI from 'openai'
import { detectSourceLanguage } from '../../shared/detect-language'
import { buildImprovePrompt } from '../../shared/improve-prompt'
import { MAX_TRANSLATE_CHARS, type ImproveResponse, type TranslateResponse } from '../../shared/types'
import type { ImproveParams, ModelOption, TranslateParams, TranslationProvider } from '../../shared/providers'
import { filterChatModelIds } from './model-filter'

const SYSTEM_PROMPT =
  'You are a translation engine. Translate the user text accurately. Preserve meaning. Output only the translated text with no commentary, labels, or quotes.'

function mapOpenAIError(err: unknown): TranslateResponse {
  const message = err instanceof Error ? err.message : String(err)
  const status =
    err && typeof err === 'object' && 'status' in err
      ? Number((err as { status?: number }).status)
      : undefined

  if (status === 401) {
    return { error: 'Invalid API key.', code: '401' }
  }
  if (status === 429) {
    return { error: 'Rate limited. Wait a moment and try again.', code: '429' }
  }
  if (message.includes('fetch failed') || message.includes('ENOTFOUND') || message.includes('ECONNREFUSED')) {
    return { error: 'Check your internet connection.', code: 'network' }
  }
  return { error: 'Translation failed. See main process logs for details.', code: 'unknown' }
}

function mapOpenAIImproveError(err: unknown): ImproveResponse {
  const message = err instanceof Error ? err.message : String(err)
  const status =
    err && typeof err === 'object' && 'status' in err
      ? Number((err as { status?: number }).status)
      : undefined

  if (status === 401) {
    return { error: 'Invalid API key.', code: '401' }
  }
  if (status === 429) {
    return { error: 'Rate limited. Wait a moment and try again.', code: '429' }
  }
  if (message.includes('fetch failed') || message.includes('ENOTFOUND') || message.includes('ECONNREFUSED')) {
    return { error: 'Check your internet connection.', code: 'network' }
  }
  return { error: 'Improvement failed. See main process logs for details.', code: 'unknown' }
}

function mapValidateError(err: unknown): never {
  const status =
    err && typeof err === 'object' && 'status' in err
      ? Number((err as { status?: number }).status)
      : undefined
  const message = err instanceof Error ? err.message : String(err)

  if (status === 401) {
    throw Object.assign(new Error('Invalid API key.'), { code: 'invalid_key' as const })
  }
  if (status === 429) {
    throw Object.assign(new Error('Rate limited. Wait a moment and try again.'), { code: 'network' as const })
  }
  if (message.includes('fetch failed') || message.includes('ENOTFOUND') || message.includes('ECONNREFUSED')) {
    throw Object.assign(new Error('Check your internet connection.'), { code: 'network' as const })
  }
  throw err
}

export const openaiProvider: TranslationProvider = {
  id: 'openai',

  async validateApiKey(apiKey: string): Promise<void> {
    const client = new OpenAI({ apiKey })
    try {
      await client.models.list()
    } catch (err) {
      mapValidateError(err)
    }
  },

  async listChatModels(apiKey: string): Promise<ModelOption[]> {
    const client = new OpenAI({ apiKey })
    try {
      const page = await client.models.list()
      const ids = page.data.map((m) => m.id)
      return filterChatModelIds(ids)
    } catch (err) {
      mapValidateError(err)
    }
  },

  async translate(params: TranslateParams): Promise<TranslateResponse> {
    const text = params.text.trim()
    if (!text) {
      return { error: 'No text to translate.', code: 'empty' }
    }

    if (text.length > MAX_TRANSLATE_CHARS) {
      return {
        error: `Text is too long (${text.length} chars). Limit is ${MAX_TRANSLATE_CHARS}.`,
        code: 'too_long'
      }
    }

    const sourceLabel = params.sourceLang === 'auto' ? 'the detected source language' : params.sourceLang
    const targetLabel = params.targetLang
    const client = new OpenAI({ apiKey: params.apiKey })

    try {
      const completion = await client.chat.completions.create({
        model: params.model,
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
  },

  async improve(params: ImproveParams): Promise<ImproveResponse> {
    const text = params.text.trim()
    if (!text) {
      return { error: 'No text to improve.', code: 'empty' }
    }

    if (text.length > MAX_TRANSLATE_CHARS) {
      return {
        error: `Text is too long (${text.length} chars). Limit is ${MAX_TRANSLATE_CHARS}.`,
        code: 'too_long'
      }
    }

    let sourceLang = params.sourceLang
    if (sourceLang === 'auto') {
      sourceLang = detectSourceLanguage(text) ?? sourceLang
    }

    const { system, user } = buildImprovePrompt({
      text,
      sourceLang,
      targetLang: params.targetLang,
      vibe: params.improveVibe,
      strength: params.improveStrength,
      customHint: params.improveCustomHint
    })

    const client = new OpenAI({ apiKey: params.apiKey })

    try {
      const completion = await client.chat.completions.create({
        model: params.model,
        temperature: 0.2,
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: user }
        ]
      })

      const improved = completion.choices[0]?.message?.content?.trim()
      if (!improved) {
        return { error: 'Empty response from OpenAI.', code: 'empty_response' }
      }
      return { improved }
    } catch (err) {
      console.error('[openai] improve failed:', err)
      return mapOpenAIImproveError(err)
    }
  }
}
