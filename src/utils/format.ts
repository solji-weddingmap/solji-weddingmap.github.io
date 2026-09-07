// ---------------------------------------------------------------------------
// Display formatters. IMPORTANT: never render missing numeric data as 0.
// ---------------------------------------------------------------------------

export function formatWon(value?: number | null): string {
  if (value === undefined || value === null || Number.isNaN(value)) return '정보 없음'
  return `${value.toLocaleString('ko-KR')}원`
}

export function formatManwon(value?: number | null): string {
  if (value === undefined || value === null || Number.isNaN(value)) return '정보 없음'
  if (value % 10000 === 0) {
    return `${(value / 10000).toLocaleString('ko-KR')}만원`
  }
  return formatWon(value)
}

export function formatMealPrice(value?: number | null): string {
  if (value === undefined || value === null || Number.isNaN(value)) return '정보 없음'
  return `${value.toLocaleString('ko-KR')}원~`
}

export function formatGuests(value?: number | null): string {
  if (value === undefined || value === null || Number.isNaN(value)) return '정보 없음'
  return `${value.toLocaleString('ko-KR')}명~`
}

export function formatParking(capacity?: number | null): string {
  if (capacity === undefined || capacity === null || Number.isNaN(capacity)) return '정보 확인 필요'
  return `${capacity.toLocaleString('ko-KR')}대`
}

export function formatDate(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return '-'
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${mm}/${dd}`
}

export function formatDateTime(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return '-'
  return d.toLocaleString('ko-KR')
}
