export interface AnalyticsParams extends Record<string, unknown> {
  transport_type?: string
  event_callback?: () => void
}
