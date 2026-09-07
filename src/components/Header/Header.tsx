import { Link } from 'react-router-dom'
import { Heart, MapPin, Settings } from 'lucide-react'

export default function Header() {
  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-line bg-white px-4 md:px-6">
      <Link to="/" className="flex items-baseline gap-2">
        <span className="text-lg font-bold tracking-tight text-ink">WEDDING MAP</span>
        <span className="hidden text-xs text-subtext md:inline">Find Your Perfect Wedding Hall</span>
      </Link>

      <nav className="flex items-center gap-2 md:gap-3">
        <Link
          to="/admin"
          className="hidden items-center gap-1.5 rounded-full px-3 py-2 text-sm text-subtext hover:bg-beige md:flex"
        >
          <Settings size={16} />
          관리자
        </Link>
        <Link
          to="/"
          className="hidden items-center gap-1.5 rounded-full px-3 py-2 text-sm text-subtext hover:bg-beige md:flex"
        >
          <MapPin size={16} />
          웨딩홀 찾기
        </Link>
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
        <Link
          to="/register"
          className="hidden rounded-full bg-olive px-4 py-2 text-sm font-medium text-white shadow-card transition hover:bg-olive-dark md:inline-flex"
        >
          + 웨딩홀 등록
        </Link>
      </nav>
    </header>
  )
}
