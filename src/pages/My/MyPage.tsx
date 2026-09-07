import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Clock,
  Heart,
  ClipboardList,
  Pencil,
  Bell,
  Shield,
  Headset,
  ChevronRight,
  ImageOff,
  MapPinned,
} from 'lucide-react'
import Header from '@/components/Header/Header'
import MobileNav from '@/components/common/MobileNav'
import { useWeddingHalls } from '@/hooks/useWeddingHalls'
import { useFavorites } from '@/hooks/useFavorites'
import { getRecentlyViewedIds } from '@/services/viewHistoryService'
import { getMyRegisteredHallIds } from '@/services/myRegisteredHallsService'
import type { WeddingHall } from '@/types/weddingHall'
import { regionLabel } from '@/utils/regions'
import { cn } from '@/utils/cn'

// 마이 탭 전용 화면 (spec #7). 로그인/계정 시스템이 아직 없어서 (README
// Future Features 참고) "최근 본"/"내가 등록한" 데이터는 이 브라우저에만
// 저장되는 localStorage 기반 기록이다 - 다른 기기에서는 보이지 않는다.

function MiniHallRow({ hall, onClick }: { hall: WeddingHall; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-3 rounded-xl px-2 py-2 text-left transition-colors hover:bg-beige"
    >
      <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-line">
        {hall.mainImage ? (
          <img src={hall.mainImage} alt={hall.name} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-subtext">
            <ImageOff size={16} strokeWidth={1.5} />
          </div>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-ink">{hall.name}</p>
        <p className="truncate text-xs text-subtext">
          {regionLabel(hall.region)} {hall.district}
        </p>
      </div>
      <ChevronRight size={16} className="shrink-0 text-subtext" />
    </button>
  )
}

function ExpandableRow({
  icon: Icon,
  label,
  count,
  expanded,
  onToggle,
  children,
}: {
  icon: typeof Clock
  label: string
  count: number
  expanded: boolean
  onToggle: () => void
  children: React.ReactNode
}) {
  return (
    <div>
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center gap-3 px-4 py-3.5 text-left"
      >
        <Icon size={19} className="shrink-0 text-olive" strokeWidth={1.75} />
        <span className="flex-1 text-sm font-medium text-ink">{label}</span>
        <span className="text-xs text-subtext">{count}개</span>
        <ChevronRight size={16} className={cn('shrink-0 text-subtext transition-transform', expanded && 'rotate-90')} />
      </button>
      {expanded && <div className="space-y-1 px-2 pb-3">{children}</div>}
    </div>
  )
}

function SettingsRow({ icon: Icon, label }: { icon: typeof Bell; label: string }) {
  const [showNotice, setShowNotice] = useState(false)
  return (
    <div>
      <button
        type="button"
        onClick={() => setShowNotice((v) => !v)}
        className="flex w-full items-center gap-3 px-4 py-3.5 text-left"
      >
        <Icon size={19} className="shrink-0 text-subtext" strokeWidth={1.75} />
        <span className="flex-1 text-sm text-ink">{label}</span>
        <ChevronRight size={16} className="shrink-0 text-subtext" />
      </button>
      {showNotice && <p className="px-4 pb-3 text-xs text-subtext">곧 제공될 기능입니다.</p>}
    </div>
  )
}

export default function MyPage() {
  const navigate = useNavigate()
  const { halls } = useWeddingHalls()
  const { favoriteIds } = useFavorites()

  const [openSection, setOpenSection] = useState<'recent' | 'mine' | null>(null)

  const recentHalls = useMemo(() => {
    const ids = getRecentlyViewedIds()
    return ids.map((id) => halls.find((h) => h.id === id)).filter((h): h is WeddingHall => Boolean(h))
  }, [halls])

  const myHalls = useMemo(() => {
    const ids = new Set(getMyRegisteredHallIds())
    return halls.filter((h) => ids.has(h.id))
  }, [halls])

  const favoriteCount = useMemo(() => halls.filter((h) => favoriteIds.has(h.id)).length, [halls, favoriteIds])

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-beige">
      <Header />

      <div className="mx-auto w-full max-w-2xl flex-1 overflow-y-auto pb-24">
        <div className="flex items-center gap-3 px-4 pt-6">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-olive-light">
            <MapPinned size={24} className="text-olive-dark" strokeWidth={1.75} />
          </div>
          <div>
            <p className="text-lg font-bold text-ink">웨딩플래너</p>
            <p className="text-sm text-subtext">행복한 결혼 준비 되세요!</p>
          </div>
        </div>

        <div className="mt-6 px-4">
          <p className="mb-2 px-1 text-xs font-semibold text-subtext">내 웨딩홀</p>
          <div className="rounded-2xl border border-line bg-white shadow-card">
            <ExpandableRow
              icon={Clock}
              label="최근 본 웨딩홀"
              count={recentHalls.length}
              expanded={openSection === 'recent'}
              onToggle={() => setOpenSection((s) => (s === 'recent' ? null : 'recent'))}
            >
              {recentHalls.length === 0 ? (
                <p className="px-2 py-2 text-xs text-subtext">최근 본 웨딩홀이 없습니다.</p>
              ) : (
                recentHalls.map((hall) => (
                  <MiniHallRow key={hall.id} hall={hall} onClick={() => navigate(`/wedding/${hall.id}`)} />
                ))
              )}
            </ExpandableRow>
            <div className="border-t border-line" />
            <button
              type="button"
              onClick={() => navigate('/favorites')}
              className="flex w-full items-center gap-3 px-4 py-3.5 text-left"
            >
              <Heart size={19} className="shrink-0 text-olive" strokeWidth={1.75} />
              <span className="flex-1 text-sm font-medium text-ink">찜한 웨딩홀</span>
              <span className="text-xs text-subtext">{favoriteCount}개</span>
              <ChevronRight size={16} className="shrink-0 text-subtext" />
            </button>
            <div className="border-t border-line" />
            <ExpandableRow
              icon={ClipboardList}
              label="내가 등록한 웨딩홀"
              count={myHalls.length}
              expanded={openSection === 'mine'}
              onToggle={() => setOpenSection((s) => (s === 'mine' ? null : 'mine'))}
            >
              {myHalls.length === 0 ? (
                <p className="px-2 py-2 text-xs text-subtext">이 브라우저에서 등록한 웨딩홀이 없습니다.</p>
              ) : (
                myHalls.map((hall) => (
                  <MiniHallRow key={hall.id} hall={hall} onClick={() => navigate(`/wedding/${hall.id}`)} />
                ))
              )}
            </ExpandableRow>
          </div>
        </div>

        <div className="mt-6 px-4">
          <p className="mb-2 px-1 text-xs font-semibold text-subtext">관리</p>
          <div className="rounded-2xl border border-line bg-white shadow-card">
            <button
              type="button"
              onClick={() => navigate('/admin')}
              className="flex w-full items-center gap-3 px-4 py-3.5 text-left"
            >
              <ClipboardList size={19} className="shrink-0 text-subtext" strokeWidth={1.75} />
              <span className="flex-1 text-sm text-ink">웨딩홀 등록 내역</span>
              <ChevronRight size={16} className="shrink-0 text-subtext" />
            </button>
            <div className="border-t border-line" />
            <button
              type="button"
              onClick={() => navigate('/admin')}
              className="flex w-full items-center gap-3 px-4 py-3.5 text-left"
            >
              <Pencil size={19} className="shrink-0 text-subtext" strokeWidth={1.75} />
              <span className="flex-1 text-sm text-ink">등록한 웨딩홀 수정</span>
              <ChevronRight size={16} className="shrink-0 text-subtext" />
            </button>
          </div>
        </div>

        <div className="mt-6 px-4">
          <p className="mb-2 px-1 text-xs font-semibold text-subtext">설정</p>
          <div className="rounded-2xl border border-line bg-white shadow-card">
            <SettingsRow icon={Bell} label="알림 설정" />
            <div className="border-t border-line" />
            <SettingsRow icon={Shield} label="개인정보 설정" />
            <div className="border-t border-line" />
            <SettingsRow icon={Headset} label="고객센터" />
          </div>
        </div>
      </div>

      <MobileNav />
    </div>
  )
}
