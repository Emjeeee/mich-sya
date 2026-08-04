import { useMemo } from 'react'
import { useCouple } from '@/contexts/CoupleContext'
import { DaysTogetherCard } from '@/components/dashboard/DaysTogetherCard'
import { AnniversaryCard } from '@/components/dashboard/AnniversaryCard'
import { QuoteCard } from '@/components/dashboard/QuoteCard'
import { DailyVibeCard } from '@/components/dashboard/DailyVibeCard'
import { ArcadeCard } from '@/components/dashboard/ArcadeCard'
import { DateIdeasCard } from '@/components/dashboard/DateIdeasCard'
import { GalleryCard } from '@/components/dashboard/GalleryCard'
import { TodayCard } from '@/components/dashboard/TodayCard'
import { DateSessionCard } from '@/components/dashboard/DateSessionCard'
import { NAV_ITEMS } from '@/lib/navItems'
import { NavLink } from 'react-router-dom'
import { useTypewriter } from '@/hooks/useTypewriter'
import { GREETING_PHRASES } from '@/data/greetings'
import { shuffle } from '@/lib/utils'

export function DashboardPage() {
  const { couple, youLabel } = useCouple()
  const quickLinks = NAV_ITEMS.filter((item) => item.to !== '/app' && item.to !== '/app/settings')
  // Shuffled once per mount so the order (not just the pool) differs every visit.
  const shuffledGreetings = useMemo(() => shuffle(GREETING_PHRASES), [])
  const typedGreeting = useTypewriter(shuffledGreetings)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold text-text">Halo, {youLabel} 👋</h1>
        <p className="min-h-[1.25rem] text-sm text-muted">
          {typedGreeting}
          <span className="ml-0.5 animate-pulse text-primary">|</span>
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
        <DaysTogetherCard anniversaryDate={couple?.anniversary_date ?? null} />
        <AnniversaryCard anniversaryDate={couple?.anniversary_date ?? null} />
        <GalleryCard />
        <TodayCard />
        <DateSessionCard />
        <QuoteCard />
        <DailyVibeCard />
        <ArcadeCard />
        <DateIdeasCard />
      </div>

      <div>
        <h2 className="mb-3 font-heading text-lg font-semibold text-text">Akses Cepat</h2>
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6">
          {quickLinks.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className="flex flex-col items-center gap-1.5 rounded-xl border border-border bg-card p-3 text-center text-xs font-medium text-text transition hover:border-primary hover:text-primary"
            >
              <item.icon className="h-6 w-6" />
              {item.label}
            </NavLink>
          ))}
        </div>
      </div>
    </div>
  )
}
