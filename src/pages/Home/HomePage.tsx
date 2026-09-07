import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { List, X } from 'lucide-react'
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
import { cn } from '@/utils/cn'

// 홈 = 지도 + 웨딩홀 리스트만. 검색창/지역 퀵필터는 하단 '검색' 탭 전용 화면
// (SearchPage)으로 옮겼다 - 모바일 스펙 3번 "홈에는 검색/필터를 두지 않는다".
//
// 모바일에서는 지도가 화면 대부분을 차지하고, 목록은 기본적으로 숨겨져
// 있다가 "리스트로 보기" 버튼을 누르면 하단에서 위로 슬라이딩되는 시트로
// 열린다 (지도가 리스트에 절반 가려지던 문제 개선).
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
  // Mobile only: whether the slide-up list sheet is open.
  const [listOpen, setListOpen] = useState(false)

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

  function selectHallFromList(hall: WeddingHall) {
    setListOpen(false)
    selectHall(hall)
  }

  function openList() {
    setPreviewHall(null)
    setListOpen(true)
  }

  function closeDetail() {
    navigate('/')
  }

  useEffect(() => {
    // opening the full detail screen (list click, or the map overlay's own
    // "상세보기" button) always supersedes the marker preview sheet / list sheet
    if (selectedId) {
      setPreviewHall(null)
      setListOpen(false)
    }
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
        {/* Desktop-only sidebar: search bar + filter bar + list, always visible.
            Mobile no longer shows this inline - the map takes the full screen
            instead and the list lives in the slide-up sheet below. */}
        <div className="order-2 hidden flex-col overflow-hidden bg-beige md:order-1 md:flex md:w-[420px] md:flex-none md:border-r md:border-line">
          <div className="space-y-3 border-b border-line bg-white px-4 py-4">
            <SearchBar value={filters.keyword} onChange={(keyword) => setFilters((f) => ({ ...f, keyword }))} />
            <FilterBar
              filters={filters}
              sort={sort}
              onChange={setFilters}
              onSortChange={setSort}
              resultCount={sorted.length}
            />
          </div>

          <div className="flex-1 overflow-y-auto">
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

        {/* Map column: desktop = right side (flex-1); mobile = the entire screen */}
        <div className="relative order-1 flex-1 md:order-2">
          <KakaoMap
            halls={sorted}
            selectedId={mapActiveId}
            onMarkerClick={(hall) => setPreviewHall(hall)}
            onViewDetail={selectHall}
          />

          {/* Mobile-only banners (desktop shows these in the sidebar above) */}
          <div className="absolute inset-x-3 top-3 z-20 space-y-2 md:hidden">
            {!isKakaoConfigured && !dismissedInfoBanner && (
              <ErrorBanner
                variant="warning"
                message="카카오맵 API Key가 설정되지 않아 지도가 비활성화되어 있습니다. Mock 데이터로 목록/필터 기능은 정상 작동합니다."
                onDismiss={() => setDismissedInfoBanner(true)}
              />
            )}
            {error && <ErrorBanner message={error.userMessage} />}
          </div>

          {previewHall && !listOpen && (
            <MapPreviewSheet
              hall={previewHall}
              onClose={() => setPreviewHall(null)}
              onViewDetail={() => selectHall(previewHall)}
            />
          )}

          {/* Mobile-only: floating button that opens the slide-up list sheet */}
          {!previewHall && !listOpen && (
            <button
              type="button"
              onClick={openList}
              className="fixed inset-x-6 z-30 flex items-center justify-center gap-2 rounded-full bg-ink py-3 text-sm font-semibold text-white shadow-popover md:hidden"
              style={{ bottom: 'calc(4rem + 0.75rem + env(safe-area-inset-bottom))' }}
            >
              <List size={16} /> 리스트로 보기 ({sorted.length})
            </button>
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

      {/* Mobile-only: slide-up list sheet, toggled by the "리스트로 보기" button */}
      <div
        className={cn(
          'fixed inset-x-0 bottom-0 z-50 flex max-h-[82vh] flex-col rounded-t-2xl bg-white shadow-popover transition-transform duration-300 ease-out md:hidden',
          listOpen ? 'translate-y-0' : 'translate-y-full',
        )}
        aria-hidden={!listOpen}
      >
        <div className="flex shrink-0 flex-col items-center gap-2 border-b border-line px-4 pb-3 pt-2.5">
          <span className="h-1 w-10 rounded-full bg-line" />
          <div className="flex w-full items-center justify-between">
            <p className="text-sm text-subtext">
              주변 웨딩홀 <strong className="text-ink">{sorted.length}</strong>개
            </p>
            <button
              type="button"
              onClick={() => setListOpen(false)}
              aria-label="목록 닫기"
              className="flex h-8 w-8 items-center justify-center text-subtext"
            >
              <X size={18} />
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto pb-[env(safe-area-inset-bottom)]">
          <WeddingList
            halls={sorted}
            selectedId={selectedId}
            favoriteIds={favoriteIds}
            onSelect={selectHallFromList}
            onToggleFavorite={toggle}
            loading={loading}
          />
        </div>
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
