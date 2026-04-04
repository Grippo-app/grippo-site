export type StoreType = 'app-store' | 'google-play'

export const STORE_EVENT_NAMES: Record<StoreType, string> = {
  'app-store': 'appstore_click',
  'google-play': 'playmarket_click',
}

export const PREFERRED_STORE_KEY = 'grippo_preferred_store'

export interface StoreUrls {
  appStoreUrl: string
  googlePlayUrl: string
}
