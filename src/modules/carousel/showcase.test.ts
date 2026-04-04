import { describe, it, expect } from 'vitest'
import { getSlidesForLocale } from './showcase'
import { SHOWCASE_SLIDE_KEYS, SHOWCASE_IMAGE_CANDIDATES, FALLBACK_SHOWCASE_IMAGES } from './types'

// ---------------------------------------------------------------------------
// getSlidesForLocale
// ---------------------------------------------------------------------------

describe('getSlidesForLocale', () => {
  it("returns 4 slides for 'en' with correct en candidates", () => {
    const slides = getSlidesForLocale('en')
    expect(slides).toHaveLength(4)

    slides.forEach((slide, index) => {
      expect(slide.key).toBe(SHOWCASE_SLIDE_KEYS[index])
      // en localized path is the first candidate
      expect(slide.candidates[0]).toBe(SHOWCASE_IMAGE_CANDIDATES['en'][slide.key][0])
    })
  })

  it("returns 4 slides for 'ua' with ua paths as first candidates", () => {
    const slides = getSlidesForLocale('ua')
    expect(slides).toHaveLength(4)

    slides.forEach((slide) => {
      expect(slide.candidates[0]).toBe(SHOWCASE_IMAGE_CANDIDATES['ua'][slide.key][0])
    })
  })

  it("returns 4 slides for 'ru' with ru paths as first candidates", () => {
    const slides = getSlidesForLocale('ru')
    expect(slides).toHaveLength(4)

    slides.forEach((slide) => {
      expect(slide.candidates[0]).toBe(SHOWCASE_IMAGE_CANDIDATES['ru'][slide.key][0])
    })
  })

  it("returns 4 slides for unknown locale 'xyz', falling back to en candidates", () => {
    const slides = getSlidesForLocale('xyz')
    expect(slides).toHaveLength(4)

    slides.forEach((slide) => {
      // Unknown locale → falls back to en, so first candidate is the en path
      expect(slide.candidates[0]).toBe(SHOWCASE_IMAGE_CANDIDATES['en'][slide.key][0])
    })
  })

  it('every slide has at least one candidate', () => {
    for (const locale of ['en', 'ua', 'ru', 'xyz', '']) {
      const slides = getSlidesForLocale(locale)
      slides.forEach((slide) => {
        expect(slide.candidates.length).toBeGreaterThan(0)
      })
    }
  })

  it('candidate lists contain no duplicates', () => {
    const slides = getSlidesForLocale('en')
    slides.forEach((slide) => {
      const unique = new Set(slide.candidates)
      expect(unique.size).toBe(slide.candidates.length)
    })
  })

  it('FALLBACK_SHOWCASE_IMAGES appear somewhere in each slide candidates list', () => {
    const slides = getSlidesForLocale('en')
    slides.forEach((slide) => {
      const hasFallback = FALLBACK_SHOWCASE_IMAGES.some((f) => slide.candidates.includes(f))
      expect(hasFallback).toBe(true)
    })
  })

  it('ua slides also include en paths as fallback after ua paths', () => {
    const slides = getSlidesForLocale('ua')
    slides.forEach((slide) => {
      const enPath = SHOWCASE_IMAGE_CANDIDATES['en'][slide.key][0]
      expect(slide.candidates).toContain(enPath)
    })
  })

  it('slide keys match SHOWCASE_SLIDE_KEYS in order', () => {
    const slides = getSlidesForLocale('en')
    const keys = slides.map((s) => s.key)
    expect(keys).toEqual([...SHOWCASE_SLIDE_KEYS])
  })
})
