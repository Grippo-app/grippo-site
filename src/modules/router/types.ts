export type ViewMode = 'landing' | 'policies'
export type TabId = 'privacy' | 'terms' | 'remove'

export const VALID_TABS: ReadonlySet<TabId> = new Set<TabId>(['privacy', 'terms', 'remove'])
export const DEFAULT_TAB: TabId = 'privacy'
export const TAB_PARAM: string = 'tab'
export const LANDING_TAB_VALUES: ReadonlySet<string> = new Set(['landing', 'promo'])
export const LANDING_MODE_VALUES: ReadonlySet<string> = new Set(['landing', 'promo'])
export const MODE_VALUE_PARAMS: readonly string[] = ['view', 'page', 'mode']
export const MODE_FLAG_PARAMS: readonly string[] = ['landing', 'promo']
export const LANDING_CLEANUP_PARAMS: readonly string[] = ['landing', 'promo', 'view', 'page', 'mode']
export const TRUTHY_VALUES: ReadonlySet<string> = new Set(['', '1', 'true', 'yes'])
