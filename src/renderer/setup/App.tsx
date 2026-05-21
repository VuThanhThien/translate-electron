import { useState } from 'react'
import { DEFAULT_PREFS } from '@shared/types'
import type { ProviderId } from '@shared/providers'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ProviderConnectionCard } from '../shared/ProviderConnectionCard'
import { useSavePrefsMutation } from '../shared/hooks/usePrefs'

export function SetupApp() {
  const savePrefs = useSavePrefsMutation()
  const [provider, setProvider] = useState<ProviderId>(DEFAULT_PREFS.provider)
  const [model, setModel] = useState(DEFAULT_PREFS.model)

  const handleSetupComplete = () => {
    savePrefs.mutate(
      { provider, model },
      {
        onSuccess: () => {
          window.api.setup.complete()
        }
      }
    )
  }

  return (
    <div className="min-h-screen bg-background p-10">
      <Card className="mx-auto w-full max-w-2xl">
        <CardHeader>
          <CardTitle>Translate Input</CardTitle>
          <CardDescription>Connect your AI provider to start translating.</CardDescription>
        </CardHeader>
        <CardContent>
          <ProviderConnectionCard
            mode="setup"
            provider={provider}
            onProviderChange={setProvider}
            model={model}
            onModelChange={setModel}
            onSetupComplete={handleSetupComplete}
          />
        </CardContent>
      </Card>
    </div>
  )
}
