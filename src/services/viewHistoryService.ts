// Lightweight "recently viewed" tracker for the mobile 마이(My) page. Stored
// per-browser in localStorage (no auth/backend exists yet - see README future
// features) - most-recently-viewed id first, capped at MAX_ITEMS.

const STORAGE_KEY = 'wedding-map:recently-viewed'
const MAX_ITEMS = 10

function readIds(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed.filter((v) => typeof v === 'string') : []
  } catch {
    return []
  }
}

function writeIds(ids: string[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ids))
  } catch {
    // localStorage unavailable (private mode / disabled) - fail silently,
    // the "최근 본 웨딩홀" section simply stays empty.
  }
}

export function recordView(hallId: string) {
  if (!hallId) return
  const ids = readIds().filter((id) => id !== hallId)
  ids.unshift(hallId)
  writeIds(ids.slice(0, MAX_ITEMS))
}

export function getRecentlyViewedIds(): string[] {
  return readIds()
}
