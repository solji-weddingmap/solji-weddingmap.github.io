import { NavLink } from 'react-router-dom'
import { Home, Map, Search, Heart, User } from 'lucide-react'
import { cn } from '@/utils/cn'

const items = [
  { to: '/', icon: Home, label: '홈', end: true },
  { to: '/', icon: Map, label: '지도', end: true },
  { to: '/', icon: Search, label: '검색', end: true },
  { to: '/', icon: Heart, label: '찜', end: true },
  { to: '/admin', icon: User, label: '마이', end: false },
]

export default function MobileNav() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 flex h-16 border-t border-line bg-white md:hidden">
      {items.map(({ to, icon: Icon, label, end }, i) => (
        <NavLink
          key={`${to}-${i}`}
          to={to}
          end={end}
          className={({ isActive }) =>
            cn(
              'flex flex-1 flex-col items-center justify-center gap-0.5 text-[11px]',
              isActive ? 'text-olive' : 'text-subtext',
            )
          }
        >
          <Icon size={20} strokeWidth={1.75} />
          {label}
        </NavLink>
      ))}
    </nav>
  )
}
