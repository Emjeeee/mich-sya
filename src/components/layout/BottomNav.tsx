import { useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { MOBILE_PRIMARY_COUNT, NAV_ITEMS } from '@/lib/navItems'
import { cn } from '@/lib/utils'
import { Modal } from '@/components/ui/Modal'
import { ThemeToggle } from './ThemeToggle'
import { LogoutIcon } from '@/components/ui/icons'
import { useAuth } from '@/contexts/AuthContext'

export function BottomNav() {
  const [moreOpen, setMoreOpen] = useState(false)
  const location = useLocation()
  const { signOut } = useAuth()

  const primary = NAV_ITEMS.slice(0, MOBILE_PRIMARY_COUNT)
  const rest = NAV_ITEMS.slice(MOBILE_PRIMARY_COUNT)
  const isRestActive = rest.some((item) => location.pathname === item.to)

  return (
    <>
      <nav className="fixed inset-x-0 bottom-0 z-40 flex items-center justify-around border-t border-border bg-card/95 px-1 py-2 backdrop-blur md:hidden">
        {primary.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/app'}
            className={({ isActive }) =>
              cn(
                'flex flex-1 flex-col items-center gap-0.5 rounded-lg py-1 text-[11px] font-medium',
                isActive ? 'text-primary' : 'text-muted',
              )
            }
          >
            <span className="text-lg leading-none">{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
        <button
          onClick={() => setMoreOpen(true)}
          className={cn(
            'flex flex-1 flex-col items-center gap-0.5 rounded-lg py-1 text-[11px] font-medium',
            isRestActive ? 'text-primary' : 'text-muted',
          )}
        >
          <span className="text-lg leading-none">⋯</span>
          Lainnya
        </button>
      </nav>

      <Modal open={moreOpen} onClose={() => setMoreOpen(false)} title="Menu Lainnya">
        <div className="grid grid-cols-3 gap-3">
          {rest.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => setMoreOpen(false)}
              className={({ isActive }) =>
                cn(
                  'flex flex-col items-center gap-1.5 rounded-xl border border-border p-3 text-center text-xs font-medium',
                  isActive ? 'border-primary text-primary' : 'text-text',
                )
              }
            >
              <span className="text-2xl">{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </div>
        <div className="mt-5 flex items-center justify-between border-t border-border pt-4">
          <ThemeToggle />
          <button
            onClick={() => signOut()}
            className="flex items-center gap-1.5 text-sm font-medium text-muted hover:text-red-500"
          >
            <LogoutIcon className="h-4 w-4" />
            Keluar
          </button>
        </div>
      </Modal>
    </>
  )
}
