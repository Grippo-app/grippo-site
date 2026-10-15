type DemoPeriod = 'week' | 'month' | 'quarter'

interface SampleWorkout {
  readonly date: string
  readonly volume: number
}

interface DemoData {
  readonly start: string
  readonly end: string
  readonly previousVolume: number
  readonly dates: readonly string[]
  readonly dateFormat: Intl.DateTimeFormatOptions
}

const SAMPLE_WORKOUTS: readonly SampleWorkout[] = [
  { date: '2025-11-03', volume: 3650 },
  { date: '2025-11-05', volume: 4100 },
  { date: '2025-11-08', volume: 3870 },
  { date: '2025-11-10', volume: 4320 },
  { date: '2025-11-13', volume: 4550 },
  { date: '2025-11-15', volume: 4260 },
  { date: '2025-11-18', volume: 4680 },
  { date: '2025-11-20', volume: 4420 },
  { date: '2025-11-23', volume: 4890 },
  { date: '2025-11-25', volume: 4675 },
  { date: '2025-11-28', volume: 5010 },
  { date: '2025-11-30', volume: 4780 },
  { date: '2025-12-03', volume: 4590 },
  { date: '2025-12-05', volume: 4850 },
  { date: '2025-12-08', volume: 4530 },
  { date: '2025-12-10', volume: 5070 },
  { date: '2025-12-13', volume: 4905 },
  { date: '2025-12-15', volume: 4770 },
  { date: '2025-12-18', volume: 5250 },
  { date: '2025-12-20', volume: 5040 },
  { date: '2025-12-23', volume: 5390 },
  { date: '2025-12-25', volume: 5160 },
  { date: '2025-12-28', volume: 5530 },
  { date: '2025-12-30', volume: 5310 },
  { date: '2026-01-03', volume: 5720 },
  { date: '2026-01-05', volume: 5480 },
  { date: '2026-01-08', volume: 5840 },
  { date: '2026-01-10', volume: 5610 },
  { date: '2026-01-13', volume: 5980 },
  { date: '2026-01-15', volume: 5750 },
  { date: '2026-01-18', volume: 6090 },
  { date: '2026-01-20', volume: 5890 },
  { date: '2026-01-23', volume: 6175 },
  { date: '2026-01-25', volume: 5940 },
  { date: '2026-01-28', volume: 6200 },
  { date: '2026-01-30', volume: 6045 },
]

function workoutsBetween(start: string, end: string): readonly SampleWorkout[] {
  return SAMPLE_WORKOUTS.filter((workout) => workout.date >= start && workout.date <= end)
}

function sumVolume(workouts: readonly SampleWorkout[]): number {
  return workouts.reduce((total, workout) => total + workout.volume, 0)
}

// The preceding quarter is outside this illustrative history.
const PREVIOUS_QUARTER_SAMPLE_VOLUME = 155400

const DEMO_DATA: Readonly<Record<DemoPeriod, DemoData>> = {
  week: {
    start: '2026-01-25',
    end: '2026-01-31',
    previousVolume: sumVolume(workoutsBetween('2026-01-18', '2026-01-24')),
    dates: ['2026-01-25', '2026-01-27', '2026-01-29', '2026-01-31'],
    dateFormat: { weekday: 'short' },
  },
  month: {
    start: '2026-01-01',
    end: '2026-01-31',
    previousVolume: sumVolume(workoutsBetween('2025-12-01', '2025-12-31')),
    dates: ['2026-01-01', '2026-01-11', '2026-01-21', '2026-01-31'],
    dateFormat: { month: 'short', day: 'numeric' },
  },
  quarter: {
    start: '2025-11-01',
    end: '2026-01-31',
    previousVolume: PREVIOUS_QUARTER_SAMPLE_VOLUME,
    dates: ['2025-11-01', '2025-12-01', '2026-01-01', '2026-01-31'],
    dateFormat: { month: 'short', day: 'numeric' },
  },
}

// Keep workout heights comparable when visitors switch the displayed period.
const CHART_MAX_VOLUME = Math.ceil(
  Math.max(...SAMPLE_WORKOUTS.map((workout) => workout.volume)) / 1000,
) * 1000

function isDemoPeriod(value: string | undefined): value is DemoPeriod {
  return value === 'week' || value === 'month' || value === 'quarter'
}

/** A local, fixed example of how Grippo displays training progress. */
export function initProgressDemo(): (() => void) | undefined {
  const root = document.querySelector<HTMLElement>('[data-progress-demo]')
  if (!root) return

  const value = root.querySelector<HTMLElement>('[data-progress-value]')
  const change = root.querySelector<HTMLElement>('[data-progress-change]')
  const chart = root.querySelector<SVGSVGElement>('svg.volume-chart')
  if (!value || !change || !chart) return

  const buttons = Array.from(root.querySelectorAll<HTMLButtonElement>('button[data-period]'))
  const axes = Array.from(root.querySelectorAll<HTMLElement>('[data-progress-axis]'))
  let selectedPeriod: DemoPeriod = 'quarter'

  for (const output of [value, change]) {
    if (!output.closest('[aria-live]')) {
      output.setAttribute('aria-live', 'polite')
      output.setAttribute('aria-atomic', 'true')
    }
  }

  const render = (period: DemoPeriod): void => {
    const locale = document.documentElement.lang || 'en'
    const numberFormat = new Intl.NumberFormat(locale, { maximumFractionDigits: 0 })
    const changeFormat = new Intl.NumberFormat(locale, {
      style: 'percent',
      signDisplay: 'always',
      minimumFractionDigits: 1,
      maximumFractionDigits: 1,
    })
    const data = DEMO_DATA[period]
    const workouts = workoutsBetween(data.start, data.end)
    const totalVolume = sumVolume(workouts)
    value.textContent = numberFormat.format(totalVolume)
    change.textContent = changeFormat.format(totalVolume / data.previousVolume - 1)

    buttons.forEach((button) => {
      button.setAttribute('aria-pressed', String(button.dataset.period === period))
    })

    const columnWidth = 504 / workouts.length
    const barWidth = Math.min(36, columnWidth * 0.68)
    const bars = workouts.map((workout, index) => {
      const bar = document.createElementNS('http://www.w3.org/2000/svg', 'rect')
      const height = (workout.volume / CHART_MAX_VOLUME) * 140
      bar.setAttribute('data-progress-bar', '')
      bar.setAttribute('x', String(8 + index * columnWidth + (columnWidth - barWidth) / 2))
      bar.setAttribute('y', String(150 - height))
      bar.setAttribute('width', String(barWidth))
      bar.setAttribute('height', String(height))
      bar.setAttribute('rx', String(Math.min(3, barWidth / 2)))
      return bar
    })
    chart.replaceChildren(...bars)

    const dateFormat = new Intl.DateTimeFormat(locale, {
      ...data.dateFormat,
      timeZone: 'UTC',
    })
    axes.forEach((axis, index) => {
      const date = data.dates[index]
      if (date) axis.textContent = dateFormat.format(new Date(`${date}T12:00:00Z`))
    })
  }

  buttons.forEach((button) => {
    const period = button.dataset.period
    if (isDemoPeriod(period)) button.addEventListener('click', () => {
      selectedPeriod = period
      render(period)
    })
  })

  render(selectedPeriod)
  return () => render(selectedPeriod)
}
