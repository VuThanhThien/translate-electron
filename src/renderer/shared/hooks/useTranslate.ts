import { useMutation } from '@tanstack/react-query'
import type { TranslateRequest, TranslateResponse } from '@shared/types'

export function useTranslateMutation() {
  return useMutation({
    mutationKey: ['translate'],
    mutationFn: (payload: TranslateRequest) =>
      window.api.translate(payload) as Promise<TranslateResponse>
  })
}

export function getTranslationError(data: TranslateResponse | undefined): string | null {
  if (!data || !('error' in data)) return null
  return data.error
}

export function getTranslationText(data: TranslateResponse | undefined): string | null {
  if (!data || !('translation' in data)) return null
  return data.translation
}
