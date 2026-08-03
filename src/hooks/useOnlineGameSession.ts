import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useCouple } from '@/contexts/CoupleContext'
import { useAuth } from '@/contexts/AuthContext'
import type { GameSessionRow, GameStatus, GameType, GameWinner } from '@/types'

/**
 * Generic online turn-based game session, shared by every dual-mode game.
 * Synced via polling (refetchInterval), not Supabase Realtime — consistent
 * with the rest of the app's "sync, not instant" model. Each game owns its
 * own move-validation/win-check logic and just hands this hook the next
 * `state` blob to persist.
 */
export function useOnlineGameSession(gameType: GameType, initialState: unknown) {
  const { couple } = useCouple()
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const coupleId = couple?.id
  const queryKey = ['game-session', coupleId, gameType]

  const query = useQuery({
    queryKey,
    enabled: !!coupleId,
    refetchInterval: 2500,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('game_sessions')
        .select('*')
        .eq('couple_id', coupleId!)
        .eq('game_type', gameType)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()
      if (error) throw error
      return data as GameSessionRow | null
    },
  })

  function invalidate() {
    queryClient.invalidateQueries({ queryKey })
  }

  const startGame = useMutation({
    // Pass a state override for games where the starting player sets it up
    // (e.g. Hangman's secret word); omit it to use the game's fixed initialState.
    mutationFn: async (overrideState?: unknown) => {
      const { error } = await supabase.from('game_sessions').insert({
        couple_id: coupleId!,
        game_type: gameType,
        state: overrideState ?? initialState,
        turn: user!.id,
        player_x: user!.id,
        created_by: user!.id,
      })
      if (error) throw error
    },
    onSuccess: invalidate,
  })

  const joinGame = useMutation({
    mutationFn: async (sessionId: string) => {
      const { error } = await supabase
        .from('game_sessions')
        .update({ player_o: user!.id })
        .eq('id', sessionId)
      if (error) throw error
    },
    onSuccess: invalidate,
  })

  const updateSession = useMutation({
    mutationFn: async (input: {
      id: string
      state: unknown
      turn: string | null
      winner: GameWinner | null
      status: GameStatus
    }) => {
      const { error } = await supabase
        .from('game_sessions')
        .update({
          state: input.state,
          turn: input.turn,
          winner: input.winner,
          status: input.status,
          updated_at: new Date().toISOString(),
        })
        .eq('id', input.id)
      if (error) throw error
    },
    onSuccess: invalidate,
  })

  return { ...query, startGame, joinGame, updateSession, user, couple }
}
