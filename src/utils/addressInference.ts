import type { RegionCode } from '@/types/weddingHall'

// Shared with WeddingForm's single-hall address search AND the Excel
// bulk-import flow, so both paths infer region/district from a raw address
// string in exactly the same way.
export function inferRegion(address: string): RegionCode {
  if (address.includes('서울')) return 'seoul'
  if (address.includes('인천')) return 'incheon'
  return 'gyeonggi'
}

export function inferDistrict(address: string): string {
  const match = address.match(/([가-힣]+[시구])\s/)
  return match ? match[1] : ''
}
