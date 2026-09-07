import type { CeremonyType, RegionCode, SortOption, WeddingHallFilters } from '@/types/weddingHall'
import { DISTRICTS_BY_REGION, REGION_LABELS } from '@/utils/regions'
import Dropdown from './Dropdown'
import { cn } from '@/utils/cn'

interface FilterBarProps {
  filters: WeddingHallFilters
  sort: SortOption
  onChange: (filters: WeddingHallFilters) => void
  onSortChange: (sort: SortOption) => void
  resultCount: number
}

const MEAL_OPTIONS: { key: WeddingHallFilters['mealPriceRange']; label: string }[] = [
  { key: 'all', label: '전체' },
  { key: 'under5', label: '5만원 이하' },
  { key: '5to7', label: '5~7만원' },
  { key: '7to10', label: '7~10만원' },
  { key: 'over10', label: '10만원 이상' },
]

const RENTAL_OPTIONS: { key: WeddingHallFilters['rentalFeeRange']; label: string }[] = [
  { key: 'all', label: '전체' },
  { key: 'under500', label: '500만원 이하' },
  { key: '500to700', label: '500~700만원' },
  { key: '700to1000', label: '700~1,000만원' },
  { key: 'over1000', label: '1,000만원 이상' },
]

const GUEST_OPTIONS: { key: WeddingHallFilters['guestRange']; label: string }[] = [
  { key: 'all', label: '전체' },
  { key: 'under100', label: '100명 이하' },
  { key: '100to200', label: '100~200명' },
  { key: '200to300', label: '200~300명' },
  { key: 'over300', label: '300명 이상' },
]

const CEREMONY_OPTIONS: { key: WeddingHallFilters['ceremonyType']; label: string }[] = [
  { key: 'all', label: '전체' },
  { key: '분리예식', label: '분리예식' },
  { key: '동시예식', label: '동시예식' },
]

const SORT_OPTIONS: { key: SortOption; label: string }[] = [
  { key: 'recommended', label: '추천순' },
  { key: 'mealPriceAsc', label: '식대 낮은순' },
  { key: 'rentalFeeAsc', label: '대관료 낮은순' },
  { key: 'minimumGuestsAsc', label: '최소보증인원 낮은순' },
  { key: 'latest', label: '최신 등록순' },
]

const REGIONS: { key: 'all' | RegionCode; label: string }[] = [
  { key: 'all', label: '전체' },
  { key: 'seoul', label: REGION_LABELS.seoul },
  { key: 'gyeonggi', label: REGION_LABELS.gyeonggi },
  { key: 'incheon', label: REGION_LABELS.incheon },
]

function RadioList<T extends string>({
  options,
  value,
  onSelect,
}: {
  options: { key: T; label: string }[]
  value: T
  onSelect: (key: T) => void
}) {
  return (
    <div className="flex flex-col gap-1">
      {options.map((opt) => (
        <button
          key={opt.key}
          type="button"
          onClick={() => onSelect(opt.key)}
          className={cn(
            'rounded-lg px-3 py-2 text-left text-sm transition-colors',
            value === opt.key ? 'bg-olive-light font-medium text-olive-dark' : 'text-ink hover:bg-beige',
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}

export default function FilterBar({ filters, sort, onChange, onSortChange, resultCount }: FilterBarProps) {
  const availableDistricts =
    filters.region === 'all' ? Object.values(DISTRICTS_BY_REGION).flat() : DISTRICTS_BY_REGION[filters.region]

  function setRegion(region: 'all' | RegionCode) {
    onChange({ ...filters, region, districts: [] })
  }

  function toggleDistrict(d: string) {
    const set = new Set(filters.districts)
    if (set.has(d)) set.delete(d)
    else set.add(d)
    onChange({ ...filters, districts: Array.from(set) })
  }

  const anyDetailFilterActive =
    filters.mealPriceRange !== 'all' ||
    filters.rentalFeeRange !== 'all' ||
    filters.guestRange !== 'all' ||
    filters.ceremonyType !== 'all' ||
    filters.districts.length > 0

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        {REGIONS.map((r) => (
          <button
            key={r.key}
            type="button"
            onClick={() => setRegion(r.key)}
            className={cn(
              'rounded-full px-4 py-1.5 text-sm font-medium transition-colors',
              filters.region === r.key ? 'bg-olive text-white' : 'bg-white border border-line text-ink hover:bg-beige',
            )}
          >
            {r.label}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Dropdown label="지역" active={filters.districts.length > 0} panelClassName="w-64">
          {() => (
            <div className="max-h-64 space-y-1 overflow-y-auto">
              {availableDistricts.map((d) => (
                <label key={d} className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm hover:bg-beige">
                  <input
                    type="checkbox"
                    checked={filters.districts.includes(d)}
                    onChange={() => toggleDistrict(d)}
                    className="h-4 w-4 accent-olive"
                  />
                  {d}
                </label>
              ))}
            </div>
          )}
        </Dropdown>

        <Dropdown label="식대" active={filters.mealPriceRange !== 'all'}>
          {(close) => (
            <RadioList
              options={MEAL_OPTIONS}
              value={filters.mealPriceRange}
              onSelect={(key) => {
                onChange({ ...filters, mealPriceRange: key })
                close()
              }}
            />
          )}
        </Dropdown>

        <Dropdown label="대관료" active={filters.rentalFeeRange !== 'all'}>
          {(close) => (
            <RadioList
              options={RENTAL_OPTIONS}
              value={filters.rentalFeeRange}
              onSelect={(key) => {
                onChange({ ...filters, rentalFeeRange: key })
                close()
              }}
            />
          )}
        </Dropdown>

        <Dropdown label="최소보증인원" active={filters.guestRange !== 'all'}>
          {(close) => (
            <RadioList
              options={GUEST_OPTIONS}
              value={filters.guestRange}
              onSelect={(key) => {
                onChange({ ...filters, guestRange: key })
                close()
              }}
            />
          )}
        </Dropdown>

        <Dropdown label="예식형태" active={filters.ceremonyType !== 'all'}>
          {(close) => (
            <RadioList
              options={CEREMONY_OPTIONS as { key: 'all' | CeremonyType; label: string }[]}
              value={filters.ceremonyType}
              onSelect={(key) => {
                onChange({ ...filters, ceremonyType: key })
                close()
              }}
            />
          )}
        </Dropdown>

        <div className="ml-auto flex items-center gap-2">
          <Dropdown label={`정렬: ${SORT_OPTIONS.find((s) => s.key === sort)?.label}`} align="right">
            {(close) => (
              <RadioList
                options={SORT_OPTIONS}
                value={sort}
                onSelect={(key) => {
                  onSortChange(key)
                  close()
                }}
              />
            )}
          </Dropdown>
        </div>
      </div>

      <div className="flex items-center justify-between text-sm text-subtext">
        <span>
          총 <strong className="text-ink">{resultCount}</strong>개의 웨딩홀이 있습니다.
        </span>
        {anyDetailFilterActive && (
          <button
            type="button"
            className="text-olive hover:underline"
            onClick={() =>
              onChange({
                ...filters,
                districts: [],
                mealPriceRange: 'all',
                rentalFeeRange: 'all',
                guestRange: 'all',
                ceremonyType: 'all',
              })
            }
          >
            필터 초기화
          </button>
        )}
      </div>
    </div>
  )
}
