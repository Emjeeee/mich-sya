import { Card, CardHeader } from '@/components/ui/Card'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { daysBetween, nextAnniversaryDate, previousAnniversaryDate, todayDateString } from '@/lib/dates'

export function AnniversaryCard({ anniversaryDate }: { anniversaryDate: string | null }) {
  if (!anniversaryDate) {
    return (
      <Card>
        <CardHeader title="Anniversary Berikutnya" />
        <p className="text-sm text-muted">Belum ada tanggal jadian tersimpan.</p>
      </Card>
    )
  }

  const today = todayDateString()
  const next = nextAnniversaryDate(anniversaryDate)
  const prev = previousAnniversaryDate(anniversaryDate)
  const totalSpan = Math.max(1, daysBetween(prev, next))
  const elapsed = Math.max(0, daysBetween(prev, today))
  const progress = Math.min(100, (elapsed / totalSpan) * 100)
  const daysLeft = daysBetween(today, next)

  const formatted = new Date(next + 'T00:00:00').toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  return (
    <Card>
      <CardHeader title="Anniversary Berikutnya" />
      <p className="font-heading text-lg font-semibold text-text">{formatted}</p>
      <div className="mt-4">
        <ProgressBar value={progress} />
        <div className="mt-2 flex items-center justify-between text-xs text-muted">
          <span>{Math.round(progress)}%</span>
          <span>{daysLeft} hari lagi</span>
        </div>
      </div>
    </Card>
  )
}
