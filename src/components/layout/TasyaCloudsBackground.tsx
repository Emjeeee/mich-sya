import { useEffect, useRef } from 'react'
import { useTheme } from '@/contexts/ThemeContext'

interface CloudConfig {
  top: number // vh %
  size: number // px width
  duration: number // drift cycle, seconds
  delay: number // negative = starts partway through, avoids bunching at load
  opacity: number
  depth: number // 0-1, how strongly it reacts to the cursor (parallax layer)
}

const CLOUDS: CloudConfig[] = [
  { top: 6, size: 220, duration: 70, delay: 0, opacity: 0.55, depth: 0.6 },
  { top: 18, size: 140, duration: 55, delay: -20, opacity: 0.45, depth: 0.3 },
  { top: 30, size: 300, duration: 90, delay: -45, opacity: 0.5, depth: 0.8 },
  { top: 45, size: 170, duration: 60, delay: -10, opacity: 0.4, depth: 0.4 },
  { top: 58, size: 260, duration: 80, delay: -60, opacity: 0.5, depth: 0.7 },
  { top: 70, size: 130, duration: 50, delay: -30, opacity: 0.4, depth: 0.25 },
  { top: 82, size: 210, duration: 75, delay: -5, opacity: 0.45, depth: 0.55 },
]

/**
 * Drifting cloud background for Tasya Mode. Two layers of motion, kept on
 * separate elements so they don't fight over the same CSS property:
 * an outer wrapper per cloud that JS nudges toward the cursor (parallax,
 * "mouse control"), and an inner `.tasya-cloud` span that just keeps
 * drifting via a CSS keyframe animation regardless of the mouse. Event-driven
 * (no rAF loop) — a CSS transition on the wrapper smooths each update.
 */
export function TasyaCloudsBackground() {
  const { theme } = useTheme()
  const wrapperRefs = useRef<(HTMLDivElement | null)[]>([])

  useEffect(() => {
    if (theme !== 'tasya') return

    function onPointerMove(e: PointerEvent) {
      const nx = (e.clientX / window.innerWidth - 0.5) * 2 // -1..1
      const ny = (e.clientY / window.innerHeight - 0.5) * 2

      wrapperRefs.current.forEach((el, i) => {
        if (!el) return
        const depth = CLOUDS[i].depth
        const shiftX = nx * 36 * depth
        const shiftY = ny * 20 * depth
        el.style.transform = `translate(${shiftX}px, ${shiftY}px)`
      })
    }

    window.addEventListener('pointermove', onPointerMove)
    return () => window.removeEventListener('pointermove', onPointerMove)
  }, [theme])

  if (theme !== 'tasya') return null

  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden="true">
      {CLOUDS.map((cloud, i) => (
        <div
          key={i}
          ref={(el) => {
            wrapperRefs.current[i] = el
          }}
          className="absolute inset-x-0 will-change-transform transition-transform duration-500 ease-out"
          style={{ top: `${cloud.top}%` }}
        >
          <span
            className="tasya-cloud absolute"
            style={{
              width: cloud.size,
              height: cloud.size * 0.6,
              opacity: cloud.opacity,
              animationDuration: `${cloud.duration}s`,
              animationDelay: `${cloud.delay}s`,
            }}
          />
        </div>
      ))}
    </div>
  )
}
