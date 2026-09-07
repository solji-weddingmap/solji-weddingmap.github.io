import { Link } from 'react-router-dom'
import { Heart, Settings, UserRound } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'

export default function Header() {
  const { user, profile, isLoggedIn, isAdmin, authAvailable } = useAuth()
  // mock 모드(Supabase 미설정, 로컬 개발/데모)에서는 기존처럼 관리 메뉴를 계속 보여준다.
  const canManage = !authAvailable || isAdmin

  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-line bg-white px-4 md:px-6">
      <Link to="/" className="flex items-baseline gap-2">
        <span className="text-lg font-bold tracking-tight text-ink">WEDDING MAP</span>
        <span className="hidden text-xs text-subtext md:inline">Find Your Perfect Wedding Hall</span>
      </Link>

      <nav className="flex items-center gap-2 md:gap-3">
        {/* 웨딩홀 등록/수정/삭제는 관리자만 가능 - 일반 사용자에게는 진입점 자체를 숨김 */}
        {canManage && (
          <Link
            to="/admin"
            className="hidden items-center gap-1.5 rounded-full px-3 py-2 text-sm text-subtext hover:bg-beige md:flex"
          >
            <Settings size={16} />
            관리자
          </Link>
        )}
        {/* Desktop: header shortcut. Mobile: the bottom nav's 찜 tab covers this,
            so only a compact icon-only link is kept here (spec home mockup). */}
        <Link
          to="/favorites"
          className="hidden items-center gap-1.5 rounded-full px-3 py-2 text-sm text-subtext hover:bg-beige md:flex"
          aria-label="즐겨찾기"
        >
          <Heart size={16} />
        </Link>
        <Link to="/favorites" className="flex items-center justify-center p-2 text-ink md:hidden" aria-label="찜한 웨딩홀">
          <Heart size={20} strokeWidth={1.75} />
        </Link>
        {/* Desktop: 마이/로그인 진입점 - 모바일에서는 하단 탭의 '마이'가 이 역할을 함 */}
        {isLoggedIn ? (
          <Link
            to="/my"
            className="hidden items-center gap-1.5 rounded-full px-2 py-1.5 text-sm text-ink hover:bg-beige md:flex"
          >
            <span className="flex h-6 w-6 items-center justify-center overflow-hidden rounded-full bg-olive-light">
              {profile?.avatarUrl ? (
                <img src={profile.avatarUrl} alt="" className="h-full w-full object-cover" />
              ) : (
                <UserRound size={13} className="text-olive-dark" strokeWidth={2} />
              )}
            </span>
            <span className="max-w-[96px] truncate">{profile?.nickname || user?.email}</span>
          </Link>
        ) : (
          authAvailable && (
            <Link
              to="/login"
              className="hidden items-center gap-1.5 rounded-full px-3 py-2 text-sm text-subtext hover:bg-beige md:flex"
            >
              <UserRound size={16} />
              로그인
            </Link>
          )
        )}
        {canManage && (
          <Link
            to="/register"
            className="hidden rounded-full bg-olive px-4 py-2 text-sm font-medium text-white shadow-card transition hover:bg-olive-dark md:inline-flex"
          >
            + 웨딩홀 등록
          </Link>
        )}
      </nav>
    </header>
  )
}
