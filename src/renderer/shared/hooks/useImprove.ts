import { useMutation } from '@tanstack/react-query'
import type { ImproveRequest, ImproveResponse } from '@shared/types'

export function useImproveMutation() {
  return useMutation({
    mutationKey: ['improve'],
    mutationFn: (payload: ImproveRequest) =>
      window.api.improve(payload) as Promise<ImproveResponse>
  })
}

export function getImproveError(data: ImproveResponse | undefined): string | null {
  if (!data || !('error' in data)) return null
  return data.error
}

export function getImproveText(data: ImproveResponse | undefined): string | null {
  if (!data || !('improved' in data)) return null
  return data.improved
}
