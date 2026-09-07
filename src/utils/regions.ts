import type { RegionCode } from '@/types/weddingHall'

export const REGION_LABELS: Record<RegionCode, string> = {
  seoul: '서울',
  gyeonggi: '경기',
  incheon: '인천',
}

// Sub-districts shown in the filter panel, grouped by region.
export const DISTRICTS_BY_REGION: Record<RegionCode, string[]> = {
  seoul: ['강남구', '강서구', '송파구', '영등포구', '마포구', '용산구', '종로구'],
  gyeonggi: ['성남시', '수원시', '용인시', '고양시', '부천시', '안양시'],
  incheon: ['남동구', '연수구', '부평구'],
}

export function regionLabel(region: RegionCode): string {
  return REGION_LABELS[region] ?? region
}

export function allDistricts(): string[] {
  return Object.values(DISTRICTS_BY_REGION).flat()
}
