import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useCouple } from '@/contexts/CoupleContext'
import type { GameScoreRow } from '@/types'

export function useGameScores(gameKey: string) {
  const { couple } = useCouple()
  const coupleId = couple?.id
  const queryClient = useQueryClient()
  const queryKey = ['game-scores', coupleId, gameKey]

  const query = useQuery({
    queryKey,
    enabled: !!coupleId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('game_scores')
        .select('*')
        .eq('couple_id', coupleId!)
        .eq('game_key', gameKey)
        .order('created_at', { ascending: false })
        .limit(200)
      if (error) throw error
      return data as GameScoreRow[]
    },
  })

  const recordScore = useMutation({
    mutationFn: async (input: {
      winnerUserId?: string | null
      userId?: string | null
      score?: number | null
      metadata?: unknown
    }) => {
      const { error } = await supabase.from('game_scores').insert({
        couple_id: coupleId!,
        game_key: gameKey,
        user_id: input.userId ?? null,
        winner_user_id: input.winnerUserId ?? null,
        score: input.score ?? null,
        metadata: input.metadata ?? null,
      })
      if (error) throw error
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey }),
  })

  return { ...query, recordScore }
}
