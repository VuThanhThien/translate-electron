import { useCallback, useEffect, useRef, useState } from 'react'
import { detectSourceLanguage, resolveModalSourceLang } from '@shared/detect-language'
import { swapLanguagePair } from '@shared/language-utils'
import type { ModalOpenPayload, ModalTailPlacement, TranslateResponse } from '@shared/types'
import { MAX_TRANSLATE_CHARS } from '@shared/types'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import { LanguageBar } from '../shared/LanguageBar'
import {
  getTranslationError,
  getTranslationText,
  useTranslateMutation
} from '../shared/hooks/useTranslate'
import { usePrefsChangedListener, usePrefsQuery } from '../shared/hooks/usePrefs'

const SHELL_PADDING: Record<ModalTailPlacement, string> = {
  top: 'pt-3 pb-2 px-2',
  bottom: 'pb-3 pt-2 px-2',
  left: 'pl-3 pr-2 py-2',
  right: 'pr-3 pl-2 py-2'
}

const DEFAULT_TAIL = { placement: 'top' as ModalTailPlacement, tailOffset: 240 }
const DEBOUNCE_MS = 550

export function ModalApp() {
  const { data: prefs } = usePrefsQuery()
  usePrefsChangedListener()

  const [sourceText, setSourceText] = useState('')
  const [captureError, setCaptureError] = useState<string | null>(null)
  const [sourceLang, setSourceLang] = useState('auto')
  const [targetLang, setTargetLang] = useState('vi')
  const [tail, setTail] = useState(DEFAULT_TAIL)

  const { mutate, reset, isPending, isError, data } = useTranslateMutation()
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const skipDebounceRef = useRef(true)

  useEffect(() => {
    if (prefs) {
      setSourceLang(prefs.sourceLang)
      setTargetLang(prefs.targetLang)
    }
  }, [prefs?.sourceLang, prefs?.targetLang])

  const resolveSourceLang = useCallback(
    (src: string, text: string) => {
      const prefsSource = prefs?.sourceLang ?? 'auto'
      if (src !== 'auto' || prefsSource !== 'auto') return src
      return resolveModalSourceLang('auto', detectSourceLanguage(text))
    },
    [prefs?.sourceLang]
  )

  const runTranslate = useCallback(
    (text: string, src: string, tgt: string) => {
      if (!text.trim()) return
      const resolvedSrc = resolveSourceLang(src, text)
      if (resolvedSrc !== src) setSourceLang(resolvedSrc)
      mutate({ text, sourceLang: resolvedSrc, targetLang: tgt })
    },
    [mutate, resolveSourceLang]
  )

  const scheduleTranslate = useCallback(
    (text: string, src: string, tgt: string) => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
      debounceRef.current = setTimeout(() => runTranslate(text, src, tgt), DEBOUNCE_MS)
    },
    [runTranslate]
  )

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [])

  useEffect(() => {
    const unsubscribe = window.api.modal.onOpen((payload: ModalOpenPayload) => {
      skipDebounceRef.current = true
      setSourceText(payload.text)
      setCaptureError(payload.captureError ?? null)
      reset()

      if (payload.placement && payload.tailOffset != null) {
        setTail({ placement: payload.placement, tailOffset: payload.tailOffset })
      }

      const prefsSource = prefs?.sourceLang ?? 'auto'
      const detected =
        payload.detectedSourceLang ?? detectSourceLanguage(payload.text) ?? undefined
      const src = resolveModalSourceLang(prefsSource, detected)
      const tgt = prefs?.targetLang ?? 'vi'
      setSourceLang(src)
      setTargetLang(tgt)

      if (payload.text && !payload.captureError) {
        mutate({ text: payload.text, sourceLang: src, targetLang: tgt })
      }

      requestAnimationFrame(() => {
        skipDebounceRef.current = false
      })
    })
    return unsubscribe
  }, [prefs?.sourceLang, prefs?.targetLang, mutate, reset])

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        window.api.modal.close()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  const response = data as TranslateResponse | undefined
  const translationError =
    captureError && !sourceText.trim()
      ? captureError
      : getTranslationError(response) ?? (isError ? 'Translation failed.' : null)
  const translationText = getTranslationText(response)

  const handleSourceChange = (value: string) => {
    setSourceText(value)
    if (skipDebounceRef.current || !value.trim()) return
    scheduleTranslate(value, sourceLang, targetLang)
  }

  const handleSourceLangChange = (value: string) => {
    setSourceLang(value)
    if (sourceText.trim()) runTranslate(sourceText, value, targetLang)
  }

  const handleTargetLangChange = (value: string) => {
    setTargetLang(value)
    if (sourceText.trim()) runTranslate(sourceText, sourceLang, value)
  }

  const handleSwap = () => {
    if (debounceRef.current) clearTimeout(debounceRef.current)

    const swapped = swapLanguagePair(sourceLang, targetLang, sourceText)
    setSourceLang(swapped.sourceLang)
    setTargetLang(swapped.targetLang)

    const nextText = translationText?.trim() ? translationText : sourceText
    setSourceText(nextText)
    if (nextText.trim()) {
      runTranslate(nextText, swapped.sourceLang, swapped.targetLang)
    } else {
      reset()
    }
  }

  const charCount = sourceText.length
  const overLimit = charCount > MAX_TRANSLATE_CHARS

  return (
    <div className={cn('box-border h-screen w-screen bg-transparent', SHELL_PADDING[tail.placement])}>
      <Card
        className={cn(
          'popover-bubble flex h-full flex-col gap-0 py-0 shadow-lg',
          `popover-bubble-${tail.placement}`
        )}
        style={{ '--tail-offset': `${tail.tailOffset}px` } as React.CSSProperties}
      >
        <CardHeader className="flex flex-row items-center justify-between space-y-0 border-b px-4 py-2.5">
          <CardTitle className="text-base font-medium">Translate</CardTitle>
          <Button variant="ghost" size="sm" onClick={() => window.api.modal.close()}>
            Close
          </Button>
        </CardHeader>

        <CardContent className="flex min-h-0 flex-1 flex-col gap-3 overflow-hidden px-4 py-3">
          <LanguageBar
            sourceLang={sourceLang}
            targetLang={targetLang}
            onSourceChange={handleSourceLangChange}
            onTargetChange={handleTargetLangChange}
            onSwap={handleSwap}
            disabled={isPending}
          />

          <section className="flex min-h-0 flex-1 flex-col gap-1">
            <Textarea
              value={sourceText}
              onChange={(e) => handleSourceChange(e.target.value)}
              placeholder="Enter text to translate"
              className="min-h-0 flex-1 resize-none border-0 bg-muted/30 shadow-none focus-visible:ring-1"
              disabled={!!captureError && !sourceText.trim()}
            />
            {overLimit ? (
              <p className="text-xs text-destructive">
                {charCount.toLocaleString()} / {MAX_TRANSLATE_CHARS.toLocaleString()} characters
              </p>
            ) : null}
          </section>

          <Separator className="shrink-0" />

          <section className="flex min-h-0 flex-1 flex-col gap-2 overflow-hidden">
            {translationError ? (
              <Alert variant="destructive" className="shrink-0 py-2">
                <AlertDescription>{translationError}</AlertDescription>
              </Alert>
            ) : null}
            <div className="min-h-0 flex-1 overflow-y-auto rounded-md bg-muted/20 px-1 py-2">
              {isPending ? (
                <p className="text-sm text-muted-foreground animate-pulse">Translating…</p>
              ) : (
                <p className="text-sm whitespace-pre-wrap">
                  {translationText ?? (translationError ? '' : 'Translation will appear here')}
                </p>
              )}
            </div>
          </section>
        </CardContent>
      </Card>
    </div>
  )
}
