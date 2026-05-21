import { useQuery } from '@tanstack/react-query'
import type { ProviderId } from '@shared/providers'

export function useProviderModels(provider: ProviderId, enabled: boolean) {
  return useQuery({
    queryKey: ['provider', provider, 'models'],
    queryFn: () => window.api.provider.listModels({ provider }),
    enabled
  })
}
