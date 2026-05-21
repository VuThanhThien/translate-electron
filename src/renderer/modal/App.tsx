import { useCallback, useEffect, useRef, useState } from 'react'
import { Send } from 'lucide-react'
import { detectSourceLanguage, resolveModalSourceLang } from '@shared/detect-language'
import { swapLanguagePair } from '@shared/language-utils'
import type { ImproveResponse, ModalOpenPayload, ModalTailPlacement, TranslateResponse } from '@shared/types'
import { MAX_TRANSLATE_CHARS } from '@shared/types'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import { LanguageBar } from '../shared/LanguageBar'
import {
  getImproveError,
  getImproveText,
  useImproveMutation
} from '../shared/hooks/useImprove'
import {
  getTranslationError,
  getTranslationText,
  useTranslateMutation
} from '../shared/hooks/useTranslate'
import { usePrefsChangedListener, usePrefsQuery } from '../shared/hooks/usePrefs'

type ModalTab = 'translate' | 'write'

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
  const [activeTab, setActiveTab] = useState<ModalTab>('translate')
  const [copied, setCopied] = useState(false)

  const {
    mutate: translateMutate,
    reset: resetTranslate,
    isPending: isTranslatePending,
    isError: isTranslateError,
    data: translateData
  } = useTranslateMutation()

  const {
    mutate: improveMutate,
    reset: resetImprove,
    isPending: isImprovePending,
    isError: isImproveError,
    data: improveData
  } = useImproveMutation()

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const skipDebounceRef = useRef(true)
  const copiedTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const resolveSourceLang = useCallback(
    (src: string, text: string) => {
      if (src !== 'auto') return src
      const prefsSource = prefs?.sourceLang ?? 'auto'
      return resolveModalSourceLang(prefsSource, detectSourceLanguage(text))
    },
    [prefs?.sourceLang]
  )

  const commitSourceLang = useCallback((resolved: string) => {
    if (resolved !== 'auto') setSourceLang(resolved)
  }, [])

  const runTranslate = useCallback(
    (text: string, src: string, tgt: string) => {
      if (!text.trim()) return
      const resolvedSrc = resolveSourceLang(src, text)
      commitSourceLang(resolvedSrc)
      translateMutate({ text, sourceLang: resolvedSrc, targetLang: tgt })
    },
    [translateMutate, resolveSourceLang, commitSourceLang]
  )

  const runImprove = useCallback(
    (text: string, src: string, tgt: string) => {
      if (!text.trim()) return
      const resolvedSrc = resolveSourceLang(src, text)
      commitSourceLang(resolvedSrc)
      improveMutate({ text, sourceLang: resolvedSrc, targetLang: tgt })
    },
    [improveMutate, resolveSourceLang, commitSourceLang]
  )

  const scheduleTranslate = useCallback(
    (text: string, src: string, tgt: string) => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
      debounceRef.current = setTimeout(() => runTranslate(text, src, tgt), DEBOUNCE_MS)
    },
    [runTranslate]
  )

  const submitImprove = useCallback(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    runImprove(sourceText, sourceLang, targetLang)
  }, [runImprove, sourceText, sourceLang, targetLang])

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
      if (copiedTimeoutRef.current) clearTimeout(copiedTimeoutRef.current)
    }
  }, [])

  useEffect(() => {
    const unsubscribe = window.api.modal.onOpen((payload: ModalOpenPayload) => {
      skipDebounceRef.current = true
      setActiveTab('translate')
      setSourceText(payload.text)
      setCaptureError(payload.captureError ?? null)
      resetTranslate()
      resetImprove()

      if (payload.placement && payload.tailOffset != null) {
        setTail({ placement: payload.placement, tailOffset: payload.tailOffset })
      }

      const prefsSource = prefs?.sourceLang ?? 'auto'
      const detected =
        payload.detectedSourceLang ?? detectSourceLanguage(payload.text) ?? undefined
      const src = resolveModalSourceLang(prefsSource, detected)
      const tgt = prefs?.targetLang ?? 'vi'
      setSourceLang(src !== 'auto' ? src : detected ?? 'auto')
      setTargetLang(tgt)

      if (payload.text && !payload.captureError) {
        const resolvedSrc = src === 'auto' && detected ? detected : src
        if (resolvedSrc !== 'auto') setSourceLang(resolvedSrc)
        translateMutate({ text: payload.text, sourceLang: resolvedSrc, targetLang: tgt })
      }

      requestAnimationFrame(() => {
        skipDebounceRef.current = false
      })
    })
    return unsubscribe
  }, [prefs?.sourceLang, prefs?.targetLang, translateMutate, resetTranslate, resetImprove])

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        window.api.modal.close()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  const translateResponse = translateData as TranslateResponse | undefined
  const improveResponse = improveData as ImproveResponse | undefined

  const isWriteTab = activeTab === 'write'
  const isPending = isWriteTab ? isImprovePending : isTranslatePending
  const isMutationError = isWriteTab ? isImproveError : isTranslateError

  const outputError =
    captureError && !sourceText.trim()
      ? captureError
      : isWriteTab
        ? getImproveError(improveResponse) ?? (isMutationError ? 'Improvement failed.' : null)
        : getTranslationError(translateResponse) ?? (isMutationError ? 'Translation failed.' : null)

  const outputText = isWriteTab ? getImproveText(improveResponse) : getTranslationText(translateResponse)

  const outputLabel = isWriteTab ? 'Improved text' : 'Translation'
  const loadingLabel = isWriteTab ? 'Improving…' : 'Translating…'
  const placeholder = isWriteTab
    ? 'Improved text will appear here'
    : 'Translation will appear here'

  const handleTabChange = (value: string) => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    setActiveTab(value as ModalTab)
  }

  const handleSourceChange = (value: string) => {
    setSourceText(value)
    if (activeTab !== 'translate' || skipDebounceRef.current || !value.trim()) return
    scheduleTranslate(value, sourceLang, targetLang)
  }

  const handleSourceKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (activeTab !== 'write' || e.key !== 'Enter' || e.shiftKey) return
    e.preventDefault()
    submitImprove()
  }

  const handleSourceLangChange = (value: string) => {
    setSourceLang(value)
    if (activeTab !== 'translate' || !sourceText.trim()) return
    runTranslate(sourceText, value, targetLang)
  }

  const handleTargetLangChange = (value: string) => {
    setTargetLang(value)
    if (activeTab !== 'translate' || !sourceText.trim()) return
    runTranslate(sourceText, sourceLang, value)
  }

  const handleSwap = () => {
    if (debounceRef.current) clearTimeout(debounceRef.current)

    const cachedOutput = isWriteTab ? getImproveText(improveResponse) : getTranslationText(translateResponse)
    const nextText = cachedOutput?.trim() ? cachedOutput : sourceText
    const resolvedSource = resolveSourceLang(sourceLang, sourceText)

    const swapped = swapLanguagePair(sourceLang, targetLang, {
      detectText: sourceText,
      resolvedSource
    })
    setSourceLang(swapped.sourceLang)
    setTargetLang(swapped.targetLang)
    setSourceText(nextText)

    if (nextText.trim() && activeTab === 'translate') {
      runTranslate(nextText, swapped.sourceLang, swapped.targetLang)
    } else if (!nextText.trim() && activeTab === 'translate') {
      resetTranslate()
    }
  }

  const handleCopy = async () => {
    if (!outputText?.trim() || isPending || outputError) return
    try {
      await navigator.clipboard.writeText(outputText)
      setCopied(true)
      if (copiedTimeoutRef.current) clearTimeout(copiedTimeoutRef.current)
      copiedTimeoutRef.current = setTimeout(() => setCopied(false), 1500)
    } catch {
      // clipboard denied — no-op
    }
  }

  const charCount = sourceText.length
  const overLimit = charCount > MAX_TRANSLATE_CHARS
  const improveDisabled =
    isImprovePending || !sourceText.trim() || overLimit || (!!captureError && !sourceText.trim())
  const copyDisabled = isPending || !!outputError || !outputText?.trim()
  const sourcePlaceholder =
    activeTab === 'write' ? 'Enter text, then press Enter or Send to improve' : 'Enter text to translate'

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
          <Tabs value={activeTab} onValueChange={handleTabChange}>
            <TabsList className="h-8">
              <TabsTrigger value="translate" className="text-xs px-2.5">
                Translate
              </TabsTrigger>
              <TabsTrigger value="write" className="text-xs px-2.5">
                Help me write
              </TabsTrigger>
            </TabsList>
          </Tabs>
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

          <section className="relative flex min-h-0 flex-1 flex-col gap-1">
            <Textarea
              value={sourceText}
              onChange={(e) => handleSourceChange(e.target.value)}
              onKeyDown={handleSourceKeyDown}
              placeholder={sourcePlaceholder}
              className="min-h-0 flex-1 resize-none border-0 bg-muted/30 pr-10 shadow-none focus-visible:ring-1"
              disabled={!!captureError && !sourceText.trim()}
            />
            {activeTab === 'write' ? (
              <Button
                type="button"
                variant="default"
                size="icon-sm"
                className="absolute right-2 bottom-2 size-8 shrink-0"
                onClick={submitImprove}
                disabled={improveDisabled}
                title="Improve (Enter)"
                aria-label="Improve"
              >
                <Send className="size-4" />
              </Button>
            ) : null}
            {overLimit ? (
              <p className="text-xs text-destructive">
                {charCount.toLocaleString()} / {MAX_TRANSLATE_CHARS.toLocaleString()} characters
              </p>
            ) : null}
          </section>

          <Separator className="shrink-0" />

          <section className="flex min-h-0 flex-1 flex-col gap-2 overflow-hidden">
            <div className="flex shrink-0 items-center justify-between gap-2">
              <span className="text-xs font-medium text-muted-foreground">{outputLabel}</span>
              <Button
                variant="outline"
                size="sm"
                className="h-7 text-xs"
                onClick={handleCopy}
                disabled={copyDisabled}
              >
                {copied ? 'Copied' : 'Copy'}
              </Button>
            </div>
            {outputError ? (
              <Alert variant="destructive" className="shrink-0 py-2">
                <AlertDescription>{outputError}</AlertDescription>
              </Alert>
            ) : null}
            <div className="min-h-0 flex-1 overflow-y-auto rounded-md bg-muted/20 px-1 py-2">
              {isPending ? (
                <p className="text-sm text-muted-foreground animate-pulse">{loadingLabel}</p>
              ) : (
                <p className="text-sm whitespace-pre-wrap">
                  {outputText ?? (outputError ? '' : placeholder)}
                </p>
              )}
            </div>
          </section>
        </CardContent>
      </Card>
    </div>
  )
}
