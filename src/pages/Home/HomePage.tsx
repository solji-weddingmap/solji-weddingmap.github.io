import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Header from '@/components/Header/Header'
import SearchBar from '@/components/SearchBar/SearchBar'
import FilterBar from '@/components/Filter/FilterBar'
import WeddingList from '@/components/WeddingList/WeddingList'
import KakaoMap from '@/components/KakaoMap/KakaoMap'
import MapPreviewSheet from '@/components/KakaoMap/MapPreviewSheet'
import WeddingDetailPanel from '@/components/WeddingDetail/WeddingDetailPanel'
import MobileNav from '@/components/common/MobileNav'
import ErrorBanner from '@/components/common/ErrorBanner'
import { useWeddingHalls } from '@/hooks/useWeddingHalls'
import { useFavorites } from '@/hooks/useFavorites'
import { DEFAULT_FILTERS, type SortOption, type WeddingHall, type WeddingHallFilters } from '@/types/weddingHall'
import { applyFilters, applySort } from '@/utils/filterSort'
import { isKakaoConfigured } from '@/lib/kakao'

// 홈 = 지도 + 웨딩홀 리스트만. 검색창/지역 퀵필터는 하단 '검색' 탭 전용 화면
// (SearchPage)으로 옮겼다 - 모바일 스펙 3번 "홈에는 검색/필터를 두지 않는다".
export default function HomePage() {
  const navigate = useNavigate()
  const params = useParams<{ id?: string }>()
  const { halls, loading, error, refetch } = useWeddingHalls()
  const { favoriteIds, toggle } = useFavorites()

  const [filters, setFilters] = useState<WeddingHallFilters>(DEFAULT_FILTERS)
  const [sort, setSort] = useState<SortOption>('recommended')
  const [dismissedInfoBanner, setDismissedInfoBanner] = useState(false)
  // Mobile only: the hall a map marker was tapped for (mini preview sheet),
  // distinct from `selectedId` (route-driven, opens the FULL detail screen).
  const [previewHall, setPreviewHall] = useState<WeddingHall | null>(null)

  const selectedId = params.id ?? null

  const filtered = useMemo(() => applyFilters(halls, filters), [halls, filters])
  const sorted = useMemo(() => applySort(filtered, sort), [filtered, sort])

  const selectedHall: WeddingHall | undefined = useMemo(
    () => halls.find((h) => h.id === selectedId),
    [halls, selectedId],
  )

  // The map highlights/pans to whichever hall is currently "active": a full
  // detail selection takes priority, otherwise a marker-tap preview.
  const mapActiveId = selectedId ?? previewHall?.id ?? null

  function selectHall(hall: WeddingHall) {
    setPreviewHall(null)
    navigate(`/wedding/${hall.id}`)
  }

  function closeDetail() {
    navigate('/')
  }

  useEffect(() => {
    // opening the full detail screen (list click, or the map overlay's own
    // "상세보기" button) always supersedes the marker preview sheet
    if (selectedId) setPreviewHall(null)
  }, [selectedId])

  useEffect(() => {
    // if the deep-linked hall no longer exists (e.g. deleted), fall back to list
    if (selectedId && !loading && halls.length > 0 && !selectedHall) {
      navigate('/', { replace: true })
    }
  }, [selectedId, loading, halls.length, selectedHall, navigate])

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-beige">
      <Header />

      <div className="flex flex-1 flex-col overflow-hidden md:flex-row">
        {/* List column: desktop = fixed-width sidebar; mobile = section below the map */}
        <div className="order-2 flex flex-1 flex-col overflow-hidden bg-beige md:order-1 md:w-[420px] md:flex-none md:border-r md:border-line">
          {/* Desktop-only: search bar + full filter bar live here */}
          <div className="hidden space-y-3 border-b border-line bg-white px-4 py-4 md:block">
            <SearchBar value={filters.keyword} onChange={(keyword) => setFilters((f) => ({ ...f, keyword }))} />
            <FilterBar
              filters={filters}
              sort={sort}
              onChange={setFilters}
              onSortChange={setSort}
              resultCount={sorted.length}
            />
          </div>
          {/* Mobile-only: just a result count, no search/filter (spec #3) */}
          <div className="border-b border-line bg-white px-4 py-3 text-sm text-subtext md:hidden">
            주변 웨딩홀 <strong className="text-ink">{sorted.length}</strong>개
          </div>

          <div className="flex-1 overflow-y-auto pb-20 md:pb-0">
            {!isKakaoConfigured && !dismissedInfoBanner && (
              <div className="px-4 pt-4">
                <ErrorBanner
                  variant="warning"
                  message="카카오맵 API Key가 설정되지 않아 지도가 비활성화되어 있습니다. Mock 데이터로 목록/필터 기능은 정상 작동합니다."
                  onDismiss={() => setDismissedInfoBanner(true)}
                />
              </div>
            )}
            {error && (
              <div className="px-4 pt-4">
                <ErrorBanner message={error.userMessage} />
              </div>
            )}
            <WeddingList
              halls={sorted}
              selectedId={selectedId}
              favoriteIds={favoriteIds}
              onSelect={selectHall}
              onToggleFavorite={toggle}
              loading={loading}
            />
          </div>
        </div>

        {/* Map column: desktop = right side (flex-1); mobile = fixed-height band on top */}
        <div className="relative order-1 h-[38vh] shrink-0 md:order-2 md:h-auto md:flex-1">
          <KakaoMap
            halls={sorted}
            selectedId={mapActiveId}
            onMarkerClick={(hall) => setPreviewHall(hall)}
            onViewDetail={selectHall}
          />

          {previewHall && (
            <MapPreviewSheet
              hall={previewHall}
              onClose={() => setPreviewHall(null)}
              onViewDetail={() => selectHall(previewHall)}
            />
          )}
        </div>

        {/* Desktop: detail slide-over */}
        {selectedHall && (
          <div className="order-3 hidden w-[420px] shrink-0 border-l border-line md:block">
            <WeddingDetailPanel
              hall={selectedHall}
              favorite={favoriteIds.has(selectedHall.id)}
              onToggleFavorite={toggle}
              onClose={closeDetail}
              onDeleted={() => {
                closeDetail()
                refetch()
              }}
              onShowOnMap={() => {
                /* map already centers on selection via selectedId sync */
              }}
            />
          </div>
        )}
      </div>

      {/* Mobile: full-screen detail overlay */}
      {selectedHall && (
        <div className="fixed inset-0 z-30 md:hidden">
          <WeddingDetailPanel
            hall={selectedHall}
            favorite={favoriteIds.has(selectedHall.id)}
            onToggleFavorite={toggle}
            onClose={closeDetail}
            onDeleted={() => {
              closeDetail()
              refetch()
            }}
            onShowOnMap={closeDetail}
          />
        </div>
      )}

      {/* Full-screen mobile detail is a stacked page (its own back/close
          button), so the main tab bar hides while it's open - matching the
          detail mockup, which has no bottom nav. */}
      {!selectedHall && <MobileNav />}
    </div>
  )
}
