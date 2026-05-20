import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'
import type { Prefs } from '@shared/types'

type SavePrefsResult = { prefs: Prefs; hotkeyError?: string }

export function usePrefsQuery() {
  return useQuery({
    queryKey: ['prefs'],
    queryFn: () => window.api.prefs.get()
  })
}

export function useSavePrefsMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (partial: Partial<Prefs>) => window.api.prefs.set(partial) as Promise<SavePrefsResult>,
    onSuccess: (result: SavePrefsResult) => {
      queryClient.setQueryData(['prefs'], result.prefs)
    }
  })
}

export function usePrefsChangedListener(): void {
  const queryClient = useQueryClient()

  useEffect(() => {
    return window.api.prefs.onChanged((prefs) => {
      queryClient.setQueryData(['prefs'], prefs)
    })
  }, [queryClient])
}
