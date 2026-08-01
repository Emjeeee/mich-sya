import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { BottomNav } from './BottomNav'
import { CoupleProvider, useCouple } from '@/contexts/CoupleContext'

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

export function AppShell() {
  return (
    <CoupleProvider>
      <div className="flex min-h-screen bg-bg">
        <Sidebar />
        <div className="flex-1 pb-20 md:pb-0">
          <UnlinkedNotice />
          <main className="mx-auto max-w-6xl px-4 py-6 md:px-8 md:py-8">
            <Outlet />
          </main>
        </div>
        <BottomNav />
      </div>
    </CoupleProvider>
  )
}
