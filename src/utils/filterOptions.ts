import type { CeremonyType, RegionCode, SortOption, WeddingHallFilters } from '@/types/weddingHall'
import { REGION_LABELS } from '@/utils/regions'

// Shared between the desktop FilterBar (horizontal dropdowns) and the mobile
// SearchPage (vertical stacked sections) so both surfaces always offer the
// exact same filter options.

export const MEAL_OPTIONS: { key: WeddingHallFilters['mealPriceRange']; label: string }[] = [
  { key: 'all', label: '전체' },
  { key: 'under5', label: '5만원 이하' },
  { key: '5to7', label: '5~7만원' },
  { key: '7to10', label: '7~10만원' },
  { key: 'over10', label: '10만원 이상' },
]

export const RENTAL_OPTIONS: { key: WeddingHallFilters['rentalFeeRange']; label: string }[] = [
  { key: 'all', label: '전체' },
  { key: 'under500', label: '500만원 이하' },
  { key: '500to700', label: '500~700만원' },
  { key: '700to1000', label: '700~1,000만원' },
  { key: 'over1000', label: '1,000만원 이상' },
]

export const GUEST_OPTIONS: { key: WeddingHallFilters['guestRange']; label: string }[] = [
  { key: 'all', label: '전체' },
  { key: 'under100', label: '100명 이하' },
  { key: '100to200', label: '100~200명' },
  { key: '200to300', label: '200~300명' },
  { key: 'over300', label: '300명 이상' },
]

export const CEREMONY_OPTIONS: { key: WeddingHallFilters['ceremonyType']; label: string }[] = [
  { key: 'all', label: '전체' },
  { key: '분리예식', label: '분리예식' },
  { key: '동시예식', label: '동시예식' },
]

export const SORT_OPTIONS: { key: SortOption; label: string }[] = [
  { key: 'recommended', label: '추천순' },
  { key: 'mealPriceAsc', label: '식대 낮은순' },
  { key: 'rentalFeeAsc', label: '대관료 낮은순' },
  { key: 'minimumGuestsAsc', label: '최소보증인원 낮은순' },
  { key: 'latest', label: '최신 등록순' },
]

export const REGIONS: { key: 'all' | RegionCode; label: string }[] = [
  { key: 'all', label: '전체' },
  { key: 'seoul', label: REGION_LABELS.seoul },
  { key: 'gyeonggi', label: REGION_LABELS.gyeonggi },
  { key: 'incheon', label: REGION_LABELS.incheon },
]

export type CeremonyFilterValue = 'all' | CeremonyType
