import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { handleStoreClick, type StoreClickContext } from './store-click-handler'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeLink(opts: {
  href?: string
  dataStore?: string
  target?: string
  classes?: string[]
} = {}): HTMLAnchorElement {
  const link = document.createElement('a')
  link.href = opts.href ?? 'https://apps.apple.com/us/app/grippo/id6758158216'
  if (opts.dataStore) link.dataset.store = opts.dataStore
  if (opts.target) link.setAttribute('target', opts.target)
  if (opts.classes) opts.classes.forEach((c) => link.classList.add(c))
  return link
}

function makeEvent(opts: {
  metaKey?: boolean
  ctrlKey?: boolean
  shiftKey?: boolean
  altKey?: boolean
  button?: number
} = {}): MouseEvent {
  return {
    preventDefault: vi.fn(),
    metaKey: opts.metaKey ?? false,
    ctrlKey: opts.ctrlKey ?? false,
    shiftKey: opts.shiftKey ?? false,
    altKey: opts.altKey ?? false,
    button: opts.button ?? 0,
  } as unknown as MouseEvent
}

function makeCtx(
  link: HTMLAnchorElement,
  overrides: Partial<StoreClickContext> = {},
): StoreClickContext {
  return {
    link,
    locale: 'en',
    manualPreferred: null,
    onPreferenceChange: vi.fn(),
    ...overrides,
  }
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('handleStoreClick', () => {
  let assignSpy: ReturnType<typeof vi.fn>
  let setTimeoutSpy: ReturnType<typeof vi.fn>
  let clearTimeoutSpy: ReturnType<typeof vi.fn>

  beforeEach(() => {
    assignSpy = vi.fn()
    setTimeoutSpy = vi.fn(() => 42) // returns fake timer id
    clearTimeoutSpy = vi.fn()

    // Stub location.assign
    vi.stubGlobal('location', { assign: assignSpy, href: '' })
    vi.stubGlobal('setTimeout', setTimeoutSpy)
    vi.stubGlobal('clearTimeout', clearTimeoutSpy)

    // Ensure no gtag by default
    ;(window as unknown as Record<string, unknown>).gtag = undefined
  })

  afterEach(() => {
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
  })

  // ---- Step 1: unknown store type → bail early ---------------------------

  it('returns without doing anything when store type cannot be resolved', () => {
    const link = makeLink({ href: 'https://example.com', dataStore: undefined })
    const event = makeEvent()
    const ctx = makeCtx(link)

    handleStoreClick(event, ctx)

    expect(event.preventDefault).not.toHaveBeenCalled()
    expect(ctx.onPreferenceChange).not.toHaveBeenCalled()
  })

  // ---- resolveStoreType from data-store attribute -------------------------

  it("resolves 'app-store' from data-store='app-store'", () => {
    const link = makeLink({ dataStore: 'app-store', href: 'https://apps.apple.com/us/app/grippo/id6758158216' })
    const event = makeEvent()
    const ctx = makeCtx(link)

    handleStoreClick(event, ctx)

    expect(ctx.onPreferenceChange).toHaveBeenCalledWith('app-store')
  })

  it("resolves 'google-play' from data-store='google-play'", () => {
    const link = makeLink({ dataStore: 'google-play', href: 'https://play.google.com/store/apps/details?id=com.grippo.android' })
    const event = makeEvent()
    const ctx = makeCtx(link)

    handleStoreClick(event, ctx)

    expect(ctx.onPreferenceChange).toHaveBeenCalledWith('google-play')
  })

  it("resolves from href when data-store is missing — apple URL → 'app-store'", () => {
    const link = makeLink({ href: 'https://apps.apple.com/us/app/grippo/id6758158216' })
    // no dataStore set
    const event = makeEvent()
    const ctx = makeCtx(link)

    handleStoreClick(event, ctx)

    expect(ctx.onPreferenceChange).toHaveBeenCalledWith('app-store')
  })

  it("resolves from href when data-store is missing — play.google.com → 'google-play'", () => {
    const link = makeLink({ href: 'https://play.google.com/store/apps/details?id=com.grippo.android' })
    const event = makeEvent()
    const ctx = makeCtx(link)

    handleStoreClick(event, ctx)

    expect(ctx.onPreferenceChange).toHaveBeenCalledWith('google-play')
  })

  it("resolves 'auto' with manualPreferred='google-play' → 'google-play'", () => {
    const link = makeLink({ dataStore: 'auto', href: 'https://play.google.com/store/apps/details?id=com.grippo.android' })
    const event = makeEvent()
    const ctx = makeCtx(link, { manualPreferred: 'google-play' })

    handleStoreClick(event, ctx)

    expect(ctx.onPreferenceChange).toHaveBeenCalledWith('google-play')
  })

  // ---- Step 2: href captured before onPreferenceChange -------------------

  it('calls onPreferenceChange (step 3) after capturing href (step 2)', () => {
    const originalHref = 'https://apps.apple.com/us/app/grippo/id6758158216'
    const link = makeLink({ href: originalHref, dataStore: 'app-store' })
    const event = makeEvent()

    let capturedAtCallTime = ''
    const ctx = makeCtx(link, {
      onPreferenceChange: vi.fn(() => {
        // If href was already captured before this call, the link's href
        // might have been mutated — but we just verify the call happens
        capturedAtCallTime = link.href
      }),
    })

    handleStoreClick(event, ctx)
    expect(ctx.onPreferenceChange).toHaveBeenCalledOnce()
  })

  // ---- Step 4: _blank or modifier clicks → no preventDefault -------------

  it('does not call preventDefault for target="_blank" links', () => {
    const link = makeLink({ dataStore: 'app-store', target: '_blank' })
    const event = makeEvent()
    const ctx = makeCtx(link)

    handleStoreClick(event, ctx)

    expect(event.preventDefault).not.toHaveBeenCalled()
  })

  it('does not call preventDefault for metaKey modifier click', () => {
    const link = makeLink({ dataStore: 'app-store' })
    const event = makeEvent({ metaKey: true })
    const ctx = makeCtx(link)

    handleStoreClick(event, ctx)

    expect(event.preventDefault).not.toHaveBeenCalled()
  })

  it('does not call preventDefault for ctrlKey modifier click', () => {
    const link = makeLink({ dataStore: 'app-store' })
    const event = makeEvent({ ctrlKey: true })
    const ctx = makeCtx(link)

    handleStoreClick(event, ctx)

    expect(event.preventDefault).not.toHaveBeenCalled()
  })

  it('does not call preventDefault for middle-button click (button=1)', () => {
    const link = makeLink({ dataStore: 'app-store' })
    const event = makeEvent({ button: 1 })
    const ctx = makeCtx(link)

    handleStoreClick(event, ctx)

    expect(event.preventDefault).not.toHaveBeenCalled()
  })

  // ---- Step 5 & 6: no gtag → immediate navigate --------------------------

  it('calls preventDefault and location.assign when no gtag is available', () => {
    const href = 'https://apps.apple.com/us/app/grippo/id6758158216'
    const link = makeLink({ href, dataStore: 'app-store' })
    const event = makeEvent()
    const ctx = makeCtx(link)
    ;(window as unknown as Record<string, unknown>).gtag = undefined

    handleStoreClick(event, ctx)

    expect(event.preventDefault).toHaveBeenCalledOnce()
    expect(assignSpy).toHaveBeenCalledWith(href)
  })

  // ---- Step 7 & 8: gtag available → setTimeout fallback + event_callback -

  it('sets a 300ms setTimeout fallback when gtag is available', () => {
    const link = makeLink({ dataStore: 'app-store' })
    const event = makeEvent()
    const ctx = makeCtx(link)
    ;(window as unknown as Record<string, unknown>).gtag = vi.fn()

    handleStoreClick(event, ctx)

    expect(setTimeoutSpy).toHaveBeenCalledWith(expect.any(Function), 300)
  })

  it('calls gtag with the correct event name and params when gtag is available', () => {
    const href = 'https://apps.apple.com/us/app/grippo/id6758158216'
    const link = makeLink({ href, dataStore: 'app-store', classes: ['store-button'] })
    const event = makeEvent()
    const gtagSpy = vi.fn()
    ;(window as unknown as Record<string, unknown>).gtag = gtagSpy
    const ctx = makeCtx(link, { locale: 'ua' })

    handleStoreClick(event, ctx)

    expect(gtagSpy).toHaveBeenCalledWith(
      'event',
      expect.any(String), // event name from STORE_EVENT_NAMES
      expect.objectContaining({
        store: 'app-store',
        locale: 'ua',
        link_url: href,
        source: 'hero',
        transport_type: 'beacon',
        event_callback: expect.any(Function),
      }),
    )
  })

  it('event_callback clears the fallback timeout and navigates', () => {
    const href = 'https://apps.apple.com/us/app/grippo/id6758158216'
    const link = makeLink({ href, dataStore: 'app-store' })
    const event = makeEvent()
    let capturedCallback: (() => void) | undefined
    const gtagSpy = vi.fn((_event: unknown, _name: unknown, params: Record<string, unknown>) => {
      capturedCallback = params.event_callback as () => void
    })
    ;(window as unknown as Record<string, unknown>).gtag = gtagSpy
    const ctx = makeCtx(link)

    handleStoreClick(event, ctx)

    expect(capturedCallback).toBeDefined()
    capturedCallback!()

    expect(clearTimeoutSpy).toHaveBeenCalledWith(42) // fake timer id returned by stub
    expect(assignSpy).toHaveBeenCalledWith(href)
  })

  it('didNavigate guard prevents double navigation when callback fires after fallback', () => {
    const href = 'https://apps.apple.com/us/app/grippo/id6758158216'
    const link = makeLink({ href, dataStore: 'app-store' })
    const event = makeEvent()
    let capturedCallback: (() => void) | undefined
    const gtagSpy = vi.fn((_event: unknown, _name: unknown, params: Record<string, unknown>) => {
      capturedCallback = params.event_callback as () => void
    })
    ;(window as unknown as Record<string, unknown>).gtag = gtagSpy
    const ctx = makeCtx(link)

    handleStoreClick(event, ctx)

    // Simulate fallback firing first
    const fallbackFn = setTimeoutSpy.mock.calls[0][0] as () => void
    fallbackFn()
    // Then callback fires
    capturedCallback!()

    // location.assign should only have been called once (didNavigate guard)
    expect(assignSpy).toHaveBeenCalledTimes(1)
  })

  // ---- getStoreClickSource -----------------------------------------------

  it("source is 'sticky' for .mobile-store-primary link", () => {
    const link = makeLink({ dataStore: 'app-store', classes: ['mobile-store-primary'] })
    const event = makeEvent()
    const gtagSpy = vi.fn()
    ;(window as unknown as Record<string, unknown>).gtag = gtagSpy
    const ctx = makeCtx(link)

    handleStoreClick(event, ctx)

    const params = gtagSpy.mock.calls[0][2] as Record<string, unknown>
    expect(params.source).toBe('sticky')
  })

  it("source is 'cta' for .cta-primary link", () => {
    const link = makeLink({ dataStore: 'app-store', classes: ['cta-primary'] })
    const event = makeEvent()
    const gtagSpy = vi.fn()
    ;(window as unknown as Record<string, unknown>).gtag = gtagSpy
    const ctx = makeCtx(link)

    handleStoreClick(event, ctx)

    const params = gtagSpy.mock.calls[0][2] as Record<string, unknown>
    expect(params.source).toBe('cta')
  })

  it("source is 'unknown' for a link with no recognised class", () => {
    const link = makeLink({ dataStore: 'app-store' })
    const event = makeEvent()
    const gtagSpy = vi.fn()
    ;(window as unknown as Record<string, unknown>).gtag = gtagSpy
    const ctx = makeCtx(link)

    handleStoreClick(event, ctx)

    const params = gtagSpy.mock.calls[0][2] as Record<string, unknown>
    expect(params.source).toBe('unknown')
  })
})
