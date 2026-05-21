import {
  IMPROVE_CUSTOM_HINT_MAX,
  IMPROVE_STRENGTH_OPTIONS,
  IMPROVE_VIBE_PRESETS,
  type ImproveStrengthId,
  type ImproveVibeId
} from '@shared/improve-config'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

type Props = {
  vibe: ImproveVibeId
  onVibeChange: (vibe: ImproveVibeId) => void
  strength: ImproveStrengthId
  onStrengthChange: (strength: ImproveStrengthId) => void
  customHint: string
  onCustomHintChange: (hint: string) => void
  hintError: string | null
}

export function ImproveSettingsSection({
  vibe,
  onVibeChange,
  strength,
  onStrengthChange,
  customHint,
  onCustomHintChange,
  hintError
}: Props) {
  const selectedVibe = IMPROVE_VIBE_PRESETS.find((p) => p.id === vibe)
  const hintLength = customHint.trim().length

  return (
    <div className="space-y-5">
      <Separator />
      <div className="space-y-1">
        <h3 className="text-sm font-medium text-foreground">Writing style (Help me write)</h3>
        <p className="text-xs text-muted-foreground">
          Default tone and edit strength for the Help me write tab. Languages still come from the
          bar above.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="improve-vibe">Vibe</Label>
        <Select value={vibe} onValueChange={(v) => onVibeChange(v as ImproveVibeId)}>
          <SelectTrigger id="improve-vibe" className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {IMPROVE_VIBE_PRESETS.map((preset) => (
              <SelectItem key={preset.id} value={preset.id}>
                {preset.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {selectedVibe ? (
          <p className="text-xs text-muted-foreground">{selectedVibe.description}</p>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label>Edit strength</Label>
        <div className="flex flex-wrap gap-2" role="group" aria-label="Edit strength">
          {IMPROVE_STRENGTH_OPTIONS.map((option) => (
            <Button
              key={option.id}
              type="button"
              variant={strength === option.id ? 'default' : 'outline'}
              size="sm"
              className={cn('min-w-[5.5rem]')}
              onClick={() => onStrengthChange(option.id)}
              aria-pressed={strength === option.id}
            >
              {option.label}
            </Button>
          ))}
        </div>
        <p className="text-xs text-muted-foreground">
          {IMPROVE_STRENGTH_OPTIONS.find((o) => o.id === strength)?.description}
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="improve-custom-hint">Additional instructions (optional)</Label>
        <Textarea
          id="improve-custom-hint"
          value={customHint}
          onChange={(e) => onCustomHintChange(e.target.value)}
          placeholder="e.g. Use Oxford comma; keep bullet list format"
          rows={3}
          maxLength={IMPROVE_CUSTOM_HINT_MAX}
          aria-invalid={hintError ? true : undefined}
        />
        <div className="flex items-center justify-between gap-2 text-xs">
          <p className={cn('text-muted-foreground', hintError && 'text-destructive')}>
            {hintError ?? 'Short hint appended to the improve prompt (max 200 characters).'}
          </p>
          <span
            className={cn(
              'tabular-nums text-muted-foreground',
              hintLength > IMPROVE_CUSTOM_HINT_MAX && 'text-destructive'
            )}
          >
            {hintLength}/{IMPROVE_CUSTOM_HINT_MAX}
          </span>
        </div>
      </div>
    </div>
  )
}
