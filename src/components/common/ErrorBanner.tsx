import { AlertTriangle, X } from 'lucide-react'

interface ErrorBannerProps {
  message: string
  onDismiss?: () => void
  variant?: 'warning' | 'error'
}

export default function ErrorBanner({ message, onDismiss, variant = 'error' }: ErrorBannerProps) {
  return (
    <div
      className={`flex items-start gap-2 rounded-xl border px-4 py-3 text-sm ${
        variant === 'error'
          ? 'border-red-200 bg-red-50 text-red-700'
          : 'border-amber-200 bg-amber-50 text-amber-800'
      }`}
      role="alert"
    >
      <AlertTriangle size={16} className="mt-0.5 shrink-0" />
      <p className="flex-1">{message}</p>
      {onDismiss && (
        <button type="button" onClick={onDismiss} aria-label="알림 닫기" className="shrink-0">
          <X size={16} />
        </button>
      )}
    </div>
  )
}
