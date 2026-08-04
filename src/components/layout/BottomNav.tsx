import { useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { MOBILE_PRIMARY_COUNT, NAV_ITEMS } from '@/lib/navItems'
import { cn } from '@/lib/utils'
import { Modal } from '@/components/ui/Modal'
import { ThemeSwitcher } from './ThemeSwitcher'
import { LogoutIcon } from '@/components/ui/icons'
import { DotsIcon } from '@/components/ui/pixel-icons'
import { useAuth } from '@/contexts/AuthContext'
import { useUnreadMessages } from '@/hooks/useUnreadMessages'

export function BottomNav() {
  const [moreOpen, setMoreOpen] = useState(false)
  const location = useLocation()
  const { signOut } = useAuth()
  const unreadMessages = useUnreadMessages()

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
            <span className="relative">
              <item.icon className="h-5 w-5" />
              {item.to === '/app/chat' && unreadMessages > 0 && (
                <span className="absolute -right-1.5 -top-1 flex h-3.5 min-w-3.5 items-center justify-center rounded-full bg-primary px-1 text-[8px] font-bold leading-none text-onPrimary">
                  {unreadMessages > 9 ? '9+' : unreadMessages}
                </span>
              )}
            </span>
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
          <DotsIcon className="h-5 w-5" />
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
              <item.icon className="h-6 w-6" />
              {item.label}
            </NavLink>
          ))}
        </div>
        <div className="mt-5 border-t border-border pt-4">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">Tema</p>
          <ThemeSwitcher />
          <button
            onClick={() => signOut()}
            className="mt-4 flex items-center gap-1.5 text-sm font-medium text-muted hover:text-red-500"
          >
            <LogoutIcon className="h-4 w-4" />
            Keluar
          </button>
        </div>
      </Modal>
    </>
  )
}
