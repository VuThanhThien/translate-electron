import { describe, expect, it } from 'vitest'
import { IMPROVE_STRENGTH_OPTIONS, IMPROVE_VIBE_PRESETS } from './improve-config'
import { buildImprovePrompt } from './improve-prompt'

const sampleText = 'Hello world'

describe('buildImprovePrompt', () => {
  it('uses same-language base when source and target match', () => {
    const { system, user, sameLang } = buildImprovePrompt({
      text: sampleText,
      sourceLang: 'en',
      targetLang: 'en',
      vibe: 'neutral',
      strength: 'balanced',
      customHint: ''
    })
    expect(sameLang).toBe(true)
    expect(system).toContain('Proofread and rewrite')
    expect(system).not.toContain('Translate into the target language')
    expect(user).toBe(`Proofread in English:\n\n${sampleText}`)
  })

  it('uses cross-language base when source and target differ', () => {
    const { system, user, sameLang } = buildImprovePrompt({
      text: sampleText,
      sourceLang: 'vi',
      targetLang: 'en',
      vibe: 'neutral',
      strength: 'balanced',
      customHint: ''
    })
    expect(sameLang).toBe(false)
    expect(system).toContain('Translate into the target language')
    expect(user).toContain('Rewrite in English (from Vietnamese)')
    expect(user).toContain('entirely in English')
  })

  it.each(IMPROVE_VIBE_PRESETS.map((p) => [p.id, p.promptFragment] as const))(
    'includes vibe fragment for %s',
    (vibe, fragment) => {
      const { system } = buildImprovePrompt({
        text: sampleText,
        sourceLang: 'en',
        targetLang: 'en',
        vibe,
        strength: 'balanced',
        customHint: ''
      })
      expect(system).toContain(fragment)
    }
  )

  it.each(IMPROVE_STRENGTH_OPTIONS.map((p) => [p.id, p.promptFragment] as const))(
    'includes strength fragment for %s',
    (strength, fragment) => {
      const { system } = buildImprovePrompt({
        text: sampleText,
        sourceLang: 'en',
        targetLang: 'en',
        vibe: 'neutral',
        strength,
        customHint: ''
      })
      expect(system).toContain(fragment)
    }
  )

  it('appends custom hint when non-empty', () => {
    const { system } = buildImprovePrompt({
      text: sampleText,
      sourceLang: 'en',
      targetLang: 'en',
      vibe: 'neutral',
      strength: 'balanced',
      customHint: 'use Oxford comma'
    })
    expect(system).toContain('Additional user instructions: use Oxford comma')
  })

  it('omits custom hint layer when empty or whitespace', () => {
    const { system } = buildImprovePrompt({
      text: sampleText,
      sourceLang: 'en',
      targetLang: 'en',
      vibe: 'neutral',
      strength: 'balanced',
      customHint: '   '
    })
    expect(system).not.toContain('Additional user instructions')
  })
})
