import { SearchX } from 'lucide-react'

interface EmptyStateProps {
  title: string
  description?: string
}

export default function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 px-6 py-16 text-center">
      <SearchX size={32} className="text-subtext" strokeWidth={1.5} />
      <p className="font-medium text-ink">{title}</p>
      {description && <p className="text-sm text-subtext">{description}</p>}
    </div>
  )
}
