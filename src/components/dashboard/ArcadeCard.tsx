import { Link } from 'react-router-dom'
import { Card } from '@/components/ui/Card'

export function ArcadeCard() {
  return (
    <Link to="/app/arcade" className="block">
      <Card className="flex h-full flex-col items-center justify-center gap-2 bg-gradient-to-br from-accent/15 to-primary/10 py-8 text-center transition hover:border-primary">
        <span className="text-3xl">🕹️</span>
        <p className="font-heading text-sm font-semibold text-text">Arcade Room</p>
        <p className="text-xs text-muted">2 mini game siap dimainkan berdua</p>
      </Card>
    </Link>
  )
}
