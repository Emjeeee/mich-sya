import { useMemo, useState } from 'react'
import { cn } from '@/lib/utils'
import { formatLocalDate, todayDateString } from '@/lib/dates'
import { ChevronLeftIcon, ChevronRightIcon } from '@/components/ui/pixel-icons'
import type { ScheduleRow, ScheduleStatus } from '@/types'

const WEEKDAYS = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab']

const STATUS_DOT: Record<ScheduleStatus, string> = {
  planned: 'bg-secondary',
  confirmed: 'bg-accent',
  completed: 'bg-green-500',
  cancelled: 'bg-red-400',
}

function buildMonthGrid(year: number, month: number): Date[] {
  const firstOfMonth = new Date(year, month, 1)
  const gridStart = new Date(year, month, 1 - firstOfMonth.getDay())
  return Array.from({ length: 42 }, (_, i) => {
    const d = new Date(gridStart)
    d.setDate(gridStart.getDate() + i)
    return d
  })
}

export function ScheduleCalendar({
  schedules,
  onAddOnDate,
  onSelectItem,
}: {
  schedules: ScheduleRow[]
  onAddOnDate: (dateStr: string) => void
  onSelectItem: (item: ScheduleRow) => void
}) {
  const today = todayDateString()
  const [cursor, setCursor] = useState(() => {
    const [y, m] = today.split('-').map(Number)
    return { year: y, month: m - 1 }
  })

  const grid = useMemo(() => buildMonthGrid(cursor.year, cursor.month), [cursor])

  const byDate = useMemo(() => {
    const map = new Map<string, ScheduleRow[]>()
    for (const item of schedules) {
      const list = map.get(item.scheduled_date) ?? []
      list.push(item)
      map.set(item.scheduled_date, list)
    }
    return map
  }, [schedules])

  const monthLabel = new Date(cursor.year, cursor.month, 1).toLocaleDateString('id-ID', {
    month: 'long',
    year: 'numeric',
  })

  function shiftMonth(delta: number) {
    setCursor((c) => {
      const d = new Date(c.year, c.month + delta, 1)
      return { year: d.getFullYear(), month: d.getMonth() }
    })
  }

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <h3 className="font-heading text-base font-semibold capitalize text-text">{monthLabel}</h3>
        <div className="flex items-center gap-1">
          <button
            onClick={() => {
              const [y, m] = today.split('-').map(Number)
              setCursor({ year: y, month: m - 1 })
            }}
            className="mr-1 rounded-full px-3 py-1 text-xs font-medium text-primary hover:bg-primary/10"
          >
            Hari ini
          </button>
          <button
            onClick={() => shiftMonth(-1)}
            aria-label="Bulan sebelumnya"
            className="flex h-8 w-8 items-center justify-center rounded-full text-muted transition hover:bg-secondary/15 hover:text-text"
          >
            <ChevronLeftIcon className="h-4 w-4" />
          </button>
          <button
            onClick={() => shiftMonth(1)}
            aria-label="Bulan berikutnya"
            className="flex h-8 w-8 items-center justify-center rounded-full text-muted transition hover:bg-secondary/15 hover:text-text"
          >
            <ChevronRightIcon className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-semibold uppercase tracking-wide text-muted">
        {WEEKDAYS.map((w) => (
          <div key={w} className="py-1">
            {w}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {grid.map((date) => {
          const dateStr = formatLocalDate(date)
          const inMonth = date.getMonth() === cursor.month
          const isToday = dateStr === today
          const items = byDate.get(dateStr) ?? []
          const visible = items.slice(0, 2)
          const overflow = items.length - visible.length

          return (
            <button
              key={dateStr}
              onClick={() => (items.length > 0 ? onSelectItem(items[0]) : onAddOnDate(dateStr))}
              className={cn(
                'flex min-h-16 flex-col items-start gap-0.5 rounded-lg border p-1 text-left transition sm:min-h-20 sm:p-1.5',
                inMonth ? 'border-border' : 'border-transparent opacity-40',
                isToday && 'border-primary bg-primary/5',
                'hover:border-primary',
              )}
            >
              <span
                className={cn(
                  'text-xs font-medium',
                  isToday ? 'flex h-5 w-5 items-center justify-center rounded-full bg-primary text-white' : 'text-text',
                )}
              >
                {date.getDate()}
              </span>
              <div className="flex w-full flex-1 flex-col gap-0.5 overflow-hidden">
                {visible.map((item) => (
                  <span
                    key={item.id}
                    onClick={(e) => {
                      e.stopPropagation()
                      onSelectItem(item)
                    }}
                    className="flex items-center gap-1 truncate rounded px-1 py-0.5 text-[10px] font-medium text-text hover:bg-secondary/15"
                  >
                    <span className={cn('h-1.5 w-1.5 shrink-0 rounded-full', STATUS_DOT[item.status])} />
                    <span className="truncate">{item.title}</span>
                  </span>
                ))}
                {overflow > 0 && <span className="px-1 text-[10px] text-muted">+{overflow} lagi</span>}
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
