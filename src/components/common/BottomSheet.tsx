import { type ReactNode } from 'react'
import { cn } from '@/utils/cn'

interface BottomSheetProps {
  expanded: boolean
  onToggle: () => void
  children: ReactNode
  peekHeight?: number
}

// Simple tap-to-expand bottom sheet for mobile (map on top, list slides up).
// Avoids adding a drag-gesture library per spec's "불필요하게 많은 라이브러리" guidance.
export default function BottomSheet({ expanded, onToggle, children, peekHeight = 96 }: BottomSheetProps) {
  return (
    <div
      className={cn(
        'fixed inset-x-0 bottom-16 z-20 flex flex-col rounded-t-2xl border-t border-line bg-white shadow-popover transition-[height] duration-300 ease-out md:hidden',
      )}
      style={{ height: expanded ? 'calc(100% - 8rem)' : `${peekHeight}px` }}
    >
      <button
        type="button"
        onClick={onToggle}
        className="flex shrink-0 flex-col items-center gap-1.5 pt-2.5 pb-1"
        aria-label={expanded ? '목록 접기' : '목록 펼치기'}
      >
        <span className="h-1 w-10 rounded-full bg-line" />
      </button>
      <div className="flex-1 overflow-y-auto overscroll-contain">{children}</div>
    </div>
  )
}
