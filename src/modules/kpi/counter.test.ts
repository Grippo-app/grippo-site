import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { animateCounter, KpiObserver } from './counter'

// ---------------------------------------------------------------------------
// animateCounter
// ---------------------------------------------------------------------------

describe('animateCounter', () => {
  let rafCallbacks: FrameRequestCallback[]
  let now: number

  beforeEach(() => {
    rafCallbacks = []
    now = 0

    // Collect rAF callbacks so we can flush them manually
    vi.stubGlobal('requestAnimationFrame', (cb: FrameRequestCallback) => {
      rafCallbacks.push(cb)
      return rafCallbacks.length
    })

    // performance.now starts at 0; we'll advance manually
    vi.spyOn(performance, 'now').mockReturnValue(0)
  })

  afterEach(() => {
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
  })

  const flushRaf = (timestamp: number) => {
    const cbs = [...rafCallbacks]
    rafCallbacks.length = 0
    vi.spyOn(performance, 'now').mockReturnValue(timestamp)
    cbs.forEach((cb) => cb(timestamp))
  }

  it('does not throw for a null-ish element (early-return guard)', () => {
    // Cast null to HTMLElement to simulate runtime null without TS error
    expect(() => animateCounter(null as unknown as HTMLElement)).not.toThrow()
  })

  it('sets textContent to "0<suffix>" on the first rAF tick (t=0)', () => {
    const el = document.createElement('div')
    el.dataset.kpiTarget = '100'
    el.dataset.kpiSuffix = '%'

    animateCounter(el)
    // One rAF callback should be queued
    expect(rafCallbacks).toHaveLength(1)

    flushRaf(0)
    expect(el.textContent).toBe('0%')
  })

  it('reaches the target value at t >= duration', () => {
    const el = document.createElement('div')
    el.dataset.kpiTarget = '500'
    el.dataset.kpiSuffix = '+'

    animateCounter(el)
    // First rAF scheduled
    flushRaf(0)       // progress=0 → "0+"
    // Advance past full duration (1100ms)
    flushRaf(1200)    // progress=1 → "500+"
    expect(el.textContent).toBe('500+')
  })

  it('stops scheduling new rAF frames once progress reaches 1', () => {
    const el = document.createElement('div')
    el.dataset.kpiTarget = '10'

    animateCounter(el)
    flushRaf(0)
    // At this point another rAF was queued for progress<1
    flushRaf(1200) // progress >= 1 → no new rAF
    const countAfterFinish = rafCallbacks.length
    expect(countAfterFinish).toBe(0)
  })

  it('works without a suffix (defaults to empty string)', () => {
    const el = document.createElement('div')
    el.dataset.kpiTarget = '42'
    // No kpiSuffix set

    animateCounter(el)
    flushRaf(1200)
    expect(el.textContent).toBe('42')
  })

  it('works when data-kpi-target is missing (defaults to 0)', () => {
    const el = document.createElement('div')
    // No kpiTarget set

    animateCounter(el)
    flushRaf(1200)
    expect(el.textContent).toBe('0')
  })
})

// ---------------------------------------------------------------------------
// KpiObserver
// ---------------------------------------------------------------------------

describe('KpiObserver', () => {
  let observeSpy: ReturnType<typeof vi.fn>
  let disconnectSpy: ReturnType<typeof vi.fn>
  let intersectionCallback: IntersectionObserverCallback | null = null

  beforeEach(() => {
    observeSpy = vi.fn()
    disconnectSpy = vi.fn()
    intersectionCallback = null

    vi.stubGlobal(
      'IntersectionObserver',
      vi.fn((cb: IntersectionObserverCallback) => {
        intersectionCallback = cb
        return {
          observe: observeSpy,
          disconnect: disconnectSpy,
          unobserve: vi.fn(),
          takeRecords: vi.fn(() => []),
          root: null,
          rootMargin: '',
          thresholds: [],
        }
      }),
    )

    // Stub rAF to be a no-op (avoid animateCounter side-effects)
    vi.stubGlobal('requestAnimationFrame', vi.fn())
  })

  afterEach(() => {
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
  })

  it('does not create an IntersectionObserver when elements array is empty', () => {
    const obs = new KpiObserver([])
    obs.observe()
    expect(IntersectionObserver).not.toHaveBeenCalled()
  })

  it('does not call IntersectionObserver.observe when closest .kpi-grid is not found', () => {
    const el = document.createElement('div')
    el.dataset.kpiTarget = '10'
    // el is not inside a .kpi-grid, so closest() returns null
    const kpi = new KpiObserver([el])
    kpi.observe()
    expect(observeSpy).not.toHaveBeenCalled()
  })

  it('calls IntersectionObserver.observe on the .kpi-grid element', () => {
    const grid = document.createElement('div')
    grid.className = 'kpi-grid'
    const el = document.createElement('div')
    el.dataset.kpiTarget = '10'
    grid.appendChild(el)
    document.body.appendChild(grid)

    const kpi = new KpiObserver([el])
    kpi.observe()
    expect(observeSpy).toHaveBeenCalledWith(grid)

    document.body.removeChild(grid)
  })

  it('disconnects the observer after intersection fires', () => {
    const grid = document.createElement('div')
    grid.className = 'kpi-grid'
    const el = document.createElement('div')
    el.dataset.kpiTarget = '10'
    grid.appendChild(el)
    document.body.appendChild(grid)

    const kpi = new KpiObserver([el])
    kpi.observe()

    // Simulate intersection
    intersectionCallback!(
      [{ isIntersecting: true } as IntersectionObserverEntry],
      {} as IntersectionObserver,
    )
    expect(disconnectSpy).toHaveBeenCalledOnce()

    document.body.removeChild(grid)
  })

  it('does not disconnect when no entry is intersecting', () => {
    const grid = document.createElement('div')
    grid.className = 'kpi-grid'
    const el = document.createElement('div')
    el.dataset.kpiTarget = '10'
    grid.appendChild(el)
    document.body.appendChild(grid)

    const kpi = new KpiObserver([el])
    kpi.observe()

    intersectionCallback!(
      [{ isIntersecting: false } as IntersectionObserverEntry],
      {} as IntersectionObserver,
    )
    expect(disconnectSpy).not.toHaveBeenCalled()

    document.body.removeChild(grid)
  })

  it('disconnect() is safe to call when no observer exists', () => {
    const kpi = new KpiObserver([])
    expect(() => kpi.disconnect()).not.toThrow()
  })
})
