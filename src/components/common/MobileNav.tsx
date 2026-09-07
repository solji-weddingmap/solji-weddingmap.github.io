import { NavLink } from 'react-router-dom'
import { Home, Search, Plus, Heart, User } from 'lucide-react'
import { cn } from '@/utils/cn'

// Mobile-only bottom tab bar: 홈 / 검색 / 등록 / 찜 / 마이. The center "등록"
// tab is visually emphasized (raised olive pill) since registering a hall is
// the app's main secondary action, distinct from simple navigation.
const items = [
  { to: '/', icon: Home, label: '홈', end: true },
  { to: '/search', icon: Search, label: '검색', end: true },
  { to: '/register', icon: Plus, label: '등록', end: true, emphasized: true },
  { to: '/favorites', icon: Heart, label: '찜', end: true },
  { to: '/my', icon: User, label: '마이', end: true },
] as const

export default function MobileNav() {
  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 flex h-16 border-t border-line bg-white pb-[env(safe-area-inset-bottom)] md:hidden"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      {items.map(({ to, icon: Icon, label, end, ...rest }) => {
        const emphasized = 'emphasized' in rest && rest.emphasized
        return (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              cn(
                'flex flex-1 flex-col items-center justify-center gap-1 text-[11px] transition-colors',
                isActive && !emphasized ? 'text-olive font-medium' : 'text-subtext',
              )
            }
          >
            {({ isActive }) =>
              emphasized ? (
                <>
                  <span
                    className={cn(
                      '-mt-6 flex h-12 w-12 items-center justify-center rounded-full shadow-popover transition-colors',
                      isActive ? 'bg-olive-dark' : 'bg-olive',
                    )}
                  >
                    <Icon size={22} strokeWidth={2} className="text-white" />
                  </span>
                  <span className={isActive ? 'font-medium text-olive' : 'text-subtext'}>{label}</span>
                </>
              ) : (
                <>
                  <Icon size={21} strokeWidth={1.75} />
                  {label}
                </>
              )
            }
          </NavLink>
        )
      })}
    </nav>
  )
}
