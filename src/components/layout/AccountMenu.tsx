import { useEffect, useRef, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useCouple } from '@/contexts/CoupleContext'
import { cn } from '@/lib/utils'
import { LogoutIcon } from '@/components/ui/icons'
import { ThemeSwitcher } from './ThemeSwitcher'

export function AccountMenu({ collapsed }: { collapsed: boolean }) {
  const { user, signOut } = useAuth()
  const { youLabel } = useCouple()
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    function onPointerDown(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onPointerDown)
    return () => document.removeEventListener('mousedown', onPointerDown)
  }, [open])

  const initial = youLabel.charAt(0).toUpperCase()

  return (
    <div ref={rootRef} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label="Menu akun"
        className={cn(
          'flex w-full items-center gap-2.5 rounded-xl p-2 text-left transition hover:bg-secondary/15',
          collapsed && 'justify-center',
          open && 'bg-secondary/15',
        )}
      >
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold text-onPrimary">
          {initial}
        </span>
        {!collapsed && (
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-text">{youLabel}</p>
            <p className="truncate text-xs text-muted">{user?.email}</p>
          </div>
        )}
      </button>

      {open && (
        <div className="absolute bottom-full left-0 z-20 mb-2 w-64 overflow-hidden rounded-2xl border border-border bg-card shadow-lg">
          <div className="flex items-center gap-3 border-b border-border p-4">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-base font-semibold text-onPrimary">
              {initial}
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-text">{youLabel}</p>
              <p className="truncate text-xs text-muted">{user?.email}</p>
            </div>
          </div>

          <div className="px-4 py-3">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">Tema</p>
            <ThemeSwitcher />
          </div>

          <button
            onClick={() => {
              setOpen(false)
              signOut()
            }}
            className="flex w-full items-center gap-3 border-t border-border px-4 py-3 text-sm text-red-500 transition hover:bg-red-500/10"
          >
            <LogoutIcon className="h-4 w-4" />
            Keluar
          </button>
        </div>
      )}
    </div>
  )
}
