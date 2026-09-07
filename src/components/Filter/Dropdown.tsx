import { useEffect, useRef, useState, type ReactNode } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/utils/cn'

interface DropdownProps {
  label: string
  active?: boolean
  children: (close: () => void) => ReactNode
  panelClassName?: string
}

export default function Dropdown({ label, active, children, panelClassName }: DropdownProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={cn(
          'flex items-center gap-1 whitespace-nowrap rounded-full border px-3.5 py-2 text-sm transition-colors',
          active ? 'border-olive bg-olive-light text-olive-dark font-medium' : 'border-line bg-white text-ink hover:bg-beige',
        )}
      >
        {label}
        <ChevronDown size={14} className={cn('transition-transform', open && 'rotate-180')} />
      </button>
      {open && (
        <div
          className={cn(
            'absolute left-0 top-[calc(100%+8px)] z-40 min-w-[220px] rounded-xl2 border border-line bg-white p-4 shadow-popover',
            panelClassName,
          )}
        >
          {children(() => setOpen(false))}
        </div>
      )}
    </div>
  )
}
