import { createContext, useContext, type ReactNode } from 'react'
import { useQuery } from '@tanstack/react-query'
import type { User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import { useAuth } from './AuthContext'
import type { CoupleRow } from '@/types'

interface CoupleContextValue {
  couple: CoupleRow | null
  isLoading: boolean
  isLinked: boolean
  partnerLabel: string
  youLabel: string
}

const CoupleContext = createContext<CoupleContextValue | null>(null)

function displayNameFor(user: User | null) {
  const metaName = (user?.user_metadata as { display_name?: string } | undefined)?.display_name
  if (metaName?.trim()) return metaName.trim()
  if (!user?.email) return 'Kamu'
  const local = user.email.split('@')[0]
  return local.charAt(0).toUpperCase() + local.slice(1)
}

export function CoupleProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()

  const { data: couple, isLoading } = useQuery({
    queryKey: ['couple', user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('couple')
        .select('*')
        .or(`partner1_id.eq.${user!.id},partner2_id.eq.${user!.id}`)
        .maybeSingle()
      if (error) throw error
      return data as CoupleRow | null
    },
  })

  const isLinked = !!couple?.partner1_id && !!couple?.partner2_id

  const { data: partnerName } = useQuery({
    queryKey: ['partner-name', couple?.id],
    enabled: isLinked,
    queryFn: async () => {
      const { data, error } = await supabase.rpc('partner_display_name')
      if (error) throw error
      return data
    },
  })

  const youLabel = displayNameFor(user)
  const partnerLabel = partnerName?.trim() || 'Pasanganmu'

  return (
    <CoupleContext.Provider
      value={{ couple: couple ?? null, isLoading, isLinked, partnerLabel, youLabel }}
    >
      {children}
    </CoupleContext.Provider>
  )
}

export function useCouple() {
  const ctx = useContext(CoupleContext)
  if (!ctx) throw new Error('useCouple must be used within CoupleProvider')
  return ctx
}
