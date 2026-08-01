// Centralized date-only math. Everything here is anchored to one fixed
// IANA timezone so both partners see identical counters regardless of
// which device/timezone they're actually in.
export const APP_TIMEZONE = 'Asia/Jakarta'

/** Today's date as 'YYYY-MM-DD' in APP_TIMEZONE. */
export function todayDateString(timeZone: string = APP_TIMEZONE): string {
  const fmt = new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
  return fmt.format(new Date())
}

/** Parses a 'YYYY-MM-DD' string into a UTC-midnight epoch (ms). */
function dateStringToUtcMs(dateStr: string): number {
  const [y, m, d] = dateStr.split('-').map(Number)
  return Date.UTC(y, m - 1, d)
}

/** Whole days between two 'YYYY-MM-DD' strings (b - a). */
export function daysBetween(a: string, b: string): number {
  return Math.round((dateStringToUtcMs(b) - dateStringToUtcMs(a)) / 86_400_000)
}

function timeZoneOffsetMinutes(date: Date, timeZone: string): number {
  const fmt = new Intl.DateTimeFormat('en-US', {
    timeZone,
    hourCycle: 'h23',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
  const parts = fmt.formatToParts(date)
  const map: Record<string, string> = {}
  for (const p of parts) map[p.type] = p.value
  const asUtc = Date.UTC(
    Number(map.year),
    Number(map.month) - 1,
    Number(map.day),
    Number(map.hour),
    Number(map.minute),
    Number(map.second),
  )
  return (asUtc - date.getTime()) / 60_000
}

/** Real UTC epoch (ms) for midnight of a 'YYYY-MM-DD' date, in APP_TIMEZONE. */
export function zonedMidnightMs(dateStr: string, timeZone: string = APP_TIMEZONE): number {
  const [y, m, d] = dateStr.split('-').map(Number)
  const guess = Date.UTC(y, m - 1, d, 0, 0, 0)
  const offset = timeZoneOffsetMinutes(new Date(guess), timeZone)
  return guess - offset * 60_000
}

/** True once a 'YYYY-MM-DD' unlock/target date has arrived. */
export function isDateReached(dateStr: string | null | undefined): boolean {
  if (!dateStr) return false
  return dateStr <= todayDateString()
}

/** Next occurrence (this year or next) of an anniversary's month/day, as 'YYYY-MM-DD'. */
export function nextAnniversaryDate(anniversaryDateStr: string): string {
  const today = todayDateString()
  const [, m, d] = anniversaryDateStr.split('-')
  const [ty] = today.split('-')
  const thisYear = `${ty}-${m}-${d}`
  if (thisYear >= today) return thisYear
  return `${Number(ty) + 1}-${m}-${d}`
}

/** Previous occurrence (this year or last) of an anniversary's month/day, as 'YYYY-MM-DD'. */
export function previousAnniversaryDate(anniversaryDateStr: string): string {
  const today = todayDateString()
  const [, m, d] = anniversaryDateStr.split('-')
  const [ty] = today.split('-')
  const thisYear = `${ty}-${m}-${d}`
  if (thisYear <= today) return thisYear
  return `${Number(ty) - 1}-${m}-${d}`
}

export interface Duration {
  days: number
  hours: number
  minutes: number
  seconds: number
}

/** Splits a millisecond duration (>= 0) into days/hours/minutes/seconds. */
export function toDuration(ms: number): Duration {
  const clamped = Math.max(0, ms)
  const totalSeconds = Math.floor(clamped / 1000)
  return {
    days: Math.floor(totalSeconds / 86_400),
    hours: Math.floor((totalSeconds % 86_400) / 3600),
    minutes: Math.floor((totalSeconds % 3600) / 60),
    seconds: totalSeconds % 60,
  }
}

export function pad2(n: number): string {
  return n.toString().padStart(2, '0')
}
