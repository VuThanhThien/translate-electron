import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { ProviderId, SecretsSetRequest } from '@shared/providers'

export function useHasApiKey(provider: ProviderId) {
  return useQuery({
    queryKey: ['secrets', 'hasKey', provider],
    queryFn: () => window.api.secrets.hasKey({ provider })
  })
}

export function useSetApiKey() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (req: SecretsSetRequest) => window.api.secrets.set(req),
    onSuccess: (_result, req) => {
      void queryClient.invalidateQueries({ queryKey: ['secrets', 'hasKey', req.provider] })
      void queryClient.invalidateQueries({ queryKey: ['provider', req.provider, 'models'] })
    }
  })
}

export function useClearApiKey() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (provider: ProviderId) => window.api.secrets.clear({ provider }),
    onSuccess: (_result, provider) => {
      void queryClient.invalidateQueries({ queryKey: ['secrets', 'hasKey', provider] })
      void queryClient.removeQueries({ queryKey: ['provider', provider, 'models'] })
    }
  })
}
