import { ArrowLeftRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { LanguageField } from './LanguageField'

type Props = {
  sourceLang: string
  targetLang: string
  onSourceChange: (value: string) => void
  onTargetChange: (value: string) => void
  onSwap: () => void
  disabled?: boolean
}

export function LanguageBar({
  sourceLang,
  targetLang,
  onSourceChange,
  onTargetChange,
  onSwap,
  disabled
}: Props) {
  return (
    <div className="flex shrink-0 items-center gap-2">
      <LanguageField
        value={sourceLang}
        onChange={onSourceChange}
        id="modal-source"
        className="min-w-0 flex-1"
      />
      <Button
        type="button"
        variant="outline"
        size="icon"
        className="shrink-0"
        onClick={onSwap}
        disabled={disabled}
        aria-label="Swap languages"
        title="Swap languages"
      >
        <ArrowLeftRight className="size-4" />
      </Button>
      <LanguageField
        value={targetLang}
        onChange={onTargetChange}
        id="modal-target"
        hideAuto
        className="min-w-0 flex-1"
      />
    </div>
  )
}
