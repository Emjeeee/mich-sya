import { useEffect, useState } from 'react'
import { NavLink } from 'react-router-dom'
import { NAV_ITEMS } from '@/lib/navItems'
import { cn } from '@/lib/utils'
import { AccountMenu } from './AccountMenu'
import { Logo } from './Logo'
import { ChevronLeftIcon, ChevronRightIcon } from '@/components/ui/pixel-icons'

function getInitialCollapsed() {
  return localStorage.getItem('sidebar-collapsed') === '1'
}

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(getInitialCollapsed)

  useEffect(() => {
    localStorage.setItem('sidebar-collapsed', collapsed ? '1' : '0')
  }, [collapsed])

  return (
    <aside
      className={cn(
        'sticky top-0 hidden h-screen shrink-0 flex-col border-r border-border bg-card py-6 transition-all duration-200 md:flex',
        collapsed ? 'w-20 px-2' : 'w-64 px-4',
      )}
    >
      <button
        onClick={() => setCollapsed((c) => !c)}
        aria-label={collapsed ? 'Perbesar sidebar' : 'Ciutkan sidebar'}
        title={collapsed ? 'Perbesar sidebar' : 'Ciutkan sidebar'}
        className="absolute -right-4 top-9 flex h-8 w-8 items-center justify-center rounded-full border border-border bg-card text-muted shadow-sm transition hover:bg-secondary/15 hover:text-primary"
      >
        {collapsed ? <ChevronRightIcon className="h-3.5 w-3.5" /> : <ChevronLeftIcon className="h-3.5 w-3.5" />}
      </button>

      <div className={cn('mb-8 flex items-center gap-2 px-2', collapsed && 'justify-center px-0')}>
        <Logo className="h-9 w-9" />
        {!collapsed && <span className="font-heading text-lg font-bold text-text">MichSya</span>}
      </div>

      <nav className="flex-1 space-y-1">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/app'}
            title={collapsed ? item.label : undefined}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition',
                collapsed && 'justify-center px-0',
                isActive ? 'bg-primary/10 text-primary' : 'text-text hover:bg-secondary/15',
              )
            }
          >
            <item.icon className="h-5 w-5 shrink-0" />
            {!collapsed && item.label}
          </NavLink>
        ))}
      </nav>

      <div className="mt-4 border-t border-border pt-4">
        <AccountMenu collapsed={collapsed} />
      </div>
    </aside>
  )
}
