// Tracks which wedding hall ids were registered from THIS browser, for the
// logged-out case (no account to attach the hall to yet).
//
// When a user IS logged in, "내가 등록한 웨딩홀" is instead read directly
// from `wedding_halls.created_by` (set at creation time - see
// weddingHallService.createWeddingHall) via MyPage's own query, so nothing
// needs to be written here for that case.

const STORAGE_KEY = 'wedding-map:my-registered-halls'

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
    // ignore - localStorage unavailable
  }
}

export function recordMyRegisteredHall(hallId: string, userId?: string | null) {
  if (!hallId) return
  if (userId) return // already tracked server-side via wedding_halls.created_by
  const ids = readIds().filter((id) => id !== hallId)
  ids.unshift(hallId)
  writeIds(ids)
}

export function getMyRegisteredHallIds(): string[] {
  return readIds()
}
