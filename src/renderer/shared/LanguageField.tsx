import { LANGUAGE_OPTIONS } from '@shared/types'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { cn } from '@/lib/utils'

type Props = {
  label?: string
  value: string
  onChange: (value: string) => void
  id?: string
  hideAuto?: boolean
  className?: string
}

export function LanguageField({ label, value, onChange, id, hideAuto, className }: Props) {
  const fieldId = id ?? (label ? label.toLowerCase().replace(/\s+/g, '-') : 'language')
  const options = hideAuto ? LANGUAGE_OPTIONS.filter((o) => o.value !== 'auto') : LANGUAGE_OPTIONS

  return (
    <div className={cn('flex flex-col gap-2', className)}>
      {label ? <Label htmlFor={fieldId}>{label}</Label> : null}
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger id={fieldId} className="w-full">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
