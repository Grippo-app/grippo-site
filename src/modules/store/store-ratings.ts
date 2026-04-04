import { type StoreType } from './types'

/**
 * Rating data for each store.
 * Update `score` when the actual store rating changes.
 * `stars` is the integer display count (always ≤ 5).
 */
export interface StoreRating {
  readonly score: string      // displayed numeral, e.g. "4.8"
  readonly storeLabel: string // brand name shown next to the score
  readonly stars: number      // filled-star count rendered as ★ characters
}

export const STORE_RATINGS: Readonly<Record<StoreType, StoreRating>> = {
  'app-store':   { score: '5.0', storeLabel: 'App Store',   stars: 5 },
  'google-play': { score: '5.0', storeLabel: 'Google Play', stars: 5 },
}
