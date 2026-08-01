import { useEffect, useState } from 'react'
import { toDuration, type Duration } from '@/lib/dates'

/**
 * Ticking duration relative to a fixed reference instant (epoch ms).
 * direction 'up' counts elapsed time since the reference (e.g. days together);
 * 'down' counts remaining time until it (e.g. next anniversary, letter unlock).
 */
export function useCountdown(
  referenceMs: number | null,
  direction: 'up' | 'down' = 'up',
): Duration | null {
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    if (referenceMs == null) return
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [referenceMs])

  if (referenceMs == null) return null
  const diff = direction === 'up' ? now - referenceMs : referenceMs - now
  return toDuration(diff)
}
