import { Link } from 'react-router-dom'
import { MemoryMatchGame } from '@/components/arcade/MemoryMatchGame'

export function MemoryMatchPage() {
  return (
    <div className="space-y-6">
      <div>
        <Link to="/app/arcade" className="text-xs font-medium text-primary hover:underline">
          ← Arcade Room
        </Link>
        <h1 className="mt-1 font-heading text-2xl font-bold text-text">Kartu Jodoh</h1>
        <p className="text-sm text-muted">Cocokkan pasangan kartu — main bareng di satu layar</p>
      </div>

      <MemoryMatchGame />
    </div>
  )
}
