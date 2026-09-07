import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, X } from 'lucide-react'
import SearchBar from '@/components/SearchBar/SearchBar'
import WeddingCard from '@/components/WeddingCard/WeddingCard'
import EmptyState from '@/components/common/EmptyState'
import MobileNav from '@/components/common/MobileNav'
import { useWeddingHalls } from '@/hooks/useWeddingHalls'
import { useFavorites } from '@/hooks/useFavorites'
import { DEFAULT_FILTERS, type RegionCode, type SortOption, type WeddingHallFilters } from '@/types/weddingHall'
import { applyFilters, applySort } from '@/utils/filterSort'
import {
  CEREMONY_OPTIONS,
  GUEST_OPTIONS,
  MEAL_OPTIONS,
  REGIONS,
  RENTAL_OPTIONS,
  SORT_OPTIONS,
  type CeremonyFilterValue,
} from '@/utils/filterOptions'
import { DISTRICTS_BY_REGION, regionLabel } from '@/utils/regions'
import { cn } from '@/utils/cn'

// 검색 탭 전용 화면 (spec #4) - 홈에서 뺀 검색창 + 상세 필터를 전부 여기로
// 모았다. 주차는 절대 필터 조건에 포함하지 않는다 (spec #4 "중요" 항목).

function SectionTitle({ children }: { children: string }) {
  return <h2 className="mb-2.5 text-[15px] font-semibold text-ink">{children}</h2>
}

function ChipRow<T extends string>({
  options,
  value,
  onSelect,
}: {
  options: { key: T; label: string }[]
  value: T
  onSelect: (key: T) => void
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => (
        <button
          key={opt.key}
          type="button"
          onClick={() => onSelect(opt.key)}
          className={cn(
            'rounded-full px-4 py-2 text-sm font-medium transition-colors',
            value === opt.key ? 'bg-olive text-white' : 'border border-line bg-white text-ink hover:bg-beige',
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}

function StackedOptionList<T extends string>({
  options,
  value,
  onSelect,
}: {
  options: { key: T; label: string }[]
  value: T
  onSelect: (key: T) => void
}) {
  return (
    <div className="grid grid-cols-2 gap-2">
      {options.map((opt) => (
        <button
          key={opt.key}
          type="button"
          onClick={() => onSelect(opt.key)}
          className={cn(
            'rounded-xl border px-3 py-2.5 text-sm font-medium transition-colors',
            value === opt.key ? 'border-olive bg-olive-light text-olive-dark' : 'border-line bg-white text-ink hover:bg-beige',
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}

export default function SearchPage() {
  const navigate = useNavigate()
  const { halls, loading } = useWeddingHalls()
  const { favoriteIds, toggle } = useFavorites()

  const [filters, setFilters] = useState<WeddingHallFilters>(DEFAULT_FILTERS)
  const [sort, setSort] = useState<SortOption>('recommended')

  const filtered = useMemo(() => applyFilters(halls, filters), [halls, filters])
  const sorted = useMemo(() => applySort(filtered, sort), [filtered, sort])

  const availableDistricts =
    filters.region === 'all' ? Object.values(DISTRICTS_BY_REGION).flat() : DISTRICTS_BY_REGION[filters.region]

  function setRegion(region: 'all' | RegionCode) {
    setFilters((f) => ({ ...f, region, districts: [] }))
  }

  function toggleDistrict(d: string) {
    setFilters((f) => {
      const set = new Set(f.districts)
      if (set.has(d)) set.delete(d)
      else set.add(d)
      return { ...f, districts: Array.from(set) }
    })
  }

  const activeChips: { key: string; label: string; clear: () => void }[] = []
  if (filters.region !== 'all') {
    activeChips.push({ key: 'region', label: regionLabel(filters.region), clear: () => setRegion('all') })
  }
  filters.districts.forEach((d) => {
    activeChips.push({ key: `d-${d}`, label: d, clear: () => toggleDistrict(d) })
  })
  if (filters.mealPriceRange !== 'all') {
    activeChips.push({
      key: 'meal',
      label: `식대 ${MEAL_OPTIONS.find((o) => o.key === filters.mealPriceRange)?.label}`,
      clear: () => setFilters((f) => ({ ...f, mealPriceRange: 'all' })),
    })
  }
  if (filters.rentalFeeRange !== 'all') {
    activeChips.push({
      key: 'rental',
      label: `대관료 ${RENTAL_OPTIONS.find((o) => o.key === filters.rentalFeeRange)?.label}`,
      clear: () => setFilters((f) => ({ ...f, rentalFeeRange: 'all' })),
    })
  }
  if (filters.guestRange !== 'all') {
    activeChips.push({
      key: 'guest',
      label: GUEST_OPTIONS.find((o) => o.key === filters.guestRange)?.label ?? '',
      clear: () => setFilters((f) => ({ ...f, guestRange: 'all' })),
    })
  }
  if (filters.ceremonyType !== 'all') {
    activeChips.push({
      key: 'ceremony',
      label: filters.ceremonyType,
      clear: () => setFilters((f) => ({ ...f, ceremonyType: 'all' })),
    })
  }

  function scrollToResults() {
    document.getElementById('search-results')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-beige">
      <div className="flex shrink-0 items-center gap-3 border-b border-line bg-white px-4 py-3">
        <button type="button" onClick={() => navigate(-1)} aria-label="뒤로 가기" className="text-ink">
          <ArrowLeft size={22} />
        </button>
        <h1 className="text-base font-semibold text-ink">검색</h1>
      </div>

      <div className="flex-1 overflow-y-auto pb-28">
        <div className="space-y-6 p-4">
          <SearchBar value={filters.keyword} onChange={(keyword) => setFilters((f) => ({ ...f, keyword }))} />

          <div>
            <SectionTitle>지역</SectionTitle>
            <ChipRow options={REGIONS} value={filters.region} onSelect={setRegion} />
            {filters.region !== 'all' && (
              <div className="mt-3 flex flex-wrap gap-2">
                {availableDistricts.map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => toggleDistrict(d)}
                    className={cn(
                      'rounded-full border px-3.5 py-1.5 text-sm transition-colors',
                      filters.districts.includes(d)
                        ? 'border-olive bg-olive-light text-olive-dark font-medium'
                        : 'border-line bg-white text-ink hover:bg-beige',
                    )}
                  >
                    {d}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div>
            <SectionTitle>식대</SectionTitle>
            <StackedOptionList
              options={MEAL_OPTIONS}
              value={filters.mealPriceRange}
              onSelect={(key) => setFilters((f) => ({ ...f, mealPriceRange: key }))}
            />
          </div>

          <div>
            <SectionTitle>대관료</SectionTitle>
            <StackedOptionList
              options={RENTAL_OPTIONS}
              value={filters.rentalFeeRange}
              onSelect={(key) => setFilters((f) => ({ ...f, rentalFeeRange: key }))}
            />
          </div>

          <div>
            <SectionTitle>최소 보증 인원</SectionTitle>
            <StackedOptionList
              options={GUEST_OPTIONS}
              value={filters.guestRange}
              onSelect={(key) => setFilters((f) => ({ ...f, guestRange: key }))}
            />
          </div>

          <div>
            <SectionTitle>예식 형태</SectionTitle>
            <ChipRow
              options={CEREMONY_OPTIONS as { key: CeremonyFilterValue; label: string }[]}
              value={filters.ceremonyType}
              onSelect={(key) => setFilters((f) => ({ ...f, ceremonyType: key }))}
            />
          </div>

          <div>
            <SectionTitle>정렬</SectionTitle>
            <ChipRow options={SORT_OPTIONS} value={sort} onSelect={setSort} />
          </div>

          <div id="search-results" className="border-t border-line pt-5">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-sm text-subtext">
                검색 결과 <strong className="text-ink">{sorted.length}</strong>개
              </p>
            </div>

            {activeChips.length > 0 && (
              <div className="mb-3 flex flex-wrap gap-1.5">
                {activeChips.map((chip) => (
                  <button
                    key={chip.key}
                    type="button"
                    onClick={chip.clear}
                    className="flex items-center gap-1 rounded-full bg-olive-light px-3 py-1 text-xs font-medium text-olive-dark"
                  >
                    {chip.label}
                    <X size={12} />
                  </button>
                ))}
              </div>
            )}

            {loading ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="h-64 animate-pulse rounded-xl2 bg-line/60" />
                ))}
              </div>
            ) : sorted.length === 0 ? (
              <EmptyState title="검색 결과가 없습니다." description="다른 조건으로 검색해보세요." />
            ) : (
              <div className="space-y-3">
                {sorted.map((hall) => (
                  <WeddingCard
                    key={hall.id}
                    hall={hall}
                    favorite={favoriteIds.has(hall.id)}
                    onSelect={(h) => navigate(`/wedding/${h.id}`)}
                    onToggleFavorite={toggle}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="fixed inset-x-0 bottom-16 z-20 border-t border-line bg-white p-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] md:hidden">
        <button
          type="button"
          onClick={scrollToResults}
          className="w-full rounded-full bg-olive py-3 text-sm font-semibold text-white transition hover:bg-olive-dark"
        >
          검색하기
        </button>
      </div>

      <MobileNav />
    </div>
  )
}
