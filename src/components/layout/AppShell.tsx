import { Link, Outlet, useLocation } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { BottomNav } from './BottomNav'
import { CoupleProvider, useCouple } from '@/contexts/CoupleContext'
import { useUnreadMessages } from '@/hooks/useUnreadMessages'
import { ChatBubbleIcon } from '@/components/ui/pixel-icons'

function UnlinkedNotice() {
  const { isLoading, isLinked } = useCouple()
  if (isLoading || isLinked) return null
  return (
    <div className="mx-4 mt-4 rounded-xl border border-accent/40 bg-accent/10 px-4 py-3 text-sm text-text md:mx-8">
      Akun kamu belum terhubung dengan pasangan. Ikuti langkah "Setup Runbook" di README untuk
      menautkan akun Michael & Ruth ke satu ruang couple.
    </div>
  )
}

function UnreadMessagesNotice() {
  const { partnerLabel } = useCouple()
  const unreadMessages = useUnreadMessages()
  const location = useLocation()

  if (unreadMessages === 0 || location.pathname === '/app/chat') return null

  return (
    <Link
      to="/app/chat"
      className="mx-4 mt-4 flex items-center gap-2 rounded-xl border border-primary/30 bg-primary/10 px-4 py-3 text-sm font-medium text-text transition hover:border-primary/50 md:mx-8"
    >
      <ChatBubbleIcon className="h-5 w-5 shrink-0 text-primary" />
      {unreadMessages} pesan baru dari {partnerLabel} — buka chat →
    </Link>
  )
}

export function AppShell() {
  return (
    <CoupleProvider>
      <div className="flex min-h-screen bg-bg">
        <Sidebar />
        <div className="flex-1 pb-20 md:pb-0">
          <UnlinkedNotice />
          <UnreadMessagesNotice />
          <main className="mx-auto max-w-6xl px-4 py-6 md:px-8 md:py-8">
            <Outlet />
          </main>
        </div>
        <BottomNav />
      </div>
    </CoupleProvider>
  )
}
