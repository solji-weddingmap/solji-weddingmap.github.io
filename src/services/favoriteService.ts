// ---------------------------------------------------------------------------
// Favorites ("찜") persistence.
//
// Current implementation: browser localStorage, keyed by wedding hall id.
// This keeps favorites working with zero backend setup and survives closing
// the browser tab, per spec section 31.
//
// Future migration: once user accounts exist, swap the body of these
// functions to read/write a Supabase `favorites` table keyed by
// (user_id, wedding_hall_id) instead. Every caller in the app goes through
// this module, so no component changes will be needed when that happens.
// ---------------------------------------------------------------------------

const STORAGE_KEY = 'wedding-map:favorites'

function readIds(): Set<string> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return new Set()
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return new Set()
    return new Set(parsed)
  } catch {
    return new Set()
  }
}

function writeIds(ids: Set<string>) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(ids)))
  } catch {
    // localStorage may be unavailable (private mode, quota) - fail silently,
    // favorites simply won't persist for this session.
  }
}

export function getFavoriteIds(): string[] {
  return Array.from(readIds())
}

export function isFavorite(id: string): boolean {
  return readIds().has(id)
}

export function toggleFavorite(id: string): boolean {
  const ids = readIds()
  let nowFavorite: boolean
  if (ids.has(id)) {
    ids.delete(id)
    nowFavorite = false
  } else {
    ids.add(id)
    nowFavorite = true
  }
  writeIds(ids)
  return nowFavorite
}

export const FAVORITES_CHANGED_EVENT = 'wedding-map:favorites-changed'

export function notifyFavoritesChanged() {
  window.dispatchEvent(new Event(FAVORITES_CHANGED_EVENT))
}
