import { cn } from '@/lib/utils'

const styles: Record<string, string> = {
  planned: 'bg-secondary/30 text-text',
  confirmed: 'bg-accent/30 text-text',
  completed: 'bg-green-500/15 text-green-600 dark:text-green-400',
  cancelled: 'bg-red-500/10 text-red-500',
}

const labels: Record<string, string> = {
  planned: 'Direncanakan',
  confirmed: 'Terkonfirmasi',
  completed: 'Selesai',
  cancelled: 'Dibatalkan',
}

export function StatusPill({ status }: { status: string }) {
  return (
    <span
      className={cn(
        'rounded-full px-2.5 py-1 text-xs font-medium capitalize',
        styles[status] ?? 'bg-secondary/30 text-text',
      )}
    >
      {labels[status] ?? status}
    </span>
  )
}
