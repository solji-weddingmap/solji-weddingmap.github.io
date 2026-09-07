// Tracks which wedding hall ids were registered from THIS browser, so the
// 마이(My) page can show "내가 등록한 웨딩홀" without a real login/account
// system (none exists yet - see README future features: 관리자 로그인,
// 웨딩홀 업체 계정). Purely local to the device that created them.

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

export function recordMyRegisteredHall(hallId: string) {
  if (!hallId) return
  const ids = readIds().filter((id) => id !== hallId)
  ids.unshift(hallId)
  writeIds(ids)
}

export function getMyRegisteredHallIds(): string[] {
  return readIds()
}
