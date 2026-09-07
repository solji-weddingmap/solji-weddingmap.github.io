import { Link } from 'react-router-dom'
import { Heart, Settings, UserRound } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'

export default function Header() {
  const { user, profile, isLoggedIn, isAdmin, authAvailable } = useAuth()
  // mock 모드(Supabase 미설정, 로컬 개발/데모)에서는 기존처럼 관리 메뉴를 계속 보여준다.
  const canManage = !authAvailable || isAdmin

  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-line bg-white px-4 md:px-6">
      <Link to="/" className="flex items-center gap-2">
        {/* 파비콘과 동일한 하트 핀 마크 - 로고 텍스트 앞에 브랜드 아이콘으로 노출 */}
        <svg width="28" height="28" viewBox="0 0 100 100" className="shrink-0" aria-hidden="true">
          <rect width="100" height="100" rx="22" fill="#5F7058" />
          <path
            d="M50 18c-11.6 0-21 9.3-21 20.8 0 15.6 21 41.2 21 41.2s21-25.6 21-41.2C71 27.3 61.6 18 50 18z"
            fill="#FFFFFF"
          />
          <path
            d="M50 32.5c3.6-4 9.7-4 12.6-0.4 2.6 3.3 2.1 8-1.1 11l-11.5 10.6-11.5-10.6c-3.2-3-3.7-7.7-1.1-11 2.9-3.6 9-3.6 12.6.4z"
            fill="#5F7058"
          />
        </svg>
        <span className="flex items-baseline gap-2">
          <span className="text-lg font-bold tracking-tight text-ink">WEDDING MAP</span>
          <span className="hidden text-xs text-subtext md:inline">Find Your Perfect Wedding Hall</span>
        </span>
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
