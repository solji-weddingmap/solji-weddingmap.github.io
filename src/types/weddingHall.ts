// ---------------------------------------------------------------------------
// Core domain types for WEDDING MAP
// ---------------------------------------------------------------------------

export type CeremonyType = '분리예식' | '동시예식'

export type RegionCode = 'seoul' | 'gyeonggi' | 'incheon'

export interface WeddingHall {
  id: string

  name: string
  favorite?: boolean // client-only convenience flag (derived from localStorage), not persisted to DB

  region: RegionCode
  district: string // e.g. "강남구", "수원시"
  address: string
  detailAddress?: string
  latitude: number
  longitude: number

  mainImage: string | null
  images: string[]

  homepage?: string
  phone?: string

  openUntil?: string // e.g. "11월까지오픈"
  tags: string[]

  minimumGuests?: number // null/undefined -> "정보 없음"
  sundayEveningGuests?: number

  rentalFee?: number // KRW, numeric
  mealPrice?: number // KRW, numeric (per person)

  negotiable?: boolean
  negotiableMemo?: string

  ceremonyType?: CeremonyType
  hallCount?: number

  parkingCapacity?: number
  parkingInfo?: string

  subwayInfo?: string
  shuttleInfo?: string

  description?: string
  memo?: string

  rating?: number
  reviewCount?: number

  createdAt: string
  updatedAt: string
}

// Payload shape used by the registration / edit form before it becomes a
// full WeddingHall (id/createdAt/updatedAt are assigned by the service layer).
export type WeddingHallInput = Omit<WeddingHall, 'id' | 'createdAt' | 'updatedAt' | 'favorite'>

export type SortOption =
  | 'recommended'
  | 'mealPriceAsc'
  | 'rentalFeeAsc'
  | 'minimumGuestsAsc'
  | 'latest'

export interface MealPriceRange {
  key: 'all' | 'under5' | '5to7' | '7to10' | 'over10'
  label: string
  min?: number
  max?: number
}

export interface RentalFeeRange {
  key: 'all' | 'under500' | '500to700' | '700to1000' | 'over1000'
  label: string
  min?: number
  max?: number
}

export interface GuestRange {
  key: 'all' | 'under100' | '100to200' | '200to300' | 'over300'
  label: string
  min?: number
  max?: number
}

export interface WeddingHallFilters {
  region: 'all' | RegionCode
  districts: string[] // sub-region filters, empty = all
  mealPriceRange: MealPriceRange['key']
  rentalFeeRange: RentalFeeRange['key']
  guestRange: GuestRange['key']
  ceremonyType: 'all' | CeremonyType
  keyword: string
}

export const DEFAULT_FILTERS: WeddingHallFilters = {
  region: 'all',
  districts: [],
  mealPriceRange: 'all',
  rentalFeeRange: 'all',
  guestRange: 'all',
  ceremonyType: 'all',
  keyword: '',
}
