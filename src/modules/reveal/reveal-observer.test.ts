import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { RevealObserver } from './reveal-observer'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Creates a div with a given inline style attribute (or none). */
function makeEl(style?: string): HTMLElement {
  const el = document.createElement('div')
  if (style) el.setAttribute('style', style)
  return el
}

// ---------------------------------------------------------------------------
// RevealObserver
// ---------------------------------------------------------------------------

describe('RevealObserver', () => {
  let observeSpy: ReturnType<typeof vi.fn>
  let disconnectSpy: ReturnType<typeof vi.fn>
  let unobserveSpy: ReturnType<typeof vi.fn>
  let intersectionCallback: IntersectionObserverCallback | null = null
  let matchMediaResult: boolean

  beforeEach(() => {
    observeSpy = vi.fn()
    disconnectSpy = vi.fn()
    unobserveSpy = vi.fn()
    intersectionCallback = null
    matchMediaResult = false

    vi.stubGlobal(
      'IntersectionObserver',
      vi.fn((cb: IntersectionObserverCallback) => {
        intersectionCallback = cb
        return {
          observe: observeSpy,
          disconnect: disconnectSpy,
          unobserve: unobserveSpy,
          takeRecords: vi.fn(() => []),
          root: null,
          rootMargin: '',
          thresholds: [],
        }
      }),
    )

    vi.stubGlobal('matchMedia', (query: string) => ({
      matches: matchMediaResult,
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }))
  })

  afterEach(() => {
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
  })

  // ---- empty targets guard ------------------------------------------------

  it('does nothing when targets array is empty', () => {
    const obs = new RevealObserver([])
    obs.setup()
    expect(IntersectionObserver).not.toHaveBeenCalled()
  })

  // ---- reveal-item class --------------------------------------------------

  it('adds reveal-item class to every target', () => {
    const els = [makeEl(), makeEl()]
    new RevealObserver(els).setup()
    els.forEach((el) => expect(el.classList.contains('reveal-item')).toBe(true))
  })

  // ---- --reveal-delay property -------------------------------------------

  it('sets --reveal-delay on targets that have no inline style', () => {
    const el = makeEl()
    new RevealObserver([el]).setup()
    expect(el.style.getPropertyValue('--reveal-delay')).toBe('0ms')
  })

  it('caps --reveal-delay at 360ms (index * 60 capped at 360)', () => {
    const els = Array.from({ length: 10 }, () => makeEl())
    new RevealObserver(els).setup()
    // index 7 = 7*60=420ms → capped at 360
    expect(els[7].style.getPropertyValue('--reveal-delay')).toBe('360ms')
  })

  it('does not overwrite --reveal-delay when already in style attribute', () => {
    const el = makeEl('--reveal-delay:999ms')
    new RevealObserver([el]).setup()
    // The CSS property on the element should remain 999ms (or empty since jsdom
    // doesn't evaluate CSS custom props in style attr, but the setAttribute was
    // NOT called — the code checks getAttribute('style').includes('--reveal-delay'))
    // In jsdom style.getPropertyValue won't return 999ms because jsdom doesn't
    // parse custom properties from setAttribute. The important thing is that
    // setProperty was NOT called with a new value.
    const delay = el.style.getPropertyValue('--reveal-delay')
    // If setProperty was skipped, it's either empty or the original value.
    // The original style attr contained --reveal-delay so code skips it.
    expect(delay).not.toBe('0ms')
  })

  // ---- reduce-motion ------------------------------------------------------

  it('adds is-visible to all targets when prefers-reduced-motion is active', () => {
    matchMediaResult = true
    const els = [makeEl(), makeEl()]
    new RevealObserver(els).setup()
    els.forEach((el) => expect(el.classList.contains('is-visible')).toBe(true))
  })

  it('does not create IntersectionObserver when prefers-reduced-motion is active', () => {
    matchMediaResult = true
    new RevealObserver([makeEl()]).setup()
    expect(IntersectionObserver).not.toHaveBeenCalled()
  })

  // ---- IntersectionObserver wiring ---------------------------------------

  it('creates IntersectionObserver and observes each target when motion is allowed', () => {
    const els = [makeEl(), makeEl(), makeEl()]
    new RevealObserver(els).setup()
    expect(IntersectionObserver).toHaveBeenCalledOnce()
    expect(observeSpy).toHaveBeenCalledTimes(3)
  })

  it('adds is-visible and calls unobserve when an entry is intersecting', () => {
    const el = makeEl()
    new RevealObserver([el]).setup()

    const fakeEntry = { isIntersecting: true, target: el } as unknown as IntersectionObserverEntry
    intersectionCallback!([fakeEntry], {} as IntersectionObserver)

    expect(el.classList.contains('is-visible')).toBe(true)
    expect(unobserveSpy).toHaveBeenCalledWith(el)
  })

  it('does not add is-visible when entry is not intersecting', () => {
    const el = makeEl()
    new RevealObserver([el]).setup()

    const fakeEntry = { isIntersecting: false, target: el } as unknown as IntersectionObserverEntry
    intersectionCallback!([fakeEntry], {} as IntersectionObserver)

    expect(el.classList.contains('is-visible')).toBe(false)
  })

  // ---- disconnect --------------------------------------------------------

  it('disconnect() disconnects the IntersectionObserver', () => {
    const obs = new RevealObserver([makeEl()])
    obs.setup()
    obs.disconnect()
    expect(disconnectSpy).toHaveBeenCalledOnce()
  })

  it('disconnect() is safe to call before setup()', () => {
    const obs = new RevealObserver([makeEl()])
    expect(() => obs.disconnect()).not.toThrow()
  })

  it('disconnect() is idempotent — second call does nothing', () => {
    const obs = new RevealObserver([makeEl()])
    obs.setup()
    obs.disconnect()
    obs.disconnect() // second call should not throw
    expect(disconnectSpy).toHaveBeenCalledOnce()
  })

  // ---- re-setup (observer replaced) -------------------------------------

  it('disconnects existing observer before creating a new one on second setup()', () => {
    const obs = new RevealObserver([makeEl()])
    obs.setup() // creates first observer
    obs.setup() // should disconnect first, then create second
    expect(disconnectSpy).toHaveBeenCalledOnce()
    expect(IntersectionObserver).toHaveBeenCalledTimes(2)
  })
})
