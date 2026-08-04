import { useTheme } from '@/contexts/ThemeContext'

interface StarConfig {
  top: number
  left: number
  size: number
  duration: number
  delay: number
}

interface CometConfig {
  top: number
  left: number
  duration: number
  delay: number
}

interface CloudConfig {
  top: number
  size: number
  duration: number
  delay: number
  opacity: number
}

// Generated once at module load, not per-render — same reasoning as
// TasyaCloudsBackground's static CLOUDS array, just procedural since a
// believable starfield needs far more than a handful of hand-placed dots.
const STARS: StarConfig[] = Array.from({ length: 55 }, () => ({
  top: Math.random() * 100,
  left: Math.random() * 100,
  size: 1 + Math.random() * 2,
  duration: 2 + Math.random() * 3,
  delay: -Math.random() * 5,
}))

const COMETS: CometConfig[] = [
  { top: 6, left: -12, duration: 14, delay: 0 },
  { top: 34, left: -18, duration: 19, delay: -9 },
]

const CLOUDS: CloudConfig[] = [
  { top: 14, size: 260, duration: 85, delay: 0, opacity: 0.3 },
  { top: 42, size: 190, duration: 65, delay: -30, opacity: 0.22 },
  { top: 70, size: 230, duration: 78, delay: -55, opacity: 0.26 },
]

/**
 * Ambient black-and-gold background for Midnight Gold: glowing gold ribbon
 * streaks (SVG paths with an animated dash-flow), twinkling stars, an
 * occasional comet streak, and a few drifting monochrome clouds behind them.
 * Pure CSS/SVG keyframes throughout — same approach as TasyaCloudsBackground,
 * not MichaelDotsBackground's canvas + always-on requestAnimationFrame loop —
 * so it costs nothing while idle and needs no per-frame JS at all.
 */
export function MidnightGoldBackground() {
  const { theme } = useTheme()
  if (theme !== 'midnightgold') return null

  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden="true">
      <svg
        className="absolute inset-0 h-full w-full opacity-80"
        viewBox="0 0 1920 1080"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          <linearGradient id="midnight-ribbon-a" x1="660" y1="40" x2="1300" y2="380" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#f0d78c" stopOpacity="0" />
            <stop offset="50%" stopColor="#f0d78c" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#d4af37" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="midnight-ribbon-b" x1="1900" y1="140" x2="280" y2="960" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#fff8e6" stopOpacity="0" />
            <stop offset="45%" stopColor="#f0d78c" stopOpacity="0.95" />
            <stop offset="100%" stopColor="#d4af37" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="midnight-ribbon-c" x1="1920" y1="210" x2="360" y2="980" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#fff8e6" stopOpacity="0" />
            <stop offset="45%" stopColor="#e8c468" stopOpacity="0.7" />
            <stop offset="100%" stopColor="#d4af37" stopOpacity="0" />
          </linearGradient>
          <filter id="midnight-ribbon-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        {/* Swirling ribbon — centered on the viewBox (not tucked in the
            corner) so `xMidYMid slice` still keeps it visible on narrow
            mobile viewports, which only ever see the horizontal center band
            of this viewBox once scaled to cover a tall/narrow screen. */}
        <path
          d="M 640,30 C 840,140 770,360 1000,320 C 1220,280 1050,90 1270,140"
          stroke="url(#midnight-ribbon-a)"
          strokeWidth="2.5"
          fill="none"
          filter="url(#midnight-ribbon-glow)"
          className="midnight-ribbon"
        />
        {/* Twin sweeping trail lines, upper-right to lower-left. */}
        <path
          d="M 1900,140 C 1480,250 1280,460 980,660 C 780,790 580,860 260,960"
          stroke="url(#midnight-ribbon-b)"
          strokeWidth="3"
          fill="none"
          filter="url(#midnight-ribbon-glow)"
          className="midnight-ribbon"
          style={{ animationDelay: '-3s' }}
        />
        <path
          d="M 1920,210 C 1540,310 1330,490 1020,690 C 820,810 620,880 340,980"
          stroke="url(#midnight-ribbon-c)"
          strokeWidth="2"
          fill="none"
          filter="url(#midnight-ribbon-glow)"
          className="midnight-ribbon"
          style={{ animationDelay: '-6s' }}
        />
      </svg>
      {CLOUDS.map((cloud, i) => (
        <span
          key={`cloud-${i}`}
          className="midnight-cloud absolute"
          style={{
            top: `${cloud.top}%`,
            width: cloud.size,
            height: cloud.size * 0.6,
            opacity: cloud.opacity,
            animationDuration: `${cloud.duration}s`,
            animationDelay: `${cloud.delay}s`,
          }}
        />
      ))}
      {STARS.map((star, i) => (
        <span
          key={`star-${i}`}
          className="midnight-star absolute"
          style={{
            top: `${star.top}%`,
            left: `${star.left}%`,
            width: star.size,
            height: star.size,
            animationDuration: `${star.duration}s`,
            animationDelay: `${star.delay}s`,
          }}
        />
      ))}
      {COMETS.map((comet, i) => (
        <span
          key={`comet-${i}`}
          className="midnight-comet absolute"
          style={{
            top: `${comet.top}%`,
            left: `${comet.left}%`,
            animationDuration: `${comet.duration}s`,
            animationDelay: `${comet.delay}s`,
          }}
        />
      ))}
    </div>
  )
}
