import { useEffect, useState } from 'react'
import {
  IMPROVE_CUSTOM_HINT_MAX,
  isImproveCustomHintTooLong,
  type ImproveStrengthId,
  type ImproveVibeId
} from '@shared/improve-config'
import { DEFAULT_PREFS, type Prefs } from '@shared/types'
import type { ProviderId } from '@shared/providers'
import { ImproveSettingsSection } from '../shared/ImproveSettingsSection'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { LanguageField } from '../shared/LanguageField'
import { ProviderConnectionCard } from '../shared/ProviderConnectionCard'
import {
  usePrefsChangedListener,
  usePrefsQuery,
  useSavePrefsMutation
} from '../shared/hooks/usePrefs'

type SavePrefsResult = { prefs: Prefs; hotkeyError?: string }

export function SettingsApp() {
  const { data: prefs, isLoading } = usePrefsQuery()
  usePrefsChangedListener()
  const savePrefs = useSavePrefsMutation()

  const [hotkey, setHotkey] = useState(DEFAULT_PREFS.hotkey)
  const [provider, setProvider] = useState<ProviderId>(DEFAULT_PREFS.provider)
  const [model, setModel] = useState(DEFAULT_PREFS.model)
  const [sourceLang, setSourceLang] = useState(DEFAULT_PREFS.sourceLang)
  const [targetLang, setTargetLang] = useState(DEFAULT_PREFS.targetLang)
  const [improveVibe, setImproveVibe] = useState<ImproveVibeId>(DEFAULT_PREFS.improveVibe)
  const [improveStrength, setImproveStrength] = useState<ImproveStrengthId>(
    DEFAULT_PREFS.improveStrength
  )
  const [improveCustomHint, setImproveCustomHint] = useState(DEFAULT_PREFS.improveCustomHint)
  const [hotkeyError, setHotkeyError] = useState<string | null>(null)
  const [hintError, setHintError] = useState<string | null>(null)
  const [saveMessage, setSaveMessage] = useState<string | null>(null)

  useEffect(() => {
    if (prefs) {
      setHotkey(prefs.hotkey)
      setProvider(prefs.provider)
      setModel(prefs.model)
      setSourceLang(prefs.sourceLang)
      setTargetLang(prefs.targetLang)
      setImproveVibe(prefs.improveVibe)
      setImproveStrength(prefs.improveStrength)
      setImproveCustomHint(prefs.improveCustomHint)
    }
  }, [prefs])

  const handleSave = async () => {
    setHotkeyError(null)
    setHintError(null)
    setSaveMessage(null)

    if (isImproveCustomHintTooLong(improveCustomHint)) {
      setHintError(
        `Additional instructions must be ${IMPROVE_CUSTOM_HINT_MAX} characters or fewer.`
      )
      return
    }

    const validation = await window.api.prefs.validateHotkey(hotkey)
    if (!validation.ok) {
      setHotkeyError(validation.error ?? 'Invalid hotkey')
      return
    }

    savePrefs.mutate(
      {
        hotkey,
        provider,
        model,
        sourceLang,
        targetLang,
        improveVibe,
        improveStrength,
        improveCustomHint: improveCustomHint.trim()
      },
      {
        onSuccess: (result: SavePrefsResult) => {
          if (result.hotkeyError) {
            setHotkeyError(result.hotkeyError)
          } else {
            setSaveMessage('Settings saved.')
          }
        },
        onError: () => {
          setSaveMessage(null)
          setHotkeyError('Could not save settings.')
        }
      }
    )
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-8 text-sm text-muted-foreground">
        Loading settings…
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background p-10">
      <Card className="mx-auto w-full max-w-2xl">
        <CardHeader>
          <CardTitle>Translate Input</CardTitle>
          <CardDescription>
            Configure hotkey, languages, AI provider, and Help me write style.
          </CardDescription>
        </CardHeader>

        <CardContent className="flex flex-col gap-6">
          {hotkeyError ? (
            <Alert variant="destructive">
              <AlertDescription>{hotkeyError}</AlertDescription>
            </Alert>
          ) : null}
          {saveMessage ? (
            <p className="text-sm text-foreground" role="status">
              {saveMessage}
            </p>
          ) : null}

          <ProviderConnectionCard
            mode="settings"
            provider={provider}
            onProviderChange={setProvider}
            model={model}
            onModelChange={setModel}
          />

          <div className="space-y-2">
            <Label htmlFor="hotkey">Global hotkey</Label>
            <Input
              id="hotkey"
              value={hotkey}
              onChange={(e) => setHotkey(e.target.value)}
              placeholder="Command+Shift+T"
            />
            <p className="text-xs text-muted-foreground">
              Electron accelerator format, e.g. Command+Shift+T
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <LanguageField
              label="Default source"
              value={sourceLang}
              onChange={setSourceLang}
              id="settings-source"
            />
            <LanguageField
              label="Default target"
              value={targetLang}
              onChange={setTargetLang}
              id="settings-target"
              hideAuto
            />
          </div>

          <ImproveSettingsSection
            vibe={improveVibe}
            onVibeChange={setImproveVibe}
            strength={improveStrength}
            onStrengthChange={setImproveStrength}
            customHint={improveCustomHint}
            onCustomHintChange={(value) => {
              setImproveCustomHint(value)
              if (hintError) setHintError(null)
            }}
            hintError={hintError}
          />

          <p className="text-xs text-muted-foreground">
            macOS: grant <strong>Accessibility</strong> (for simulated copy) and{' '}
            <strong>Input Monitoring</strong> if the hotkey does not register.
          </p>
        </CardContent>

        <CardFooter>
          <Button onClick={() => void handleSave()} disabled={savePrefs.isPending}>
            {savePrefs.isPending ? 'Saving…' : 'Save'}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
