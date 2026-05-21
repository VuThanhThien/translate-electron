import { useEffect, useState } from 'react'
import {
  PROVIDERS,
  getProviderLabel,
  pickDefaultModel,
  type ProviderId
} from '@shared/providers'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { useProviderModels } from './hooks/useProviderModels'
import { useClearApiKey, useHasApiKey, useSetApiKey } from './hooks/useSecrets'

type ProviderConnectionCardProps = {
  mode: 'setup' | 'settings'
  provider: ProviderId
  onProviderChange: (id: ProviderId) => void
  model: string
  onModelChange: (model: string) => void
  onSetupComplete?: () => void
}

export function ProviderConnectionCard({
  mode,
  provider,
  onProviderChange,
  model,
  onModelChange,
  onSetupComplete
}: ProviderConnectionCardProps) {
  const { data: hasKey = false, isLoading: hasKeyLoading } = useHasApiKey(provider)
  const setApiKey = useSetApiKey()
  const clearApiKey = useClearApiKey()
  const modelsQuery = useProviderModels(provider, hasKey && mode === 'settings')

  const [apiKeyInput, setApiKeyInput] = useState('')
  const [showKeyField, setShowKeyField] = useState(mode === 'setup')
  const [keyError, setKeyError] = useState<string | null>(null)
  const [modelsLoaded, setModelsLoaded] = useState(false)

  useEffect(() => {
    if (mode === 'settings') {
      setShowKeyField(!hasKey)
      setApiKeyInput('')
    }
  }, [hasKey, mode, provider])

  useEffect(() => {
    setModelsLoaded(false)
    setKeyError(null)
  }, [provider])

  useEffect(() => {
    if (modelsQuery.data?.ok && modelsQuery.data.models.length > 0) {
      const models = modelsQuery.data.models
      if (!model || !models.some((m) => m.id === model)) {
        onModelChange(pickDefaultModel(models))
      }
      setModelsLoaded(true)
    }
  }, [modelsQuery.data, model, onModelChange])

  const modelOptions =
    modelsQuery.data?.ok === true
      ? modelsQuery.data.models
      : model
        ? [{ id: model, label: model }]
        : []

  const modelSelectEnabled =
    mode === 'settings' ? hasKey && (modelsQuery.isSuccess || modelOptions.length > 0) : modelsLoaded

  const handleSaveKey = async (): Promise<boolean> => {
    setKeyError(null)
    const trimmed = apiKeyInput.trim()
    if (!trimmed) {
      setKeyError('API key is required.')
      return false
    }

    const result = await setApiKey.mutateAsync({ provider, apiKey: trimmed })
    if (!result.ok) {
      setKeyError(result.error)
      return false
    }

    setApiKeyInput('')
    if (mode === 'settings') {
      setShowKeyField(false)
    }

    const listResult = await window.api.provider.listModels({ provider })
    if (!listResult.ok) {
      setKeyError(listResult.error)
      return false
    }

    const defaultModel = pickDefaultModel(listResult.models)
    onModelChange(defaultModel)
    setModelsLoaded(true)
    return true
  }

  const handleSetupContinue = async () => {
    const ok = await handleSaveKey()
    if (!ok) return
    onSetupComplete?.()
  }

  const handleRemoveKey = async () => {
    setKeyError(null)
    await clearApiKey.mutateAsync(provider)
    setShowKeyField(true)
    setApiKeyInput('')
    onModelChange('gpt-4o-mini')
    setModelsLoaded(false)
  }

  const isBusy = setApiKey.isPending || clearApiKey.isPending

  return (
    <div className="flex flex-col gap-4 rounded-lg border border-border p-4">
      <div>
        <h3 className="text-sm font-medium">
          {mode === 'setup' ? 'Connect your AI provider' : 'AI provider'}
        </h3>
        <p className="text-xs text-muted-foreground">
          {mode === 'setup'
            ? `Configure ${getProviderLabel(provider)}. Your key is stored in macOS Keychain and sent only to the provider API.`
            : 'API key is stored in macOS Keychain, not in app preferences.'}
        </p>
      </div>

      {keyError ? (
        <Alert variant="destructive">
          <AlertDescription>{keyError}</AlertDescription>
        </Alert>
      ) : null}

      <div className="space-y-2">
        <Label htmlFor="provider-select">Provider</Label>
        <Select value={provider} onValueChange={(v) => onProviderChange(v as ProviderId)}>
          <SelectTrigger id="provider-select" className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {PROVIDERS.map((p) => (
              <SelectItem key={p.id} value={p.id} disabled={!p.enabled}>
                {p.label}
                {!p.enabled ? ' — Coming soon' : ''}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="api-key">API key</Label>
        {mode === 'settings' && hasKey && !showKeyField ? (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm text-foreground">API key configured</span>
            <Button type="button" variant="outline" size="sm" onClick={() => setShowKeyField(true)}>
              Change key
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => void handleRemoveKey()}
              disabled={isBusy}
            >
              Remove key
            </Button>
          </div>
        ) : (
          <Input
            id="api-key"
            type="password"
            autoComplete="off"
            placeholder="sk-…"
            value={apiKeyInput}
            onChange={(e) => setApiKeyInput(e.target.value)}
            disabled={isBusy || hasKeyLoading}
          />
        )}
        {mode === 'settings' && showKeyField && hasKey ? (
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => void handleSaveKey()}
            disabled={isBusy || !apiKeyInput.trim()}
          >
            {setApiKey.isPending ? 'Validating…' : 'Save new key'}
          </Button>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="model-select">Model</Label>
        <Select value={model} onValueChange={onModelChange} disabled={!modelSelectEnabled}>
          <SelectTrigger id="model-select" className="w-full">
            <SelectValue placeholder={modelSelectEnabled ? 'Select model' : 'Save API key first'} />
          </SelectTrigger>
          <SelectContent>
            {modelOptions.map((m) => (
              <SelectItem key={m.id} value={m.id}>
                {m.label ?? m.id}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {mode === 'setup' ? (
        <Button onClick={() => void handleSetupContinue()} disabled={isBusy || !apiKeyInput.trim()}>
          {isBusy ? 'Validating…' : 'Save & Continue'}
        </Button>
      ) : null}
    </div>
  )
}
