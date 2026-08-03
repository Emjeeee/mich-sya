import { Link } from 'react-router-dom'
import { Card } from '@/components/ui/Card'
import { useSchedule } from '@/hooks/useSchedule'
import { todayDateString } from '@/lib/dates'

export function TodayCard() {
  const { data } = useSchedule()
  const today = todayDateString()

  const todayItems = (data ?? [])
    .filter((s) => s.scheduled_date === today)
    .sort((a, b) => (a.scheduled_time ?? '99:99').localeCompare(b.scheduled_time ?? '99:99'))

  const now = new Date()
  const weekdayShort = now.toLocaleDateString('id-ID', { weekday: 'short' }).toUpperCase()
  const weekdayLong = now.toLocaleDateString('id-ID', { weekday: 'long' })
  const monthLong = now.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })

  return (
    <Card className="flex h-full flex-col">
      <div className="flex gap-4">
        <div className="flex h-16 w-16 shrink-0 flex-col overflow-hidden rounded-xl border border-border">
          <div className="bg-primary py-1 text-center text-[10px] font-semibold tracking-wide text-white">
            {weekdayShort}
          </div>
          <div className="flex flex-1 items-center justify-center font-number text-2xl font-bold text-text">
            {now.getDate()}
          </div>
        </div>

        <div className="min-w-0 flex-1">
          <p className="font-heading text-sm font-semibold text-text">{weekdayLong}</p>
          <p className="text-xs text-muted">{monthLong}</p>
        </div>
      </div>

      <div className="mt-3 flex-1">
        {todayItems.length === 0 ? (
          <p className="text-sm text-muted">Tidak ada jadwal hari ini.</p>
        ) : (
          <ul className="space-y-1.5">
            {todayItems.slice(0, 3).map((item) => (
              <li key={item.id} className="flex items-center gap-2 text-sm">
                <span className="w-10 shrink-0 text-xs text-muted">
                  {item.scheduled_time ? item.scheduled_time.slice(0, 5) : '—'}
                </span>
                <span className="truncate text-text">{item.title}</span>
              </li>
            ))}
            {todayItems.length > 3 && (
              <li className="text-xs text-muted">+{todayItems.length - 3} jadwal lagi</li>
            )}
          </ul>
        )}
      </div>

      <Link
        to="/app/schedule"
        className="mt-3 inline-block text-xs font-semibold text-primary hover:underline"
      >
        Lihat kalender
      </Link>
    </Card>
  )
}
