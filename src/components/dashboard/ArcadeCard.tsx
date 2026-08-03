import { Link } from 'react-router-dom'
import { Card } from '@/components/ui/Card'
import { GamepadIcon } from '@/components/ui/pixel-icons'

export function ArcadeCard() {
  return (
    <Link to="/app/arcade" className="block">
      <Card className="flex h-full flex-col items-center justify-center gap-2 bg-gradient-to-br from-accent/15 to-primary/10 py-8 text-center transition hover:border-primary">
        <GamepadIcon className="h-8 w-8 text-primary" />
        <p className="font-heading text-sm font-semibold text-text">Arcade Room</p>
        <p className="text-xs text-muted">20 mini game siap dimainkan berdua</p>
      </Card>
    </Link>
  )
}
