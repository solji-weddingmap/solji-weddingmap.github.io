import type { SortOption, WeddingHall, WeddingHallFilters } from '@/types/weddingHall'

const MEAL_RANGES: Record<string, [number, number]> = {
  under5: [0, 50000],
  '5to7': [50000, 70000],
  '7to10': [70000, 100000],
  over10: [100000, Infinity],
}

const RENTAL_RANGES: Record<string, [number, number]> = {
  under500: [0, 5_000_000],
  '500to700': [5_000_000, 7_000_000],
  '700to1000': [7_000_000, 10_000_000],
  over1000: [10_000_000, Infinity],
}

const GUEST_RANGES: Record<string, [number, number]> = {
  under100: [0, 100],
  '100to200': [100, 200],
  '200to300': [200, 300],
  over300: [300, Infinity],
}

export function matchesKeyword(hall: WeddingHall, keyword: string): boolean {
  const k = keyword.trim().toLowerCase()
  if (!k) return true
  return (
    hall.name.toLowerCase().includes(k) ||
    hall.address.toLowerCase().includes(k) ||
    hall.district.toLowerCase().includes(k) ||
    (hall.detailAddress ?? '').toLowerCase().includes(k)
  )
}

export function applyFilters(halls: WeddingHall[], filters: WeddingHallFilters): WeddingHall[] {
  return halls.filter((hall) => {
    if (filters.region !== 'all' && hall.region !== filters.region) return false

    if (filters.districts.length > 0 && !filters.districts.includes(hall.district)) return false

    if (filters.mealPriceRange !== 'all') {
      const range = MEAL_RANGES[filters.mealPriceRange]
      if (!range) return true
      if (hall.mealPrice === undefined || hall.mealPrice === null) return false
      if (hall.mealPrice < range[0] || hall.mealPrice >= range[1]) return false
    }

    if (filters.rentalFeeRange !== 'all') {
      const range = RENTAL_RANGES[filters.rentalFeeRange]
      if (!range) return true
      if (hall.rentalFee === undefined || hall.rentalFee === null) return false
      if (hall.rentalFee < range[0] || hall.rentalFee >= range[1]) return false
    }

    if (filters.guestRange !== 'all') {
      const range = GUEST_RANGES[filters.guestRange]
      if (!range) return true
      if (hall.minimumGuests === undefined || hall.minimumGuests === null) return false
      if (hall.minimumGuests < range[0] || hall.minimumGuests >= range[1]) return false
    }

    if (filters.ceremonyType !== 'all' && hall.ceremonyType !== filters.ceremonyType) return false

    if (!matchesKeyword(hall, filters.keyword)) return false

    return true
  })
}

export function applySort(halls: WeddingHall[], sort: SortOption): WeddingHall[] {
  const list = [...halls]
  switch (sort) {
    case 'mealPriceAsc':
      return list.sort((a, b) => (a.mealPrice ?? Infinity) - (b.mealPrice ?? Infinity))
    case 'rentalFeeAsc':
      return list.sort((a, b) => (a.rentalFee ?? Infinity) - (b.rentalFee ?? Infinity))
    case 'minimumGuestsAsc':
      return list.sort((a, b) => (a.minimumGuests ?? Infinity) - (b.minimumGuests ?? Infinity))
    case 'latest':
      return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    case 'recommended':
    default:
      return list.sort((a, b) => {
        const ratingDiff = (b.rating ?? 0) - (a.rating ?? 0)
        if (ratingDiff !== 0) return ratingDiff
        return (b.reviewCount ?? 0) - (a.reviewCount ?? 0)
      })
  }
}
